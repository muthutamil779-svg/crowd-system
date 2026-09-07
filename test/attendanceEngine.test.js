/**
 * Automated Test Suite for Attendance Engine & Sequential Guard Clauses
 */

const assert = require('assert');
const attendanceEngine = require('../src/services/attendanceEngine');
const db = require('../src/config/database');

async function runTests() {
  console.log('\n======================================================');
  console.log('Running Smart Crowd Management Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`    ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`    ${err.message}`);
    }
  }

  // --- TEST 1: getRiskBand boundary checks ---
  test('getRiskBand: 0-50% maps to "Low Risk"', () => {
    assert.strictEqual(attendanceEngine.getRiskBand(0), 'Low Risk');
    assert.strictEqual(attendanceEngine.getRiskBand(25), 'Low Risk');
    assert.strictEqual(attendanceEngine.getRiskBand(50), 'Low Risk');
  });

  test('getRiskBand: 51-80% maps to "Moderate Risk"', () => {
    assert.strictEqual(attendanceEngine.getRiskBand(51), 'Moderate Risk');
    assert.strictEqual(attendanceEngine.getRiskBand(75), 'Moderate Risk');
    assert.strictEqual(attendanceEngine.getRiskBand(80), 'Moderate Risk');
  });

  test('getRiskBand: 81-100% maps to "High Risk"', () => {
    assert.strictEqual(attendanceEngine.getRiskBand(81), 'High Risk');
    assert.strictEqual(attendanceEngine.getRiskBand(95), 'High Risk');
    assert.strictEqual(attendanceEngine.getRiskBand(100), 'High Risk');
  });

  test('getRiskBand: > 100% maps to "Overbooked / Overcrowded"', () => {
    assert.strictEqual(attendanceEngine.getRiskBand(101), 'Overbooked / Overcrowded');
    assert.strictEqual(attendanceEngine.getRiskBand(150), 'Overbooked / Overcrowded');
  });

  // --- TEST 2: createEvent validation & execution ---
  let testEventId;
  await asyncTest('createEvent: creates valid event with exact fields', async () => {
    const event = await attendanceEngine.createEvent({
      name: 'Automated Test Seminar',
      venue: 'Seminar Hall B',
      hallCapacity: 3, // small capacity for quick Guard 3 testing
      dateTime: '2026-10-01T10:00:00.000Z',
      registrationDeadline: '2026-09-30T23:59:59.000Z'
    });

    assert.ok(event.id);
    assert.strictEqual(event.name, 'Automated Test Seminar');
    assert.strictEqual(event.venue, 'Seminar Hall B');
    assert.strictEqual(event.hallCapacity, 3);
    testEventId = event.id;
  });

  await asyncTest('createEvent: rejects missing required fields', async () => {
    try {
      await attendanceEngine.createEvent({ name: 'Incomplete' });
      assert.fail('Should have thrown error on missing fields');
    } catch (err) {
      assert.strictEqual(err.status, 400);
    }
  });

  // --- TEST 3: registerStudent & Duplicate Prevention ---
  await asyncTest('registerStudent: registers student with exact fields', async () => {
    const reg = await attendanceEngine.registerStudent(testEventId, {
      name: 'Alice Johnson',
      studentId: 'STU101',
      email: 'alice@college.edu'
    });

    assert.strictEqual(reg.studentId, 'STU101');
    assert.strictEqual(reg.name, 'Alice Johnson');
    assert.strictEqual(reg.checkedIn, false);
    assert.strictEqual(reg.checkedInAt, null);
  });

  await asyncTest('registerStudent: rejects duplicate registration for same studentId', async () => {
    try {
      await attendanceEngine.registerStudent(testEventId, {
        name: 'Alice Johnson Duplicate',
        studentId: 'STU101',
        email: 'alice.dup@college.edu'
      });
      assert.fail('Should have rejected duplicate studentId');
    } catch (err) {
      assert.strictEqual(err.status, 409);
      assert.strictEqual(err.code, 'DUPLICATE_REGISTRATION');
    }
  });

  // Register more students to test Guard 3 and metrics
  await attendanceEngine.registerStudent(testEventId, {
    name: 'Bob Smith',
    studentId: 'STU102',
    email: 'bob@college.edu'
  });
  await attendanceEngine.registerStudent(testEventId, {
    name: 'Charlie Brown',
    studentId: 'STU103',
    email: 'charlie@college.edu'
  });
  await attendanceEngine.registerStudent(testEventId, {
    name: 'Dana Scully',
    studentId: 'STU104',
    email: 'dana@college.edu'
  });

  // --- TEST 4: checkInStudent Sequential Guard Clauses ---
  // GUARD 1: Not registered
  await asyncTest('checkInStudent: Guard 1 rejects unregistered student', async () => {
    try {
      await attendanceEngine.checkInStudent(testEventId, 'UNKNOWN_GHOST');
      assert.fail('Guard 1 should have rejected unregistered student');
    } catch (err) {
      assert.strictEqual(err.code, 'NOT_REGISTERED');
      assert.strictEqual(err.status, 404);
    }
  });

  // Normal Check-In 1 (STU101)
  await asyncTest('checkInStudent: successful normal check-in (below capacity)', async () => {
    const res = await attendanceEngine.checkInStudent(testEventId, 'STU101');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.overCapacityFlag, false);
    assert.strictEqual(res.data.studentId, 'STU101');
    assert.strictEqual(res.data.currentAttendance, 1);
  });

  // GUARD 2: Already checked in
  await asyncTest('checkInStudent: Guard 2 rejects duplicate check-in', async () => {
    try {
      await attendanceEngine.checkInStudent(testEventId, 'STU101');
      assert.fail('Guard 2 should have rejected duplicate check-in');
    } catch (err) {
      assert.strictEqual(err.code, 'ALREADY_CHECKED_IN');
      assert.strictEqual(err.status, 409);
    }
  });

  // Check in STU102 and STU103 to reach hallCapacity (3)
  await attendanceEngine.checkInStudent(testEventId, 'STU102'); // attendance = 2
  const checkin3 = await attendanceEngine.checkInStudent(testEventId, 'STU103'); // attendance = 3 (capacity reached)
  assert.strictEqual(checkin3.overCapacityFlag, false);
  assert.strictEqual(checkin3.data.currentAttendance, 3);

  // GUARD 3: Over capacity check-in (STU104 checked in when currentAttendance is 3 >= hallCapacity 3)
  await asyncTest('checkInStudent: Guard 3 flags overCapacityFlag = true when capacity reached or exceeded', async () => {
    const res = await attendanceEngine.checkInStudent(testEventId, 'STU104');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.overCapacityFlag, true);
    assert.strictEqual(res.data.currentAttendance, 4);
    assert.strictEqual(res.data.hallCapacity, 3);
    assert.strictEqual(res.data.liveRiskBand, 'Overbooked / Overcrowded');
  });

  // --- TEST 5: calculateAttendance Dual-Metric Metrics ---
  await asyncTest('calculateAttendance: returns accurate dual metrics', async () => {
    const metrics = await attendanceEngine.calculateAttendance(testEventId);
    assert.strictEqual(metrics.hallCapacity, 3);
    assert.strictEqual(metrics.expectedAttendance, 4);
    assert.strictEqual(metrics.currentAttendance, 4);
    assert.strictEqual(metrics.registrationLoadRatio, 133.3);
    assert.strictEqual(metrics.occupancyPercentage, 133.3);
    assert.strictEqual(metrics.preEventRiskBand, 'Overbooked / Overcrowded');
    assert.strictEqual(metrics.liveRiskBand, 'Overbooked / Overcrowded');
    assert.strictEqual(metrics.seatsRemaining, 0);
  });

  console.log(`\n======================================================`);
  console.log(`Results: ${passed} / ${total} tests passed!`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});

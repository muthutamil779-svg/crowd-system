/**
 * Smart College Event Crowd Management System
 * Core Attendance & Risk Assessment Engine: attendanceEngine.js
 *
 * This module exports the 5 mandatory core functions enforcing:
 * 1. createEvent(eventData)
 * 2. registerStudent(eventId, studentData)
 * 3. checkInStudent(eventId, studentId) - Sequential Guards 1, 2, and 3
 * 4. calculateAttendance(eventId) - Dual-Metric Risk Architecture
 * 5. getRiskBand(percentage) - Risk Band Mapping
 */

const db = require('../config/database');

/**
 * Maps occupancy/registration percentage into 4 discrete risk bands:
 * - 0% to 50%: "Low Risk"
 * - 51% to 80%: "Moderate Risk"
 * - 81% to 100%: "High Risk"
 * - > 100%: "Overbooked / Overcrowded"
 *
 * @param {number} percentage - The occupancy percentage or registration load ratio
 * @returns {string} The risk band label
 */
function getRiskBand(percentage) {
  const numericPct = Number(percentage) || 0;
  if (numericPct <= 50) {
    return 'Low Risk';
  } else if (numericPct <= 80) {
    return 'Moderate Risk';
  } else if (numericPct <= 100) {
    return 'High Risk';
  } else {
    return 'Overbooked / Overcrowded';
  }
}

/**
 * Creates a new event record with exact schema fields:
 * { name, venue, hallCapacity, dateTime, registrationDeadline }
 *
 * @param {Object} eventData
 * @param {string} eventData.name - Event title
 * @param {string} eventData.venue - Hall/Auditorium name
 * @param {number} eventData.hallCapacity - Maximum seating capacity
 * @param {string} eventData.dateTime - ISO datetime string
 * @param {string} eventData.registrationDeadline - ISO deadline string
 * @returns {Promise<Object>} The persisted event record
 */
async function createEvent(eventData) {
  const { name, venue, hallCapacity, dateTime, registrationDeadline } = eventData;

  // Validation
  if (!name || !venue || !hallCapacity || !dateTime || !registrationDeadline) {
    const error = new Error('Missing required event fields: name, venue, hallCapacity, dateTime, registrationDeadline.');
    error.status = 400;
    throw error;
  }

  const parsedCapacity = parseInt(hallCapacity, 10);
  if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
    const error = new Error('hallCapacity must be a positive integer.');
    error.status = 400;
    throw error;
  }

  // Generate URL-friendly slug ID
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 30);
  const eventId = `evt_${slug}_${Date.now().toString(36)}`;

  const newEvent = {
    id: eventId,
    name: name.trim(),
    venue: venue.trim(),
    hallCapacity: parsedCapacity,
    dateTime,
    registrationDeadline,
    createdAt: new Date().toISOString()
  };

  return await db.saveEvent(newEvent);
}

/**
 * Registers a student for a specific event.
 * Rejects duplicate registrations for the same studentId per event.
 *
 * @param {string} eventId - Unique event identifier
 * @param {Object} studentData
 * @param {string} studentData.name - Student full name
 * @param {string} studentData.studentId - College roll/student ID
 * @param {string} studentData.email - Institutional email
 * @returns {Promise<Object>} Created registration record
 */
async function registerStudent(eventId, studentData) {
  const { name, studentId, email } = studentData;

  // Validate presence of required fields
  if (!eventId || !name || !studentId || !email) {
    const error = new Error('Missing required fields: eventId, name, studentId, email.');
    error.status = 400;
    throw error;
  }

  // Verify that the event exists
  const event = await db.getEvent(eventId);
  if (!event) {
    const error = new Error(`Event with ID "${eventId}" not found.`);
    error.status = 404;
    throw error;
  }

  // Check registration deadline
  const now = new Date();
  const deadline = new Date(event.registrationDeadline);
  if (now > deadline) {
    const error = new Error(`Registration closed for "${event.name}". Deadline was ${event.registrationDeadline}.`);
    error.status = 403;
    throw error;
  }

  const cleanStudentId = studentId.trim().toUpperCase();

  // Duplicate Check: Rejects duplicate registrations for the same studentId per event
  const existingRegistration = await db.getRegistration(eventId, cleanStudentId);
  if (existingRegistration) {
    const error = new Error(`Duplicate registration rejected: Student ID "${cleanStudentId}" is already registered for this event.`);
    error.status = 409;
    error.code = 'DUPLICATE_REGISTRATION';
    throw error;
  }

  // Registration record schema
  const registrationRecord = {
    studentId: cleanStudentId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    registeredAt: new Date().toISOString(),
    checkedIn: false,
    checkedInAt: null
  };

  return await db.saveRegistration(eventId, cleanStudentId, registrationRecord);
}

/**
 * Executes high-speed gate check-in with strict sequential guard clauses:
 * - Guard 1: Verify studentId is registered for eventId. Reject if not registered.
 * - Guard 2: Verify checkedIn is already true. Reject duplicate check-in.
 * - Guard 3: Verify currentAttendance >= hallCapacity. If capacity is reached or exceeded,
 *            allow check-in but return overCapacityFlag = true to trigger visual alert
 *            without corrupting database counters.
 *
 * @param {string} eventId - Unique event identifier
 * @param {string} studentId - Student identifier
 * @returns {Promise<Object>} Check-in confirmation response payload
 */
async function checkInStudent(eventId, studentId) {
  if (!eventId || !studentId) {
    const error = new Error('Both eventId and studentId are required for check-in.');
    error.status = 400;
    throw error;
  }

  const cleanStudentId = studentId.trim().toUpperCase();

  // Fetch Event details
  const event = await db.getEvent(eventId);
  if (!event) {
    const error = new Error(`Event with ID "${eventId}" does not exist.`);
    error.status = 404;
    throw error;
  }

  // Fetch student registration record
  const registration = await db.getRegistration(eventId, cleanStudentId);

  // =========================================================================
  // GUARD 1: Check if studentId is registered for eventId. Reject if not registered.
  // =========================================================================
  if (!registration) {
    const error = new Error(`Guard 1 Violation: Student ID "${cleanStudentId}" is not registered for event "${event.name}".`);
    error.status = 404;
    error.code = 'NOT_REGISTERED';
    throw error;
  }

  // =========================================================================
  // GUARD 2: Check if checkedIn is already true. Reject duplicate check-in.
  // =========================================================================
  if (registration.checkedIn === true) {
    const error = new Error(`Guard 2 Violation: Student ID "${cleanStudentId}" has already checked in at ${registration.checkedInAt}.`);
    error.status = 409;
    error.code = 'ALREADY_CHECKED_IN';
    error.checkedInAt = registration.checkedInAt;
    throw error;
  }

  // Retrieve current attendance to evaluate Guard 3
  const allRegistrations = await db.getRegistrations(eventId);
  const regList = Object.values(allRegistrations);
  const currentAttendance = regList.filter(r => r.checkedIn === true).length;

  // =========================================================================
  // GUARD 3: Check if currentAttendance >= hallCapacity.
  // If capacity is reached or exceeded, allow check-in but return overCapacityFlag = true
  // in response payload to trigger visual warning without corrupting counters.
  // =========================================================================
  let overCapacityFlag = false;
  if (currentAttendance >= event.hallCapacity) {
    overCapacityFlag = true;
  }

  const checkedInAt = new Date().toISOString();

  // Commit valid check-in
  const updatedRecord = await db.markCheckedIn(eventId, cleanStudentId, checkedInAt);

  // Log in history audit stream
  const timestamp = Date.now();
  await db.logHistory(eventId, {
    eventId,
    timestamp,
    studentId: cleanStudentId,
    name: registration.name,
    action: 'CHECK_IN',
    overCapacityFlag,
    recordedAt: checkedInAt
  });

  // Calculate new live counts
  const newAttendance = currentAttendance + 1;
  const occupancyPercentage = Number(((newAttendance / event.hallCapacity) * 100).toFixed(1));
  const liveRiskBand = getRiskBand(occupancyPercentage);

  return {
    success: true,
    overCapacityFlag,
    message: overCapacityFlag
      ? `Check-in recorded, but venue "${event.venue}" is at or over capacity (${newAttendance}/${event.hallCapacity})!`
      : `Check-in successful for ${registration.name}.`,
    data: {
      studentId: cleanStudentId,
      name: registration.name,
      checkedInAt,
      currentAttendance: newAttendance,
      hallCapacity: event.hallCapacity,
      seatsRemaining: Math.max(0, event.hallCapacity - newAttendance),
      occupancyPercentage,
      liveRiskBand
    }
  };
}

/**
 * Computes and returns the dual-metric attendance and risk analytics:
 * - currentAttendance (checked-in count)
 * - expectedAttendance (registration count)
 * - occupancyPercentage = (currentAttendance / hallCapacity) * 100
 * - registrationLoadRatio = (expectedAttendance / hallCapacity) * 100
 * - preEventRiskBand (derived from registrationLoadRatio)
 * - liveRiskBand (derived from occupancyPercentage)
 *
 * @param {string} eventId - Unique event identifier
 * @returns {Promise<Object>} Calculated metrics payload
 */
async function calculateAttendance(eventId) {
  const event = await db.getEvent(eventId);
  if (!event) {
    const error = new Error(`Event "${eventId}" not found.`);
    error.status = 404;
    throw error;
  }

  const allRegistrations = await db.getRegistrations(eventId);
  const regList = Object.values(allRegistrations);

  // Count metrics
  const expectedAttendance = regList.length;
  const currentAttendance = regList.filter(r => r.checkedIn === true).length;
  const hallCapacity = event.hallCapacity;

  // Percentage Calculations
  const registrationLoadRatio = Number(((expectedAttendance / hallCapacity) * 100).toFixed(1));
  const occupancyPercentage = Number(((currentAttendance / hallCapacity) * 100).toFixed(1));

  // Risk Band Derivations
  const preEventRiskBand = getRiskBand(registrationLoadRatio);
  const liveRiskBand = getRiskBand(occupancyPercentage);

  const seatsRemaining = Math.max(0, hallCapacity - currentAttendance);

  return {
    eventId,
    eventName: event.name,
    venue: event.venue,
    hallCapacity,
    currentAttendance,
    expectedAttendance,
    seatsRemaining,
    occupancyPercentage,
    registrationLoadRatio,
    preEventRiskBand,
    liveRiskBand,
    calculatedAt: new Date().toISOString()
  };
}

module.exports = {
  createEvent,
  registerStudent,
  checkInStudent,
  calculateAttendance,
  getRiskBand
};

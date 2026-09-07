/**
 * Live Gate Check-In & Offline Queue Batch Sync Routes
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const attendanceEngine = require('../services/attendanceEngine');

// Live Gate Check-In Endpoint
// Strictly enforces Guard 1, Guard 2, and Guard 3
router.post('/checkin', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, error: 'studentId is required in request body.' });
    }

    const result = await attendanceEngine.checkInStudent(eventId, studentId);
    res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      code: err.code || 'CHECKIN_FAILED',
      error: err.message,
      checkedInAt: err.checkedInAt || null
    });
  }
});

// Batch Offline Sync Endpoint
// Used when browser gatekeeper reconnects to network and flushes localStorage queue
router.post('/checkin/batch', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { queue } = req.body;

    if (!Array.isArray(queue) || queue.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Expected a non-empty array of check-in objects in "queue".'
      });
    }

    const report = {
      totalReceived: queue.length,
      successful: [],
      overCapacity: [],
      alreadyCheckedIn: [],
      unregistered: [],
      failed: []
    };

    for (const item of queue) {
      const studentId = item.studentId || item;
      try {
        const result = await attendanceEngine.checkInStudent(eventId, studentId);
        if (result.overCapacityFlag) {
          report.overCapacity.push({ studentId, result });
        } else {
          report.successful.push({ studentId, result });
        }
      } catch (err) {
        if (err.code === 'ALREADY_CHECKED_IN') {
          // Idempotent resolution: already checked in, so this offline sync entry is safely resolved
          report.alreadyCheckedIn.push({ studentId, message: err.message, checkedInAt: err.checkedInAt });
        } else if (err.code === 'NOT_REGISTERED') {
          report.unregistered.push({ studentId, message: err.message });
        } else {
          report.failed.push({ studentId, error: err.message });
        }
      }
    }

    const latestMetrics = await attendanceEngine.calculateAttendance(eventId);

    res.json({
      success: true,
      message: `Batch sync complete: ${report.successful.length + report.overCapacity.length} processed, ${report.alreadyCheckedIn.length} already checked in, ${report.unregistered.length} unregistered.`,
      report,
      latestMetrics
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

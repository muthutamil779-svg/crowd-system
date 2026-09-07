/**
 * Attendance Metrics & Public Seat Board Analytics Routes
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../config/database');
const attendanceEngine = require('../services/attendanceEngine');

// Full Live Metrics (Dual-Metric Risk Model)
router.get('/metrics', async (req, res) => {
  try {
    const { eventId } = req.params;
    const metrics = await attendanceEngine.calculateAttendance(eventId);
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

// Sanitized Public Seat Board Data (Read-only for students checking hall availability)
router.get('/public-seats', async (req, res) => {
  try {
    const { eventId } = req.params;
    const metrics = await attendanceEngine.calculateAttendance(eventId);

    // Human-friendly status banner
    let statusLabel = 'Seats Available';
    let statusColor = 'green';
    if (metrics.seatsRemaining <= 0) {
      statusLabel = 'Hall Full / Standby Only';
      statusColor = 'red';
    } else if (metrics.occupancyPercentage >= 80) {
      statusLabel = 'Limited Seats Remaining';
      statusColor = 'amber';
    }

    res.json({
      success: true,
      data: {
        eventId: metrics.eventId,
        eventName: metrics.eventName,
        venue: metrics.venue,
        hallCapacity: metrics.hallCapacity,
        currentAttendance: metrics.currentAttendance,
        seatsRemaining: metrics.seatsRemaining,
        occupancyPercentage: metrics.occupancyPercentage,
        liveRiskBand: metrics.liveRiskBand,
        statusLabel,
        statusColor,
        lastUpdated: metrics.calculatedAt
      }
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

// Audit History Log
router.get('/history', async (req, res) => {
  try {
    const { eventId } = req.params;
    const history = await db.getHistory(eventId);
    // Sort descending by timestamp
    const sorted = history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    res.json({ success: true, count: sorted.length, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

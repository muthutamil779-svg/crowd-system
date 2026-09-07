/**
 * Event Management Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const attendanceEngine = require('../services/attendanceEngine');

// Create a new event
router.post('/', async (req, res) => {
  try {
    const event = await attendanceEngine.createEvent(req.body);
    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: event
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      error: err.message
    });
  }
});

// List all events with live summary
router.get('/', async (req, res) => {
  try {
    const events = await db.getAllEvents();
    // Attach current metrics for each event
    const enrichedEvents = await Promise.all(
      events.map(async (ev) => {
        try {
          const metrics = await attendanceEngine.calculateAttendance(ev.id);
          return { ...ev, metrics };
        } catch {
          return ev;
        }
      })
    );
    res.json({ success: true, data: enrichedEvents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single event
router.get('/:eventId', async (req, res) => {
  try {
    const event = await db.getEvent(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }
    const metrics = await attendanceEngine.calculateAttendance(event.id);
    res.json({ success: true, data: { ...event, metrics } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mid-Event Capacity Update (Dynamic recalculation of risk bands)
router.patch('/:eventId/capacity', async (req, res) => {
  try {
    const { hallCapacity } = req.body;
    const parsedCapacity = parseInt(hallCapacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid hallCapacity. Must be a positive integer.' });
    }

    const updatedEvent = await db.updateEventCapacity(req.params.eventId, parsedCapacity);
    if (!updatedEvent) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    // Immediately recalculate risk bands with new capacity
    const newMetrics = await attendanceEngine.calculateAttendance(req.params.eventId);

    res.json({
      success: true,
      message: `Hall capacity updated to ${parsedCapacity}. Risk bands recomputed immediately.`,
      data: {
        event: updatedEvent,
        metrics: newMetrics
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

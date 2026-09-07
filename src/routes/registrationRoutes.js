/**
 * Student Registration Routes
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../config/database');
const attendanceEngine = require('../services/attendanceEngine');

// Student Pre-Registration
router.post('/register', async (req, res) => {
  try {
    const { eventId } = req.params;
    const registration = await attendanceEngine.registerStudent(eventId, req.body);
    res.status(201).json({
      success: true,
      message: 'Pre-registration successful.',
      data: registration
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      code: err.code || 'REGISTRATION_FAILED',
      error: err.message
    });
  }
});

// View all registrations for an event (Organizer view)
router.get('/registrations', async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await db.getRegistrations(eventId);
    res.json({
      success: true,
      eventId,
      count: Object.keys(registrations).length,
      data: Object.values(registrations)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lookup specific student registration
router.get('/registrations/:studentId', async (req, res) => {
  try {
    const { eventId, studentId } = req.params;
    const registration = await db.getRegistration(eventId, studentId.trim().toUpperCase());
    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found for this student ID.' });
    }
    res.json({ success: true, data: registration });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

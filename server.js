/**
 * Smart College Event Crowd Management System
 * Main Application Server: server.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const eventRoutes = require('./src/routes/eventRoutes');
const registrationRoutes = require('./src/routes/registrationRoutes');
const checkInRoutes = require('./src/routes/checkInRoutes');
const metricsRoutes = require('./src/routes/metricsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes - Scoped with :eventId for sub-resources
app.use('/api/events/:eventId', registrationRoutes);
app.use('/api/events/:eventId', checkInRoutes);
app.use('/api/events/:eventId', metricsRoutes);
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Smart College Event Crowd Management System',
    timestamp: new Date().toISOString()
  });
});

// Default root redirect to portal hub
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server with dynamic fallback if port is in use
if (require.main === module) {
  function startServer(portToTry) {
    const server = app.listen(portToTry, () => {
      console.log(`=====================================================`);
      console.log(`Smart College Event Crowd Management System running!`);
      console.log(`Server URL: http://localhost:${portToTry}`);
      console.log(`Organizer Dashboard: http://localhost:${portToTry}/dashboard.html`);
      console.log(`Gatekeeper Check-In: http://localhost:${portToTry}/gatekeeper.html`);
      console.log(`Public Seat Board:   http://localhost:${portToTry}/seatboard.html`);
      console.log(`Student Pre-Reg:     http://localhost:${portToTry}/register.html`);
      console.log(`=====================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${portToTry} is in use. Trying port ${portToTry + 1}...`);
        startServer(portToTry + 1);
      } else {
        console.error('Server failed to start:', err);
      }
    });
  }

  startServer(PORT);
}

module.exports = app;

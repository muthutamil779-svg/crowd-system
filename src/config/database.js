/**
 * Smart College Event Crowd Management System
 * Database Configuration & Storage Adapter
 *
 * Supports Firebase Realtime Database when configured via environment variables,
 * or defaults to a high-speed local persistence adapter initialized from database.json.
 */

const fs = require('fs');
const path = require('path');

class DatabaseAdapter {
  constructor() {
    this.useFirebase = false;
    this.localDbFile = path.join(__dirname, '../../database.json');
    this.dbData = {
      events: {},
      registrations: {},
      history: {}
    };

    this.init();
  }

  init() {
    // Check if Firebase environment variables are provided
    if (process.env.FIREBASE_DATABASE_URL && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const admin = require('firebase-admin');
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        this.firebaseDb = admin.database();
        this.useFirebase = true;
        console.log('Connected to Firebase Realtime Database:', process.env.FIREBASE_DATABASE_URL);
        return;
      } catch (err) {
        console.warn('Firebase initialization failed. Falling back to local persistence:', err.message);
      }
    }

    // Default Local Persistence (Zero-Config out of the box)
    this.loadLocalData();
    console.log('Running on Local JSON Database Adapter (Zero-Config ready).');
  }

  loadLocalData() {
    try {
      if (fs.existsSync(this.localDbFile)) {
        const raw = fs.readFileSync(this.localDbFile, 'utf8');
        this.dbData = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database.json:', err.message);
      this.dbData = { events: {}, registrations: {}, history: {} };
    }
  }

  persistLocalData() {
    try {
      fs.writeFileSync(this.localDbFile, JSON.stringify(this.dbData, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist database.json:', err.message);
    }
  }

  // --- EVENTS ---
  async getEvent(eventId) {
    if (this.useFirebase) {
      const snap = await this.firebaseDb.ref(`events/${eventId}`).once('value');
      return snap.val();
    }
    return this.dbData.events[eventId] || null;
  }

  async getAllEvents() {
    if (this.useFirebase) {
      const snap = await this.firebaseDb.ref('events').once('value');
      const val = snap.val();
      return val ? Object.values(val) : [];
    }
    return Object.values(this.dbData.events || {});
  }

  async saveEvent(eventData) {
    if (this.useFirebase) {
      await this.firebaseDb.ref(`events/${eventData.id}`).set(eventData);
      return eventData;
    }
    this.dbData.events[eventData.id] = eventData;
    if (!this.dbData.registrations[eventData.id]) {
      this.dbData.registrations[eventData.id] = {};
    }
    if (!this.dbData.history[eventData.id]) {
      this.dbData.history[eventData.id] = {};
    }
    this.persistLocalData();
    return eventData;
  }

  async updateEventCapacity(eventId, hallCapacity) {
    if (this.useFirebase) {
      await this.firebaseDb.ref(`events/${eventId}/hallCapacity`).set(hallCapacity);
      return this.getEvent(eventId);
    }
    if (this.dbData.events[eventId]) {
      this.dbData.events[eventId].hallCapacity = hallCapacity;
      this.persistLocalData();
      return this.dbData.events[eventId];
    }
    return null;
  }

  // --- REGISTRATIONS ---
  async getRegistration(eventId, studentId) {
    if (this.useFirebase) {
      const snap = await this.firebaseDb.ref(`registrations/${eventId}/${studentId}`).once('value');
      return snap.val();
    }
    return this.dbData.registrations[eventId]?.[studentId] || null;
  }

  async getRegistrations(eventId) {
    if (this.useFirebase) {
      const snap = await this.firebaseDb.ref(`registrations/${eventId}`).once('value');
      return snap.val() || {};
    }
    return this.dbData.registrations[eventId] || {};
  }

  async saveRegistration(eventId, studentId, regData) {
    if (this.useFirebase) {
      await this.firebaseDb.ref(`registrations/${eventId}/${studentId}`).set(regData);
      return regData;
    }
    if (!this.dbData.registrations[eventId]) {
      this.dbData.registrations[eventId] = {};
    }
    this.dbData.registrations[eventId][studentId] = regData;
    this.persistLocalData();
    return regData;
  }

  async markCheckedIn(eventId, studentId, checkedInAt) {
    if (this.useFirebase) {
      await this.firebaseDb.ref(`registrations/${eventId}/${studentId}`).update({
        checkedIn: true,
        checkedInAt
      });
      return this.getRegistration(eventId, studentId);
    }
    if (this.dbData.registrations[eventId]?.[studentId]) {
      this.dbData.registrations[eventId][studentId].checkedIn = true;
      this.dbData.registrations[eventId][studentId].checkedInAt = checkedInAt;
      this.persistLocalData();
      return this.dbData.registrations[eventId][studentId];
    }
    return null;
  }

  // --- HISTORY / AUDIT LOG ---
  async logHistory(eventId, entry) {
    const timestamp = entry.timestamp || Date.now();
    if (this.useFirebase) {
      await this.firebaseDb.ref(`history/${eventId}/${timestamp}`).set(entry);
      return entry;
    }
    if (!this.dbData.history[eventId]) {
      this.dbData.history[eventId] = {};
    }
    this.dbData.history[eventId][timestamp] = entry;
    this.persistLocalData();
    return entry;
  }

  async getHistory(eventId) {
    if (this.useFirebase) {
      const snap = await this.firebaseDb.ref(`history/${eventId}`).once('value');
      const val = snap.val();
      return val ? Object.values(val) : [];
    }
    return Object.values(this.dbData.history[eventId] || {});
  }
}

const db = new DatabaseAdapter();
module.exports = db;

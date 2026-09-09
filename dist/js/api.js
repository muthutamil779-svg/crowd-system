/**
 * Smart College Event Crowd Management System
 * Client API & Offline Resilience Manager: api.js
 */

const API_BASE = '/api';

// Web Audio Sound Synthesizer (Zero asset dependencies)
class AudioNotifier {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration, type = 'sine', gainVal = 0.15) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio playback fails silently if browser blocks autoplay
    }
  }

  playSuccess() {
    this.init();
    this.playTone(587.33, 0.12, 'sine', 0.2); // D5
    setTimeout(() => this.playTone(880, 0.25, 'sine', 0.2), 100); // A5
  }

  playDuplicate() {
    this.init();
    this.playTone(440, 0.15, 'triangle', 0.25);
    setTimeout(() => this.playTone(440, 0.2, 'triangle', 0.25), 180);
  }

  playError() {
    this.init();
    this.playTone(180, 0.35, 'sawtooth', 0.25);
  }

  playCapacityWarning() {
    this.init();
    this.playTone(800, 0.15, 'square', 0.2);
    setTimeout(() => this.playTone(600, 0.15, 'square', 0.2), 150);
    setTimeout(() => this.playTone(800, 0.25, 'square', 0.2), 300);
  }
}

const soundManager = new AudioNotifier();

// Offline Resilience & LocalStorage Queue Manager
class OfflineQueueManager {
  constructor() {
    this.storageKeyPrefix = 'CROWD_OFFLINE_QUEUE_';
    this.simulatedOffline = false;
    this.isSyncing = false;

    // Listen to browser network changes
    window.addEventListener('online', () => {
      console.log('[Network] Browser came back ONLINE. Triggering auto-sync...');
      this.dispatchQueueEvent();
      this.syncAllQueues();
    });

    window.addEventListener('offline', () => {
      console.warn('[Network] Browser went OFFLINE. Offline queueing engaged.');
      this.dispatchQueueEvent();
    });
  }

  isOnline() {
    if (this.simulatedOffline) return false;
    return navigator.onLine;
  }

  setSimulatedOffline(val) {
    this.simulatedOffline = Boolean(val);
    this.dispatchQueueEvent();
    if (!this.simulatedOffline && navigator.onLine) {
      this.syncAllQueues();
    }
  }

  getKey(eventId) {
    return `${this.storageKeyPrefix}${eventId}`;
  }

  getQueue(eventId) {
    try {
      const raw = localStorage.getItem(this.getKey(eventId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveQueue(eventId, queue) {
    try {
      localStorage.setItem(this.getKey(eventId), JSON.stringify(queue));
      this.dispatchQueueEvent(eventId);
    } catch (err) {
      console.error('Failed to save offline queue to localStorage:', err);
    }
  }

  enqueue(eventId, studentId) {
    const queue = this.getQueue(eventId);
    const item = {
      studentId: studentId.trim().toUpperCase(),
      queuedAt: new Date().toISOString()
    };
    queue.push(item);
    this.saveQueue(eventId, queue);
    return item;
  }

  clearQueue(eventId) {
    localStorage.removeItem(this.getKey(eventId));
    this.dispatchQueueEvent(eventId);
  }

  dispatchQueueEvent(eventId = null) {
    window.dispatchEvent(new CustomEvent('crowd-queue-changed', {
      detail: {
        eventId,
        isOnline: this.isOnline(),
        simulated: this.simulatedOffline
      }
    }));
  }

  async syncQueue(eventId) {
    if (this.isSyncing) return null;
    if (!this.isOnline()) {
      return { success: false, message: 'Cannot sync: terminal is currently offline.' };
    }

    const queue = this.getQueue(eventId);
    if (!queue || queue.length === 0) {
      return { success: true, count: 0, message: 'Offline queue is empty.' };
    }

    this.isSyncing = true;
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/checkin/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.clearQueue(eventId);
        this.isSyncing = false;
        return { success: true, count: queue.length, data };
      } else {
        this.isSyncing = false;
        return { success: false, error: data.error || 'Batch sync failed.' };
      }
    } catch (err) {
      this.isSyncing = false;
      return { success: false, error: err.message };
    }
  }

  async syncAllQueues() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storageKeyPrefix)) {
        const eventId = key.replace(this.storageKeyPrefix, '');
        await this.syncQueue(eventId);
      }
    }
  }
}

const offlineManager = new OfflineQueueManager();

// API Helper Methods
const Api = {
  // Events
  async getEvents() {
    const res = await fetch(`${API_BASE}/events`);
    return await res.json();
  },

  async getEvent(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}`);
    return await res.json();
  },

  async createEvent(eventData) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return await res.json();
  },

  async updateCapacity(eventId, hallCapacity) {
    const res = await fetch(`${API_BASE}/events/${eventId}/capacity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hallCapacity })
    });
    return await res.json();
  },

  // Registrations
  async registerStudent(eventId, studentData) {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    return await res.json();
  },

  async getRegistrations(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/registrations`);
    return await res.json();
  },

  // Check-In (Offline Resilient)
  async checkIn(eventId, studentId) {
    const cleanId = studentId.trim().toUpperCase();

    // Check offline status or simulated offline
    if (!offlineManager.isOnline()) {
      const queuedItem = offlineManager.enqueue(eventId, cleanId);
      return {
        offline: true,
        queued: true,
        message: `Offline mode: Student ID "${cleanId}" queued in localStorage for sync.`,
        data: queuedItem
      };
    }

    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: cleanId })
      });

      const data = await res.json();
      return {
        status: res.status,
        ...data
      };
    } catch (networkError) {
      // Network failure during request - automatically fallback to queue
      console.warn('Network call failed, buffering to localStorage:', networkError);
      const queuedItem = offlineManager.enqueue(eventId, cleanId);
      return {
        offline: true,
        queued: true,
        networkError: true,
        message: `Network disconnected: Student ID "${cleanId}" queued in localStorage.`,
        data: queuedItem
      };
    }
  },

  // Metrics & Analytics
  async getMetrics(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/metrics`);
    return await res.json();
  },

  async getPublicSeats(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/public-seats`);
    return await res.json();
  },

  async getHistory(eventId) {
    const res = await fetch(`${API_BASE}/events/${eventId}/history`);
    return await res.json();
  }
};

// UI Risk Badge Styling Helper
function getRiskBadgeHtml(riskBand) {
  let badgeClass = 'badge-low-risk';
  let dotColor = 'bg-emerald-400';

  if (riskBand === 'Moderate Risk') {
    badgeClass = 'badge-moderate-risk';
    dotColor = 'bg-amber-400';
  } else if (riskBand === 'High Risk') {
    badgeClass = 'badge-high-risk';
    dotColor = 'bg-red-400';
  } else if (riskBand === 'Overbooked / Overcrowded') {
    badgeClass = 'badge-overcrowded';
    dotColor = 'bg-purple-400';
  }

  return `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeClass}">
      <span class="w-2 h-2 rounded-full ${dotColor} animate-pulse"></span>
      ${riskBand}
    </span>
  `;
}

// Global Export
window.CrowdApp = {
  Api,
  offlineManager,
  soundManager,
  getRiskBadgeHtml
};

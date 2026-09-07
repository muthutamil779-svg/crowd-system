/**
 * Gatekeeper Live Check-In Terminal Controller
 */

let currentEventId = null;
let html5QrCode = null;
let cameraActive = false;
let scanCooldown = false;

// DOM Elements
const gateEventSelector = document.getElementById('gateEventSelector');
const gateVenueText = document.getElementById('gateVenueText');
const gateAdmittedCount = document.getElementById('gateAdmittedCount');
const gateCapacityLimit = document.getElementById('gateCapacityLimit');
const gateSeatsRemaining = document.getElementById('gateSeatsRemaining');
const gateRiskBadge = document.getElementById('gateRiskBadge');

const formCheckIn = document.getElementById('formCheckIn');
const inputStudentId = document.getElementById('inputStudentId');
const gateRecentList = document.getElementById('gateRecentList');

// Toast alert DOM elements
const toastAlertCard = document.getElementById('toastAlertCard');
const toastIconBox = document.getElementById('toastIconBox');
const toastIcon = document.getElementById('toastIcon');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');
const toastMetadata = document.getElementById('toastMetadata');
const toastTime = document.getElementById('toastTime');

// Network & Offline DOM elements
const networkStatusPill = document.getElementById('networkStatusPill');
const networkStatusText = document.getElementById('networkStatusText');
const offlineQueueBadge = document.getElementById('offlineQueueBadge');
const btnSyncQueue = document.getElementById('btnSyncQueue');
const btnToggleOfflineSimulation = document.getElementById('btnToggleOfflineSimulation');
const btnSimulateText = document.getElementById('btnSimulateText');

// Camera Elements
const btnToggleCamera = document.getElementById('btnToggleCamera');
const cameraBtnText = document.getElementById('cameraBtnText');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');

document.addEventListener('DOMContentLoaded', async () => {
  await loadEventOptions();

  const urlParams = new URLSearchParams(window.location.search);
  const paramEventId = urlParams.get('eventId');
  if (paramEventId && gateEventSelector.querySelector(`option[value="${paramEventId}"]`)) {
    gateEventSelector.value = paramEventId;
  }

  if (gateEventSelector.value) {
    selectEvent(gateEventSelector.value);
  }

  setupEventListeners();
  updateOfflineUi();
  inputStudentId.focus();
});

function setupEventListeners() {
  gateEventSelector.addEventListener('change', (e) => {
    if (e.target.value) {
      selectEvent(e.target.value);
    }
  });

  formCheckIn.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = inputStudentId.value.trim();
    if (!studentId || !currentEventId) return;

    inputStudentId.value = '';
    await processCheckIn(studentId);
    inputStudentId.focus();
  });

  // Offline Simulation Toggle (For professor / evaluator demonstration)
  btnToggleOfflineSimulation.addEventListener('click', () => {
    const isNowSimulated = !window.CrowdApp.offlineManager.simulatedOffline;
    window.CrowdApp.offlineManager.setSimulatedOffline(isNowSimulated);
    btnSimulateText.innerText = isNowSimulated ? 'Go Online' : 'Test Offline';
    updateOfflineUi();
  });

  // Manual Sync Button
  btnSyncQueue.addEventListener('click', async () => {
    if (!currentEventId) return;
    btnSyncQueue.disabled = true;
    btnSyncQueue.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Syncing...';

    const syncRes = await window.CrowdApp.offlineManager.syncQueue(currentEventId);
    btnSyncQueue.disabled = false;
    updateOfflineUi();

    if (syncRes && syncRes.success) {
      displayToast({
        type: 'success',
        title: 'Offline Queue Synchronized',
        message: `Successfully synced ${syncRes.count} queued check-ins with the server!`,
        metadata: 'Database counters updated idempotently.'
      });
      await refreshGateMetrics(currentEventId);
    } else {
      displayToast({
        type: 'error',
        title: 'Sync Failed',
        message: syncRes?.error || 'Unable to sync queue to server.'
      });
    }
  });

  // Camera Scanner Toggle
  btnToggleCamera.addEventListener('click', toggleCamera);

  // Listen for offline queue changes
  window.addEventListener('crowd-queue-changed', () => {
    updateOfflineUi();
  });
}

function updateOfflineUi() {
  const isOnline = window.CrowdApp.offlineManager.isOnline();
  const queue = currentEventId ? window.CrowdApp.offlineManager.getQueue(currentEventId) : [];

  if (isOnline) {
    networkStatusPill.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800';
    networkStatusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>ONLINE</span>';
  } else {
    networkStatusPill.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800';
    networkStatusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>OFFLINE (BUFFERING)</span>';
  }

  if (queue.length > 0) {
    btnSyncQueue.classList.remove('hidden');
    offlineQueueBadge.innerText = `${queue.length} Queued`;
  } else {
    btnSyncQueue.classList.add('hidden');
  }
}

async function loadEventOptions() {
  try {
    const res = await window.CrowdApp.Api.getEvents();
    gateEventSelector.innerHTML = '';
    if (res.success && res.data && res.data.length > 0) {
      res.data.forEach(ev => {
        const opt = document.createElement('option');
        opt.value = ev.id;
        opt.innerText = `${ev.name} (${ev.venue})`;
        gateEventSelector.appendChild(opt);
      });
    } else {
      gateEventSelector.innerHTML = '<option value="">No events found</option>';
    }
  } catch (err) {
    console.error('Failed to load events:', err);
  }
}

async function selectEvent(eventId) {
  currentEventId = eventId;
  const newUrl = new URL(window.location);
  newUrl.searchParams.set('eventId', eventId);
  window.history.replaceState({}, '', newUrl);

  await refreshGateMetrics(eventId);
  updateOfflineUi();
}

async function refreshGateMetrics(eventId) {
  try {
    const [eventRes, metricsRes] = await Promise.all([
      window.CrowdApp.Api.getEvent(eventId),
      window.CrowdApp.Api.getMetrics(eventId)
    ]);

    if (eventRes.success && eventRes.data) {
      gateVenueText.innerText = eventRes.data.venue;
      gateCapacityLimit.innerText = eventRes.data.hallCapacity;
    }

    if (metricsRes.success && metricsRes.data) {
      const m = metricsRes.data;
      gateAdmittedCount.innerText = m.currentAttendance;
      gateSeatsRemaining.innerText = m.seatsRemaining;
      gateRiskBadge.innerHTML = window.CrowdApp.getRiskBadgeHtml(m.liveRiskBand);
    }
  } catch (err) {
    console.warn('Could not fetch latest metrics:', err.message);
  }
}

/**
 * Main Check-In Execution Pipeline
 * Enforces and responds to Guards 1, 2, and 3
 */
async function processCheckIn(studentId) {
  if (!currentEventId) return;

  const res = await window.CrowdApp.Api.checkIn(currentEventId, studentId);
  const nowTime = new Date().toLocaleTimeString();

  // Case 1: Offline mode (Buffered into localStorage)
  if (res.offline) {
    window.CrowdApp.soundManager.playDuplicate();
    displayToast({
      type: 'warning',
      title: 'Offline Queue Buffered',
      message: res.message,
      metadata: `Buffered in localStorage at ${nowTime}. Automatic sync will fire when reconnected.`
    });
    addRecentAdmission({
      studentId,
      name: 'Offline Student',
      statusText: 'OFFLINE QUEUED',
      statusClass: 'bg-amber-950 text-amber-300 border-amber-800',
      time: nowTime
    });
    updateOfflineUi();
    return;
  }

  // Case 2: Guard 1 Violation (Not Registered)
  if (res.code === 'NOT_REGISTERED' || res.status === 404) {
    window.CrowdApp.soundManager.playError();
    displayToast({
      type: 'error',
      title: 'Guard 1 Rejection: Not Registered',
      message: res.error || `Student ID "${studentId}" is not registered for this event.`,
      metadata: 'Sequential Guard 1 rejected check-in. Entry denied.'
    });
    addRecentAdmission({
      studentId,
      name: 'Unregistered',
      statusText: 'GUARD 1: REJECTED',
      statusClass: 'bg-red-950 text-red-300 border-red-800',
      time: nowTime
    });
    return;
  }

  // Case 3: Guard 2 Violation (Already Checked In / Duplicate Check-In)
  if (res.code === 'ALREADY_CHECKED_IN' || res.status === 409) {
    window.CrowdApp.soundManager.playDuplicate();
    displayToast({
      type: 'duplicate',
      title: 'Guard 2 Rejection: Duplicate Entry',
      message: res.error || `Student ID "${studentId}" has already checked in!`,
      metadata: `Previous check-in time: ${res.checkedInAt ? new Date(res.checkedInAt).toLocaleTimeString() : 'Earlier'}`
    });
    addRecentAdmission({
      studentId,
      name: 'Duplicate Scan',
      statusText: 'GUARD 2: DUPLICATE',
      statusClass: 'bg-yellow-950 text-yellow-300 border-yellow-800',
      time: nowTime
    });
    return;
  }

  // Case 4: Guard 3 Triggered (Over Capacity Warning Flag)
  if (res.success && res.overCapacityFlag === true) {
    window.CrowdApp.soundManager.playCapacityWarning();
    displayToast({
      type: 'overcapacity',
      title: 'Guard 3 Alert: Venue Over Capacity!',
      message: res.message,
      metadata: `Current Attendance: ${res.data.currentAttendance} / ${res.data.hallCapacity} seats. Student ${res.data.name} admitted.`
    });
    addRecentAdmission({
      studentId: res.data.studentId,
      name: res.data.name,
      statusText: 'GUARD 3: OVER-CAPACITY',
      statusClass: 'bg-purple-950 text-purple-300 border-purple-800',
      time: nowTime
    });
    await refreshGateMetrics(currentEventId);
    return;
  }

  // Case 5: Normal Successful Check-In (Below Capacity)
  if (res.success && !res.overCapacityFlag) {
    window.CrowdApp.soundManager.playSuccess();
    displayToast({
      type: 'success',
      title: 'Check-In Approved',
      message: res.message,
      metadata: `Student: ${res.data.name} • Live Attendance: ${res.data.currentAttendance}/${res.data.hallCapacity}`
    });
    addRecentAdmission({
      studentId: res.data.studentId,
      name: res.data.name,
      statusText: 'ADMITTED',
      statusClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      time: nowTime
    });
    await refreshGateMetrics(currentEventId);
    return;
  }

  // Generic failure fallback
  displayToast({
    type: 'error',
    title: 'Check-In Error',
    message: res.error || 'An unexpected error occurred during admission check.'
  });
}

/**
 * Visual Toast Alert Renderer
 */
function displayToast({ type, title, message, metadata }) {
  toastAlertCard.classList.remove('hidden');
  toastTime.innerText = new Date().toLocaleTimeString();
  toastTitle.innerText = title;
  toastMessage.innerText = message;
  toastMetadata.innerText = metadata || '';

  // Apply styling themes based on guard clause result
  if (type === 'success') {
    toastAlertCard.className = 'glass-panel p-5 rounded-2xl border border-emerald-500/50 bg-emerald-950/30 animate-slide-up';
    toastIconBox.className = 'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    toastIcon.className = 'ph-bold ph-check-circle';
  } else if (type === 'duplicate') {
    toastAlertCard.className = 'glass-panel p-5 rounded-2xl border border-amber-500/50 bg-amber-950/30 animate-slide-up';
    toastIconBox.className = 'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-amber-500/20 text-amber-400 border border-amber-500/40';
    toastIcon.className = 'ph-bold ph-shield-warning';
  } else if (type === 'overcapacity') {
    toastAlertCard.className = 'glass-panel p-5 rounded-2xl border border-purple-500/60 bg-purple-950/40 animate-slide-up ring-2 ring-purple-500/40';
    toastIconBox.className = 'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-purple-500/30 text-purple-300 border border-purple-400 animate-pulse';
    toastIcon.className = 'ph-bold ph-warning-octagon';
  } else if (type === 'warning') {
    toastAlertCard.className = 'glass-panel p-5 rounded-2xl border border-amber-600/50 bg-amber-950/40 animate-slide-up';
    toastIconBox.className = 'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-amber-600/20 text-amber-400 border border-amber-600/40';
    toastIcon.className = 'ph-bold ph-cloud-slash';
  } else {
    // Error / Guard 1
    toastAlertCard.className = 'glass-panel p-5 rounded-2xl border border-red-500/50 bg-red-950/30 animate-slide-up';
    toastIconBox.className = 'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-red-500/20 text-red-400 border border-red-500/40';
    toastIcon.className = 'ph-bold ph-x-circle';
  }
}

function addRecentAdmission({ studentId, name, statusText, statusClass, time }) {
  const emptyPlaceholder = gateRecentList.querySelector('.text-center');
  if (emptyPlaceholder) {
    gateRecentList.innerHTML = '';
  }

  const row = document.createElement('div');
  row.className = 'py-2 px-3 flex items-center justify-between text-xs hover:bg-slate-900/50 rounded-lg transition';
  row.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="font-medium text-white">${name}</div>
      <div class="font-mono text-slate-400">(${studentId})</div>
    </div>
    <div class="flex items-center gap-3">
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusClass}">${statusText}</span>
      <span class="font-mono text-[11px] text-slate-400">${time}</span>
    </div>
  `;
  gateRecentList.insertBefore(row, gateRecentList.firstChild);
}

/**
 * Optical Camera QR Scanner Control
 */
async function toggleCamera() {
  if (cameraActive) {
    if (html5QrCode) {
      await html5QrCode.stop();
      html5QrCode.clear();
    }
    cameraActive = false;
    cameraBtnText.innerText = 'Start Camera';
    cameraPlaceholder.classList.remove('hidden');
    return;
  }

  try {
    html5QrCode = new Html5Qrcode('qr-reader');
    cameraPlaceholder.classList.add('hidden');
    cameraBtnText.innerText = 'Stop Camera';
    cameraActive = true;

    await html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 220, height: 220 }
      },
      (decodedText) => {
        if (scanCooldown) return;
        scanCooldown = true;
        setTimeout(() => { scanCooldown = false; }, 2000); // 2-second debounce

        let studentId = decodedText.trim();
        // Check if QR pass is JSON { eventId, studentId }
        try {
          const parsed = JSON.parse(decodedText);
          if (parsed.studentId) {
            studentId = parsed.studentId;
          }
        } catch {
          // Plain string ID
        }

        processCheckIn(studentId);
      },
      () => {
        // Ignored frame failures
      }
    );
  } catch (err) {
    cameraActive = false;
    cameraBtnText.innerText = 'Start Camera';
    cameraPlaceholder.classList.remove('hidden');
    alert('Could not access camera: ' + err.message + '. Please use manual Fast ID entry.');
  }
}

/**
 * Public Seat Board Controller
 */

let currentEventId = null;
let countdown = 4;
let countdownInterval = null;

// DOM Elements
const boardEventSelector = document.getElementById('boardEventSelector');
const boardEventName = document.getElementById('boardEventName');
const boardVenue = document.getElementById('boardVenue');
const boardStatusBadge = document.getElementById('boardStatusBadge');
const boardSeatsRemaining = document.getElementById('boardSeatsRemaining');
const boardCurrentAttendance = document.getElementById('boardCurrentAttendance');
const boardCapacity = document.getElementById('boardCapacity');
const boardProgressBar = document.getElementById('boardProgressBar');
const boardOccupancyPct = document.getElementById('boardOccupancyPct');
const boardRiskBand = document.getElementById('boardRiskBand');
const kioskClock = document.getElementById('kioskClock');
const refreshCountdown = document.getElementById('refreshCountdown');

document.addEventListener('DOMContentLoaded', async () => {
  // Start digital clock
  updateClock();
  setInterval(updateClock, 1000);

  await loadEventOptions();

  const urlParams = new URLSearchParams(window.location.search);
  const paramEventId = urlParams.get('eventId');
  if (paramEventId && boardEventSelector.querySelector(`option[value="${paramEventId}"]`)) {
    boardEventSelector.value = paramEventId;
  }

  if (boardEventSelector.value) {
    selectEvent(boardEventSelector.value);
  }

  // Setup auto-refresh ticker
  countdownInterval = setInterval(handleCountdownTick, 1000);

  boardEventSelector.addEventListener('change', (e) => {
    if (e.target.value) {
      selectEvent(e.target.value);
    }
  });
});

function updateClock() {
  const now = new Date();
  kioskClock.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function handleCountdownTick() {
  countdown--;
  if (countdown <= 0) {
    countdown = 4;
    if (currentEventId) {
      refreshSeatBoard(currentEventId);
    }
  }
  refreshCountdown.innerText = `${countdown}s`;
}

async function loadEventOptions() {
  try {
    const res = await window.CrowdApp.Api.getEvents();
    boardEventSelector.innerHTML = '';
    if (res.success && res.data && res.data.length > 0) {
      res.data.forEach(ev => {
        const opt = document.createElement('option');
        opt.value = ev.id;
        opt.innerText = `${ev.name} (${ev.venue})`;
        boardEventSelector.appendChild(opt);
      });
    } else {
      boardEventSelector.innerHTML = '<option value="">No events active</option>';
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

  countdown = 4;
  await refreshSeatBoard(eventId);
}

async function refreshSeatBoard(eventId) {
  try {
    const res = await window.CrowdApp.Api.getPublicSeats(eventId);
    if (!res.success || !res.data) return;

    const d = res.data;
    boardEventName.innerText = d.eventName;
    boardVenue.querySelector('span').innerText = d.venue;

    boardCurrentAttendance.innerText = d.currentAttendance;
    boardCapacity.innerText = d.hallCapacity;
    boardOccupancyPct.innerText = `${d.occupancyPercentage}%`;
    boardRiskBand.innerHTML = window.CrowdApp.getRiskBadgeHtml(d.liveRiskBand);

    // Remaining Seats Display
    boardSeatsRemaining.innerText = d.seatsRemaining;

    // Visual theme based on seats remaining
    if (d.seatsRemaining <= 0) {
      boardSeatsRemaining.className = 'text-7xl md:text-9xl font-black font-mono tracking-tight text-red-400 my-2';
      boardStatusBadge.innerHTML = `
        <span class="px-5 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest bg-red-950 text-red-300 border border-red-800 flex items-center gap-2 animate-pulse">
          <i class="ph-bold ph-prohibit"></i> Hall Full / Standby Only
        </span>
      `;
      boardProgressBar.className = 'h-3 rounded-full bg-red-500 transition-all duration-700';
    } else if (d.occupancyPercentage >= 80) {
      boardSeatsRemaining.className = 'text-7xl md:text-9xl font-black font-mono tracking-tight text-amber-400 my-2';
      boardStatusBadge.innerHTML = `
        <span class="px-5 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-2">
          <i class="ph-bold ph-warning"></i> Limited Seats Remaining
        </span>
      `;
      boardProgressBar.className = 'h-3 rounded-full bg-amber-500 transition-all duration-700';
    } else {
      boardSeatsRemaining.className = 'text-7xl md:text-9xl font-black font-mono tracking-tight text-emerald-400 my-2';
      boardStatusBadge.innerHTML = `
        <span class="px-5 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-2">
          <i class="ph-bold ph-check-circle"></i> Seats Available
        </span>
      `;
      boardProgressBar.className = 'h-3 rounded-full bg-emerald-500 transition-all duration-700';
    }

    // Progress bar width
    boardProgressBar.style.width = `${Math.min(100, d.occupancyPercentage)}%`;
  } catch (err) {
    console.warn('Error refreshing public seat board:', err);
  }
}

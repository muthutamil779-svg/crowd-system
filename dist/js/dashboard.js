/**
 * Organizer Live Dashboard Controller
 */

let currentEventId = null;
let refreshInterval = null;

// DOM Elements
const eventSelector = document.getElementById('eventSelector');
const heroTitle = document.getElementById('heroTitle');
const heroVenue = document.getElementById('heroVenue');
const heroDateText = document.getElementById('heroDateText');
const heroCapacityDisplay = document.getElementById('heroCapacityDisplay');

const preEventRiskBadge = document.getElementById('preEventRiskBadge');
const liveRiskBadge = document.getElementById('liveRiskBadge');
const preEventLoadPct = document.getElementById('preEventLoadPct');
const liveOccupancyPct = document.getElementById('liveOccupancyPct');
const preEventProgressBar = document.getElementById('preEventProgressBar');
const liveProgressBar = document.getElementById('liveProgressBar');
const expectedCount = document.getElementById('expectedCount');
const currentCheckedCount = document.getElementById('currentCheckedCount');
const capacityPreRef = document.getElementById('capacityPreRef');
const capacityLiveRef = document.getElementById('capacityLiveRef');

const statCheckedIn = document.getElementById('statCheckedIn');
const statRegistered = document.getElementById('statRegistered');
const statSeatsLeft = document.getElementById('statSeatsLeft');
const statCapacity = document.getElementById('statCapacity');

const activityStreamContainer = document.getElementById('activityStreamContainer');
const rosterListContainer = document.getElementById('rosterListContainer');
const historyCountBadge = document.getElementById('historyCountBadge');
const rosterCountBadge = document.getElementById('rosterCountBadge');

// Capacity Modal Elements
const modalAdjustCapacity = document.getElementById('modalAdjustCapacity');
const btnAdjustCapacity = document.getElementById('btnAdjustCapacity');
const btnCloseCapacityModal = document.getElementById('btnCloseCapacityModal');
const btnCancelCapacityModal = document.getElementById('btnCancelCapacityModal');
const formAdjustCapacity = document.getElementById('formAdjustCapacity');
const inputNewCapacity = document.getElementById('inputNewCapacity');

// New Event Modal Elements
const modalNewEvent = document.getElementById('modalNewEvent');
const btnNewEventModal = document.getElementById('btnNewEventModal');
const btnCloseNewEventModal = document.getElementById('btnCloseNewEventModal');
const btnCancelNewEventModal = document.getElementById('btnCancelNewEventModal');
const formNewEvent = document.getElementById('formNewEvent');

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  await loadEventOptions();

  // Check URL params for eventId
  const urlParams = new URLSearchParams(window.location.search);
  const paramEventId = urlParams.get('eventId');
  if (paramEventId && eventSelector.querySelector(`option[value="${paramEventId}"]`)) {
    eventSelector.value = paramEventId;
  }

  if (eventSelector.value) {
    selectEvent(eventSelector.value);
  }

  // Setup auto-polling every 3.5s
  refreshInterval = setInterval(() => {
    if (currentEventId) {
      refreshData(currentEventId);
    }
  }, 3500);

  setupEventListeners();
});

function setupEventListeners() {
  eventSelector.addEventListener('change', (e) => {
    if (e.target.value) {
      selectEvent(e.target.value);
    }
  });

  document.getElementById('btnRefresh').addEventListener('click', () => {
    if (currentEventId) refreshData(currentEventId);
  });

  // Capacity Modal
  btnAdjustCapacity.addEventListener('click', () => {
    if (!currentEventId) return;
    inputNewCapacity.value = heroCapacityDisplay.innerText !== '--' ? heroCapacityDisplay.innerText : 100;
    modalAdjustCapacity.classList.remove('hidden');
  });

  [btnCloseCapacityModal, btnCancelCapacityModal].forEach(btn => {
    btn.addEventListener('click', () => modalAdjustCapacity.classList.add('hidden'));
  });

  formAdjustCapacity.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newCap = parseInt(inputNewCapacity.value, 10);
    if (!newCap || newCap <= 0) return;

    try {
      const res = await window.CrowdApp.Api.updateCapacity(currentEventId, newCap);
      if (res.success) {
        modalAdjustCapacity.classList.add('hidden');
        await refreshData(currentEventId);
      } else {
        alert(res.error || 'Failed to update capacity.');
      }
    } catch (err) {
      alert(err.message);
    }
  });

  // New Event Modal
  btnNewEventModal.addEventListener('click', () => {
    modalNewEvent.classList.remove('hidden');
  });

  [btnCloseNewEventModal, btnCancelNewEventModal].forEach(btn => {
    btn.addEventListener('click', () => modalNewEvent.classList.add('hidden'));
  });

  formNewEvent.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('eventName').value,
      venue: document.getElementById('eventVenue').value,
      hallCapacity: parseInt(document.getElementById('eventCapacity').value, 10),
      dateTime: new Date(document.getElementById('eventDateTime').value).toISOString(),
      registrationDeadline: new Date(document.getElementById('eventDeadline').value).toISOString()
    };

    try {
      const res = await window.CrowdApp.Api.createEvent(payload);
      if (res.success) {
        modalNewEvent.classList.add('hidden');
        formNewEvent.reset();
        await loadEventOptions();
        eventSelector.value = res.data.id;
        selectEvent(res.data.id);
      } else {
        alert(res.error || 'Failed to create event.');
      }
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadEventOptions() {
  try {
    const res = await window.CrowdApp.Api.getEvents();
    eventSelector.innerHTML = '';
    if (res.success && res.data && res.data.length > 0) {
      res.data.forEach(ev => {
        const opt = document.createElement('option');
        opt.value = ev.id;
        opt.innerText = `${ev.name} (${ev.venue})`;
        eventSelector.appendChild(opt);
      });
    } else {
      eventSelector.innerHTML = '<option value="">No events found</option>';
    }
  } catch (err) {
    console.error('Failed to load events:', err);
  }
}

async function selectEvent(eventId) {
  currentEventId = eventId;
  // Update URL without reload
  const newUrl = new URL(window.location);
  newUrl.searchParams.set('eventId', eventId);
  window.history.replaceState({}, '', newUrl);

  await refreshData(eventId);
}

async function refreshData(eventId) {
  try {
    const [eventRes, metricsRes, historyRes, rosterRes] = await Promise.all([
      window.CrowdApp.Api.getEvent(eventId),
      window.CrowdApp.Api.getMetrics(eventId),
      window.CrowdApp.Api.getHistory(eventId),
      window.CrowdApp.Api.getRegistrations(eventId)
    ]);

    if (eventRes.success && eventRes.data) {
      const ev = eventRes.data;
      heroTitle.innerText = ev.name;
      heroVenue.querySelector('span').innerText = ev.venue;
      heroDateText.innerText = new Date(ev.dateTime).toLocaleString([], {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      heroCapacityDisplay.innerText = ev.hallCapacity;
      statCapacity.innerText = ev.hallCapacity;
      capacityPreRef.innerText = ev.hallCapacity;
      capacityLiveRef.innerText = ev.hallCapacity;
    }

    if (metricsRes.success && metricsRes.data) {
      const m = metricsRes.data;
      // Dual metrics
      preEventLoadPct.innerText = `${m.registrationLoadRatio}%`;
      liveOccupancyPct.innerText = `${m.occupancyPercentage}%`;

      preEventRiskBadge.innerHTML = window.CrowdApp.getRiskBadgeHtml(m.preEventRiskBand);
      liveRiskBadge.innerHTML = window.CrowdApp.getRiskBadgeHtml(m.liveRiskBand);

      // Progress bars
      preEventProgressBar.style.width = `${Math.min(100, m.registrationLoadRatio)}%`;
      liveProgressBar.style.width = `${Math.min(100, m.occupancyPercentage)}%`;

      // Dynamic color for live bar
      if (m.occupancyPercentage > 100) {
        liveProgressBar.className = 'h-2.5 rounded-full transition-all duration-500 bg-purple-500';
      } else if (m.occupancyPercentage > 80) {
        liveProgressBar.className = 'h-2.5 rounded-full transition-all duration-500 bg-red-500';
      } else if (m.occupancyPercentage > 50) {
        liveProgressBar.className = 'h-2.5 rounded-full transition-all duration-500 bg-amber-500';
      } else {
        liveProgressBar.className = 'h-2.5 rounded-full transition-all duration-500 bg-emerald-500';
      }

      // Stats
      expectedCount.innerText = m.expectedAttendance;
      currentCheckedCount.innerText = m.currentAttendance;
      statCheckedIn.innerText = m.currentAttendance;
      statRegistered.innerText = m.expectedAttendance;
      statSeatsLeft.innerText = m.seatsRemaining;
    }

    // Render History Stream
    if (historyRes.success && historyRes.data) {
      renderHistoryStream(historyRes.data);
    }

    // Render Roster
    if (rosterRes.success && rosterRes.data) {
      renderRoster(rosterRes.data);
    }
  } catch (err) {
    console.error('Error refreshing dashboard data:', err);
  }
}

function renderHistoryStream(historyList) {
  historyCountBadge.innerText = `${historyList.length} logs`;
  if (historyList.length === 0) {
    activityStreamContainer.innerHTML = '<div class="text-center py-8 text-slate-400 text-xs">No check-in activity recorded yet.</div>';
    return;
  }

  activityStreamContainer.innerHTML = historyList.map(h => {
    const timeStr = h.recordedAt ? new Date(h.recordedAt).toLocaleTimeString() : '';
    const isOverCap = h.overCapacityFlag;
    return `
      <div class="py-2 px-3 flex items-center justify-between hover:bg-slate-900/50 rounded-lg transition text-xs">
        <div class="flex items-center gap-2.5">
          <div class="w-6 h-6 rounded-full flex items-center justify-center ${isOverCap ? 'bg-purple-900/60 text-purple-400 border border-purple-700/50' : 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50'}">
            <i class="ph-bold ${isOverCap ? 'ph-warning' : 'ph-check'}"></i>
          </div>
          <div>
            <div class="font-semibold text-slate-200 flex items-center gap-1.5">
              <span>${h.name || 'Attendee'}</span>
              <span class="font-mono text-[10px] text-slate-400">(${h.studentId})</span>
              ${isOverCap ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800">Over-Capacity Guard 3</span>' : ''}
            </div>
            <div class="text-[10px] text-slate-400">${h.action || 'CHECK_IN'} recorded</div>
          </div>
        </div>
        <div class="text-right font-mono text-[11px] text-slate-400">
          ${timeStr}
        </div>
      </div>
    `;
  }).join('');
}

function renderRoster(rosterList) {
  rosterCountBadge.innerText = `${rosterList.length} students`;
  if (rosterList.length === 0) {
    rosterListContainer.innerHTML = '<div class="text-center py-8 text-slate-400 text-xs">No registered students found.</div>';
    return;
  }

  rosterListContainer.innerHTML = rosterList.map(r => {
    return `
      <div class="py-2 px-3 flex items-center justify-between hover:bg-slate-900/50 rounded-lg transition text-xs">
        <div>
          <div class="font-medium text-slate-200">${r.name}</div>
          <div class="font-mono text-[10px] text-slate-400">${r.studentId} • ${r.email}</div>
        </div>
        <div>
          ${r.checkedIn
            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">Checked In</span>'
            : '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">Registered</span>'
          }
        </div>
      </div>
    `;
  }).join('');
}

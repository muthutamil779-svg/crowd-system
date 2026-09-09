/**
 * Student Pre-Registration & Digital Pass Controller
 */

let qrCodeInstance = null;
let eventsCache = [];

// DOM Elements
const regEventSelector = document.getElementById('regEventSelector');
const venueSnippet = document.getElementById('venueSnippet');
const deadlineSnippet = document.getElementById('deadlineSnippet');
const formRegister = document.getElementById('formRegister');
const regName = document.getElementById('regName');
const regStudentId = document.getElementById('regStudentId');
const regEmail = document.getElementById('regEmail');
const regAlertBox = document.getElementById('regAlertBox');

// Ticket Elements
const ticketEventName = document.getElementById('ticketEventName');
const ticketStudentName = document.getElementById('ticketStudentName');
const ticketStudentId = document.getElementById('ticketStudentId');
const ticketVenue = document.getElementById('ticketVenue');
const ticketStatus = document.getElementById('ticketStatus');
const qrcodeContainer = document.getElementById('qrcode');

document.addEventListener('DOMContentLoaded', async () => {
  await loadEvents();

  regEventSelector.addEventListener('change', () => {
    updateEventSnippet();
  });

  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleRegistration();
  });

  // Render initial default preview pass
  renderQrCode('CS2026001');
});

async function loadEvents() {
  try {
    const res = await window.CrowdApp.Api.getEvents();
    if (res.success && res.data && res.data.length > 0) {
      eventsCache = res.data;
      regEventSelector.innerHTML = '';
      eventsCache.forEach(ev => {
        const opt = document.createElement('option');
        opt.value = ev.id;
        opt.innerText = `${ev.name} (${ev.venue})`;
        regEventSelector.appendChild(opt);
      });
      updateEventSnippet();
    } else {
      regEventSelector.innerHTML = '<option value="">No active events found</option>';
    }
  } catch (err) {
    console.error('Failed to load events for registration:', err);
  }
}

function updateEventSnippet() {
  const selected = eventsCache.find(e => e.id === regEventSelector.value);
  if (selected) {
    venueSnippet.innerHTML = `<i class="ph-bold ph-map-pin"></i> Venue: ${selected.venue}`;
    const deadlineDate = new Date(selected.registrationDeadline);
    deadlineSnippet.innerHTML = `<i class="ph-bold ph-clock"></i> Deadline: ${deadlineDate.toLocaleDateString()} ${deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

async function handleRegistration() {
  const eventId = regEventSelector.value;
  const name = regName.value.trim();
  const studentId = regStudentId.value.trim().toUpperCase();
  const email = regEmail.value.trim().toLowerCase();

  regAlertBox.classList.add('hidden');

  if (!eventId) {
    showAlert('Please select an event.', 'error');
    return;
  }

  const payload = { name, studentId, email };

  try {
    const res = await window.CrowdApp.Api.registerStudent(eventId, payload);

    if (res.success) {
      showAlert('Pre-registration confirmed! Your digital admission pass has been generated below.', 'success');
      window.CrowdApp.soundManager.playSuccess();

      // Update Digital Pass Card
      const eventObj = eventsCache.find(e => e.id === eventId);
      ticketEventName.innerText = eventObj ? eventObj.name : 'College Event';
      ticketStudentName.innerText = name;
      ticketStudentId.innerText = studentId;
      ticketVenue.innerText = eventObj ? eventObj.venue : 'Auditorium';
      ticketStatus.innerText = 'Pre-Registered';

      // Generate scannable QR Code
      const qrData = JSON.stringify({
        eventId,
        studentId
      });
      renderQrCode(qrData);

      // Smooth scroll to pass
      document.getElementById('ticketContainer').scrollIntoView({ behavior: 'smooth' });
    } else {
      showAlert(res.error || 'Registration failed.', 'error');
      window.CrowdApp.soundManager.playError();
    }
  } catch (err) {
    showAlert(err.message || 'Error communicating with registration server.', 'error');
    window.CrowdApp.soundManager.playError();
  }
}

function showAlert(message, type = 'success') {
  regAlertBox.classList.remove('hidden');
  regAlertBox.innerText = message;
  if (type === 'success') {
    regAlertBox.className = 'p-3 rounded-lg text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-300';
  } else {
    regAlertBox.className = 'p-3 rounded-lg text-xs bg-red-950/80 border border-red-800 text-red-300';
  }
}

function renderQrCode(data) {
  qrcodeContainer.innerHTML = '';
  qrCodeInstance = new QRCode(qrcodeContainer, {
    text: data,
    width: 160,
    height: 160,
    colorDark: '#090d16',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

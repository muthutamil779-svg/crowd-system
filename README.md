# Smart College Event Crowd Management System

A production-ready, pure-software telemetry web application for managing crowd capacity, pre-registrations, high-speed gate check-ins, and overcrowding risk alerts across college events (workshops, hackathons, seminars, symposiums) without physical hardware sensors.

---

## Key Features

1. **Dual-Metric Risk Engine**:
   - `preEventRiskBand`: Pre-event demand ratio based on registrations (`expectedAttendance / hallCapacity`).
   - `liveRiskBand`: Real-time physical occupancy based on actual check-ins (`currentAttendance / hallCapacity`).
   - Mapped to 4 discrete operational bands:
     - 0–50%: **Low Risk**
     - 51–80%: **Moderate Risk**
     - 81–100%: **High Risk**
     - \> 100%: **Overbooked / Overcrowded**

2. **Sequential Gate Check-In Guard Clauses**:
   - **Guard 1**: Checks if student is registered for the event. Rejects unregistered students (`404 / NOT_REGISTERED`).
   - **Guard 2**: Anti-passback check. Rejects duplicate check-ins (`409 / ALREADY_CHECKED_IN`).
   - **Guard 3**: Capacity threshold check. If `currentAttendance >= hallCapacity`, permits check-in but returns `overCapacityFlag = true` with visual & audible alarms without corrupting counters.

3. **Concrete Offline Resilience**:
   - Gate check-ins automatically buffer into browser `localStorage` when offline or when network connectivity drops.
   - Automatically replays and batch-synchronizes queued check-ins to `/api/events/:eventId/checkin/batch` upon reconnection.
   - Includes a built-in **"Test Offline"** simulation button for evaluators.

4. **Multi-Role User Interfaces**:
   - **Central Portal** (`/index.html`): Overview and navigation hub.
   - **Organizer Command Hub** (`/dashboard.html`): Real-time metrics cards, dual-risk badges, visual progress bars, mid-event capacity updates, and live check-in audit feed.
   - **Gatekeeper Terminal** (`/gatekeeper.html`): Fast ID entry, integrated HTML5 camera QR scanner, Web Audio synthesized chimes/sirens, and offline queue status.
   - **Public Seat Board** (`/seatboard.html`): High-visibility hallway kiosk screen showing available seats remaining (`hallCapacity - currentAttendance`) and admission status.
   - **Student Pre-Registration** (`/register.html`): Event registration with duplicate prevention and cryptographic digital QR admission ticket generator.

---

## Quick Start (Run Locally)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Test Suite
```bash
npm test
```
All 13 unit tests will execute, validating the 5 core functions, sequential guard clauses, and dual-metric calculations.

### 3. Start the Web Server
```bash
npm start
```
The server will start at: **`http://localhost:3000`**

### Access Links:
- **Central Portal Hub**: [http://localhost:3000](http://localhost:3000)
- **Organizer Dashboard**: [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html)
- **Gatekeeper Terminal**: [http://localhost:3000/gatekeeper.html](http://localhost:3000/gatekeeper.html)
- **Public Seat Board**: [http://localhost:3000/seatboard.html](http://localhost:3000/seatboard.html)
- **Student Pre-Registration**: [http://localhost:3000/register.html](http://localhost:3000/register.html)
- **Technical Project Report**: [docs/project_report.md](docs/project_report.md)

---

## Pre-Seeded Sample Data for Testing

The system comes pre-loaded with sample events in `database.json`:
- **Event 1:** `evt_ai_symposium_2026` — National AI & Robotics Symposium 2026 (Capacity: 120)
  - Pre-registered & checked in: `CS2026001` (Aarav Sharma), `CS2026002` (Priya Nair)
  - Pre-registered but not checked in yet: `EC2026014` (Rohan Patel), `ME2026033` (Sneha Verma)
- **Event 2:** `evt_hackathon_2026` — Smart Campus Hackathon Finale (Capacity: 60)
- **Event 3:** `evt_cyber_workshop_2026` — Ethical Hacking Workshop (Capacity: 30)

### Quick Test Scenarios at Gatekeeper Screen:
1. **Normal Entry**: Enter `EC2026014` -> ✅ Approved (Admitted count increments).
2. **Guard 2 (Duplicate Entry)**: Enter `EC2026014` again -> ⚠️ Guard 2 Rejection: Duplicate Entry.
3. **Guard 1 (Unregistered Entry)**: Enter `RANDOM999` -> 🛑 Guard 1 Rejection: Not Registered.
4. **Guard 3 (Over Capacity)**: Update capacity to a small number on the Dashboard, then check in attendees -> 🚨 Guard 3 Alert: Venue Over Capacity flag triggered!
5. **Offline Mode**: Click **"Test Offline"** -> Enter student ID -> See item queued in `localStorage` -> Click **"Go Online"** / **"Sync"** -> Server processes queue idempotently.

---

## Firebase Realtime Database Deployment (Optional)

The application includes `database.json` and `security.rules` for Firebase Realtime Database. By default, it runs with a built-in local persistence engine with zero external setup.

To connect to a live Firebase instance:
1. Set the following environment variables in `.env`:
   ```env
   FIREBASE_DATABASE_URL=https://<your-project-id>.firebaseio.com
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   ```
2. Deploy security rules:
   ```bash
   firebase deploy --only database
   ```

---

## Technology Stack
- **Backend:** Node.js, Express framework
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3, Tailwind CSS (CDN)
- **Database:** Local JSON Persistence / Firebase Realtime Database
- **Scanning:** `html5-qrcode` CDN
- **QR Generation:** `qrcodejs` CDN
- **Audio:** Native Web Audio API Synthesizer (zero audio file dependencies)

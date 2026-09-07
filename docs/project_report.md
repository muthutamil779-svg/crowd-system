# Technical Project Report: Smart College Event Crowd Management System

**Academic Year:** 2025–2026  
**Degree Track:** Bachelor of Technology / Computer Science & Engineering  
**System Classification:** Pure Software Event Telemetry & Real-Time Capacity Orchestration  

---

## 1. Abstract & Problem Statement

### 1.1 Abstract
High-density college events—including technical symposiums, hackathons, academic conferences, and cultural fests—frequently face severe localized overcrowding, corridor bottlenecking, and fire-code occupancy violations. Traditional crowd monitoring approaches rely either on manual head-counting (prone to human error and latency) or expensive physical infrastructure such as overhead infrared thermal sensors, LiDAR arrays, or motorized turnstiles that colleges cannot justify for short-duration events. 

This project introduces the **Smart College Event Crowd Management System**, an enterprise-grade, pure-software telemetry web platform. By decoupling pre-event registration load from live physical gate admissions through a novel **Dual-Metric Risk Architecture**, enforcing sequential gate admission guard clauses, and incorporating browser-level `localStorage` offline resilience, the system provides zero-hardware, real-time crowd orchestration with millisecond response latencies.

### 1.2 Problem Statement
College event organizers routinely experience two recurring failure modes:
1. **The Overbooking vs. No-Show Paradox:** Technical seminars often receive registrations exceeding 150% of hall capacity due to free student registration. However, actual attendance varies wildly (40% to 110%), leading organizers to either turn students away prematurely or suffer hazardous unmonitored over-capacity crowds.
2. **Gate Check-In Bottlenecks & Network Drops:** Campus Wi-Fi frequently collapses under high density at auditorium entrances. When cloud database connections drop, gatekeepers revert to unvalidated paper lists, causing double check-ins ("passback fraud") and lost crowd metrics.

---

## 2. ASCII System Data Flow & Architecture

The architecture separates client interfaces, API ingestion, guard verification, real-time database state, and telemetry dispatch.

```
+-----------------------------------------------------------------------------------+
|                                CLIENT LAYER (FRONTEND)                           |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Student Device ]      [ Gate Terminal ]    [ Organizer Screen ]  [ Kiosk Board]|
|   Pre-Registration        Camera QR / Fast ID   Live Command Hub     Hallway Mon  |
|          |                        |                    |                  |       |
|   (POST /register)       (POST /checkin)         (GET /metrics)     (GET /seats)  |
|          |                        |                    |                  |       |
+----------|------------------------|--------------------|------------------|-------+
           |                        |                    |                  |
           v                        v                    v                  v
+-----------------------------------------------------------------------------------+
|                         NODE.JS / EXPRESS BACKEND ENGINE                          |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  1. REST API Routing & Input Sanitization                                         |
|  2. Core Engine (attendanceEngine.js)                                             |
|                                                                                   |
|     +-----------------------------------------------------------------------+     |
|     |               SEQUENTIAL GATE CHECK-IN GUARD PIPELINE                 |     |
|     |                                                                       |     |
|     |  [Incoming Check-In Payload: { eventId, studentId }]                 |     |
|     |                          |                                            |     |
|     |                          v                                            |     |
|     |  +--------------------------------------------------+                 |     |
|     |  | Guard 1: Verify studentId is registered in roster | -> NO -> 404   |     |
|     |  +--------------------------------------------------+        REJECT   |     |
|     |                          | YES                                        |     |
|     |                          v                                            |     |
|     |  +--------------------------------------------------+                 |     |
|     |  | Guard 2: Verify (checkedIn === false)             | -> NO -> 409   |     |
|     |  +--------------------------------------------------+        REJECT   |     |
|     |                          | YES                                        |     |
|     |                          v                                            |     |
|     |  +--------------------------------------------------+                 |     |
|     |  | Guard 3: Check (currentAttendance >= Capacity)   |                 |     |
|     |  +--------------------------------------------------+                 |     |
|     |          |                              |                             |     |
|     |        NO (< Cap)                    YES (>= Cap)                     |     |
|     |          |                              |                             |     |
|     |          v                              v                             |     |
|     |     Commit Entry                   Commit Entry                       |     |
|     |  overCapacityFlag = false       overCapacityFlag = true               |     |
|     |   (Status: 200 OK)               (Status: 200 OK with Siren Alert)    |     |
|     +-----------------------------------------------------------------------+     |
|                                                                                   |
|  3. Real-Time Dual-Metric Risk Calculation Engine                                 |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------------+
|                     DATABASE & PERSISTENCE LAYER (database.json)                  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  /events/{eventId}                  -> { name, venue, hallCapacity, dateTime }   |
|  /registrations/{eventId}/{stuId}   -> { name, studentId, email, checkedIn }     |
|  /history/{eventId}/{timestamp}     -> { studentId, action, overCapacityFlag }   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Mathematical Occupancy & Risk Logic

Traditional systems calculate a single generic percentage. This system establishes a **Decoupled Dual-Metric Model** distinguishing pre-event demand pressure from physical live space occupancy.

### 3.1 Mathematical Formulations

#### Metric 1: Registration Load Ratio ($R_{\text{load}}$)
$$R_{\text{load}} = \left( \frac{\text{expectedAttendance}}{\text{hallCapacity}} \right) \times 100$$
Where:
- $\text{expectedAttendance}$ is the total cardinality of the registered attendee set:
  $$\text{expectedAttendance} = |\mathcal{R}_{\text{event}}|$$
- $\text{hallCapacity}$ is the maximum permissible venue seating threshold.

#### Metric 2: Live Gate Occupancy Percentage ($O_{\text{live}}$)
$$O_{\text{live}} = \left( \frac{\text{currentAttendance}}{\text{hallCapacity}} \right) \times 100$$
Where:
- $\text{currentAttendance}$ is the count of verified entries:
  $$\text{currentAttendance} = |\{ r \in \mathcal{R}_{\text{event}} \mid r.\text{checkedIn} = \text{true} \}|$$

#### Metric 3: Live Seat Availability ($S_{\text{avail}}$)
$$S_{\text{avail}} = \max\left(0, \; \text{hallCapacity} - \text{currentAttendance}\right)$$

### 3.2 Discrete Risk Band Mapping Function
Both percentages map to four discrete operational risk bands defined by piecewise function $f(p)$:

$$f(p) = 
\begin{cases} 
\text{"Low Risk"}, & 0\% \le p \le 50\% \\
\text{"Moderate Risk"}, & 51\% \le p \le 80\% \\
\text{"High Risk"}, & 81\% \le p \le 100\% \\
\text{"Overbooked / Overcrowded"}, & p > 100\%
\end{cases}$$

### 3.3 Comparative Decision Matrix
| Condition | Pre-Event Band | Live Gate Band | Operational Decision |
|---|---|---|---|
| Early registration phase | Low Risk ($\le 50\%$) | Low Risk ($\le 50\%$) | Normal operations, continue registrations. |
| High pre-registration demand | Overbooked ($> 100\%$) | Moderate Risk ($60\%$) | Overbooking absorbed by natural no-show rate. Keep doors open. |
| Critical live gate influx | Moderate Risk ($75\%$) | High Risk ($90\%$) | Alert hallway security, transition Public Seat Board to "Limited Seats". |
| Venue limit reached | Any | Overcrowded ($> 100\%$) | Fire-hazard alert triggered. Gatekeeper dashboard raises audible siren alert. |

---

## 4. Sequential Guard Clauses & State Integrity

The `checkInStudent(eventId, studentId)` function guarantees database atomicity by processing admissions through three ordered barriers:

### Guard 1: Registration Roster Membership
- **Condition:** $\text{studentId} \notin \mathcal{R}_{\text{event}}$
- **Resolution:** Throws HTTP 404 with error code `NOT_REGISTERED`.
- **Justification:** Prevents unauthorized walk-ins who did not complete institutional registration.

### Guard 2: Idempotent Anti-Passback Validation
- **Condition:** $\text{registration}.\text{checkedIn} === \text{true}$
- **Resolution:** Throws HTTP 409 Conflict with code `ALREADY_CHECKED_IN` and returns previous `checkedInAt` timestamp.
- **Justification:** Blocks badge-passing fraud where an admitted student texts their QR code or student ID to another student outside.

### Guard 3: Non-Destructive Capacity Overflow Handling
- **Condition:** $\text{currentAttendance} \ge \text{hallCapacity}$
- **Resolution:** Permits admission, increments counter, writes to history audit log, and returns payload with `overCapacityFlag = true`.
- **Justification:** In collegiate settings, organizers frequently allow 5–10 VIP attendees or key faculty beyond nominal hall capacity. Rejecting them at the gate causes physical friction. Guard 3 allows the admission while immediately alerting organizers through visual badges and synthesizer sirens.

---

## 5. Offline Resilience & Browser LocalStorage Queuing

### 5.1 The Offline Threat Model
Auditorium entrances (often in basements or reinforced concrete structures) frequently suffer signal degradation when crowded with hundreds of students.

### 5.2 Programmatic Fallback Architecture
1. **Network Disruption Interception:** The client API wraps every check-in request in a try-catch block and inspects `navigator.onLine`.
2. **LocalStorage Buffering:** When offline, the payload `{ studentId, queuedAt }` is serialized into `localStorage` under `CROWD_OFFLINE_QUEUE_{eventId}`.
3. **Optimistic Local Response:** The Gatekeeper UI displays an amber "OFFLINE BUFFERED" toast and increments local gate admission tallies.
4. **Automatic Flush on Reconnect:**
   - Event listeners on `window.addEventListener('online')` automatically trigger `syncQueue(eventId)`.
   - The client dispatches a batch payload to `POST /api/events/:eventId/checkin/batch`.
5. **Server Idempotency Guarantee:** The batch endpoint processes each item sequentially through `attendanceEngine.js`. Any entry that was already recorded is classified as `alreadyCheckedIn` without duplicating metrics or corrupting counts.

---

## 6. Edge Case & Failure Recovery Strategies

| Failure Scenario | Technical Strategy & Recovery Mechanism |
|---|---|
| **Mid-Event Hall Capacity Change** | Organizers can adjust capacity via `PATCH /api/events/:eventId/capacity`. The server recalculates `occupancyPercentage`, `registrationLoadRatio`, and both risk bands in the same execution cycle, broadcasting updated values to all polling monitors within 3 seconds. |
| **Rapid Double-Scan on Camera** | The HTML5 QR scanner introduces a 2000ms client-side debouncing cooldown (`scanCooldown = true`), preventing repeated frame captures of the same QR ticket. |
| **Camera Hardware Failure** | The gatekeeper view features a side-by-side auto-focused manual ID entry field with keyboard `Enter` listener, ensuring zero gate interruption if webcams malfunction. |
| **Simulated Offline Verification** | Evaluators and testers can click the "Test Offline" button in the gatekeeper view, toggling the client network simulation state to inspect `localStorage` queuing without disconnecting local networks. |

---

## 7. System Advantages & Limitations

### 7.1 Advantages
- **Zero Sensor Hardware Cost:** Eliminates thousands of dollars in infrared break-beams, LiDAR scanners, or RFID turnstiles.
- **Microsecond Latency:** Pure software computation runs in $< 5\text{ms}$ on commodity hardware.
- **Audit Traceability:** Every gate event is logged in `/history/{eventId}/{timestamp}` with an explicit audit trail.
- **Multi-Role UX:** Dedicated screens for organizers (command), gatekeepers (speed), students (registration), and visitors (seat billboard).

### 7.2 Limitations
- **Exit Tracking Absence:** Without an exit gate terminal, the live occupancy counter models cumulative admissions rather than bidirectional net occupancy (admissions minus exits).
- **Physical Barrier Reliance:** Because the system operates on software verification, it relies on human gatekeepers to physically enforce admission rejections.

---

## 8. Future Scope

1. **Predictive Machine Learning No-Show Model:** Train a lightweight regression/classification model (e.g., Random Forest or Logistic Regression) using historical attendance data, day-of-week, event category, weather conditions, and registration lead time to forecast dynamic no-show percentages with $> 90\%$ accuracy.
2. **Automated Overflow Room Reassignment:** When `liveRiskBand` reaches "High Risk", the system can automatically trigger live streaming links to an adjacent spillover classroom and dynamically route walk-in students to the auxiliary hall.
3. **Hardware RFID / BLE Beacon Integration:** Extend the software check-in endpoints to accept webhooks from low-cost ESP32 microcontrollers with RC522 RFID card readers embedded into campus student ID cards.

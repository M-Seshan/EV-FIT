# EV-FIT

**Predict. Protect. Power the Future.**

An AI-powered Electric Vehicle Safety and Predictive Maintenance platform, built for **E-Mobility HackFest 2026**.

EV-FIT analyses vehicle telemetry in real time, detects abnormal patterns, calculates a dynamic 0–100 Safety Score, predicts likely maintenance needs, and raises early safety alerts — before a real fault becomes a real problem.

This preliminary-round prototype ships with a realistic **telemetry simulator** in place of physical sensors. The backend, AI layer, and dashboard are all built against a fixed telemetry data shape, so swapping the simulator for real ESP32/OBD-II hardware in the final round requires **no changes** to the API, database, or frontend.

---

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router DOM, Axios, Recharts, Lucide React, Socket.IO Client — JavaScript only, no TypeScript.

**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, dotenv, CORS.

**Simulator:** Node.js + Socket.IO, generating gradually-changing telemetry across 4 driving/fault modes.

**AI layer:** Explainable, rule-based JavaScript anomaly detection, trend analysis, and safety scoring (no black-box ML — every score can be explained deduction-by-deduction).

---

## Project Structure

```
ev-fit/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # MetricCard, LiveChart, SafetyScoreGauge, etc.
│       ├── pages/            # Dashboard, Live Monitoring, Battery Health, ...
│       ├── layouts/          # Sidebar, Header, AppLayout
│       ├── context/          # TelemetryContext (Socket.IO + REST state)
│       ├── services/         # api.js (Axios), socket.js (Socket.IO client)
│       └── utils/
├── server/                  # Express + Socket.IO backend
│   ├── controllers/
│   ├── routes/
│   ├── models/                # Vehicle, Telemetry, Alert, Maintenance, Analysis
│   ├── services/               # aiAnalysisService.js, alertService.js
│   ├── simulator/              # telemetrySimulator.js, simulatorManager.js
│   ├── middleware/
│   ├── utils/                  # db.js, seed.js
│   └── server.js
├── .env.example
└── README.md
```

---

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (or a MongoDB Atlas connection string)

---

## 1. Install

From the project root, install both apps:

```bash
cd server
npm install

cd ../client
npm install
```

## 2. Configure environment variables

```bash
cd ../server
cp ../.env.example .env
```

Edit `server/.env` if needed (defaults work for a local MongoDB):

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ev-fit
CLIENT_URL=http://localhost:5173
SIMULATOR_AUTOSTART=false
```

> No credentials are hardcoded anywhere in the codebase — everything sensitive is read from `.env`.

## 3. Run MongoDB

Make sure MongoDB is running locally, e.g.:

```bash
mongod --dbpath /path/to/your/db
```

Or point `MONGODB_URI` at a MongoDB Atlas cluster instead.

## 4. Run the backend

```bash
cd server
npm run dev
```

You should see:

```
[db] Connected to MongoDB at mongodb://localhost:27017/ev-fit
[seed] Created default vehicle: EV-001
[server] EV-FIT API listening on http://localhost:5000
```

Verify it's alive: `GET http://localhost:5000/api/health`

## 5. Run the frontend

In a second terminal:

```bash
cd client
npm run dev
```

Open **http://localhost:5173**.

## 6. Start the simulator

Go to the **Simulator** page in the dashboard and click **Start Simulation**. Try switching between **Normal**, **Realistic Drive**, **Warning**, and **Critical** modes to see the Safety Score, alerts, and predictive maintenance recommendations respond live.

(Alternatively, set `SIMULATOR_AUTOSTART=true` in `server/.env` to have it start automatically with the backend.)

---

## How the pieces fit together

```
EV Simulator
      ↓
Simulated Telemetry (identical shape to real hardware payloads)
      ↓
Node.js / Express Backend
      ↓
Socket.IO  (telemetry:update, analysis:update, alert:new, maintenance:new)
      ↓
AI / Anomaly Detection  (server/services/aiAnalysisService.js)
      ↓
MongoDB
      ↓
React Dashboard
```

### Telemetry data shape

Every reading — simulated or real — follows this shape:

```json
{
  "vehicleId": "EV-001",
  "timestamp": "2026-09-04T10:00:00Z",
  "soc": 82,
  "soh": 91,
  "voltage": 387,
  "current": 42,
  "batteryTemperature": 34,
  "motorTemperature": 52,
  "speed": 48,
  "chargingStatus": false
}
```

### Future hardware integration

Once real hardware (ESP32 + temperature/voltage/current sensors, optionally GPS/OBD-II) is available, it simply `POST`s the same JSON shape to:

```
POST /api/telemetry
```

That endpoint runs through the exact same AI analysis → database → Socket.IO pipeline the simulator uses today (see `server/simulator/simulatorManager.js`), so the frontend never needs to know or care where the data came from.

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/vehicles` | List vehicles |
| GET | `/api/vehicles/:id` | Get a vehicle |
| GET | `/api/telemetry/latest?vehicleId=EV-001` | Latest telemetry reading |
| GET | `/api/telemetry/history?vehicleId=EV-001&limit=100` | Telemetry history |
| POST | `/api/telemetry` | Submit a telemetry reading (simulator or real hardware) |
| GET | `/api/alerts?vehicleId=EV-001&severity=HIGH` | List alerts |
| PATCH | `/api/alerts/:id/acknowledge` | Acknowledge an alert |
| GET | `/api/maintenance?vehicleId=EV-001` | Predictive maintenance history |
| GET | `/api/analysis/:vehicleId` | Latest AI analysis |
| GET | `/api/analysis/:vehicleId/history` | AI analysis history |
| GET | `/api/simulator/status` | Simulator status |
| POST | `/api/simulator/start` \| `/stop` \| `/reset` | Simulator playback control |
| POST | `/api/simulator/mode` `{ "mode": "CRITICAL" }` | Change simulation mode |
| POST | `/api/simulator/speed` `{ "speedMultiplier": 2 }` | Change simulation speed |
| POST | `/api/simulator/override` `{ "field": "batteryTemperature", "value": 55 }` | Manually pin a value |
| POST | `/api/simulator/override/clear` | Clear all manual overrides |

## Socket.IO Events (server → client)

| Event | Payload |
|---|---|
| `telemetry:update` | Latest telemetry reading + safety score |
| `analysis:update` | Full AI analysis result (risk level, score, anomalies, predictions, recommendations) |
| `alert:new` | A newly created alert |
| `maintenance:new` | A newly created maintenance prediction |
| `simulator:status` | Current simulator running/mode/speed state |

---

## Notes

- This prototype's safety scoring and anomaly detection are for **demonstration purposes only** and are **not certified for real-world automotive safety decisions**.
- The AI layer is deliberately rule-based (thresholds + trend analysis) rather than a black-box model, so every score and alert can be explained to hackathon judges in plain terms.

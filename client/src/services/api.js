import axios from "axios";

// The frontend is deliberately data-source-agnostic: it doesn't know or care
// whether telemetry originated from the simulator or from real ESP32/OBD-II
// hardware — it only talks to this REST/Socket.IO API.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const DEFAULT_VEHICLE_ID = "EV-001";

// Vehicles
export const getVehicles = () => api.get("/vehicles").then((r) => r.data.data);
export const getVehicle = (id) => api.get(`/vehicles/${id}`).then((r) => r.data.data);

// Telemetry
export const getLatestTelemetry = (vehicleId = DEFAULT_VEHICLE_ID) =>
  api.get("/telemetry/latest", { params: { vehicleId } }).then((r) => r.data.data);

export const getTelemetryHistory = (params = {}) =>
  api.get("/telemetry/history", { params: { vehicleId: DEFAULT_VEHICLE_ID, ...params } }).then((r) => r.data.data);

// Alerts
export const getAlerts = (params = {}) =>
  api.get("/alerts", { params: { vehicleId: DEFAULT_VEHICLE_ID, ...params } }).then((r) => r.data.data);

export const acknowledgeAlert = (id) => api.patch(`/alerts/${id}/acknowledge`).then((r) => r.data.data);

// Maintenance
export const getMaintenance = (params = {}) =>
  api.get("/maintenance", { params: { vehicleId: DEFAULT_VEHICLE_ID, ...params } }).then((r) => r.data.data);

// Analysis
export const getLatestAnalysis = (vehicleId = DEFAULT_VEHICLE_ID) =>
  api.get(`/analysis/${vehicleId}`).then((r) => r.data.data);

export const getAnalysisHistory = (vehicleId = DEFAULT_VEHICLE_ID, params = {}) =>
  api.get(`/analysis/${vehicleId}/history`, { params }).then((r) => r.data.data);

// Simulator control
export const getSimulatorStatus = () => api.get("/simulator/status").then((r) => r.data.data);
export const startSimulator = () => api.post("/simulator/start").then((r) => r.data.data);
export const stopSimulator = () => api.post("/simulator/stop").then((r) => r.data.data);
export const resetSimulator = () => api.post("/simulator/reset").then((r) => r.data.data);
export const setSimulatorMode = (mode) => api.post("/simulator/mode", { mode }).then((r) => r.data.data);
export const setSimulatorSpeed = (speedMultiplier) =>
  api.post("/simulator/speed", { speedMultiplier }).then((r) => r.data.data);
export const setManualOverride = (field, value) =>
  api.post("/simulator/override", { field, value }).then((r) => r.data);
export const clearManualOverrides = () => api.post("/simulator/override/clear").then((r) => r.data);

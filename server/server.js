import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { connectDB } from "./utils/db.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { SimulatorManager } from "./simulator/simulatorManager.js";
import { ensureDefaultVehicle } from "./utils/seed.js";

import healthRoutes from "./routes/healthRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import telemetryRoutes from "./routes/telemetryRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import simulatorRoutes from "./routes/simulatorRoutes.js";

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Simulator manager (shared between REST controllers and Socket.IO)
// ---------------------------------------------------------------------------
const simulatorManager = new SimulatorManager(io);
app.set("simulatorManager", simulatorManager);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api/health", healthRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/simulator", simulatorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Socket.IO
// ---------------------------------------------------------------------------
io.on("connection", (socket) => {
  console.log(`[socket] Client connected: ${socket.id}`);

  // Immediately send current simulator status so the UI can sync on load
  socket.emit("simulator:status", simulatorManager.getStatus());

  socket.on("disconnect", () => {
    console.log(`[socket] Client disconnected: ${socket.id}`);
  });
});

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
async function start() {
  await connectDB();
  await ensureDefaultVehicle();

  if (process.env.SIMULATOR_AUTOSTART === "true") {
    simulatorManager.start();
    console.log("[simulator] Auto-started (SIMULATOR_AUTOSTART=true)");
  }

  server.listen(PORT, () => {
    console.log(`[server] EV-FIT API listening on http://localhost:${PORT}`);
    console.log(`[server] Accepting connections from ${CLIENT_URL}`);
  });
}

start().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("\n[server] Shutting down...");
  simulatorManager.stop();
  server.close(() => process.exit(0));
});

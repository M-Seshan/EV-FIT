import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../services/socket.js";
import { getLatestTelemetry, getTelemetryHistory, getLatestAnalysis, getAlerts, getSimulatorStatus } from "../services/api.js";

const TelemetryContext = createContext(null);

const CHART_HISTORY_LIMIT = 40;

export function TelemetryProvider({ children }) {
  const [connected, setConnected] = useState(socket.connected);
  const [telemetry, setTelemetry] = useState(null);
  const [chartHistory, setChartHistory] = useState([]); // rolling window for live charts
  const [analysis, setAnalysis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [simulatorStatus, setSimulatorStatus] = useState(null);
  const initialized = useRef(false);

  // Initial REST load so the dashboard isn't empty before the first socket tick
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const [latest, history, latestAnalysis, recentAlerts, simStatus] = await Promise.all([
          getLatestTelemetry().catch(() => null),
          getTelemetryHistory({ limit: CHART_HISTORY_LIMIT }).catch(() => []),
          getLatestAnalysis().catch(() => null),
          getAlerts({ limit: 10 }).catch(() => []),
          getSimulatorStatus().catch(() => null),
        ]);
        if (latest) setTelemetry(latest);
        if (history?.length) setChartHistory(history);
        if (latestAnalysis) setAnalysis(latestAnalysis);
        if (recentAlerts?.length) setAlerts(recentAlerts);
        if (simStatus) setSimulatorStatus(simStatus);
      } catch (err) {
        console.error("Initial data load failed:", err.message);
      }
    })();
  }, []);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onTelemetryUpdate = (reading) => {
      setTelemetry(reading);
      setChartHistory((prev) => {
        const next = [...prev, reading];
        if (next.length > CHART_HISTORY_LIMIT) next.shift();
        return next;
      });
    };

    const onAnalysisUpdate = (result) => setAnalysis(result);

    const onAlertNew = (alert) => setAlerts((prev) => [alert, ...prev].slice(0, 50));

    const onSimulatorStatus = (status) => setSimulatorStatus(status);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("telemetry:update", onTelemetryUpdate);
    socket.on("analysis:update", onAnalysisUpdate);
    socket.on("alert:new", onAlertNew);
    socket.on("simulator:status", onSimulatorStatus);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("telemetry:update", onTelemetryUpdate);
      socket.off("analysis:update", onAnalysisUpdate);
      socket.off("alert:new", onAlertNew);
      socket.off("simulator:status", onSimulatorStatus);
    };
  }, []);

  const refreshSimulatorStatus = useCallback(async () => {
    try {
      const status = await getSimulatorStatus();
      setSimulatorStatus(status);
    } catch (err) {
      console.error("Failed to refresh simulator status:", err.message);
    }
  }, []);

  const value = {
    connected,
    telemetry,
    chartHistory,
    analysis,
    alerts,
    simulatorStatus,
    refreshSimulatorStatus,
  };

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetry must be used within a TelemetryProvider");
  return ctx;
}

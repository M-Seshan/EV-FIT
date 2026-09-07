import React, { useEffect, useState, useCallback } from "react";
import { useTelemetry } from "../context/TelemetryContext.jsx";
import { getAlerts, acknowledgeAlert } from "../services/api.js";
import AlertRow from "../components/AlertRow.jsx";

const SEVERITIES = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function Alerts() {
  const { alerts: liveAlerts } = useTelemetry();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getAlerts({ limit: 100, ...(filter !== "ALL" ? { severity: filter } : {}) })
      .then(setAlerts)
      .catch((err) => console.error("Failed to load alerts:", err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the list fresh as new alerts stream in via socket
  useEffect(() => {
    if (liveAlerts.length === 0) return;
    setAlerts((prev) => {
      const existingIds = new Set(prev.map((a) => a._id));
      const merged = [...liveAlerts.filter((a) => !existingIds.has(a._id)), ...prev];
      return filter === "ALL" ? merged.slice(0, 100) : merged.filter((a) => a.severity === filter).slice(0, 100);
    });
  }, [liveAlerts]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAcknowledge = async (id) => {
    try {
      const updated = await acknowledgeAlert(id);
      setAlerts((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (err) {
      console.error("Failed to acknowledge alert:", err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-100">Alerts</h1>
          <p className="text-sm text-ink-500 mt-1">Warnings and critical events across every telemetry parameter.</p>
        </div>
        <div className="flex gap-1.5">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === s
                  ? "border-volt-500/40 text-volt-400 bg-volt-500/10"
                  : "border-base-700 text-ink-500 hover:text-ink-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="panel p-5">
        {loading ? (
          <p className="text-sm text-ink-500 py-6 text-center">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-ink-500 py-10 text-center">No alerts found for this filter.</p>
        ) : (
          alerts.map((a) => <AlertRow key={a._id} alert={a} onAcknowledge={handleAcknowledge} />)
        )}
      </div>
    </div>
  );
}

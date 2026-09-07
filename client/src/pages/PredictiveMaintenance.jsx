import React, { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext.jsx";
import { getMaintenance } from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

function priorityToSeverity(priority) {
  return { LOW: "LOW", MEDIUM: "MEDIUM", HIGH: "HIGH" }[priority] || "LOW";
}

export default function PredictiveMaintenance() {
  const { analysis } = useTelemetry();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaintenance({ limit: 30 })
      .then(setHistory)
      .catch((err) => console.error("Failed to load maintenance history:", err.message))
      .finally(() => setLoading(false));
  }, []);

  // Merge the live analysis maintenance items on top so the page reflects
  // the very latest prediction even before the DB write round-trips back.
  const liveItems = analysis?.maintenanceItems || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-100">Predictive Maintenance</h1>
        <p className="text-sm text-ink-500 mt-1">Trend-based predictions, not single-reading alerts.</p>
      </div>

      {liveItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveItems.map((item, i) => (
            <div key={i} className="panel p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wrench size={15} className="text-volt-400" />
                  <span className="text-sm font-medium text-ink-100">{item.issue}</span>
                </div>
                <StatusBadge level={priorityToSeverity(item.priority)} />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-ink-500">Risk</span>
                <div className="flex-1 h-1.5 rounded-full bg-base-700 overflow-hidden">
                  <div className="h-full rounded-full bg-signal-risk" style={{ width: `${item.risk}%` }} />
                </div>
                <span className="text-xs text-ink-300 font-mono">{item.risk}%</span>
              </div>
              <p className="text-xs text-ink-300 mt-2">{item.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {liveItems.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="text-sm text-ink-500">No maintenance issues predicted right now. Vehicle trends look healthy.</p>
        </div>
      )}

      <div className="panel p-5">
        <h3 className="text-sm font-medium text-ink-100 mb-3">Maintenance History</h3>
        {loading ? (
          <p className="text-sm text-ink-500 py-4">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-ink-500 py-4 text-center">No maintenance predictions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-500 text-xs border-b border-base-700">
                  <th className="pb-2 pr-4">Issue</th>
                  <th className="pb-2 pr-4">Priority</th>
                  <th className="pb-2 pr-4">Risk</th>
                  <th className="pb-2 pr-4">Recommendation</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((m) => (
                  <tr key={m._id} className="border-b border-base-700/60 last:border-0">
                    <td className="py-2 pr-4 text-ink-100">{m.issue}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge level={priorityToSeverity(m.priority)} />
                    </td>
                    <td className="py-2 pr-4 font-mono text-ink-300">{m.risk}%</td>
                    <td className="py-2 pr-4 text-ink-300">{m.recommendation}</td>
                    <td className="py-2 text-ink-500 text-xs">{new Date(m.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { getTelemetryHistory } from "../services/api.js";
import LiveChart from "../components/LiveChart.jsx";

const LIMIT_OPTIONS = [50, 100, 250, 500];

export default function TelemetryHistory() {
  const [history, setHistory] = useState([]);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTelemetryHistory({ limit })
      .then(setHistory)
      .catch((err) => console.error("Failed to load telemetry history:", err.message))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-100">Telemetry History</h1>
          <p className="text-sm text-ink-500 mt-1">Stored readings from MongoDB — simulator or real hardware.</p>
        </div>
        <div className="flex gap-1.5">
          {LIMIT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setLimit(n)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                limit === n ? "border-volt-500/40 text-volt-400 bg-volt-500/10" : "border-base-700 text-ink-500 hover:text-ink-300"
              }`}
            >
              Last {n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart title="Battery Temperature" data={history} dataKey="batteryTemperature" unit="°C" color="#FF8A3D" />
        <LiveChart title="Voltage" data={history} dataKey="voltage" unit="V" color="#22D3C4" />
        <LiveChart title="SOC" data={history} dataKey="soc" unit="%" color="#3DDC84" />
        <LiveChart title="Speed" data={history} dataKey="speed" unit=" km/h" color="#F5B92E" />
      </div>

      <div className="panel p-5">
        <h3 className="text-sm font-medium text-ink-100 mb-3">Raw Readings</h3>
        {loading ? (
          <p className="text-sm text-ink-500 py-6 text-center">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-ink-500 py-6 text-center">No telemetry recorded yet. Start the simulator.</p>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-base-900">
                <tr className="text-left text-ink-500 text-xs border-b border-base-700">
                  <th className="pb-2 pr-4">Time</th>
                  <th className="pb-2 pr-4">SOC</th>
                  <th className="pb-2 pr-4">SOH</th>
                  <th className="pb-2 pr-4">Voltage</th>
                  <th className="pb-2 pr-4">Current</th>
                  <th className="pb-2 pr-4">Batt Temp</th>
                  <th className="pb-2 pr-4">Motor Temp</th>
                  <th className="pb-2">Speed</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((t, i) => (
                  <tr key={t._id || i} className="border-b border-base-700/60 last:border-0 text-ink-300">
                    <td className="py-2 pr-4 text-xs text-ink-500">{new Date(t.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2 pr-4 font-mono">{t.soc}%</td>
                    <td className="py-2 pr-4 font-mono">{t.soh}%</td>
                    <td className="py-2 pr-4 font-mono">{t.voltage}V</td>
                    <td className="py-2 pr-4 font-mono">{t.current}A</td>
                    <td className="py-2 pr-4 font-mono">{t.batteryTemperature}°C</td>
                    <td className="py-2 pr-4 font-mono">{t.motorTemperature}°C</td>
                    <td className="py-2 font-mono">{t.speed} km/h</td>
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

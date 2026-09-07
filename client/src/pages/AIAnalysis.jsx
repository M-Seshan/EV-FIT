import React from "react";
import { BrainCircuit, AlertOctagon } from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext.jsx";
import SafetyScoreGauge from "../components/SafetyScoreGauge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function AIAnalysis() {
  const { analysis } = useTelemetry();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-100">AI Analysis</h1>
        <p className="text-sm text-ink-500 mt-1">
          Rule-based, explainable anomaly detection over live telemetry and recent history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="panel p-6 flex flex-col items-center justify-center">
          <SafetyScoreGauge score={analysis?.safetyScore ?? 100} status={analysis?.status ?? "GOOD"} />
        </div>

        <div className="lg:col-span-2 panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit size={16} className="text-volt-400" />
            <h3 className="text-sm font-medium text-ink-100">Current Risk Assessment</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-ink-500">Risk Level</span>
            <StatusBadge level={analysis?.riskLevel || "LOW"} size="lg" />
          </div>

          {analysis?.deductions?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-ink-500 mb-2">Score Breakdown</p>
              <div className="space-y-1.5">
                {analysis.deductions.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-base-800/60 rounded-lg px-3 py-2">
                    <span className="text-ink-300">{d.reason}</span>
                    <span className="text-signal-risk font-mono">-{d.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-ink-500 mb-2">Recommendations</p>
          <ul className="space-y-1.5">
            {(analysis?.recommendations?.length ? analysis.recommendations : ["No action required. Continue normal operation."]).map(
              (r, i) => (
                <li key={i} className="text-sm text-ink-300 flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-volt-400 mt-2 shrink-0" />
                  {r}
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertOctagon size={16} className="text-volt-400" />
          <h3 className="text-sm font-medium text-ink-100">Detected Anomalies</h3>
        </div>

        {!analysis?.anomalies?.length ? (
          <p className="text-sm text-ink-500 py-6 text-center">Normal battery behaviour. No anomalies detected.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.anomalies.map((a, i) => (
              <div key={i} className="border border-base-700 rounded-xl p-4 bg-base-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-ink-100">{a.type}</span>
                  <StatusBadge level={a.severity} />
                </div>
                <p className="text-xs text-ink-500 mb-2">{a.message}</p>
                <div className="w-full h-1.5 rounded-full bg-base-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-signal-risk"
                    style={{ width: `${a.risk}%` }}
                  />
                </div>
                <span className="text-[11px] text-ink-500 mt-1 inline-block">Risk: {a.risk}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-ink-500">
        This prototype's analysis is for demonstration purposes only and is not certified for real-world automotive safety decisions.
      </p>
    </div>
  );
}

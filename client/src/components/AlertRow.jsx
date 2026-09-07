import React from "react";
import { AlertTriangle } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function AlertRow({ alert, onAcknowledge }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-base-700 last:border-0">
      <div className="mt-0.5 shrink-0">
        <AlertTriangle size={16} className="text-signal-warn" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-ink-100 font-medium">{alert.title}</p>
          <StatusBadge level={alert.severity} />
        </div>
        <p className="text-xs text-ink-500 mt-1">
          {alert.parameter}: {alert.currentValue ?? "—"} (threshold {alert.threshold ?? "—"}) · {timeAgo(alert.createdAt || alert.timestamp)}
        </p>
        {alert.recommendation && <p className="text-xs text-ink-300 mt-1">{alert.recommendation}</p>}
      </div>
      {onAcknowledge && !alert.acknowledged && (
        <button
          onClick={() => onAcknowledge(alert._id)}
          className="text-[11px] text-volt-400 hover:text-volt-500 shrink-0 px-2 py-1 rounded-md border border-volt-500/30 hover:border-volt-500/50 transition-colors"
        >
          Acknowledge
        </button>
      )}
    </div>
  );
}

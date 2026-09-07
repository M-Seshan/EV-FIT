import React from "react";

/**
 * A single telemetry metric: label, big value, unit, optional trend icon and
 * optional status color (used to flag out-of-range readings at a glance).
 */
export default function MetricCard({ label, value, unit, icon: Icon, status = "normal", sub }) {
  const statusStyles = {
    normal: "text-ink-100",
    warn: "text-signal-warn",
    risk: "text-signal-risk",
    critical: "text-signal-critical",
  };

  return (
    <div className="panel p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-500 truncate">{label}</span>
        {Icon && <Icon size={15} className="text-ink-500 shrink-0" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`stat-value text-2xl ${statusStyles[status]}`}>
          {value === null || value === undefined || Number.isNaN(value) ? "—" : value}
        </span>
        {unit && <span className="text-xs text-ink-500">{unit}</span>}
      </div>
      {sub && <span className="text-[11px] text-ink-500">{sub}</span>}
    </div>
  );
}

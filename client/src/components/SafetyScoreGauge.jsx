import React from "react";

const STATUS_META = {
  EXCELLENT: { label: "SAFE", color: "#3DDC84" },
  GOOD: { label: "SAFE", color: "#3DDC84" },
  WARNING: { label: "WARNING", color: "#F5B92E" },
  HIGH_RISK: { label: "HIGH RISK", color: "#FF8A3D" },
  CRITICAL: { label: "CRITICAL", color: "#FF4D4D" },
};

export default function SafetyScoreGauge({ score = 0, status = "GOOD" }) {
  const meta = STATUS_META[status] || STATUS_META.GOOD;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#16263D" strokeWidth="12" />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={meta.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-semibold text-4xl text-ink-100">{Math.round(pct)}</span>
          <span className="text-xs text-ink-500">/ 100</span>
        </div>
      </div>
      <div
        className="px-3 py-1 rounded-full text-xs font-medium tracking-wide"
        style={{ color: meta.color, backgroundColor: `${meta.color}1A`, border: `1px solid ${meta.color}40` }}
      >
        {meta.label}
      </div>
    </div>
  );
}

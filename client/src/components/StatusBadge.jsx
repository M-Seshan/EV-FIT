import React from "react";

const SEVERITY_COLORS = {
  LOW: { color: "#3DDC84" },
  MEDIUM: { color: "#F5B92E" },
  HIGH: { color: "#FF8A3D" },
  CRITICAL: { color: "#FF4D4D" },
};

export default function StatusBadge({ level, size = "sm" }) {
  const meta = SEVERITY_COLORS[level] || SEVERITY_COLORS.LOW;
  const sizeCls = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide ${sizeCls}`}
      style={{ color: meta.color, backgroundColor: `${meta.color}1A`, border: `1px solid ${meta.color}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {level}
    </span>
  );
}

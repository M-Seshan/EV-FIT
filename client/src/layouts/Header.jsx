import React from "react";
import { Wifi, WifiOff, Bell, ChevronDown } from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext.jsx";

export default function Header() {
  const { connected, alerts, telemetry } = useTelemetry();
  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="flex items-center justify-between px-5 lg:px-8 h-16 border-b border-base-700 bg-base-950/70 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-base-700 bg-base-900 text-sm text-ink-100 hover:border-base-600 transition-colors">
          <span className="w-2 h-2 rounded-full bg-volt-500" />
          {telemetry?.vehicleId || "EV-001"}
          <ChevronDown size={14} className="text-ink-500" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border ${
            connected
              ? "border-signal-safe/30 text-signal-safe bg-signal-safe/5"
              : "border-signal-critical/30 text-signal-critical bg-signal-critical/5"
          }`}
        >
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {connected ? "Live" : "Disconnected"}
        </div>

        <button className="relative p-2 rounded-lg hover:bg-base-800 transition-colors">
          <Bell size={18} className="text-ink-300" />
          {unacknowledged > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-signal-critical" />
          )}
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-base-700 to-base-600 border border-base-600 flex items-center justify-center text-xs font-medium text-ink-300">
          HF
        </div>
      </div>
    </header>
  );
}

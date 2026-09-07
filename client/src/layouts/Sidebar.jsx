import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  BatteryFull,
  BrainCircuit,
  Wrench,
  BellRing,
  History,
  SlidersHorizontal,
  Info,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/live", label: "Live Monitoring", icon: Activity },
  { to: "/battery", label: "Battery Health", icon: BatteryFull },
  { to: "/analysis", label: "AI Analysis", icon: BrainCircuit },
  { to: "/maintenance", label: "Predictive Maintenance", icon: Wrench },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/history", label: "Telemetry History", icon: History },
  { to: "/simulator", label: "Simulator", icon: SlidersHorizontal },
  { to: "/about", label: "About", icon: Info },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-base-700 bg-base-900/60 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-volt-400 to-volt-600 flex items-center justify-center shadow-glow">
          <ShieldCheck size={20} className="text-base-950" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="font-display font-semibold text-ink-100 text-lg">EV-FIT</p>
          <p className="text-[11px] text-ink-500 tracking-wide">Predict. Protect. Power the Future.</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-volt-500/10 text-volt-400 border border-volt-500/20"
                  : "text-ink-300 border border-transparent hover:bg-base-800 hover:text-ink-100"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-base-700 text-[11px] text-ink-500">
        E-Mobility HackFest 2026
      </div>
    </aside>
  );
}

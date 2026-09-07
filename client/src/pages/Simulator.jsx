import React, { useEffect, useState } from "react";
import { Play, Square, RotateCcw, Gauge, Thermometer, Zap, Navigation } from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext.jsx";
import {
  startSimulator,
  stopSimulator,
  resetSimulator,
  setSimulatorMode,
  setSimulatorSpeed,
  setManualOverride,
  clearManualOverrides,
} from "../services/api.js";

const MODES = [
  { id: "NORMAL", label: "Normal", color: "#3DDC84" },
  { id: "REALISTIC_DRIVE", label: "Realistic Drive", color: "#22D3C4" },
  { id: "WARNING", label: "Warning", color: "#F5B92E" },
  { id: "CRITICAL", label: "Critical", color: "#FF4D4D" },
];

const OVERRIDE_FIELDS = [
  { field: "batteryTemperature", label: "Battery Temperature", unit: "°C", min: 20, max: 70, icon: Thermometer },
  { field: "voltage", label: "Voltage", unit: "V", min: 300, max: 450, icon: Zap },
  { field: "current", label: "Current", unit: "A", min: 0, max: 160, icon: Gauge },
  { field: "speed", label: "Speed", unit: "km/h", min: 0, max: 140, icon: Navigation },
];

export default function Simulator() {
  const { simulatorStatus, refreshSimulatorStatus, telemetry } = useTelemetry();
  const [speed, setSpeed] = useState(1);
  const [overrides, setOverrides] = useState({});
  const [overrideEnabled, setOverrideEnabled] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (simulatorStatus?.speedMultiplier) setSpeed(simulatorStatus.speedMultiplier);
  }, [simulatorStatus?.speedMultiplier]);

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
      await refreshSimulatorStatus();
    } catch (err) {
      console.error("Simulator control failed:", err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleOverrideToggle = (field, checked, defaultValue) => {
    setOverrideEnabled((prev) => ({ ...prev, [field]: checked }));
    if (checked) {
      setOverrides((prev) => ({ ...prev, [field]: defaultValue }));
      setManualOverride(field, defaultValue).catch((err) => console.error(err.message));
    } else {
      setManualOverride(field, null).catch((err) => console.error(err.message));
    }
  };

  const handleOverrideChange = (field, value) => {
    setOverrides((prev) => ({ ...prev, [field]: value }));
    setManualOverride(field, value).catch((err) => console.error(err.message));
  };

  const isRunning = simulatorStatus?.running;
  const currentMode = simulatorStatus?.mode || "NORMAL";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-100">Simulator</h1>
        <p className="text-sm text-ink-500 mt-1">
          Generates realistic telemetry today; swap for ESP32/OBD-II hardware later with zero API changes.
        </p>
      </div>

      {/* Playback controls */}
      <div className="panel p-5 flex flex-wrap items-center gap-3">
        <button
          disabled={busy || isRunning}
          onClick={() => run(startSimulator)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-volt-500 text-base-950 text-sm font-medium hover:bg-volt-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Play size={15} /> Start Simulation
        </button>
        <button
          disabled={busy || !isRunning}
          onClick={() => run(stopSimulator)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-base-700 text-ink-100 text-sm font-medium hover:bg-base-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Square size={15} /> Stop Simulation
        </button>
        <button
          disabled={busy}
          onClick={() => run(resetSimulator)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-base-700 text-ink-300 text-sm font-medium hover:bg-base-800 disabled:opacity-40 transition-colors"
        >
          <RotateCcw size={15} /> Reset
        </button>

        <span className={`ml-auto text-xs px-3 py-1.5 rounded-full border ${isRunning ? "border-signal-safe/30 text-signal-safe" : "border-ink-500/30 text-ink-500"}`}>
          {isRunning ? "● Running" : "● Stopped"}
        </span>
      </div>

      {/* Mode selection */}
      <div className="panel p-5">
        <h3 className="text-sm font-medium text-ink-100 mb-3">Simulation Mode</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              disabled={busy}
              onClick={() => run(() => setSimulatorMode(m.id))}
              className="text-left p-4 rounded-xl border transition-colors disabled:opacity-40"
              style={{
                borderColor: currentMode === m.id ? m.color : "#16263D",
                backgroundColor: currentMode === m.id ? `${m.color}14` : "transparent",
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full inline-block mb-2" style={{ backgroundColor: m.color }} />
              <p className="text-sm font-medium text-ink-100">{m.label}</p>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-ink-500 mt-3">
          Switching to CRITICAL eases values in gradually (e.g. battery temperature climbs ~34°C → 55°C over successive
          ticks) rather than jumping instantly, so live demos look convincing.
        </p>
      </div>

      {/* Simulation speed */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-ink-100">Simulation Speed</h3>
          <span className="text-xs font-mono text-volt-400">{speed}×</span>
        </div>
        <input
          type="range"
          min="0.25"
          max="5"
          step="0.25"
          value={speed}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSpeed(val);
            setSimulatorSpeed(val).catch((err) => console.error(err.message));
          }}
          className="w-full accent-volt-500"
        />
        <div className="flex justify-between text-[10px] text-ink-500 mt-1">
          <span>0.25× (slower)</span>
          <span>5× (faster)</span>
        </div>
      </div>

      {/* Manual overrides */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-ink-100">Manual Control</h3>
          <button
            onClick={() => {
              setOverrideEnabled({});
              setOverrides({});
              clearManualOverrides().catch((err) => console.error(err.message));
            }}
            className="text-xs text-ink-500 hover:text-ink-300"
          >
            Clear all overrides
          </button>
        </div>
        <p className="text-xs text-ink-500 mb-4">
          Pin a value manually to demo a specific scenario; everything else keeps simulating normally.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OVERRIDE_FIELDS.map(({ field, label, unit, min, max, icon: Icon }) => {
            const enabled = !!overrideEnabled[field];
            const liveValue = telemetry?.[field];
            const value = overrides[field] ?? liveValue ?? min;
            return (
              <div key={field} className="p-4 rounded-xl border border-base-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-ink-100">
                    <Icon size={14} className="text-ink-500" />
                    {label}
                  </div>
                  <label className="flex items-center gap-2 text-xs text-ink-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleOverrideToggle(field, e.target.checked, liveValue ?? min)}
                      className="accent-volt-500"
                    />
                    Manual
                  </label>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step="1"
                  value={value}
                  disabled={!enabled}
                  onChange={(e) => handleOverrideChange(field, Number(e.target.value))}
                  className="w-full accent-volt-500 disabled:opacity-40"
                />
                <div className="flex justify-between text-[11px] text-ink-500 mt-1">
                  <span>{min}{unit}</span>
                  <span className="font-mono text-ink-300">
                    {value}
                    {unit}
                  </span>
                  <span>{max}{unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

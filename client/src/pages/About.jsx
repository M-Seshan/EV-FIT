import React from "react";
import { ShieldCheck, Cpu, GitBranch, Radio } from "lucide-react";

export default function About() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-ink-100">About EV-FIT</h1>
        <p className="text-sm text-ink-500 mt-1">Predict. Protect. Power the Future.</p>
      </div>

      <div className="panel p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-volt-400" />
          <h2 className="text-sm font-medium text-ink-100">What it does</h2>
        </div>
        <p className="text-sm text-ink-300 leading-relaxed">
          EV-FIT is an AI-powered EV safety and predictive maintenance platform. Instead of only showing an
          EV's current condition, it continuously analyses telemetry, detects abnormal patterns, calculates a
          dynamic safety score, predicts likely maintenance needs, and raises early safety warnings — all in real
          time.
        </p>
      </div>

      <div className="panel p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-volt-400" />
          <h2 className="text-sm font-medium text-ink-100">Current prototype</h2>
        </div>
        <p className="text-sm text-ink-300 leading-relaxed">
          For this hackathon round, there's no physical hardware yet, so a realistic telemetry simulator stands in
          for real sensors. It generates gradually-changing values across four modes — Normal, Realistic Drive,
          Warning, and Critical — that flow through the exact same AI analysis pipeline real data will use.
        </p>
      </div>

      <div className="panel p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Radio size={18} className="text-volt-400" />
          <h2 className="text-sm font-medium text-ink-100">Future hardware integration</h2>
        </div>
        <p className="text-sm text-ink-300 leading-relaxed">
          After selection for the final round, the simulator will be replaced with real ESP32-based hardware
          (temperature, voltage, and current sensors, with optional GPS and OBD-II) streaming to the same{" "}
          <code className="text-volt-400 bg-base-800 px-1.5 py-0.5 rounded text-xs">POST /api/telemetry</code>{" "}
          endpoint. Because the telemetry data shape is identical, the backend, AI layer, and dashboard require no
          changes.
        </p>
        <pre className="text-xs text-ink-500 bg-base-800/60 rounded-lg p-4 overflow-x-auto font-mono">
{`EV Sensors / OBD-II
      ↓
    ESP32
      ↓
 Wi-Fi / Bluetooth
      ↓
Node.js Backend
      ↓
AI / Anomaly Detection
      ↓
   MongoDB
      ↓
React Dashboard`}
        </pre>
      </div>

      <div className="panel p-6 space-y-4">
        <div className="flex items-center gap-2">
          <GitBranch size={18} className="text-volt-400" />
          <h2 className="text-sm font-medium text-ink-100">Built for</h2>
        </div>
        <p className="text-sm text-ink-300">E-Mobility HackFest 2026</p>
      </div>

      <p className="text-[11px] text-ink-500">
        This prototype is a hackathon demonstration and is not certified for real-world automotive safety
        decisions.
      </p>
    </div>
  );
}

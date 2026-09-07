import React from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LiveMonitoring from "./pages/LiveMonitoring.jsx";
import BatteryHealth from "./pages/BatteryHealth.jsx";
import AIAnalysis from "./pages/AIAnalysis.jsx";
import PredictiveMaintenance from "./pages/PredictiveMaintenance.jsx";
import Alerts from "./pages/Alerts.jsx";
import TelemetryHistory from "./pages/TelemetryHistory.jsx";
import Simulator from "./pages/Simulator.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/live" element={<LiveMonitoring />} />
        <Route path="/battery" element={<BatteryHealth />} />
        <Route path="/analysis" element={<AIAnalysis />} />
        <Route path="/maintenance" element={<PredictiveMaintenance />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/history" element={<TelemetryHistory />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

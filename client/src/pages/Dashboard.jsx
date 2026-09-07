import React from "react";
import { Link } from "react-router-dom";
import { Zap, Gauge, Thermometer, BatteryFull, TrendingUp, ShieldCheck, Wrench, ArrowRight } from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext.jsx";
import MetricCard from "../components/MetricCard.jsx";
import SafetyScoreGauge from "../components/SafetyScoreGauge.jsx";
import LiveChart from "../components/LiveChart.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import AlertRow from "../components/AlertRow.jsx";
import { statusFor } from "../utils/thresholds.js";

export default function Dashboard() {
  const { telemetry, chartHistory, analysis, alerts } = useTelemetry();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-100">Dashboard</h1>
        <p className="text-sm text-ink-500 mt-1">Real-time overview of vehicle {telemetry?.vehicleId || "EV-001"}</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Battery SOC"
          value={telemetry?.soc ?? "—"}
          unit="%"
          icon={BatteryFull}
          status={statusFor("soc", telemetry?.soc)}
        />
        <MetricCard
          label="Battery SOH"
          value={telemetry?.soh ?? "—"}
          unit="%"
          icon={TrendingUp}
          status={statusFor("soh", telemetry?.soh)}
        />
        <MetricCard
          label="Voltage"
          value={telemetry?.voltage ?? "—"}
          unit="V"
          icon={Zap}
          status={statusFor("voltage", telemetry?.voltage)}
        />
        <MetricCard
          label="Current"
          value={telemetry?.current ?? "—"}
          unit="A"
          icon={Gauge}
          status={statusFor("current", telemetry?.current)}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Battery Temperature"
          value={telemetry?.batteryTemperature ?? "—"}
          unit="°C"
          icon={Thermometer}
          status={statusFor("batteryTemperature", telemetry?.batteryTemperature)}
        />
        <MetricCard
          label="Motor Temperature"
          value={telemetry?.motorTemperature ?? "—"}
          unit="°C"
          icon={Thermometer}
          status={statusFor("motorTemperature", telemetry?.motorTemperature)}
        />
        <MetricCard label="Speed" value={telemetry?.speed ?? "—"} unit="km/h" icon={Gauge} />
        <MetricCard label="Estimated Range" value={telemetry?.estimatedRange ?? "—"} unit="km" icon={BatteryFull} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live chart */}
        <div className="lg:col-span-2">
          <LiveChart title="Battery Temperature (Live)" data={chartHistory} dataKey="batteryTemperature" unit="°C" color="#22D3C4" />
        </div>

        {/* Safety score */}
        <div className="panel p-5 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 self-start text-sm text-ink-300 font-medium">
            <ShieldCheck size={16} className="text-volt-400" />
            EV Safety Score
          </div>
          <SafetyScoreGauge score={analysis?.safetyScore ?? 100} status={analysis?.status ?? "GOOD"} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Analysis summary */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-ink-100">AI Analysis</h3>
            <Link to="/analysis" className="text-xs text-volt-400 hover:text-volt-500 flex items-center gap-1">
              Details <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-ink-500">Current Risk</span>
            <StatusBadge level={analysis?.riskLevel || "LOW"} />
          </div>
          <p className="text-sm text-ink-300">
            {analysis?.anomalies?.length ? `${analysis.anomalies.length} condition(s) detected.` : "Normal battery behaviour."}
          </p>
        </div>

        {/* Predictive maintenance summary */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-ink-100 flex items-center gap-2">
              <Wrench size={15} className="text-volt-400" /> Predictive Maintenance
            </h3>
            <Link to="/maintenance" className="text-xs text-volt-400 hover:text-volt-500 flex items-center gap-1">
              Details <ArrowRight size={12} />
            </Link>
          </div>
          <p className="text-xs text-ink-500 mb-1">Next Recommended Inspection</p>
          <p className="text-sm text-ink-100 mb-3">
            {analysis?.maintenanceItems?.[0]?.issue || "Battery cooling system"}
          </p>
          <StatusBadge level={analysis?.maintenanceItems?.length ? "MEDIUM" : "LOW"} />
          <span className="text-xs text-ink-500 ml-2">
            {analysis?.maintenanceItems?.length ? "Attention recommended" : "Normal"}
          </span>
        </div>

        {/* Recent alerts */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-ink-100">Recent Alerts</h3>
            <Link to="/alerts" className="text-xs text-volt-400 hover:text-volt-500 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-sm text-ink-500 py-6 text-center">No alerts yet.</p>
            ) : (
              alerts.slice(0, 4).map((a) => <AlertRow key={a._id || a.title + a.createdAt} alert={a} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

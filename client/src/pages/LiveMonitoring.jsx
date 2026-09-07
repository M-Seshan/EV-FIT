import React from "react";
import { Zap, Gauge, Thermometer, BatteryFull, TrendingUp, Navigation, PlugZap } from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext.jsx";
import MetricCard from "../components/MetricCard.jsx";
import LiveChart from "../components/LiveChart.jsx";
import { statusFor } from "../utils/thresholds.js";

export default function LiveMonitoring() {
  const { telemetry, chartHistory, connected } = useTelemetry();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-100">Live Monitoring</h1>
          <p className="text-sm text-ink-500 mt-1">Streaming telemetry updates over Socket.IO — no refresh needed.</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${connected ? "border-signal-safe/30 text-signal-safe" : "border-signal-critical/30 text-signal-critical"}`}>
          {connected ? "● Streaming" : "● Disconnected"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard label="SOC" value={telemetry?.soc ?? "—"} unit="%" icon={BatteryFull} status={statusFor("soc", telemetry?.soc)} />
        <MetricCard label="SOH" value={telemetry?.soh ?? "—"} unit="%" icon={TrendingUp} status={statusFor("soh", telemetry?.soh)} />
        <MetricCard label="Voltage" value={telemetry?.voltage ?? "—"} unit="V" icon={Zap} status={statusFor("voltage", telemetry?.voltage)} />
        <MetricCard label="Current" value={telemetry?.current ?? "—"} unit="A" icon={Gauge} status={statusFor("current", telemetry?.current)} />
        <MetricCard label="Speed" value={telemetry?.speed ?? "—"} unit="km/h" icon={Navigation} />
        <MetricCard
          label="Battery Temp"
          value={telemetry?.batteryTemperature ?? "—"}
          unit="°C"
          icon={Thermometer}
          status={statusFor("batteryTemperature", telemetry?.batteryTemperature)}
        />
        <MetricCard
          label="Motor Temp"
          value={telemetry?.motorTemperature ?? "—"}
          unit="°C"
          icon={Thermometer}
          status={statusFor("motorTemperature", telemetry?.motorTemperature)}
        />
        <MetricCard label="Charging" value={telemetry?.chargingStatus ? "Yes" : "No"} icon={PlugZap} />
        <MetricCard label="Est. Range" value={telemetry?.estimatedRange ?? "—"} unit="km" icon={BatteryFull} />
        <MetricCard label="Power" value={telemetry?.power ?? "—"} unit="kW" icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart title="Battery Temperature" data={chartHistory} dataKey="batteryTemperature" unit="°C" color="#FF8A3D" />
        <LiveChart title="Motor Temperature" data={chartHistory} dataKey="motorTemperature" unit="°C" color="#FF4D4D" />
        <LiveChart title="Voltage" data={chartHistory} dataKey="voltage" unit="V" color="#22D3C4" />
        <LiveChart title="Current" data={chartHistory} dataKey="current" unit="A" color="#4DE8D6" />
        <LiveChart title="Speed" data={chartHistory} dataKey="speed" unit=" km/h" color="#F5B92E" />
        <LiveChart title="State of Charge" data={chartHistory} dataKey="soc" unit="%" color="#3DDC84" />
      </div>
    </div>
  );
}

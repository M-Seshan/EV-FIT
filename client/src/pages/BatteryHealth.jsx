import React from "react";
import { BatteryFull, Zap, Gauge, Thermometer, RotateCcw, Navigation } from "lucide-react";
import { useTelemetry } from "../context/TelemetryContext.jsx";
import MetricCard from "../components/MetricCard.jsx";
import LiveChart from "../components/LiveChart.jsx";
import { statusFor } from "../utils/thresholds.js";

function conditionFromSoh(soh) {
  if (soh === null || soh === undefined) return { label: "—", color: "#7C8AA0" };
  if (soh >= 90) return { label: "EXCELLENT", color: "#3DDC84" };
  if (soh >= 80) return { label: "GOOD", color: "#3DDC84" };
  if (soh >= 65) return { label: "FAIR", color: "#F5B92E" };
  return { label: "POOR", color: "#FF4D4D" };
}

export default function BatteryHealth() {
  const { telemetry, chartHistory } = useTelemetry();
  const condition = conditionFromSoh(telemetry?.soh);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-100">Battery Health</h1>
        <p className="text-sm text-ink-500 mt-1">State of charge, state of health, and battery condition trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="panel p-6 flex flex-col items-center justify-center lg:col-span-1">
          <span className="text-xs text-ink-500 mb-1">Battery Health</span>
          <span className="font-display font-semibold text-5xl text-ink-100">{telemetry?.soh ?? "—"}%</span>
          <span
            className="mt-3 px-3 py-1 rounded-full text-xs font-medium"
            style={{ color: condition.color, backgroundColor: `${condition.color}1A`, border: `1px solid ${condition.color}40` }}
          >
            Condition: {condition.label}
          </span>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <MetricCard label="State of Charge" value={telemetry?.soc ?? "—"} unit="%" icon={BatteryFull} status={statusFor("soc", telemetry?.soc)} />
          <MetricCard label="State of Health" value={telemetry?.soh ?? "—"} unit="%" icon={BatteryFull} status={statusFor("soh", telemetry?.soh)} />
          <MetricCard
            label="Battery Temperature"
            value={telemetry?.batteryTemperature ?? "—"}
            unit="°C"
            icon={Thermometer}
            status={statusFor("batteryTemperature", telemetry?.batteryTemperature)}
          />
          <MetricCard label="Voltage" value={telemetry?.voltage ?? "—"} unit="V" icon={Zap} status={statusFor("voltage", telemetry?.voltage)} />
          <MetricCard label="Current" value={telemetry?.current ?? "—"} unit="A" icon={Gauge} status={statusFor("current", telemetry?.current)} />
          <MetricCard label="Charging Cycles" value={telemetry?.batteryCycleCount ?? "—"} icon={RotateCcw} />
          <MetricCard label="Estimated Range" value={telemetry?.estimatedRange ?? "—"} unit="km" icon={Navigation} />
          <MetricCard label="Charging Power" value={telemetry?.chargingPower ?? "—"} unit="kW" icon={Zap} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart title="State of Charge Trend" data={chartHistory} dataKey="soc" unit="%" color="#3DDC84" />
        <LiveChart title="State of Health Trend" data={chartHistory} dataKey="soh" unit="%" color="#22D3C4" />
      </div>
    </div>
  );
}

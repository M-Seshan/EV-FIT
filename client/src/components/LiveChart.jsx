import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

export default function LiveChart({ title, data, dataKey, unit = "", color = "#22D3C4", height = 220 }) {
  const chartData = (data || []).map((d) => ({ ...d, time: formatTime(d.timestamp) }));

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-ink-100">{title}</h3>
        {chartData.length > 0 && (
          <span className="text-xs text-ink-500 font-mono">
            {chartData[chartData.length - 1][dataKey]}
            {unit}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#16263D" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "#7C8AA0", fontSize: 10 }} axisLine={{ stroke: "#16263D" }} tickLine={false} minTickGap={30} />
          <YAxis tick={{ fill: "#7C8AA0", fontSize: 10 }} axisLine={{ stroke: "#16263D" }} tickLine={false} width={38} />
          <Tooltip
            contentStyle={{ background: "#0F1B2E", border: "1px solid #16263D", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#B9C4D4" }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useState } from "react";

const WIDTH = 700;
const HEIGHT = 220;
const PAD_L = 46;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 28;

export default function SalesChart({ data }) {
  const [hover, setHover] = useState(null);

  const max = Math.max(1, ...data.map((d) => d.total));
  const plotW = WIDTH - PAD_L - PAD_R;
  const plotH = HEIGHT - PAD_T - PAD_B;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: PAD_L + i * stepX,
    y: PAD_T + plotH - (d.total / max) * plotH,
    ...d,
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  return (
    <div className="sales-chart-wrap">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="sales-chart-svg" preserveAspectRatio="none">
        {yTicks.map((v, i) => {
          const y = PAD_T + plotH - (v / max) * plotH;
          return (
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={WIDTH - PAD_R} y2={y} stroke="var(--a-border)" strokeWidth="1" />
              <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--a-muted)">
                ₹{v >= 1000 ? `${Math.round(v / 1000)}K` : v}
              </text>
            </g>
          );
        })}

        <path d={path} fill="none" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={PAD_L + i * stepX - stepX / 2}
              y={PAD_T}
              width={stepX || plotW}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            <circle cx={p.x} cy={p.y} r={hover === i ? 5 : 3.5} fill="#fff" stroke="var(--ac)" strokeWidth="2" pointerEvents="none" />
            <text x={p.x} y={HEIGHT - 8} textAnchor="middle" fontSize="10" fill="var(--a-muted)">
              {new Date(p.day).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
            </text>
          </g>
        ))}
      </svg>

      {hover !== null && (
        <div
          className="sales-chart-tooltip"
          style={{
            left: `${(points[hover].x / WIDTH) * 100}%`,
            top: `${(points[hover].y / HEIGHT) * 100}%`,
          }}
        >
          <div className="sales-chart-tooltip-date">
            {new Date(points[hover].day).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
          </div>
          <div className="sales-chart-tooltip-value">₹{points[hover].total.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

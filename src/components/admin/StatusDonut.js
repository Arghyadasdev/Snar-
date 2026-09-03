const STATUS_COLOR = {
  pending: "#FFC107",
  processing: "#00C4D4",
  shipped: "#8B9CFF",
  delivered: "#4CD964",
  cancelled: "#FF6B6B",
};

export default function StatusDonut({ breakdown }) {
  const total = breakdown.reduce((sum, s) => sum + s.count, 0);

  let acc = 0;
  const stops = breakdown.map((s) => {
    const pct = total > 0 ? (s.count / total) * 100 : 0;
    const from = acc;
    acc += pct;
    return `${STATUS_COLOR[s.status]} ${from}% ${acc}%`;
  });

  const gradient = total > 0 ? `conic-gradient(${stops.join(", ")})` : "var(--a-border)";

  return (
    <div className="status-donut-row">
      <div className="status-donut" style={{ background: gradient }}>
        <div className="status-donut-hole">
          <div className="status-donut-total">{total}</div>
          <div className="status-donut-total-label">orders</div>
        </div>
      </div>
      <div className="status-donut-legend">
        {breakdown.map((s) => (
          <div key={s.status} className="status-donut-legend-row">
            <span className="status-donut-dot" style={{ background: STATUS_COLOR[s.status] }} />
            <span className="status-donut-legend-label">{s.status}</span>
            <span className="status-donut-legend-count">
              {s.count} {total > 0 ? `(${((s.count / total) * 100).toFixed(1)}%)` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

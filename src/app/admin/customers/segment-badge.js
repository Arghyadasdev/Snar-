const LABELS = {
  vip: "VIP",
  regular: "Regular",
  new: "New",
  inactive: "Inactive",
};

export default function SegmentBadge({ segment }) {
  if (!segment) return null;
  return <span className={`order-status segment-${segment}`}>{LABELS[segment]}</span>;
}

export function buildWhatsappOrderLink(whatsappNumber, items, total) {
  const lines = items.map((item, i) => {
    const attrs = [item.color && `Color: ${item.color}`, item.size && `Size: ${item.size}`].filter(Boolean).join(", ");
    return `${i + 1}. ${item.name}${attrs ? ` (${attrs})` : ""} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`;
  });

  const message = [
    "Hi SNAR! I'd like to order:",
    "",
    ...lines,
    "",
    `Total: ₹${total.toFixed(2)}`,
    "",
    "Please confirm availability and payment details.",
  ].join("\n");

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

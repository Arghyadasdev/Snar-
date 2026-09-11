import "server-only";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Shiprocket bearer tokens are valid ~10 days. Cache in module scope so warm
// invocations reuse it instead of logging in on every request.
let cachedToken = null;
let cachedTokenExpiry = 0;

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.token) {
    throw new Error(data?.message || "Shiprocket login failed");
  }
  cachedToken = data.token;
  cachedTokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
}

async function getToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) return cachedToken;
  return login();
}

async function shiprocketFetch(path, options = {}, retryOn401 = true) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401 && retryOn401) {
    cachedToken = null;
    return shiprocketFetch(path, options, false);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Shiprocket request failed (${res.status})`);
  }
  return data;
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts.shift() || fullName;
  return { first, last: parts.join(" ") || "." };
}

function formatOrderDate(isoDate) {
  return new Date(isoDate).toISOString().slice(0, 19).replace("T", " ");
}

// Creates (or, if called again with the same order id, updates) an adhoc
// order in Shiprocket. `order` is a DB orders row plus `items` (order_items
// rows) and `customerEmail`.
export async function createShiprocketOrder(order) {
  const { first, last } = splitName(order.shipping_name);
  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const weight = Number(process.env.SHIPROCKET_DEFAULT_ITEM_WEIGHT_KG || 0.3) * Math.max(totalUnits, 1);

  const payload = {
    order_id: order.id,
    order_date: formatOrderDate(order.created_at),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
    billing_customer_name: first,
    billing_last_name: last,
    billing_address: order.shipping_address,
    billing_city: order.shipping_city,
    billing_pincode: order.shipping_zip,
    billing_state: order.shipping_state,
    billing_country: "India",
    billing_email: order.customerEmail,
    billing_phone: order.shipping_phone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.product_name,
      sku: item.product_id || item.id,
      units: item.quantity,
      selling_price: item.unit_price,
    })),
    payment_method: "Prepaid",
    sub_total: Number(order.total),
    length: Number(process.env.SHIPROCKET_PACKAGE_LENGTH_CM || 20),
    breadth: Number(process.env.SHIPROCKET_PACKAGE_BREADTH_CM || 15),
    height: Number(process.env.SHIPROCKET_PACKAGE_HEIGHT_CM || 5),
    weight,
  };

  return shiprocketFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function trackShiprocketShipment(shipmentId) {
  return shiprocketFetch(`/courier/track/shipment/${shipmentId}`);
}

export async function cancelShiprocketOrder(shiprocketOrderId) {
  return shiprocketFetch("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: [shiprocketOrderId] }),
  });
}

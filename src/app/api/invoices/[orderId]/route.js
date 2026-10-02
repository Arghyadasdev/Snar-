import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#111" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  muted: { color: "#555" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  col: { flexDirection: "column", gap: 2 },
  heading: { fontSize: 9, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", color: "#555" },
  table: { marginTop: 10, borderWidth: 1, borderColor: "#ddd" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  trHead: { backgroundColor: "#f3f3f3", fontWeight: 700 },
  td: { padding: 5, borderRightWidth: 1, borderRightColor: "#ddd" },
  totals: { marginTop: 12, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalsRowBold: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderTopWidth: 1, borderTopColor: "#111", fontWeight: 700, marginTop: 4 },
});

const COLS = [
  { key: "no", w: "5%", label: "#" },
  { key: "name", w: "28%", label: "Item" },
  { key: "sku", w: "14%", label: "SKU" },
  { key: "hsn", w: "10%", label: "HSN" },
  { key: "qty", w: "8%", label: "Qty" },
  { key: "price", w: "12%", label: "Price" },
  { key: "total", w: "12%", label: "Amount" },
];

function InvoiceDocument({ order, items, settings }) {
  const isIntra = order.gst_type === "intra";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.title}>{settings?.seller_business_name || "SNAR"}</Text>
            {settings?.seller_address && <Text style={styles.muted}>{settings.seller_address}</Text>}
            {settings?.seller_gstin && <Text style={styles.muted}>GSTIN: {settings.seller_gstin}</Text>}
            {settings?.seller_pan && <Text style={styles.muted}>PAN: {settings.seller_pan}</Text>}
          </View>
          <View style={[styles.col, { alignItems: "flex-end" }]}>
            <Text style={{ fontSize: 14, fontWeight: 700 }}>TAX INVOICE</Text>
            <Text>Invoice No: {order.invoice_number}</Text>
            <Text>Date: {new Date(order.invoice_date).toLocaleDateString("en-IN")}</Text>
            <Text>Order: #{order.id.slice(0, 8)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.heading}>Bill To</Text>
            <Text>{order.shipping_name}</Text>
            <Text>{order.shipping_address}</Text>
            <Text>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</Text>
            <Text>Phone: {order.shipping_phone}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.heading}>Place of Supply</Text>
            <Text>{order.shipping_state}</Text>
            <Text style={{ marginTop: 8 }}>{isIntra ? "CGST + SGST (Intra-state)" : "IGST (Inter-state)"}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tr, styles.trHead]}>
            {COLS.map((c) => (
              <Text key={c.key} style={[styles.td, { width: c.w }]}>{c.label}</Text>
            ))}
          </View>
          {items.map((item, i) => (
            <View key={item.id} style={styles.tr}>
              <Text style={[styles.td, { width: "5%" }]}>{i + 1}</Text>
              <Text style={[styles.td, { width: "28%" }]}>
                {item.product_name}{item.color_name ? ` (${item.color_name})` : ""}{item.size ? ` / ${item.size}` : ""}
              </Text>
              <Text style={[styles.td, { width: "14%" }]}>{item.sku || "—"}</Text>
              <Text style={[styles.td, { width: "10%" }]}>{item.hsn_code || "—"}</Text>
              <Text style={[styles.td, { width: "8%" }]}>{item.quantity}</Text>
              <Text style={[styles.td, { width: "12%" }]}>Rs {Number(item.unit_price).toFixed(2)}</Text>
              <Text style={[styles.td, { width: "12%", borderRightWidth: 0 }]}>Rs {(item.unit_price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}><Text>Taxable Amount</Text><Text>Rs {Number(order.taxable_amount).toFixed(2)}</Text></View>
          {order.discount_amount > 0 && (
            <View style={styles.totalsRow}><Text>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</Text><Text>-Rs {Number(order.discount_amount).toFixed(2)}</Text></View>
          )}
          {isIntra ? (
            <>
              <View style={styles.totalsRow}><Text>CGST ({(order.gst_rate / 2).toFixed(1)}%)</Text><Text>Rs {Number(order.cgst_amount).toFixed(2)}</Text></View>
              <View style={styles.totalsRow}><Text>SGST ({(order.gst_rate / 2).toFixed(1)}%)</Text><Text>Rs {Number(order.sgst_amount).toFixed(2)}</Text></View>
            </>
          ) : (
            <View style={styles.totalsRow}><Text>IGST ({order.gst_rate}%)</Text><Text>Rs {Number(order.igst_amount).toFixed(2)}</Text></View>
          )}
          <View style={styles.totalsRowBold}><Text>Total</Text><Text>Rs {Number(order.total).toFixed(2)}</Text></View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.heading}>Payment</Text>
          <Text>{order.razorpay_payment_id ? `Paid via Razorpay — Payment ID: ${order.razorpay_payment_id}` : order.payment_status || "Unpaid"}</Text>
        </View>

        <Text style={{ marginTop: 30, fontSize: 8, color: "#888" }}>
          This is a computer-generated invoice and does not require a signature.
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(request, { params }) {
  const { orderId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const profile = await getCurrentProfile();
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order) return new Response("Not found", { status: 404 });
  if (order.user_id !== user.id && profile?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }
  if (!order.invoice_number) {
    return new Response("Invoice not generated for this order yet", { status: 400 });
  }

  const { data: items } = await admin
    .from("order_items")
    .select("id, product_name, unit_price, quantity, size, color_name, sku, hsn_code")
    .eq("order_id", orderId);

  const { data: settings } = await admin
    .from("site_settings")
    .select("seller_business_name, seller_gstin, seller_pan, seller_address, seller_state")
    .eq("id", 1)
    .single();

  const buffer = await renderToBuffer(<InvoiceDocument order={order} items={items || []} settings={settings} />);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.invoice_number.replace(/\//g, "-")}.pdf"`,
    },
  });
}

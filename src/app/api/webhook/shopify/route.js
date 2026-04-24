// app/api/webhook/shopify/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import React from "react";

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 40,
    color: "#1a1a1a",
  },

  // ── Header ──
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  companyDetail: { fontSize: 8.5, color: "#444", lineHeight: 1.5 },
  invoiceTitleBlock: { alignItems: "flex-end" },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  invoiceMetaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  invoiceMetaLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    width: 80,
    textAlign: "right",
    paddingRight: 8,
  },
  invoiceMetaValue: { fontSize: 8.5, width: 70, textAlign: "right" },

  // ── Divider ──
  divider: { borderBottomWidth: 0.5, borderBottomColor: "#ccc", marginVertical: 10 },

  // ── Address block ──
  addressRow: {
    flexDirection: "row",
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: "#ccc",
  },
  addressCell: { flex: 1, padding: 10 },
  addressCellLeft: {
    flex: 1,
    padding: 10,
    borderRightWidth: 0.5,
    borderRightColor: "#ccc",
  },
  addressLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    marginBottom: 4,
  },
  addressText: { fontSize: 8.5, color: "#333", lineHeight: 1.6 },
  addressCustomerRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
  },
  addressCustomerLabel: {
    flex: 1,
    fontSize: 8,
    color: "#555",
  },

  // ── Line items table ──
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderWidth: 0.5,
    borderColor: "#ccc",
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: "row",
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRowAlt: { backgroundColor: "#fafafa" },
  colItem: { width: "10%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  colDesc: { width: "35%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  colSpec: { width: "13%", fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "center" },
  colQty: { width: "9%", fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "center" },
  colUnitPrice: { width: "14%", fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "right" },
  colGst: { width: "9%", fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "right" },
  colAmount: { width: "10%", fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "right" },

  colItemVal: { width: "10%", fontSize: 8.5 },
  colDescVal: { width: "35%", fontSize: 8.5 },
  colSpecVal: { width: "13%", fontSize: 8.5, textAlign: "center" },
  colQtyVal: { width: "9%", fontSize: 8.5, textAlign: "center" },
  colUnitPriceVal: { width: "14%", fontSize: 8.5, textAlign: "right" },
  colGstVal: { width: "9%", fontSize: 8.5, textAlign: "right" },
  colAmountVal: { width: "10%", fontSize: 8.5, textAlign: "right" },

  // ── Totals ──
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 0,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  totalsBlock: { width: "33%", paddingRight: 6 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  totalLabelBold: { fontFamily: "Helvetica-Bold", fontSize: 8.5, textAlign: "right", flex: 1 },
  totalLabel: { fontSize: 8.5, textAlign: "right", flex: 1 },
  totalValue: { fontSize: 8.5, width: 55, textAlign: "right" },
  totalValueBold: { fontFamily: "Helvetica-Bold", fontSize: 8.5, width: 55, textAlign: "right" },
  totalDivider: {
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    marginHorizontal: 6,
    marginVertical: 2,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  bankBox: {
    borderWidth: 0.5,
    borderColor: "#ccc",
    padding: 8,
    width: "45%",
  },
  bankRow: { marginBottom: 2 },
  bankLabel: { fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  bankValue: { fontSize: 8.5 },
  dueDateLabel: { fontFamily: "Helvetica-Bold", fontSize: 9, marginBottom: 2 },
  pageNumber: { fontSize: 7.5, color: "#888" },
  generatedAt: { fontSize: 7.5, color: "#888" },
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  `$${parseFloat(n || 0).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const dueDateFromOrder = (iso, days = 30) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ─── Invoice Component ─────────────────────────────────────────────────────────
const InvoiceDocument = ({ order, invoiceNumber, companyInfo }) => {
  const {
    billing_address,
    shipping_address,
    line_items,
    created_at,
    subtotal_price,
    total_tax,
    total_price,
    order_number,
  } = order;

  const invNum = invoiceNumber || `ORD-${order_number}`;

  // Calculate GST per line item (price is ex-GST if tax_inclusive=false, else included)
  const lineItems = line_items.map((item) => {
    const unitPrice = parseFloat(item.price);
    const qty = item.quantity;
    const lineTotal = unitPrice * qty;
    // Shopify tax_lines per item
    const itemTax = item.tax_lines?.reduce((s, t) => s + parseFloat(t.price), 0) || 0;
    return { ...item, unitPrice, qty, lineTotal, itemTax };
  });

  const billAddr = billing_address || {};
  const shipAddr = shipping_address || {};

  const addrLines = (addr) =>
    [
      addr.company,
      addr.address1,
      addr.address2,
      [addr.city, addr.province_code, addr.zip].filter(Boolean).join(" "),
    ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyDetail}>ABN: {companyInfo.abn}</Text>
            <Text style={styles.companyDetail}>{companyInfo.address}</Text>
            <Text style={styles.companyDetail}>Phone: {companyInfo.phone}</Text>
            <Text style={styles.companyDetail}>Email: {companyInfo.email}</Text>
          </View>
          <View style={styles.invoiceTitleBlock}>
            <Text style={styles.invoiceTitle}>Tax Invoice</Text>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Invoice #</Text>
              <Text style={styles.invoiceMetaValue}>{invNum}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Date</Text>
              <Text style={styles.invoiceMetaValue}>{formatDate(created_at)}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Reference/PO #</Text>
              <Text style={styles.invoiceMetaValue}>{order.po_number || order_number}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Addresses ── */}
        <View style={styles.addressRow}>
          <View style={styles.addressCellLeft}>
            <Text style={styles.addressLabel}>Invoice To:</Text>
            {addrLines(billAddr).map((l, i) => (
              <Text key={i} style={styles.addressText}>{l}</Text>
            ))}
          </View>
          <View style={styles.addressCell}>
            <Text style={styles.addressLabel}>Deliver To:</Text>
            {addrLines(shipAddr).map((l, i) => (
              <Text key={i} style={styles.addressText}>{l}</Text>
            ))}
          </View>
        </View>

        {/* Customer / Contact row */}
        <View style={styles.addressCustomerRow}>
          <Text style={styles.addressCustomerLabel}>
            Customer: {billAddr.company || `${billAddr.first_name} ${billAddr.last_name}`}
          </Text>
          <Text style={styles.addressCustomerLabel}>
            Contact: {shipAddr.company || `${shipAddr.first_name} ${shipAddr.last_name}`}
          </Text>
        </View>

        {/* ── Table Header ── */}
        <View style={[styles.tableHeader, { marginTop: 14 }]}>
          <Text style={styles.colItem}>Item</Text>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colSpec}>Specification</Text>
          <Text style={styles.colQty}>QTY</Text>
          <Text style={styles.colUnitPrice}>Unit Price</Text>
          <Text style={styles.colGst}>GST</Text>
          <Text style={styles.colAmount}>Amount</Text>
        </View>

        {/* ── Table Rows ── */}
        {lineItems.map((item, i) => (
          <View key={i} style={[styles.tableRow, i % 2 !== 0 && styles.tableRowAlt]}>
            <Text style={styles.colItemVal}>{item.sku || "-"}</Text>
            <Text style={styles.colDescVal}>{item.name}</Text>
            <Text style={styles.colSpecVal}>{item.variant_title || "-"}</Text>
            <Text style={styles.colQtyVal}>{item.qty} ea</Text>
            <Text style={styles.colUnitPriceVal}>{fmt(item.unitPrice)}</Text>
            <Text style={styles.colGstVal}>{fmt(item.itemTax)}</Text>
            <Text style={styles.colAmountVal}>{fmt(item.lineTotal)}</Text>
          </View>
        ))}

        {/* ── Totals ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{fmt(subtotal_price)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST:</Text>
              <Text style={styles.totalValue}>{fmt(total_tax)}</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>Total:</Text>
              <Text style={styles.totalValueBold}>{fmt(total_price)}</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <View style={styles.bankBox}>
            <Text style={styles.dueDateLabel}>
              Due Date: {dueDateFromOrder(created_at, 30)}
            </Text>
            <Text style={[styles.bankLabel, { marginTop: 4 }]}>
              Account details for Deposit:
            </Text>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank: {companyInfo.bank}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>BSB: {companyInfo.bsb}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Acc No: {companyInfo.accNo}</Text>
            </View>
            <Text style={[styles.bankLabel, { marginTop: 4 }]}>
              TERMS: 30 DAYS NET
            </Text>
            <Text style={[styles.bankLabel, { marginTop: 4 }]}>Thank you</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={styles.generatedAt}
              render={() =>
                new Date().toLocaleString("en-AU", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })
              }
            />
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};

// ─── Nodemailer transporter ────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

// ─── Company info (put in env vars or a config file) ──────────────────────────
const MY_COMPANY = {
  name: process.env.COMPANY_NAME || "Your Company Pty Ltd",
  abn: process.env.COMPANY_ABN || "XX XXX XXX XXX",
  address: process.env.COMPANY_ADDRESS || "123 Example Street, Sydney NSW 2000",
  phone: process.env.COMPANY_PHONE || "1300 000 000",
  email: process.env.COMPANY_EMAIL || "orders@yourcompany.com",
  bank: process.env.BANK_NAME || "Commonwealth Bank",
  bsb: process.env.BANK_BSB || "062-227",
  accNo: process.env.BANK_ACC || "1020 2081",
};

// ─── In-memory store (resets on cold start) ────────────────────────────────────
let lastPayload = null;

// ─── POST: receive Shopify webhook ────────────────────────────────────────────
export async function POST(req) {
  const rawBody = await req.text();

  // 1. Verify HMAC
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  if (hash !== hmacHeader) {
    console.error("[HMAC] Invalid signature — rejected");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = JSON.parse(rawBody);
  console.log("[WEBHOOK] Order received:", order.order_number);

  lastPayload = { receivedAt: new Date().toISOString(), order };

  try {
    // 2. Generate PDF invoice
    const invoiceNumber = `INV-${order.order_number}`;
    const pdfBuffer = await renderToBuffer(
      <InvoiceDocument
        order={order}
        invoiceNumber={invoiceNumber}
        companyInfo={MY_COMPANY}
      />
    );

    // 3. Determine recipient — billing email or customer email
    const toEmail = order.email || order.billing_address?.email;
    if (!toEmail) {
      console.warn("[EMAIL] No customer email found on order", order.order_number);
      return NextResponse.json({ success: true, warning: "No email on order" });
    }

    // 4. Send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${MY_COMPANY.name}" <${process.env.MAIL_USER}>`,
      to: toEmail,
      // BCC yourself / accounts team
      bcc: process.env.ACCOUNTS_BCC_EMAIL || process.env.MAIL_USER,
      subject: `Tax Invoice ${invoiceNumber} – Order #${order.order_number}`,
      html: `
        <p>Hi ${order.billing_address?.first_name || "there"},</p>
        <p>Thank you for your order. Please find your tax invoice attached.</p>
        <p>
          <strong>Invoice:</strong> ${invoiceNumber}<br/>
          <strong>Order:</strong> #${order.order_number}<br/>
          <strong>Total:</strong> $${order.total_price} AUD<br/>
          <strong>Due Date:</strong> 30 days from invoice date
        </p>
        <p>If you have any questions, please contact us at ${MY_COMPANY.email}.</p>
        <p>Kind regards,<br/>${MY_COMPANY.name}</p>
      `,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(`[EMAIL] Invoice sent to ${toEmail} for order ${order.order_number}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    // Don't return 500 — Shopify retries on non-200, causing duplicate emails
    console.error("[INVOICE_ERROR]", err);
    return NextResponse.json({ success: true, error: err.message });
  }
}

// ─── GET: webhook viewer ───────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json(
    lastPayload || { message: "No webhook received yet" }
  );
}
import { NextResponse } from "next/server";
import crypto from "crypto";

// Store last payload in memory (resets on cold start — fine for testing)
let lastPayload = null;

export async function POST(req) {
  const rawBody = await req.text();

  // HMAC verification (required by Shopify)
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

  // 👇 This shows up in your Vercel function logs
  console.log("[WEBHOOK] Order received:", JSON.stringify(order, null, 2));

  // Save for the viewer page
  lastPayload = { receivedAt: new Date().toISOString(), order };

  return NextResponse.json({ success: true }, { status: 200 });
}

// Viewer hits this to see the last payload
export async function GET() {
  return NextResponse.json(lastPayload || { message: "No webhook received yet" });
}
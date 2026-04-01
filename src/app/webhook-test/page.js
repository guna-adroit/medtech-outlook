"use client";
import { useEffect, useState } from "react";

export default function WebhookTestPage() {
  const [data, setData] = useState(null);

  const fetchLatest = async () => {
    const res = await fetch("/api/webhook/shopify");
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 3000); // auto-refresh every 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Webhook Test Viewer</h2>
      <button onClick={fetchLatest}>Refresh</button>
      <pre style={{ marginTop: "1rem", background: "#111", color: "#4ec94e",
                    padding: "1rem", borderRadius: "8px", overflow: "auto" }}>
        {data ? JSON.stringify(data, null, 2) : "Waiting..."}
      </pre>
    </div>
  );
}
```

---

**Then in Shopify Admin, register the webhook:**
```
Settings → Notifications → Webhooks
→ Create webhook
   Topic:   Order creation
   URL:     https://your-vercel-app.vercel.app/api/webhook/shopify
   Format:  JSON
```

**To get your `SHOPIFY_WEBHOOK_SECRET`,** copy the signing secret shown after creating the webhook in Shopify Admin, then add it to Vercel:
```
Vercel Dashboard → Your Project → Settings → Environment Variables
→ SHOPIFY_WEBHOOK_SECRET = <paste secret here>
→ SHOPIFY_ACCESS_TOKEN   = <your dev dashboard token>
→ SHOPIFY_SHOP_DOMAIN    = yourstore.myshopify.com
// app/webhook-test/page.js
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

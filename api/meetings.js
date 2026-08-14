import { adminDb } from "../lib/firebaseAdmin.js";
import { verifyAuth } from "../lib/authMiddleware.js";

async function triggerSummaryGeneration(meetingId) {
  const selfUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const res = await fetch(`${selfUrl}/api/internal-generate-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_API_SECRET,
      },
      body: JSON.stringify({ meetingId }),
    });
    const body = await res.text();
    return { status: res.status, body };
  } catch (err) {
    return { status: null, body: `fetch threw: ${err.message}` };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let decoded;
  try {
    decoded = await verifyAuth(req);
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const { id, title, startedAt, endedAt, captions } = req.body || {};

  if (!id || !title || !startedAt || !Array.isArray(captions)) {
    return res.status(400).json({ error: "Missing required meeting fields" });
  }

  const meetingRef = adminDb.collection("meetings").doc(id);

  await meetingRef.set({
    id,
    userId: decoded.uid,
    title,
    startedAt,
    endedAt: endedAt ?? null,
    captions,
    summary: null,
  });

  const debugTrigger = await triggerSummaryGeneration(id);

  return res.status(200).json({ ok: true, debugTrigger });
}

import { adminDb } from "../lib/firebaseAdmin.js";
import { verifyAuth } from "../lib/authMiddleware.js";

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

  return res.status(200).json({ ok: true });
}

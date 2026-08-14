import { adminDb } from "../lib/firebaseAdmin.js";
import { verifyAuth } from "../lib/authMiddleware.js";
import { generateSummary } from "../lib/gemini.js";

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

  const { meetingId } = req.body || {};
  if (!meetingId) {
    return res.status(400).json({ error: "Missing meetingId" });
  }

  const meetingRef = adminDb.collection("meetings").doc(meetingId);
  const snapshot = await meetingRef.get();

  if (!snapshot.exists || snapshot.data().userId !== decoded.uid) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  const meeting = snapshot.data();

  try {
    const summary = await generateSummary(meeting.title, meeting.captions);
    await meetingRef.update({ summary });
    return res.status(200).json({ ok: true, summary });
  } catch (err) {
    console.error("Summary regeneration failed:", err);
    return res.status(502).json({ error: "Summary generation failed" });
  }
}

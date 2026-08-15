import { adminDb } from "../lib/firebaseAdmin.js";
import { verifyAuth } from "../lib/authMiddleware.js";
import { embedQuery } from "../lib/embeddings.js";
import { topKChunks } from "../lib/retrieval.js";
import { answerFromChunks } from "../lib/rag.js";

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

  const { meetingId, question } = req.body || {};
  if (!meetingId || !question) {
    return res.status(400).json({ error: "Missing meetingId or question" });
  }

  const snapshot = await adminDb.collection("meetings").doc(meetingId).get();
  if (!snapshot.exists) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  const meeting = snapshot.data();
  if (meeting.userId !== decoded.uid) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  if (!meeting.chunks || meeting.chunks.length === 0) {
    return res.status(409).json({
      error: "This meeting isn't ready for questions yet, try again shortly.",
    });
  }

  try {
    const queryVector = await embedQuery(question);
    const relevantChunks = topKChunks(queryVector, meeting.chunks, 5);
    const answer = await answerFromChunks(question, relevantChunks);
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("[Recap] Ask failed:", err);
    return res.status(502).json({ error: "Failed to answer question" });
  }
}

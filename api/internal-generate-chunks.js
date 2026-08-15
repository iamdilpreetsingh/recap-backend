import { adminDb } from "../lib/firebaseAdmin.js";
import { chunkTranscript } from "../lib/chunking.js";
import { embedDocument } from "../lib/embeddings.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { meetingId } = req.body || {};
  if (!meetingId) {
    return res.status(400).json({ error: "Missing meetingId" });
  }

  const meetingRef = adminDb.collection("meetings").doc(meetingId);
  const snapshot = await meetingRef.get();

  if (!snapshot.exists) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  const meeting = snapshot.data();

  try {
    const textChunks = chunkTranscript(meeting.captions);

    const chunks = [];
    for (const chunk of textChunks) {
      const vector = await embedDocument(chunk.text);
      chunks.push({ text: chunk.text, vector });
    }

    await meetingRef.update({ chunks });
    return res.status(200).json({ ok: true, chunkCount: chunks.length });
  } catch (err) {
    console.error("[Recap] Chunk generation failed:", err);
    return res.status(502).json({ error: "Chunk generation failed" });
  }
}

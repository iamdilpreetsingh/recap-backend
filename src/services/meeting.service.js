import { meetingRepository, chunkRepository } from "#/repositories/index.js";
import { toMeetingRecord } from "#/models/index.js";
import { chunkTranscript } from "#/utils/index.js";
import aiService from "./ai.service.js";

function notFoundError() {
  const error = new Error("Meeting not found");
  error.status = 404;
  return error;
}

async function requireOwnedMeeting(id, userId) {
  const row = await meetingRepository.findById(id);
  if (!row || row.user_id !== userId) {
    throw notFoundError();
  }
  return row;
}

async function generateInitialSummary(meetingId) {
  try {
    const row = await meetingRepository.findById(meetingId);
    if (!row) return;
    const summary = await aiService.generateSummary(row.title, row.captions);
    await meetingRepository.updateSummary(meetingId, summary);
  } catch (err) {
    console.error("[Recap] Initial summary generation failed:", err);
  }
}

async function generateChunks(meetingId) {
  try {
    const row = await meetingRepository.findById(meetingId);
    if (!row) return;

    const textChunks = chunkTranscript(row.captions);
    const chunks = [];
    for (const chunk of textChunks) {
      const vector = await aiService.embedDocument(chunk.text);
      chunks.push({ text: chunk.text, vector });
    }

    await chunkRepository.replaceForMeeting(meetingId, chunks);
  } catch (err) {
    console.error("[Recap] Chunk generation failed:", err);
  }
}

async function createMeeting({ id, userId, title, startedAt, endedAt, captions }) {
  await meetingRepository.create({ id, userId, title, startedAt, endedAt, captions });

  generateInitialSummary(id);
  generateChunks(id);
}

async function listMeetings(userId) {
  const rows = await meetingRepository.findByUser(userId);
  return rows.map(toMeetingRecord);
}

async function getMeeting(id, userId) {
  const row = await requireOwnedMeeting(id, userId);
  return toMeetingRecord(row);
}

async function askQuestion(id, userId, question) {
  await requireOwnedMeeting(id, userId);

  const queryVector = await aiService.embedQuery(question);
  const chunks = await chunkRepository.similaritySearch(id, queryVector);

  if (chunks.length === 0) {
    const error = new Error(
      "This meeting isn't ready for questions yet, try again shortly.",
    );
    error.status = 409;
    throw error;
  }

  const answer = await aiService.answerFromChunks(question, chunks);

  await meetingRepository.appendChatHistory(id, [
    { role: "user", text: question },
    { role: "assistant", text: answer },
  ]);

  return answer;
}

async function regenerateSummary(id, userId) {
  const row = await requireOwnedMeeting(id, userId);
  const summary = await aiService.generateSummary(row.title, row.captions);
  await meetingRepository.updateSummary(id, summary);
  return summary;
}

export default {
  createMeeting,
  listMeetings,
  getMeeting,
  askQuestion,
  regenerateSummary,
};

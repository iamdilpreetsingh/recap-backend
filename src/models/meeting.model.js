export const TABLE = "meetings";

export function toMeetingRecord(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    startedAt: Number(row.started_at),
    endedAt: row.ended_at === null ? null : Number(row.ended_at),
    captions: row.captions,
    summary: row.summary,
    chatHistory: row.chat_history,
  };
}

import pool from "#/lib/db.js";
import { MEETINGS_TABLE } from "#/models/index.js";

async function create({ id, userId, title, startedAt, endedAt, captions }) {
  await pool.query(
    `INSERT INTO ${MEETINGS_TABLE} (id, user_id, title, started_at, ended_at, captions, summary, chat_history)
     VALUES ($1, $2, $3, $4, $5, $6, NULL, '[]')
     ON CONFLICT (id) DO UPDATE SET
       user_id = EXCLUDED.user_id,
       title = EXCLUDED.title,
       started_at = EXCLUDED.started_at,
       ended_at = EXCLUDED.ended_at,
       captions = EXCLUDED.captions`,
    [id, userId, title, startedAt, endedAt ?? null, JSON.stringify(captions)],
  );
}

async function findByUser(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM ${MEETINGS_TABLE} WHERE user_id = $1 ORDER BY started_at DESC`,
    [userId],
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM ${MEETINGS_TABLE} WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function updateSummary(id, summary) {
  await pool.query(`UPDATE ${MEETINGS_TABLE} SET summary = $1 WHERE id = $2`, [
    JSON.stringify(summary),
    id,
  ]);
}

async function appendChatHistory(id, messages) {
  await pool.query(
    `UPDATE ${MEETINGS_TABLE} SET chat_history = chat_history || $1::jsonb WHERE id = $2`,
    [JSON.stringify(messages), id],
  );
}

export default {
  create,
  findByUser,
  findById,
  updateSummary,
  appendChatHistory,
};

import { toSql } from "pgvector";
import pool from "#/lib/db.js";
import { CHUNKS_TABLE } from "#/models/index.js";

async function replaceForMeeting(meetingId, chunks) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM ${CHUNKS_TABLE} WHERE meeting_id = $1`, [
      meetingId,
    ]);
    for (const chunk of chunks) {
      await client.query(
        `INSERT INTO ${CHUNKS_TABLE} (meeting_id, text, embedding) VALUES ($1, $2, $3)`,
        [meetingId, chunk.text, toSql(chunk.vector)],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function similaritySearch(meetingId, queryVector, limit = 5) {
  const { rows } = await pool.query(
    `SELECT text FROM ${CHUNKS_TABLE}
     WHERE meeting_id = $1
     ORDER BY embedding <=> $2
     LIMIT $3`,
    [meetingId, toSql(queryVector), limit],
  );
  return rows;
}

export default {
  replaceForMeeting,
  similaritySearch,
};

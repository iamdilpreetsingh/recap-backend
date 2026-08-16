import genAI from "#/lib/gemini.js";

const SUMMARY_MODEL = "gemini-flash-lite-latest";
const RAG_MODEL = "gemini-flash-lite-latest";
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

const NON_RETRYABLE_STATUS = new Set([400, 401, 403, 404]);
const MAX_ATTEMPTS = 4;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function transcriptText(captions) {
  return captions.map((c) => `${c.speaker}: ${c.text}`).join("\n");
}

async function generateSummary(title, captions) {
  const model = genAI.getGenerativeModel({
    model: SUMMARY_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are summarizing a meeting transcript titled "${title}".

Transcript:
${transcriptText(captions)}

Return a JSON object with exactly this shape:
{
  "meetingSummary": "a concise 2-4 sentence summary of the meeting",
  "detailedOverview": [
    { "label": "short topic label", "text": "1-2 sentence explanation" }
  ],
  "nextSteps": "1-2 sentences describing what happens next"
}

detailedOverview should have 2-5 items, one per distinct topic discussed.`;

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (err) {
      lastError = err;
      console.error(
        `[Recap] generateSummary attempt ${attempt} failed:`,
        err.status,
        err.message,
      );
      const permanent = NON_RETRYABLE_STATUS.has(err.status);
      if (permanent || attempt === MAX_ATTEMPTS) throw err;
      await sleep(attempt * 800);
    }
  }
  throw lastError;
}

async function embedText(text, taskType) {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    taskType,
    outputDimensionality: EMBEDDING_DIMENSIONS,
  });
  return result.embedding.values;
}

function embedDocument(text) {
  return embedText(text, "RETRIEVAL_DOCUMENT");
}

function embedQuery(text) {
  return embedText(text, "RETRIEVAL_QUERY");
}

async function answerFromChunks(question, chunks) {
  const context = chunks.map((c) => c.text).join("\n\n");

  const prompt = `You are answering a question about a meeting transcript.
Only use the context below to answer — do not use outside knowledge.
If the context doesn't contain the answer, say you don't have enough information from this meeting to answer.

Context:
${context}

Question: ${question}

Answer concisely, in 1-3 sentences.`;

  const model = genAI.getGenerativeModel({ model: RAG_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export default {
  generateSummary,
  embedDocument,
  embedQuery,
  answerFromChunks,
};

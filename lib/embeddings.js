import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

export async function embedText(text, taskType) {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    taskType,
    outputDimensionality: EMBEDDING_DIMENSIONS,
  });
  return result.embedding.values;
}

export function embedDocument(text) {
  return embedText(text, "RETRIEVAL_DOCUMENT");
}

export function embedQuery(text) {
  return embedText(text, "RETRIEVAL_QUERY");
}

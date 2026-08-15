import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = "gemini-flash-lite-latest";

export async function answerFromChunks(question, chunks) {
  const context = chunks.map((c) => c.text).join("\n\n");

  const prompt = `You are answering a question about a meeting transcript.
Only use the context below to answer — do not use outside knowledge.
If the context doesn't contain the answer, say you don't have enough information from this meeting to answer.

Context:
${context}

Question: ${question}

Answer concisely, in 1-3 sentences.`;

  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

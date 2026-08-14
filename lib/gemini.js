import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = "gemini-flash-latest";

function transcriptText(captions) {
  return captions.map((c) => `${c.speaker}: ${c.text}`).join("\n");
}

const RETRYABLE_STATUS = new Set([429, 500, 503]);
const MAX_ATTEMPTS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateSummary(title, captions) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
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
      const retryable = RETRYABLE_STATUS.has(err.status);
      if (!retryable || attempt === MAX_ATTEMPTS) throw err;
      await sleep(attempt * 1000);
    }
  }
  throw lastError;
}

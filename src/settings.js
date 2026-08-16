import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const DATABASE_URL = process.env.DATABASE_URL;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const FIREBASE_SERVICE_ACCOUNT_BASE64 =
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

export const PORT = process.env.PORT || "8000";

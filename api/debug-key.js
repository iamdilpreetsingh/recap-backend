import crypto from "node:crypto";

export default function handler(req, res) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "";
  const hash = crypto.createHash("sha256").update(raw).digest("hex");

  const invalidChars = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (!/[A-Za-z0-9+/=]/.test(c)) {
      invalidChars.push({ index: i, code: raw.charCodeAt(i), char: JSON.stringify(c) });
    }
  }

  res.status(200).json({
    length: raw.length,
    hash,
    first30: raw.slice(0, 30),
    last30: raw.slice(-30),
    invalidCharCount: invalidChars.length,
    invalidCharsSample: invalidChars.slice(0, 10),
  });
}

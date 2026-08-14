import crypto from "node:crypto";

export default function handler(req, res) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "";
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  res.status(200).json({ length: raw.length, hash });
}

import { adminAuth } from "./firebaseAdmin.js";

export async function verifyAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    const err = new Error("Missing Authorization header");
    err.status = 401;
    throw err;
  }

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    const err = new Error("Invalid or expired token");
    err.status = 401;
    throw err;
  }
}

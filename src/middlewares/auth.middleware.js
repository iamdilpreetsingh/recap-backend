import { adminAuth } from "#/lib/firebaseAdmin.js";

export default async function authenticate(request, response, next) {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return response.status(401).json({ error: "Missing Authorization header" });
  }

  try {
    request.user = await adminAuth.verifyIdToken(token);
    return next();
  } catch {
    return response.status(401).json({ error: "Invalid or expired token" });
  }
}

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FIREBASE_SERVICE_ACCOUNT_BASE64 } from "#/settings.js";

function loadServiceAccount() {
  if (!FIREBASE_SERVICE_ACCOUNT_BASE64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set");
  }
  const json = Buffer.from(FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString(
    "utf8",
  );
  return JSON.parse(json);
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(loadServiceAccount()),
    });

export const adminAuth = getAuth(app);

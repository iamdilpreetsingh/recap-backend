import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function loadServiceAccount() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!encoded) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set");
  }
  const json = Buffer.from(encoded, "base64").toString("utf8");
  return JSON.parse(json);
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(loadServiceAccount()),
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Credentials: FIREBASE_SERVICE_ACCOUNT (the service account JSON as one line)
 * or GOOGLE_APPLICATION_CREDENTIALS (path to the JSON file).
 */
const credential = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  return raw ? cert(JSON.parse(raw)) : applicationDefault();
};

export const firebaseAuth = () => {
  if (!getApps().length) initializeApp({ credential: credential() });
  return getAuth();
};

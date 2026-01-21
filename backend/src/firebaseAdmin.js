import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Missing Firebase env vars (projectId/clientEmail/privateKey).");
}

// IMPORTANT: convert literal \n into real newlines
privateKey = privateKey.replace(/\\n/g, "\n");

// OPTIONAL: remove surrounding quotes if they exist
privateKey = privateKey.replace(/^"|"$/g, "");

if (!privateKey.includes("BEGIN PRIVATE KEY")) {
  throw new Error("Check Private key");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const db = admin.firestore();

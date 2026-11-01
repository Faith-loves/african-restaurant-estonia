import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getAuth,
} from "firebase-admin/auth";

import {
  getFirestore,
} from "firebase-admin/firestore";

function getRequiredEnvironmentVariable(
  name: string
) {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}`
    );
  }

  return value;
}

const projectId =
  getRequiredEnvironmentVariable(
    "FIREBASE_ADMIN_PROJECT_ID"
  );

const clientEmail =
  getRequiredEnvironmentVariable(
    "FIREBASE_ADMIN_CLIENT_EMAIL"
  );

const privateKey = getRequiredEnvironmentVariable(
  "FIREBASE_ADMIN_PRIVATE_KEY"
)
  .trim()
  .replace(/^['"]|['"]$/g, "")
  .replace(/\\n/g, "\n")
  .replace(/\r\n/g, "\n");

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

export const adminAuth =
  getAuth(adminApp);

export const adminDb =
  getFirestore(adminApp);

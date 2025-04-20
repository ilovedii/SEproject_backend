import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

//env
const base64 = process.env.FIREBASE_KEY_BASE64;
if (!base64) {
  throw new Error("FIREBASE_KEY_BASE64 環境變數不存在！");
}

// 轉JSON
const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
const serviceAccount = JSON.parse(jsonStr);

// init firebase
initializeApp({
  credential: cert(serviceAccount),
});

export const DATABASE = getFirestore();
export const AUTH = getAuth();


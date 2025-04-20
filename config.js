//Firebase 初始化設定
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {readFileSync} from "fs";
const serviceAccount = JSON.parse(readFileSync("./accountKey.json", "utf-8"));

//啟動firebase SDK
initializeApp({
	credential: cert(serviceAccount), //啟動金鑰
})


export const DATABASE = getFirestore();
export const AUTH = getAuth();

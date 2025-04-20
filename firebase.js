//目前這個檔案完全不需要
//適用給前端直接操作firebase sdk用的
//但是先留著吧 搞不好未來需要

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLfYjV9dfKOalCwBISsROQz_zgs9M65Dg",
  authDomain: "software-project-a060c.firebaseapp.com",
  projectId: "software-project-a060c",
  storageBucket: "software-project-a060c.firebasestorage.app",
  messagingSenderId: "163710286863",
  appId: "1:163710286863:web:c68c9c05fe96e87d54f77a",
  measurementId: "G-2F00Q3B6MQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

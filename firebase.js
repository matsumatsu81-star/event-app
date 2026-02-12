// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjvBWgetJj8I_9D5RY1jyz05zSZjD6ZfM",
  authDomain: "enji-event2025.firebaseapp.com",
  projectId: "enji-event2025",
  storageBucket: "enji-event2025.firebasestorage.app",
  messagingSenderId: "1097616247056",
  appId: "1:1097616247056:web:a3ff71fb020289df43fd95"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ★ ログイン結果を確認できるようにする
signInAnonymously(auth)
  .then(() => {
    console.log("匿名ログイン成功");
  })
  .catch((error) => {
    console.error("匿名ログイン失敗:", error);
    alert("ログインに失敗しました。管理者に連絡してください。");
  });

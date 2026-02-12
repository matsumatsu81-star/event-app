// app.js
import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let currentUser = null;

const MAX_EXCHANGES = 5;

// ✅ ログイン完了を待つ
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    console.log("ログイン待機中...");
    return;
  }

  console.log("ログイン完了:", user.uid);

  currentUser = user;

  await initializeUser(user.uid);
  generateQRCode(user.uid);
  updateRemainingCount();
});

// =========================
// 初期ユーザー作成
// =========================

async function initializeUser(uid) {

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {

    const houses = ["gryffindor", "hufflepuff", "ravenclaw", "slytherin"];
    const randomHouse = houses[Math.floor(Math.random() * houses.length)];

    await setDoc(userRef, {
      house: randomHouse,
      points: 0,
      exchanges: [],
      createdAt: new Date()
    });

    console.log("新規ユーザー作成:", randomHouse);
  }
}

// =========================
// QRコード生成
// =========================

function generateQRCode(uid) {

  const qrElement = document.getElementById("qrcode");

  if (!qrElement) return;

  qrElement.innerHTML = "";

  new QRCode(qrElement, {
    text: uid,
    width: 200,
    height: 200
  });
}

// =========================
// 残り回数表示
// =========================

async function updateRemainingCount() {

  const userRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  const remaining = MAX_EXCHANGES - (data.exchanges?.length || 0);

  const el = document.getElementById("remaining");
  if (el) {
    el.innerText = `あと ${remaining} 人交換できます`;
  }
}

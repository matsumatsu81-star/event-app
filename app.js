// Firebase import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔽 あなたのFirebase設定
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const MAX_EXCHANGE = 5;

// 🔹 ランダム寮割り振り
function assignHouse(uid) {
  const houses = ["gryffindor", "hufflepuff", "ravenclaw", "slytherin"];
  return houses[Math.floor(Math.random() * houses.length)];
}

// 🔹 寮名日本語変換
function houseJP(house) {
  const map = {
    gryffindor: "グリフィンドール寮",
    hufflepuff: "ハッフルパフ寮",
    ravenclaw: "レイブンクロー寮",
    slytherin: "スリザリン寮"
  };
  return map[house] || house;
}

// 🔹 初回ログイン処理
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const house = assignHouse(user.uid);

    await setDoc(userRef, {
      house: house,
      points: 0,
      exchanges: [],
      createdAt: new Date()
    });
  }

  loadUserData(user.uid);
});

// 🔹 匿名ログイン
signInAnonymously(auth);

// 🔹 ユーザー情報表示
async function loadUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data();

  const remaining = MAX_EXCHANGE - (data.exchanges?.length || 0);

  document.getElementById("myHouse").innerText =
    "あなたは " + houseJP(data.house) + " です";

  document.getElementById("myPoints").innerText =
    "あなたのポイント: " + data.points;

  document.getElementById("remaining").innerText =
    "あと " + remaining + " 人交換できます";
}

// 🔹 QR交換処理（この関数をscan成功時に呼ぶ）
window.processExchange = async function (targetUid) {

  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const myRef = doc(db, "users", currentUser.uid);
  const targetRef = doc(db, "users", targetUid);

  const mySnap = await getDoc(myRef);
  const targetSnap = await getDoc(targetRef);

  if (!targetSnap.exists()) {
    alert("相手が見つかりません");
    return;
  }

  const myData = mySnap.data();
  const targetData = targetSnap.data();

  // 🔴 自分自身チェック
  if (currentUser.uid === targetUid) {
    alert("自分とは交換できません");
    return;
  }

  // 🔴 同一人物交換チェック
  if (myData.exchanges?.includes(targetUid)) {
    alert("この相手とは交換済みです");
    return;
  }

  // 🔴 回数制限チェック
  if ((myData.exchanges?.length || 0) >= MAX_EXCHANGE) {
    alert("交換上限に達しました");
    return;
  }

  try {
    // 自分更新
    await updateDoc(myRef, {
      points: increment(1),
      exchanges: arrayUnion(targetUid)
    });

    // 相手更新
    await updateDoc(targetRef, {
      points: increment(1),
      exchanges: arrayUnion(currentUser.uid)
    });

    // 🔥 寮スコア更新（分割構成）
    await updateDoc(
      doc(db, "scores/houses", myData.house),
      { count: increment(1) }
    );

    alert("交換成立！");
    loadUserData(currentUser.uid);

  } catch (error) {
    console.error(error);
    alert("交換に失敗しました。もう一度お試しください。");
  }
};

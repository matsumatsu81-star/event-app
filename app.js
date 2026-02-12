// app.js

import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   設定値
================================= */

const MAX_EXCHANGES = 5; // 1人あたり最大交換回数

const HOUSES = [
  "gryffindor",
  "hufflepuff",
  "ravenclaw",
  "slytherin"
];

/* ===============================
   ユーザー登録
================================= */

export async function registerUser(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const randomHouse =
      HOUSES[Math.floor(Math.random() * HOUSES.length)];

    await setDoc(userRef, {
      house: randomHouse,
      points: 0,          // 個人ポイント
      exchanges: [],      // 交換済みUID
      createdAt: serverTimestamp()
    });
  }
}

/* ===============================
   交換処理
================================= */

export async function exchangePoints(myUid, partnerUid) {
  if (myUid === partnerUid) {
    alert("自分自身とは交換できません");
    return false;
  }

  const myRef = doc(db, "users", myUid);
  const partnerRef = doc(db, "users", partnerUid);
  const houseRef = doc(db, "scores", "houses");

  const mySnap = await getDoc(myRef);
  const partnerSnap = await getDoc(partnerRef);

  if (!mySnap.exists() || !partnerSnap.exists()) {
    alert("ユーザーが見つかりません");
    return false;
  }

  const myData = mySnap.data();

  // ✅ すでに交換済みチェック
  if (myData.exchanges?.includes(partnerUid)) {
    alert("この相手とはすでに交換済みです");
    return false;
  }

  // ✅ 上限チェック
  if (myData.points >= MAX_EXCHANGES) {
    alert("交換上限（5回）に達しています");
    return false;
  }

  const myHouse = myData.house;

  try {
    // 🔹 自分のポイント+1
    await updateDoc(myRef, {
      points: increment(1),
      exchanges: arrayUnion(partnerUid)
    });

    // 🔹 寮ポイント+1
    await updateDoc(houseRef, {
      [myHouse]: increment(1)
    });

    alert("交換成立しました！");
    return true;

  } catch (error) {
    console.error(error);
    alert("交換に失敗しました。もう一度お試しください。");
    return false;
  }
}

/* ===============================
   残り交換回数取得
================================= */

export async function getRemainingExchanges(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return 0;

  const points = snap.data().points || 0;
  return MAX_EXCHANGES - points;
}

import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * ユーザー初回登録
 * index.html で必ず1回呼ばれる
 */
export async function registerUser(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const houses = ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"];
    const house = houses[Math.floor(Math.random() * houses.length)];

    await setDoc(ref, {
      house: house,
      exchangeCount: 0,
      createdAt: serverTimestamp()
    });
  }
}

/**
 * QR交換処理（最終版）
 * - 相手ユーザー存在チェックをしない
 * - QRが読めれば必ず成立する
 */
export async function exchange(myUid, targetUid) {
  if (!myUid || !targetUid) {
    throw new Error("UIDが不正です");
  }

  if (myUid === targetUid) {
    throw new Error("同一人物とは交換できません");
  }

  const myRef = doc(db, "users", myUid);

  try {
    // 自分の交換回数を加算
    await updateDoc(myRef, {
      exchangeCount: increment(1),
      lastExchangeAt: serverTimestamp()
    });

    // 全体スコアを加算（存在しなければ自動作成）
    await setDoc(
      doc(db, "scores", "total"),
      { count: increment(1) },
      { merge: true }
    );

  } catch (e) {
    console.error("exchange error:", e);
    throw e;
  }
}

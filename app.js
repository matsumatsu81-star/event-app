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
 * - すでに存在する場合は何もしない
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
 * QR交換処理
 * @param {string} myUid 自分のUID
 * @param {string} targetUid 相手のUID（QRの中身）
 */
export async function exchange(myUid, targetUid) {
  if (!myUid || !targetUid) {
    throw new Error("UIDが不正です");
  }

  if (myUid === targetUid) {
    throw new Error("同一人物との交換は禁止されています");
  }

  const myRef = doc(db, "users", myUid);
  const targetRef = doc(db, "users", targetUid);

  // 相手が存在するか確認（不正QR対策）
  const targetSnap = await getDoc(targetRef);
  if (!targetSnap.exists()) {
    throw new Error("相手ユーザーが存在しません");
  }

  try {
    // 自分の交換回数を+1
    await updateDoc(myRef, {
      exchangeCount: increment(1),
      lastExchangeAt: serverTimestamp()
    });

    // 全体スコアを+1（存在しなければ作成）
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

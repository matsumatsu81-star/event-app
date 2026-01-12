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
 * 初回ユーザー登録
 */
export async function registerUser(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const houses = ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"];
    const house = houses[Math.floor(Math.random() * houses.length)];

    await setDoc(ref, {
      house,
      exchangeCount: 0,
      createdAt: serverTimestamp()
    });
  }
}

/**
 * QR交換処理
 * - 同一相手は1回のみ
 * - 自分の寮にポイント加算
 */
export async function exchange(myUid, targetUid) {
  if (!myUid || !targetUid) {
    throw new Error("UIDが不正です");
  }

  if (myUid === targetUid) {
    throw new Error("自分自身とは交換できません");
  }

  const myRef = doc(db, "users", myUid);
  const exchangeRef = doc(db, "users", myUid, "exchanges", targetUid);

  // ① 重複交換チェック
  const exchangeSnap = await getDoc(exchangeRef);
  if (exchangeSnap.exists()) {
    throw new Error("この相手とはすでに交換済みです");
  }

  // ② 自分の寮を取得
  const mySnap = await getDoc(myRef);
  if (!mySnap.exists()) {
    throw new Error("ユーザー情報が見つかりません");
  }
  const myHouse = mySnap.data().house;

  // ③ 交換記録を保存
  await setDoc(exchangeRef, {
    createdAt: serverTimestamp()
  });

  // ④ 自分の交換回数を加算
  await updateDoc(myRef, {
    exchangeCount: increment(1),
    lastExchangeAt: serverTimestamp()
  });

  // ⑤ 寮別スコアを加算
  await setDoc(
    doc(db, "scores", "houses"),
    {
      [myHouse]: increment(1)
    },
    { merge: true }
  );
}

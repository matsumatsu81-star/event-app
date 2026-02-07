import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp
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
      house: house,
      points: 0,          // 個人ポイント
      exchanged: [],      // ★ 交換済みUIDリスト
      createdAt: serverTimestamp()
    });
  }
}

/**
 * 交換処理（重複交換防止）
 */
export async function exchange(myUid, targetUid) {
  if (!myUid || !targetUid) {
    alert("読み取りに失敗しました");
    return;
  }

  if (myUid === targetUid) {
    alert("同一人物とは交換できません");
    return;
  }

  const myRef = doc(db, "users", myUid);
  const snap = await getDoc(myRef);

  if (!snap.exists()) {
    alert("ユーザー情報が見つかりません");
    return;
  }

  const data = snap.data();
  const exchanged = data.exchanged || [];

  // ★ すでに交換済みかチェック
  if (exchanged.includes(targetUid)) {
    alert("この相手とはすでに交換済みです");
    return;
  }

  // 個人ポイント +1 ＆ 交換履歴追加
  await updateDoc(myRef, {
    points: increment(1),
    exchanged: [...exchanged, targetUid]
  });

  // 寮ポイント +1
  await updateDoc(doc(db, "scores", "houses"), {
    [data.house]: increment(1)
  });

  alert("交換成立！");
}

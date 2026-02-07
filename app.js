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
 * ・寮をランダム割当
 * ・個人ポイント0
 * ・交換履歴を空配列で作成
 */
export async function registerUser(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const houses = [
      "gryffindor",
      "slytherin",
      "ravenclaw",
      "hufflepuff"
    ];
    const house = houses[Math.floor(Math.random() * houses.length)];

    await setDoc(ref, {
      house: house,
      points: 0,        // 個人ポイント（＝交換回数）
      exchanged: [],    // 交換済みUID一覧
      createdAt: serverTimestamp()
    });
  }
}

/**
 * 交換処理
 * 仕様：
 * ・同一人物とは交換不可
 * ・同じ相手とは1回のみ
 * ・1人あたり最大5回まで
 * ・成立時に個人ポイント＆寮ポイント加算
 */
export async function exchange(myUid, targetUid) {
  if (!myUid || !targetUid) {
    alert("読み取りに失敗しました");
    return;
  }

  // 自分自身チェック
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
  const points = data.points || 0;

  // ★ 交換回数上限（5回まで）
  if (points >= 5) {
    alert("交換は5人までです");
    return;
  }

  // ★ 同じ相手との重複交換防止
  if (exchanged.includes(targetUid)) {
    alert("この相手とはすでに交換済みです");
    return;
  }

  // 個人ポイント加算 & 交換履歴追加
  await updateDoc(myRef, {
    points: increment(1),
    exchanged: [...exchanged, targetUid]
  });

  // 寮ポイント加算
  await updateDoc(doc(db, "scores", "houses"), {
    [data.house]: increment(1)
  });

  alert("交換成立！");
}

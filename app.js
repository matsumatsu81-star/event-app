import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * 初回ユーザー登録
 * 仕様：
 * ・すでに登録済みなら何もしない
 * ・全ユーザーの寮人数を数える
 * ・一番人数が少ない寮に割り当てる（②方式）
 */
export async function registerUser(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  // すでに登録済みなら終了
  if (snap.exists()) return;

  const houses = [
    "gryffindor",
    "slytherin",
    "ravenclaw",
    "hufflepuff"
  ];

  // 寮ごとの人数カウント
  const counts = {
    gryffindor: 0,
    slytherin: 0,
    ravenclaw: 0,
    hufflepuff: 0
  };

  const allUsers = await getDocs(collection(db, "users"));
  allUsers.forEach(docSnap => {
    const house = docSnap.data().house;
    if (house && counts[house] !== undefined) {
      counts[house]++;
    }
  });

  // 人数が一番少ない寮を選択
  const house = houses.reduce((a, b) =>
    counts[a] <= counts[b] ? a : b
  );

  await setDoc(ref, {
    house: house,
    points: 0,        // 個人ポイント（＝交換回数）
    exchanged: [],    // 交換済みUID一覧
    createdAt: serverTimestamp()
  });
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

  // 交換回数上限（5回まで）
  if (points >= 5) {
    alert("交換は5人までです");
    return;
  }

  // 同じ相手との重複交換防止
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

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

const MAX_EXCHANGE = 5;

/**
 * 初回ユーザー登録
 * ・人数が一番少ない寮へ自動割り当て
 */
export async function registerUser(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return;

  const houses = [
    "gryffindor",
    "slytherin",
    "ravenclaw",
    "hufflepuff"
  ];

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

  const house = houses.reduce((a, b) =>
    counts[a] <= counts[b] ? a : b
  );

  await setDoc(ref, {
    house: house,
    points: 0,
    exchanged: [],
    createdAt: serverTimestamp()
  });
}

/**
 * 交換処理
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
  const points = data.points || 0;

  if (points >= MAX_EXCHANGE) {
    alert("交換は5人までです");
    return;
  }

  if (exchanged.includes(targetUid)) {
    alert("この相手とはすでに交換済みです");
    return;
  }

  // 個人更新
  await updateDoc(myRef, {
    points: increment(1),
    exchanged: [...exchanged, targetUid]
  });

  // 🔥 寮ポイント加算（分割前構造）
  await updateDoc(doc(db, "scores", "houses"), {
    [data.house]: increment(1)
  });

  alert("交換成立！");
}

import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 初回ユーザー登録
export async function registerUser(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const houses = ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"];
    const house = houses[Math.floor(Math.random() * houses.length)];

    await setDoc(ref, {
      house: house,
      points: 0,          // ★ 個人ポイント
      createdAt: serverTimestamp()
    });
  }
}

// 交換処理
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
  const mySnap = await getDoc(myRef);

  if (!mySnap.exists()) {
    alert("ユーザー情報が見つかりません");
    return;
  }

  const myHouse = mySnap.data().house;

  // ① 個人ポイント +1
  await updateDoc(myRef, {
    points: increment(1)
  });

  // ② 寮ポイント +1（既存仕様）
  await updateDoc(doc(db, "scores", "houses"), {
    [myHouse]: increment(1)
  });
}

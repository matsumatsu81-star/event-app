// app.js
import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const MAX_EXCHANGE = 5;

/* ===============================
   ユーザー登録
=============================== */
export async function registerUser(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const houses = ["gryffindor", "hufflepuff", "ravenclaw", "slytherin"];
    const house = houses[Math.floor(Math.random() * houses.length)];

    await setDoc(userRef, {
      house: house,
      points: 0,
      exchanges: [],
      createdAt: new Date()
    });
  }
}

/* ===============================
   交換処理
=============================== */
export async function exchangeUsers(myUid, otherUid) {
  if (myUid === otherUid) {
    alert("自分とは交換できません");
    return false;
  }

  const myRef = doc(db, "users", myUid);
  const otherRef = doc(db, "users", otherUid);

  const mySnap = await getDoc(myRef);
  const otherSnap = await getDoc(otherRef);

  if (!mySnap.exists() || !otherSnap.exists()) {
    alert("ユーザー情報が存在しません");
    return false;
  }

  const myData = mySnap.data();

  if (myData.exchanges.includes(otherUid)) {
    alert("この相手とは交換済みです");
    return false;
  }

  if (myData.points >= MAX_EXCHANGE) {
    alert("これ以上交換できません（上限5人）");
    return false;
  }

  // 個人ポイント加算
  await updateDoc(myRef, {
    points: increment(1),
    exchanges: [...myData.exchanges, otherUid]
  });

  // 寮ポイント加算
  const houseRef = doc(db, "scores", "houses");
  await updateDoc(houseRef, {
    [myData.house]: increment(1)
  });

  return true;
}

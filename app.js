import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc,
  increment,
  serverTimestamp,
  collection,
  getDocs,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * 初回ユーザー登録
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
 * 交換処理（負荷分散版）
 */
export async function exchange(myUid, targetUid) {

  if (!myUid || !targetUid) {
    alert("読み取りに失敗しました");
    return false;
  }

  if (myUid === targetUid) {
    alert("同一人物とは交換できません");
    return false;
  }

  const myRef = doc(db, "users", myUid);

  try {
    // ★ ランダム遅延（0〜200ms）
    await new Promise(r => setTimeout(r, Math.random() * 200));

    await runTransaction(db, async (tx) => {

      const snap = await tx.get(myRef);

      if (!snap.exists()) {
        throw new Error("no-user");
      }

      const data = snap.data();
      const exchanged = data.exchanged || [];
      const points = data.points || 0;

      if (points >= 5) {
        throw new Error("limit");
      }

      if (exchanged.includes(targetUid)) {
        throw new Error("duplicate");
      }

      tx.update(myRef, {
        points: points + 1,
        exchanged: [...exchanged, targetUid]
      });

      tx.update(doc(db, "scores", "houses"), {
        [data.house]: increment(1)
      });

    });

    return true;

  } catch (e) {
    console.error("交換失敗:", e);

    if (e.message === "limit") {
      alert("交換は5人までです");
    } else if (e.message === "duplicate") {
      alert("この相手とはすでに交換済みです");
    } else if (e.message === "no-user") {
      alert("ユーザー情報が見つかりません");
    } else {
      alert("交換に失敗しました");
    }

    return false;
  }
}

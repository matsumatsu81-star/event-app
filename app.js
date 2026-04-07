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
    return false;
  }

  if (myUid === targetUid) {
    return false;
  }

  const myRef = doc(db, "users", myUid);
  const snap = await getDoc(myRef);

  if (!snap.exists()) {
    return false;
  }

  const data = snap.data();
  const exchanged = data.exchanged || [];
  const points = data.points || 0;

  if (points >= 5) {
    return false;
  }

  if (exchanged.includes(targetUid)) {
    return false;
  }

  try {
    await updateDoc(myRef, {
      points: increment(1),
      exchanged: [...exchanged, targetUid]
    });

    await updateDoc(doc(db, "scores", "houses"), {
      [data.house]: increment(1)
    });

    console.log("交換成功");
    return true;

  } catch (e) {
    console.error("交換失敗:", e);
    return false;
  }
}

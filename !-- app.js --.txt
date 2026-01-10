<!-- app.js -->
<script type="module">
  import { auth, db } from "./firebase.js";
  import {
    doc, setDoc, getDoc, updateDoc,
    serverTimestamp, increment
  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  export async function registerUser(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const houses = ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"];
      const house = houses[Math.floor(Math.random() * houses.length)];

      await setDoc(ref, {
        house: house,
        exchanges: [],
        createdAt: serverTimestamp()
      });
    }
  }

  export async function exchange(myUid, targetUid) {
    if (myUid === targetUid) return alert("同一人物とは交換不可");

    const myRef = doc(db, "users", myUid);
    const targetRef = doc(db, "users", targetUid);

    await updateDoc(myRef, {
      exchanges: increment(1)
    });

    await updateDoc(doc(db, "scores", "houses"), {
      total: increment(1)
    });

    alert("交換成立！");
  }
</script>

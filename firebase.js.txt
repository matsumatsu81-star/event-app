<!-- firebase.js -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  const firebaseConfig = {
   apiKey: "AIzaSyCjvBWgetJj8I_9D5RY1jyz05zSZjD6ZfM",
   authDomain: "enji-event2025.firebaseapp.com",
   projectId: "enji-event2025",
   storageBucket: "enji-event2025.firebasestorage.app",
   messagingSenderId: "1097616247056",
   appId: "1:1097616247056:web:a3ff71fb020289df43fd95"
  };

  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);

  signInAnonymously(auth);
</script>

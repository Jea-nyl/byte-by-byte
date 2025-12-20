import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔥 YOUR FIREBASE WEB CONFIG
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "byte-by-byte-f7a4c.firebaseapp.com",
  databaseURL: "https://byte-by-byte-f7a4c-default-rtdb.firebaseio.com",
  projectId: "byte-by-byte-f7a4c",
  storageBucket: "byte-by-byte-f7a4c.appspot.com",
  messagingSenderId: "PASTE_YOUR_ID",
  appId: "PASTE_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const statusBox = document.getElementById("status");
const controlRef = ref(db, "control");

const choices = {
  A: document.getElementById("A"),
  B: document.getElementById("B"),
  C: document.getElementById("C"),
  D: document.getElementById("D")
};

function resetChoices() {
  Object.values(choices).forEach(c => c.classList.remove("active"));
}

onValue(controlRef, snapshot => {
  const data = snapshot.val();
  if (!data || !data.button) return;

  const btn = data.button;
  console.log("Button received:", btn);

  resetChoices();

  if (choices[btn]) {
    choices[btn].classList.add("active");
    statusBox.textContent = `🎯 Selected Answer: ${btn}`;
  }

  // reset Firebase so next press works
  set(controlRef, { button: "" });
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBkFUpf2JuYIch95wx9B4Rk-jp9I7IudJs",
  authDomain: "byte-by-byte-f7a4c.firebaseapp.com",
  databaseURL: "https://byte-by-byte-f7a4c-default-rtdb.firebaseio.com",
  projectId: "byte-by-byte-f7a4c",
  storageBucket: "byte-by-byte-f7a4c.firebasestorage.app",
  messagingSenderId: "838552047744",
  appId: "1:838552047744:web:f653b9fba96e49aa44d665"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const statusBox = document.getElementById("status");
const controlRef = ref(db, "control");

onValue(controlRef, snapshot => {
  const data = snapshot.val();
  if (!data || !data.button) return;

  if (data.button === "A") {
    statusBox.textContent = "✅ BUTTON A PRESSED";
    statusBox.classList.add("active");

    // reset so it can trigger again
    set(controlRef, { button: "" });

    setTimeout(() => {
      statusBox.textContent = "Waiting for ESP32 button…";
      statusBox.classList.remove("active");
    }, 1500);
  }
});

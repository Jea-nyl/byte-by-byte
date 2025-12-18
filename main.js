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

const controlRef = ref(db, "control");
const status = document.getElementById("status");

onValue(controlRef, snapshot => {
  const data = snapshot.val();
  if (!data) return;

  if (data.button === "A") {
    status.innerText = "BUTTON A PRESSED 🎉";

    // Clear button so it can be pressed again
    set(controlRef, { button: "" });
  }
});

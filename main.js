import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* 🔥 FIREBASE CONFIG */
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

/* 🎮 UI ELEMENTS */
const spinner = document.getElementById("spinner");
const questionBox = document.getElementById("question");

const choices = {
  A: document.getElementById("A"),
  B: document.getElementById("B"),
  C: document.getElementById("C"),
  D: document.getElementById("D")
};

/* 📚 QUESTIONS */
const categories = {
  Programming: [
    { q: "What does HTML stand for?", c: ["Hyper Text Markup Language", "High Tech Machine Language", "Home Tool Markup Language", "Hyperlinks Text Machine"], a: "A" },
    { q: "Which is a programming language?", c: ["HTTP", "HTML", "Python", "CSS"], a: "C" },
    { q: "Which symbol is used for comments in JS?", c: ["//", "##", "<!--", "**"], a: "A" },
    { q: "What does CSS style?", c: ["Logic", "Database", "Design", "Server"], a: "C" },
    { q: "Which is not a loop?", c: ["for", "while", "if", "do-while"], a: "C" }
  ],

  Networking: [
    { q: "What device connects networks?", c: ["Router", "RAM", "CPU", "SSD"], a: "A" },
    { q: "IP stands for?", c: ["Internet Protocol", "Internal Process", "Input Port", "Internet Provider"], a: "A" },
    { q: "LAN means?", c: ["Large Area Network", "Local Area Network", "Logical Access Node", "Low Area Network"], a: "B" },
    { q: "Which uses WiFi?", c: ["Ethernet", "Bluetooth", "Wireless", "Fiber"], a: "C" },
    { q: "Which layer is IP?", c: ["Physical", "Transport", "Network", "Application"], a: "C" }
  ]
};

/* 🎡 GAME STATE */
let currentCategory = "";
let currentQuestion = null;
let spinning = true;

/* 🔄 RESET UI */
function resetChoices() {
  Object.values(choices).forEach(c => {
    c.className = "choice";
    c.textContent = c.id;
  });
}

/* 🎡 SPIN CATEGORY */
function spinCategory() {
  spinner.classList.add("spin");

  const keys = Object.keys(categories);
  currentCategory = keys[Math.floor(Math.random() * keys.length)];

  setTimeout(() => {
    spinner.classList.remove("spin");
    spinner.textContent = `📂 Category: ${currentCategory}`;
    loadQuestion();
    spinning = false;
  }, 2000);
}

/* ❓ LOAD QUESTION */
function loadQuestion() {
  const list = categories[currentCategory];
  currentQuestion = list[Math.floor(Math.random() * list.length)];

  questionBox.textContent = currentQuestion.q;

  ["A","B","C","D"].forEach((l, i) => {
    choices[l].textContent = `${l}. ${currentQuestion.c[i]}`;
  });
}

/* 🎯 BUTTON INPUT */
onValue(controlRef, snapshot => {
  const data = snapshot.val();
  if (!data || !data.button) return;

  const btn = data.button;
  set(controlRef, { button: "" });

  if (spinning) {
    spinCategory();
    return;
  }

  resetChoices();
  choices[btn].classList.add("active");

  setTimeout(() => {
    if (btn === currentQuestion.a) {
      choices[btn].classList.add("correct");
    } else {
      choices[btn].classList.add("wrong");
      choices[currentQuestion.a].classList.add("correct");
    }
  }, 800);
});

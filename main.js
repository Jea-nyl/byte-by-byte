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

/* 🔌 INIT FIREBASE */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db, "control");

/* 🔊 AUDIO (BROWSER-BASED) */
const soundStart = new Audio("sounds/start.mp3");
const soundCorrect = new Audio("sounds/correct.mp3");
const soundWrong = new Audio("sounds/wrong.mp3");

soundStart.preload = "auto";
soundCorrect.preload = "auto";
soundWrong.preload = "auto";

/* 🎮 UI ELEMENTS */
const questionBox = document.getElementById("question");
const timerBox = document.getElementById("timer");
const suspenseBox = document.getElementById("suspense");
const scoreBox = document.getElementById("score");
const livesBox = document.getElementById("lives");

const choices = {
  A: document.getElementById("A"),
  B: document.getElementById("B"),
  C: document.getElementById("C"),
  D: document.getElementById("D")
};

/* 📚 QUESTIONS */
const categories = {
  Programming: [
    { q: "HTML stands for?", c: ["Hyper Text Markup Language","High Tech Machine Language","Home Tool Markup Language","Hyperlinks Text Machine"], a: "A" },
    { q: "Which is a programming language?", c: ["HTTP","Python","HTML","CSS"], a: "B" }
  ],
  Networking: [
    { q: "What device connects networks?", c: ["Router","RAM","CPU","SSD"], a: "A" },
    { q: "IP stands for?", c: ["Internet Provider","Internet Protocol","Internal Port","Input Process"], a: "B" }
  ]
};

/* 🎯 GAME STATE */
let currentQuestion = null;
let canAnswer = false;
let answerTimer, suspenseTimer;
let answerTime = 10;
let suspenseTime = 5;
let score = 0;
let lives = 5;

/* 🧹 HELPERS */
function resetChoices() {
  Object.values(choices).forEach(c => {
    c.classList.remove("active","correct","wrong");
  });
}

function updateHUD() {
  scoreBox.textContent = `Score: ${score}`;
  livesBox.textContent = `Lives: ${lives}`;
}

/* 🎲 RANDOM CATEGORY + QUESTION */
function loadRandomQuestion() {
  resetChoices();

  const catKeys = Object.keys(categories);
  const randomCat = catKeys[Math.floor(Math.random() * catKeys.length)];
  const list = categories[randomCat];

  currentQuestion = list[Math.floor(Math.random() * list.length)];

  questionBox.textContent = currentQuestion.q;

  ["A","B","C","D"].forEach((l,i)=>{
    choices[l].textContent = `${l}. ${currentQuestion.c[i]}`;
  });

  startAnswerTimer();
}

/* ⏱️ ANSWER TIMER (10s) */
function startAnswerTimer() {
  clearInterval(answerTimer);
  clearInterval(suspenseTimer);

  canAnswer = true;
  answerTime = 10;
  timerBox.textContent = `⏱️ ${answerTime}s`;
  suspenseBox.textContent = "";

  answerTimer = setInterval(() => {
    answerTime--;
    timerBox.textContent = `⏱️ ${answerTime}s`;

    if (answerTime <= 0) {
      clearInterval(answerTimer);
      canAnswer = false;
      revealAnswer(null);
    }
  }, 1000);
}

/* ⏳ SUSPENSE + RESULT (5s) */
function revealAnswer(selected) {
  clearInterval(answerTimer);
  canAnswer = false;

  suspenseTime = 5;
  suspenseBox.textContent = `⏳ ${suspenseTime}s`;

  suspenseTimer = setInterval(() => {
    suspenseTime--;
    suspenseBox.textContent = `⏳ ${suspenseTime}s`;

    if (suspenseTime <= 0) {
      clearInterval(suspenseTimer);
      suspenseBox.textContent = "";

      if (selected === currentQuestion.a) {
        document.body.style.background = "#14532d";
        choices[selected]?.classList.add("correct");
        soundCorrect.currentTime = 0;
        soundCorrect.play();
        score += 5;
      } else {
        document.body.style.background = "#7f1d1d";
        choices[currentQuestion.a].classList.add("correct");
        if (selected) choices[selected].classList.add("wrong");
        soundWrong.currentTime = 0;
        soundWrong.play();
        lives--;
      }

      updateHUD();

      setTimeout(() => {
        document.body.style.background = "#0f172a";
        resetChoices();

        if (lives <= 0) {
          questionBox.textContent = "GAME OVER";
          suspenseBox.textContent = "Press A to Restart";
          return;
        }

        loadRandomQuestion();
      }, 1500);
    }
  }, 1000);
}

/* 🎮 ESP32 BUTTON INPUT */
onValue(controlRef, snapshot => {
  const data = snapshot.val();
  if (!data || !data.button) return;

  const btn = data.button;
  set(controlRef, { button: "" });

  // Skip suspense if pressed
  if (!canAnswer && suspenseTimer) {
    clearInterval(suspenseTimer);
    suspenseBox.textContent = "";
    revealAnswer(btn);
    return;
  }

  if (!canAnswer) return;

  canAnswer = false;
  choices[btn]?.classList.add("active");
  revealAnswer(btn);
});

/* 🚀 START GAME */
updateHUD();
soundStart.play();
loadRandomQuestion();

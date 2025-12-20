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

/* 🔌 INITIALIZE FIREBASE */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db, "control");

/* 🎮 UI ELEMENTS */
const spinner = document.getElementById("spinner");
const timerBox = document.getElementById("timer");
const suspenseBox = document.getElementById("suspense");
const questionBox = document.getElementById("question");

const choices = {
  A: document.getElementById("A"),
  B: document.getElementById("B"),
  C: document.getElementById("C"),
  D: document.getElementById("D")
};

/* 🏆 SCORE & LIVES */
let score = 0;
let lives = 5;
const scoreBox = document.createElement("div");
scoreBox.style.marginTop = "10px";
document.body.insertBefore(scoreBox, spinner.nextSibling);

function updateHUD() {
  scoreBox.innerHTML = `⭐ Score: ${score} | ❤️ Lives: ${lives}`;
}
updateHUD();

/* 📚 QUESTIONS */
const categories = {
  Programming: [
    { q:"HTML stands for?", c:["Hyper Text Markup Language","High Tech","Home Tool","Hyperlinks"], a:"A" }
  ],
  Networking: [
    { q:"What device connects networks?", c:["Router","RAM","CPU","SSD"], a:"A" }
  ]
};

/* 🎯 GAME STATE */
let spinning = true;
let currentCategory = "";
let currentQuestion = null;
let canAnswer = false;

let answerTime = 10;
let suspenseTime = 5;
let answerInterval, suspenseInterval;

/* 🧹 HELPERS */
function resetChoices() {
  Object.values(choices).forEach(c => c.className = "choice");
}

/* 🎡 SPIN CATEGORY */
function spinCategory() {
  spinner.classList.add("spin");
  spinner.textContent = "🎡 Spinning...";

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

  startAnswerTimer();
}

/* ⏱️ 10-SECOND ANSWER TIMER */
function startAnswerTimer() {
  canAnswer = true;
  answerTime = 10;
  timerBox.textContent = `⏱️ Time left: ${answerTime}s`;

  answerInterval = setInterval(() => {
    answerTime--;
    timerBox.textContent = `⏱️ Time left: ${answerTime}s`;

    if (answerTime <= 0) {
      clearInterval(answerInterval);
      canAnswer = false;
      revealAnswer(null);
    }
  }, 1000);
}

/* ⏳ 5-SECOND SUSPENSE + RESULT */
function revealAnswer(selected) {
  clearInterval(answerInterval);
  suspenseTime = 5;
  suspenseBox.textContent = `⏳ Revealing in ${suspenseTime}s`;

  suspenseInterval = setInterval(() => {
    suspenseTime--;
    suspenseBox.textContent = `⏳ Revealing in ${suspenseTime}s`;

    if (suspenseTime <= 0) {
      clearInterval(suspenseInterval);
      suspenseBox.textContent = "";

      let result = "wrong";

      if (selected === currentQuestion.a) {
        result = "correct";
        score += 5;
        document.body.style.background = "#14532d"; // green flash
        choices[selected]?.classList.add("correct");
      } else {
        lives--;
        document.body.style.background = "#7f1d1d"; // red flash
        choices[currentQuestion.a]?.classList.add("correct");
        if (selected) choices[selected]?.classList.add("wrong");
      }

      updateHUD();

      // 🔌 Send result to ESP32
      set(controlRef, { result });

      setTimeout(() => {
        document.body.style.background = "#0f172a";

        // 🔹 Remove highlights before next question
        resetChoices();

        if (lives <= 0) {
          questionBox.textContent = "💀 GAME OVER";
          spinner.textContent = `FINAL SCORE: ${score}`;
          return;
        }

        spinning = true;
        spinCategory();
      }, 2000);
    }
  }, 1000);
}

/* 🎯 ESP32 BUTTON INPUT */
onValue(controlRef, snapshot => {
  const data = snapshot.val();
  if (!data || !data.button) return;

  const btn = data.button;
  set(controlRef, { button: "" });

  if (spinning) {
    spinCategory();
    return;
  }

  if (!canAnswer) return;

  canAnswer = false;
  choices[btn].classList.add("active");
  revealAnswer(btn);
});

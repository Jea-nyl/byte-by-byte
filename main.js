import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/***********************
 * FIREBASE CONFIG
 ***********************/
const firebaseConfig = {
  apiKey: "AIzaSyBkFUpf2JuYIch95wx9B4Rk-jp9I7IudJs",
  authDomain: "byte-by-byte-f7a4c.firebaseapp.com",
  databaseURL: "https://byte-by-byte-f7a4c-default-rtdb.firebaseio.com",
  projectId: "byte-by-byte-f7a4c",
  storageBucket: "byte-by-byte-f7a4c.firebasestorage.app",
  messagingSenderId: "838552047744",
  appId: "1:838552047744:web:f653b9fba96e49aa44d665"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/***********************
 * DOM ELEMENTS
 ***********************/
const questionBox = document.getElementById("question");
const suspenseBox = document.getElementById("suspense");
const timerBox = document.getElementById("timer");
const scoreBox = document.getElementById("score");
const livesBox = document.getElementById("lives");

const choices = {
  A: document.getElementById("choiceA"),
  B: document.getElementById("choiceB"),
  C: document.getElementById("choiceC"),
  D: document.getElementById("choiceD")
};

/***********************
 * GAME STATE
 ***********************/
let score = 0;
let lives = 5;
let currentQuestion = null;
let selectedChoice = null;

let answerTimer = null;
let suspenseTimer = null;
let timeLeft = 10;

/***********************
 * QUESTIONS
 ***********************/
const categories = {
  NETWORKING: [
    { q: "What device connects different networks together?", c: ["Router", "Switch", "Hub", "Modem"], a: "A" },
    { q: "What does IP stand for?", c: ["Internet Provider", "Internet Protocol", "Internal Program", "Input Port"], a: "B" },
    { q: "Which cable is commonly used in LAN?", c: ["HDMI", "Ethernet", "VGA", "USB"], a: "B" },
    { q: "What network covers a small area like a room?", c: ["WAN", "MAN", "LAN", "PAN"], a: "C" },
    { q: "Which device sends data wirelessly?", c: ["Router", "Switch", "Repeater", "Access Point"], a: "D" }
  ],

  HARDWARE: [
    { q: "Which part is the brain of the computer?", c: ["RAM", "CPU", "Hard Drive", "GPU"], a: "B" },
    { q: "Which stores data permanently?", c: ["RAM", "Cache", "SSD", "Register"], a: "C" },
    { q: "What device displays output?", c: ["Keyboard", "Mouse", "Monitor", "Scanner"], a: "C" },
    { q: "Which is an input device?", c: ["Printer", "Speaker", "Monitor", "Keyboard"], a: "D" },
    { q: "What hardware is used to hear sound?", c: ["Microphone", "Speaker", "Webcam", "Monitor"], a: "B" }
  ],

  SOFTWARE: [
    { q: "Which is an operating system?", c: ["Google", "Windows", "Chrome", "Intel"], a: "B" },
    { q: "Which software is used for documents?", c: ["MS Word", "Photoshop", "Chrome", "Zoom"], a: "A" },
    { q: "What software controls the hardware?", c: ["Application", "Driver", "Operating System", "Browser"], a: "C" },
    { q: "Which is a programming language?", c: ["HTML", "Python", "HTTP", "WiFi"], a: "B" },
    { q: "Which is NOT software?", c: ["Linux", "Windows", "Mouse", "Android"], a: "C" }
  ],

  PEOPLE: [
    { q: "Who writes computer programs?", c: ["Designer", "Programmer", "User", "Technician"], a: "B" },
    { q: "Who maintains computer systems?", c: ["System Administrator", "Student", "Teacher", "User"], a: "A" },
    { q: "Who analyzes system requirements?", c: ["Analyst", "Coder", "Operator", "Tester"], a: "A" },
    { q: "Who tests software for errors?", c: ["Programmer", "Tester", "User", "Manager"], a: "B" },
    { q: "Who manages IT projects?", c: ["Technician", "Manager", "Analyst", "Operator"], a: "B" }
  ],

  DATABASE: [
    { q: "What is a database?", c: ["A website", "A collection of data", "A program", "A computer"], a: "B" },
    { q: "Which is a database software?", c: ["MySQL", "HTML", "CSS", "Java"], a: "A" },
    { q: "What is a table in a database?", c: ["Row only", "Column only", "Structured data", "File"], a: "C" },
    { q: "What identifies a record uniquely?", c: ["Foreign Key", "Primary Key", "Index", "Row"], a: "B" },
    { q: "Which command retrieves data?", c: ["INSERT", "UPDATE", "DELETE", "SELECT"], a: "D" }
  ]
};

let availableQuestions = JSON.parse(JSON.stringify(categories));

/***********************
 * GAME FUNCTIONS
 ***********************/
function resetChoices() {
  selectedChoice = null;
  Object.values(choices).forEach(btn => {
    btn.className = "choice";
  });
  document.body.classList.remove("correct", "wrong");
}

function startAnswerTimer() {
  clearInterval(answerTimer);
  timeLeft = 10;
  timerBox.textContent = `⏱️ ${timeLeft}`;

  answerTimer = setInterval(() => {
    timeLeft--;
    timerBox.textContent = `⏱️ ${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(answerTimer);
      revealAnswer();
    }
  }, 1000);
}

function revealAnswer() {
  clearInterval(answerTimer);

  const correct = currentQuestion.a;

  Object.keys(choices).forEach(k => {
    if (k === correct) choices[k].classList.add("correct");
  });

  if (selectedChoice !== correct) {
    document.body.classList.add("wrong");
    lives--;
  } else {
    document.body.classList.add("correct");
    score += 5;
  }

  updateHUD();

  suspenseBox.textContent = "Revealing answer...";
  suspenseTimer = setTimeout(() => {
    suspenseBox.textContent = "";
    resetChoices();
    nextQuestion();
  }, 5000);
}

function nextQuestion() {
  if (lives <= 0) {
    endGame("GAME OVER");
    return;
  }

  const cats = Object.keys(availableQuestions).filter(
    c => availableQuestions[c].length > 0
  );

  if (cats.length === 0) {
    endGame("QUIZ COMPLETED!");
    return;
  }

  const cat = cats[Math.floor(Math.random() * cats.length)];
  const qIndex = Math.floor(Math.random() * availableQuestions[cat].length);
  currentQuestion = availableQuestions[cat].splice(qIndex, 1)[0];

  questionBox.textContent = `[${cat}] ${currentQuestion.q}`;
  ["A", "B", "C", "D"].forEach((l, i) => {
    choices[l].textContent = `${l}. ${currentQuestion.c[i]}`;
  });

  startAnswerTimer();
}

function endGame(text) {
  questionBox.textContent = text;
  suspenseBox.textContent = "Press A to Restart | Press B for Menu";
  timerBox.textContent = "";
}

function updateHUD() {
  scoreBox.textContent = `Score: ${score}`;
  livesBox.textContent = `Lives: ${lives}`;
}

/***********************
 * BUTTON INPUT (ESP32 / FIREBASE)
 ***********************/
db.ref("game/control").on("value", snap => {
  const val = snap.val();
  if (!val || !val.button) return;

  handleButton(val.button);

  db.ref("game/control").set({});
});

function handleButton(btn) {
  if (!currentQuestion) return;

  if (["A", "B", "C", "D"].includes(btn)) {
    resetChoices();
    selectedChoice = btn;
    choices[btn].classList.add("selected");
  }
}

/***********************
 * START GAME
 ***********************/
updateHUD();
nextQuestion();

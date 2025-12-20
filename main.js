import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ===== FIREBASE CONFIG ===== */
const firebaseConfig = {
  apiKey: "AIzaSyBkFUpf2JuYIch95wx9B4Rk-jp9I7IudJs",
  authDomain: "byte-by-byte-f7a4c.firebaseapp.com",
  databaseURL: "https://byte-by-byte-f7a4c-default-rtdb.firebaseio.com",
  projectId: "byte-by-byte-f7a4c",
  storageBucket: "byte-by-byte-f7a4c.firebasestorage.app",
  messagingSenderId: "838552047744",
  appId: "1:838552047744:web:f653b9fba96e49aa44d665"
};

/* ===== INITIALIZE FIREBASE ===== */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db, "control");

/* ===== UI ELEMENTS ===== */
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

/* ===== SCORE & LIVES ===== */
let score = 0;
let lives = 5;

const scoreBox = document.createElement("div");
scoreBox.style.marginTop = "10px";
document.body.insertBefore(scoreBox, spinner.nextSibling);

function updateHUD() {
  scoreBox.innerHTML = `⭐ Score: ${score} | ❤️ Lives: ${lives}`;
}
updateHUD();

/* ===== QUESTIONS & CATEGORIES ===== */
const categories = {
  Programming: [
    { q: "HTML stands for?", c: ["Hyper Text Markup Language","High Tech","Home Tool","Hyperlinks"], a: "A" },
    { q: "Which is a programming language?", c: ["HTTP","HTML","Python","CSS"], a: "C" },
    { q: "JS comment symbol?", c: ["//","##","<!--","**"], a: "A" },
    { q: "CSS styles?", c: ["Logic","Database","Design","Server"], a: "C" },
    { q: "Which is not a loop?", c: ["for","while","if","do-while"], a: "C" }
  ],
  Networking: [
    { q: "Device that connects networks?", c: ["Router","RAM","CPU","SSD"], a: "A" },
    { q: "IP stands for?", c: ["Internet Protocol","Internal Process","Input Port","Internet Provider"], a: "A" },
    { q: "LAN means?", c: ["Large Area Network","Local Area Network","Logical Access Node","Low Area Network"], a: "B" },
    { q: "Which uses WiFi?", c: ["Ethernet","Bluetooth","Wireless","Fiber"], a: "C" },
    { q: "IP belongs to which layer?", c: ["Physical","Transport","Network","Application"], a: "C" }
  ],
  Hardware: [
    { q: "CPU stands for?", c: ["Central Processing Unit","Computer Power Unit","Control Processor Unit","Central Programming Unit"], a: "A" },
    { q: "RAM is volatile?", c: ["Yes","No","Sometimes","Depends"], a: "A" },
    { q: "SSD vs HDD, which is faster?", c: ["SSD","HDD","Equal","Depends"], a: "A" },
    { q: "GPU is used for?", c: ["Graphics","CPU","Storage","Networking"], a: "A" },
    { q: "Motherboard connects?", c: ["CPU, RAM, GPU","CPU only","RAM only","GPU only"], a: "A" }
  ],
  Cybersecurity: [
    { q: "Phishing is?", c: ["Email scam","Firewall","Encryption","Virus"], a: "A" },
    { q: "HTTPS protects?", c: ["Data","Power","Hardware","Network"], a: "A" },
    { q: "Strong password should?", c: ["Include symbols","Be short","Name only","1234"], a: "A" },
    { q: "Malware is?", c: ["Malicious software","Hardware","CPU","Network device"], a: "A" },
    { q: "Two-factor authentication?", c: ["Extra login step","Password only","Email only","Username only"], a: "A" }
  ],
  Databases: [
    { q: "SQL stands for?", c: ["Structured Query Language","Simple Query Logic","Server Question Language","Storage Query Language"], a: "A" },
    { q: "Primary key?", c: ["Unique identifier","Repeated value","Null","Secondary key"], a: "A" },
    { q: "CRUD stands for?", c: ["Create Read Update Delete","Copy Run Undo Delete","Compute Read Update Delete","Create Run Undo Drop"], a: "A" },
    { q: "Index in DB is?", c: ["Faster search","Slower search","Delete data","Add column"], a: "A" },
    { q: "SQL command to remove table?", c: ["DROP TABLE","DELETE TABLE","REMOVE TABLE","CLEAR TABLE"], a: "A" }
  ]
};

/* ===== GAME STATE ===== */
let spinning = true;
let currentCategory = "";
let currentQuestion = null;
let canAnswer = false;
let answerTime = 10;
let suspenseTime = 5;
let answerInterval, suspenseInterval;

/* ===== HELPERS ===== */
function resetChoices() {
  Object.values(choices).forEach(c => c.className = "choice");
}

/* ===== SPIN CATEGORY ===== */
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

/* ===== LOAD QUESTION ===== */
function loadQuestion() {
  const list = categories[currentCategory];
  currentQuestion = list[Math.floor(Math.random() * list.length)];

  questionBox.textContent = currentQuestion.q;

  ["A","B","C","D"].forEach((l,i)=>{
    choices[l].textContent = `${l}. ${currentQuestion.c[i]}`;
  });

  startAnswerTimer();
}

/* ===== 10s ANSWER TIMER ===== */
function startAnswerTimer() {
  canAnswer = true;
  answerTime = 10;
  timerBox.textContent = `⏱️ Time left: ${answerTime}s`;

  answerInterval = setInterval(() => {
    answerTime--;
    timerBox.textContent = `⏱️ Time left: ${answerTime}s`;

    if(answerTime <= 0){
      clearInterval(answerInterval);
      canAnswer = false;
      revealAnswer(null);
    }
  }, 1000);
}

/* ===== 5s SUSPENSE + RESULT ===== */
function revealAnswer(selected){
  resetChoices();
  clearInterval(answerInterval);

  suspenseTime = 5;
  suspenseBox.textContent = `⏳ Revealing in ${suspenseTime}s`;

  suspenseInterval = setInterval(() => {
    suspenseTime--;
    suspenseBox.textContent = `⏳ Revealing in ${suspenseTime}s`;

    if(suspenseTime <= 0){
      clearInterval(suspenseInterval);
      suspenseBox.textContent = "";

      let result = "wrong";

      if(selected === currentQuestion.a){
        result = "correct";
        score += 5;
        document.body.style.background = "#14532d";
        choices[selected]?.classList.add("correct");
      } else {
        lives--;
        document.body.style.background = "#7f1d1d";
        choices[currentQuestion.a]?.classList.add("correct");
        if(selected) choices[selected]?.classList.add("wrong");
      }

      updateHUD();

      // 🔌 SEND RESULT TO ESP32
      set(controlRef, { result });

      setTimeout(()=>{
        document.body.style.background = "#0f172a";

        if(lives <= 0){
          questionBox.textContent = "💀 GAME OVER";
          spinner.textContent = `FINAL SCORE: ${score}`;
          return;
        }

        spinning = true;
        spinCategory();
      },2000);
    }
  },1000);
}

/* ===== ESP32 BUTTON INPUT ===== */
onValue(controlRef, snapshot=>{
  const data = snapshot.val();
  if(!data || !data.button) return;

  const btn = data.button;
  set(controlRef, { button: "" });

  if(spinning){
    spinCategory();
    return;
  }

  if(!canAnswer) return;

  canAnswer = false;
  choices[btn]?.classList.add("active");
  revealAnswer(btn);
});

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
const scoreLivesBox = document.getElementById("scoreLives");

const choices = {
  A: document.getElementById("A"),
  B: document.getElementById("B"),
  C: document.getElementById("C"),
  D: document.getElementById("D")
};

/* 📚 QUESTIONS */
const categories = {
  Programming: [
    { q:"HTML stands for?", c:["Hyper Text Markup Language","High Tech","Home Tool","Hyperlinks"], a:"A" },
    { q:"CSS is used for?", c:["Styling","Programming","Database","Networking"], a:"A" },
    { q:"JavaScript is?", c:["Programming language","Database","Hardware","Network protocol"], a:"A" },
    { q:"Bootstrap is?", c:["CSS framework","Database","OS","Server"], a:"A" },
    { q:"Git is used for?", c:["Version control","Networking","CPU","Storage"], a:"A" }
  ],
  Networking: [
    { q:"What device connects networks?", c:["Router","RAM","CPU","SSD"], a:"A" },
    { q:"IP stands for?", c:["Internet Protocol","Internal Process","Instant Print","Input Port"], a:"A" },
    { q:"LAN means?", c:["Local Area Network","Large Access Node","Linked Application","Light Area Network"], a:"A" },
    { q:"HTTP is?", c:["Protocol","Programming language","Hardware","Software"], a:"A" },
    { q:"DNS translates?", c:["Domain names to IP","HTML to CSS","JavaScript to HTML","IP to URL"], a:"A" }
  ]
};

/* 🎯 GAME STATE */
let gameState = "menu"; // menu, playing, gameover
let spinning = false;
let currentCategory = "";
let currentQuestion = null;
let canAnswer = false;

let score = 0;
let lives = 5;

let answerTime = 10;
let suspenseTime = 5;
let answerInterval, suspenseInterval;

/* 🧹 HELPERS */
function resetChoices() {
  Object.values(choices).forEach(c => c.className = "choice");
}

function updateHUD() {
  scoreLivesBox.innerHTML = `⭐ Score: ${score} | ❤️ Lives: ${lives}`;
}

/* 🎡 RANDOM CATEGORY "SPINNER" */
function spinCategory() {
  spinning = true;
  const categoryKeys = Object.keys(categories);
  let i = 0;

  spinner.textContent = "🎡 Selecting category...";
  const flashInterval = setInterval(() => {
    spinner.textContent = `📂 ${categoryKeys[i % categoryKeys.length]}`;
    i++;
  }, 100);

  setTimeout(() => {
    clearInterval(flashInterval);
    currentCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    spinner.textContent = `📂 Category: ${currentCategory}`;
    loadQuestion();
    spinning = false;
  }, 1500);
}

/* ❓ LOAD QUESTION */
function loadQuestion() {
  const list = categories[currentCategory];
  currentQuestion = list[Math.floor(Math.random() * list.length)];

  questionBox.textContent = currentQuestion.q;
  ["A","B","C","D"].forEach((l,i)=>{
    choices[l].textContent = `${l}. ${currentQuestion.c[i]}`;
  });

  startAnswerTimer();
}

/* ⏱️ ANSWER TIMER 10s */
function startAnswerTimer() {
  canAnswer = true;
  answerTime = 10;
  timerBox.textContent = `⏱️ Time left: ${answerTime}s`;

  answerInterval = setInterval(()=>{
    answerTime--;
    timerBox.textContent = `⏱️ Time left: ${answerTime}s`;

    if(answerTime <= 0){
      clearInterval(answerInterval);
      canAnswer = false;
      revealAnswer(null);
    }
  },1000);
}

/* ⏳ SUSPENSE + RESULT */
function revealAnswer(selected){
  clearInterval(answerInterval);
  suspenseTime = 5;
  suspenseBox.textContent = `⏳ Revealing in ${suspenseTime}s`;

  suspenseInterval = setInterval(()=>{
    suspenseTime--;
    suspenseBox.textContent = `⏳ Revealing in ${suspenseTime}s`;

    if(suspenseTime <=0){
      clearInterval(suspenseInterval);
      suspenseBox.textContent = "";

      resetChoices();

      if(selected === currentQuestion.a){
        document.body.classList.add("correct-flash");
        score +=5;
        choices[selected]?.classList.add("correct");
      } else {
        document.body.classList.add("wrong-flash");
        lives--;
        choices[currentQuestion.a]?.classList.add("correct");
        if(selected) choices[selected]?.classList.add("wrong");
      }

      updateHUD();

      // Send result to ESP32 if needed
      set(controlRef,{ result: selected === currentQuestion.a ? "correct" : "wrong" });

      setTimeout(()=>{
        document.body.classList.remove("correct-flash","wrong-flash");
        resetChoices();

        if(lives<=0){
          gameOverScreen();
        } else {
          spinning = true;
          spinCategory();
        }
      },1000);
    }
  },1000);
}

/* 🕹️ GAME OVER SCREEN */
function gameOverScreen(){
  gameState="gameover";
  questionBox.textContent = "💀 GAME OVER";
  spinner.textContent = "Press A button to Restart | B button to Main Menu";
  timerBox.textContent = "";
  suspenseBox.textContent = "";
}

/* 🕹️ MAIN MENU */
function mainMenu(){
  gameState="menu";
  spinner.textContent = "Press A button to Start";
  questionBox.textContent = "";
  timerBox.textContent="";
  suspenseBox.textContent="";
  resetChoices();
  score=0; lives=5;
  updateHUD();
}

/* 🎯 ESP32 BUTTON INPUT */
onValue(controlRef, snapshot=>{
  const data = snapshot.val();
  if(!data || !data.button) return;
  const btn = data.button;
  set(controlRef,{button:""});

  // BUTTON LOGIC BASED ON GAME STATE
  if(gameState==="menu"){
    if(btn==="A") { gameState="playing"; spinCategory(); }
  } else if(gameState==="playing"){
    if(spinning) { spinCategory(); return; }
    if(!canAnswer) return;

    canAnswer=false;
    choices[btn]?.classList.add("active");
    revealAnswer(btn);
  } else if(gameState==="gameover"){
    if(btn==="A") { score=0; lives=5; updateHUD(); gameState="playing"; spinCategory(); }
    else if(btn==="B"){ mainMenu(); }
  }
});

/* 🔹 START AT MAIN MENU */
mainMenu();

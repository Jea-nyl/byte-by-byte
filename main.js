import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBkFUpf2JuYIch95wx9B4Rk-jp9I7IudJs",
  authDomain: "byte-by-byte-f7a4c.firebaseapp.com",
  databaseURL: "https://byte-by-byte-f7a4c-default-rtdb.firebaseio.com",
  projectId: "byte-by-byte-f7a4c",
  storageBucket: "byte-by-byte-f7a4c.appspot.com",
  messagingSenderId: "838552047744",
  appId: "1:838552047744:web:f653b9fba96e49aa44d665"
};

/* 🔌 INITIALIZE FIREBASE */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db,"control");
const leaderboardRef = ref(db,"leaderboard");

/* 🎮 UI ELEMENTS */
const spinner = document.getElementById("spinner");
const timerBox = document.getElementById("timer");
const suspenseBox = document.getElementById("suspense");
const questionBox = document.getElementById("question");
const scoreLivesBox = document.getElementById("scoreLives");
const streakBox = document.getElementById("streak").querySelector("span");
const questionCounterBox = document.getElementById("questionCounter");
const choices = { A: document.getElementById("A"), B: document.getElementById("B"), C: document.getElementById("C"), D: document.getElementById("D") };

/* 🎲 GAME DATA */
const categories = {
  DATABASE: [
    {q:"What is SQL used for?", c:["Styling websites","Querying databases","Managing network devices","Writing operating systems"], a:"B"},
    {q:"What is a primary key?", c:["Unique identifier for a record","A type of index","A table name","Column description"], a:"A"},
    {q:"Which type of database is relational?", c:["MongoDB","MySQL","Redis","Cassandra"], a:"B"},
    {q:"What does ACID in databases stand for?", c:["Access, Control, Integrity, Data","Atomicity, Consistency, Isolation, Durability","Application, Connection, Index, Data","Architecture, Code, Interface, Design"], a:"B"},
    {q:"What is normalization in databases?", c:["Improving performance of CPU","Structuring data to reduce redundancy","Installing database software","Encrypting database"], a:"B"}
  ],
  NETWORKING: [
    {q:"Device connecting networks?", c:["Router","RAM","CPU","SSD"], a:"A"},
    {q:"IP stands for?", c:["Internet Protocol","Internal Process","Interface Program","Internet Page"], a:"A"},
    {q:"TCP is?", c:["Transmission Control Protocol","Text Control Program","Terminal Communication Process","Transfer Connection Protocol"], a:"A"},
    {q:"LAN means?", c:["Large Area Network","Local Area Network","Long Access Network","Local Application Network"], a:"B"},
    {q:"DNS translates?", c:["IP to Name","Name to IP","Both","None"], a:"C"}
  ],
  HARDWARE: [
    {q:"CPU stands for?", c:["Central Processing Unit","Computer Peripheral Unit","Central Programming Utility","Control Processing Unit"], a:"A"},
    {q:"RAM used for?", c:["Permanent storage","Temporary memory while programs run","Network connectivity","Graphics rendering"], a:"B"},
    {q:"Which outputs visuals?", c:["CPU","GPU","RAM","SSD"], a:"B"},
    {q:"Non-volatile storage?", c:["RAM","Cache","SSD","Register"], a:"C"},
    {q:"Which component powers computer?", c:["Motherboard","PSU","CPU","GPU"], a:"B"}
  ],
  SOFTWARE: [
    {q:"Operating system?", c:["Windows 10","Microsoft Word","Chrome","Photoshop"], a:"A"},
    {q:"Microsoft Excel type?", c:["System software","Application software","Utility software","Firmware"], a:"B"},
    {q:"Open-source software?", c:["Cannot access","Public source code","Enterprise only","Free but closed"], a:"B"},
    {q:"IDE used for?", c:["Network monitoring","Writing/debugging code","Database backup","Hardware management"], a:"B"},
    {q:"Patch in software?", c:["Bug in code","Update to fix issues","Programming language","Type of OS"], a:"B"}
  ],
  PEOPLE: [
    {q:"IT infrastructure manager?", c:["DB Admin","Network Engineer","IT Manager","Developer"], a:"C"},
    {q:"Who writes programs?", c:["System Analyst","Software Developer","Network Admin","Security Analyst"], a:"B"},
    {q:"Who ensures security policies?", c:["DB Admin","Security Analyst","Project Manager","UX Designer"], a:"B"},
    {q:"Who plans IT projects?", c:["IT Manager","Project Manager","Help Desk","Architect"], a:"B"},
    {q:"Who improves system usability?", c:["UX/UI Designer","Network Engineer","IT Support","QA Tester"], a:"A"}
  ]
};

/* 🎯 GAME STATE */
let gameState = "menu";
let currentCategory = "", currentQuestion = null;
let usedQuestions = [];
let canAnswer = false;
let score = 0, lives = 3;
let streak = 0, maxStreak = 0;
let questionIndex = 0, totalQuestions = 25;
let answerInterval, suspenseInterval;

/* 🧹 HELPERS */
function resetChoices(){ Object.values(choices).forEach(c=>c.className="choice"); }
function updateScoreLives(){ scoreLivesBox.textContent = `⭐ Score: ${score} | ❤️ Lives: ${lives}`; }
function updateStreak(){ streakBox.textContent = streak; }
function updateQuestionCounter(){ questionCounterBox.textContent = `❓ Question ${questionIndex}/${totalQuestions}`; }

/* 🎡 RANDOM CATEGORY + QUESTION */
function getNextQuestion(){
  const allQuestions = Object.values(categories).flat();
  const remaining = allQuestions.filter(q=>!usedQuestions.includes(q));
  if(remaining.length === 0) return null;
  const q = remaining[Math.floor(Math.random()*remaining.length)];
  usedQuestions.push(q);
  return q;
}

/* ❓ LOAD QUESTION */
function loadQuestion(){
  if(questionIndex >= totalQuestions){ gameOver(); return; }
  questionIndex++;
  updateQuestionCounter();
  currentQuestion = getNextQuestion();
  if(!currentQuestion){ gameOver(); return; }

  spinner.textContent = `📂 Category: ${currentCategory || "Random"}`;
  questionBox.textContent = currentQuestion.q;
  ["A","B","C","D"].forEach((l,i)=> choices[l].textContent = `${l}. ${currentQuestion.c[i]}`);
  startAnswerTimer();
}

/* ⏱ ANSWER TIMER */
function startAnswerTimer(){
  canAnswer = true;
  let time = 10;
  timerBox.textContent = `⏱️ Time left: ${time}s`;
  answerInterval = setInterval(()=>{
    time--;
    timerBox.textContent = `⏱️ Time left: ${time}s`;
    if(time<=0){ clearInterval(answerInterval); canAnswer=false; revealAnswer(null); }
  },1000);
}

/* ⏳ REVEAL ANSWER */
function revealAnswer(selected){
  clearInterval(answerInterval);
  resetChoices();
  let suspense = 3;
  suspenseBox.textContent = `⏳ Revealing in ${suspense}s`;
  suspenseInterval = setInterval(()=>{
    suspense--;
    suspenseBox.textContent = `⏳ Revealing in ${suspense}s`;
    if(suspense <= 0){
      clearInterval(suspenseInterval);
      suspenseBox.textContent="";
      if(selected === currentQuestion.a){
        score += 5 + streak; // streak bonus
        streak++;
        if(streak > maxStreak) maxStreak = streak;
        choices[selected]?.classList.add("correct");
      } else {
        lives--;
        streak = 0;
        choices[currentQuestion.a]?.classList.add("correct");
        if(selected) choices[selected]?.classList.add("wrong");
      }
      updateScoreLives();
      updateStreak();
      if(lives <=0){ gameOver(); } else { loadQuestion(); }
    }
  },1000);
}

/* 💀 GAME OVER */
function gameOver(){
  gameState="gameover";
  spinner.textContent="💀 Game Over";
  questionBox.textContent=`Final Score: ${score} | Max Streak: ${maxStreak}`;
  timerBox.style.display="none";
  suspenseBox.style.display="none";
  questionCounterBox.style.display="none";
  Object.values(choices).forEach(c=>c.style.display="none");

  // push score, maxStreak, time to Firebase
  push(leaderboardRef,{
    score,
    streak: maxStreak,
    time: new Date().toISOString()
  });
}

/* 🔌 ESP32 BUTTON INPUT */
onValue(controlRef, snap=>{
  const data = snap.val();
  if(!data || !data.button) return;
  const btn = data.button;
  set(controlRef,{button:""}); // reset

  if(gameState === "menu"){
    if(btn==="A"){
      gameState="playing"; score=0; lives=3; streak=0; maxStreak=0; questionIndex=0;
      usedQuestions=[];
      updateScoreLives(); updateStreak(); updateQuestionCounter();
      Object.values(choices).forEach(c=>c.style.display="block");
      spinner.style.display="block"; timerBox.style.display="block"; suspenseBox.style.display="block"; questionCounterBox.style.display="block";
      loadQuestion();
    }
    return;
  }

  if(gameState==="playing" && canAnswer){
    canAnswer=false;
    choices[btn]?.classList.add("active");
    revealAnswer(btn);
  }

  if(gameState==="gameover"){
    if(btn==="A"){ location.reload(); }
    if(btn==="B"){ location.href="index.html"; }
  }
});

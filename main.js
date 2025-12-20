import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBkFUpf2JuYIch95wx9B4Rk-jp9I7IudJs",
  authDomain: "byte-by-byte-f7a4c.firebaseapp.com",
  databaseURL: "https://byte-by-byte-f7a4c-default-rtdb.firebaseio.com",
  projectId: "byte-by-byte-f7a4c",
  storageBucket: "byte-by-byte-f7a4c.firebasestorage.app",
  messagingSenderId: "838552047744",
  appId: "1:838552047744:web:f653b9fba96e49d665"
};

/* 🔌 INITIALIZE FIREBASE */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db,"control");

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

/* 📚 QUESTIONS (example, expand as needed) */
const categories = {
  Programming: [
    { q: "HTML stands for?", c:["Hyper Text Markup Language","High Tech Machine Language","Home Tool Markup Language","Hyperlinks Text Machine"], a:"A" }
  ],
  Networking: [
    { q: "What device connects networks?", c:["Router","RAM","CPU","SSD"], a:"A" }
  ]
};

/* 🎯 GAME STATE */
let spinning = true;
let currentCategory = "";
let currentQuestion = null;
let canAnswer = false;
let lives = 5;
let playerScore = 0;

let answerTime = parseInt(localStorage.getItem("answerTime"))||10;
let suspenseTime = parseInt(localStorage.getItem("revealTime"))||5;
let answerInterval, suspenseInterval;

/* 🧹 HELPERS */
function resetChoices(){
  Object.values(choices).forEach(c => c.className = "choice");
}

function spinCategory(){
  const keys = Object.keys(categories);
  currentCategory = keys[Math.floor(Math.random()*keys.length)];
  spinner.textContent = `📂 Category: ${currentCategory}`;
  loadQuestion();
  spinning = false;
}

function loadQuestion(){
  const list = categories[currentCategory];
  currentQuestion = list[Math.floor(Math.random()*list.length)];
  questionBox.textContent = currentQuestion.q;
  ["A","B","C","D"].forEach((l,i)=>{
    choices[l].textContent = `${l}. ${currentQuestion.c[i]}`;
  });
  startAnswerTimer();
}

/* ⏱️ 10s ANSWER TIMER */
function startAnswerTimer(){
  canAnswer = true;
  let timeLeft = answerTime;
  timerBox.textContent = `⏱️ Time left: ${timeLeft}s`;
  answerInterval = setInterval(()=>{
    timeLeft--;
    timerBox.textContent = `⏱️ Time left: ${timeLeft}s`;
    if(timeLeft<=0){
      clearInterval(answerInterval);
      canAnswer=false;
      revealAnswer(null);
    }
  },1000);
}

/* ⏳ 5s SUSPENSE + RESULT */
function revealAnswer(selected){
  resetChoices();
  clearInterval(answerInterval);
  let suspense = suspenseTime;
  suspenseBox.textContent = `⏳ Revealing in ${suspense}s`;
  suspenseInterval = setInterval(()=>{
    suspense--;
    suspenseBox.textContent = `⏳ Revealing in ${suspense}s`;
    if(suspense<=0){
      clearInterval(suspenseInterval);
      suspenseBox.textContent = "";

      if(selected===currentQuestion.a){
        playerScore +=5;
        document.body.style.transition="background 0.5s";
        document.body.style.background="#14532d"; // green flash
        choices[selected].classList.add("correct");
      } else {
        lives--;
        document.body.style.transition="background 0.5s";
        document.body.style.background="#7f1d1d"; // red flash
        if(selected) choices[selected].classList.add("wrong");
        choices[currentQuestion.a].classList.add("correct");
      }

      setTimeout(()=>{
        document.body.style.background="#0f172a";
        if(lives<=0){
          gameOver();
        } else {
          spinning=true;
          spinCategory();
        }
      },1000);
    }
  },1000);
}

/* 💀 GAME OVER */
function gameOver(){
  spinner.textContent="💀 Game Over!";
  questionBox.textContent="Press C to restart, D to Main Menu";
  resetChoices();
  canAnswer=false;

  // Push score to Firebase
  const leaderboardRef = ref(db,"leaderboard");
  push(leaderboardRef,{
    score: playerScore,
    timestamp: Date.now()
  });
}

/* 🔌 ESP32 BUTTON INPUT */
onValue(controlRef, snapshot=>{
  const data = snapshot.val();
  if(!data || !data.button) return;
  const btn = data.button;
  set(controlRef,{button:""}); // reset

  if(spinning){
    spinCategory();
    return;
  }

  if(!canAnswer && lives>0){
    // Game over controls
    if(btn==="C"){ // restart
      lives=5; playerScore=0; spinning=true; spinCategory();
    } else if(btn==="D"){ // back to menu
      window.location.href="index.html";
    }
    return;
  }

  if(!canAnswer) return;

  canAnswer=false;
  choices[btn].classList.add("active");
  revealAnswer(btn);
});

/* 🎉 START GAME */
spinner.textContent="🎡 Press any button to start";

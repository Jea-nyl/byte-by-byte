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
  appId: "1:838552047744:web:f653b9fba96e49aa44d665"
};

/* 🔌 INITIALIZE FIREBASE */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db, "control");

/* 🎮 UI ELEMENTS */
const menuContent = document.getElementById("menuContent");
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

/* 🎲 GAME DATA */
const categories = {
  Programming: [
    { q:"HTML stands for?", c:["Hyper Text Markup Language","High Tech Machine Language","Home Tool Markup Language","Hyperlinks Text Machine"], a:"A" },
    { q:"CSS stands for?", c:["Creative Style Sheets","Cascading Style Sheets","Computer Style Sheet","Colorful Style Sheets"], a:"B" },
    { q:"JS is used for?", c:["Styling pages","Adding interactivity","Database","Networking"], a:"B" },
    { q:"Which is frontend?", c:["React","Node.js","MongoDB","Python"], a:"A" },
    { q:"Which is backend?", c:["React","HTML","Node.js","CSS"], a:"C" }
  ],
  Networking: [
    { q:"Device connecting networks?", c:["Router","RAM","CPU","SSD"], a:"A" },
    { q:"IP stands for?", c:["Internet Protocol","Internal Process","Interface Program","Internet Page"], a:"A" },
    { q:"TCP is?", c:["Transmission Control Protocol","Text Control Program","Terminal Communication Process","Transfer Connection Protocol"], a:"A" },
    { q:"LAN means?", c:["Large Area Network","Local Area Network","Long Access Network","Local Application Network"], a:"B" },
    { q:"DNS translates?", c:["IP to Name","Name to IP","Both","None"], a:"C" }
  ]
};

/* 🎯 GAME STATE */
let gameState = "menu"; // menu / playing / settings / leaderboard / intro / gameover
let currentCategory = "";
let currentQuestion = null;
let canAnswer = false;
let score = 0;
let lives = 5;
let answerTime = 10;
let suspenseTime = 5;
let answerInterval, suspenseInterval;

/* 🧹 HELPERS */
function showMenu() {
  menuContent.style.display = "block";
  spinner.style.display = "none";
  timerBox.style.display = "none";
  suspenseBox.style.display = "none";
  questionBox.style.display = "none";
  scoreLivesBox.style.display = "none";
  Object.values(choices).forEach(c => c.style.display="none");
  menuContent.innerHTML = "A → Start<br>B → Settings<br>C → Leaderboard<br>D → Introduction";
  gameState="menu";
}

function showGameUI(){
  menuContent.style.display = "none";
  spinner.style.display = "block";
  timerBox.style.display = "block";
  suspenseBox.style.display = "block";
  questionBox.style.display = "block";
  scoreLivesBox.style.display = "inline-block";
  Object.values(choices).forEach(c => c.style.display="block");
}

function resetChoices(){
  Object.values(choices).forEach(c=>c.className="choice");
}

/* 🎡 RANDOM CATEGORY */
function selectRandomCategory(){
  const keys = Object.keys(categories);
  currentCategory = keys[Math.floor(Math.random()*keys.length)];
  spinner.textContent = `📂 Category: ${currentCategory}`;
  loadQuestion();
}

/* ❓ LOAD QUESTION */
function loadQuestion(){
  const list = categories[currentCategory];
  currentQuestion = list[Math.floor(Math.random()*list.length)];
  questionBox.textContent = currentQuestion.q;
  ["A","B","C","D"].forEach((l,i)=> choices[l].textContent=`${l}. ${currentQuestion.c[i]}`);
  startAnswerTimer();
}

/* ⏱️ ANSWER TIMER */
function startAnswerTimer(){
  canAnswer=true;
  let time=answerTime;
  timerBox.textContent = `⏱️ Time left: ${time}s`;
  answerInterval=setInterval(()=>{
    time--;
    timerBox.textContent=`⏱️ Time left: ${time}s`;
    if(time<=0){
      clearInterval(answerInterval);
      canAnswer=false;
      revealAnswer(null);
    }
  },1000);
}

/* ⏳ REVEAL ANSWER */
function revealAnswer(selected){
  resetChoices();
  clearInterval(answerInterval);
  let suspense=suspenseTime;
  suspenseBox.textContent=`⏳ Revealing in ${suspense}s`;

  suspenseInterval=setInterval(()=>{
    suspense--;
    suspenseBox.textContent=`⏳ Revealing in ${suspense}s`;
    if(suspense<=0){
      clearInterval(suspenseInterval);
      suspenseBox.textContent="";
      if(selected===currentQuestion.a){
        document.body.classList.add("correct-flash");
        score+=5;
        choices[selected]?.classList.add("correct");
      } else {
        document.body.classList.add("wrong-flash");
        lives--;
        choices[currentQuestion.a]?.classList.add("correct");
        if(selected) choices[selected]?.classList.add("wrong");
      }
      scoreLivesBox.textContent=`⭐ Score: ${score} | ❤️ Lives: ${lives}`;
      setTimeout(()=>{
        document.body.className="";
        resetChoices();
        if(lives<=0){
          gameOver();
        } else {
          selectRandomCategory();
        }
      },1500);
    }
  },1000);
}

/* ⚡ GAME OVER */
function gameOver(){
  gameState="gameover";
  spinner.textContent="💀 Game Over";
  questionBox.textContent="Press A to Restart\nPress B to go to Main Menu";
  timerBox.style.display="none";
  suspenseBox.style.display="none";
  Object.values(choices).forEach(c=>c.style.display="none");
}

/* 🔌 ESP32 BUTTON INPUT */
onValue(controlRef, snapshot=>{
  const data = snapshot.val();
  if(!data || !data.button) return;
  const btn=data.button;
  set(controlRef,{button:""}); // reset

  if(gameState==="menu"){
    if(btn==="A"){ // Start
      score=0; lives=5;
      scoreLivesBox.textContent=`⭐ Score: ${score} | ❤️ Lives: ${lives}`;
      showGameUI();
      selectRandomCategory();
    }
    else if(btn==="B"){ alert("Settings screen coming soon"); }
    else if(btn==="C"){ alert("Leaderboard screen coming soon"); }
    else if(btn==="D"){ alert("Introduction: This is our IT Quiz Project"); }
    return;
  }

  if(gameState==="playing"){
    if(!canAnswer) return;
    canAnswer=false;
    choices[btn]?.classList.add("active");
    revealAnswer(btn);
  }

  if(gameState==="gameover"){
    if(btn==="A"){ // restart
      score=0; lives=5;
      scoreLivesBox.textContent=`⭐ Score: ${score} | ❤️ Lives: ${lives}`;
      showGameUI();
      selectRandomCategory();
    }
    if(btn==="B"){ showMenu(); }
  }
});

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
  appId: "1:838552047744:web:f653b9fba96e49d665"
};

/* 🔌 INITIALIZE FIREBASE */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db, "control");
const feedbackRef = ref(db, "feedback");

/* 🎮 UI ELEMENTS */
const timerBox = document.getElementById("timer");
const suspenseBox = document.getElementById("suspense");
const questionBox = document.getElementById("question");

const choices = {
  A: document.getElementById("A"),
  B: document.getElementById("B"),
  C: document.getElementById("C"),
  D: document.getElementById("D")
};

/* 📚 QUESTIONS (example categories) */
const categories = {
  Programming: [
    {
      q: "HTML stands for?",
      c: ["Hyper Text Markup Language","High Tech Machine Language","Home Tool Markup Language","Hyperlinks Text Machine"],
      a: "A"
    }
  ],
  Networking: [
    {
      q: "What device connects networks?",
      c: ["Router","RAM","CPU","SSD"],
      a: "A"
    }
  ]
};

/* 🎯 GAME STATE */
let currentCategory = "";
let currentQuestion = null;
let canAnswer = false;

let answerTime = 10;
let suspenseTime = 5;
let answerInterval, suspenseInterval;
let score = 0;
let lives = 5;

/* 🧹 HELPERS */
function resetChoices(){
  Object.values(choices).forEach(c => c.className="choice");
}

function pickRandomCategory(){
  const keys = Object.keys(categories);
  currentCategory = keys[Math.floor(Math.random()*keys.length)];
  loadQuestion();
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

/* ⏱️ 10s answer timer */
function startAnswerTimer(){
  canAnswer=true;
  answerTime=10;
  timerBox.textContent=`⏱️ Time left: ${answerTime}s`;

  answerInterval = setInterval(()=>{
    answerTime--;
    timerBox.textContent=`⏱️ Time left: ${answerTime}s`;

    if(answerTime<=0){
      clearInterval(answerInterval);
      canAnswer=false;
      revealAnswer(null);
    }
  },1000);
}

/* ⏳ 5s suspense + result */
function revealAnswer(selected){
  resetChoices();
  clearInterval(answerInterval);

  suspenseTime=5;
  suspenseBox.textContent=`⏳ Revealing in ${suspenseTime}s`;

  suspenseInterval = setInterval(()=>{
    suspenseTime--;
    suspenseBox.textContent=`⏳ Revealing in ${suspenseTime}s`;

    if(suspenseTime<=0){
      clearInterval(suspenseInterval);
      suspenseBox.textContent="";

      if(selected === currentQuestion.a){
        document.body.style.background="#14532d"; // green flash
        choices[selected].classList.add("correct");
        score+=5;
        set(feedbackRef,"correct"); // buzzer feedback
      } else {
        document.body.style.background="#7f1d1d"; // red flash
        if(selected) choices[selected].classList.add("wrong");
        choices[currentQuestion.a].classList.add("correct");
        lives--;
        set(feedbackRef,"wrong"); // buzzer feedback
      }

      setTimeout(()=>{
        document.body.style.background="#0f172a";
        resetChoices();

        if(lives<=0){
          questionBox.textContent="Game Over";
          suspenseBox.textContent="Press A to restart, B for Menu";
          return;
        }

        pickRandomCategory();
      },2000);
    }
  },1000);
}

/* 🎯 ESP32 BUTTON INPUT */
onValue(controlRef,snapshot=>{
  const data = snapshot.val();
  if(!data || !data.button) return;
  const btn = data.button;

  // Reset control
  set(controlRef,{button:""});

  // Skip suspense if pressed
  if(!canAnswer && suspenseInterval){
    clearInterval(suspenseInterval);
    suspenseBox.textContent="";
    revealAnswer(btn);
    return;
  }

  if(!canAnswer) return;
  canAnswer=false;

  choices[btn].classList.add("active");
  revealAnswer(btn);
});

/* ⚡ Start the game */
pickRandomCategory();

// Send start buzzer feedback
set(feedbackRef,"start");

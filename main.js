import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  query,
  orderByChild,
  limitToLast,
  get,
  remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

/* 🔌 INIT */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db, "control");
const leaderboardRef = ref(db, "leaderboard");

/* 🎮 UI */
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

/* 📚 QUESTION BANK (YOUR CATEGORIES) */
const categories = {
  DATABASE: [
    {q:"What is SQL used for?", c:["Styling websites","Querying databases","Managing network devices","Writing operating systems"], a:"B"},
    {q:"What is a primary key?", c:["Unique identifier for a record","A type of index","A table name","Column description"], a:"A"},
    {q:"Which type of database is relational?", c:["MongoDB","MySQL","Redis","Cassandra"], a:"B"},
    {q:"What does ACID in databases stand for?", c:["Access, Control, Integrity, Data","Atomicity, Consistency, Isolation, Durability","Application, Connection, Index, Data","Architecture, Code, Interface, Design"], a:"B"},
    {q:"What is normalization in databases?", c:["Improving performance of CPU","Structuring data to reduce redundancy","Installing database software","Encrypting database"], a:"B"}
  ],

  NETWORKING: [
    {q:"What device connects multiple networks together?", c:["Router","Switch","Hub","Modem"], a:"A"},
    {q:"What does IP stand for?", c:["Internet Protocol","Internal Process","Information Packet","Integrated Platform"], a:"A"},
    {q:"What is the main purpose of DNS?", c:["Store passwords","Translate domain names to IP addresses","Protect against malware","Route email"], a:"B"},
    {q:"Which protocol is used for sending emails?", c:["HTTP","SMTP","FTP","SNMP"], a:"B"},
    {q:"What does LAN stand for?", c:["Large Area Network","Local Area Network","Local Application Node","Linked Access Network"], a:"B"}
  ],

  PEOPLE: [
    {q:"Who is responsible for managing an organization’s IT infrastructure?", c:["Database Administrator","Network Engineer","IT Manager","Software Developer"], a:"C"},
    {q:"Who writes and maintains computer programs?", c:["System Analyst","Software Developer","Network Admin","Security Analyst"], a:"B"},
    {q:"Who ensures security policies are followed and risks are minimized?", c:["Database Admin","Security Analyst","Project Manager","UX Designer"], a:"B"},
    {q:"Who plans IT projects and ensures deadlines are met?", c:["IT Manager","Project Manager","Help Desk Technician","Systems Architect"], a:"B"},
    {q:"Who interacts with end users to improve system usability?", c:["UX/UI Designer","Network Engineer","IT Support","QA Tester"], a:"A"}
  ],

  HARDWARE: [
    {q:"What does CPU stand for?", c:["Central Processing Unit","Computer Peripheral Unit","Central Programming Utility","Control Processing Unit"], a:"A"},
    {q:"What is RAM used for?", c:["Permanent storage","Temporary memory while programs run","Network connectivity","Graphics rendering"], a:"B"},
    {q:"Which device outputs visuals to the user?", c:["CPU","GPU","RAM","SSD"], a:"B"},
    {q:"What type of storage is non-volatile?", c:["RAM","Cache","SSD","Register"], a:"C"},
    {q:"Which component powers the computer?", c:["Motherboard","PSU (Power Supply Unit)","CPU","GPU"], a:"B"}
  ],

  SOFTWARE: [
    {q:"Which is an operating system?", c:["Windows 10","Microsoft Word","Chrome","Photoshop"], a:"A"},
    {q:"What type of software is Microsoft Excel?", c:["System software","Application software","Utility software","Firmware"], a:"B"},
    {q:"What is open-source software?", c:["Software you cannot access","Software with source code publicly available","Only for enterprises","Free of charge but closed source"], a:"B"},
    {q:"What is an IDE used for?", c:["Network monitoring","Writing and debugging code","Database backup","Managing hardware"], a:"B"},
    {q:"What is a patch in software?", c:["A bug in code","Update to fix issues or vulnerabilities","A programming language","A type of OS"], a:"B"}
  ]
};

/* 🎯 GAME STATE */
let gameState="menu";
let usedQuestions=[];
let currentQuestion=null;
let canAnswer=false;
let score=0;
let lives=5;
let streak=0;
let answerInterval,suspenseInterval;

/* 🧠 HELPERS */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function getNextQuestion(){
  const all=[];
  Object.values(categories).forEach(cat=>cat.forEach(q=>all.push(q)));
  const remaining=all.filter(q=>!usedQuestions.includes(q));
  if(remaining.length===0) return null;
  const q=remaining[Math.floor(Math.random()*remaining.length)];
  usedQuestions.push(q);
  return q;
}

/* ❓ LOAD QUESTION */
function loadQuestion(){
  currentQuestion=getNextQuestion();
  if(!currentQuestion){ gameOver(); return; }

  spinner.textContent="📂 Random Category";
  questionBox.textContent=currentQuestion.q;

  ["A","B","C","D"].forEach((l,i)=>{
    choices[l].textContent=`${l}. ${currentQuestion.c[i]}`;
    choices[l].dataset.answer=l;
    choices[l].className="choice";
  });

  startTimer();
}

/* ⏱ TIMER */
function startTimer(){
  canAnswer=true;
  let t=10;
  timerBox.textContent=`⏱️ ${t}s`;

  answerInterval=setInterval(()=>{
    t--;
    timerBox.textContent=`⏱️ ${t}s`;
    if(t<=0){
      clearInterval(answerInterval);
      canAnswer=false;
      reveal(null);
    }
  },1000);
}

/* ✅ CHECK ANSWER */
function reveal(selected){
  clearInterval(answerInterval);
  let s=3;
  suspenseBox.textContent=`⏳ ${s}`;

  suspenseInterval=setInterval(()=>{
    s--;
    suspenseBox.textContent=`⏳ ${s}`;
    if(s<=0){
      clearInterval(suspenseInterval);
      suspenseBox.textContent="";

      if(selected && selected===currentQuestion.a){
        score+=5;
        streak++;
        choices[selected].classList.add("correct");
      }else{
        lives--;
        streak=0;
        choices[currentQuestion.a].classList.add("correct");
      }

      scoreLivesBox.textContent=`⭐ ${score} | ❤️ ${lives} | 🔥 ${streak}`;

      if(lives<=0) gameOver();
      else setTimeout(loadQuestion,1200);
    }
  },1000);
}

/* 💀 GAME OVER + SAVE TOP 10 */
async function gameOver(){
  gameState="gameover";
  spinner.textContent="💀 GAME OVER";
  questionBox.textContent=`Final Score: ${score}`;

  await push(leaderboardRef,{
    score, streak, timestamp:Date.now()
  });

  const q=query(leaderboardRef,orderByChild("score"),limitToLast(11));
  const snap=await get(q);
  if(snap.exists()){
    const list=[];
    snap.forEach(c=>list.push({id:c.key,...c.val()}));
    list.sort((a,b)=>b.score-a.score||a.timestamp-b.timestamp);
    while(list.length>10){
      const r=list.pop();
      await remove(ref(db,"leaderboard/"+r.id));
    }
  }
}

/* 🔘 ESP32 INPUT */
onValue(controlRef,snap=>{
  const btn=snap.val()?.button;
  if(!btn) return;
  set(controlRef,{button:""});

  if(gameState==="menu"){
    gameState="playing";
    usedQuestions=[];
    score=0; lives=5; streak=0;
    scoreLivesBox.textContent="⭐ 0 | ❤️ 5 | 🔥 0";
    loadQuestion();
    return;
  }

  if(gameState==="playing" && canAnswer){
    canAnswer=false;
    reveal(btn);
  }
});

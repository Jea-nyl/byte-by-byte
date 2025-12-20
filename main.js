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

/* 📚 QUESTIONS (50 TOTAL) */
const questionBank = {
  DATABASE: [
    { q:"What does SQL stand for?", c:["Structured Query Language","System Query Logic","Simple Query List","Sequential Query Line"], correct:"Structured Query Language" },
    { q:"Which command retrieves data?", c:["INSERT","DELETE","SELECT","UPDATE"], correct:"SELECT" },
    { q:"Primary key is used to?", c:["Format tables","Delete rows","Identify records","Encrypt data"], correct:"Identify records" },
    { q:"Which is a DBMS?", c:["MySQL","HTML","CSS","Python"], correct:"MySQL" },
    { q:"Which stores tables?", c:["Relational DB","Text file","Image","Cache"], correct:"Relational DB" },
    { q:"Which key links tables?", c:["Foreign key","Primary key","Index","Trigger"], correct:"Foreign key" },
    { q:"Which is NoSQL?", c:["MongoDB","MySQL","Oracle","PostgreSQL"], correct:"MongoDB" },
    { q:"Which command adds data?", c:["SELECT","INSERT","DROP","WHERE"], correct:"INSERT" },
    { q:"Which deletes data?", c:["REMOVE","DELETE","CLEAR","DROP"], correct:"DELETE" },
    { q:"Which updates data?", c:["CHANGE","MODIFY","UPDATE","SET"], correct:"UPDATE" }
  ],

  NETWORKING: [
    { q:"What does IP stand for?", c:["Internet Protocol","Internal Process","Interface Program","Internet Path"], correct:"Internet Protocol" },
    { q:"Which connects networks?", c:["Hub","Switch","Router","Repeater"], correct:"Router" },
    { q:"LAN means?", c:["Local Area Network","Large Area Network","Linked Access Node","Logical Area Net"], correct:"Local Area Network" },
    { q:"Which cable is Ethernet?", c:["HDMI","UTP","VGA","USB"], correct:"UTP" },
    { q:"DNS converts?", c:["IP to name","Name to IP","Both","None"], correct:"Both" },
    { q:"Which protocol browses web?", c:["FTP","SMTP","HTTP","SNMP"], correct:"HTTP" },
    { q:"Which is wireless?", c:["Fiber","Ethernet","Wi-Fi","UTP"], correct:"Wi-Fi" },
    { q:"Which device boosts signal?", c:["Router","Repeater","Modem","Switch"], correct:"Repeater" },
    { q:"What does TCP mean?", c:["Transmission Control Protocol","Transfer Core Process","Text Communication Program","Terminal Control Path"], correct:"Transmission Control Protocol" },
    { q:"Which is private IP?", c:["192.168.1.1","8.8.8.8","1.1.1.1","172.217.3.4"], correct:"192.168.1.1" }
  ],

  HARDWARE: [
    { q:"Brain of computer?", c:["RAM","CPU","SSD","GPU"], correct:"CPU" },
    { q:"Permanent storage?", c:["RAM","Cache","SSD","Register"], correct:"SSD" },
    { q:"Displays output?", c:["Monitor","Keyboard","Mouse","Speaker"], correct:"Monitor" },
    { q:"Supplies power?", c:["PSU","CPU","RAM","Motherboard"], correct:"PSU" },
    { q:"Inputs text?", c:["Mouse","Keyboard","Scanner","Monitor"], correct:"Keyboard" },
    { q:"Temporary memory?", c:["SSD","HDD","RAM","ROM"], correct:"RAM" },
    { q:"Processes graphics?", c:["GPU","CPU","PSU","NIC"], correct:"GPU" },
    { q:"Connects components?", c:["Motherboard","SSD","Monitor","PSU"], correct:"Motherboard" },
    { q:"Stores firmware?", c:["RAM","ROM","Cache","SSD"], correct:"ROM" },
    { q:"Outputs sound?", c:["Speaker","Mouse","Scanner","Camera"], correct:"Speaker" }
  ],

  SOFTWARE: [
    { q:"Example of OS?", c:["Windows","Excel","Chrome","Word"], correct:"Windows" },
    { q:"Protects from virus?", c:["Firewall","Antivirus","Compiler","Browser"], correct:"Antivirus" },
    { q:"Open source OS?", c:["Linux","Windows","macOS","DOS"], correct:"Linux" },
    { q:"Used for documents?", c:["System","Utility","Application","Firmware"], correct:"Application" },
    { q:"Controls hardware?", c:["Browser","OS","Editor","Player"], correct:"OS" },
    { q:"Web browser?", c:["Chrome","Linux","Windows","Android"], correct:"Chrome" },
    { q:"Utility software?", c:["Disk cleanup","Excel","Photoshop","Chrome"], correct:"Disk cleanup" },
    { q:"Mobile OS?", c:["Android","Python","Java","Node"], correct:"Android" },
    { q:"Office software?", c:["Word","Linux","BIOS","Driver"], correct:"Word" },
    { q:"Media player?", c:["VLC","MySQL","Git","Node"], correct:"VLC" }
  ],

  PEOPLE: [
    { q:"Father of computers?", c:["Charles Babbage","Bill Gates","Steve Jobs","Turing"], correct:"Charles Babbage" },
    { q:"Founded Microsoft?", c:["Bill Gates","Jobs","Zuckerberg","Musk"], correct:"Bill Gates" },
    { q:"Founded Apple?", c:["Steve Jobs","Gates","Bezos","Musk"], correct:"Steve Jobs" },
    { q:"Created Linux?", c:["Torvalds","Gates","Jobs","Ritchie"], correct:"Linus Torvalds" },
    { q:"Invented WWW?", c:["Berners-Lee","Turing","Ritchie","Knuth"], correct:"Tim Berners-Lee" },
    { q:"CEO of Tesla?", c:["Musk","Jobs","Bezos","Page"], correct:"Elon Musk" },
    { q:"Founder of Facebook?", c:["Zuckerberg","Gates","Jobs","Dorsey"], correct:"Mark Zuckerberg" },
    { q:"Creator of C language?", c:["Dennis Ritchie","Babbage","Turing","Linus"], correct:"Dennis Ritchie" },
    { q:"Google founder?", c:["Larry Page","Jobs","Bezos","Musk"], correct:"Larry Page" },
    { q:"Amazon founder?", c:["Jeff Bezos","Gates","Page","Cook"], correct:"Jeff Bezos" }
  ]
};

/* 🎯 GAME STATE */
let gameState = "menu";
let usedQuestions = [];
let currentQuestion = null;
let canAnswer = false;
let score = 0;
let lives = 5;
let answerInterval, suspenseInterval;

/* 🧠 HELPERS */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function getNextQuestion(){
  const all = [];
  Object.values(questionBank).forEach(cat=>cat.forEach(q=>all.push(q)));
  const remaining = all.filter(q=>!usedQuestions.includes(q));
  if(remaining.length===0) return null;
  const q = remaining[Math.floor(Math.random()*remaining.length)];
  usedQuestions.push(q);
  return q;
}

/* ❓ LOAD QUESTION */
function loadQuestion(){
  currentQuestion = getNextQuestion();
  if(!currentQuestion){ gameOver(); return; }

  spinner.textContent = "📂 Random Category";
  questionBox.textContent = currentQuestion.q;

  const shuffled = shuffle([...currentQuestion.c]);
  ["A","B","C","D"].forEach((l,i)=>{
    choices[l].textContent = `${l}. ${shuffled[i]}`;
    choices[l].dataset.answer = shuffled[i];
  });

  startTimer();
}

/* ⏱ TIMER */
function startTimer(){
  canAnswer = true;
  let t = 10;
  timerBox.textContent = `⏱️ ${t}s`;
  answerInterval = setInterval(()=>{
    t--;
    timerBox.textContent = `⏱️ ${t}s`;
    if(t<=0){
      clearInterval(answerInterval);
      canAnswer=false;
      reveal(null);
    }
  },1000);
}

/* ✅ CHECK */
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
      if(selected && choices[selected].dataset.answer===currentQuestion.correct){
        score+=5;
        choices[selected].classList.add("correct");
      }else{
        lives--;
        Object.values(choices).forEach(c=>{
          if(c.dataset.answer===currentQuestion.correct) c.classList.add("correct");
        });
      }
      scoreLivesBox.textContent=`⭐ ${score} | ❤️ ${lives}`;
      setTimeout(()=>{ reset(); loadQuestion(); },1200);
    }
  },1000);
}

function reset(){
  Object.values(choices).forEach(c=>c.className="choice");
}

/* 💀 GAME OVER + SAVE SCORE */
function gameOver(){
  gameState="gameover";
  spinner.textContent="💀 GAME OVER";
  questionBox.textContent=`Final Score: ${score}`;
  push(leaderboardRef, {
    score,
    date: new Date().toISOString()
  });
}

/* 🔘 ESP32 INPUT */
onValue(controlRef, snap=>{
  const d=snap.val();
  if(!d||!d.button) return;
  const btn=d.button;
  set(controlRef,{button:""});
  if(gameState==="menu"){
    gameState="playing";
    usedQuestions=[];
    score=0; lives=5;
    scoreLivesBox.textContent=`⭐ 0 | ❤️ 5`;
    loadQuestion();
    return;
  }
  if(gameState==="playing" && canAnswer){
    canAnswer=false;
    reveal(btn);
  }
});

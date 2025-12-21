import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push, query, orderByChild, limitToLast, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBkFUpf2JuYIch95wx9B4Rk-jp9I7IudJs",
  authDomain: "byte-by-byte-f7a4c.firebaseapp.com",
  databaseURL: "https://byte-by-byte-f7a4c-default-rtdb.firebaseio.com",
  projectId: "byte-by-byte-f7a4c",
  storageBucket: "byte-by-byte-f7a4c.appspot.com",
  messagingSenderId: "838552047744",
  appId: "1:838552047744:web:f653b9fba96e49aa44d665"
};

/* INITIALIZE FIREBASE */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db,"control");
const leaderboardRef = ref(db,"leaderboard");

/* ================= GAME STATE ================= */
let gameState="menu", score=0, lives=5, streak=0;
let questionPool=[], currentQuestion=null, canAnswer=false;
let totalQuestions=0, questionNumber=0;

/* ================= QUESTION BANK ================= */
const categories = {
  DATABASE: [
    {q:"What is SQL used for?",c:["Styling websites","Querying databases","Managing networks","Writing OS"],a:"B"},
    {q:"Primary key is?",c:["Unique identifier","Index","Table name","Column label"],a:"A"},
    {q:"Which is a relational DB?",c:["MongoDB","MySQL","Redis","Firebase"],a:"B"},
    {q:"ACID stands for?",c:["Atomicity Consistency Isolation Durability","Access Control Index Data","App Code Interface Design","None"],a:"A"},
    {q:"Normalization means?",c:["Encrypting data","Reducing redundancy","Backing up DB","Improving UI"],a:"B"}
  ],
  NETWORKING: [
    {q:"Device that connects networks?",c:["Router","Switch","Hub","Repeater"],a:"A"},
    {q:"IP stands for?",c:["Internet Protocol","Internal Program","Interface Process","Internet Page"],a:"A"},
    {q:"Protocol for email?",c:["HTTP","SMTP","FTP","SNMP"],a:"B"},
    {q:"LAN means?",c:["Large Area Network","Local Area Network","Logical Access Node","Low Area Network"],a:"B"},
    {q:"DNS does what?",c:["Encrypt data","Name to IP","Speed network","Block sites"],a:"B"}
  ],
  PEOPLE: [
    {q:"Who manages IT infrastructure?",c:["Programmer","IT Manager","Web Designer","Tester"],a:"B"},
    {q:"Who writes code?",c:["Network Admin","Developer","IT Manager","Analyst"],a:"B"},
    {q:"Who handles security risks?",c:["DBA","Security Analyst","Designer","Clerk"],a:"B"},
    {q:"Who plans projects?",c:["IT Support","Project Manager","Technician","Developer"],a:"B"},
    {q:"Who designs usability?",c:["UX Designer","DBA","Network Engineer","Tester"],a:"A"}
  ],
  HARDWARE: [
    {q:"CPU stands for?",c:["Central Processing Unit","Computer Power Unit","Control Program Utility","Core Processing User"],a:"A"},
    {q:"RAM is used for?",c:["Permanent storage","Temporary memory","Backup","Networking"],a:"B"},
    {q:"Non-volatile storage?",c:["RAM","Cache","SSD","Register"],a:"C"},
    {q:"Outputs display?",c:["CPU","GPU","PSU","RAM"],a:"B"},
    {q:"Powers computer?",c:["Motherboard","PSU","CPU","SSD"],a:"B"}
  ],
  SOFTWARE: [
    {q:"Which is an OS?",c:["Windows","Word","Chrome","Photoshop"],a:"A"},
    {q:"Excel is?",c:["System software","Application software","Firmware","Utility"],a:"B"},
    {q:"Open source means?",c:["Paid","Public source code","Closed","Trial"],a:"B"},
    {q:"IDE used for?",c:["Monitoring","Coding","Backup","Networking"],a:"B"},
    {q:"Patch means?",c:["Bug","Update fix","Virus","Language"],a:"B"}
  ]
};

/* ================= HELPERS ================= */
function shuffle(array){ 
  for(let i=array.length-1;i>0;i--){ 
    const j=Math.floor(Math.random()*(i+1)); 
    [array[i],array[j]]=[array[j],array[i]]; 
  } 
}

/* ================= GAME LOGIC ================= */
function startGame(){
  score=0; lives=5; streak=0; gameState="playing";
  questionPool=[];
  Object.values(categories).forEach(cat=>cat.forEach(q=>questionPool.push(q)));
  shuffle(questionPool);
  totalQuestions = questionPool.length;
  questionNumber=0;

  document.getElementById("questionCounter").textContent=`❓ Question 0 / ${totalQuestions}`;
  nextQuestion();
}

function nextQuestion(){
  if(questionPool.length===0){ gameOver(); return; }
  currentQuestion=questionPool.pop();
  questionNumber++;
  canAnswer=true;

  document.getElementById("question").textContent=currentQuestion.q;
  ["A","B","C","D"].forEach((l,i)=>{
    document.getElementById(l).textContent=`${l}. ${currentQuestion.c[i]}`;
  });

  document.getElementById("questionCounter").textContent=`❓ Question ${questionNumber} / ${totalQuestions}`;
}

function correctAnswer(){
  streak++;
  let bonus = streak>=8?10 : streak>=5?5 : streak>=3?2 : 0;
  score += 5+bonus;
}

function wrongAnswer(){
  streak=0;
  lives--;
}

function submitAnswer(choice){
  if(!canAnswer || gameState!=="playing") return;
  canAnswer=false;
  if(choice===currentQuestion.a) correctAnswer(); else wrongAnswer();
  if(lives<=0) gameOver(); else setTimeout(nextQuestion, 1200);
}

/* ================= GAME OVER + LEADERBOARD ================= */
async function gameOver(){
  gameState="gameover";
  document.getElementById("spinner").textContent="💀 Game Over";
  document.getElementById("question").textContent=`Score: ${score} | Streak: ${streak}`;
  document.getElementById("questionCounter").textContent="";
  
  await push(leaderboardRef,{score, streak, time:Date.now()});

  // Limit top 10
  const q = query(leaderboardRef, orderByChild("score"), limitToLast(11));
  const snap = await get(q);
  let list=[];
  snap.forEach(c=>list.push({id:c.key,...c.val()}));
  list.sort((a,b)=>b.score - a.score);
  while(list.length>10){
    const removeItem = list.pop();
    await remove(ref(db,"leaderboard/"+removeItem.id));
  }
}

/* ================= ESP32 BUTTON INPUT ================= */
onValue(controlRef,snap=>{
  const data = snap.val();
  if(!data || !data.button) return;
  const btn = data.button;
  set(controlRef,{button:""});

  if(gameState==="menu" && btn==="A"){ startGame(); return; }
  if(gameState==="playing"){ submitAnswer(btn); }
});

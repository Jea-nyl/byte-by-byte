// same imports & firebaseConfig as before

let score = 0;
let lives = 5;

/* UI ADD */
const scoreBox = document.createElement("div");
scoreBox.style.marginTop = "10px";
document.body.insertBefore(scoreBox, spinner.nextSibling);

function updateHUD() {
  scoreBox.innerHTML = `⭐ Score: ${score} | ❤️ Lives: ${lives}`;
}
updateHUD();

/* MODIFY revealAnswer() */
function revealAnswer(selected) {
  resetChoices();
  clearInterval(answerInterval);

  suspenseTime = 5;
  suspenseBox.textContent = `⏳ Revealing in ${suspenseTime}s`;

  suspenseInterval = setInterval(() => {
    suspenseTime--;
    suspenseBox.textContent = `⏳ Revealing in ${suspenseTime}s`;

    if (suspenseTime <= 0) {
      clearInterval(suspenseInterval);
      suspenseBox.textContent = "";

      let result = "wrong";

      if (selected === currentQuestion.a) {
        result = "correct";
        score += 5;
        document.body.style.background = "#14532d";
        choices[selected]?.classList.add("correct");
      } else {
        lives--;
        document.body.style.background = "#7f1d1d";
        choices[currentQuestion.a].classList.add("correct");
        if (selected) choices[selected].classList.add("wrong");
      }

      updateHUD();

      // 🔥 send result to ESP32
      set(controlRef, { result });

      setTimeout(() => {
        document.body.style.background = "#0f172a";

        if (lives <= 0) {
          questionBox.textContent = "💀 GAME OVER";
          spinner.textContent = `FINAL SCORE: ${score}`;
          return;
        }

        spinning = true;
        spinCategory();
      }, 2000);
    }
  }, 1000);
}

const clickButton = document.querySelector('.describe-btn');

clickButton.addEventListener('click', describePage);

function detectMood() {
  const text = document.body.innerText.toLowerCase();

  if (text.includes("sale") || text.includes("buy") || text.includes("shop")) {
    return "playful";
  };

  if (text.includes("error") || text.includes("warning")) {
    return "serious";
  };

  return "neutral";
};

function speakMood(mood) {
    // Bron: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
    const msg = new SpeechSynthesisUtterance();

    if (mood === "playful") {
    msg.text = "Playful website. Likely a shop or promotional page.";
    msg.pitch = 2;
    msg.rate = 1.4;
    };

    if (mood === "serious") {
    msg.text = "Serious or critical page. Pay attention.";
    msg.pitch = 0.5;
    msg.rate = 0.7;
    };

    if (mood === "neutral") {
        msg.text = "This page feels neutral.";
        msg.pitch = 1;
        msg.rate = 1;
    };

  speechSynthesis.speak(msg);
};

function describePage() {
  const mood = detectMood();
  speakMood(mood);
};

// document.addEventListener("keydown", (e) => {
//   if (e.key === "m") {
//     describePage();
//   }
// });
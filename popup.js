const apiKey = "JOUW_API_KEY";

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  return tab;
}

async function getPageData(tabId) {
  return await chrome.tabs.sendMessage(tabId, {
    type: "GET_PAGE_DATA"
  });
}

async function callAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "nl-NL";
  speechSynthesis.speak(utterance);
}

async function runMode(mode) {
  const tab = await getActiveTab();
  const data = await getPageData(tab.id);

  let prompt = "";

  if (mode === "quick") {
    prompt = `
Vat deze pagina kort samen voor een blinde gebruiker.
Maximaal 2 zinnen.
Wat is dit en wat kun je hier doen?

${JSON.stringify(data)}
`;
  }

  if (mode === "detail") {
    prompt = `
Leg deze pagina uit voor een screenreader gebruiker.
Focus op:
- knoppen
- links
- afbeeldingen
- wat acties doen

${JSON.stringify(data)}
`;
  }

  if (mode === "sfeer") {
    prompt = `
Beschrijf de sfeer van deze website.
Hoe voelt de site visueel en inhoudelijk?

${JSON.stringify(data)}
`;
  }

  const result = await callAI(prompt);
  speak(result);
}

document.getElementById("quick").onclick = () => runMode("quick");
document.getElementById("detail").onclick = () => runMode("detail");
document.getElementById("sfeer").onclick = () => runMode("sfeer");
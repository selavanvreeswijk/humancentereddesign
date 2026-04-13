// =====================
// WEBSENSE — websense.js
// =====================
// Plak hier je Anthropic API-key om echte AI-analyse te krijgen.
// Haal een key op via: https://console.anthropic.com
// Laat het leeg ('') om de demo-modus te gebruiken.

const API_KEY = '';


// =====================
// DEMO-TEKSTEN
// =====================
// Deze teksten worden getoond als er geen API-key is ingevuld.
// Pas ze aan per pagina die je maakt.

const demoTeksten = {
  quick: `Dit is een nieuwsartikel van De Krant over de rol van AI in de Nederlandse gezondheidszorg. Het stuk onderzoekt hoe algoritmes diagnoses kunnen versnellen, maar tegelijk bestaande ongelijkheid kunnen vergroten. De centrale vraag is: voor wie is deze technologie eigenlijk beschikbaar?`,

  detail: {
    samenvatting: "Een nieuwsartikel over kansen en risico's van AI in de zorg, geschreven door Lena Huisman. Het belicht de spanning tussen technologische vooruitgang en toegankelijkheid.",
    hoofdlinks: ["Nieuws", "Technologie", "Gezondheid", "Over ons"],
    afbeeldingen: "Er is één afbeelding met een alt-tekst aanwezig. De beschrijving is functioneel maar kort.",
    toegankelijkheid: "De pagina heeft een duidelijke koppenstructuur, maar mist aria-labels op de navigatie."
  },

  sfeer: {
    stemming: "De pagina voelt serieus en journalistiek — informatief en kritisch van toon, zonder sensatiezucht.",
    kleurgevoel: "Zwart-wit met weinig kleur. Sober en krantachtig, wat geloofwaardigheid en kwaliteit uitstraalt.",
    doelgroep: "Geïnteresseerde volwassenen die kwaliteitsjournalistiek lezen",
    beleving: "Je voelt je welkom als iemand die serieus genomen wordt."
  }
};


// =====================
// PAGINA-INHOUD LEZEN
// =====================
// Dit leest de tekst van de huidige pagina uit.
// Je hoeft dit niet aan te passen — het werkt automatisch.

function getPageContent() {
  const title    = document.title;
  const h1       = document.querySelector('h1')?.textContent?.trim() || '';
  const intro    = document.querySelector('.intro')?.textContent?.trim() || '';
  const category = document.querySelector('.category')?.textContent?.trim() || '';
  const author   = document.querySelector('.author')?.textContent?.trim() || '';

  const alineas = [...document.querySelectorAll('p')]
    .map(p => p.textContent.trim())
    .filter(t => t.length > 40)
    .slice(0, 8)
    .join(' | ');

  const links = [...document.querySelectorAll('nav a, .sidebar a, footer a')]
    .map(a => a.textContent.trim())
    .filter(Boolean)
    .join(', ');

  const afbeeldingen = [...document.querySelectorAll('img')]
    .map(img => img.alt || '(geen alt-tekst)')
    .join(', ');

  return `
Paginatitel: ${title}
Rubriek: ${category}
Kop: ${h1}
Intro: ${intro}
Auteur: ${author}
Alinea's: ${alineas}
Navigatielinks: ${links}
Afbeeldingen (alt-tekst): ${afbeeldingen}
  `.trim();
}


// =====================
// CLAUDE API AANROEPEN
// =====================

async function vraagClaude(systeemPrompt, inhoud) {
  const key = window._apiKey || API_KEY;
  if (!key) return null; // geen key → gebruik demo

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systeemPrompt,
      messages: [{ role: 'user', content: inhoud }]
    })
  });

  if (!response.ok) throw new Error('API fout: ' + response.status);
  const data = await response.json();
  return data.content.map(c => c.text || '').join('');
}


// =====================
// POPUP OPENEN / SLUITEN
// =====================

let alGescand = false;

function openPopup() {
  document.getElementById('popup-backdrop').style.display = 'block';
  document.getElementById('popup').style.display = 'block';
  if (!alGescand) runScan();
}

function closePopup() {
  document.getElementById('popup-backdrop').style.display = 'none';
  document.getElementById('popup').style.display = 'none';
  stopSpreken();
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closePopup();
});


// =====================
// TABS WISSELEN
// =====================

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`panel-${tab}`).classList.add('active');

  stopSpreken();
}


// =====================
// SCAN UITVOEREN
// =====================

let scanResultaten = {};

async function runScan() {
  alGescand = true;
  scanResultaten = {};

  // reset alle panelen
  ['quick', 'detail', 'sfeer'].forEach(tab => {
    document.getElementById(`loading-${tab}`).style.display = 'flex';
    const r = document.getElementById(`result-${tab}`);
    r.style.display = 'none';
    r.innerHTML = '';
  });

  setStatus('Bezig met scannen…');

  const inhoud = getPageContent();

  // alle drie tabs tegelijk ophalen
  await Promise.all([
    scanQuick(inhoud),
    scanDetail(inhoud),
    scanSfeer(inhoud)
  ]);

  setStatus('Scan voltooid');
}


// --- Quick scan ---
async function scanQuick(inhoud) {
  try {
    const prompt = `Je bent WebSense, een toegankelijkheidsassistent voor een blinde gebruiker genaamd Ihab. 
Geef een korte samenvatting van deze webpagina in maximaal 3 zinnen. 
Zeg wat voor pagina het is, wat het onderwerp is, en wat Ihab hier kan lezen of doen. 
Schrijf vloeiend, warm en direct. Antwoord in het Nederlands.`;

    // let tekst = await vraagClaude(prompt, inhoud);
    // if (!tekst) tekst = demoTeksten.quick;
    let tekst = demoTeksten.quick;

    scanResultaten.quick = tekst;
    toonQuick(tekst);
  } catch(e) {
    scanResultaten.quick = demoTeksten.quick;
    toonQuick(demoTeksten.quick);
  }
}

function toonQuick(tekst) {
  document.getElementById('loading-quick').style.display = 'none';
  const el = document.getElementById('result-quick');
  el.style.display = 'block';
  el.innerHTML = `
    ${demoMelding()}
    <div class="result-section">
      <div class="result-label quick">Essentie</div>
      <div class="result-text">${veilig(tekst)}</div>
    </div>
    <button class="speak-btn" id="spk-quick" onclick="toggleSpreken('quick')">▶ Lees voor</button>
  `;
}


// --- Detail scan ---
async function scanDetail(inhoud) {
  try {
    const prompt = `Je bent WebSense, een toegankelijkheidsassistent voor een blinde gebruiker genaamd Ihab.
Analyseer deze webpagina. Stuur ALLEEN geldige JSON terug, geen uitleg, geen markdown:
{"samenvatting":"...", "hoofdlinks":["...","..."], "afbeeldingen":"...", "toegankelijkheid":"..."}
- samenvatting: 2 zinnen over wat deze pagina is/doet
- hoofdlinks: 3 tot 5 belangrijkste links
- afbeeldingen: zijn afbeeldingen goed omschreven?
- toegankelijkheid: korte beoordeling
Antwoord in het Nederlands.`;

    // let tekst = await vraagClaude(prompt, inhoud);
    let tekst = demoTeksten.quick;
    let data;

    if (tekst) {
      data = JSON.parse(tekst.replace(/```json|```/g, '').trim());
    } else {
      data = demoTeksten.detail;
    }

    scanResultaten.detail = JSON.stringify(data);
    toonDetail(data);
  } catch(e) {
    scanResultaten.detail = JSON.stringify(demoTeksten.detail);
    toonDetail(demoTeksten.detail);
  }
}

function toonDetail(d) {
  document.getElementById('loading-detail').style.display = 'none';
  const el = document.getElementById('result-detail');
  el.style.display = 'block';

  const links = (d.hoofdlinks || [])
    .map(l => `<span class="chip detail">${veilig(l)}</span>`)
    .join('');

  el.innerHTML = `
    ${demoMelding()}
    <div class="result-section">
      <div class="result-label detail">Samenvatting</div>
      <div class="result-text">${veilig(d.samenvatting || '')}</div>
    </div>
    <div class="result-section">
      <div class="result-label detail">Hoofdlinks</div>
      <div class="chips">${links}</div>
    </div>
    <div class="result-section">
      <div class="result-label detail">Afbeeldingen</div>
      <div class="result-text">${veilig(d.afbeeldingen || '')}</div>
    </div>
    <div class="result-section">
      <div class="result-label detail">Toegankelijkheid</div>
      <div class="result-text">${veilig(d.toegankelijkheid || '')}</div>
    </div>
    <button class="speak-btn" id="spk-detail" onclick="toggleSpreken('detail')">▶ Lees voor</button>
  `;
}


// --- Sfeer scan ---
async function scanSfeer(inhoud) {
  try {
    const prompt = `Je bent WebSense, een toegankelijkheidsassistent voor een blinde gebruiker genaamd Ihab die de visuele sfeer van websites niet kan zien.
Beschrijf de sfeer en beleving van deze pagina. Stuur ALLEEN geldige JSON terug, geen uitleg, geen markdown:
{"stemming":"...", "kleurgevoel":"...", "doelgroep":"...", "beleving":"..."}
Gebruik warme, beschrijvende taal. Antwoord in het Nederlands.`;

    // let tekst = await vraagClaude(prompt, inhoud);
    let tekst = demoTeksten.quick;
    let data;

    if (tekst) {
      data = JSON.parse(tekst.replace(/```json|```/g, '').trim());
    } else {
      data = demoTeksten.sfeer;
    }

    scanResultaten.sfeer = JSON.stringify(data);
    toonSfeer(data);
  } catch(e) {
    scanResultaten.sfeer = JSON.stringify(demoTeksten.sfeer);
    toonSfeer(demoTeksten.sfeer);
  }
}

function toonSfeer(d) {
  document.getElementById('loading-sfeer').style.display = 'none';
  const el = document.getElementById('result-sfeer');
  el.style.display = 'block';

  el.innerHTML = `
    ${demoMelding()}
    <div class="result-section">
      <div class="result-label sfeer">Stemming</div>
      <div class="result-text">${veilig(d.stemming || '')}</div>
    </div>
    <div class="result-section">
      <div class="result-label sfeer">Kleurgevoel</div>
      <div class="result-text">${veilig(d.kleurgevoel || '')}</div>
    </div>
    <div class="result-section">
      <div class="result-label sfeer">Beleving</div>
      <div class="result-text">${veilig(d.beleving || '')}</div>
    </div>
    <div class="chips">
      <span class="chip sfeer">${veilig(d.doelgroep || '')}</span>
    </div>
    <button class="speak-btn" id="spk-sfeer" onclick="toggleSpreken('sfeer')">▶ Lees voor</button>
  `;
}


// =====================
// VOORLEZEN
// =====================

let huidigeSpeech = null;

function toggleSpreken(tab) {
  const knop = document.getElementById(`spk-${tab}`);

  // als er al iets speelt, stop dan
  if (huidigeSpeech) {
    stopSpreken();
    if (knop) { knop.textContent = '▶ Lees voor'; knop.classList.remove('actief'); }
    return;
  }

  // bouw de spreektekst
  let tekst = '';
  try {
    const data = JSON.parse(scanResultaten[tab]);
    tekst = Object.values(data).flat().join('. ');
  } catch(e) {
    tekst = scanResultaten[tab] || '';
  }

  if (!tekst) return;

  const utterance = new SpeechSynthesisUtterance(tekst);
  utterance.lang  = 'nl-NL';
  utterance.rate  = tab === 'sfeer' ? 0.88 : 0.96;
  utterance.pitch = tab === 'sfeer' ? 1.1  : 1.0;

  if (knop) { knop.textContent = '■ Stop'; knop.classList.add('actief'); }

  utterance.onend = function() {
    huidigeSpeech = null;
    if (knop) { knop.textContent = '▶ Lees voor'; knop.classList.remove('actief'); }
  };

  huidigeSpeech = utterance;
  speechSynthesis.speak(utterance);
}

function stopSpreken() {
  if (huidigeSpeech) {
    speechSynthesis.cancel();
    huidigeSpeech = null;
  }
}


// =====================
// API KEY LIVE INVULLEN
// =====================
// Via het invoerveld in de popup kan je een key tijdelijk opslaan.

function slaKeyOp() {
  const input = document.getElementById('key-input');
  if (!input) return;
  const key = input.value.trim();
  if (!key) return;
  window._apiKey = key;
  alGescand = false;
  runScan();
}


// =====================
// HULPFUNCTIES
// =====================

function setStatus(tekst) {
  document.getElementById('status-text').textContent = tekst;
}

function veilig(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function demoMelding() {
//   const key = window._apiKey || API_KEY;
//   if (key) return ''; 
//   return `
//     <div class="demo-notice">
//       <strong>Demo-modus</strong>
//       Voeg je API-key in voor echte AI-analyse.
//       <div class="key-row">
//         <input class="key-input" id="key-input" type="password" placeholder="sk-ant-…">
//         <button class="key-btn" onclick="slaKeyOp()">Opslaan</button>
//       </div>
//     </div>
//   `;
    return '';
}
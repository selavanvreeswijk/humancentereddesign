// =====================
// DEMO-TEKSTEN
// =====================
// Standaard teksten voor de nieuwspagina (index.html).
// Elke pagina kan zijn eigen teksten instellen via window.paginaDemoTeksten
// vóór dit script wordt geladen.

const defaultDemoTeksten = {
  quick: {
    essentie: "Dit is een nieuwsartikel van De Krant over de rol van AI in de Nederlandse gezondheidszorg. De centrale vraag is: voor wie is deze technologie eigenlijk beschikbaar?",
    samenvatting: "Een nieuwsartikel over kansen en risico's van AI in de zorg, geschreven door Lena Huisman. Het belicht de spanning tussen technologische vooruitgang en toegankelijkheid.",
    hoofdlinks: ["Blog", "Kookplezier"],
    afbeeldingen: "Er is één afbeelding met een alt-tekst aanwezig. De beschrijving is functioneel maar kort.",
    toegankelijkheid: "De pagina heeft een duidelijke koppenstructuur met aria-labels op navigatie en de popup."
  },

  sfeer: {
    stemming: "De pagina voelt serieus en journalistiek — informatief en kritisch van toon, zonder sensatiezucht.",
    kleurgevoel: "Zwart-wit met weinig kleur. Sober en krantachtig, wat geloofwaardigheid en kwaliteit uitstraalt.",
    doelgroep: "Geïnteresseerde volwassenen die kwaliteitsjournalistiek lezen",
    beleving: "Je voelt je welkom als iemand die serieus genomen wordt."
  }
};

const demoTeksten = window.paginaDemoTeksten || defaultDemoTeksten;


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
// STEMMEN LADEN
// =====================
// Vult het dropdown-menu in de popup met alle beschikbare stemmen van het systeem.
// Ihab kan hier een andere stem kiezen dan de standaard (bijv. Frank op macOS).

function laadStemmen() {
  const select = document.getElementById('stem-select');
  if (!select) return;

  const stemmen = speechSynthesis.getVoices();
  if (stemmen.length === 0) return; // nog niet geladen, wacht op onvoiceschanged

  select.innerHTML = '';

  stemmen.forEach((stem, index) => {
    const optie = document.createElement('option');
    optie.value = index;
    optie.textContent = stem.name + (stem.default ? ' (standaard)' : '');
    select.appendChild(optie);
  });

  // Herstel de eerder gekozen stem uit localStorage
  const opgeslagen = localStorage.getItem('quickscan-stem');
  if (opgeslagen !== null && select.options[opgeslagen]) {
    select.value = opgeslagen;
  }
}

// Chrome laadt stemmen asynchroon, vandaar onvoiceschanged
speechSynthesis.onvoiceschanged = laadStemmen;
laadStemmen(); // werkt direct in Firefox en Safari

// Sla de keuze op als Ihab een andere stem kiest
document.addEventListener('change', function(e) {
  if (e.target.id === 'stem-select') {
    localStorage.setItem('quickscan-stem', e.target.value);
  }
});


// =====================
// TABS WISSELEN
// =====================

function switchTab(tab) {
  // Zet alle tabs op inactief (ook voor screenreaders via aria-selected)
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  // Zet de gewenste tab op actief
  const actieveTab = document.querySelector(`.tab[data-tab="${tab}"]`);
  actieveTab.classList.add('active');
  actieveTab.setAttribute('aria-selected', 'true');

  document.getElementById(`panel-${tab}`).classList.add('active');

  stopSpreken();
}


// =====================
// SCAN UITVOEREN
// =====================

let scanResultaten = {};

function runScan() {
  alGescand = true;
  scanResultaten = {};

  // reset beide panelen
  ['quick', 'sfeer'].forEach(tab => {
    document.getElementById(`loading-${tab}`).style.display = 'flex';
    const r = document.getElementById(`result-${tab}`);
    r.style.display = 'none';
    r.innerHTML = '';
  });

  setStatus('Bezig met scannen…');

  toonQuick(demoTeksten.quick);
  toonSfeer(demoTeksten.sfeer);
  scanResultaten.quick = JSON.stringify(demoTeksten.quick);
  scanResultaten.sfeer = JSON.stringify(demoTeksten.sfeer);
  setStatus('Scan voltooid');
}


// --- Detail tab ---

function toonQuick(d) {
  document.getElementById('loading-quick').style.display = 'none';
  const el = document.getElementById('result-quick');
  el.style.display = 'block';

  const links = (d.hoofdlinks || [])
    .map(l => `<span class="chip detail">${veilig(l)}</span>`)
    .join('');

  el.innerHTML = `
    <div class="result-section">
      <div class="result-label quick">Essentie</div>
      <div class="result-text">${veilig(d.essentie || '')}</div>
    </div>
    <div class="result-section">
      <div class="result-label quick">Samenvatting</div>
      <div class="result-text">${veilig(d.samenvatting || '')}</div>
    </div>
    <div class="result-section">
      <div class="result-label quick">Hoofdlinks</div>
      <div class="chips">${links}</div>
    </div>
    <div class="result-section">
      <div class="result-label quick">Afbeeldingen</div>
      <div class="result-text">${veilig(d.afbeeldingen || '')}</div>
    </div>
    <div class="result-section">
      <div class="result-label quick">Toegankelijkheid</div>
      <div class="result-text">${veilig(d.toegankelijkheid || '')}</div>
    </div>
    <button class="speak-btn" id="spk-quick" onclick="toggleSpreken('quick')">▶ Lees voor</button>
  `;
}


// --- Sfeer tab ---

function toonSfeer(d) {
  document.getElementById('loading-sfeer').style.display = 'none';
  const el = document.getElementById('result-sfeer');
  el.style.display = 'block';

  el.innerHTML = `
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

  // Gebruik de stem die Ihab heeft geselecteerd in het dropdown-menu
  const stemSelect = document.getElementById('stem-select');
  const stemmen = speechSynthesis.getVoices();
  const gekozenIndex = stemSelect ? parseInt(stemSelect.value) : 0;
  if (stemmen[gekozenIndex]) {
    utterance.voice = stemmen[gekozenIndex];
  }

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

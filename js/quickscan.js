// =====================
// DEMO-TEKSTEN
// =====================
// Standaard teksten voor de nieuwspagina (index.html).
// Elke pagina stelt zijn eigen teksten in via window.paginaDemoTeksten
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
// Exclusive design — Study situation:
// Ihab gebruikt een screenreader. Door showModal() te gebruiken gaat de
// focus automatisch naar het dialoogvenster zodat de screenreader
// de inhoud direct voorleest zonder extra handelingen.

const popup = document.getElementById('popup');

function openPopup(){
  popup.showModal();
  if (!alGescand) runScan();
}

function closePopup(){
  popup.close();
}

// Sluit popup als er op de backdrop (buiten het venster) wordt geklikt
// e.target === popup betekent: klik op de dialog zelf, niet op een child element
popup.addEventListener('click', function(e){
  if (e.target === popup) closePopup();
});

// =====================
// STEMMEN LADEN
// =====================
// Exclusive design — Prioritise identity:
// Ihab kan zelf een stem kiezen die bij hem past, in plaats van
// de standaard systeemvoice die hij misschien niet prettig vindt.
// Dubbele stemmen (zelfde voiceURI) worden eenmalig getoond.

function laadStemmen(){
  const select = document.getElementById('stem-select');
  if (!select) return;

  const alleStemmen = speechSynthesis.getVoices();
  if (alleStemmen.length === 0) return;

  // Verwijder dubbele stemmen op basis van voiceURI
  const gezienURIs = new Set();
  const stemmen = alleStemmen.filter(stem => {
    if (gezienURIs.has(stem.voiceURI)) return false;
    gezienURIs.add(stem.voiceURI);
    return true;
  });

  select.innerHTML = '';

  stemmen.forEach((stem, index) => {
    const optie = document.createElement('option');
    optie.value = index;
    optie.textContent = stem.name + (stem.default ? ' (standaard)' : '');
    select.appendChild(optie);
  });

  const opgeslagen = localStorage.getItem('quickscan-stem');
  if (opgeslagen !== null && select.options[opgeslagen]) {
    select.value = opgeslagen;
  }
}

// Chrome laadt stemmen asynchroon
speechSynthesis.onvoiceschanged = laadStemmen;
laadStemmen();

// =====================
// TABS WISSELEN
// =====================

function switchTab(tab){
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  const actieveTab = document.querySelector(`.tab[data-tab="${tab}"]`);
  actieveTab.classList.add('active');
  actieveTab.setAttribute('aria-selected', 'true');
  document.getElementById(`panel-${tab}`).classList.add('active');
}

// =====================
// SCAN UITVOEREN
// =====================

let alGescand = false;
let scanResultaten = {};

function runScan(){
  alGescand = true;
  scanResultaten = {};

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

function toonQuick(d){
  document.getElementById('loading-quick').style.display = 'none';
  const el = document.getElementById('result-quick');
  el.style.display = 'block';

  const links = (d.hoofdlinks || [])
    .map(l => `<span class="chip quick">${veilig(l)}</span>`)
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
  `;
}

// --- Sfeer tab ---

function toonSfeer(d){
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
  `;
}

// =====================
// EVENT LISTENERS
// =====================
// Alle click-handlers staan hier, niet als onclick-attributen in de HTML.

document.addEventListener('DOMContentLoaded', function(){
  // Open knop
  document.getElementById('ext-btn').addEventListener('click', openPopup);

  // Sluit knop
  document.querySelector('.popup-close').addEventListener('click', closePopup);

  // Opnieuw scannen
  document.querySelector('.rescan-btn').addEventListener('click', runScan);

  // Tabs
  document.querySelectorAll('.tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      switchTab(this.dataset.tab);
    });
  });

  // Stem opslaan
  document.getElementById('stem-select').addEventListener('change', function(){
    localStorage.setItem('quickscan-stem', this.value);
  });
});

// =====================
// HULPFUNCTIES
// =====================

function setStatus(tekst){
  document.getElementById('status-text').textContent = tekst;
}

function veilig(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

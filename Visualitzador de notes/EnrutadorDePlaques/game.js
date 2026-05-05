/* ============================================================
   ENRUTADOR DE PLAQUES · PCB DEL SOLFEIG
   Lògica de joc · Vanilla JS
   ============================================================ */

const NOTES = [
  { name: "DO",  key: "a", color: "#ff003c" },
  { name: "RE",  key: "s", color: "#ff7f00" },
  { name: "MI",  key: "d", color: "#ffaa00" },
  { name: "FA",  key: "f", color: "#00ff41" },
  { name: "SOL", key: "g", color: "#00ffff" },
  { name: "LA",  key: "h", color: "#aa00ff" },
  { name: "SI",  key: "j", color: "#ff00ff" }
];
const NOTE_BY_KEY = Object.fromEntries(NOTES.map(n => [n.key, n.name]));
const NOTE_COLOR  = Object.fromEntries(NOTES.map(n => [n.name, n.color]));

function freqFor(noteName, y) {
  const high = y <= 35;
  const map = high
    ? { DO: 523.25, RE: 587.33, MI: 659.25, FA: 698.46, SOL: 783.99, LA: 880.00, SI: 987.77 }
    : { DO: 261.63, RE: 293.66, MI: 329.63, FA: 349.23, SOL: 392.00, LA: 440.00, SI: 493.88 };
  return map[noteName];
}

// Octava DO3-SI3 · EnrutadorDePlaques: escala ASCENDENT en dos blocs.
// F1: primera meitat de l'escala (DO·RE·MI). F2: segona meitat (FA·SOL·LA·SI).
const STAGE1 = [    // primera meitat ascendent (paquets DO-RE-MI)
  { name: "DO", y: 70, ledger: true },
  { name: "RE", y: 65 },
  { name: "MI", y: 60 }
];
const STAGE2 = [    // segona meitat ascendent (paquets FA-SOL-LA-SI)
  { name: "FA",  y: 55 },
  { name: "SOL", y: 50 },
  { name: "LA",  y: 45 },
  { name: "SI",  y: 40 }
];
const STAGE3 = [    // escala completa de Do major (octava baixa)
  { name: "DO",  y: 70, ledger: true },
  { name: "RE",  y: 65 },
  { name: "MI",  y: 60 },
  { name: "FA",  y: 55 },
  { name: "SOL", y: 50 },
  { name: "LA",  y: 45 },
  { name: "SI",  y: 40 }
];
const STAGE_ALL = [ // expansió aguda: DO4–LA5 (fins a l'última ledger sobre el pentagrama)
  { name: "DO",  y: 70, ledger: true },
  { name: "RE",  y: 65 },
  { name: "MI",  y: 60 },
  { name: "FA",  y: 55 },
  { name: "SOL", y: 50 },
  { name: "LA",  y: 45 },
  { name: "SI",  y: 40 },
  { name: "DO",  y: 35 },
  { name: "RE",  y: 30 },
  { name: "MI",  y: 25 },
  { name: "FA",  y: 20 },
  { name: "SOL", y: 15 },
  { name: "LA",  y: 10, ledger: true }
];

function makeLevel(n) {
  const cfg = { level: n, lives: 5 };
  // EnrutadorDePlaques: escala ASC 1a meitat → 2a meitat → completa → expansió aguda.
  if (n <= 4) {
    cfg.tier = "easy"; cfg.notes = STAGE1.slice();        // DO·RE·MI
    cfg.speed = 80 + n * 14; cfg.spawn = 3200 - n * 180; cfg.target = 8 + n;
  } else if (n <= 8) {
    cfg.tier = "easy"; cfg.notes = STAGE2.slice();        // FA·SOL·LA·SI
    const k = n - 4;
    cfg.speed = 110 + k * 18; cfg.spawn = 2900 - k * 160; cfg.target = 10 + k;
  } else if (n <= 12) {
    cfg.tier = "mid"; cfg.notes = STAGE3.slice();         // escala DO M sencera
    const k = n - 8;
    cfg.speed = 150 + k * 24; cfg.spawn = 2500 - k * 200; cfg.target = 12 + k;
  } else {
    cfg.tier = "hard"; cfg.notes = STAGE_ALL.slice();     // + agudes
    const k = n - 12;
    cfg.speed = 240 + k * 30; cfg.spawn = Math.max(1050, 2100 - k * 250); cfg.target = 16 + k * 2;
  }
  return cfg;
}

const SAVE_KEY = "enrutador-plaques:progress";
const DEFAULT_SETTINGS = { volMusic: 35, volSfx: 80, tones: true, music: true, colorblind: false };
const DEFAULT_STATS = {};
NOTES.forEach(n => DEFAULT_STATS[n.name] = { hits: 0, misses: 0 });

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultProgress();
    const d = JSON.parse(raw);
    return {
      unlocked: d.unlocked || 1, scores: d.scores || {},
      settings: { ...DEFAULT_SETTINGS, ...(d.settings || {}) },
      stats: { ...DEFAULT_STATS, ...(d.stats || {}) },
      achievements: d.achievements || {}
    };
  } catch { return defaultProgress(); }
}
function defaultProgress() {
  return { unlocked: 1, scores: {}, settings: { ...DEFAULT_SETTINGS },
           stats: JSON.parse(JSON.stringify(DEFAULT_STATS)), achievements: {} };
}
function saveProgress(p) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(p)); } catch {} }
let progress = loadProgress();

// FONS · MATRIX (pluja digital verda)
(function initMatrix() {
  const cv = document.getElementById("matrix");
  const ctx = cv.getContext("2d");
  let cols, drops, fontSize = 14;
  const glyphs = "01010110ABCDEF#$@&♪{}<>[]/\\";
  function resize() {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    cols = Math.floor(cv.width / fontSize);
    drops = Array(cols).fill(0).map(() => Math.random() * -cv.height / fontSize);
  }
  resize();
  window.addEventListener("resize", resize);
  function draw() {
    if (document.hidden) { requestAnimationFrame(draw); return; }
    ctx.fillStyle = "rgba(2,8,5,0.20)";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < cols; i++) {
      const ch = glyphs[(Math.random() * glyphs.length) | 0];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillStyle = (i + drops[i] | 0) % 9 === 0 ? "rgba(0,255,65,0.9)" : "rgba(0,180,40,0.7)";
      ctx.fillText(ch, x, y);
      if (y > cv.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.5 + Math.random() * 0.5;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// AUDIO
let actx = null, sfxGain = null, musicGain = null;
function audio() {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    sfxGain = actx.createGain();
    musicGain = actx.createGain();
    applyVolumes();
    sfxGain.connect(actx.destination);
    musicGain.connect(actx.destination);
  }
  if (actx.state === "suspended") actx.resume();
  return actx;
}
function applyVolumes() {
  if (!sfxGain) return;
  sfxGain.gain.value = (progress.settings.volSfx / 100) * 0.9;
  musicGain.gain.value = (progress.settings.volMusic / 100) * 0.6;
}
function beep({ freq = 440, dur = 0.1, type = "sine", vol = 0.12, slide = 0, delay = 0 }) {
  const ctx = audio();
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.linearRampToValueAtTime(freq + slide, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(sfxGain);
  o.start(t0); o.stop(t0 + dur + 0.05);
}
function playNoteTone(noteName, y) {
  if (!progress.settings.tones) return;
  const ctx = audio();
  const f = freqFor(noteName, y);
  const t0 = ctx.currentTime;
  [{ type: "sawtooth", vol: 0.10, det: 0 }, { type: "square", vol: 0.04, det: 12 }].forEach(p => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const flt = ctx.createBiquadFilter();
    flt.type = "lowpass"; flt.frequency.value = 2200;
    o.type = p.type; o.frequency.value = f; o.detune.value = p.det;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(p.vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    o.connect(flt).connect(g).connect(sfxGain);
    o.start(t0); o.stop(t0 + 0.55);
  });
}
// SFX cyberpunk: clic mecànic + zap / curtcircuit
function sndCorrect() {
  beep({ freq: 1800, dur: 0.03, type: "square", vol: 0.10 });
  beep({ freq: 2400, dur: 0.06, type: "sawtooth", vol: 0.07, slide: 600, delay: 0.02 });
}
function sndMiss() {
  // curtcircuit: noise + zumzum descendent
  beep({ freq: 80, dur: 0.18, type: "sawtooth", vol: 0.14, slide: -40 });
  beep({ freq: 120, dur: 0.20, type: "square", vol: 0.10, slide: -60, delay: 0.05 });
  beep({ freq: 200, dur: 0.10, type: "sawtooth", vol: 0.06, delay: 0.12 });
}
function sndClick() { beep({ freq: 1500, dur: 0.03, type: "square", vol: 0.05 }); }
function sndWin() { [523, 659, 784, 1046].forEach((f, i) => beep({ freq: f, dur: 0.15, type: "square", vol: 0.08, delay: i * 0.10 })); }
function sndLose() { [330, 277, 220, 165].forEach((f, i) => beep({ freq: f, dur: 0.25, type: "sawtooth", vol: 0.12, delay: i * 0.13 })); }
function sndAch() { [784, 988, 1175, 1568].forEach((f, i) => beep({ freq: f, dur: 0.12, type: "sawtooth", vol: 0.07, delay: i * 0.07 })); }

// MÚSICA · cyberpunk BPM 100
const MUSIC_BPM = 100;
const MUSIC_CHORDS = [
  { pad: [196.00, 246.94, 293.66], bass: 98.00,  arp: [196, 246.94, 293.66, 392] },     // Gm
  { pad: [233.08, 277.18, 349.23], bass: 116.54, arp: [233.08, 277.18, 349.23, 466.16] },// Bb
  { pad: [174.61, 220.00, 261.63], bass: 87.31,  arp: [174.61, 220, 261.63, 349.23] }, // F
  { pad: [261.63, 311.13, 392.00], bass: 130.81, arp: [261.63, 311.13, 392, 523.25] }  // Cm
];
let music = null;
function startMusic() {
  if (music || !progress.settings.music) return;
  audio();
  music = { nextTime: actx.currentTime + 0.15, bar: 0, playing: true, intensity: 1 };
  scheduleMusicTick();
}
function stopMusic() { if (music) music.playing = false; music = null; }
function setMusicIntensity(v) { if (music) music.intensity = v; }
function scheduleMusicTick() {
  if (!music || !music.playing) return;
  const ctx = audio();
  const beat = 60 / MUSIC_BPM;
  while (music.nextTime < ctx.currentTime + 0.6) {
    playMusicBar(music.nextTime, music.bar, music.intensity);
    music.nextTime += beat * 4;
    music.bar++;
  }
  setTimeout(scheduleMusicTick, 200);
}
function playMusicBar(when, bar, intensity) {
  const ctx = audio();
  const beat = 60 / MUSIC_BPM;
  const c = MUSIC_CHORDS[bar % 4];
  c.pad.forEach(f => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const flt = ctx.createBiquadFilter();
    flt.type = "lowpass"; flt.frequency.value = 1000; flt.Q.value = 1.5;
    o.type = "sawtooth"; o.frequency.value = f / 2;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.028, when + 0.4);
    g.gain.linearRampToValueAtTime(0.025, when + beat * 4 - 0.4);
    g.gain.linearRampToValueAtTime(0, when + beat * 4);
    o.connect(flt).connect(g).connect(musicGain);
    o.start(when); o.stop(when + beat * 4 + 0.1);
  });
  for (let b = 0; b < 4; b++) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square"; o.frequency.value = c.bass;
    g.gain.setValueAtTime(0, when + b * beat);
    g.gain.linearRampToValueAtTime(0.08, when + b * beat + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, when + b * beat + beat * 0.9);
    o.connect(g).connect(musicGain);
    o.start(when + b * beat); o.stop(when + b * beat + beat);
  }
  if (intensity >= 1) { kick(when); kick(when + beat * 2); }
  if (intensity >= 1.5) kick(when + beat * 3.5);
  if (intensity >= 1) for (let b = 0; b < 4; b++) hat(when + (b + 0.5) * beat, 0.025);
  for (let s = 0; s < 8; s++) {
    const f = c.arp[s % 4] * (s >= 4 ? 2 : 1);
    arp(f, when + s * beat / 2, beat / 4, intensity >= 1.3 ? 0.04 : 0.03);
  }
}
function kick(when) {
  const ctx = audio();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(140, when);
  o.frequency.exponentialRampToValueAtTime(40, when + 0.12);
  g.gain.setValueAtTime(0.18, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
  o.connect(g).connect(musicGain);
  o.start(when); o.stop(when + 0.2);
}
function hat(when, vol) {
  const ctx = audio();
  if (!_noiseBuf) _noiseBuf = makeNoise();
  const src = ctx.createBufferSource();
  src.buffer = _noiseBuf;
  const flt = ctx.createBiquadFilter();
  flt.type = "highpass"; flt.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
  src.connect(flt).connect(g).connect(musicGain);
  src.start(when); src.stop(when + 0.06);
}
function arp(f, when, dur, vol) {
  const ctx = audio();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square"; o.frequency.value = f;
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  o.connect(g).connect(musicGain);
  o.start(when); o.stop(when + dur + 0.05);
}
let _noiseBuf = null;
function makeNoise() {
  const ctx = audio();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// MICROXIP · render variants
const CHIP_TYPES = ["red", "green", "cyan", "purple", "yellow"];
function renderChip(type) {
  const palette = {
    red:    { led: "#ff003c", body: "#1a1a1a", label: "X-77" },
    green:  { led: "#00ff41", body: "#1a1a1a", label: "G-12" },
    cyan:   { led: "#00ffff", body: "#1a1a1a", label: "Q-99" },
    purple: { led: "#aa00ff", body: "#1a1a1a", label: "P-44" },
    yellow: { led: "#ffaa00", body: "#1a1a1a", label: "S-21" }
  };
  const p = palette[type] || palette.green;
  return `<svg viewBox="0 0 76 38" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="body-${type}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a3a3a"/>
        <stop offset="50%" stop-color="${p.body}"/>
        <stop offset="100%" stop-color="#000"/>
      </linearGradient>
    </defs>
    <!-- pins esquerra -->
    <g fill="#d4af37">
      <rect x="6" y="11" width="8" height="2"/>
      <rect x="6" y="16" width="8" height="2"/>
      <rect x="6" y="21" width="8" height="2"/>
      <rect x="6" y="26" width="8" height="2"/>
    </g>
    <!-- pins dreta -->
    <g fill="#d4af37">
      <rect x="62" y="11" width="8" height="2"/>
      <rect x="62" y="16" width="8" height="2"/>
      <rect x="62" y="21" width="8" height="2"/>
      <rect x="62" y="26" width="8" height="2"/>
    </g>
    <!-- cos del xip -->
    <rect x="14" y="8" width="48" height="22" rx="2" fill="url(#body-${type})" stroke="#000" stroke-width="0.8"/>
    <!-- marca pin 1 -->
    <circle cx="18" cy="12" r="1.4" fill="${p.led}" opacity=".9"/>
    <!-- serigrafia -->
    <text x="38" y="20" text-anchor="middle" font-size="6" font-weight="700" fill="#fff" font-family="monospace" opacity=".85">${p.label}</text>
    <text x="38" y="26" text-anchor="middle" font-size="3.5" fill="#aaa" font-family="monospace">CPU·${type.toUpperCase()}</text>
    <!-- LED indicador -->
    <circle cx="56" cy="12" r="1.5" fill="${p.led}">
      <animate attributeName="opacity" values="1;.3;1" dur="1.2s" repeatCount="indefinite"/>
    </circle>
    <!-- glow -->
    <rect x="14" y="8" width="48" height="22" rx="2" fill="none" stroke="${p.led}" stroke-width="0.4" opacity=".5"/>
  </svg>`;
}

// ENG. ZERO (enginyera ciberpunk)
function coachSVG() {
  return `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <ellipse cx="50" cy="135" rx="22" ry="3" fill="#000" opacity=".4"/>
    <!-- cames negres -->
    <rect x="42" y="95" width="6" height="35" rx="2" fill="#0a0a0a"/>
    <rect x="52" y="95" width="6" height="35" rx="2" fill="#0a0a0a"/>
    <!-- línies neón laterals -->
    <rect x="42" y="100" width="1.5" height="20" fill="#00ffff" opacity=".8"/>
    <rect x="56.5" y="100" width="1.5" height="20" fill="#00ffff" opacity=".8"/>
    <rect x="40" y="128" width="10" height="6" rx="1" fill="#000"/>
    <rect x="50" y="128" width="10" height="6" rx="1" fill="#000"/>
    <!-- jaqueta tècnica negra amb circuits -->
    <path d="M28 50 Q28 45 38 45 H62 Q72 45 72 50 V105 Q72 108 65 108 H35 Q28 108 28 105 Z" fill="#1a1f25" stroke="#00ff41" stroke-width="0.8"/>
    <!-- circuit pintat -->
    <path d="M40 60 H50 V70 H60" stroke="#00ff41" stroke-width="0.6" fill="none" opacity=".7"/>
    <circle cx="50" cy="65" r="1.5" fill="#00ff41"/>
    <text x="50" y="85" text-anchor="middle" font-size="8" font-weight="900" fill="#00ff41" font-family="monospace" letter-spacing="1">ENG.0</text>
    <!-- braços -->
    <path d="M28 55 Q22 65 24 80 Q26 90 28 92" stroke="#1a1f25" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M72 55 Q78 65 76 80 Q74 88 76 92" stroke="#1a1f25" stroke-width="9" fill="none" stroke-linecap="round"/>
    <!-- mans -->
    <circle cx="24" cy="92" r="4" fill="#e8b78a"/>
    <circle cx="76" cy="92" r="4" fill="#e8b78a"/>
    <!-- tablet a la mà dreta -->
    <rect x="73" y="95" width="8" height="12" rx="1" fill="#0a0a0a" stroke="#00ffff" stroke-width="0.4"/>
    <rect x="74" y="96" width="6" height="8" fill="#003a4a"/>
    <!-- cap -->
    <circle cx="50" cy="32" r="14" fill="#e8b78a"/>
    <!-- cabells curts violetes -->
    <path d="M36 26 Q50 12 64 26 Q60 16 50 14 Q40 16 36 26" fill="#aa00ff"/>
    <!-- visor digital -->
    <rect x="38" y="29" width="24" height="8" rx="1" fill="#00ffff" opacity=".6" stroke="#00ff41" stroke-width="0.6"/>
    <!-- línies del visor -->
    <line x1="40" y1="32" x2="60" y2="32" stroke="#00ff41" stroke-width="0.6" opacity=".9"/>
    <line x1="40" y1="34" x2="58" y2="34" stroke="#fff" stroke-width="0.4" opacity=".7"/>
    <!-- boca -->
    <path d="M45 41 Q50 43 55 41" stroke="#1a1a1a" stroke-width="1" fill="none" stroke-linecap="round"/>
    <!-- auricular -->
    <circle cx="36" cy="32" r="2.5" fill="#00ff41" opacity=".7"/>
    <line x1="36" y1="34" x2="36" y2="44" stroke="#00ff41" stroke-width="0.6"/>
  </svg>`;
}

// NAVEGACIÓ
const screens = {
  landing:  document.getElementById("screen-landing"),
  tutorial: document.getElementById("screen-tutorial"),
  levels:   document.getElementById("screen-levels"),
  game:     document.getElementById("screen-game")
};
function go(target) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[target].classList.add("active");
  if (target === "levels") renderLevelGrid();
  if (target !== "game") stopGame(true);
  if (target === "tutorial") startTutorial();
  if (target === "game") setMusicIntensity(1);
  else setMusicIntensity(0.7);
  document.body.classList.toggle("in-game", target === "game");
  document.body.classList.toggle("in-tutorial", target === "tutorial");
}
document.querySelectorAll("[data-go]").forEach(el => {
  el.addEventListener("click", () => { sndClick(); go(el.dataset.go); });
});
document.querySelectorAll(".coach-svg").forEach(el => el.innerHTML = coachSVG());
document.querySelectorAll(".magnetic").forEach(btn => {
  btn.addEventListener("mousemove", e => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / r.width;
    const dy = (e.clientY - r.top - r.height / 2) / r.height;
    btn.style.transform = `translate(${dx * 14}px, ${dy * 8}px)`;
  });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
});

const levelGrid = document.getElementById("level-grid");
function renderLevelGrid() {
  levelGrid.innerHTML = "";
  for (let i = 1; i <= 16; i++) {
    const card = document.createElement("div");
    let tier, tag;
    if (i <= 4)       { tier = "easy"; tag = "DO·RE·MI"; }
    else if (i <= 8)  { tier = "easy"; tag = "FA·SOL·LA·SI"; }
    else if (i <= 12) { tier = "mid";  tag = "ESCALA DO M"; }
    else              { tier = "hard"; tag = "+ AGUTS"; }
    card.className = `level-card ${tier}`;
    if (i > progress.unlocked) card.classList.add("locked");
    if (progress.scores[i])    card.classList.add("cleared");
    const score = progress.scores[i];
    card.innerHTML = `
      <div class="lvl-num">${i.toString().padStart(2, "0")}</div>
      <div class="lvl-tag">${tag}</div>
      ${score ? `<div class="lvl-score">${score.toString().padStart(6, "0")}</div>` : ""}
    `;
    if (i <= progress.unlocked) card.addEventListener("click", () => startLevel(i));
    levelGrid.appendChild(card);
  }
}
document.getElementById("reset-progress").addEventListener("click", () => {
  if (!confirm("Vols reiniciar tot el progrés? Aquesta acció és irreversible.")) return;
  progress = defaultProgress();
  saveProgress(progress);
  applyVolumes();
  renderLevelGrid();
});

const tubesEl = document.getElementById("tubes");
function buildTubes() {
  tubesEl.innerHTML = "";
  NOTES.forEach(n => {
    const t = document.createElement("button");
    t.className = "tube";
    t.dataset.note = n.name;
    t.dataset.key = n.key;
    t.style.setProperty("--note-color", n.color);
    t.setAttribute("aria-label", `Nota ${n.name}, tecla ${n.key.toUpperCase()}`);
    t.innerHTML = `<div class="tube-glyph">${n.name}</div><div class="tube-key">${n.key.toUpperCase()}</div>`;
    t.addEventListener("click", () => handleInput(n.name));
    tubesEl.appendChild(t);
  });
}
buildTubes();

function renderPlateHTML(noteY, withLedger, chipType, noteName, forceHint) {
  const Y = noteY + 2;
  const ledger = withLedger
    ? `<line x1="72" y1="${Y}" x2="96" y2="${Y}" stroke="#b87333" stroke-width="1.6" stroke-linecap="round"/>`
    : "";
  const hint = forceHint ? `<div class="note-hint">${noteName}</div>` : "";
  return `
    <div class="plate-base"></div>
    <div class="sushi-piece chip-${chipType}">${renderChip(chipType)}</div>
    <div class="staff-card">
      <svg class="staff-svg" viewBox="0 0 116 82" xmlns="http://www.w3.org/2000/svg">
        <line x1="8" y1="22" x2="108" y2="22" stroke="#b87333" stroke-width="1.6"/>
        <line x1="8" y1="32" x2="108" y2="32" stroke="#b87333" stroke-width="1.6"/>
        <line x1="8" y1="42" x2="108" y2="42" stroke="#b87333" stroke-width="1.6"/>
        <line x1="8" y1="52" x2="108" y2="52" stroke="#b87333" stroke-width="1.6"/>
        <line x1="8" y1="62" x2="108" y2="62" stroke="#b87333" stroke-width="1.6"/>
        <text x="4" y="60" font-size="44" fill="#00ff41" font-family="serif" font-weight="700">𝄞</text>
        ${ledger}
        <ellipse cx="84" cy="${Y}" rx="7" ry="4.8" fill="#00ffff" transform="rotate(-18 84 ${Y})"/>
        <ellipse cx="84" cy="${Y}" rx="3.6" ry="2.4" fill="#fff" transform="rotate(-18 84 ${Y})" opacity=".9"/>
      </svg>
      ${hint}
    </div>
  `;
}

const particleCanvas = document.getElementById("particles");
const pctx = particleCanvas.getContext("2d");
let particles = [];
function resizeParticles() {
  const r = particleCanvas.getBoundingClientRect();
  particleCanvas.width = r.width;
  particleCanvas.height = r.height;
}
window.addEventListener("resize", resizeParticles);
function spawnParticles(x, y, type, color) {
  const count = type === "combo" ? 30 : type === "hit" ? 16 : 8;
  for (let i = 0; i < count; i++) {
    const angle = type === "miss" ? Math.PI + (Math.random() - 0.5) * 0.7 : Math.random() * Math.PI * 2;
    const speed = type === "hit" ? 120 + Math.random() * 200
                : type === "combo" ? 80 + Math.random() * 220
                : 30 + Math.random() * 80;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === "hit" ? 80 : type === "miss" ? -60 : 0),
      life: 1,
      decay: type === "miss" ? 1.6 : type === "combo" ? 0.7 : 1.1,
      color: color || (type === "miss" ? "#ff003c" : type === "combo" ? "#ffaa00" : "#00ffff"),
      size: type === "combo" ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
      gravity: type === "miss" ? 280 : 140
    });
  }
}
function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vy += p.gravity * dt;
    p.life -= dt * p.decay;
  }
  particles = particles.filter(p => p.life > 0);
}
function renderParticles() {
  pctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  pctx.shadowBlur = 10;
  for (const p of particles) {
    pctx.globalAlpha = Math.max(0, p.life);
    pctx.fillStyle = p.color;
    pctx.shadowColor = p.color;
    pctx.beginPath();
    pctx.arc(p.x, p.y, p.size * Math.max(.2, p.life), 0, Math.PI * 2);
    pctx.fill();
  }
  pctx.globalAlpha = 1;
  pctx.shadowBlur = 0;
}

const chefEl = document.getElementById("chef");
let chefTimer = null;
function chefSet(state, hold = 600) {
  if (!chefEl) return;
  chefEl.classList.remove("hit", "miss", "combo");
  if (state) chefEl.classList.add(state);
  if (chefTimer) clearTimeout(chefTimer);
  chefTimer = setTimeout(() => chefEl.classList.remove(state), hold);
}

const platesLayer = document.getElementById("plates-layer");
const beltEl      = document.getElementById("belt");
const armEl       = document.getElementById("arm");
const flashEl     = document.getElementById("flash");
const comboEl     = document.getElementById("combo-pop");
const overlay     = document.getElementById("overlay");
const ovTitle     = document.getElementById("ov-title");
const ovText      = document.getElementById("ov-text");
const ovStats     = document.getElementById("ov-stats");
const ovRetry     = document.getElementById("ov-retry");
const ovNext      = document.getElementById("ov-next");
const ovMenu      = document.getElementById("ov-menu");
const cdEl        = document.getElementById("countdown");
const cdNum       = document.getElementById("cd-num");
const hudLevel    = document.getElementById("hud-level");
const hudLives    = document.getElementById("hud-lives");
const hudDone     = document.getElementById("hud-done");
const hudTarget   = document.getElementById("hud-target");
const gameScreen  = document.getElementById("screen-game");

let state = null;
function startLevel(n) {
  if (state) {
    state.running = false;
    if (state.rafId) cancelAnimationFrame(state.rafId);
  }
  go("game");
  const cfg = makeLevel(n);
  state = {
    cfg, plates: [], score: 0, lives: cfg.lives,
    completed: 0, lastSpawn: 0, lastFrame: 0,
    running: false, beltW: 0, trashStart: 0, combo: 0, rafId: null,
    sessionStats: {}
  };
  NOTES.forEach(nn => state.sessionStats[nn.name] = { hits: 0, misses: 0 });
  hudLevel.textContent = n.toString().padStart(2, "0");
  hudTarget.textContent = cfg.target;
  hudDone.textContent = 0;
  setLives(cfg.lives);
  buildOdometer();
  setScore(0, true);
  overlay.classList.add("hidden");
  platesLayer.innerHTML = "";
  particles = [];
  measureBelt();
  resizeParticles();
  countdownThenStart();
  startMusic();
  setMusicIntensity(n >= 17 ? 1.5 : n >= 11 ? 1.3 : 1);
}
function measureBelt() {
  const r = beltEl.getBoundingClientRect();
  state.beltW = r.width;
  state.trashStart = r.width - 140;
}
window.addEventListener("resize", () => { if (state) { measureBelt(); resizeParticles(); } });

function countdownThenStart() {
  const seq = ["3", "2", "1", "GO!"];
  cdEl.classList.remove("hidden");
  let i = 0;
  function tick() {
    cdNum.textContent = seq[i];
    cdNum.style.animation = "none"; cdNum.offsetHeight;
    cdNum.style.animation = "";
    beep({ freq: i === seq.length - 1 ? 880 : 440, dur: 0.15, type: "square", vol: 0.1 });
    i++;
    if (i < seq.length) setTimeout(tick, 700);
    else setTimeout(() => { cdEl.classList.add("hidden"); runGame(); }, 600);
  }
  tick();
}
function runGame() {
  state.running = true;
  state.paused = false;
  state.lastFrame = performance.now();
  state.lastSpawn = performance.now();
  spawnPlate();
  state.rafId = requestAnimationFrame(loop);
}
function stopGame(silent) {
  if (!state) return;
  state.running = false;
  state.paused = false;
  if (state.rafId) cancelAnimationFrame(state.rafId);
  if (!silent) platesLayer.innerHTML = "";
}

const pauseOverlay = document.getElementById("pause-overlay");
const pauseBtn     = document.getElementById("pause-game");
function togglePause() {
  if (!state || !state.running) return;
  if (state.paused) resumeGame(); else pauseGame();
}
function pauseGame() {
  if (!state || !state.running || state.paused) return;
  state.paused = true;
  if (state.rafId) cancelAnimationFrame(state.rafId);
  gameScreen.classList.add("paused");
  pauseOverlay.classList.remove("hidden");
  setMusicIntensity(0.5);
}
function resumeGame() {
  if (!state || !state.paused) return;
  state.paused = false;
  state.lastFrame = performance.now();
  state.lastSpawn = performance.now() - (state.cfg.spawn * 0.5);
  gameScreen.classList.remove("paused");
  pauseOverlay.classList.add("hidden");
  setMusicIntensity(state.cfg.level >= 17 ? 1.5 : state.cfg.level >= 11 ? 1.3 : 1);
  state.rafId = requestAnimationFrame(loop);
}
pauseBtn.addEventListener("click", togglePause);
document.getElementById("resume-game").addEventListener("click", resumeGame);
document.getElementById("pause-quit").addEventListener("click", () => {
  pauseOverlay.classList.add("hidden");
  stopGame();
  go("levels");
});

function loop(ts) {
  if (!state || !state.running || state.paused) return;
  const dt = Math.min(0.05, (ts - state.lastFrame) / 1000);
  state.lastFrame = ts;
  if (ts - state.lastSpawn >= state.cfg.spawn) { spawnPlate(); state.lastSpawn = ts; }
  let activePlate = null, bestX = -Infinity;
  const speed = state.cfg.speed;
  for (const p of state.plates) {
    if (p.dying) continue;
    p.x += speed * dt;
    p.el.style.transform = `translate(${p.x}px, -50%)`;
    if (p.x > bestX) { bestX = p.x; activePlate = p; }
    if (p.x >= state.trashStart && !p.fallen) { p.fallen = true; onPlateFell(p); }
  }
  for (const p of state.plates) {
    if (p === activePlate) p.el.classList.add("active");
    else p.el.classList.remove("active");
  }
  updateParticles(dt);
  renderParticles();
  state.plates = state.plates.filter(p => !p.removed);
  if (state.lives <= 0) return endGame(false);
  if (state.completed >= state.cfg.target) return endGame(true);
  state.rafId = requestAnimationFrame(loop);
}

function pickNoteFromPool(pool) {
  const weights = pool.map(n => {
    const s = progress.stats[n.name] || { hits: 0, misses: 0 };
    const total = s.hits + s.misses;
    if (total < 4) return 1;
    return 1 + (s.misses / total) * 2.5;
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}
function spawnPlate() {
  const n = pickNoteFromPool(state.cfg.notes);
  const chip = CHIP_TYPES[(Math.random() * CHIP_TYPES.length) | 0];
  const el = document.createElement("div");
  el.className = "plate";
  el.style.transform = `translate(-200px, -50%)`;
  el.innerHTML = renderPlateHTML(n.y, !!n.ledger, chip, n.name);
  platesLayer.appendChild(el);
  state.plates.push({
    el, x: -200, note: n.name, noteY: n.y,
    attempts: 0, fallen: false, dying: false, removed: false
  });
}

function handleInput(noteName) {
  if (!state || !state.running || state.paused) return;
  sndClick();
  let target = null, bestX = -Infinity;
  for (const p of state.plates) {
    if (p.dying) continue;
    if (p.x > bestX) { bestX = p.x; target = p; }
  }
  const tube = tubesEl.querySelector(`[data-note="${noteName}"]`);
  if (!target) {
    if (tube) {
      tube.classList.remove("fired-bad"); tube.offsetHeight;
      tube.classList.add("fired-bad");
      setTimeout(() => tube.classList.remove("fired-bad"), 400);
    }
    return;
  }
  if (target.note === noteName) onCorrect(target, tube);
  else onWrong(target, tube);
}
document.addEventListener("keydown", e => {
  if (!screens.game.classList.contains("active")) return;
  const k = e.key.toLowerCase();
  if (k === "p") { togglePause(); return; }
  if (k === "escape") { if (state && state.running) togglePause(); else quitToMenu(); return; }
  if (state && state.paused) return;
  if (NOTE_BY_KEY[k]) handleInput(NOTE_BY_KEY[k]);
});

function onCorrect(plate, tube) {
  plate.dying = true;
  state.combo++;
  state.completed++;
  state.score += 10 + Math.min(20, state.combo * 2);
  hudDone.textContent = state.completed;
  setScore(state.score);
  state.sessionStats[plate.note].hits++;
  progress.stats[plate.note].hits++;
  playNoteTone(plate.note, plate.noteY);
  sndCorrect();
  flashEl.classList.remove("flash-good"); flashEl.offsetHeight;
  flashEl.classList.add("flash-good");
  if (tube) {
    tube.classList.remove("fired"); tube.offsetHeight;
    tube.classList.add("fired");
    setTimeout(() => tube.classList.remove("fired"), 400);
  }
  const beltRect = beltEl.getBoundingClientRect();
  const cx = plate.x + 70, cy = beltRect.height / 2;
  spawnParticles(cx, cy, "hit", NOTE_COLOR[plate.note]);
  if (state.combo >= 5) {
    chefSet("combo", 800);
    spawnParticles(cx, cy, "combo");
    if (state.combo % 5 === 0) showCombo(`x${state.combo} COMBO!`);
  } else if (state.combo >= 3) {
    chefSet("hit", 500);
    showCombo(`x${state.combo} COMBO!`);
  } else { chefSet("hit", 400); }
  showArmAt(plate.x);
  plate.el.style.left = plate.x + "px";
  plate.el.style.transform = "translate(0, -50%)";
  plate.el.offsetHeight;
  plate.el.classList.add("snatch");
  checkAchievements();
  setTimeout(() => { plate.removed = true; plate.el.remove(); }, 560);
}
function onWrong(plate, tube) {
  plate.attempts = (plate.attempts || 0) + 1;
  state.combo = 0;
  state.sessionStats[plate.note].misses++;
  progress.stats[plate.note].misses++;
  chefSet("miss", 350);
  plate.el.classList.remove("shake-red"); plate.el.offsetHeight;
  plate.el.classList.add("shake-red");
  setTimeout(() => plate.el.classList.remove("shake-red"), 360);
  beep({ freq: 220, dur: 0.08, type: "sawtooth", vol: 0.07, slide: -40 });
  if (tube) {
    tube.classList.remove("fired-bad"); tube.offsetHeight;
    tube.classList.add("fired-bad");
    setTimeout(() => tube.classList.remove("fired-bad"), 400);
  }
}
function onPlateFell(plate) {
  plate.dying = true;
  if (!plate.attempts) {
    state.sessionStats[plate.note].misses++;
    progress.stats[plate.note].misses++;
  }
  state.combo = 0;
  state.lives = Math.max(0, state.lives - 1);
  setLives(state.lives);
  sndMiss();
  shakeCamera();
  chefSet("miss", 700);
  flashEl.classList.remove("flash-bad"); flashEl.offsetHeight;
  flashEl.classList.add("flash-bad");
  const beltRect = beltEl.getBoundingClientRect();
  spawnParticles(plate.x + 70, beltRect.height / 2, "miss");
  plate.el.style.left = plate.x + "px";
  plate.el.style.transform = "translate(0, -50%)";
  plate.el.offsetHeight;
  plate.el.classList.add("miss");
  plate.el.classList.add("fall");
  setTimeout(() => { plate.removed = true; plate.el.remove(); }, 950);
}

function shakeCamera() {
  gameScreen.classList.remove("shake"); gameScreen.offsetHeight;
  gameScreen.classList.add("shake");
  setTimeout(() => gameScreen.classList.remove("shake"), 360);
}
function showArmAt(x) {
  armEl.style.left = `${x}px`;
  armEl.classList.add("active");
  setTimeout(() => armEl.classList.remove("active"), 500);
}
function showCombo(text) {
  comboEl.textContent = text;
  comboEl.classList.remove("show"); comboEl.offsetHeight;
  comboEl.classList.add("show");
}

function setLives(v) {
  if (v === "∞") { hudLives.textContent = "∞"; return; }
  hudLives.textContent = "●".repeat(v) + "○".repeat(Math.max(0, state.cfg.lives - v));
}
let odoDigits = [];
function buildOdometer() {
  const host = document.getElementById("hud-score");
  host.innerHTML = "";
  odoDigits = [];
  for (let i = 0; i < 6; i++) {
    const wrap = document.createElement("div");
    wrap.className = "odo-digit";
    const strip = document.createElement("div");
    strip.className = "odo-strip";
    for (let d = 0; d < 10; d++) {
      const sp = document.createElement("span");
      sp.textContent = d;
      strip.appendChild(sp);
    }
    wrap.appendChild(strip);
    host.appendChild(wrap);
    odoDigits.push(strip);
  }
}
function setScore(v, instant) {
  const s = v.toString().padStart(6, "0");
  for (let i = 0; i < 6; i++) {
    const digit = parseInt(s[i], 10);
    const strip = odoDigits[i];
    if (instant) {
      strip.style.transition = "none";
      strip.style.transform = `translateY(-${digit * 28}px)`;
      strip.offsetHeight;
      strip.style.transition = "";
    } else {
      strip.style.transform = `translateY(-${digit * 28}px)`;
    }
  }
}

const ACHIEVEMENTS = [
  { id: "first-pkt",    name: "Primer paquet enrutat",      test: () => state && state.completed >= 1 },
  { id: "combo-10",     name: "Combo x10 · Sysadmin",       test: () => state && state.combo >= 10 },
  { id: "combo-20",     name: "Combo x20 · Hacker",         test: () => state && state.combo >= 20 },
  { id: "perfect-stage",name: "Procés sense errors",        test: () => state && state.completed >= state.cfg.target && state.lives === state.cfg.lives },
  { id: "stage-4",      name: "Mestre del coure",           test: () => progress.scores[4] != null },
  { id: "stage-8",      name: "Mestre dels greus",          test: () => progress.scores[8] != null },
  { id: "stage-12",     name: "Mestre dels aguts",          test: () => progress.scores[12] != null },
  { id: "stage-16",     name: "ROOT del Solfeig",           test: () => progress.scores[16] != null },
  { id: "all-notes",    name: "Lector complet · 7 notes",   test: () =>
      NOTES.every(n => (progress.stats[n.name].hits || 0) >= 5) }
];
const achToast = document.getElementById("ach-toast");
function unlockAchievement(a) {
  if (progress.achievements[a.id]) return;
  progress.achievements[a.id] = Date.now();
  saveProgress(progress);
  showAchToast(a);
  sndAch();
}
function showAchToast(a) {
  achToast.innerHTML = `<div class="ach-icon">⚡</div><div class="ach-body"><div class="ach-title">PERMÍS DESBLOCAT</div><div class="ach-name">${a.name}</div></div>`;
  achToast.classList.remove("show"); achToast.offsetHeight;
  achToast.classList.add("show");
  clearTimeout(showAchToast._t);
  showAchToast._t = setTimeout(() => achToast.classList.remove("show"), 3500);
}
function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (!progress.achievements[a.id] && a.test()) unlockAchievement(a);
  }
}

function endGame(victory) {
  if (!state.running) return;
  state.running = false;
  if (state.rafId) cancelAnimationFrame(state.rafId);
  if (victory) {
    sndWin();
    const n = state.cfg.level;
    if (n + 1 > progress.unlocked && n < 16) progress.unlocked = n + 1;
    progress.scores[n] = Math.max(progress.scores[n] || 0, state.score);
  } else { sndLose(); }
  saveProgress(progress);
  checkAchievements();
  ovTitle.textContent = victory ? "PROCÉS COMPILAT!" : "FATAL ERROR";
  ovText.textContent = victory
    ? "Tots els paquets enrutats correctament. El sistema està estable."
    : "El sistema ha fallat. Reinicia el bus i torna-ho a provar.";
  const noteRows = NOTES.map(nn => {
    const s = state.sessionStats[nn.name];
    const total = s.hits + s.misses;
    const acc = total === 0 ? null : Math.round((s.hits / total) * 100);
    return `
      <div class="note-stat" style="border-color: ${nn.color}55">
        <div class="ns-name" style="color:${nn.color}">${nn.name}</div>
        <div class="ns-acc">${acc === null ? "—" : acc + "%"}</div>
        <div class="ns-bar"><div class="ns-fill" style="width:${acc || 0}%; background:${nn.color}"></div></div>
      </div>`;
  }).join("");
  ovStats.innerHTML = `
    <div class="ov-stat"><span class="lbl">PUNTS</span><span class="val">${state.score}</span></div>
    <div class="ov-stat"><span class="lbl">PAQUETS</span><span class="val">${state.completed}/${state.cfg.target}</span></div>
    <div class="ov-stat"><span class="lbl">FUSIBLES</span><span class="val">${state.lives}</span></div>
    <div class="ov-stat"><span class="lbl">COMBO MÀX</span><span class="val">${state.combo}</span></div>
  `;
  ovStats.innerHTML += `<div class="note-stats" style="grid-column: 1 / -1; width:100%;">${noteRows}</div>`;
  ovNext.style.display = (victory && state.cfg.level < 16) ? "" : "none";
  setTimeout(() => overlay.classList.remove("hidden"), 350);
}

ovRetry.addEventListener("click", () => startLevel(state.cfg.level));
ovNext.addEventListener("click", () => startLevel(state.cfg.level + 1));
ovMenu.addEventListener("click", () => { stopGame(); go("levels"); });
document.getElementById("quit-game").addEventListener("click", quitToMenu);

function quitToMenu() {
  if (!state) return go("levels");
  if (state.running && !confirm("Vols sortir? Es perdrà el progrés del procés actual.")) return;
  stopGame();
  go("levels");
}

const cogBtn       = document.getElementById("cog-btn");
const settingsPanel= document.getElementById("settings-panel");
const volMusic     = document.getElementById("vol-music");
const volSfx       = document.getElementById("vol-sfx");
const volMusicVal  = document.getElementById("vol-music-val");
const volSfxVal    = document.getElementById("vol-sfx-val");
const optTones     = document.getElementById("opt-tones");
const optCb        = document.getElementById("opt-cb");
const optMusic     = document.getElementById("opt-music");

function loadSettingsUI() {
  volMusic.value = progress.settings.volMusic;
  volSfx.value = progress.settings.volSfx;
  volMusicVal.textContent = progress.settings.volMusic;
  volSfxVal.textContent = progress.settings.volSfx;
  optTones.checked = progress.settings.tones;
  optCb.checked = progress.settings.colorblind;
  optMusic.checked = progress.settings.music;
  document.body.classList.toggle("cb-mode", progress.settings.colorblind);
}
loadSettingsUI();

cogBtn.addEventListener("click", () => { loadSettingsUI(); settingsPanel.classList.remove("hidden"); });
document.getElementById("settings-close").addEventListener("click", () => { settingsPanel.classList.add("hidden"); saveProgress(progress); });
volMusic.addEventListener("input", e => { progress.settings.volMusic = +e.target.value; volMusicVal.textContent = e.target.value; applyVolumes(); });
volSfx.addEventListener("input", e => { progress.settings.volSfx = +e.target.value; volSfxVal.textContent = e.target.value; applyVolumes(); });
optTones.addEventListener("change", e => { progress.settings.tones = e.target.checked; });
optCb.addEventListener("change", e => { progress.settings.colorblind = e.target.checked; document.body.classList.toggle("cb-mode", e.target.checked); });
optMusic.addEventListener("change", e => { progress.settings.music = e.target.checked; if (e.target.checked) startMusic(); else stopMusic(); });

const bootEl = document.getElementById("boot");
const bootFill = document.getElementById("boot-fill");
const bootLog = document.getElementById("boot-log");
const BOOT_LINES = [
  "[OK] POST · BIOS Mk-7 inicialitzada",
  "[OK] Detectant 7 mòduls de processament",
  "[OK] Calibrant bus de dades a 100 BPM",
  "[OK] Carregant memòria RAM solfeig",
  "[OK] Verificant pistes de coure",
  "[OK] Fusibles · 5/5 OK",
  "[OK] Càrrega de mòdul lectura PCB",
  "[--] Esperant ordres de l'Eng. Zero..."
];
function runBoot() {
  let p = 0, lineIdx = 0;
  const interval = setInterval(() => {
    p += 4 + Math.random() * 8;
    if (p > 100) p = 100;
    bootFill.style.width = p + "%";
    if (lineIdx < BOOT_LINES.length && p > (lineIdx + 1) * (100 / BOOT_LINES.length)) {
      bootLog.textContent += BOOT_LINES[lineIdx] + "\n";
      lineIdx++;
    }
    if (p >= 100) { clearInterval(interval); setTimeout(finishBoot, 600); }
  }, 130);
}
function finishBoot() {
  bootEl.classList.add("fade-out");
  setTimeout(() => {
    bootEl.classList.remove("active");
    bootEl.style.display = "none";
    go("landing");
  }, 800);
}
bootEl.addEventListener("click", () => {
  bootFill.style.width = "100%";
  bootLog.textContent = BOOT_LINES.join("\n");
  setTimeout(finishBoot, 200);
});
runBoot();

const hudMusicSlider = document.getElementById("hud-music");
hudMusicSlider.value = progress.settings.volMusic;
hudMusicSlider.addEventListener("input", e => {
  progress.settings.volMusic = +e.target.value;
  applyVolumes();
});
hudMusicSlider.addEventListener("change", () => saveProgress(progress));

// TUTORIAL
const TUTORIAL = [
  { type: "speak", text: "Connectant... Soc l'<b>Eng. Zero</b>. T'ensenyaré a enrutar paquets de dades llegint la nota de cada xip. Endavant!" },
  { type: "speak", text: "Mira la placa: <b>5 pistes de coure</b> horitzontals (el pentagrama). Cada xip apareix sobre una pista o entre dues." },
  { type: "play", note: "DO", y: 70, chip: "green", hint: true,
    intro: "Aquest xip està al <b>DO central</b> (línia addicional sota el pentagrama). Prem la tecla <b>A</b>.",
    success: "Excel·lent! DO és la tecla A. ✓" },
  { type: "play", note: "MI", y: 60, chip: "yellow", hint: true,
    intro: "Ara <b>MI</b>, a la <b>primera línia</b>. Prem la tecla <b>D</b>.",
    success: "Així és, MI és la tecla D. ✓" },
  { type: "play", note: "SOL", y: 50, chip: "red", hint: true,
    intro: "Aquest és <b>SOL</b>, a la <b>segona línia</b>. Prem la tecla <b>G</b>.",
    success: "Increïble!" },
  { type: "speak", text: "Si t'equivoques, no hi ha problema!<br/>El xip parpelleja vermell i pots <b>reintentar</b> fins que caigui a l'abisme de dades." },
  { type: "play", note: "LA", y: 45, chip: "cyan", hint: false,
    intro: "Última prova <b>SENSE pista</b>: aquest xip és al <b>segon espai</b>. Quina nota?",
    success: "Perfecte! LA és la tecla H." },
  { type: "speak", final: true, text: "Sistema llest! 7 notes, 7 tecles <b>A·S·D·F·G·H·J</b>.<br/>A la placa, hacker!" }
];

let tutIdx = 0, tutBusy = false;
const tutText = document.getElementById("tut-text");
const tutNext = document.getElementById("tut-next");
const tutPlateSlot = document.getElementById("tut-plate-slot");
const tutStepLabel = document.getElementById("tut-step-label");
const tutMiniTubes = document.getElementById("tut-mini-tubes");
const tutChefEl = document.getElementById("tut-chef");

function buildTutTubes() {
  tutMiniTubes.innerHTML = "";
  NOTES.forEach(n => {
    const t = document.createElement("button");
    t.className = "tube";
    t.dataset.note = n.name;
    t.dataset.key = n.key;
    t.style.setProperty("--note-color", n.color);
    t.setAttribute("aria-label", `Nota ${n.name}, tecla ${n.key.toUpperCase()}`);
    t.innerHTML = `<div class="tube-glyph">${n.name}</div><div class="tube-key">${n.key.toUpperCase()}</div>`;
    t.addEventListener("click", () => onTutInput(n.name));
    tutMiniTubes.appendChild(t);
  });
}
buildTutTubes();
function startTutorial() { tutIdx = 0; tutBusy = false; renderTutStep(); }
function tutChefSet(state, hold = 600) {
  if (!tutChefEl) return;
  tutChefEl.classList.remove("hit", "miss", "combo");
  if (state) {
    tutChefEl.classList.add(state);
    setTimeout(() => tutChefEl.classList.remove(state), hold);
  }
}
function renderTutStep() {
  const step = TUTORIAL[tutIdx];
  if (!step) { go("levels"); return; }
  tutBusy = false;
  tutStepLabel.textContent = `PAS ${tutIdx + 1} / ${TUTORIAL.length}`;
  tutText.innerHTML = step.intro || step.text;
  tutPlateSlot.innerHTML = "";
  tutNext.style.display = "none";
  tutMiniTubes.querySelectorAll(".tube").forEach(t => t.classList.remove("highlight"));
  if (step.type === "speak") {
    tutNext.style.display = "";
    tutNext.textContent = step.final ? "▶ A LA PLACA" : "SEGÜENT ▶";
  } else if (step.type === "play") {
    const el = document.createElement("div");
    el.className = "plate";
    el.innerHTML = renderPlateHTML(step.y, false, step.chip || "green", step.note, step.hint);
    tutPlateSlot.appendChild(el);
    if (step.hint) {
      const hintTube = tutMiniTubes.querySelector(`[data-note="${step.note}"]`);
      if (hintTube) hintTube.classList.add("highlight");
    }
  }
}
function onTutInput(noteName) {
  if (!screens.tutorial.classList.contains("active")) return;
  const step = TUTORIAL[tutIdx];
  if (!step || step.type !== "play" || tutBusy) return;
  sndClick();
  const tube = tutMiniTubes.querySelector(`[data-note="${noteName}"]`);
  if (noteName === step.note) {
    tutBusy = true;
    sndCorrect();
    playNoteTone(noteName, step.y);
    tutChefSet("hit", 600);
    if (tube) {
      tube.classList.remove("fired"); tube.offsetHeight;
      tube.classList.add("fired");
      setTimeout(() => tube.classList.remove("fired"), 400);
    }
    tutText.innerHTML = step.success;
    const plate = tutPlateSlot.querySelector(".plate");
    if (plate) plate.classList.add("snatch");
    setTimeout(() => { tutNext.style.display = ""; tutNext.textContent = "SEGÜENT ▶"; }, 600);
  } else {
    beep({ freq: 220, dur: 0.08, type: "sawtooth", vol: 0.07, slide: -40 });
    tutChefSet("miss", 500);
    if (tube) {
      tube.classList.remove("fired-bad"); tube.offsetHeight;
      tube.classList.add("fired-bad");
      setTimeout(() => tube.classList.remove("fired-bad"), 400);
    }
    const plate = tutPlateSlot.querySelector(".plate");
    if (plate) {
      plate.classList.remove("shake-red"); plate.offsetHeight;
      plate.classList.add("shake-red");
      setTimeout(() => plate.classList.remove("shake-red"), 360);
    }
  }
}
tutNext.addEventListener("click", () => { tutIdx++; renderTutStep(); });
document.getElementById("tut-skip").addEventListener("click", () => go("levels"));
document.addEventListener("keydown", e => {
  if (!screens.tutorial.classList.contains("active")) return;
  const k = e.key.toLowerCase();
  if (NOTE_BY_KEY[k]) onTutInput(NOTE_BY_KEY[k]);
  else if (k === "enter" && tutNext.style.display !== "none") tutNext.click();
});

document.addEventListener("click", () => {
  if (progress.settings.music && !music) startMusic();
}, { once: true });

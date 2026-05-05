/* ============================================================
   MAKI-NOTES · NEO-TOKYO RUSH
   Lògica de joc · Vanilla JS (sense dependències)
   ============================================================ */

// ----- DEFINICIONS DE NOTES ---------------------------------
const NOTES = [
  { name: "DO",  key: "a", color: "#ff006e" },
  { name: "RE",  key: "s", color: "#fb5607" },
  { name: "MI",  key: "d", color: "#ffbe0b" },
  { name: "FA",  key: "f", color: "#2effa5" },
  { name: "SOL", key: "g", color: "#00f0ff" },
  { name: "LA",  key: "h", color: "#b14bff" },
  { name: "SI",  key: "j", color: "#ff2bd6" }
];
const NOTE_BY_KEY = Object.fromEntries(NOTES.map(n => [n.key, n.name]));
const NOTE_COLOR  = Object.fromEntries(NOTES.map(n => [n.name, n.color]));

// Freqüències equal-temperament (octava 4-5).
// Distingim entre nota greu (octava 4) i aguda (octava 5) segons la posició Y.
function freqFor(noteName, y) {
  const high = y <= 35; // dalt del staff = octava 5
  const map = high
    ? { DO: 523.25, RE: 587.33, MI: 659.25, FA: 698.46, SOL: 783.99, LA: 880.00, SI: 987.77 }
    : { DO: 261.63, RE: 293.66, MI: 329.63, FA: 349.23, SOL: 392.00, LA: 440.00, SI: 493.88 };
  return map[noteName];
}

// ----- POSICIONS Y · STAGES -------------------------------
const STAGE1 = [ // FA LA DO (espais greus)
  { name: "FA", y: 55 },
  { name: "LA", y: 45 },
  { name: "DO", y: 35 }
];
const STAGE2 = [ // DO MI SOL (greus)
  { name: "DO",  y: 70, ledger: true },
  { name: "MI",  y: 60 },
  { name: "SOL", y: 50 }
];
const STAGE3 = [ // DO RE MI FA (aguts)
  { name: "DO", y: 35 },
  { name: "RE", y: 30 },
  { name: "MI", y: 25 },
  { name: "FA", y: 20 }
];
const STAGE_ALL = [
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
  { name: "FA",  y: 20 }
];

function makeLevel(n) {
  const cfg = { level: n, lives: 5 };
  if (n <= 5) {
    cfg.tier   = "easy";
    cfg.notes  = STAGE1.slice();
    cfg.speed  = 80 + n * 12;
    cfg.spawn  = 3200 - n * 150;
    cfg.target = 8 + n;
  } else if (n <= 10) {
    cfg.tier   = "easy";
    cfg.notes  = STAGE2.slice();
    const k    = n - 5;
    cfg.speed  = 110 + k * 14;
    cfg.spawn  = 2900 - k * 130;
    cfg.target = 10 + k;
  } else if (n <= 16) {
    cfg.tier   = "mid";
    cfg.notes  = STAGE3.slice();
    const k    = n - 10;
    cfg.speed  = 150 + k * 16;
    cfg.spawn  = 2500 - k * 140;
    cfg.target = 12 + k;
  } else {
    cfg.tier   = "hard";
    cfg.notes  = STAGE_ALL.slice();
    const k    = n - 16;
    cfg.speed  = 240 + k * 28;
    cfg.spawn  = Math.max(1050, 2100 - k * 200);
    cfg.target = 16 + k * 2;
  }
  return cfg;
}

// ============================================================
// LOCALSTORAGE · progrés + estadístiques + settings + achievements
// ============================================================
const SAVE_KEY = "maki-notes:progress";
const DEFAULT_SETTINGS = {
  volMusic: 35, volSfx: 80, tones: true, music: true, colorblind: false
};
const DEFAULT_STATS = {};   // { DO: {hits, misses}, RE: ..., ... }
NOTES.forEach(n => DEFAULT_STATS[n.name] = { hits: 0, misses: 0 });

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultProgress();
    const d = JSON.parse(raw);
    return {
      unlocked: d.unlocked || 1,
      scores: d.scores || {},
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
function saveProgress(p) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(p)); } catch {}
}
let progress = loadProgress();

// ============================================================
// FONS: PLUJA DIGITAL
// ============================================================
(function initRain() {
  const cv = document.getElementById("rain");
  const ctx = cv.getContext("2d");
  let cols, drops, fontSize = 16;
  const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノｱｶｻﾀﾅﾊﾏﾔﾗﾜ0123456789#$@&♪♫♬";
  function resize() {
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
    cols = Math.floor(cv.width / fontSize);
    drops = Array(cols).fill(0).map(() => Math.random() * -cv.height / fontSize);
  }
  resize();
  window.addEventListener("resize", resize);
  function draw() {
    ctx.fillStyle = "rgba(5,1,15,0.18)";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < cols; i++) {
      const ch = glyphs[(Math.random() * glyphs.length) | 0];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const c = (i + drops[i] | 0) % 7;
      ctx.fillStyle = c === 0 ? "rgba(255,43,214,0.85)"
                  : c === 3 ? "rgba(46,255,165,0.6)"
                  : "rgba(0,240,255,0.7)";
      ctx.fillText(ch, x, y);
      if (y > cv.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.6 + Math.random() * 0.6;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================================
// AUDIO · master gains + Web Audio API
// ============================================================
let actx = null, sfxGain = null, musicGain = null;
function audio() {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    sfxGain   = actx.createGain();
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
  sfxGain.gain.value   = (progress.settings.volSfx   / 100) * 0.9;
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
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}
function playNoteTone(noteName, y) {
  if (!progress.settings.tones) return;
  const ctx = audio();
  const f = freqFor(noteName, y);
  const t0 = ctx.currentTime;
  // pad sine + soft triangle
  [{ type: "sine", vol: 0.18, det: 0 },
   { type: "triangle", vol: 0.06, det: 7 }].forEach(p => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = p.type;
    o.frequency.value = f;
    o.detune.value = p.det;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(p.vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
    o.connect(g).connect(sfxGain);
    o.start(t0);
    o.stop(t0 + 0.65);
  });
}
function sndCorrect() {
  beep({ freq: 660, dur: 0.07, type: "square", vol: 0.06 });
  beep({ freq: 990, dur: 0.12, type: "square", vol: 0.06, delay: 0.05 });
}
function sndMiss()  { beep({ freq: 200, dur: 0.28, type: "sawtooth", vol: 0.10, slide: -120 }); }
function sndClick() { beep({ freq: 1200, dur: 0.04, type: "square", vol: 0.04 }); }
function sndWin()   { [523, 659, 784, 1046].forEach((f, i) => beep({ freq: f, dur: 0.18, type: "square", vol: 0.08, delay: i * 0.12 })); }
function sndLose()  { [330, 277, 220, 165].forEach((f, i) => beep({ freq: f, dur: 0.22, type: "sawtooth", vol: 0.10, delay: i * 0.13 })); }
function sndAch()   { [784, 988, 1175, 1568].forEach((f, i) => beep({ freq: f, dur: 0.15, type: "sine",  vol: 0.08, delay: i * 0.08 })); }

// ============================================================
// MÚSICA PROCEDURAL · synthwave loop (Am - F - C - G)
// ============================================================
const MUSIC_BPM = 92;
const MUSIC_CHORDS = [
  { pad: [220.00, 261.63, 329.63], bass: 110.00, arp: [220, 261.63, 329.63, 440] }, // Am
  { pad: [174.61, 220.00, 261.63], bass: 87.31,  arp: [174.61, 220, 261.63, 349.23] }, // F
  { pad: [261.63, 329.63, 392.00], bass: 130.81, arp: [261.63, 329.63, 392, 523.25] }, // C
  { pad: [196.00, 246.94, 293.66], bass: 98.00,  arp: [196, 246.94, 293.66, 392] }  // G
];
let music = null;
function startMusic() {
  if (music || !progress.settings.music) return;
  audio();
  music = { nextTime: actx.currentTime + 0.15, bar: 0, playing: true, intensity: 1 };
  scheduleMusicTick();
}
function stopMusic() {
  if (music) music.playing = false;
  music = null;
}
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
  // Pad
  c.pad.forEach(f => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const flt = ctx.createBiquadFilter();
    flt.type = "lowpass"; flt.frequency.value = 1200; flt.Q.value = 1;
    o.type = "sawtooth"; o.frequency.value = f / 2;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.025, when + 0.4);
    g.gain.linearRampToValueAtTime(0.022, when + beat * 4 - 0.4);
    g.gain.linearRampToValueAtTime(0, when + beat * 4);
    o.connect(flt).connect(g).connect(musicGain);
    o.start(when); o.stop(when + beat * 4 + 0.1);
  });
  // Bass
  for (let b = 0; b < 4; b++) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square"; o.frequency.value = c.bass;
    g.gain.setValueAtTime(0, when + b * beat);
    g.gain.linearRampToValueAtTime(0.06, when + b * beat + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, when + b * beat + beat * 0.9);
    o.connect(g).connect(musicGain);
    o.start(when + b * beat); o.stop(when + b * beat + beat);
  }
  // Kick (1 i 3)
  if (intensity >= 1) { kick(when); kick(when + beat * 2); }
  if (intensity >= 1.5) kick(when + beat * 3.5);
  // Hat (offbeats)
  if (intensity >= 1) for (let b = 0; b < 4; b++) hat(when + (b + 0.5) * beat, 0.025);
  // Arp
  for (let s = 0; s < 8; s++) {
    const f = c.arp[s % 4] * (s >= 4 ? 2 : 1);
    arp(f, when + s * beat / 2, beat / 4, intensity >= 1.3 ? 0.05 : 0.035);
  }
}
function kick(when) {
  const ctx = audio();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(140, when);
  o.frequency.exponentialRampToValueAtTime(40, when + 0.12);
  g.gain.setValueAtTime(0.16, when);
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
  o.type = "triangle"; o.frequency.value = f;
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

// ============================================================
// SUSHI · render variants
// ============================================================
const SUSHI_TYPES = ["maki", "salmon", "tuna", "tamago", "uramaki"];
function renderSushi(type) {
  switch (type) {
    case "maki":
      return `<svg viewBox="0 0 76 38" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rice-m" cx=".5" cy=".4"><stop offset="0%" stop-color="#fff8e0"/><stop offset="100%" stop-color="#e8d4a0"/></radialGradient>
          <linearGradient id="nori-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1f3520"/><stop offset="100%" stop-color="#0d1e10"/></linearGradient>
        </defs>
        <rect x="6" y="6" width="64" height="26" rx="4" fill="url(#nori-m)" stroke="#0a1408" stroke-width="0.6"/>
        <ellipse cx="38" cy="19" rx="26" ry="10" fill="url(#rice-m)"/>
        <circle cx="38" cy="19" r="7" fill="#ff7833"/>
        <circle cx="38" cy="19" r="7" fill="none" stroke="#c14a18" stroke-width="0.6"/>
        <ellipse cx="35" cy="17" rx="2.2" ry="1.4" fill="#ffb98a" opacity=".85"/>
        <circle cx="26" cy="22" r=".7" fill="#fff" opacity=".7"/>
        <circle cx="50" cy="16" r=".7" fill="#fff" opacity=".7"/>
        <circle cx="44" cy="24" r=".6" fill="#fff" opacity=".5"/>
      </svg>`;
    case "salmon":
      return `<svg viewBox="0 0 76 38" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="salmon-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff9a5e"/><stop offset="60%" stop-color="#ff6a2e"/><stop offset="100%" stop-color="#c4451a"/></linearGradient>
          <linearGradient id="rice-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff5dc"/><stop offset="100%" stop-color="#e6d2a0"/></linearGradient>
        </defs>
        <rect x="8" y="20" width="60" height="14" rx="5" fill="url(#rice-s)" stroke="#c0a874" stroke-width="0.5"/>
        <path d="M6,16 Q38,4 70,16 L70,24 Q38,18 6,24 Z" fill="url(#salmon-g)" stroke="#923a14" stroke-width="0.5"/>
        <path d="M14,14 Q38,8 62,14" stroke="#ffd0b3" stroke-width="0.7" fill="none" opacity=".8"/>
        <path d="M16,17 Q38,11 60,17" stroke="#ffe5d2" stroke-width="0.5" fill="none" opacity=".6"/>
        <rect x="36" y="6" width="4" height="22" fill="#0d1e10" opacity=".85"/>
      </svg>`;
    case "tuna":
      return `<svg viewBox="0 0 76 38" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tuna-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e63946"/><stop offset="60%" stop-color="#c81e2c"/><stop offset="100%" stop-color="#7a0d18"/></linearGradient>
          <linearGradient id="rice-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff5dc"/><stop offset="100%" stop-color="#e6d2a0"/></linearGradient>
        </defs>
        <rect x="8" y="20" width="60" height="14" rx="5" fill="url(#rice-t)" stroke="#c0a874" stroke-width="0.5"/>
        <path d="M6,16 Q38,4 70,16 L70,24 Q38,18 6,24 Z" fill="url(#tuna-g)" stroke="#5a0a14" stroke-width="0.5"/>
        <path d="M16,15 Q38,10 60,15" stroke="#ff7484" stroke-width="0.4" fill="none" opacity=".7"/>
        <rect x="36" y="6" width="4" height="22" fill="#0d1e10" opacity=".85"/>
      </svg>`;
    case "tamago":
      return `<svg viewBox="0 0 76 38" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="egg-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe066"/><stop offset="60%" stop-color="#ffc935"/><stop offset="100%" stop-color="#d49d10"/></linearGradient>
          <linearGradient id="rice-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff5dc"/><stop offset="100%" stop-color="#e6d2a0"/></linearGradient>
        </defs>
        <rect x="8" y="20" width="60" height="14" rx="5" fill="url(#rice-e)" stroke="#c0a874" stroke-width="0.5"/>
        <rect x="6" y="8" width="64" height="14" rx="3" fill="url(#egg-g)" stroke="#a07810" stroke-width="0.5"/>
        <line x1="10" y1="12" x2="66" y2="12" stroke="#fff2a8" stroke-width="0.6" opacity=".7"/>
        <line x1="10" y1="18" x2="66" y2="18" stroke="#a07810" stroke-width="0.4" opacity=".4"/>
        <rect x="36" y="6" width="4" height="22" fill="#0d1e10" opacity=".95"/>
      </svg>`;
    case "uramaki":
    default:
      return `<svg viewBox="0 0 76 38" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rice-u" cx=".5" cy=".4"><stop offset="0%" stop-color="#fff8e0"/><stop offset="100%" stop-color="#e0c890"/></radialGradient>
        </defs>
        <ellipse cx="38" cy="20" rx="30" ry="14" fill="url(#rice-u)" stroke="#b89a60" stroke-width="0.6"/>
        <circle cx="38" cy="20" r="9" fill="#1f3520"/>
        <circle cx="38" cy="20" r="5.5" fill="#ff7a35"/>
        <circle cx="36" cy="18" r="1.6" fill="#ffc299"/>
        <!-- ous tobiko -->
        <circle cx="20" cy="14" r="1.2" fill="#ff5722"/>
        <circle cx="56" cy="14" r="1.2" fill="#ff5722"/>
        <circle cx="14" cy="22" r="1" fill="#ff7043"/>
        <circle cx="62" cy="22" r="1" fill="#ff7043"/>
        <circle cx="38" cy="9"  r="1" fill="#ff5722"/>
        <circle cx="26" cy="28" r="1" fill="#ff7043"/>
        <circle cx="50" cy="28" r="1" fill="#ff7043"/>
      </svg>`;
  }
}

// ============================================================
// NAVEGACIÓ
// ============================================================
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
  // Música segons pantalla
  if (target === "game") setMusicIntensity(1);
  else                    setMusicIntensity(0.7);
  // Amaga cog dins el joc (té conflicte amb botó Sortir del HUD)
  document.body.classList.toggle("in-game", target === "game");
  // Bar background nítid al tutorial també (entres al restaurant)
  document.body.classList.toggle("in-tutorial", target === "tutorial");
}
document.querySelectorAll("[data-go]").forEach(el => {
  el.addEventListener("click", () => { sndClick(); go(el.dataset.go); });
});

// ============================================================
// EFECTE MAGNÈTIC
// ============================================================
document.querySelectorAll(".magnetic").forEach(btn => {
  btn.addEventListener("mousemove", e => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / r.width;
    const dy = (e.clientY - r.top  - r.height / 2) / r.height;
    btn.style.transform = `translate(${dx * 14}px, ${dy * 8}px)`;
  });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
});

// ============================================================
// SELECTOR DE TORNS
// ============================================================
const levelGrid = document.getElementById("level-grid");
function renderLevelGrid() {
  levelGrid.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const card = document.createElement("div");
    let tier, tag;
    if (i <= 5)       { tier = "easy"; tag = "FA·LA·DO"; }
    else if (i <= 10) { tier = "easy"; tag = "DO·MI·SOL"; }
    else if (i <= 16) { tier = "mid";  tag = "DO·RE·MI·FA"; }
    else              { tier = "hard"; tag = "TOT · TOT"; }
    card.className = `level-card ${tier}`;
    if (i > progress.unlocked) card.classList.add("locked");
    if (progress.scores[i])    card.classList.add("cleared");
    const score = progress.scores[i];
    card.innerHTML = `
      <div class="lvl-num">${i.toString().padStart(2, "0")}</div>
      <div class="lvl-tag">${tag}</div>
      ${score ? `<div class="lvl-score">${score.toString().padStart(6, "0")}</div>` : ""}
    `;
    if (i <= progress.unlocked) {
      card.addEventListener("click", () => startLevel(i));
    }
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

// ============================================================
// TUBS
// ============================================================
const tubesEl = document.getElementById("tubes");
function buildTubes() {
  tubesEl.innerHTML = "";
  NOTES.forEach(n => {
    const t = document.createElement("button");
    t.className = "tube";
    t.dataset.note = n.name;
    t.dataset.key  = n.key;
    t.innerHTML = `<div class="tube-glyph">${n.name}</div><div class="tube-key">${n.key.toUpperCase()}</div>`;
    t.addEventListener("click", () => handleInput(n.name));
    tubesEl.appendChild(t);
  });
}
buildTubes();

// ============================================================
// PLAT · render
// ============================================================
function renderPlateHTML(noteY, withLedger, sushiType, noteName, forceHint) {
  const Y = noteY + 2;
  const ledger = withLedger
    ? `<line x1="72" y1="${Y}" x2="96" y2="${Y}" stroke="#3a1d05" stroke-width="1.4" stroke-linecap="round"/>`
    : "";
  // Hint només per al tutorial (forceHint = true). Sense toggle global.
  const hint = forceHint
    ? `<div class="note-hint">${noteName}</div>`
    : "";
  return `
    <div class="plate-base"></div>
    <div class="sushi-piece sushi-${sushiType}">${renderSushi(sushiType)}</div>
    <div class="staff-card">
      <svg class="staff-svg" viewBox="0 0 116 82" xmlns="http://www.w3.org/2000/svg">
        <line x1="8" y1="22" x2="108" y2="22" stroke="#3a1d05" stroke-width="1.1"/>
        <line x1="8" y1="32" x2="108" y2="32" stroke="#3a1d05" stroke-width="1.1"/>
        <line x1="8" y1="42" x2="108" y2="42" stroke="#3a1d05" stroke-width="1.1"/>
        <line x1="8" y1="52" x2="108" y2="52" stroke="#3a1d05" stroke-width="1.1"/>
        <line x1="8" y1="62" x2="108" y2="62" stroke="#3a1d05" stroke-width="1.1"/>
        <text x="4" y="60" font-size="44" fill="#3a1d05" font-family="serif" font-weight="700">𝄞</text>
        ${ledger}
        <ellipse cx="84" cy="${Y}" rx="7" ry="4.8" fill="#1a0a02" transform="rotate(-18 84 ${Y})"/>
        <ellipse cx="84" cy="${Y}" rx="3.6" ry="2.4" fill="#fff8e8" transform="rotate(-18 84 ${Y})" opacity=".9"/>
      </svg>
      ${hint}
    </div>
  `;
}

// ============================================================
// PARTÍCULES (canvas overlay)
// ============================================================
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
  const r = particleCanvas.getBoundingClientRect();
  const cx = x;
  const cy = y - (r.height < 100 ? 0 : 0); // x,y already in canvas space
  const count = type === "combo" ? 30 : type === "hit" ? 16 : 8;
  for (let i = 0; i < count; i++) {
    const angle = type === "miss"
      ? Math.PI + (Math.random() - 0.5) * 0.7
      : Math.random() * Math.PI * 2;
    const speed = type === "hit" ? 120 + Math.random() * 200
                : type === "combo" ? 80 + Math.random() * 220
                : 30 + Math.random() * 80;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === "hit" ? 80 : type === "miss" ? -60 : 0),
      life: 1,
      decay: type === "miss" ? 1.6 : type === "combo" ? 0.7 : 1.1,
      color: color || (type === "miss" ? "#ff2bd6" : type === "combo" ? "#ffe14d" : "#00f0ff"),
      size: type === "combo" ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
      gravity: type === "miss" ? 280 : 140,
      shape: type === "combo" ? "star" : "circle"
    });
  }
}
function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
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

// ============================================================
// XEF
// ============================================================
const chefEl = document.getElementById("chef");
let chefTimer = null;
function chefSet(state, hold = 600) {
  if (!chefEl) return;
  chefEl.classList.remove("hit", "miss", "combo");
  if (state) chefEl.classList.add(state);
  if (chefTimer) clearTimeout(chefTimer);
  chefTimer = setTimeout(() => chefEl.classList.remove(state), hold);
}

// ============================================================
// GAME STATE & REFS
// ============================================================
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
    cfg,
    plates: [],
    score: 0,
    lives: cfg.lives,
    completed: 0,
    lastSpawn: 0,
    lastFrame: 0,
    running: false,
    beltW: 0,
    trashStart: 0,
    combo: 0,
    rafId: null,
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

// ============================================================
// PAUSA
// ============================================================
const pauseOverlay = document.getElementById("pause-overlay");
const pauseBtn     = document.getElementById("pause-game");
function togglePause() {
  if (!state || !state.running) return;
  if (state.paused) resumeGame();
  else              pauseGame();
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
  state.lastSpawn = performance.now() - (state.cfg.spawn * 0.5); // continua aviat
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

// ============================================================
// LOOP
// ============================================================
function loop(ts) {
  if (!state || !state.running || state.paused) return;
  const dt = Math.min(0.05, (ts - state.lastFrame) / 1000);
  state.lastFrame = ts;

  // Spawn
  if (ts - state.lastSpawn >= state.cfg.spawn) {
    spawnPlate();
    state.lastSpawn = ts;
  }

  // Moviment + plat actiu (el més a prop del final, no avaluat)
  let activePlate = null, bestX = -Infinity;
  const speed = state.cfg.speed;
  for (const p of state.plates) {
    if (p.dying) continue;
    p.x += speed * dt;
    p.el.style.transform = `translate(${p.x}px, -50%)`;
    if (p.x > bestX) { bestX = p.x; activePlate = p; }
    if (p.x >= state.trashStart && !p.fallen) {
      p.fallen = true;
      onPlateFell(p);
    }
  }
  // Marca halo a l'actiu, treu-lo dels altres
  for (const p of state.plates) {
    if (p === activePlate) p.el.classList.add("active");
    else                    p.el.classList.remove("active");
  }

  // Partícules
  updateParticles(dt);
  renderParticles();

  // Neteja
  state.plates = state.plates.filter(p => !p.removed);

  // Fi
  if (state.lives <= 0) return endGame(false);
  if (state.completed >= state.cfg.target) return endGame(true);

  state.rafId = requestAnimationFrame(loop);
}

// ============================================================
// SPAWN · amb repetició espaiada (notes que falles surten més)
// ============================================================
function pickNoteFromPool(pool) {
  const weights = pool.map(n => {
    const s = progress.stats[n.name] || { hits: 0, misses: 0 };
    const total = s.hits + s.misses;
    if (total < 4) return 1;          // mínim per estabilitzar
    const errRate = s.misses / total;
    return 1 + errRate * 2.5;          // fins a 3.5x si sempre falla
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
  const sushi = SUSHI_TYPES[(Math.random() * SUSHI_TYPES.length) | 0];
  const el = document.createElement("div");
  el.className = "plate";
  el.style.transform = `translate(-200px, -50%)`;
  el.innerHTML = renderPlateHTML(n.y, !!n.ledger, sushi, n.name);
  platesLayer.appendChild(el);
  state.plates.push({
    el, x: -200,
    note: n.name, noteY: n.y,
    attempts: 0, fallen: false, dying: false, removed: false
  });
}

// ============================================================
// INPUT
// ============================================================
function handleInput(noteName) {
  if (!state || !state.running || state.paused) return;
  sndClick();
  // Plat actiu = el més a prop del final i NO morint (snatch/fall)
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
  else                          onWrong(target, tube);
}
document.addEventListener("keydown", e => {
  if (!screens.game.classList.contains("active")) return;
  const k = e.key.toLowerCase();
  if (k === "p")          { togglePause(); return; }
  if (k === "escape")     { if (state && state.running) togglePause(); else quitToMenu(); return; }
  if (state && state.paused) return;
  if (NOTE_BY_KEY[k])     handleInput(NOTE_BY_KEY[k]);
});

// ============================================================
// CORRECT / WRONG
// ============================================================
function onCorrect(plate, tube) {
  plate.dying = true;
  state.combo++;
  state.completed++;
  state.score += 10 + Math.min(20, state.combo * 2);
  hudDone.textContent = state.completed;
  setScore(state.score);
  // Estadístiques
  state.sessionStats[plate.note].hits++;
  progress.stats[plate.note].hits++;
  // Audio: nota real + sfx
  playNoteTone(plate.note, plate.noteY);
  sndCorrect();
  // Visual feedback
  flashEl.classList.remove("flash-good"); flashEl.offsetHeight;
  flashEl.classList.add("flash-good");
  if (tube) {
    tube.classList.remove("fired"); tube.offsetHeight;
    tube.classList.add("fired");
    setTimeout(() => tube.classList.remove("fired"), 400);
  }
  // Partícules a la posició del plat (en coords del canvas)
  const beltRect = beltEl.getBoundingClientRect();
  const cx = plate.x + 70;          // centre del plat
  const cy = beltRect.height / 2;
  spawnParticles(cx, cy, "hit", NOTE_COLOR[plate.note]);
  // Combo
  if (state.combo >= 5) {
    chefSet("combo", 800);
    spawnParticles(cx, cy, "combo");
    if (state.combo % 5 === 0) showCombo(`x${state.combo} COMBO!`);
  } else if (state.combo >= 3) {
    chefSet("hit", 500);
    showCombo(`x${state.combo} COMBO!`);
  } else {
    chefSet("hit", 400);
  }
  // Animació
  showArmAt(plate.x);
  plate.el.style.left = plate.x + "px";
  plate.el.style.transform = "translate(0, -50%)";
  plate.el.offsetHeight;
  plate.el.classList.add("snatch");
  // Achievements (live)
  checkAchievements();
  setTimeout(() => { plate.removed = true; plate.el.remove(); }, 560);
}

function onWrong(plate, tube) {
  plate.attempts = (plate.attempts || 0) + 1;
  state.combo = 0;
  state.sessionStats[plate.note].misses++;
  progress.stats[plate.note].misses++;
  chefSet("miss", 350);
  // Flash transitori (no permanent) · plat continua reintentable
  plate.el.classList.remove("shake-red");
  plate.el.offsetHeight;
  plate.el.classList.add("shake-red");
  setTimeout(() => plate.el.classList.remove("shake-red"), 360);
  // So breu de denegació
  beep({ freq: 220, dur: 0.08, type: "sawtooth", vol: 0.07, slide: -40 });
  if (tube) {
    tube.classList.remove("fired-bad"); tube.offsetHeight;
    tube.classList.add("fired-bad");
    setTimeout(() => tube.classList.remove("fired-bad"), 400);
  }
}

function onPlateFell(plate) {
  plate.dying = true;
  // Si mai s'ha intentat, també compta com a miss
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
  plate.el.classList.add("miss");  // gris durant la caiguda
  plate.el.classList.add("fall");
  setTimeout(() => { plate.removed = true; plate.el.remove(); }, 950);
}

// ============================================================
// EFECTES
// ============================================================
function shakeCamera() {
  gameScreen.classList.remove("shake");
  gameScreen.offsetHeight;
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
  comboEl.classList.remove("show");
  comboEl.offsetHeight;
  comboEl.classList.add("show");
}

// ============================================================
// HUD
// ============================================================
function setLives(v) {
  if (v === "∞") { hudLives.textContent = "∞"; return; }
  hudLives.textContent = "♥".repeat(v) + "♡".repeat(Math.max(0, state.cfg.lives - v));
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

// ============================================================
// ACHIEVEMENTS
// ============================================================
const ACHIEVEMENTS = [
  { id: "first-plate",   name: "Primer plat",          test: () => state && state.completed >= 1 },
  { id: "combo-10",      name: "Combo x10",             test: () => state && state.combo >= 10 },
  { id: "combo-20",      name: "Combo x20",             test: () => state && state.combo >= 20 },
  { id: "perfect-stage", name: "Sense errors al torn",  test: () => state && state.completed >= state.cfg.target && state.lives === state.cfg.lives },
  { id: "stage-5",       name: "Mestre dels espais",    test: () => progress.scores[5] != null },
  { id: "stage-10",      name: "Mestre dels greus",     test: () => progress.scores[10] != null },
  { id: "stage-16",      name: "Mestre dels aguts",     test: () => progress.scores[16] != null },
  { id: "stage-20",      name: "Sushi Master",           test: () => progress.scores[20] != null },
  { id: "all-notes",     name: "Lector complet · 7 notes", test: () =>
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
  achToast.innerHTML = `<div class="ach-icon">★</div><div class="ach-body"><div class="ach-title">ASSOLIMENT DESBLOCAT</div><div class="ach-name">${a.name}</div></div>`;
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

// ============================================================
// FI DE PARTIDA
// ============================================================
function endGame(victory) {
  if (!state.running) return;
  state.running = false;
  if (state.rafId) cancelAnimationFrame(state.rafId);

  if (victory) {
    sndWin();
    const n = state.cfg.level;
    if (n + 1 > progress.unlocked && n < 20) progress.unlocked = n + 1;
    progress.scores[n] = Math.max(progress.scores[n] || 0, state.score);
  } else {
    sndLose();
  }
  saveProgress(progress);
  checkAchievements();

  ovTitle.textContent = victory ? "SERVEI COMPLET!" : "KO";
  ovText.textContent  = victory
    ? "Has servit tots els plats. El xef està orgullós."
    : "Has perdut totes les vides. Refresca el wok i torna-ho a provar.";

  // Stats per nota d'aquesta sessió
  const noteRows = NOTES.map(nn => {
    const s = state.sessionStats[nn.name];
    const total = s.hits + s.misses;
    const acc = total === 0 ? null : Math.round((s.hits / total) * 100);
    return `
      <div class="note-stat" style="border-color: ${nn.color}55">
        <div class="ns-name" style="color:${nn.color}">${nn.name}</div>
        <div class="ns-acc">${acc === null ? "—" : acc + "%"}</div>
        <div class="ns-bar"><div class="ns-fill" style="width:${acc || 0}%"></div></div>
      </div>`;
  }).join("");

  ovStats.innerHTML = `
    <div class="ov-stat"><span class="lbl">PUNTS</span><span class="val">${state.score}</span></div>
    <div class="ov-stat"><span class="lbl">PLATS</span><span class="val">${state.completed}/${state.cfg.target}</span></div>
    <div class="ov-stat"><span class="lbl">VIDES</span><span class="val">${state.lives}</span></div>
    <div class="ov-stat"><span class="lbl">COMBO MÀX</span><span class="val">${state.combo}</span></div>
  `;
  ovStats.innerHTML += `<div class="note-stats" style="grid-column: 1 / -1; width:100%;">${noteRows}</div>`;
  ovNext.style.display = (victory && state.cfg.level < 20) ? "" : "none";

  setTimeout(() => overlay.classList.remove("hidden"), 350);
}

ovRetry.addEventListener("click", () => startLevel(state.cfg.level));
ovNext.addEventListener("click",  () => startLevel(state.cfg.level + 1));
ovMenu.addEventListener("click",  () => { stopGame(); go("levels"); });
document.getElementById("quit-game").addEventListener("click", quitToMenu);

function quitToMenu() {
  if (!state) return go("levels");
  if (state.running && !confirm("Vols sortir? Es perdrà el progrés del torn actual.")) return;
  stopGame();
  go("levels");
}

// ============================================================
// SETTINGS PANEL
// ============================================================
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
  volSfx.value   = progress.settings.volSfx;
  volMusicVal.textContent = progress.settings.volMusic;
  volSfxVal.textContent   = progress.settings.volSfx;
  optTones.checked = progress.settings.tones;
  optCb.checked    = progress.settings.colorblind;
  optMusic.checked = progress.settings.music;
  document.body.classList.toggle("cb-mode", progress.settings.colorblind);
}
loadSettingsUI();

cogBtn.addEventListener("click", () => {
  loadSettingsUI();
  settingsPanel.classList.remove("hidden");
});
document.getElementById("settings-close").addEventListener("click", () => {
  settingsPanel.classList.add("hidden");
  saveProgress(progress);
});
volMusic.addEventListener("input", e => {
  progress.settings.volMusic = +e.target.value;
  volMusicVal.textContent = e.target.value;
  applyVolumes();
});
volSfx.addEventListener("input", e => {
  progress.settings.volSfx = +e.target.value;
  volSfxVal.textContent = e.target.value;
  applyVolumes();
});
optTones.addEventListener("change", e => { progress.settings.tones = e.target.checked; });
optCb.addEventListener("change", e => {
  progress.settings.colorblind = e.target.checked;
  document.body.classList.toggle("cb-mode", e.target.checked);
});
optMusic.addEventListener("change", e => {
  progress.settings.music = e.target.checked;
  if (e.target.checked) startMusic();
  else stopMusic();
});

// ============================================================
// BOOT SEQUENCE
// ============================================================
const bootEl = document.getElementById("boot");
const bootFill = document.getElementById("boot-fill");
const bootLog = document.getElementById("boot-log");
const BOOT_LINES = [
  "[OK] Inicialitzant cuina ciberpunk...",
  "[OK] Carregant pentagrama digital",
  "[OK] Connectant amb Tokyo-NET",
  "[OK] Configurant 7 tubs de lliurament",
  "[OK] Calibrant braç mecànic",
  "[OK] Sincronització rítmica · 92 BPM",
  "[OK] Càrrega de mòdul solfeig",
  "[--] Esperant ordre del xef..."
];
function runBoot() {
  let progressBoot = 0, lineIdx = 0;
  const interval = setInterval(() => {
    progressBoot += 4 + Math.random() * 8;
    if (progressBoot > 100) progressBoot = 100;
    bootFill.style.width = progressBoot + "%";
    if (lineIdx < BOOT_LINES.length && progressBoot > (lineIdx + 1) * (100 / BOOT_LINES.length)) {
      bootLog.textContent += BOOT_LINES[lineIdx] + "\n";
      lineIdx++;
    }
    if (progressBoot >= 100) {
      clearInterval(interval);
      setTimeout(finishBoot, 600);
    }
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

// ============================================================
// HUD VOLUME SLIDER · accés ràpid sense haver de pausar
// ============================================================
const hudMusicSlider = document.getElementById("hud-music");
hudMusicSlider.value = progress.settings.volMusic;
hudMusicSlider.addEventListener("input", e => {
  progress.settings.volMusic = +e.target.value;
  applyVolumes();
  // Si el slider arriba a 0 amb música ON, la música segueix però silenciada.
  // Si l'usuari l'apuja des de 0, ja se sentirà.
});
hudMusicSlider.addEventListener("change", () => saveProgress(progress));

// ============================================================
// TUTORIAL INTERACTIU · xef que acompanya pas a pas
// ============================================================
const TUTORIAL = [
  { type: "speak",
    text: "Konnichiwa! Sóc el xef <b>Kaito</b>. T'ensenyaré a llegir notes en uns minuts. Som-hi!" },
  { type: "speak",
    text: "Mira el pentagrama: <b>5 línies</b> horitzontals. Les notes seuen sobre les línies o als <b>espais</b> entre elles." },
  { type: "play", note: "FA", y: 55, sushi: "salmon", hint: true,
    intro: "Aquest plat porta un <b>FA</b> al primer espai (de baix). Prem la tecla <b>F</b>.",
    success: "Excel·lent! FA és la tecla F. ✓" },
  { type: "play", note: "LA", y: 45, sushi: "tamago", hint: true,
    intro: "Ara va un <b>LA</b> al segon espai. Prem la tecla <b>H</b>.",
    success: "Així és, LA és la tecla H. ✓" },
  { type: "play", note: "DO", y: 35, sushi: "maki", hint: true,
    intro: "Aquest és un <b>DO</b> agut, al tercer espai. Prem la tecla <b>A</b>.",
    success: "Increïble!" },
  { type: "speak",
    text: "Si t'equivoques, no passa res!<br/>El plat parpelleja vermell i pots <b>reintentar</b> fins que caigui a les escombraries." },
  { type: "play", note: "MI", y: 25, sushi: "tuna", hint: false,
    intro: "Última prova <b>SENSE pista</b>: aquesta nota toca el quart espai. Quina tecla?",
    success: "Perfecte! MI és la tecla D." },
  { type: "speak", final: true,
    text: "Llest! 7 notes, 7 tecles <b>A·S·D·F·G·H·J</b>.<br/>Bona sort, xef!" }
];

let tutIdx = 0, tutBusy = false;
const tutText        = document.getElementById("tut-text");
const tutNext        = document.getElementById("tut-next");
const tutPlateSlot   = document.getElementById("tut-plate-slot");
const tutStepLabel   = document.getElementById("tut-step-label");
const tutMiniTubes   = document.getElementById("tut-mini-tubes");
const tutChefEl      = document.getElementById("tut-chef");

function buildTutTubes() {
  tutMiniTubes.innerHTML = "";
  NOTES.forEach(n => {
    const t = document.createElement("button");
    t.className = "tube";
    t.dataset.note = n.name;
    t.dataset.key  = n.key;
    t.innerHTML = `<div class="tube-glyph">${n.name}</div><div class="tube-key">${n.key.toUpperCase()}</div>`;
    t.addEventListener("click", () => onTutInput(n.name));
    tutMiniTubes.appendChild(t);
  });
}
buildTutTubes();

function startTutorial() {
  tutIdx = 0;
  tutBusy = false;
  renderTutStep();
}

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
  // neteja highlight dels tubs
  tutMiniTubes.querySelectorAll(".tube").forEach(t => t.classList.remove("highlight"));

  if (step.type === "speak") {
    tutNext.style.display = "";
    tutNext.textContent = step.final ? "▶ COMENÇAR A CUINAR" : "SEGÜENT ▶";
  } else if (step.type === "play") {
    const el = document.createElement("div");
    el.className = "plate";
    el.innerHTML = renderPlateHTML(step.y, false, step.sushi || "maki", step.note, step.hint);
    tutPlateSlot.appendChild(el);
    // pista visual: marca el tub correcte si hint és true
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
    setTimeout(() => {
      tutNext.style.display = "";
      tutNext.textContent = "SEGÜENT ▶";
    }, 600);
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
      plate.classList.remove("shake-red");
      plate.offsetHeight;
      plate.classList.add("shake-red");
      setTimeout(() => plate.classList.remove("shake-red"), 360);
    }
  }
}

tutNext.addEventListener("click", () => {
  tutIdx++;
  renderTutStep();
});
document.getElementById("tut-skip").addEventListener("click", () => go("levels"));

document.addEventListener("keydown", e => {
  if (!screens.tutorial.classList.contains("active")) return;
  const k = e.key.toLowerCase();
  if (NOTE_BY_KEY[k]) onTutInput(NOTE_BY_KEY[k]);
  else if (k === "enter" && tutNext.style.display !== "none") tutNext.click();
});

// ============================================================
// MÚSICA · arrencada en primer click + arrencada per pantalla
// ============================================================
document.addEventListener("click", () => {
  if (progress.settings.music && !music) startMusic();
}, { once: true });

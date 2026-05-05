(() => {
  "use strict";

  // =========================================================================
  // CONFIGURACIÓ
  // =========================================================================

  const STORAGE_KEY_NEW   = "simon-sinfonic:highestUnlocked";
  const STORAGE_KEY_OLD   = "simon-sinfonic:currentLevel";
  const STORAGE_KEY_STARS = "simon-sinfonic:stars";
  const TOTAL_LEVELS      = 15;
  const ROUNDS_PER_LEVEL  = 4;
  const GLOW_LAST_LEVEL   = 6;    // 7+ = entrenament auditiu pur, sense glow
  const TIMEOUT_S_PER_NOTE = 3.5; // timeout adaptatiu: 3.5s × notes
  const TIMEOUT_S_MIN      = 10;
  const PERFECT_THRESHOLD  = 0.35; // < 35% del temps → ronda perfecta

  const KEY_NOTE_MAP = {
    a: "DO", s: "RE", d: "MI", f: "FA",
    g: "SOL", h: "LA", j: "SI", k: "DO+",
  };

  const NOTES = {
    "DO":  { freq: 261.6, color: "#ef4444", label: "DO"  },
    "RE":  { freq: 293.6, color: "#f97316", label: "RE"  },
    "MI":  { freq: 329.6, color: "#eab308", label: "MI"  },
    "FA":  { freq: 349.2, color: "#22c55e", label: "FA"  },
    "SOL": { freq: 392.0, color: "#14b8a6", label: "SOL" },
    "LA":  { freq: 440.0, color: "#3b82f6", label: "LA"  },
    "SI":  { freq: 493.8, color: "#a855f7", label: "SI"  },
    "DO+": { freq: 523.2, color: "#ec4899", label: "DO+" },
  };

  const LEVEL_CONFIG = [
    { range: [1,  3],  notes: ["DO", "SOL"],                               lenMin: 3, lenMax: 4, phase: "Iniciació"   },
    { range: [4,  6],  notes: ["DO", "MI", "SOL"],                         lenMin: 4, lenMax: 5, phase: "Acord Major" },
    { range: [7,  9],  notes: ["DO", "MI", "SOL", "DO+"],                  lenMin: 5, lenMax: 6, phase: "Tètrada"     },
    { range: [10, 12], notes: ["DO", "RE", "MI", "SOL", "LA"],             lenMin: 6, lenMax: 7, phase: "Pentatònica" },
    { range: [13, 15], notes: ["DO", "RE", "MI", "FA", "SOL", "LA", "SI"], lenMin: 7, lenMax: 9, phase: "Diatònica"   },
  ];

  // Paràmetres FM per fase. Cada fase té un timbre diferent que reflecteix
  // la seva identitat musical i augmenta el repte d'entrenament auditiu.
  //
  //  Iniciació   → piano infantil (sustain llarg, ric en harmònics)
  //  Acord Major → piano estàndard (atac més brillant)
  //  Tètrada     → vibràfon (metàl·lic, sustain mig)
  //  Pentatònica → marimba (percussiu, decau ràpid)
  //  Diatònica   → campana (inarmònic, quasi sense sustain)
  //
  // modRatio:    freqüència del modulador / freqüència portadora
  // modIdx:      índex de modulació β (profunditat relativa)
  // modDecayMs:  ms fins que el modulador decau a 0 (longitud del transient)
  // sustainRatio: nivell de sustain com a fracció del pic
  const SYNTH_PARAMS = {
    "Iniciació":   { modRatio: 2.0, modIdx: 3.5, modDecayMs: 200, sustainRatio: 0.52 },
    "Acord Major": { modRatio: 2.0, modIdx: 5.0, modDecayMs: 175, sustainRatio: 0.44 },
    "Tètrada":     { modRatio: 3.5, modIdx: 2.8, modDecayMs: 135, sustainRatio: 0.26 },
    "Pentatònica": { modRatio: 5.0, modIdx: 1.8, modDecayMs: 105, sustainRatio: 0.08 },
    "Diatònica":   { modRatio: 7.0, modIdx: 1.1, modDecayMs:  80, sustainRatio: 0.01 },
  };

  function getSynthParams(level) {
    const phase = getLevelInfo(level)?.phase ?? "Iniciació";
    return SYNTH_PARAMS[phase] ?? SYNTH_PARAMS["Iniciació"];
  }

  // Gap entre notes durant la reproducció: 540ms (N1) → 400ms (N20).
  // El tempo s'accelera gradualment per afegir repte rítmic als nivells alts.
  function getNoteGapMs(level) {
    return Math.round(540 - (level - 1) * (140 / 14));
  }

  // =========================================================================
  // ESTAT GLOBAL
  // =========================================================================

  const state = {
    highestUnlocked:       1,
    currentLevel:          1,
    currentRound:          1,
    sequence:              [],
    userIndex:             0,
    acceptingInput:        false,
    playingBack:           false,
    seqGen:                0,  // cancel·la seqüències async en vol
    perfectRoundsThisLevel: 0, // rondes perfectes de la partida actual del nivell
  };

  let levelStars = {}; // { "3": 2, "7": 4, ... } — millor marca de perfectes per nivell

  // =========================================================================
  // ÀUDIO — FM Synthesis per fase + master bus compressor
  // =========================================================================

  let audioCtx  = null;
  let masterBus = null;

  function getMasterBus() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx  = new Ctx();
      const comp = audioCtx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value      = 8;
      comp.ratio.value     = 6;
      comp.attack.value    = 0.003;
      comp.release.value   = 0.15;
      comp.connect(audioCtx.destination);
      masterBus = comp;
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return { ctx: audioCtx, out: masterBus };
  }

  // FM synthesis amb timbre per fase.
  // synthLevel: nivell d'on agafar el timbre (null = nivell actual del joc)
  function playTone(freq, duration = 0.42, peak = 0.32, synthLevel = null) {
    const params = getSynthParams(synthLevel ?? state.currentLevel);
    const { ctx, out } = getMasterBus();
    const now = ctx.currentTime;

    // Modulador FM — genera el transient d'atac ric en harmònics
    const modOsc  = ctx.createOscillator();
    const modGain = ctx.createGain();
    modOsc.type = "sine";
    modOsc.frequency.setValueAtTime(freq * params.modRatio, now);
    modGain.gain.setValueAtTime(freq * params.modRatio * params.modIdx, now);
    const modDecayS = params.modDecayMs / 1000;
    modGain.gain.exponentialRampToValueAtTime(
      0.001,
      now + Math.min(modDecayS, duration * 0.55)
    );
    modOsc.connect(modGain);

    // Portadora — sinus pur modulat per FM
    const carOsc  = ctx.createOscillator();
    const carGain = ctx.createGain();
    carOsc.type = "sine";
    carOsc.frequency.setValueAtTime(freq, now);
    modGain.connect(carOsc.frequency);
    carOsc.connect(carGain);
    carGain.connect(out);

    // Envoltant d'amplitud:
    // · sustainRatio ≥ 0.1 → ADSR (piano/vibràfon)
    // · sustainRatio < 0.1  → decau pur exponencial (marimba/campana)
    const A = 0.006;
    carGain.gain.setValueAtTime(0, now);
    carGain.gain.linearRampToValueAtTime(peak, now + A);
    if (params.sustainRatio >= 0.1) {
      const D  = 0.06;
      const S  = peak * params.sustainRatio;
      const R  = Math.min(0.12, duration * 0.28);
      const hE = Math.max(A + D, duration - R);
      carGain.gain.exponentialRampToValueAtTime(S, now + A + D);
      carGain.gain.setValueAtTime(S, now + hE);
      carGain.gain.linearRampToValueAtTime(0.0001, now + duration);
    } else {
      // Percussiu: decau a silenci en tota la durada
      carGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    const modEnd = Math.min(modDecayS + 0.02, duration * 0.6);
    modOsc.start(now); modOsc.stop(now + modEnd + 0.02);
    carOsc.start(now); carOsc.stop(now + duration + 0.05);
    modOsc.onended = () => { modOsc.disconnect(); modGain.disconnect(); };
    carOsc.onended = () => { carOsc.disconnect(); carGain.disconnect(); };
  }

  // Error: cop de baix (sine que cau) + dues dents de serra desafinades.
  function playErrorSound() {
    haptic([70, 40, 70]);
    const { ctx, out } = getMasterBus();
    const now = ctx.currentTime;

    const bassOsc  = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(90, now);
    bassOsc.frequency.exponentialRampToValueAtTime(42, now + 0.28);
    bassOsc.connect(bassGain); bassGain.connect(out);
    bassGain.gain.setValueAtTime(0.48, now);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    bassOsc.start(now); bassOsc.stop(now + 0.34);
    bassOsc.onended = () => { bassOsc.disconnect(); bassGain.disconnect(); };

    [115, 122].forEach((f, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.52, now + 0.68);
      osc.connect(gain); gain.connect(out);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.13, now + 0.02 + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
      osc.start(now); osc.stop(now + 0.78);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }

  // Victòria: arpegi ascendent amb les notes de la fase completada + acord final.
  // scheduler: scheduleGame al joc (cancelable si es navega), setTimeout al tutorial.
  // level: nivell del qual s'agafen les notes i el timbre (per defecte, el nivell actual).
  function playSuccessSound(scheduler = setTimeout, level = state.currentLevel) {
    haptic([25, 15, 25, 15, 50]);
    const info = getLevelInfo(level);
    const arp  = info.notes.slice(0, Math.min(4, info.notes.length));
    arp.forEach((n, i) =>
      scheduler(() => playTone(NOTES[n].freq, 0.38, 0.24, level), i * 72)
    );
    scheduler(() => {
      arp.slice(0, 3).forEach(n => playTone(NOTES[n].freq, 0.65, 0.09, level));
    }, arp.length * 72 + 55);
  }

  // Transició de fase: arpegi ascendent complet de la NOVA fase com a teaser sonor.
  function playPhaseUnlockSound(level) {
    const info  = getLevelInfo(level);
    const notes = info.notes.slice(0, Math.min(5, info.notes.length));
    notes.forEach((n, i) =>
      scheduleGame(() => playTone(NOTES[n].freq, 0.42, 0.18, level), i * 90)
    );
    scheduleGame(() => {
      notes.slice(0, Math.min(3, notes.length)).forEach(n =>
        playTone(NOTES[n].freq, 0.80, 0.07, level)
      );
    }, notes.length * 90 + 60);
  }

  function haptic(pattern) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  }

  // =========================================================================
  // UTILITATS NIVELL
  // =========================================================================

  function getLevelInfo(level) {
    return LEVEL_CONFIG.find(cfg => level >= cfg.range[0] && level <= cfg.range[1]);
  }

  function getSequenceLength(level) {
    const info    = getLevelInfo(level);
    const span    = info.range[1] - info.range[0];
    const offset  = level - info.range[0];
    const lenSpan = info.lenMax - info.lenMin;
    if (span === 0) return info.lenMin;
    return info.lenMin + Math.round((offset / span) * lenSpan);
  }

  function generateSequence(level) {
    const info      = getLevelInfo(level);
    const length    = getSequenceLength(level);
    // Pentatònica+ (≥5 notes): cap repetició consecutiva; fases menors: evita 3 iguals seguides
    const strictNoRepeat = info.notes.length >= 5;
    const seq       = [];
    for (let i = 0; i < length; i++) {
      let pick, attempts = 0;
      do {
        pick = info.notes[Math.floor(Math.random() * info.notes.length)];
        attempts++;
      } while (
        attempts < 10 && (
          strictNoRepeat
            ? seq.length >= 1 && pick === seq[seq.length - 1]
            : seq.length >= 2 && pick === seq[seq.length - 1] && pick === seq[seq.length - 2]
        )
      );
      seq.push(pick);
    }
    return seq;
  }

  function getPlayerTimeout() {
    return Math.max(TIMEOUT_S_MIN, state.sequence.length * TIMEOUT_S_PER_NOTE);
  }

  // =========================================================================
  // DIBUIX DEL TAULER (SVG) — reutilitzable per joc i tutorial
  // =========================================================================

  const SVG_NS = "http://www.w3.org/2000/svg";

  function polar(cx, cy, r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }

  function annularSectorPath(cx, cy, R, r, a1, a2) {
    const [x1o, y1o] = polar(cx, cy, R, a1);
    const [x2o, y2o] = polar(cx, cy, R, a2);
    const [x1i, y1i] = polar(cx, cy, r, a1);
    const [x2i, y2i] = polar(cx, cy, r, a2);
    const large = (a2 - a1) > Math.PI ? 1 : 0;
    return [
      `M ${x1i} ${y1i}`, `L ${x1o} ${y1o}`,
      `A ${R} ${R} 0 ${large} 1 ${x2o} ${y2o}`,
      `L ${x2i} ${y2i}`,
      `A ${r} ${r} 0 ${large} 0 ${x1i} ${y1i}`, "Z",
    ].join(" ");
  }

  function drawBoardInto(svgEl, noteNames, onClick) {
    const key = noteNames.join(",");
    if (svgEl.dataset.notes === key) return;
    svgEl.dataset.notes = key;
    while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

    const R_OUTER = 190, R_INNER = 72, LABEL_R = (R_OUTER + R_INNER) / 2;
    const count      = noteNames.length;
    const sliceAngle = (2 * Math.PI) / count;
    const startOff   = -Math.PI / 2 - sliceAngle / 2;

    noteNames.forEach((name, i) => {
      const note = NOTES[name];
      const a1   = startOff + i * sliceAngle;
      const a2   = a1 + sliceAngle;
      const d    = annularSectorPath(0, 0, R_OUTER, R_INNER, a1, a2);

      const group = document.createElementNS(SVG_NS, "g");
      group.setAttribute("role",       "button");
      group.setAttribute("aria-label", `Nota ${note.label}`);
      group.setAttribute("tabindex",   "0");
      group.addEventListener("keydown", ev => {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onClick(name); }
      });

      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d",    d);
      path.setAttribute("fill", note.color);
      path.classList.add("segment");
      path.dataset.note = name;
      path.addEventListener("pointerdown", ev => { ev.preventDefault(); onClick(name); });

      const border = document.createElementNS(SVG_NS, "path");
      border.setAttribute("d", d);
      border.classList.add("segment-border");

      const [lx, ly] = polar(0, 0, LABEL_R, (a1 + a2) / 2);
      const label    = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", lx);
      label.setAttribute("y", ly);
      label.classList.add("segment-label");
      label.textContent = note.label;

      group.appendChild(path);
      group.appendChild(border);
      group.appendChild(label);
      svgEl.appendChild(group);
    });
  }

  function flashSegmentIn(svgEl, noteName) {
    const seg = svgEl.querySelector(`.segment[data-note="${noteName}"]`);
    if (!seg) return;
    seg.classList.add("active");
    setTimeout(() => seg.classList.remove("active"), 320);
  }

  function flashSegmentCorrect(svgEl, noteName) {
    const seg = svgEl.querySelector(`.segment[data-note="${noteName}"]`);
    if (!seg) return;
    seg.classList.add("correct");
    setTimeout(() => seg.classList.remove("correct"), 280);
  }

  function setSegmentsLockedIn(svgEl, locked) {
    svgEl.querySelectorAll(".segment").forEach(s =>
      s.classList.toggle("locked", locked)
    );
    svgEl.querySelectorAll("[role='button']").forEach(g => {
      g.setAttribute("tabindex", locked ? "-1" : "0");
      if (locked) g.setAttribute("aria-disabled", "true");
      else        g.removeAttribute("aria-disabled");
    });
  }

  // =========================================================================
  // MODAL
  // =========================================================================

  const modalOverlay = document.getElementById("modal-overlay");
  const modalMessage = document.getElementById("modal-message");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel  = document.getElementById("modal-cancel");

  function showModal(message, {
    confirmText  = "D'acord",
    confirmClass = "danger-btn",
    cancelText   = "Cancel·lar",
    onConfirm,
  } = {}) {
    modalMessage.textContent  = message;
    modalConfirm.textContent  = confirmText;
    modalConfirm.className    = confirmClass;
    modalCancel.style.display = cancelText ? "" : "none";
    if (cancelText) modalCancel.textContent = cancelText;
    modalOverlay.classList.remove("hidden");
    modalConfirm.focus();
    const hide = () => modalOverlay.classList.add("hidden");
    modalConfirm.onclick = () => { hide(); onConfirm?.(); };
    modalCancel.onclick  = () => hide();
  }

  modalOverlay.addEventListener("click", ev => {
    if (ev.target === modalOverlay) modalOverlay.classList.add("hidden");
  });

  // =========================================================================
  // PERSISTÈNCIA
  // =========================================================================

  function loadProgress() {
    let raw = localStorage.getItem(STORAGE_KEY_NEW);
    if (raw === null) {
      const old = localStorage.getItem(STORAGE_KEY_OLD);
      if (old !== null) {
        localStorage.setItem(STORAGE_KEY_NEW, old);
        localStorage.removeItem(STORAGE_KEY_OLD);
        raw = old;
      }
    }
    const n = parseInt(raw, 10);
    state.highestUnlocked = Number.isFinite(n) && n >= 1 && n <= TOTAL_LEVELS + 1 ? n : 1;
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY_NEW, String(state.highestUnlocked));
  }

  function unlockNext() {
    const next = state.currentLevel + 1;
    if (next > state.highestUnlocked) {
      state.highestUnlocked = Math.min(next, TOTAL_LEVELS + 1); // TOTAL_LEVELS+1 = sentinel "tot completat"
      saveProgress();
    }
  }

  function loadStars() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STARS);
      levelStars = raw ? JSON.parse(raw) : {};
    } catch { levelStars = {}; }
  }

  function saveStars() {
    localStorage.setItem(STORAGE_KEY_STARS, JSON.stringify(levelStars));
  }

  // Actualitza la millor marca. Retorna true si s'ha batut el rècord anterior.
  function commitLevelStars() {
    const key     = String(state.currentLevel);
    const prev    = levelStars[key] || 0;
    const current = state.perfectRoundsThisLevel;
    state.perfectRoundsThisLevel = 0;
    if (current > prev) {
      levelStars[key] = current;
      saveStars();
      return true;
    }
    return false;
  }

  // =========================================================================
  // NAVEGACIÓ ENTRE PANTALLES
  // =========================================================================

  const screens = {
    landing:  document.getElementById("screen-landing"),
    selector: document.getElementById("screen-selector"),
    tutorial: document.getElementById("screen-tutorial"),
    game:     document.getElementById("screen-game"),
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => el.classList.toggle("hidden", k !== name));
    if (name === "selector") renderSelector();
    if (name === "game")     onEnterGameScreen();
    if (name === "tutorial") startTutorial();
    if (name !== "game")     stopGameActivity();
    if (name !== "tutorial") stopTutorialActivity();
  }

  document.querySelectorAll(".nav-back").forEach(btn =>
    btn.addEventListener("click", () => showScreen(btn.dataset.target || "landing"))
  );

  // =========================================================================
  // PANTALLA: LANDING
  // =========================================================================

  document.getElementById("btn-play").addEventListener("click", () => {
    getMasterBus();
    showScreen("selector");
  });

  document.getElementById("btn-tutorial").addEventListener("click", () => {
    getMasterBus();
    showScreen("tutorial");
  });

  // Hero mark: cada quadrant previsualitza la seva nota (DO·MI·SOL·DO+)
  const HERO_PREVIEW_NOTES = ["DO", "MI", "SOL", "DO+"];
  document.querySelectorAll(".hero-mark span").forEach((span, i) => {
    span.addEventListener("pointerdown", ev => {
      ev.preventDefault();
      getMasterBus();
      playTone(NOTES[HERO_PREVIEW_NOTES[i]].freq, 0.4, 0.22, 1);
    });
  });

  document.getElementById("btn-reset-all").addEventListener("click", () => {
    showModal(
      "Segur que vols esborrar el teu progrés i reiniciar des del Nivell 1?",
      {
        confirmText: "Esborrar tot",
        cancelText:  "Cancel·lar",
        onConfirm() {
          localStorage.removeItem(STORAGE_KEY_NEW);
          localStorage.removeItem(STORAGE_KEY_OLD);
          localStorage.removeItem(STORAGE_KEY_STARS);
          state.highestUnlocked = 1;
          levelStars = {};
          showModal("Progrés esborrat. Tornaràs al Nivell 1.", {
            confirmText:  "D'acord",
            confirmClass: "primary-btn",
            cancelText:   null,
          });
        },
      }
    );
  });

  // =========================================================================
  // PANTALLA: SELECTOR DE NIVELLS
  // =========================================================================

  const levelGrid    = document.getElementById("level-grid");
  const selectorMeta = document.getElementById("selector-meta");

  function renderSelector() {
    levelGrid.innerHTML = "";
    const done = Math.min(state.highestUnlocked - 1, TOTAL_LEVELS);
    selectorMeta.textContent = `${done}/${TOTAL_LEVELS} superats`;

    for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
      const info  = getLevelInfo(lvl);
      const tile  = document.createElement("button");
      tile.type   = "button";
      tile.className = "level-tile";
      const isDone    = lvl < state.highestUnlocked;
      const isCurrent = lvl === state.highestUnlocked && lvl <= TOTAL_LEVELS;

      if      (isDone)    tile.classList.add("done");
      else if (isCurrent) tile.classList.add("current");
      else                tile.classList.add("locked");

      // Estreles: sempre visibles als tiles done (☆☆☆☆ si cap perfecta)
      const stars     = isDone ? (levelStars[String(lvl)] || 0) : 0;
      const starsHtml = isDone
        ? `<div class="tile-stars">
             <span class="stars-filled">${"★".repeat(stars)}</span><span class="stars-empty">${"☆".repeat(ROUNDS_PER_LEVEL - stars)}</span>
           </div>`
        : "";

      tile.innerHTML = `
        <div class="tile-status"></div>
        <div class="tile-num">${lvl}</div>
        <div>
          <div class="tile-phase">${info.phase}</div>
          <div class="tile-notes">${info.notes.length} botons · ${getSequenceLength(lvl)} notes</div>
          ${starsHtml}
        </div>
      `;

      if (!tile.classList.contains("locked")) {
        tile.addEventListener("click", () => {
          state.currentLevel = lvl;
          state.currentRound = 1;
          showScreen("game");
        });
      }
      levelGrid.appendChild(tile);
    }
  }

  // =========================================================================
  // PANTALLA: JOC
  // =========================================================================

  const gameBoard     = document.getElementById("game-board");
  const levelDisplay  = document.getElementById("level-display");
  const roundDisplay  = document.getElementById("round-display");
  const phaseDisplay  = document.getElementById("phase-display");
  const statusMsg     = document.getElementById("status-message");
  const startBtn      = document.getElementById("start-btn");
  const replayBtn     = document.getElementById("replay-btn");
  const progressFill  = document.getElementById("progress-fill");
  const progressSteps = document.getElementById("progress-steps");
  const timerBar      = document.getElementById("timer-bar");
  const timerFill     = document.getElementById("timer-fill");

  let gameTimeouts        = [];
  let playerTimerId       = null;
  let currentRoundTimeout = TIMEOUT_S_MIN;
  let roundStartTime      = 0;

  function scheduleGame(fn, ms) {
    const id = setTimeout(() => {
      gameTimeouts = gameTimeouts.filter(x => x !== id);
      fn();
    }, ms);
    gameTimeouts.push(id);
    return id;
  }

  function clearGameTimeouts() {
    gameTimeouts.forEach(clearTimeout);
    gameTimeouts = [];
  }

  function stopGameActivity() {
    state.seqGen++;
    clearGameTimeouts();
    clearPlayerTimer();
    state.acceptingInput = false;
    state.playingBack    = false;
  }

  function startPlayerTimer(timeoutS, showReplay = false) {
    clearPlayerTimer();
    timerBar.classList.remove("hidden");
    timerFill.style.transition = "none";
    timerFill.style.width      = "100%";
    timerFill.getBoundingClientRect();
    timerFill.style.transition = `width ${timeoutS}s linear`;
    timerFill.style.width      = "0%";
    playerTimerId = setTimeout(() => onGameMistake(true), timeoutS * 1000);
    replayBtn.classList.toggle("hidden", !showReplay);
  }

  function clearPlayerTimer() {
    if (playerTimerId) { clearTimeout(playerTimerId); playerTimerId = null; }
    timerFill.style.transition = "none";
    timerBar.classList.add("hidden");
    replayBtn.classList.add("hidden");
  }

  function setGameStatus(text, cls = null) {
    statusMsg.textContent = text;
    statusMsg.className   = "";
    if (cls) statusMsg.classList.add(`state-${cls}`);
  }

  function pulsePerfecta() {
    roundDisplay.classList.remove("perfecta");
    void roundDisplay.offsetWidth;
    roundDisplay.classList.add("perfecta");
    setTimeout(() => roundDisplay.classList.remove("perfecta"), 600);
  }

  // Pols daurada escalonada als tres pills d'estadística (4/4 perfectes o nova marca).
  function pulseAllStats() {
    [levelDisplay, roundDisplay, phaseDisplay].forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove("nova-marca");
        void el.offsetWidth;
        el.classList.add("nova-marca");
        setTimeout(() => el.classList.remove("nova-marca"), 800);
      }, i * 85);
    });
  }

  function updateGameDisplays() {
    const info = getLevelInfo(state.currentLevel);
    levelDisplay.textContent = `${state.currentLevel}/${TOTAL_LEVELS}`;
    roundDisplay.textContent = `${state.currentRound}/${ROUNDS_PER_LEVEL}`;
    phaseDisplay.textContent = info.phase;

    const pct = ((state.currentLevel - 1) / TOTAL_LEVELS) * 100
              + ((state.currentRound - 1) / (ROUNDS_PER_LEVEL * TOTAL_LEVELS)) * 100;
    progressFill.style.width = `${pct}%`;

    if (progressSteps.childElementCount !== TOTAL_LEVELS) {
      progressSteps.innerHTML = "";
      for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const s = document.createElement("div");
        s.className = "progress-step";
        s.title     = `Nivell ${i}`;
        progressSteps.appendChild(s);
      }
    }
    const steps = progressSteps.children;
    for (let i = 0; i < TOTAL_LEVELS; i++) {
      steps[i].classList.remove("done", "current");
      if (i + 1 <  state.highestUnlocked) steps[i].classList.add("done");
      if (i + 1 === state.currentLevel)   steps[i].classList.add("current");
    }
  }

  function drawGameBoardForLevel() {
    const info = getLevelInfo(state.currentLevel);
    drawBoardInto(gameBoard, info.notes, handleGameInput);
  }

  function onEnterGameScreen() {
    clearGameTimeouts();
    state.currentRound          = 1;
    state.perfectRoundsThisLevel = 0;
    drawGameBoardForLevel();
    setSegmentsLockedIn(gameBoard, true);
    updateGameDisplays();
    startBtn.disabled       = false;
    startBtn.dataset.action = "start";
    startBtn.textContent    = "Començar nivell";
    setGameStatus(
      `Nivell ${state.currentLevel} · ${getLevelInfo(state.currentLevel).phase}. Prem «Començar nivell».`
    );
  }

  async function playGameSequence() {
    const gen   = ++state.seqGen;
    const alive = () => gen === state.seqGen && !screens.game.classList.contains("hidden");

    state.playingBack    = true;
    state.acceptingInput = false;
    setSegmentsLockedIn(gameBoard, true);
    startBtn.disabled = true;

    const showGlow = state.currentLevel <= GLOW_LAST_LEVEL;
    const gapMs    = getNoteGapMs(state.currentLevel);
    const toneLen  = Math.max(0.30, (gapMs / 1000) * 0.80); // durada proporcional al gap

    setGameStatus(
      showGlow
        ? "Escolta i observa la seqüència..."
        : "Escolta bé la seqüència (sense pistes visuals)...",
      "playing"
    );

    await gameWait(420);

    for (let i = 0; i < state.sequence.length; i++) {
      if (!alive()) return;
      const name = state.sequence[i];
      playTone(NOTES[name].freq, toneLen);
      if (showGlow) flashSegmentIn(gameBoard, name);
      await gameWait(gapMs);
    }

    if (!alive()) return;

    state.playingBack    = false;
    state.acceptingInput = true;
    state.userIndex      = 0;
    setSegmentsLockedIn(gameBoard, false);
    setGameStatus("Et toca! Repeteix la seqüència.", "listening");

    currentRoundTimeout = getPlayerTimeout();
    roundStartTime      = performance.now();
    startPlayerTimer(currentRoundTimeout, showGlow);
  }

  async function replayCurrentSequence() {
    const gen      = state.seqGen; // no incrementem — seguim al mateix torn
    const alive    = () => gen === state.seqGen && !screens.game.classList.contains("hidden");
    const gapMs    = getNoteGapMs(state.currentLevel);
    const toneLen  = Math.max(0.30, (gapMs / 1000) * 0.80);

    state.playingBack = true;
    setSegmentsLockedIn(gameBoard, true);
    await gameWait(250);

    for (const name of state.sequence) {
      if (!alive()) { state.playingBack = false; return false; }
      playTone(NOTES[name].freq, toneLen);
      flashSegmentIn(gameBoard, name);
      await gameWait(gapMs);
    }

    state.playingBack = false;
    return alive();
  }

  function gameWait(ms) {
    return new Promise(res => scheduleGame(res, ms));
  }

  function handleGameInput(noteName) {
    if (!state.acceptingInput || state.playingBack) return;
    const info = getLevelInfo(state.currentLevel);
    if (!info.notes.includes(noteName)) return;

    playTone(NOTES[noteName].freq, 0.32);

    const expected = state.sequence[state.userIndex];
    if (noteName !== expected) {
      flashSegmentIn(gameBoard, noteName);
      return onGameMistake();
    }

    haptic(12);
    flashSegmentCorrect(gameBoard, noteName);
    state.userIndex++;
    if (state.userIndex >= state.sequence.length) onGameRoundCleared();
  }

  function onGameRoundCleared() {
    const elapsed   = (performance.now() - roundStartTime) / 1000;
    const isPerfect = roundStartTime > 0 && elapsed < currentRoundTimeout * PERFECT_THRESHOLD;
    roundStartTime  = 0;

    if (isPerfect) state.perfectRoundsThisLevel++;

    clearPlayerTimer();
    state.acceptingInput = false;
    setSegmentsLockedIn(gameBoard, true);

    if (state.currentRound >= ROUNDS_PER_LEVEL) {
      unlockNext();
      const completedLevel   = state.currentLevel;
      const completedPerfects = state.perfectRoundsThisLevel; // capturat ABANS del reset
      const isNewRecord      = commitLevelStars();             // reseteja perfectRoundsThisLevel
      const allPerfect       = completedPerfects === ROUNDS_PER_LEVEL;

      // ── Nivell 20: fi del joc ──────────────────────────────────────────────
      if (completedLevel >= TOTAL_LEVELS) {
        const msg = allPerfect
          ? `★★★★ NOVA MARCA! Has completat els 15 nivells amb perfecció absoluta!`
          : isNewRecord && completedPerfects > 0
            ? `★ NOVA MARCA! Has completat els 15 nivells amb ${completedPerfects}/${ROUNDS_PER_LEVEL} rondes perfectes!`
            : "Has completat els 15 nivells! Felicitats.";
        setGameStatus(msg, allPerfect ? "perfecta" : isNewRecord ? "nova-marca" : "success");
        if (allPerfect) pulseAllStats();
        playSuccessSound(scheduleGame, completedLevel);
        startBtn.dataset.action = "returnToSelector";
        startBtn.textContent    = "Tornar al selector";
        startBtn.disabled       = false;
        updateGameDisplays();
        return;
      }

      // ── Detecta transició de fase ──────────────────────────────────────────
      const currentPhase  = getLevelInfo(completedLevel).phase;
      const nextPhase     = getLevelInfo(completedLevel + 1)?.phase;
      const isPhaseChange = !!nextPhase && nextPhase !== currentPhase;
      const advanceDelay  = isPhaseChange ? 2200 : 1600;

      // ── Missatge de nivell superat ─────────────────────────────────────────
      let statusText, statusCls;
      if (allPerfect && isNewRecord) {
        statusText = `★★★★ NOVA MARCA! Nivell ${completedLevel} superat amb perfecció total!`;
        statusCls  = "perfecta";
      } else if (allPerfect) {
        statusText = `★★★★ Nivell ${completedLevel} superat amb perfecció! Passant al ${completedLevel + 1}...`;
        statusCls  = "perfecta";
      } else if (isNewRecord && completedPerfects > 0) {
        statusText = `★ NOVA MARCA! Nivell ${completedLevel}: ${completedPerfects}/${ROUNDS_PER_LEVEL} rondes perfectes!`;
        statusCls  = "nova-marca";
      } else if (completedPerfects > 0) {
        statusText = `★ Nivell ${completedLevel} superat! ${completedPerfects}/${ROUNDS_PER_LEVEL} rondes perfectes.`;
        statusCls  = "perfecta";
      } else {
        statusText = `Nivell ${completedLevel} superat! Passant al ${completedLevel + 1}...`;
        statusCls  = "success";
      }
      setGameStatus(statusText, statusCls);

      if (allPerfect) pulseAllStats();
      else if (isPerfect) pulsePerfecta();

      playSuccessSound(scheduleGame, completedLevel);

      // ── Avança al següent nivell ───────────────────────────────────────────
      scheduleGame(() => {
        state.currentLevel++;
        state.currentRound = 1;
        drawGameBoardForLevel();
        updateGameDisplays();
        startBtn.disabled       = false;
        startBtn.dataset.action = "start";

        if (isPhaseChange) {
          startBtn.textContent = `Iniciar ${nextPhase}`;
          setGameStatus(`✦ Nova fase desblocada: ${nextPhase}. El timbre canvia ara.`, "nova-fase");
          haptic([30, 20, 30, 20, 80]);
          playPhaseUnlockSound(state.currentLevel);
        } else {
          startBtn.textContent = "Començar nivell";
          setGameStatus(`Nou nivell: ${getLevelInfo(state.currentLevel).phase}. Prem «Començar nivell».`);
        }
      }, advanceDelay);

    } else {
      state.currentRound++;
      updateGameDisplays();
      if (isPerfect) pulsePerfecta();
      setGameStatus(
        isPerfect
          ? `★ Ronda ${state.currentRound - 1} perfecta! Preparant ronda ${state.currentRound}...`
          : `Ronda ${state.currentRound - 1} correcte! Preparant ronda ${state.currentRound}...`,
        isPerfect ? "perfecta" : "success"
      );
      scheduleGame(() => startGameRound(), 1100);
    }
  }

  function onGameMistake(isTimeout = false) {
    // Guarda l'índex de la nota fallida abans de cap reset
    const failedIdx   = state.userIndex;
    roundStartTime    = 0;
    state.perfectRoundsThisLevel = 0; // reinicia el recompte de perfectes

    clearPlayerTimer();
    state.acceptingInput = false;
    setSegmentsLockedIn(gameBoard, true);
    playErrorSound();
    const gameAreaEl = gameBoard.closest(".game-area");
    if (gameAreaEl) {
      gameAreaEl.classList.remove("shake");
      void gameAreaEl.offsetWidth;
      gameAreaEl.classList.add("shake");
    }
    setGameStatus(
      isTimeout
        ? "Temps exhaurit! Tornes a la Ronda 1 del nivell."
        : "Error! Has de repetir el nivell des de la Ronda 1.",
      "error"
    );
    state.currentRound = 1;

    // Hint pedagògic: reprodueix suaument la nota que s'esperava (solo en errors de nota)
    if (!isTimeout && failedIdx < state.sequence.length) {
      const hintNote = state.sequence[failedIdx];
      scheduleGame(() => {
        if (!state.acceptingInput) {
          playTone(NOTES[hintNote].freq, 0.55, 0.10);
          flashSegmentIn(gameBoard, hintNote);
        }
      }, 760);
    }

    scheduleGame(() => {
      updateGameDisplays();
      startBtn.disabled       = false;
      startBtn.dataset.action = "start";
      startBtn.textContent    = "Reintentar nivell";
      setGameStatus("Prem «Reintentar nivell» per tornar a començar.");
    }, 1400);
  }

  function startGameRound() {
    drawGameBoardForLevel();
    updateGameDisplays();
    state.sequence = generateSequence(state.currentLevel);
    playGameSequence();
  }

  startBtn.addEventListener("click", () => {
    getMasterBus();
    if (startBtn.dataset.action === "returnToSelector") { showScreen("selector"); return; }
    startGameRound();
  });

  replayBtn.addEventListener("click", async () => {
    if (!state.acceptingInput || state.playingBack) return;
    clearPlayerTimer();
    state.acceptingInput = false;
    setGameStatus("Repetint la seqüència...", "playing");

    const completed = await replayCurrentSequence();
    if (!completed) return;

    state.acceptingInput = true;
    state.userIndex      = 0;
    setSegmentsLockedIn(gameBoard, false);
    setGameStatus("Et toca! Repeteix la seqüència.", "listening");
    roundStartTime = performance.now();
    startPlayerTimer(currentRoundTimeout, true);
  });

  // =========================================================================
  // PANTALLA: TUTORIAL
  // =========================================================================

  const tutorialBoard  = document.getElementById("tutorial-board");
  const tutTitle       = document.getElementById("tutorial-title");
  const tutBody        = document.getElementById("tutorial-body");
  const tutFeedback    = document.getElementById("tutorial-feedback");
  const tutStepNum     = document.getElementById("tutorial-step-num");
  const tutStepTotal   = document.getElementById("tutorial-step-total");
  const tutActionBtn   = document.getElementById("tut-action");
  const tutPrevBtn     = document.getElementById("tut-prev");
  const tutNextBtn     = document.getElementById("tut-next");
  const tutCenterLabel = document.getElementById("tutorial-center-label");

  const tutState = {
    stepIdx:        0,
    explored:       new Set(),
    demoSequence:   [],
    demoUserIdx:    0,
    acceptingInput: false,
    playingBack:    false,
    timeouts:       [],
    seqGen:         0,
  };

  function scheduleTutorial(fn, ms) {
    const id = setTimeout(() => {
      tutState.timeouts = tutState.timeouts.filter(x => x !== id);
      fn();
    }, ms);
    tutState.timeouts.push(id);
    return id;
  }

  function clearTutorialTimeouts() {
    tutState.timeouts.forEach(clearTimeout);
    tutState.timeouts = [];
  }

  function stopTutorialActivity() {
    tutState.seqGen++;
    clearTutorialTimeouts();
    tutState.acceptingInput = false;
    tutState.playingBack    = false;
  }

  function tutSetFeedback(text, cls = null) {
    tutFeedback.textContent = text || "";
    tutFeedback.className   = "tutorial-feedback";
    if (cls) tutFeedback.classList.add(cls);
  }

  const TUTORIAL_NOTES = ["DO", "SOL"];
  const TUTORIAL_SYNTH_LEVEL = 1; // tutorial sempre amb timbre d'Iniciació

  const TUTORIAL_STEPS = [
    {
      title: "Benvingut al Simon Sinfònic",
      body:  "Aquest joc entrena la teva oïda amb seqüències musicals. Al primer nivell hi haurà dues notes: DO i SOL. Prem «Continuar» per veure el tauler.",
      lockNav: false,
      onEnter() {
        tutCenterLabel.textContent = "DEMO";
        drawBoardInto(tutorialBoard, [], () => {});
        setSegmentsLockedIn(tutorialBoard, true);
        tutSetFeedback("");
        enableActionBtn("Continuar", true);
      },
      onAction(advance) { advance(); },
    },
    {
      title: "1 · Explora els botons",
      body:  "Prem cada un dels dos botons per escoltar com sona. Cada nota té un color i un so únics.",
      lockNav: true,
      keyboardNote: note => handleTutorialExplore(note),
      onEnter() {
        tutCenterLabel.textContent = "PROVA";
        drawBoardInto(tutorialBoard, TUTORIAL_NOTES, handleTutorialExplore);
        setSegmentsLockedIn(tutorialBoard, false);
        tutState.explored = new Set();
        tutSetFeedback("Encara no has premut cap botó.");
        enableActionBtn("Continuar", false);
      },
    },
    {
      title: "2 · Escolta la seqüència",
      body:  "La màquina tocarà una petita seqüència de 3 notes. Mira els botons que s'il·luminen i escolta l'ordre. Prem «Reproduir» quan estiguis preparat.",
      lockNav: false,
      onEnter() {
        tutCenterLabel.textContent = "DEMO";
        drawBoardInto(tutorialBoard, TUTORIAL_NOTES, () => {});
        setSegmentsLockedIn(tutorialBoard, true);
        tutState.demoSequence   = ["DO", "SOL", "DO"];
        tutState.acceptingInput = false;
        tutSetFeedback("Prem «Reproduir» per escoltar la seqüència.");
        enableActionBtn("Reproduir", true);
      },
      async onAction(advance) {
        enableActionBtn("Reproduint...", false);
        await playTutorialDemo(tutState.demoSequence, true);
        tutSetFeedback("Ara ja saps la seqüència. Prem «Continuar» per repetir-la tu.", "ok");
        enableActionBtn("Continuar", true);
        tutActionBtn.onclick = () => advance();
      },
    },
    {
      title: "3 · Repeteix-la tu",
      body:  "Prem els botons en el mateix ordre que has escoltat. Si t'equivoques, podràs tornar-ho a provar.",
      lockNav: true,
      keyboardNote: note => handleTutorialRepeat(note),
      onEnter() {
        tutCenterLabel.textContent = "EL TEU TORN";
        drawBoardInto(tutorialBoard, TUTORIAL_NOTES, handleTutorialRepeat);
        setSegmentsLockedIn(tutorialBoard, false);
        tutState.demoUserIdx    = 0;
        tutState.acceptingInput = true;
        tutSetFeedback(`Seqüència a repetir: ${tutState.demoSequence.join(" → ")}`);
        enableActionBtn("Reescoltar", true);
        tutActionBtn.onclick = async () => {
          tutState.acceptingInput = false;
          setSegmentsLockedIn(tutorialBoard, true);
          enableActionBtn("Reproduint...", false);
          await playTutorialDemo(tutState.demoSequence, true);
          tutState.demoUserIdx    = 0;
          tutState.acceptingInput = true;
          setSegmentsLockedIn(tutorialBoard, false);
          tutSetFeedback(`Seqüència a repetir: ${tutState.demoSequence.join(" → ")}`);
          enableActionBtn("Reescoltar", true);
        };
      },
    },
    {
      title: "4 · Com funciona el joc",
      body:  "Cada nivell té 4 rondes. Si completes les 4, desbloqueges el nivell següent. Si t'equivoques, tornes a la Ronda 1. A partir del nivell 7, la seqüència NO s'il·luminarà — sols sonarà. Respon ràpidament per aconseguir ★ Rondes Perfectes i guardar la teva millor marca.",
      lockNav: false,
      onEnter() {
        tutCenterLabel.textContent = "LLEST";
        drawBoardInto(tutorialBoard, ["DO", "MI", "SOL", "DO+"], () => {});
        setSegmentsLockedIn(tutorialBoard, true);
        tutSetFeedback("");
        enableActionBtn("Anar al selector", true);
      },
      onAction() { showScreen("selector"); },
    },
  ];

  function enableActionBtn(label, enabled) {
    tutActionBtn.textContent = label;
    tutActionBtn.disabled    = !enabled;
  }

  function handleTutorialExplore(note) {
    if (!TUTORIAL_NOTES.includes(note)) return;
    playTone(NOTES[note].freq, 0.35, 0.30, TUTORIAL_SYNTH_LEVEL);
    flashSegmentIn(tutorialBoard, note);
    tutState.explored.add(note);
    const remaining = TUTORIAL_NOTES.filter(n => !tutState.explored.has(n));
    if (remaining.length === 0) {
      tutSetFeedback("Perfecte, has provat totes dues notes!", "ok");
      enableActionBtn("Continuar", true);
    } else {
      tutSetFeedback(`Encara et queda(n): ${remaining.join(", ")}`);
    }
  }

  async function playTutorialDemo(seq, glow) {
    const gen   = ++tutState.seqGen;
    const alive = () => gen === tutState.seqGen && !screens.tutorial.classList.contains("hidden");
    tutState.playingBack = true;
    setSegmentsLockedIn(tutorialBoard, true);
    await new Promise(res => scheduleTutorial(res, 320));
    for (const name of seq) {
      if (!alive()) { tutState.playingBack = false; return; }
      playTone(NOTES[name].freq, 0.42, 0.32, TUTORIAL_SYNTH_LEVEL);
      if (glow) flashSegmentIn(tutorialBoard, name);
      await new Promise(res => scheduleTutorial(res, 520));
    }
    tutState.playingBack = false;
  }

  function handleTutorialRepeat(note) {
    if (!tutState.acceptingInput || tutState.playingBack) return;
    if (!TUTORIAL_NOTES.includes(note)) return;
    playTone(NOTES[note].freq, 0.32, 0.32, TUTORIAL_SYNTH_LEVEL);

    const expected = tutState.demoSequence[tutState.demoUserIdx];
    if (note !== expected) {
      flashSegmentIn(tutorialBoard, note);
      playErrorSound();
      tutSetFeedback(`Oh! Esperava «${expected}». Prem «Reescoltar» i torna-ho a provar.`, "err");
      tutState.acceptingInput = false;
      setSegmentsLockedIn(tutorialBoard, true);
      enableActionBtn("Reescoltar", true);
      return;
    }

    haptic(12);
    flashSegmentCorrect(tutorialBoard, note);
    tutState.demoUserIdx++;
    if (tutState.demoUserIdx >= tutState.demoSequence.length) {
      tutSetFeedback("Excel·lent! Has repetit la seqüència correctament.", "ok");
      tutState.acceptingInput = false;
      setSegmentsLockedIn(tutorialBoard, true);
      playSuccessSound(undefined, TUTORIAL_SYNTH_LEVEL);
      enableActionBtn("Continuar", true);
      tutActionBtn.onclick = () => goToTutorialStep(tutState.stepIdx + 1);
    }
  }

  function goToTutorialStep(i) {
    stopTutorialActivity();
    if (i < 0 || i >= TUTORIAL_STEPS.length) return;
    tutState.stepIdx = i;
    const step = TUTORIAL_STEPS[i];
    tutTitle.textContent     = step.title;
    tutBody.textContent      = step.body;
    tutStepNum.textContent   = String(i + 1);
    tutStepTotal.textContent = String(TUTORIAL_STEPS.length);
    tutPrevBtn.disabled = i === 0 || !!step.lockNav;
    tutNextBtn.disabled = i === TUTORIAL_STEPS.length - 1 || !!step.lockNav;

    tutActionBtn.onclick = () => {
      if (step.onAction) step.onAction(() => goToTutorialStep(i + 1));
      else goToTutorialStep(i + 1);
    };

    if (step.onEnter) step.onEnter();
  }

  function startTutorial() { goToTutorialStep(0); }

  tutPrevBtn.addEventListener("click", () => goToTutorialStep(tutState.stepIdx - 1));
  tutNextBtn.addEventListener("click", () => goToTutorialStep(tutState.stepIdx + 1));

  // =========================================================================
  // TECLAT — A·S·D·F·G·H·J·K per notes, Esc tanca modal
  // =========================================================================

  document.addEventListener("keydown", ev => {
    if (ev.repeat || ev.metaKey || ev.ctrlKey || ev.altKey) return;

    if (ev.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
      modalOverlay.classList.add("hidden");
      return;
    }

    // «R» repeteix la seqüència si el botó de replay és visible
    if (ev.key.toLowerCase() === "r" && !screens.game.classList.contains("hidden")) {
      if (!replayBtn.classList.contains("hidden")) {
        ev.preventDefault();
        replayBtn.click();
      }
      return;
    }

    const note = KEY_NOTE_MAP[ev.key.toLowerCase()];
    if (!note) return;

    if (!screens.game.classList.contains("hidden")) {
      ev.preventDefault();
      handleGameInput(note);
      return;
    }
    if (!screens.tutorial.classList.contains("hidden")) {
      ev.preventDefault();
      const step = TUTORIAL_STEPS[tutState.stepIdx];
      if (step?.keyboardNote) step.keyboardNote(note);
    }
  });

  // =========================================================================
  // INICIALITZACIÓ
  // =========================================================================

  function init() {
    loadProgress();
    loadStars();
    showScreen("landing");
  }

  document.addEventListener("DOMContentLoaded", init);
})();

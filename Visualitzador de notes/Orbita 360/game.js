/* =====================================================================
   ÒRBITA 360 — DEFENSA PLANETÀRIA · v2.0 PREMIUM
   Motor AAA: Bloom · Parallax 3 capes · FM-synth · Música ambient
   Power-ups · Sistema d'estrelles · Stats per nota · Achievements
   Slow-motion · Chromatic aberration · Indicadors direccionals
   ===================================================================== */

(() => {

// ============================================================
// 1. CONSTANTS DE NOTES (clau de Sol)
// ============================================================

const NOTES = {
    DO:  { freq: 261.63, key: '1', staffY: 1.0,  color: '#ff5577', glow: '#ff7799' },
    RE:  { freq: 293.66, key: '2', staffY: 0.5,  color: '#ff9944', glow: '#ffbb66' },
    MI:  { freq: 329.63, key: '3', staffY: 0.0,  color: '#ffdd33', glow: '#ffee66' },
    FA:  { freq: 349.23, key: '4', staffY: -0.5, color: '#88ee44', glow: '#aaff66' },
    SOL: { freq: 392.00, key: '5', staffY: -1.0, color: '#33ddaa', glow: '#55ffcc' },
    LA:  { freq: 440.00, key: '6', staffY: -1.5, color: '#33aaff', glow: '#66ccff' },
    SI:  { freq: 493.88, key: '7', staffY: -2.0, color: '#aa66ff', glow: '#cc88ff' }
};
const NOTE_NAMES = Object.keys(NOTES);
const KEY_TO_NOTE = {};
NOTE_NAMES.forEach(n => KEY_TO_NOTE[NOTES[n].key] = n);

// ============================================================
// 2. NIVELLS (20)
// ============================================================

const LEVELS = [
    { name: 'ALPHA-I',     notes: ['DO','RE'],                              total: 8,  speed: 95,  simul: 1, interval: 1900 },
    { name: 'ALPHA-II',    notes: ['DO','RE','MI'],                         total: 10, speed: 105, simul: 1, interval: 1700 },
    { name: 'BETA-I',      notes: ['DO','RE','MI'],                         total: 12, speed: 115, simul: 1, interval: 1600 },
    { name: 'BETA-II',     notes: ['DO','RE','MI','FA'],                    total: 14, speed: 125, simul: 1, interval: 1500 },
    { name: 'GAMMA-I',     notes: ['DO','RE','MI','FA','SOL'],              total: 14, speed: 135, simul: 2, interval: 1500 },
    { name: 'GAMMA-II',    notes: ['DO','RE','MI','FA','SOL'],              total: 16, speed: 145, simul: 2, interval: 1400 },
    { name: 'DELTA-I',     notes: ['DO','RE','MI','FA','SOL','LA'],         total: 18, speed: 155, simul: 2, interval: 1300 },
    { name: 'DELTA-II',    notes: ['DO','RE','MI','FA','SOL','LA'],         total: 20, speed: 165, simul: 2, interval: 1250 },
    { name: 'EPSILON-I',   notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 20, speed: 175, simul: 2, interval: 1200 },
    { name: 'EPSILON-II',  notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 22, speed: 185, simul: 2, interval: 1150 },
    { name: 'ZETA-I',      notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 25, speed: 195, simul: 3, interval: 1100 },
    { name: 'ZETA-II',     notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 28, speed: 205, simul: 3, interval: 1050 },
    { name: 'ETA-I',       notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 30, speed: 215, simul: 3, interval: 1000 },
    { name: 'ETA-II',      notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 32, speed: 225, simul: 4, interval: 950 },
    { name: 'THETA-I',     notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 35, speed: 235, simul: 4, interval: 900 },
    { name: 'THETA-II',    notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 38, speed: 245, simul: 4, interval: 870 },
    { name: 'IOTA-I',      notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 40, speed: 260, simul: 5, interval: 830 },
    { name: 'IOTA-II',     notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 44, speed: 275, simul: 5, interval: 800 },
    { name: 'OMEGA-I',     notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 48, speed: 290, simul: 6, interval: 760 },
    { name: 'OMEGA-FINAL', notes: ['DO','RE','MI','FA','SOL','LA','SI'],    total: 55, speed: 310, simul: 7, interval: 720 }
];

// ============================================================
// 3. ASSOLIMENTS
// ============================================================

const ACHIEVEMENTS = [
    { id: 'first_kill',  icon: '🎯', name: 'PRIMER IMPACTE',     desc: 'Destrueix el teu primer asteroide.' },
    { id: 'combo_10',    icon: '🔥', name: 'EN RATXA',            desc: 'Aconsegueix un combo x10.' },
    { id: 'combo_25',    icon: '⚡', name: 'IMPLACABLE',          desc: 'Aconsegueix un combo x25.' },
    { id: 'combo_50',    icon: '💫', name: 'LLEGENDARI',          desc: 'Aconsegueix un combo x50.' },
    { id: 'level_1',     icon: '🌌', name: 'PRIMERA DEFENSA',     desc: 'Completa el sistema ALPHA-I.' },
    { id: 'three_star',  icon: '⭐', name: 'PERFECCIÓ',           desc: 'Aconsegueix 3 estrelles a qualsevol nivell.' },
    { id: 'no_damage',   icon: '🛡',  name: 'INTACTE',             desc: 'Completa un nivell sense rebre dany.' },
    { id: 'no_miss',     icon: '🎯', name: 'TIRADOR D\'ELIT',     desc: 'Completa un nivell sense errors.' },
    { id: 'kills_100',   icon: '💯', name: 'CENTURIÓ',            desc: 'Destrueix 100 asteroides en total.' },
    { id: 'kills_500',   icon: '🌟', name: 'EXTERMINADOR',        desc: 'Destrueix 500 asteroides en total.' },
    { id: 'level_10',    icon: '🛰', name: 'EXPLORADOR',          desc: 'Arriba al sistema EPSILON-II.' },
    { id: 'level_20',    icon: '👑', name: 'COMANDANT SUPREM',    desc: 'Completa el sistema OMEGA-FINAL.' },
    { id: 'use_bomb',    icon: '💥', name: 'PROTOCOL EMP',        desc: 'Activa la bomba EMP per primera vegada.' },
    { id: 'use_shield',  icon: '🌀', name: 'BARRERA ACTIVADA',    desc: 'Activa l\'escut per primera vegada.' },
    { id: 'use_slow',    icon: '⏳', name: 'AMO DEL TEMPS',       desc: 'Activa el slow-time per primera vegada.' },
    { id: 'all_three',   icon: '🏆', name: 'GLÒRIA TOTAL',        desc: 'Aconsegueix 3 estrelles a tots els nivells.' }
];

// ============================================================
// 4. ESTAT GLOBAL
// ============================================================

const State = {
    screen: 'landing',
    canvas: null, ctx: null,
    bgCanvas: null, bgCtx: null,
    bloomCanvas: null, bloomCtx: null,
    W: 0, H: 0, cx: 0, cy: 0,
    running: false,
    paused: false,
    bgLoopRunning: false,
    lastTime: 0,
    bgLastTime: 0,
    timeScale: 1,           // per slow-motion
    timeScaleTarget: 1,
    chromAberration: 0,     // 0..1
    // Partida
    levelIdx: 0,
    score: 0,
    scoreDisplay: 0,        // valor animat
    lives: 3,
    combo: 1,
    comboMax: 1,
    spawnedCount: 0,
    spawnTimer: 0,
    radarAngle: 0,
    coreEnergyPulse: 0,
    screenShake: 0,
    // Stats
    shotsFired: 0,
    shotsHit: 0,
    noteStats: {},          // { DO: {hit, miss, totalReact, count}, ... }
    levelStartTime: 0,
    damageTaken: 0,
    // Power-ups
    powerups: { bomb: 0, shield: 0, slow: 0 },
    activeShield: 0,        // segons restants
    activeSlow: 0,          // segons restants
    // Entitats
    asteroids: [],
    lasers: [],
    particles: [],
    debris: [],
    floatingTexts: [],
    pickups: [],
    shockwaves: [],
    // Fons
    bgStars: [],
    bgPlanets: [],
    bgNebula: null,
    bgTime: 0
};

function resetNoteStats() {
    State.noteStats = {};
    NOTE_NAMES.forEach(n => {
        State.noteStats[n] = { hit: 0, miss: 0, totalReact: 0, spawned: 0, spawnTime: {} };
    });
}
resetNoteStats();

// ============================================================
// 5. PERSISTÈNCIA (localStorage)
// ============================================================

const Storage = {
    getProgress() {
        try {
            const raw = localStorage.getItem('orbita360_v2');
            if (!raw) return this._default();
            const data = JSON.parse(raw);
            return Object.assign(this._default(), data);
        } catch (e) { return this._default(); }
    },
    _default() {
        return {
            unlocked: 1,
            stars: {},          // levelIdx → 0..3
            achievements: [],   // ids desbloquejats
            totalKills: 0,
            highestCombo: 1
        };
    },
    save(data) {
        try { localStorage.setItem('orbita360_v2', JSON.stringify(data)); } catch (e) {}
    },
    update(fn) {
        const d = this.getProgress();
        fn(d);
        this.save(d);
        return d;
    }
};

// ============================================================
// 6. ÀUDIO PREMIUM (Web Audio API)
// ============================================================

const Audio = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    musicTimer: null,
    musicEnabled: true,

    init() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.65;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.85;
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.0;
        this.musicGain.connect(this.masterGain);
    },

    // === Nota piano-like via FM-synthesis ===
    playNote(noteName, vol = 0.35) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const f = NOTES[noteName].freq;

        // Carrier
        const car = this.ctx.createOscillator();
        car.type = 'sine';
        car.frequency.value = f;

        // Modulator (FM piano-ish)
        const mod = this.ctx.createOscillator();
        mod.type = 'sine';
        mod.frequency.value = f * 2.01;
        const modGain = this.ctx.createGain();
        modGain.gain.setValueAtTime(f * 3.5, t);
        modGain.gain.exponentialRampToValueAtTime(f * 0.3, t + 0.5);
        mod.connect(modGain).connect(car.frequency);

        // Harmònic 2 per brillantor
        const harm = this.ctx.createOscillator();
        harm.type = 'triangle';
        harm.frequency.value = f * 2;
        const harmGain = this.ctx.createGain();
        harmGain.gain.setValueAtTime(0.0001, t);
        harmGain.gain.exponentialRampToValueAtTime(vol * 0.18, t + 0.005);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

        // Envelope principal (ADSR pseudo-piano)
        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(vol, t + 0.005);
        env.gain.exponentialRampToValueAtTime(vol * 0.4, t + 0.12);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

        // Filtre passabaix per suavitzar
        const lpf = this.ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(4000, t);
        lpf.frequency.exponentialRampToValueAtTime(800, t + 0.8);

        car.connect(env);
        harm.connect(harmGain).connect(env);
        env.connect(lpf).connect(this.sfxGain);

        car.start(t); mod.start(t); harm.start(t);
        car.stop(t + 0.9); mod.stop(t + 0.9); harm.stop(t + 0.9);
    },

    // === Làser zap descendent ===
    playLaser() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const o2 = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(1400, t);
        o.frequency.exponentialRampToValueAtTime(180, t + 0.13);
        o2.type = 'square';
        o2.frequency.setValueAtTime(2800, t);
        o2.frequency.exponentialRampToValueAtTime(360, t + 0.13);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        o.connect(g); o2.connect(g);
        g.connect(this.sfxGain);
        o.start(t); o2.start(t);
        o.stop(t + 0.16); o2.stop(t + 0.16);
    },

    // === Explosió ===
    playExplosion() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.8);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, t);
        filter.frequency.exponentialRampToValueAtTime(150, t + 0.4);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        src.connect(filter).connect(g).connect(this.sfxGain);
        src.start(t);

        // Sub-bass thump
        const sub = this.ctx.createOscillator();
        const subG = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(120, t);
        sub.frequency.exponentialRampToValueAtTime(40, t + 0.2);
        subG.gain.setValueAtTime(0.4, t);
        subG.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        sub.connect(subG).connect(this.sfxGain);
        sub.start(t); sub.stop(t + 0.3);
    },

    // === Error de munició ===
    playError() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        for (let i = 0; i < 2; i++) {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'square';
            o.frequency.value = 110;
            g.gain.setValueAtTime(0.0001, t + i * 0.08);
            g.gain.exponentialRampToValueAtTime(0.18, t + i * 0.08 + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 0.07);
            o.connect(g).connect(this.sfxGain);
            o.start(t + i * 0.08);
            o.stop(t + i * 0.08 + 0.08);
        }
    },

    // === Dany ===
    playDamage() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(35, t + 0.6);
        g.gain.setValueAtTime(0.45, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o.connect(g).connect(this.sfxGain);
        o.start(t); o.stop(t + 0.62);
    },

    // === Power-up recollit ===
    playPickup() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        [440, 660, 880].forEach((f, i) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = f;
            const tt = t + i * 0.05;
            g.gain.setValueAtTime(0.0001, tt);
            g.gain.exponentialRampToValueAtTime(0.22, tt + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.18);
            o.connect(g).connect(this.sfxGain);
            o.start(tt); o.stop(tt + 0.2);
        });
    },

    // === Power-up activat ===
    playPowerActivate() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(120, t);
        o.frequency.exponentialRampToValueAtTime(880, t + 0.3);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.3, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        o.connect(g).connect(this.sfxGain);
        o.start(t); o.stop(t + 0.4);
    },

    // === EMP / Bomb ===
    playEMP() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.8, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.4);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(80, t + 0.7);
        filter.Q.value = 5;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.5, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        src.connect(filter).connect(g).connect(this.sfxGain);
        src.start(t);
    },

    // === Achievement jingle ===
    playAchievement() {
        if (!this.ctx) return;
        const seq = [523.25, 659.25, 783.99, 1046.50];
        const t0 = this.ctx.currentTime;
        seq.forEach((f, i) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = f;
            const t = t0 + i * 0.08;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
            o.connect(g).connect(this.sfxGain);
            o.start(t); o.stop(t + 0.27);
        });
    },

    // === Victòria ===
    playVictory() {
        if (!this.ctx) return;
        const seq = [261.63, 329.63, 392.00, 523.25, 659.25];
        const t0 = this.ctx.currentTime;
        seq.forEach((f, i) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = f;
            const t = t0 + i * 0.12;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
            o.connect(g).connect(this.sfxGain);
            o.start(t); o.stop(t + 0.37);
        });
    },

    // === Música ambient procedural ===
    startMusic() {
        if (!this.ctx || this.musicTimer) return;
        const ctx = this.ctx;
        // Pad d'acord (A minor 7)
        const chords = [
            [220.00, 261.63, 329.63, 392.00], // Am
            [196.00, 261.63, 311.13, 392.00], // G/B♭ pad
            [174.61, 220.00, 277.18, 349.23], // F-ish
            [195.99, 246.94, 293.66, 369.99]  // G
        ];
        let i = 0;
        const playChord = () => {
            const t = ctx.currentTime;
            const ch = chords[i % chords.length];
            i++;
            const dur = 4.0;
            ch.forEach(f => {
                const o = ctx.createOscillator();
                const o2 = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.value = f;
                o2.type = 'triangle';
                o2.frequency.value = f * 2;
                const lpf = ctx.createBiquadFilter();
                lpf.type = 'lowpass';
                lpf.frequency.value = 1200;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.06, t + 0.8);
                g.gain.setValueAtTime(0.06, t + dur - 1.2);
                g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
                o.connect(g); o2.connect(g);
                g.connect(lpf).connect(this.musicGain);
                o.start(t); o2.start(t);
                o.stop(t + dur + 0.2); o2.stop(t + dur + 0.2);
            });
            // Lleugera percussió subbass
            const sub = ctx.createOscillator();
            const subG = ctx.createGain();
            sub.type = 'sine';
            sub.frequency.value = 55;
            subG.gain.setValueAtTime(0.0001, t);
            subG.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
            subG.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
            sub.connect(subG).connect(this.musicGain);
            sub.start(t); sub.stop(t + 0.7);
        };
        playChord();
        this.musicTimer = setInterval(playChord, 4000);
        // Fade in
        this.musicGain.gain.cancelScheduledValues(ctx.currentTime);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.0);
    },

    stopMusic() {
        if (!this.ctx) return;
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.6);
    },

    duckMusic(amount = 0.3, dur = 0.5) {
        if (!this.ctx || !this.musicTimer) return;
        const t = this.ctx.currentTime;
        const target = 0.55 * amount;
        this.musicGain.gain.cancelScheduledValues(t);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
        this.musicGain.gain.linearRampToValueAtTime(target, t + 0.05);
        this.musicGain.gain.linearRampToValueAtTime(0.55, t + dur);
    }
};

// ============================================================
// 7. UTILS
// ============================================================

const rand = (a, b) => Math.random() * (b - a) + a;
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const choice = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

// ============================================================
// 8. FONS — PARALLAX 3 CAPES (canvas separat sempre actiu)
// ============================================================

function generateBackgroundLayers() {
    State.bgStars = [];
    // 3 capes amb diferents profunditats
    const counts = [120, 80, 50];
    const sizes  = [[0.4, 0.9], [0.8, 1.6], [1.4, 2.6]];
    const speeds = [4, 12, 24];
    counts.forEach((n, layer) => {
        for (let i = 0; i < n; i++) {
            State.bgStars.push({
                x: Math.random() * State.W,
                y: Math.random() * State.H,
                r: rand(sizes[layer][0], sizes[layer][1]),
                speed: speeds[layer] * rand(0.7, 1.3),
                twinkle: Math.random() * Math.PI * 2,
                layer,
                color: choice(['#cfe6ff', '#ffffff', '#bfd6ff', '#ffcfd6', '#d6cfff'])
            });
        }
    });

    // Planetes distants (1-2)
    State.bgPlanets = [];
    const planetCount = randInt(1, 2);
    for (let i = 0; i < planetCount; i++) {
        State.bgPlanets.push({
            x: rand(0, State.W),
            y: rand(0, State.H),
            r: rand(60, 140),
            speed: rand(2, 6),
            color1: choice(['#3a3060', '#2a4060', '#502a40', '#3a5060']),
            color2: choice(['#806080', '#6090a0', '#a06080', '#80a0c0']),
            phase: Math.random() * Math.PI * 2
        });
    }

    // Generar nebulosa procedural en un canvas off-screen
    State.bgNebula = generateNebulaCanvas();
}

function generateNebulaCanvas() {
    const W = State.W;
    const H = State.H;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const cx = c.getContext('2d');

    cx.fillStyle = '#000';
    cx.fillRect(0, 0, W, H);

    // Diversos nodes de gradient radial superposats
    const nodes = 18;
    const palette = [
        ['rgba(60, 30, 110, 0.55)', 'rgba(60, 30, 110, 0)'],
        ['rgba(30, 80, 130, 0.45)', 'rgba(30, 80, 130, 0)'],
        ['rgba(130, 50, 90, 0.38)', 'rgba(130, 50, 90, 0)'],
        ['rgba(20, 50, 90, 0.45)', 'rgba(20, 50, 90, 0)'],
        ['rgba(120, 80, 40, 0.30)', 'rgba(120, 80, 40, 0)']
    ];
    cx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < nodes; i++) {
        const x = rand(0, W);
        const y = rand(0, H);
        const r = rand(180, 480);
        const pal = choice(palette);
        const grad = cx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, pal[0]);
        grad.addColorStop(1, pal[1]);
        cx.fillStyle = grad;
        cx.beginPath();
        cx.arc(x, y, r, 0, Math.PI * 2);
        cx.fill();
    }

    // Capa de soroll subtil
    cx.globalCompositeOperation = 'overlay';
    const imgData = cx.getImageData(0, 0, W, H);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 18;
        d[i] = clamp(d[i] + n, 0, 255);
        d[i + 1] = clamp(d[i + 1] + n, 0, 255);
        d[i + 2] = clamp(d[i + 2] + n, 0, 255);
    }
    cx.putImageData(imgData, 0, 0);
    cx.globalCompositeOperation = 'source-over';

    return c;
}

function bgLoop(ts) {
    if (!State.bgLoopRunning) return;
    const dt = Math.min(0.05, (ts - State.bgLastTime) / 1000) || 0.016;
    State.bgLastTime = ts;
    State.bgTime += dt;

    const ctx = State.bgCtx;
    ctx.fillStyle = '#02060d';
    ctx.fillRect(0, 0, State.W, State.H);

    // Nebulosa amb deriva lenta
    if (State.bgNebula) {
        const offset = (State.bgTime * 6) % State.W;
        ctx.globalAlpha = 0.95;
        ctx.drawImage(State.bgNebula, -offset, 0);
        ctx.drawImage(State.bgNebula, State.W - offset, 0);
        ctx.globalAlpha = 1;
    }

    // Planetes
    for (const p of State.bgPlanets) {
        p.x -= p.speed * dt;
        if (p.x < -p.r * 1.5) p.x = State.W + p.r;

        // Disc atmosferic
        const grad = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r);
        grad.addColorStop(0, p.color2);
        grad.addColorStop(0.6, p.color1);
        grad.addColorStop(1, '#000');
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Anella subtil
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = p.color2;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * 1.4, p.r * 0.35, p.phase, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1;
    }

    // Estrelles (3 capes)
    for (const s of State.bgStars) {
        s.x -= s.speed * dt;
        if (s.x < -5) { s.x = State.W + 5; s.y = Math.random() * State.H; }
        s.twinkle += dt * 2.5;
        const tw = 0.55 + 0.45 * Math.abs(Math.sin(s.twinkle));
        ctx.globalAlpha = tw * (0.5 + s.layer * 0.25);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.layer === 2) {
            // Lluentor de les estrelles brillants
            ctx.shadowBlur = 6;
            ctx.shadowColor = s.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(bgLoop);
}

function startBackgroundLoop() {
    if (State.bgLoopRunning) return;
    State.bgLoopRunning = true;
    State.bgLastTime = performance.now();
    requestAnimationFrame(bgLoop);
}

// ============================================================
// 9. PARTÍCULES (millorades)
// ============================================================

function emitExplosion(x, y, color, intensity = 1) {
    const count = Math.floor(40 * intensity);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(80, 380) * intensity;
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: rand(0.5, 1.2),
            maxLife: 1.2,
            size: rand(2, 5),
            color, drag: 0.92, type: 'spark'
        });
    }
    // Espurnes blanques
    for (let i = 0; i < 14 * intensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(180, 480);
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: rand(0.2, 0.5),
            maxLife: 0.5,
            size: rand(1, 2.2),
            color: '#ffffff',
            drag: 0.88, type: 'spark'
        });
    }
    // Smoke (fum tènue)
    for (let i = 0; i < 8 * intensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(20, 60);
        State.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 30,
            life: rand(0.8, 1.4),
            maxLife: 1.4,
            size: rand(8, 14),
            color: '#444a55',
            drag: 0.96, type: 'smoke'
        });
    }
    // Shockwave
    State.shockwaves.push({
        x, y, r: 8, maxR: 90 * intensity,
        life: 0.45, maxLife: 0.45, color
    });
}

function emitDebris(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(120, 280);
        State.debris.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: rand(0.8, 1.5),
            maxLife: 1.5,
            size: rand(3, 7),
            color,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: rand(-8, 8),
            drag: 0.96,
            verts: 4 + Math.floor(Math.random() * 3)
        });
    }
}

function emitTrail(x, y, color) {
    State.particles.push({
        x: x + rand(-3, 3), y: y + rand(-3, 3),
        vx: rand(-15, 15), vy: rand(-15, 15),
        life: 0.55, maxLife: 0.55,
        size: rand(2.5, 5),
        color, drag: 0.92, type: 'trail'
    });
}

function emitDamageParticles(x, y) {
    for (let i = 0; i < 70; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = rand(120, 540);
        State.particles.push({
            x, y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s,
            life: rand(0.5, 1.3),
            maxLife: 1.3,
            size: rand(2, 5),
            color: choice(['#ff3858', '#ffaa44', '#ffffff', '#ff6688']),
            drag: 0.93, type: 'spark'
        });
    }
    State.shockwaves.push({
        x, y, r: 12, maxR: 220,
        life: 0.7, maxLife: 0.7, color: '#ff3858'
    });
}

function updateParticles(dt) {
    for (let i = State.particles.length - 1; i >= 0; i--) {
        const p = State.particles[i];
        p.life -= dt;
        if (p.life <= 0) { State.particles.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= p.drag;
        p.vy *= p.drag;
        if (p.type === 'smoke') p.size += dt * 12;
    }
    for (let i = State.debris.length - 1; i >= 0; i--) {
        const d = State.debris[i];
        d.life -= dt;
        if (d.life <= 0) { State.debris.splice(i, 1); continue; }
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vx *= d.drag;
        d.vy *= d.drag;
        d.rotation += d.rotSpeed * dt;
    }
    for (let i = State.shockwaves.length - 1; i >= 0; i--) {
        const s = State.shockwaves[i];
        s.life -= dt;
        if (s.life <= 0) { State.shockwaves.splice(i, 1); continue; }
        const t = 1 - s.life / s.maxLife;
        s.r = lerp(8, s.maxR, t);
    }
}

function drawParticles(ctx) {
    // Smoke primer (al fons)
    for (const p of State.particles) {
        if (p.type !== 'smoke') continue;
        const a = (p.life / p.maxLife) * 0.5;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    // Sparks i trails
    for (const p of State.particles) {
        if (p.type === 'smoke') continue;
        const a = p.life / p.maxLife;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.type === 'spark' ? 10 : 6;
        ctx.shadowColor = p.color;
        if (p.type === 'spark') {
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Debris
    for (const d of State.debris) {
        const a = clamp(d.life / d.maxLife, 0, 1);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);
        ctx.globalAlpha = a;
        ctx.fillStyle = d.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < d.verts; i++) {
            const ang = (i / d.verts) * Math.PI * 2;
            const r = d.size * (0.7 + Math.sin(i * 1.7) * 0.3);
            const x = Math.cos(ang) * r;
            const y = Math.sin(ang) * r;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    ctx.globalAlpha = 1;

    // Shockwaves
    for (const s of State.shockwaves) {
        const a = s.life / s.maxLife;
        ctx.globalAlpha = a * 0.85;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 4 * a;
        ctx.shadowBlur = 24;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.stroke();
        // Anella interior
        ctx.globalAlpha = a * 0.4;
        ctx.lineWidth = 2 * a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// ============================================================
// 10. ASTEROIDES
// ============================================================

function spawnAsteroid(noteName, speed, isEnergy = false) {
    const angle = Math.random() * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const halfW = State.W / 2, halfH = State.H / 2;
    const edgeX = Math.abs(cosA) > 0.0001 ? halfW / Math.abs(cosA) : Infinity;
    const edgeY = Math.abs(sinA) > 0.0001 ? halfH / Math.abs(sinA) : Infinity;
    const r = Math.min(edgeX, edgeY) + 100;
    const x = State.cx + cosA * r;
    const y = State.cy + sinA * r;
    const dx = State.cx - x;
    const dy = State.cy - y;
    const len = Math.hypot(dx, dy);
    const vx = (dx / len) * speed;
    const vy = (dy / len) * speed;

    const points = randInt(12, 16);
    const baseRadius = 52;
    const shape = [];
    for (let i = 0; i < points; i++) {
        shape.push(rand(baseRadius * 0.65, baseRadius * 1.35));
    }

    const ast = {
        x, y, vx, vy,
        note: noteName,
        radius: baseRadius,
        shape,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: rand(-0.6, 0.6),
        spawnTime: performance.now(),
        isEnergy,
        trailTimer: 0,
        id: Math.random()
    };
    State.asteroids.push(ast);

    // Stats
    if (State.noteStats[noteName]) {
        State.noteStats[noteName].spawned++;
        State.noteStats[noteName].spawnTime[ast.id] = ast.spawnTime;
    }
}

function updateAsteroids(dt) {
    for (let i = State.asteroids.length - 1; i >= 0; i--) {
        const a = State.asteroids[i];
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.rotation += a.rotSpeed * dt;
        a.trailTimer -= dt;
        if (a.trailTimer <= 0) {
            const c = NOTES[a.note].color;
            emitTrail(a.x - a.vx * 0.04, a.y - a.vy * 0.04, c);
            if (a.isEnergy) emitTrail(a.x - a.vx * 0.04, a.y - a.vy * 0.04, '#46ff8e');
            a.trailTimer = 0.04;
        }

        const d = dist(a.x, a.y, State.cx, State.cy);

        // Escut: si l'escut és actiu i l'asteroide arriba a r=80, es destrueix sense dany
        if (State.activeShield > 0 && d < 90 + a.radius * 0.4) {
            emitExplosion(a.x, a.y, '#00f0ff', 1.0);
            Audio.playExplosion();
            State.asteroids.splice(i, 1);
            continue;
        }

        // Impacte
        if (d < 40 + a.radius * 0.4) {
            emitDamageParticles(a.x, a.y);
            Audio.playDamage();
            Audio.duckMusic(0.3, 0.4);
            State.asteroids.splice(i, 1);
            State.lives--;
            State.combo = 1;
            State.screenShake = 22;
            State.chromAberration = 1;
            State.damageTaken++;

            // Stat: nota perduda
            if (State.noteStats[a.note]) {
                State.noteStats[a.note].miss++;
                delete State.noteStats[a.note].spawnTime[a.id];
            }

            const flash = document.getElementById('damage-flash');
            flash.classList.remove('flash');
            void flash.offsetWidth;
            flash.classList.add('flash');

            updateIntegrityRings();
            updateHUD();

            if (State.lives <= 0) { gameOver(); return; }
        }
    }
}

function drawAsteroid(ctx, a) {
    const noteData = NOTES[a.note];
    const dToCenter = dist(a.x, a.y, State.cx, State.cy);
    const danger = clamp(1 - dToCenter / 350, 0, 1);

    ctx.save();
    ctx.translate(a.x, a.y);

    // Halo extern (més intens si està a prop del centre)
    const haloR = a.radius * (1.6 + danger * 0.3);
    const haloGrad = ctx.createRadialGradient(0, 0, a.radius * 0.55, 0, 0, haloR);
    const haloAlpha = 0.4 + danger * 0.4;
    const colorHex = noteData.color;
    haloGrad.addColorStop(0, colorHex + Math.floor(haloAlpha * 255).toString(16).padStart(2, '0'));
    haloGrad.addColorStop(1, colorHex + '00');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Energy aura (verd) per asteroides especials
    if (a.isEnergy) {
        const eg = ctx.createRadialGradient(0, 0, a.radius * 0.5, 0, 0, a.radius * 1.4);
        eg.addColorStop(0, 'rgba(70, 255, 142, 0.55)');
        eg.addColorStop(1, 'rgba(70, 255, 142, 0)');
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(0, 0, a.radius * 1.4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Cos rocós
    ctx.rotate(a.rotation);

    // Forma base amb gradient
    ctx.beginPath();
    for (let i = 0; i < a.shape.length; i++) {
        const ang = (i / a.shape.length) * Math.PI * 2;
        const r = a.shape[i];
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const rockGrad = ctx.createRadialGradient(-a.radius * 0.3, -a.radius * 0.3, a.radius * 0.1, 0, 0, a.radius * 1.1);
    rockGrad.addColorStop(0, '#5a6878');
    rockGrad.addColorStop(0.5, '#2e3a46');
    rockGrad.addColorStop(1, '#0f161e');
    ctx.fillStyle = rockGrad;
    ctx.fill();

    // Textura rocosa interior (línies trencades)
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0; i<3; i++) {
        ctx.moveTo((Math.random()-0.5)*a.radius, (Math.random()-0.5)*a.radius);
        ctx.lineTo((Math.random()-0.5)*a.radius*1.5, (Math.random()-0.5)*a.radius*1.5);
    }
    ctx.stroke();

    // Vora brillant
    ctx.strokeStyle = noteData.color;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 16;
    ctx.shadowColor = noteData.color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Cràters millorats
    for (let i = 0; i < 5; i++) {
        const cAng = i * 1.4 + a.rotation * 0.1;
        const cR = a.radius * (0.4 + (i % 2) * 0.2);
        const cx = Math.cos(cAng) * cR;
        const cy = Math.sin(cAng) * cR;
        const craterRad = a.radius * (0.1 + (i % 3) * 0.05);
        
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy, craterRad, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, craterRad, Math.PI, Math.PI * 2);
        ctx.stroke();
    }

    // Highlight superior
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(-a.radius * 0.2, -a.radius * 0.4, a.radius * 0.5, a.radius * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pentagrama (contra-rotat)
    ctx.rotate(-a.rotation);
    drawStaffWithNote(ctx, 0, 0, a.radius * 1.7, a.note);

    ctx.restore();
}

// ============================================================
// 11. PENTAGRAMA AMB NOTA
// ============================================================

function drawStaffWithNote(ctx, cx, cy, width, noteName) {
    const note = NOTES[noteName];
    const w = width;
    const h = w * 0.55;
    const lineGap = h / 6;
    const left = cx - w / 2;
    const right = cx + w / 2;
    const bottomLineY = cy + lineGap * 1.5;

    // Fons del pentagrama hologràfic fosc
    ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
    ctx.beginPath();
    ctx.roundRect(left - 4, bottomLineY - lineGap * 4 - 4, w + 8, lineGap * 4 + 8, 8);
    ctx.fill();

    // Marc brillant depenent del color de la nota
    ctx.strokeStyle = note.color;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = note.color;
    ctx.strokeRect(left - 4, bottomLineY - lineGap * 4 - 4, w + 8, lineGap * 4 + 8);
    ctx.shadowBlur = 0;

    // 5 línies del pentagrama (blanques i brillants)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
        const y = bottomLineY - i * lineGap;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();
    }

    // Clau de Sol
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const clefX = left + lineGap * 0.6;
    ctx.moveTo(clefX, bottomLineY + lineGap * 0.7);
    ctx.bezierCurveTo(
        clefX + lineGap * 1.2, bottomLineY,
        clefX + lineGap * 1.5, bottomLineY - lineGap * 2.2,
        clefX, bottomLineY - lineGap * 3.2
    );
    ctx.bezierCurveTo(
        clefX - lineGap * 0.9, bottomLineY - lineGap * 3.7,
        clefX - lineGap * 0.7, bottomLineY - lineGap * 1.4,
        clefX + lineGap * 0.5, bottomLineY - lineGap * 1.4
    );
    ctx.stroke();
    ctx.lineCap = 'butt';

    // Posició de la nota
    const noteY = bottomLineY + note.staffY * lineGap;
    const noteX = cx + lineGap * 1.4;

    // Línia addicional per al DO
    if (noteName === 'DO') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(noteX - lineGap * 0.8, noteY);
        ctx.lineTo(noteX + lineGap * 0.8, noteY);
        ctx.stroke();
    }

    // Cap de la nota (brillant amb el color de la nota)
    ctx.fillStyle = note.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = note.color;
    ctx.save();
    ctx.translate(noteX, noteY);
    ctx.rotate(-0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, lineGap * 0.6, lineGap * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;

    // Plica
    ctx.strokeStyle = note.color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (note.staffY > -1) {
        ctx.moveTo(noteX + lineGap * 0.5, noteY - lineGap * 0.1);
        ctx.lineTo(noteX + lineGap * 0.5, noteY - lineGap * 3);
    } else {
        ctx.moveTo(noteX - lineGap * 0.5, noteY + lineGap * 0.1);
        ctx.lineTo(noteX - lineGap * 0.5, noteY + lineGap * 3);
    }
    ctx.stroke();
}

// ============================================================
// 12. LÀSERS
// ============================================================

function fireLaser(noteName, isAuto = false) {
    State.shotsFired++;

    // Buscar asteroide d'aquest tipus més proper
    let target = null, minDist = Infinity;
    for (const a of State.asteroids) {
        if (a.note !== noteName) continue;
        const d = dist(a.x, a.y, State.cx, State.cy);
        if (d < minDist) { minDist = d; target = a; }
    }

    if (!target) {
        Audio.playError();
        const btn = document.querySelector(`.note-btn[data-note="${noteName}"]`);
        if (btn) {
            btn.classList.remove('error');
            void btn.offsetWidth;
            btn.classList.add('error');
        }
        State.combo = 1;
        if (State.noteStats[noteName]) State.noteStats[noteName].miss++;
        updateHUD();
        return;
    }

    State.shotsHit++;
    State.lasers.push({
        x1: State.cx, y1: State.cy,
        x2: target.x, y2: target.y,
        life: 0.18, maxLife: 0.18,
        color: NOTES[noteName].color,
        glow: NOTES[noteName].glow
    });

    Audio.playLaser();
    Audio.playNote(noteName);

    emitExplosion(target.x, target.y, NOTES[noteName].color, 1.25);
    emitDebris(target.x, target.y, NOTES[noteName].color, 7);
    Audio.playExplosion();
    State.coreEnergyPulse = 1;

    // Slow-mo si l'asteroide és molt a prop del nucli (save crític)
    const distToCenter = dist(target.x, target.y, State.cx, State.cy);
    if (distToCenter < 130 && !isAuto) {
        State.timeScaleTarget = 0.35;
        setTimeout(() => { State.timeScaleTarget = 1; }, 250);
    }

    // Stat per nota: temps de reacció
    if (State.noteStats[noteName]) {
        const stats = State.noteStats[noteName];
        stats.hit++;
        const spawnT = stats.spawnTime[target.id];
        if (spawnT) {
            stats.totalReact += (performance.now() - spawnT) / 1000;
            delete stats.spawnTime[target.id];
        }
    }

    const idx = State.asteroids.indexOf(target);
    if (idx >= 0) State.asteroids.splice(idx, 1);

    // Power-up drop
    if (target.isEnergy) {
        spawnPickup(target.x, target.y);
    }

    // Puntuació amb combo
    const points = 100 * State.combo;
    State.score += points;
    addFloatingText(target.x, target.y, `+${points}`, NOTES[noteName].color);
    State.combo = Math.min(State.combo + 1, 99);
    State.comboMax = Math.max(State.comboMax, State.combo);

    // Achievements
    if (State.combo >= 10) checkAchievement('combo_10');
    if (State.combo >= 25) checkAchievement('combo_25');
    if (State.combo >= 50) checkAchievement('combo_50');
    checkAchievement('first_kill');

    // Total kills
    Storage.update(p => {
        p.totalKills = (p.totalKills || 0) + 1;
        if (p.totalKills >= 100) checkAchievement('kills_100');
        if (p.totalKills >= 500) checkAchievement('kills_500');
        if (State.combo > (p.highestCombo || 1)) p.highestCombo = State.combo;
    });

    updateHUD();
    pulseCombo();
}

function updateLasers(dt) {
    for (let i = State.lasers.length - 1; i >= 0; i--) {
        const l = State.lasers[i];
        l.life -= dt;
        if (l.life <= 0) State.lasers.splice(i, 1);
    }
}

function drawLasers(ctx) {
    for (const l of State.lasers) {
        const a = l.life / l.maxLife;
        ctx.globalAlpha = a;
        // Halo extern
        ctx.strokeStyle = l.glow;
        ctx.lineWidth = 12;
        ctx.shadowBlur = 30;
        ctx.shadowColor = l.glow;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        // Centre
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 18;
        ctx.shadowColor = l.color;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        // Nucli blanc
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
    }
    ctx.lineCap = 'butt';
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// ============================================================
// 13. FLOATING TEXTS
// ============================================================

function addFloatingText(x, y, text, color, size = 18) {
    State.floatingTexts.push({
        x, y, text, color, life: 1.0, maxLife: 1.0,
        vy: -55, size
    });
}

function updateFloatingTexts(dt) {
    for (let i = State.floatingTexts.length - 1; i >= 0; i--) {
        const f = State.floatingTexts[i];
        f.y += f.vy * dt;
        f.vy *= 0.94;
        f.life -= dt;
        if (f.life <= 0) State.floatingTexts.splice(i, 1);
    }
}

function drawFloatingTexts(ctx) {
    ctx.textAlign = 'center';
    for (const f of State.floatingTexts) {
        const a = f.life / f.maxLife;
        ctx.globalAlpha = a;
        ctx.font = `bold ${f.size}px Orbitron, sans-serif`;
        ctx.fillStyle = f.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = f.color;
        ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// ============================================================
// 14. POWER-UPS (drops + activació)
// ============================================================

const PICKUP_TYPES = ['bomb', 'shield', 'slow'];

function spawnPickup(x, y) {
    const type = choice(PICKUP_TYPES);
    State.pickups.push({
        x, y, vx: 0, vy: 0,
        type,
        life: 8,
        maxLife: 8,
        rotation: 0,
        bobPhase: Math.random() * Math.PI * 2,
        autoCollectTimer: 1.5
    });
}

function updatePickups(dt) {
    for (let i = State.pickups.length - 1; i >= 0; i--) {
        const p = State.pickups[i];
        p.life -= dt;
        p.rotation += dt * 1.8;
        p.bobPhase += dt * 3;
        if (p.life <= 0) {
            State.pickups.splice(i, 1);
            continue;
        }
        // Auto-pull cap al nucli després d'un moment
        p.autoCollectTimer -= dt;
        if (p.autoCollectTimer <= 0) {
            const dx = State.cx - p.x;
            const dy = State.cy - p.y;
            const len = Math.hypot(dx, dy) || 1;
            p.vx += (dx / len) * 350 * dt;
            p.vy += (dy / len) * 350 * dt;
            p.vx *= 0.94; p.vy *= 0.94;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            // Recollir si arriba al nucli
            if (Math.hypot(dx, dy) < 50) {
                collectPickup(p);
                State.pickups.splice(i, 1);
            }
        }
    }
}

function collectPickup(p) {
    State.powerups[p.type] = Math.min(9, State.powerups[p.type] + 1);
    Audio.playPickup();
    addFloatingText(State.cx, State.cy - 60, `+1 ${p.type.toUpperCase()}`, '#46ff8e', 16);
    updatePowerUpHUD();
}

function drawPickups(ctx) {
    for (const p of State.pickups) {
        const bob = Math.sin(p.bobPhase) * 4;
        const lifeT = clamp(p.life / p.maxLife, 0, 1);
        const flash = p.life < 2 ? (Math.sin(p.life * 12) > 0 ? 1 : 0.4) : 1;
        const colors = { bomb: '#ff5577', shield: '#33aaff', slow: '#ff45c8' };
        const icons = { bomb: '💥', shield: '🛡', slow: '⏳' };
        const c = colors[p.type];
        ctx.save();
        ctx.translate(p.x, p.y + bob);
        ctx.rotate(p.rotation);

        // Halo
        const haloGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 32);
        haloGrad.addColorStop(0, c + 'aa');
        haloGrad.addColorStop(1, c + '00');
        ctx.fillStyle = haloGrad;
        ctx.globalAlpha = flash * lifeT;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();

        // Capsula hexagonal
        ctx.strokeStyle = c;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 16;
        ctx.shadowColor = c;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const x = Math.cos(a) * 18;
            const y = Math.sin(a) * 18;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Icona (text emoji, sense rotació)
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.globalAlpha = flash * lifeT;
        ctx.fillStyle = '#fff';
        ctx.fillText(icons[p.type], p.x, p.y + bob);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

function activatePowerUp(type) {
    if (State.paused || State.screen !== 'gameplay') return;
    if (!State.powerups[type] || State.powerups[type] <= 0) {
        Audio.playError();
        return;
    }
    State.powerups[type]--;
    updatePowerUpHUD();
    Audio.playPowerActivate();

    if (type === 'bomb') {
        // Destrueix tots els asteroides a pantalla
        Audio.playEMP();
        State.shockwaves.push({
            x: State.cx, y: State.cy, r: 20, maxR: Math.max(State.W, State.H),
            life: 1.0, maxLife: 1.0, color: '#00f0ff'
        });
        for (const a of State.asteroids) {
            emitExplosion(a.x, a.y, NOTES[a.note].color, 1.0);
            emitDebris(a.x, a.y, NOTES[a.note].color, 5);
            // No compta com a hit per stats (és bomba); però mantenim puntuació mínima
            State.score += 50;
            addFloatingText(a.x, a.y, '+50', '#00f0ff', 14);
        }
        State.asteroids = [];
        State.screenShake = 18;
        checkAchievement('use_bomb');
    } else if (type === 'shield') {
        State.activeShield = 5.0;
        addFloatingText(State.cx, State.cy - 70, 'ESCUT ACTIU', '#33aaff', 18);
        checkAchievement('use_shield');
    } else if (type === 'slow') {
        State.activeSlow = 4.0;
        addFloatingText(State.cx, State.cy - 70, 'SLOW-TIME ACTIU', '#ff45c8', 18);
        checkAchievement('use_slow');
    }
    updateHUD();
}

// ============================================================
// 15. NUCLI + ESCUT VISUAL
// ============================================================

function drawCore(ctx) {
    const t = performance.now() / 250;
    const pulse = Math.sin(t) * 0.08 + 1;
    const energy = State.coreEnergyPulse;
    const baseR = 32 * pulse + energy * 14;

    // Halo ample
    const haloR = baseR * 2.8;
    const haloGrad = ctx.createRadialGradient(State.cx, State.cy, baseR * 0.8, State.cx, State.cy, haloR);
    haloGrad.addColorStop(0, 'rgba(0, 240, 255, 0.55)');
    haloGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.2)');
    haloGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(State.cx, State.cy, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Anelles segmentades de salut
    drawHealthRings(ctx, baseR);

    // Si hi ha escut, dibuixar bombolla
    if (State.activeShield > 0) {
        const shA = clamp(State.activeShield / 5, 0, 1);
        const shR = baseR + 60 + Math.sin(t * 2) * 4;
        ctx.strokeStyle = '#33aaff';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#33aaff';
        ctx.globalAlpha = 0.6 + shA * 0.4;
        ctx.beginPath();
        ctx.arc(State.cx, State.cy, shR, 0, Math.PI * 2);
        ctx.stroke();
        // Patró hexagonal
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.25 + shA * 0.2;
        for (let i = 0; i < 12; i++) {
            const a1 = (i / 12) * Math.PI * 2 + t * 0.3;
            const a2 = a1 + 0.18;
            ctx.beginPath();
            ctx.arc(State.cx, State.cy, shR, a1, a2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    // Anella exterior fixa
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    ctx.arc(State.cx, State.cy, baseR + 10, 0, Math.PI * 2);
    ctx.stroke();

    // Cor del nucli (gradient)
    const coreGrad = ctx.createRadialGradient(State.cx, State.cy, 0, State.cx, State.cy, baseR);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, '#bafaff');
    coreGrad.addColorStop(0.7, '#00f0ff');
    coreGrad.addColorStop(1, '#0080a0');
    ctx.fillStyle = coreGrad;
    ctx.shadowBlur = 35;
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    ctx.arc(State.cx, State.cy, baseR, 0, Math.PI * 2);
    ctx.fill();

    // Línies energètiques rotants
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    const inner = baseR * 0.4;
    const outer = baseR * 0.85;
    for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + t * 0.6;
        ctx.beginPath();
        ctx.moveTo(State.cx + Math.cos(ang) * inner, State.cy + Math.sin(ang) * inner);
        ctx.lineTo(State.cx + Math.cos(ang) * outer, State.cy + Math.sin(ang) * outer);
        ctx.stroke();
    }

    // Plasma intern (taques brillants)
    for (let i = 0; i < 3; i++) {
        const a = t * (1 + i * 0.4) + i;
        const x = State.cx + Math.cos(a) * baseR * 0.3;
        const y = State.cy + Math.sin(a) * baseR * 0.3;
        const pg = ctx.createRadialGradient(x, y, 0, x, y, baseR * 0.4);
        pg.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        pg.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(x, y, baseR * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.shadowBlur = 0;
}

function drawHealthRings(ctx, baseR) {
    const ringR = baseR + 26;
    const segments = 3;
    const t = performance.now() / 1000;
    for (let i = 0; i < segments; i++) {
        const active = i < State.lives;
        const a1 = (i / segments) * Math.PI * 2 - Math.PI / 2 + 0.05;
        const a2 = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2 - 0.05;
        ctx.lineWidth = 4;
        if (active) {
            ctx.strokeStyle = '#46ff8e';
            ctx.shadowBlur = 14;
            ctx.shadowColor = '#46ff8e';
            ctx.globalAlpha = 0.85 + Math.sin(t * 2 + i) * 0.15;
        } else {
            ctx.strokeStyle = 'rgba(255, 56, 88, 0.3)';
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ff3858';
            ctx.globalAlpha = 0.4;
        }
        ctx.beginPath();
        ctx.arc(State.cx, State.cy, ringR, a1, a2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// ============================================================
// 16. RADAR (al canvas de joc)
// ============================================================

function drawRadar(ctx) {
    const r = Math.min(State.W, State.H) * 0.46;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(State.cx, State.cy, r * (i / 4), 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(State.cx - r, State.cy);
    ctx.lineTo(State.cx + r, State.cy);
    ctx.moveTo(State.cx, State.cy - r);
    ctx.lineTo(State.cx, State.cy + r);
    ctx.stroke();

    // Sweep
    ctx.save();
    ctx.translate(State.cx, State.cy);
    ctx.rotate(State.radarAngle);
    const sweepAngle = 0.45;
    const arc = ctx.createLinearGradient(0, 0, r, 0);
    arc.addColorStop(0, 'rgba(70, 255, 142, 0.0)');
    arc.addColorStop(0.7, 'rgba(70, 255, 142, 0.18)');
    arc.addColorStop(1, 'rgba(70, 255, 142, 0.5)');
    ctx.fillStyle = arc;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, -sweepAngle / 2, sweepAngle / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(70, 255, 142, 0.85)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#46ff8e';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
}

// ============================================================
// 17. INDICADORS DIRECCIONALS
// ============================================================

function updateDirectionIndicators() {
    const container = document.getElementById('direction-indicators');
    if (!container) return;
    const margin = 40;
    // Recopilar asteroides off-screen
    const offscreen = State.asteroids.filter(a => {
        return a.x < -50 || a.x > State.W + 50 || a.y < -50 || a.y > State.H + 50;
    });

    // Crear/actualitzar arrows
    let arrows = container.querySelectorAll('.dir-arrow');

    // Ajustar nombre d'elements
    while (arrows.length < offscreen.length) {
        const div = document.createElement('div');
        div.className = 'dir-arrow';
        div.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 2 L22 18 L12 14 L2 18 Z" fill="currentColor" stroke="#fff" stroke-width="0.6"/>
            </svg>`;
        container.appendChild(div);
        arrows = container.querySelectorAll('.dir-arrow');
    }
    while (arrows.length > offscreen.length) {
        arrows[arrows.length - 1].remove();
        arrows = container.querySelectorAll('.dir-arrow');
    }

    // Posicionar
    offscreen.forEach((a, i) => {
        const arrow = arrows[i];
        const dx = a.x - State.cx;
        const dy = a.y - State.cy;
        const angle = Math.atan2(dy, dx);
        // Intersecció del rectangle interior
        const halfW = State.W / 2 - margin;
        const halfH = State.H / 2 - margin;
        const tx = Math.abs(Math.cos(angle)) > 0.0001 ? halfW / Math.abs(Math.cos(angle)) : Infinity;
        const ty = Math.abs(Math.sin(angle)) > 0.0001 ? halfH / Math.abs(Math.sin(angle)) : Infinity;
        const ed = Math.min(tx, ty);
        const sx = State.cx + Math.cos(angle) * ed - 14;
        const sy = State.cy + Math.sin(angle) * ed - 14;
        arrow.style.left = sx + 'px';
        arrow.style.top = sy + 'px';
        arrow.style.color = NOTES[a.note].color;
        arrow.style.transform = `rotate(${angle + Math.PI / 2}rad)`;
        arrow.style.opacity = '0.9';
    });
}

// ============================================================
// 18. BLOOM (post-processament)
// ============================================================

function applyBloom(ctx) {
    if (!State.bloomCanvas) return;
    const bc = State.bloomCtx;
    const bw = State.bloomCanvas.width;
    const bh = State.bloomCanvas.height;
    bc.clearRect(0, 0, bw, bh);
    // Bloom a mitja resolució per rendiment
    bc.globalCompositeOperation = 'source-over';
    bc.filter = 'blur(8px) brightness(1.5)';
    bc.drawImage(State.canvas, 0, 0, State.W, State.H, 0, 0, bw, bh);
    bc.filter = 'none';
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.6;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(State.bloomCanvas, 0, 0, bw, bh, 0, 0, State.W, State.H);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
}

// ============================================================
// 19. BUCLE PRINCIPAL
// ============================================================

function loop(ts) {
    if (!State.running) return;
    let dt = Math.min(0.05, (ts - State.lastTime) / 1000) || 0.016;
    State.lastTime = ts;

    // Easing del timeScale
    State.timeScale = lerp(State.timeScale, State.timeScaleTarget, 1 - Math.pow(0.001, dt));
    let scaledDt = dt * State.timeScale;
    if (State.activeSlow > 0) scaledDt *= 0.5;

    if (!State.paused) update(scaledDt);
    render();

    requestAnimationFrame(loop);
}

function update(dt) {
    const lvl = LEVELS[State.levelIdx];
    State.spawnTimer -= dt * 1000;
    if (State.spawnedCount < lvl.total &&
        State.asteroids.length < lvl.simul &&
        State.spawnTimer <= 0) {
        const note = choice(lvl.notes);
        // 12% probabilitat d'asteroide energètic (conté power-up)
        const isEnergy = Math.random() < 0.12 && State.spawnedCount > 2;
        spawnAsteroid(note, lvl.speed, isEnergy);
        State.spawnedCount++;
        State.spawnTimer = lvl.interval + rand(-180, 180);
        updateHUD();
    }

    updateAsteroids(dt);
    updateLasers(dt);
    updateParticles(dt);
    updateFloatingTexts(dt);
    updatePickups(dt);

    State.radarAngle += dt * 1.2;
    State.coreEnergyPulse = Math.max(0, State.coreEnergyPulse - dt * 3);
    State.screenShake = Math.max(0, State.screenShake - dt * 60);
    State.chromAberration = Math.max(0, State.chromAberration - dt * 1.8);

    if (State.activeShield > 0) State.activeShield = Math.max(0, State.activeShield - dt);
    if (State.activeSlow > 0) State.activeSlow = Math.max(0, State.activeSlow - dt);

    // Score animat
    State.scoreDisplay = lerp(State.scoreDisplay, State.score, 1 - Math.pow(0.001, dt));
    if (State.score - State.scoreDisplay < 1) State.scoreDisplay = State.score;

    // Indicadors direccionals
    updateDirectionIndicators();

    // Comprovar victòria
    if (State.spawnedCount >= lvl.total &&
        State.asteroids.length === 0 &&
        State.lives > 0) {
        victory();
    }
}

function render() {
    const ctx = State.ctx;
    ctx.save();

    // Screen shake
    if (State.screenShake > 0) {
        ctx.translate(rand(-State.screenShake, State.screenShake),
                      rand(-State.screenShake, State.screenShake));
    }

    // Net (fons gradient sobre el bg-canvas que ja és rere)
    ctx.clearRect(-100, -100, State.W + 200, State.H + 200);
    const bg = ctx.createRadialGradient(State.cx, State.cy, 0, State.cx, State.cy, Math.max(State.W, State.H) * 0.7);
    bg.addColorStop(0, 'rgba(4, 16, 26, 0.0)');
    bg.addColorStop(0.7, 'rgba(2, 8, 14, 0.4)');
    bg.addColorStop(1, 'rgba(0, 0, 5, 0.85)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, State.W, State.H);

    drawRadar(ctx);
    for (const a of State.asteroids) drawAsteroid(ctx, a);
    drawPickups(ctx);
    drawLasers(ctx);
    drawCore(ctx);
    drawParticles(ctx);
    drawFloatingTexts(ctx);

    ctx.restore();

    // Post-processament
    applyBloom(ctx);
}

// ============================================================
// 20. INPUT
// ============================================================

function handleNotePress(noteName) {
    if (State.screen !== 'gameplay' || State.paused) return;
    Audio.init();
    fireLaser(noteName);
    const btn = document.querySelector(`.note-btn[data-note="${noteName}"]`);
    if (btn) {
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 110);
    }
}

function setupInput() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && State.screen === 'gameplay') {
            togglePause();
            return;
        }
        const k = e.key.toLowerCase();
        const codeMap = {
            'Digit1': 'DO', 'Numpad1': 'DO',
            'Digit2': 'RE', 'Numpad2': 'RE',
            'Digit3': 'MI', 'Numpad3': 'MI',
            'Digit4': 'FA', 'Numpad4': 'FA',
            'Digit5': 'SOL', 'Numpad5': 'SOL',
            'Digit6': 'LA', 'Numpad6': 'LA',
            'Digit7': 'SI', 'Numpad7': 'SI'
        };
        const note = KEY_TO_NOTE[e.key] || codeMap[e.code];
        if (note) { e.preventDefault(); handleNotePress(note); return; }
        if (k === 'q') { e.preventDefault(); activatePowerUp('bomb'); }
        else if (k === 'w') { e.preventDefault(); activatePowerUp('shield'); }
        else if (k === 'e') { e.preventDefault(); activatePowerUp('slow'); }
    });

    document.querySelectorAll('.note-btn').forEach(btn => {
        btn.addEventListener('click', () => handleNotePress(btn.dataset.note));
    });
    document.querySelectorAll('.pu-btn').forEach(btn => {
        btn.addEventListener('click', () => activatePowerUp(btn.dataset.pu));
    });
    document.querySelectorAll('[data-action]').forEach(el => {
        el.addEventListener('click', () => doAction(el.dataset.action));
    });
    document.getElementById('hud-pause').addEventListener('click', togglePause);

    // Pausa automàtica al perdre focus
    window.addEventListener('blur', () => {
        if (State.screen === 'gameplay' && !State.paused) togglePause();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && State.screen === 'gameplay' && !State.paused) togglePause();
    });
}

// ============================================================
// 21. ACCIONS
// ============================================================

function doAction(action) {
    Audio.init();
    switch (action) {
        case 'goto-landing':       showScreen('landing'); break;
        case 'goto-tutorial':      showScreen('tutorial'); break;
        case 'goto-levels':        showScreen('levels'); renderLevelGrid(); stopGame(); break;
        case 'goto-database':      showScreen('database'); renderDatabase(); break;
        case 'goto-achievements':  showScreen('achievements'); renderAchievements(); break;
        case 'resume':             togglePause(); break;
        case 'restart':            startLevel(State.levelIdx); break;
        case 'next-level':
            if (State.levelIdx + 1 < LEVELS.length) startLevel(State.levelIdx + 1);
            else { showScreen('levels'); renderLevelGrid(); }
            break;
        case 'reset-progress':
            if (confirm('Segur que vols esborrar tot el progrés?')) {
                localStorage.removeItem('orbita360_v2');
                renderLevelGrid();
            }
            break;
    }
}

// ============================================================
// 22. PANTALLES
// ============================================================

function showScreen(name) {
    if (State.screen === 'gameplay' && name !== 'gameplay') {
        stopGame();
        Audio.stopMusic();
    }
    State.screen = name;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(name);
    if (el) el.classList.add('active');
    document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
}

// ============================================================
// 23. GRAELLES (NIVELLS, DB, ACHIEVEMENTS)
// ============================================================

function renderLevelGrid() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';
    const prog = Storage.getProgress();
    const completedCount = Object.keys(prog.stars).filter(k => prog.stars[k] > 0).length;
    document.getElementById('progress-counter').textContent = `${completedCount} / ${LEVELS.length}`;

    LEVELS.forEach((lvl, i) => {
        const card = document.createElement('div');
        card.className = 'level-card';
        const locked = (i + 1) > prog.unlocked;
        const stars = prog.stars[i] || 0;
        if (locked) card.classList.add('locked');
        card.innerHTML = `
            <span class="level-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="level-name">${lvl.name}</span>
            <div class="level-stars">
                <span class="s${stars >= 1 ? ' on' : ''}">★</span>
                <span class="s${stars >= 2 ? ' on' : ''}">★</span>
                <span class="s${stars >= 3 ? ' on' : ''}">★</span>
            </div>
        `;
        if (!locked) card.addEventListener('click', () => startLevel(i));
        grid.appendChild(card);
    });
}

function renderDatabase() {
    const container = document.getElementById('db-notes');
    if (container.dataset.rendered) return;
    container.dataset.rendered = '1';
    NOTE_NAMES.forEach(n => {
        const card = document.createElement('div');
        card.className = 'db-note-card';
        const cv = document.createElement('canvas');
        cv.width = 140; cv.height = 86;
        const c2 = cv.getContext('2d');
        drawStaffWithNote(c2, 70, 43, 116, n);
        card.appendChild(cv);
        const lab = document.createElement('div');
        lab.className = 'nm';
        lab.textContent = n;
        card.appendChild(lab);
        const kb = document.createElement('div');
        kb.className = 'kb';
        kb.textContent = `Tecla: ${NOTES[n].key} · ${NOTES[n].freq.toFixed(2)} Hz`;
        card.appendChild(kb);
        card.addEventListener('click', () => {
            Audio.init();
            Audio.playNote(n, 0.4);
        });
        container.appendChild(card);
    });
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = '';
    const prog = Storage.getProgress();
    const unlocked = new Set(prog.achievements || []);
    document.getElementById('ach-counter').textContent = `${unlocked.size} / ${ACHIEVEMENTS.length}`;
    ACHIEVEMENTS.forEach(a => {
        const card = document.createElement('div');
        card.className = 'ach-card ' + (unlocked.has(a.id) ? 'unlocked' : 'locked');
        card.innerHTML = `
            <div class="ach-icon">${unlocked.has(a.id) ? a.icon : '🔒'}</div>
            <div class="ach-info">
                <div class="ach-name">${a.name}</div>
                <div class="ach-desc">${a.desc}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ============================================================
// 24. CICLE DE PARTIDA
// ============================================================

function startLevel(idx) {
    State.levelIdx = idx;
    State.score = 0;
    State.scoreDisplay = 0;
    State.lives = 3;
    State.combo = 1;
    State.comboMax = 1;
    State.spawnedCount = 0;
    State.spawnTimer = 1000;
    State.shotsFired = 0;
    State.shotsHit = 0;
    State.damageTaken = 0;
    State.timeScale = 1;
    State.timeScaleTarget = 1;
    State.activeShield = 0;
    State.activeSlow = 0;
    State.powerups = { bomb: 0, shield: 0, slow: 0 };
    State.asteroids = [];
    State.lasers = [];
    State.particles = [];
    State.debris = [];
    State.shockwaves = [];
    State.floatingTexts = [];
    State.pickups = [];
    State.paused = false;
    resetNoteStats();
    State.levelStartTime = performance.now();

    showScreen('gameplay');
    resizeCanvas();
    Audio.init();
    Audio.startMusic();
    updateHUD();
    updateIntegrityRings();
    updatePowerUpHUD();

    if (!State.running) {
        State.running = true;
        State.lastTime = performance.now();
        requestAnimationFrame(loop);
    }
}

function stopGame() {
    State.running = false;
    State.asteroids = [];
    State.lasers = [];
    State.particles = [];
    State.debris = [];
    State.shockwaves = [];
    State.floatingTexts = [];
    State.pickups = [];
    // Buidar indicadors
    const dc = document.getElementById('direction-indicators');
    if (dc) dc.innerHTML = '';
}

function togglePause() {
    if (State.screen !== 'gameplay') return;
    if (document.getElementById('gameover-overlay').classList.contains('active')) return;
    if (document.getElementById('victory-overlay').classList.contains('active')) return;
    State.paused = !State.paused;
    document.getElementById('pause-overlay').classList.toggle('active', State.paused);
}

function gameOver() {
    State.paused = true;
    Audio.stopMusic();
    document.getElementById('go-score').textContent = Math.floor(State.score).toLocaleString();
    document.getElementById('gameover-overlay').classList.add('active');
}

function victory() {
    State.paused = true;
    Audio.playVictory();

    // Calcular precisió i estrelles
    const accuracy = State.shotsFired > 0 ? State.shotsHit / State.shotsFired : 1;
    const noDamage = State.damageTaken === 0;
    const noMiss = (State.shotsFired === State.shotsHit);

    let stars = 1;
    if (accuracy >= 0.85) stars = 2;
    if (accuracy >= 0.95 && noDamage) stars = 3;
    // Bonus segons combo
    if (State.comboMax >= 25 && stars < 3) stars = Math.min(3, stars + 1);

    // Achievements
    if (noDamage) checkAchievement('no_damage');
    if (noMiss && State.shotsFired > 0) checkAchievement('no_miss');
    if (stars === 3) checkAchievement('three_star');
    if (State.levelIdx === 0) checkAchievement('level_1');
    if (State.levelIdx === 9) checkAchievement('level_10');
    if (State.levelIdx === 19) checkAchievement('level_20');

    // Persistir
    Storage.update(p => {
        p.stars[State.levelIdx] = Math.max(p.stars[State.levelIdx] || 0, stars);
        p.unlocked = Math.max(p.unlocked, State.levelIdx + 2);
        // All-three bonus
        const allThree = LEVELS.every((_, i) => (p.stars[i] || 0) >= 3);
        if (allThree) checkAchievement('all_three');
    });

    // UI resultats
    document.getElementById('vc-score').textContent = Math.floor(State.score).toLocaleString();
    document.getElementById('vc-combo').textContent = 'x' + State.comboMax;
    document.getElementById('vc-accuracy').textContent = Math.round(accuracy * 100) + '%';

    // Reacció mitjana global
    let totalReact = 0, totalHits = 0;
    NOTE_NAMES.forEach(n => {
        totalReact += State.noteStats[n].totalReact;
        totalHits += State.noteStats[n].hit;
    });
    const avgReact = totalHits > 0 ? (totalReact / totalHits) : 0;
    document.getElementById('vc-reaction').textContent = avgReact > 0 ? avgReact.toFixed(2) + 's' : '—';

    // Stats per nota
    const notesContainer = document.getElementById('vc-notes-stats');
    notesContainer.innerHTML = '';
    NOTE_NAMES.forEach(n => {
        const s = State.noteStats[n];
        const tot = s.hit + s.miss;
        const pct = tot > 0 ? Math.round((s.hit / tot) * 100) : null;
        const div = document.createElement('div');
        div.className = 'vc-note';
        if (pct !== null) {
            if (pct >= 90) div.classList.add('strong');
            else if (pct < 70) div.classList.add('weak');
        }
        div.innerHTML = `
            <div class="vn-name">${n}</div>
            <div class="vn-pct">${pct === null ? '—' : pct + '%'}</div>
        `;
        notesContainer.appendChild(div);
    });

    // Estrelles
    const starEls = document.querySelectorAll('#vc-stars .star');
    starEls.forEach((el, i) => {
        el.classList.remove('on');
        setTimeout(() => {
            if (i < stars) el.classList.add('on');
        }, 600 + i * 350);
    });

    document.getElementById('victory-overlay').classList.add('active');
}

// ============================================================
// 25. HUD
// ============================================================

function updateHUD() {
    const lvl = LEVELS[State.levelIdx];
    document.getElementById('hud-level').textContent = String(State.levelIdx + 1).padStart(2, '0');
    document.getElementById('hud-wave').textContent = `${State.spawnedCount}/${lvl.total}`;
    document.getElementById('hud-score').textContent = Math.floor(State.scoreDisplay).toLocaleString();
    document.getElementById('hud-combo').textContent = 'x' + State.combo;
    const acc = State.shotsFired > 0 ? Math.round((State.shotsHit / State.shotsFired) * 100) : 100;
    document.getElementById('hud-accuracy').textContent = acc + '%';
}

function updateIntegrityRings() {
    document.querySelectorAll('.ring-segment').forEach((el, i) => {
        const lostNow = i >= State.lives;
        if (lostNow && !el.classList.contains('lost')) {
            el.classList.add('lost');
        } else if (!lostNow) {
            el.classList.remove('lost');
        }
    });
}

function updatePowerUpHUD() {
    document.getElementById('pu-bomb-count').textContent = State.powerups.bomb;
    document.getElementById('pu-shield-count').textContent = State.powerups.shield;
    document.getElementById('pu-slow-count').textContent = State.powerups.slow;
    document.querySelectorAll('.pu-btn').forEach(btn => {
        const t = btn.dataset.pu;
        btn.classList.toggle('disabled', !State.powerups[t]);
    });
}

let comboPulseTimer = null;
function pulseCombo() {
    const el = document.getElementById('hud-combo');
    if (!el) return;
    el.classList.add('boost');
    if (comboPulseTimer) clearTimeout(comboPulseTimer);
    comboPulseTimer = setTimeout(() => el.classList.remove('boost'), 200);
}

// Loop separat per actualitzar el comptador de score animat
setInterval(() => {
    if (State.screen === 'gameplay' && State.running) {
        document.getElementById('hud-score').textContent = Math.floor(State.scoreDisplay).toLocaleString();
    }
}, 60);

// ============================================================
// 26. ACHIEVEMENTS
// ============================================================

function checkAchievement(id) {
    const prog = Storage.getProgress();
    if ((prog.achievements || []).includes(id)) return;
    Storage.update(p => {
        p.achievements = p.achievements || [];
        if (!p.achievements.includes(id)) p.achievements.push(id);
    });
    showAchievementToast(id);
}

function showAchievementToast(id) {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;
    const toast = document.getElementById('achievement-toast');
    if (!toast) return;
    toast.querySelector('.ach-toast-icon').textContent = ach.icon;
    document.getElementById('ach-toast-name').textContent = ach.name;
    toast.classList.add('show');
    Audio.playAchievement();
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ============================================================
// 27. RESIZE
// ============================================================

function resizeCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (State.canvas) { State.canvas.width = w; State.canvas.height = h; }
    if (State.bgCanvas) { State.bgCanvas.width = w; State.bgCanvas.height = h; }
    // Bloom a mitja resolució (rendiment millor, qualitat indistinta)
    if (State.bloomCanvas) {
        State.bloomCanvas.width = Math.max(1, Math.floor(w / 2));
        State.bloomCanvas.height = Math.max(1, Math.floor(h / 2));
    }
    State.W = w;
    State.H = h;
    State.cx = w / 2;
    State.cy = h / 2;
}

// ============================================================
// 28. INICIALITZACIÓ
// ============================================================

function init() {
    State.canvas = document.getElementById('gameCanvas');
    State.ctx = State.canvas.getContext('2d');
    State.bgCanvas = document.getElementById('bgCanvas');
    State.bgCtx = State.bgCanvas.getContext('2d');

    // Bloom canvas off-screen
    State.bloomCanvas = document.createElement('canvas');
    State.bloomCtx = State.bloomCanvas.getContext('2d');

    resizeCanvas();
    generateBackgroundLayers();
    startBackgroundLoop();

    window.addEventListener('resize', () => {
        resizeCanvas();
        generateBackgroundLayers();
    });

    setupInput();
    showScreen('landing');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();

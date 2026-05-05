/* ==========================================================================
   INVASIÓ GALÀCTICA DE NOTES — MOTOR AAA
   Vanilla JS · HTML5 Canvas · Web Audio API
   ========================================================================== */

'use strict';

// ============================================================================
// 1. CONFIGURACIÓ DE NOTES (Pentagrama de clau de SOL)
// ============================================================================
const NOTES = [
    { idx: 0,  name: 'DO',  octave: 4, offset: 5.0,  color: '#ff3366', label: 'DO₄', shape: 'circle' },
    { idx: 1,  name: 'RE',  octave: 4, offset: 4.5,  color: '#ff8833', label: 'RE₄', shape: 'square' },
    { idx: 2,  name: 'MI',  octave: 4, offset: 4.0,  color: '#ffee33', label: 'MI₄', shape: 'triangle' },
    { idx: 3,  name: 'FA',  octave: 4, offset: 3.5,  color: '#33ff77', label: 'FA₄', shape: 'diamond' },
    { idx: 4,  name: 'SOL', octave: 4, offset: 3.0,  color: '#33ddff', label: 'SOL₄', shape: 'pentagon' },
    { idx: 5,  name: 'LA',  octave: 4, offset: 2.5,  color: '#7733ff', label: 'LA₄', shape: 'hexagon' },
    { idx: 6,  name: 'SI',  octave: 4, offset: 2.0,  color: '#ff33dd', label: 'SI₄', shape: 'star' },
    { idx: 7,  name: 'DO',  octave: 5, offset: 1.5,  color: '#ff3366', label: 'DO₅', shape: 'circle' },
    { idx: 8,  name: 'RE',  octave: 5, offset: 1.0,  color: '#ff8833', label: 'RE₅', shape: 'square' },
    { idx: 9,  name: 'MI',  octave: 5, offset: 0.5,  color: '#ffee33', label: 'MI₅', shape: 'triangle' },
    { idx: 10, name: 'FA',  octave: 5, offset: 0.0,  color: '#33ff77', label: 'FA₅', shape: 'diamond' },
    { idx: 11, name: 'SOL', octave: 5, offset: -0.5, color: '#33ddff', label: 'SOL₅', shape: 'pentagon' },
    { idx: 12, name: 'LA',  octave: 5, offset: -1.0, color: '#7733ff', label: 'LA₅', shape: 'hexagon' },
];
const NOTE_NAMES = ['DO', 'RE', 'MI', 'FA', 'SOL', 'LA', 'SI'];
const NOTE_COLOR = { DO: '#ff3366', RE: '#ff8833', MI: '#ffee33', FA: '#33ff77', SOL: '#33ddff', LA: '#7733ff', SI: '#ff33dd' };
const NOTE_FREQ = {
    'DO_4': 261.63, 'RE_4': 293.66, 'MI_4': 329.63, 'FA_4': 349.23,
    'SOL_4': 392.00, 'LA_4': 440.00, 'SI_4': 493.88,
    'DO_5': 523.25, 'RE_5': 587.33, 'MI_5': 659.25, 'FA_5': 698.46,
    'SOL_5': 783.99, 'LA_5': 880.00,
};
const BOSS_LEVELS = new Set([5, 10, 15, 20]);

// ============================================================================
// 2. CONFIGURACIÓ DE NIVELLS
// ============================================================================
function buildLevel(n) {
    if (n >= 21) return buildCosmic();
    let tier, notes, missionText;
    if (n <= 5)       { tier = 'INICIACIÓ'; notes = [0, 1, 2]; missionText = '"Identifica les primeres notes"'; }
    else if (n <= 10) { tier = 'MITJÀ';     notes = [0, 1, 2, 3, 4, 5, 6]; missionText = '"L\'escala completa, naus armades"'; }
    else if (n <= 15) { tier = 'GUERRER';   notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; missionText = '"Línies i espais, atac intens"'; }
    else              { tier = 'MESTRE';    notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; missionText = '"Línies addicionals, velocitat extrema"'; }

    const p = (n - 1) / 19;
    const isBoss = BOSS_LEVELS.has(n);
    return {
        level: n, tier, missionText, isBoss,
        noteIndices: notes,
        waves: isBoss ? 1 : 2 + Math.floor(p * 3),
        shipsPerWave: 4 + Math.floor(p * 5),
        speed: 22 + p * 60,
        fireChance: n >= 6 ? Math.min(0.5, (n - 5) * 0.04) : 0,
        spawnGap: Math.max(0.45, 1.6 - p * 1.15),
        waveGap: Math.max(1.5, 3.3 - p * 1.8),
        bossHp: isBoss ? 6 + Math.floor(n / 5) * 2 : 0,
        infinite: false,
    };
}
function buildCosmic() {
    return {
        level: 21, tier: 'CÒSMIC', missionText: '"Sense fi. Sense pietat."',
        noteIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        waves: Infinity, shipsPerWave: 6, speed: 38, fireChance: 0.35,
        spawnGap: 0.8, waveGap: 1.2, infinite: true, accelPerSecond: 0.001,
        isBoss: false,
    };
}

// ============================================================================
// 3. STORAGE (progrés, mestria, estrelles, configuració)
// ============================================================================
const Storage = {
    KEYS: {
        PROGRESS: 'invasio.v2.progress',
        COSMIC: 'invasio.v2.cosmic',
        MASTERY: 'invasio.v2.mastery',
        STARS: 'invasio.v2.stars',
        SETTINGS: 'invasio.v2.settings',
    },
    _read(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch(e) { return def; } },
    _write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} },
    getProgress() { return this._read(this.KEYS.PROGRESS, 1); },
    setProgress(n) { if (n > this.getProgress()) this._write(this.KEYS.PROGRESS, n); },
    getCosmic() { return this._read(this.KEYS.COSMIC, 0); },
    setCosmic(s) { if (s > this.getCosmic()) this._write(this.KEYS.COSMIC, s); },
    getMastery() { return this._read(this.KEYS.MASTERY, {}); },
    setMastery(m) { this._write(this.KEYS.MASTERY, m); },
    getStars() { return this._read(this.KEYS.STARS, {}); },
    setStarsForLevel(level, stars) {
        const all = this.getStars();
        if (!all[level] || stars > all[level]) {
            all[level] = stars;
            this._write(this.KEYS.STARS, all);
        }
    },
    getTotalStars() {
        const all = this.getStars();
        return Object.values(all).reduce((a, b) => a + b, 0);
    },
    getSettings() {
        return this._read(this.KEYS.SETTINGS, {
            music: 60, sfx: 80, colorblind: false, reduceFx: false, helperLabels: false,
        });
    },
    setSettings(s) { this._write(this.KEYS.SETTINGS, s); },
    resetAll() {
        Object.values(this.KEYS).forEach(k => { try { localStorage.removeItem(k); } catch(e){} });
    },
};

// ============================================================================
// 4. EDUCATION — MASTERY + SPACED REPETITION
// ============================================================================
const Education = {
    sessionMastery: {},
    init() {
        this.sessionMastery = JSON.parse(JSON.stringify(Storage.getMastery()));
        NOTE_NAMES.forEach(n => {
            if (!this.sessionMastery[n]) this.sessionMastery[n] = { hit: 0, total: 0, recent: [] };
        });
    },
    recordHit(name) {
        const m = this.sessionMastery[name] || { hit: 0, total: 0, recent: [] };
        m.hit++; m.total++;
        m.recent.push(1); if (m.recent.length > 30) m.recent.shift();
        this.sessionMastery[name] = m;
        Storage.setMastery(this.sessionMastery);
    },
    recordMiss(name) {
        const m = this.sessionMastery[name] || { hit: 0, total: 0, recent: [] };
        m.total++;
        m.recent.push(0); if (m.recent.length > 30) m.recent.shift();
        this.sessionMastery[name] = m;
        Storage.setMastery(this.sessionMastery);
    },
    getMastery(name) {
        const m = this.sessionMastery[name];
        if (!m || m.total < 3) return 0.5; // neutre fins a tenir dades
        return m.hit / m.total;
    },
    getRecentMastery(name) {
        const m = this.sessionMastery[name];
        if (!m || !m.recent.length) return 0.5;
        const sum = m.recent.reduce((a, b) => a + b, 0);
        return sum / m.recent.length;
    },
    // SRS weight: notes amb baixa mestria reben més probabilitat d'aparèixer
    getSrsWeights(noteIndices) {
        const weights = noteIndices.map(idx => {
            const note = NOTES[idx];
            const m = this.getRecentMastery(note.name);
            return 1 + (1 - m) * 2.5; // 1x si mestria=1, ~3.5x si mestria=0
        });
        return weights;
    },
    pickWeighted(noteIndices) {
        const w = this.getSrsWeights(noteIndices);
        const total = w.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < noteIndices.length; i++) {
            r -= w[i];
            if (r <= 0) return noteIndices[i];
        }
        return noteIndices[noteIndices.length - 1];
    },
    avgAccuracy() {
        let hit = 0, total = 0;
        Object.values(this.sessionMastery).forEach(m => { hit += m.hit; total += m.total; });
        return total === 0 ? 0 : hit / total;
    },
};

// ============================================================================
// 5. AUDIO — Multi-layer music, ADSR notes, panning, voice
// ============================================================================
const Audio = {
    ctx: null,
    masterGain: null, musicGain: null, sfxGain: null,
    musicNodes: [], musicTimer: null,
    musicTempo: 1, musicIntensity: 0,
    layers: { pad: null, bass: null, kick: null, arp: null, lead: null },
    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain(); this.masterGain.gain.value = 0.85;
            this.musicGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            const s = Storage.getSettings();
            this.musicGain.gain.value = (s.music || 60) / 100 * 0.6;
            this.sfxGain.gain.value = (s.sfx || 80) / 100 * 0.9;
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.ctx.destination);
        } catch(e) { console.warn('Audio init failed', e); }
    },
    resume() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    setMusicVolume(p) { if (this.musicGain) this.musicGain.gain.value = p / 100 * 0.6; },
    setSfxVolume(p) { if (this.sfxGain) this.sfxGain.gain.value = p / 100 * 0.9; },

    _adsr(gain, t, peak, a, d, s, dur, r) {
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(peak, t + a);
        gain.gain.exponentialRampToValueAtTime(peak * s, t + a + d);
        gain.gain.setValueAtTime(peak * s, t + dur);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + r);
    },
    laser(freq = 700, panX = 0) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 1.5, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.16);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        if (pan) { pan.pan.value = panX; osc.connect(g).connect(pan).connect(this.sfxGain); }
        else { osc.connect(g).connect(this.sfxGain); }
        osc.start(t); osc.stop(t + 0.2);
    },
    explosion(panX = 0) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length / 5));
        const src = this.ctx.createBufferSource(); src.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(2800, t);
        filt.frequency.exponentialRampToValueAtTime(180, t + 0.4);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.55, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        if (pan) { pan.pan.value = panX; src.connect(filt).connect(g).connect(pan).connect(this.sfxGain); }
        else { src.connect(filt).connect(g).connect(this.sfxGain); }
        src.start(t);
    },
    damage() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
        g.gain.setValueAtTime(0.32, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.52);
    },
    miss() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, t);
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.14);
    },
    noteTone(name, octave, panX = 0) {
        if (!this.ctx) return;
        const f = NOTE_FREQ[`${name}_${octave}`] || 440;
        const t = this.ctx.currentTime;
        // Piano-ish: ondes sine + triangle apilades amb ADSR
        ['sine', 'triangle'].forEach((type, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = f * (i ? 2 : 1);
            const peak = i ? 0.04 : 0.10;
            this._adsr(g, t, peak, 0.005, 0.08, 0.3, 0.15, 0.18);
            const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
            if (pan) { pan.pan.value = panX; osc.connect(g).connect(pan).connect(this.sfxGain); }
            else { osc.connect(g).connect(this.sfxGain); }
            osc.start(t); osc.stop(t + 0.4);
        });
    },
    powerUpJingle() {
        if (!this.ctx) return;
        ['DO_5', 'MI_5', 'SOL_5'].forEach((n, i) => {
            setTimeout(() => { const [name, oct] = n.split('_'); this.noteTone(name, oct); }, i * 60);
        });
    },
    victory() {
        ['DO_5', 'MI_5', 'SOL_5', 'DO_5'].forEach((n, i) => {
            setTimeout(() => { const [name, oct] = n.split('_'); this.noteTone(name, oct); }, i * 140);
        });
    },
    defeat() {
        ['SOL_4', 'FA_4', 'MI_4', 'RE_4'].forEach((n, i) => {
            setTimeout(() => { const [name, oct] = n.split('_'); this.noteTone(name, oct); }, i * 200);
        });
    },
    bossWarning() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = 90 + i * 5;
            const ts = t + i * 0.18;
            g.gain.setValueAtTime(0.0001, ts);
            g.gain.exponentialRampToValueAtTime(0.18, ts + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, ts + 0.16);
            osc.connect(g).connect(this.sfxGain);
            osc.start(ts); osc.stop(ts + 0.18);
        }
    },
    comboHit(level) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const baseFreqs = [440, 523, 659, 784, 1047];
        const f = baseFreqs[Math.min(level, baseFreqs.length - 1)];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.1, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.12);
    },

    startMusic(tempo = 1) {
        this.stopMusic();
        if (!this.ctx) return;
        this.musicTempo = tempo;
        const bassPattern = [55, 0, 73.42, 0, 65.41, 0, 82.41, 0];
        const arpPattern = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63];
        const padFreqs = [130.81, 196.0, 261.63];
        let step = 0;
        const tick = () => {
            if (!this.ctx || !this.musicGain) return;
            const t = this.ctx.currentTime;
            const stepDur = 0.22 / this.musicTempo;
            // Bass (sempre)
            const bf = bassPattern[step % bassPattern.length];
            if (bf) {
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                const filt = this.ctx.createBiquadFilter();
                osc.type = 'sawtooth'; osc.frequency.value = bf;
                filt.type = 'lowpass'; filt.frequency.value = 600;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.085 * (0.4 + this.musicIntensity * 0.6), t + 0.005);
                g.gain.exponentialRampToValueAtTime(0.0001, t + stepDur * 0.9);
                osc.connect(filt).connect(g).connect(this.musicGain);
                osc.start(t); osc.stop(t + stepDur);
                this.musicNodes.push(osc);
            }
            // Kick (intensitat > 0.15)
            if (this.musicIntensity > 0.15 && step % 2 === 0) {
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(120, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
                g.gain.setValueAtTime(0.18, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
                osc.connect(g).connect(this.musicGain);
                osc.start(t); osc.stop(t + 0.12);
                this.musicNodes.push(osc);
            }
            // Hi-hat (intensitat > 0.35)
            if (this.musicIntensity > 0.35 && step % 2 === 1) {
                const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length / 6));
                const src = this.ctx.createBufferSource(); src.buffer = buf;
                const filt = this.ctx.createBiquadFilter();
                filt.type = 'highpass'; filt.frequency.value = 6000;
                const g = this.ctx.createGain();
                g.gain.value = 0.06;
                src.connect(filt).connect(g).connect(this.musicGain);
                src.start(t);
            }
            // Arpeggio (intensitat > 0.5)
            if (this.musicIntensity > 0.5) {
                const af = arpPattern[step % arpPattern.length];
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'square'; osc.frequency.value = af;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.025 * (this.musicIntensity - 0.5), t + 0.005);
                g.gain.exponentialRampToValueAtTime(0.0001, t + stepDur * 0.85);
                osc.connect(g).connect(this.musicGain);
                osc.start(t); osc.stop(t + stepDur);
                this.musicNodes.push(osc);
            }
            // Pad cada 8 steps
            if (step % 8 === 0) {
                padFreqs.forEach(f => {
                    const osc = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    osc.type = 'sine'; osc.frequency.value = f;
                    g.gain.setValueAtTime(0.0001, t);
                    g.gain.exponentialRampToValueAtTime(0.018, t + 0.4);
                    g.gain.exponentialRampToValueAtTime(0.0001, t + stepDur * 8);
                    osc.connect(g).connect(this.musicGain);
                    osc.start(t); osc.stop(t + stepDur * 8 + 0.1);
                    this.musicNodes.push(osc);
                });
            }
            // Lead (intensitat > 0.75)
            if (this.musicIntensity > 0.75 && step % 4 === 0) {
                const lf = arpPattern[(step / 4) % arpPattern.length] * 2;
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'sawtooth'; osc.frequency.value = lf;
                const filt = this.ctx.createBiquadFilter();
                filt.type = 'lowpass'; filt.frequency.value = 2000;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.04 * (this.musicIntensity - 0.7), t + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, t + stepDur * 3.5);
                osc.connect(filt).connect(g).connect(this.musicGain);
                osc.start(t); osc.stop(t + stepDur * 4);
                this.musicNodes.push(osc);
            }
            step++;
            this.musicTimer = setTimeout(tick, stepDur * 1000);
        };
        tick();
    },
    setIntensity(i) { this.musicIntensity = Math.max(0, Math.min(1, i)); },
    setMusicTempo(t) { this.musicTempo = Math.max(0.6, Math.min(3, t)); },
    stopMusic() {
        if (this.musicTimer) { clearTimeout(this.musicTimer); this.musicTimer = null; }
        this.musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
        this.musicNodes = [];
    },
};

// ============================================================================
// 6. PROCEDURAL ASSETS — sprites pre-renderitzats
// ============================================================================
const Assets = {
    aliens: {}, // { color: { idle: [canvas...], death: [canvas...] } }
    powerups: {}, // { type: canvas }
    bossSprite: null,
    nebula: null, nebulaSize: { w: 0, h: 0 },
    cannonSprite: null,
    initialized: false,

    init() {
        if (this.initialized) return;
        // Sprites per cada color de nota
        Object.values(NOTE_COLOR).forEach(color => {
            if (this.aliens[color]) return;
            this.aliens[color] = {
                idle: this._buildAlienIdle(color),
                death: this._buildAlienDeath(color),
            };
        });
        this.bossSprite = this._buildBossSprite();
        this.cannonSprite = this._buildCannonSprite();
        this.powerups = {
            bomb: this._buildPowerUp('💣', '#ff3366'),
            shield: this._buildPowerUp('🛡', '#33ddff'),
            slow: this._buildPowerUp('⏱', '#fff066'),
        };
        this.initialized = true;
    },

    _newCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        return c;
    },

    _buildAlienIdle(color) {
        const frames = [];
        const FRAMES = 6;
        const W = 76, H = 90;
        for (let f = 0; f < FRAMES; f++) {
            const c = this._newCanvas(W, H);
            const ctx = c.getContext('2d');
            ctx.translate(W / 2, H / 2);
            this._drawAlien(ctx, color, f / FRAMES);
            frames.push(c);
        }
        return frames;
    },

    _buildAlienDeath(color) {
        const frames = [];
        const FRAMES = 8;
        const W = 110, H = 110;
        for (let f = 0; f < FRAMES; f++) {
            const c = this._newCanvas(W, H);
            const ctx = c.getContext('2d');
            ctx.translate(W / 2, H / 2);
            const t = f / (FRAMES - 1);
            // halo
            const r = 12 + t * 40;
            const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
            grd.addColorStop(0, color);
            grd.addColorStop(0.4, color + '88');
            grd.addColorStop(1, 'transparent');
            ctx.globalAlpha = 1 - t;
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
            // estelles
            ctx.globalAlpha = (1 - t) * 0.9;
            for (let i = 0; i < 14; i++) {
                const a = (i / 14) * Math.PI * 2;
                const dist = 6 + t * 50;
                ctx.fillStyle = color;
                ctx.shadowColor = color; ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 3 * (1 - t * 0.5), 0, Math.PI * 2);
                ctx.fill();
            }
            frames.push(c);
        }
        return frames;
    },

    _drawAlien(ctx, color, phase) {
        const bob = Math.sin(phase * Math.PI * 2) * 1.5;
        const wig = Math.sin(phase * Math.PI * 4);
        const eyeBlink = (phase > 0.85) ? 0.2 : 1;

        // Aura exterior
        ctx.save();
        const aura = ctx.createRadialGradient(0, bob, 0, 0, bob, 30);
        aura.addColorStop(0, color + 'aa');
        aura.addColorStop(0.5, color + '44');
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.beginPath(); ctx.arc(0, bob, 32, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Tentacles inferiors
        ctx.save();
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            const sx = i * 4;
            const sy = 8 + bob;
            const ex = i * 6 + wig * 2;
            const ey = 22 + Math.sin(phase * Math.PI * 2 + i) * 3;
            ctx.moveTo(sx, sy);
            ctx.bezierCurveTo(sx, sy + 6, ex, ey - 6, ex, ey);
            ctx.stroke();
        }
        ctx.restore();

        // Cos principal — capa exterior brillant
        ctx.save();
        ctx.translate(0, bob);
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 14, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Capa interior més clara
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-3, -3, 6, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Antenes
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -10);
        ctx.lineTo(-7 + wig, -16);
        ctx.moveTo(5, -10);
        ctx.lineTo(7 + wig, -16);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(-7 + wig, -17, 1.5, 0, Math.PI * 2);
        ctx.arc(7 + wig, -17, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Ulls
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#04020e';
        ctx.beginPath();
        ctx.ellipse(-5, -1, 3, 4 * eyeBlink, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -1, 3, 4 * eyeBlink, 0, 0, Math.PI * 2);
        ctx.fill();
        if (eyeBlink > 0.5) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-4, -2, 1, 0, Math.PI * 2);
            ctx.arc(6, -2, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    },

    _buildBossSprite() {
        const frames = [];
        const FRAMES = 4;
        const W = 220, H = 180;
        for (let f = 0; f < FRAMES; f++) {
            const c = this._newCanvas(W, H);
            const ctx = c.getContext('2d');
            ctx.translate(W / 2, H / 2);
            const phase = f / FRAMES;
            this._drawBoss(ctx, phase);
            frames.push(c);
        }
        return frames;
    },

    _drawBoss(ctx, phase) {
        const bob = Math.sin(phase * Math.PI * 2) * 3;
        const wig = Math.sin(phase * Math.PI * 4);
        // aura
        const aura = ctx.createRadialGradient(0, bob, 0, 0, bob, 110);
        aura.addColorStop(0, 'rgba(255, 43, 214, 0.6)');
        aura.addColorStop(0.4, 'rgba(255, 43, 214, 0.2)');
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.beginPath(); ctx.arc(0, bob, 110, 0, Math.PI * 2); ctx.fill();

        // tentacles llargs
        ctx.save();
        ctx.strokeStyle = '#ff2bd6';
        ctx.shadowColor = '#ff2bd6';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            const sx = i * 14;
            const sy = 30 + bob;
            const ex = i * 20 + wig * 5;
            const ey = 70 + Math.sin(phase * Math.PI * 2 + i) * 8;
            ctx.moveTo(sx, sy);
            ctx.bezierCurveTo(sx, sy + 20, ex, ey - 20, ex, ey);
            ctx.stroke();
        }
        ctx.restore();

        // cos principal
        ctx.save();
        ctx.translate(0, bob);
        ctx.shadowColor = '#ff2bd6';
        ctx.shadowBlur = 30;
        // capa exterior
        ctx.fillStyle = '#ff2bd6';
        ctx.beginPath();
        ctx.ellipse(0, 0, 70, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        // capa metàl·lica
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#7733ff';
        ctx.beginPath();
        ctx.ellipse(0, 5, 60, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        // detalls
        ctx.fillStyle = '#1a0a3a';
        ctx.beginPath();
        ctx.ellipse(0, 8, 50, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        // ulls
        ctx.shadowColor = '#ff2bd6';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#fff';
        for (let i = -1; i <= 1; i += 2) {
            ctx.beginPath();
            ctx.ellipse(i * 22, -2, 8, 11, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#04020e';
        for (let i = -1; i <= 1; i += 2) {
            ctx.beginPath();
            ctx.arc(i * 22 + wig * 2, 0, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        // banya central
        ctx.fillStyle = '#fff066';
        ctx.shadowColor = '#fff066';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(-10, -38);
        ctx.lineTo(10, -38);
        ctx.lineTo(0, -58);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    _buildCannonSprite() {
        const W = 90, H = 70;
        const c = this._newCanvas(W, H);
        const ctx = c.getContext('2d');
        ctx.translate(W / 2, H - 6);
        // base trapezoidal
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(-38, 0);
        ctx.lineTo(-30, -14);
        ctx.lineTo(30, -14);
        ctx.lineTo(38, 0);
        ctx.closePath();
        ctx.fill();
        // cos central fosc
        ctx.fillStyle = '#0a0524';
        ctx.fillRect(-26, -32, 52, 18);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-26, -32, 52, 18);
        // detalls
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#33ddff';
        ctx.fillRect(-22, -28, 44, 2);
        ctx.fillStyle = '#00f0ff';
        // canó
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillRect(-7, -50, 14, 18);
        // bola d'energia
        ctx.beginPath();
        ctx.arc(0, -52, 5, 0, Math.PI * 2);
        ctx.fill();
        return c;
    },

    _buildPowerUp(emoji, color) {
        const W = 50, H = 50;
        const c = this._newCanvas(W, H);
        const ctx = c.getContext('2d');
        ctx.translate(W / 2, H / 2);
        // diamant
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(20, 0);
        ctx.lineTo(0, 20);
        ctx.lineTo(-20, 0);
        ctx.closePath();
        ctx.fill();
        // interior fosc
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(14, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(-14, 0);
        ctx.closePath();
        ctx.fill();
        // emoji centrat
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 0, 1);
        return c;
    },

    buildNebula(W, H) {
        if (this.nebula && this.nebulaSize.w === W && this.nebulaSize.h === H) return this.nebula;
        const c = this._newCanvas(W, H);
        const ctx = c.getContext('2d');
        // fons base
        ctx.fillStyle = '#04020e';
        ctx.fillRect(0, 0, W, H);
        // núvols de nebulosa
        const palette = [
            ['rgba(179, 71, 255, 0.45)', 'transparent'],
            ['rgba(0, 240, 255, 0.35)', 'transparent'],
            ['rgba(255, 43, 214, 0.4)', 'transparent'],
            ['rgba(255, 240, 102, 0.25)', 'transparent'],
        ];
        for (let i = 0; i < 24; i++) {
            const px = Math.random() * W;
            const py = Math.random() * H;
            const r = 80 + Math.random() * 220;
            const colors = palette[i % palette.length];
            const grd = ctx.createRadialGradient(px, py, 0, px, py, r);
            grd.addColorStop(0, colors[0]);
            grd.addColorStop(1, colors[1]);
            ctx.fillStyle = grd;
            ctx.fillRect(px - r, py - r, r * 2, r * 2);
        }
        // estrelles brillants
        for (let i = 0; i < 240; i++) {
            const x = Math.random() * W, y = Math.random() * H;
            const size = Math.random() < 0.04 ? 2 : 1;
            const a = 0.3 + Math.random() * 0.7;
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.fillRect(x, y, size, size);
        }
        // estrelles de color
        const colorStars = ['#00f0ff', '#ff2bd6', '#fff066', '#33ff99'];
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * W, y = Math.random() * H;
            const c = colorStars[i % colorStars.length];
            ctx.fillStyle = c;
            ctx.shadowColor = c;
            ctx.shadowBlur = 8;
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.shadowBlur = 0;
        this.nebula = c;
        this.nebulaSize = { w: W, h: H };
        return c;
    },
};

// ============================================================================
// 7. PARTICLES + FLOATING TEXT
// ============================================================================
class FloatingText {
    constructor(text, x, y, color = '#fff', size = 22, life = 1.2) {
        this.text = text; this.x = x; this.y = y; this.startY = y;
        this.color = color; this.size = size;
        this.life = life; this.maxLife = life;
        this.vy = -40;
    }
    update(dt) {
        this.life -= dt;
        this.y += this.vy * dt;
        this.vy *= 0.96;
    }
    render(ctx) {
        const a = Math.min(1, this.life / this.maxLife * 1.5);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 14;
        ctx.font = `bold ${this.size}px ${`'Courier New', monospace`}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
    get dead() { return this.life <= 0; }
}

// ============================================================================
// 8. POST-FX (BLOOM via filter blur)
// ============================================================================
const PostFX = {
    enabled: true,
    bloomCanvas: null,
    init(postCanvasEl) {
        this.postCanvas = postCanvasEl;
        this.postCtx = postCanvasEl.getContext('2d');
    },
    resize(w, h) {
        const dpr = window.devicePixelRatio || 1;
        this.postCanvas.width = w * dpr;
        this.postCanvas.height = h * dpr;
        this.postCanvas.style.width = w + 'px';
        this.postCanvas.style.height = h + 'px';
        this.postCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.W = w; this.H = h;
    },
    drawBloom(sourceCanvas) {
        if (!this.enabled) {
            this.postCtx.clearRect(0, 0, this.W, this.H);
            return;
        }
        const ctx = this.postCtx;
        ctx.save();
        ctx.clearRect(0, 0, this.W, this.H);
        // Pas 1: blur fort
        ctx.filter = 'blur(14px) brightness(1.5) saturate(1.4)';
        ctx.globalAlpha = 0.85;
        ctx.drawImage(sourceCanvas, 0, 0, this.W, this.H);
        // Pas 2: blur més suau apilat
        ctx.filter = 'blur(4px) brightness(1.2)';
        ctx.globalAlpha = 0.6;
        ctx.drawImage(sourceCanvas, 0, 0, this.W, this.H);
        ctx.restore();
    },
};

// ============================================================================
// 9. UI HELPERS
// ============================================================================
function showToast(msg, color = '#fff066') {
    const el = document.getElementById('toast');
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.style.borderColor = color;
    item.style.color = color;
    item.style.textShadow = `0 0 6px ${color}`;
    item.style.boxShadow = `0 0 16px ${color}`;
    item.textContent = msg;
    el.appendChild(item);
    setTimeout(() => item.remove(), 2200);
}

function showCinematic(level, tier, mission) {
    const ov = document.getElementById('cinematic-overlay');
    document.getElementById('cin-tier').textContent = `— ${tier} —`;
    document.getElementById('cin-sector').textContent = level >= 21 ? 'SECTOR ∞ CÒSMIC' : `SECTOR ${String(level).padStart(2, '0')}`;
    document.getElementById('cin-mission').textContent = mission;
    ov.classList.remove('hidden');
    return new Promise(resolve => setTimeout(() => {
        ov.classList.add('hidden');
        resolve();
    }, 1800));
}

// ============================================================================
// 10. POWER-UPS
// ============================================================================
const PowerUps = {
    types: ['bomb', 'shield', 'slow'],
    pick() { return this.types[Math.floor(Math.random() * this.types.length)]; },
    label: { bomb: '💣 BOMBA', shield: '🛡 ESCUT', slow: '⏱ ALENTIR' },
};

// ============================================================================
// 11. GAME — CLASSE PRINCIPAL
// ============================================================================
const Game = {
    canvas: null, ctx: null, postCanvas: null,
    state: 'idle',
    config: null,
    ships: [], lasers: [], enemyLasers: [], particles: [],
    powerups: [], floatingTexts: [], deathSprites: [],
    boss: null,
    score: 0, lives: 3,
    combo: 0, comboMax: 0, comboLevel: 0,
    shotsFired: 0, shotsHit: 0,
    waveIdx: 0, waveShipsRemaining: 0,
    spawnTimer: 0, waveTimer: 0,
    cannon: { x: 0, y: 0, w: 70, h: 40, flash: 0, shieldActive: false, shieldTime: 0 },
    pentagramTopY: 100, lineSpacing: 18,
    lastTs: 0, animId: null,
    shake: { intensity: 0, time: 0 },
    cosmicTime: 0,
    inventory: null, // power-up emmagatzemat
    timeScale: 1, slowTimer: 0, slowMoTimer: 0,
    helperLabels: false, colorblind: false, reduceFx: false,
    perfectRun: true, // sense rebre dany
    settings: null,

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.postCanvas = document.getElementById('post-canvas');
        PostFX.init(this.postCanvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    applySettings() {
        this.settings = Storage.getSettings();
        this.helperLabels = !!this.settings.helperLabels;
        this.colorblind = !!this.settings.colorblind;
        this.reduceFx = !!this.settings.reduceFx;
        PostFX.enabled = !this.reduceFx;
        Audio.setMusicVolume(this.settings.music);
        Audio.setSfxVolume(this.settings.sfx);
    },

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth, h = window.innerHeight;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.W = w; this.H = h;
        this.pentagramTopY = 100;
        this.lineSpacing = Math.max(15, Math.min(22, this.H * 0.026));
        this.cannon.x = this.W / 2;
        this.cannon.y = this.H - 130;
        this.dangerY = this.cannon.y - 28;
        PostFX.resize(w, h);
    },

    start(level) {
        this.applySettings();
        this.config = buildLevel(level);
        Education.init();
        this.ships = []; this.lasers = []; this.enemyLasers = []; this.particles = [];
        this.powerups = []; this.floatingTexts = []; this.deathSprites = [];
        this.boss = null;
        this.score = 0; this.lives = 3;
        this.combo = 0; this.comboMax = 0; this.comboLevel = 0;
        this.shotsFired = 0; this.shotsHit = 0;
        this.waveIdx = 0;
        this.cosmicTime = 0;
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.inventory = null;
        this.timeScale = 1; this.slowTimer = 0; this.slowMoTimer = 0;
        this.cannon.shieldActive = false; this.cannon.shieldTime = 0;
        this.cannon.flash = 0;
        this.perfectRun = true;
        this.shake = { intensity: 0, time: 0 };
        document.getElementById('hud-level').textContent = this.config.infinite ? '∞' : String(level).padStart(2, '0');
        this.updateHud();
        this.updatePowerUpHud();

        // Cinemàtica + so
        this.state = 'cinematic';
        if (this.config.isBoss) Audio.bossWarning();
        showCinematic(level, this.config.tier, this.config.missionText).then(() => {
            this.state = 'playing';
            this.lastTs = performance.now();
            if (this.config.isBoss) {
                this.spawnBoss();
            } else {
                this.startWave();
            }
            Audio.startMusic(0.85 + level * 0.04);
            Audio.setIntensity(0.2);
        });

        if (this.animId) cancelAnimationFrame(this.animId);
        this.lastTs = performance.now();
        this.loop = this.loop.bind(this);
        this.animId = requestAnimationFrame(this.loop);
    },

    startWave() {
        this.waveShipsRemaining = this.config.shipsPerWave;
        this.spawnTimer = 0.4;
    },

    spawnShip() {
        const idx = Education.pickWeighted(this.config.noteIndices);
        const note = NOTES[idx];
        const margin = 70;
        const originX = margin + Math.random() * (this.W - margin * 2);
        const originY = this.pentagramTopY + note.offset * this.lineSpacing;
        this.ships.push({
            note, x: originX, y: originY,
            originX, originY,
            speed: this.config.speed,
            shootCooldown: 1 + Math.random() * 2,
            phase: Math.random() * Math.PI * 2,
            spriteFrame: 0,
            alive: true,
            spawnTime: performance.now() / 1000,
        });
    },

    spawnBoss() {
        const baseNote = this.config.noteIndices[Math.floor(Math.random() * this.config.noteIndices.length)];
        const note = NOTES[baseNote];
        this.boss = {
            x: this.W / 2,
            y: 180,
            vx: 80,
            hp: this.config.bossHp,
            maxHp: this.config.bossHp,
            currentNote: note,
            phaseTime: 0,
            spriteFrame: 0,
            shootCooldown: 1.5,
            alive: true,
            damageFlash: 0,
        };
        showToast('⚠ BOSS — DERROTA\'L AMB LA NOTA INDICADA', '#ff2bd6');
    },

    fireFromCannon(noteName) {
        if (this.state !== 'playing') return;
        // Boss
        if (this.boss && this.boss.alive) {
            this.shotsFired++;
            const targetNoteName = this.boss.currentNote.name;
            if (noteName === targetNoteName) {
                this.shotsHit++;
                this.boss.hp--;
                this.boss.damageFlash = 0.3;
                Education.recordHit(noteName);
                this.lasers.push({
                    x1: this.cannon.x, y1: this.cannon.y - 18,
                    x2: this.boss.x, y2: this.boss.y,
                    color: this.boss.currentNote.color,
                    life: 0.18, maxLife: 0.18,
                });
                this.spawnHitParticles(this.boss.x, this.boss.y, this.boss.currentNote.color, 30);
                this.score += 200 * Math.max(1, this.comboLevel + 1);
                this.combo++; this.comboMax = Math.max(this.comboMax, this.combo);
                this.updateComboLevel();
                Audio.laser(NOTE_FREQ[`${this.boss.currentNote.name}_${this.boss.currentNote.octave}`] || 440, this.panOf(this.boss.x));
                Audio.noteTone(this.boss.currentNote.name, this.boss.currentNote.octave, this.panOf(this.boss.x));
                Audio.comboHit(this.comboLevel);
                this.cameraShake(4);
                if (this.boss.hp <= 0) {
                    this.killBoss();
                } else {
                    // Tria nova nota
                    const idx = this.config.noteIndices[Math.floor(Math.random() * this.config.noteIndices.length)];
                    this.boss.currentNote = NOTES[idx];
                }
            } else {
                this.combo = 0; this.updateComboLevel();
                Education.recordMiss(targetNoteName);
                Audio.miss();
                this.spawnMissParticles();
                this.floatingTexts.push(new FloatingText('NO!', this.cannon.x, this.cannon.y - 60, '#ff3366', 18, 0.7));
            }
            this.updateHud();
            flashButton(noteName);
            return;
        }

        // Naus normals
        let target = null;
        for (const s of this.ships) {
            if (!s.alive) continue;
            if (s.note.name !== noteName) continue;
            if (!target || s.y > target.y) target = s;
        }
        this.shotsFired++;
        if (target) {
            this.killShip(target, 'cannon');
            // Multi-shot? si tenim diversos vaixells de la mateixa nota i power-up
            // Per simplicitat, només un objectiu per tret
            this.combo++; this.comboMax = Math.max(this.comboMax, this.combo);
            this.updateComboLevel();
            Education.recordHit(noteName);
            Audio.comboHit(this.comboLevel);
        } else {
            this.combo = 0; this.updateComboLevel();
            Education.recordMiss(noteName);
            Audio.miss();
            this.spawnMissParticles();
            this.floatingTexts.push(new FloatingText('—', this.cannon.x, this.cannon.y - 60, '#888', 16, 0.5));
        }
        this.updateHud();
        flashButton(noteName);
    },

    killShip(ship, source = 'cannon') {
        ship.alive = false;
        const note = ship.note;
        this.shotsHit++;
        // Laser
        if (source === 'cannon') {
            this.lasers.push({
                x1: this.cannon.x, y1: this.cannon.y - 18,
                x2: ship.x, y2: ship.y,
                color: note.color,
                life: 0.18, maxLife: 0.18,
            });
        }
        // Sprite de mort
        this.deathSprites.push({
            x: ship.x, y: ship.y, color: note.color,
            life: 0.5, maxLife: 0.5,
        });
        this.spawnHitParticles(ship.x, ship.y, note.color, 22);
        const isLedger = note.offset < 0 || note.offset > 4;
        const points = (100 + (isLedger ? 50 : 0)) * Math.max(1, this.comboLevel + 1);
        this.score += points;
        this.floatingTexts.push(new FloatingText(`+${points}`, ship.x, ship.y - 20, note.color, 18, 1.0));
        Audio.laser(NOTE_FREQ[`${note.name}_${note.octave}`] || 440, this.panOf(ship.x));
        Audio.noteTone(note.name, note.octave, this.panOf(ship.x));
        // Drop power-up
        if (Math.random() < 0.10 && !this.inventory) {
            this.spawnPowerUp(ship.x, ship.y);
        }
        this.cameraShake(3);
    },

    spawnHitParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const sp = 60 + Math.random() * 240;
            this.particles.push({
                x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
                life: 0.6 + Math.random() * 0.3, maxLife: 0.9,
                color, size: 2 + Math.random() * 3,
            });
        }
    },
    spawnMissParticles() {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: this.cannon.x + (Math.random() - 0.5) * 14,
                y: this.cannon.y - 18,
                vx: (Math.random() - 0.5) * 70,
                vy: -Math.random() * 110,
                life: 0.3, maxLife: 0.3,
                color: '#888', size: 2,
            });
        }
    },

    spawnPowerUp(x, y) {
        const type = PowerUps.pick();
        this.powerups.push({
            type, x, y,
            vx: 0, vy: 60,
            life: 12,
            phase: 0,
        });
    },
    collectPowerUp(p) {
        if (this.inventory) return; // ja en tenim
        this.inventory = p.type;
        this.updatePowerUpHud();
        Audio.powerUpJingle();
        showToast(`✨ ${PowerUps.label[p.type]} OBTINGUT — ESPAI per activar`, '#fff066');
    },
    activatePowerUp() {
        if (!this.inventory) return;
        Audio.resume();
        const t = this.inventory;
        if (t === 'bomb') {
            // explota totes les naus a la pantalla
            const ships = [...this.ships].filter(s => s.alive);
            ships.forEach(s => this.killShip(s, 'bomb'));
            this.cameraShake(14);
            this.combo = 0; this.updateComboLevel(); // bomba no compta combo
            Audio.explosion();
            this.floatingTexts.push(new FloatingText('💥 BOMBA', this.W / 2, this.H / 2, '#ff3366', 36, 1.4));
        } else if (t === 'shield') {
            this.cannon.shieldActive = true;
            this.cannon.shieldTime = 12;
            this.floatingTexts.push(new FloatingText('🛡 ESCUT ACTIU', this.W / 2, this.H / 2, '#33ddff', 28, 1.2));
        } else if (t === 'slow') {
            this.slowTimer = 5;
            this.floatingTexts.push(new FloatingText('⏱ TEMPS ALENTIT', this.W / 2, this.H / 2, '#fff066', 28, 1.2));
        }
        this.inventory = null;
        this.updatePowerUpHud();
    },

    enemyFire(ship) {
        this.enemyLasers.push({
            x: ship.x, y: ship.y + 12,
            vy: 220 + Math.random() * 60,
            color: '#ff3366',
            life: 4,
        });
    },

    bossFire() {
        if (!this.boss || !this.boss.alive) return;
        // dispara 2-3 raigs en arc
        for (let i = -1; i <= 1; i++) {
            this.enemyLasers.push({
                x: this.boss.x + i * 30,
                y: this.boss.y + 40,
                vy: 240 + Math.random() * 50,
                color: '#ff2bd6',
                life: 4,
            });
        }
    },

    killBoss() {
        const b = this.boss;
        // explosió enorme
        for (let i = 0; i < 80; i++) {
            const ang = Math.random() * Math.PI * 2;
            const sp = 80 + Math.random() * 380;
            this.particles.push({
                x: b.x, y: b.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
                life: 1 + Math.random() * 0.6, maxLife: 1.6,
                color: i % 2 ? '#ff2bd6' : '#fff066', size: 3 + Math.random() * 4,
            });
        }
        Audio.explosion();
        this.cameraShake(20);
        this.score += 2000;
        this.floatingTexts.push(new FloatingText('+2000', b.x, b.y, '#fff066', 30, 1.5));
        this.floatingTexts.push(new FloatingText('BOSS DERROTAT!', this.W / 2, this.H / 2, '#ff2bd6', 32, 2));
        this.boss.alive = false;
        // Drop garantit
        this.spawnPowerUp(b.x, b.y);
        // Slow-mo dramàtic
        this.slowMoTimer = 1.5;
        // Espera abans de victòria
        setTimeout(() => {
            if (this.state === 'playing') this.endGame(true);
        }, 1500);
    },

    takeDamage(reason = 'crash') {
        if (this.cannon.shieldActive) {
            this.cannon.shieldActive = false;
            this.cannon.shieldTime = 0;
            this.floatingTexts.push(new FloatingText('🛡 ESCUT TRENCAT', this.cannon.x, this.cannon.y - 60, '#33ddff', 18, 0.9));
            this.cameraShake(6);
            return;
        }
        this.lives = Math.max(0, this.lives - 1);
        this.perfectRun = false;
        this.cameraShake(16);
        document.getElementById('screen-gameplay').classList.add('damage-flash');
        setTimeout(() => document.getElementById('screen-gameplay').classList.remove('damage-flash'), 400);
        Audio.damage();
        this.combo = 0; this.updateComboLevel();
        this.updateHud();
        if (this.lives <= 0) {
            this.slowMoTimer = 0.8;
            setTimeout(() => this.endGame(false), 800);
        } else if (this.lives === 1) {
            // últim alè - slow-mo dramàtic
            this.slowMoTimer = 1.0;
            showToast('⚠ ÚLTIMA OPORTUNITAT', '#ff3366');
        }
    },

    cameraShake(intensity) {
        this.shake.intensity = Math.max(this.shake.intensity, intensity);
        this.shake.time = Math.max(this.shake.time, 0.4);
    },

    panOf(x) { return Math.max(-1, Math.min(1, (x / this.W) * 2 - 1)); },

    updateComboLevel() {
        if (this.combo >= 30) this.comboLevel = 4;
        else if (this.combo >= 20) this.comboLevel = 3;
        else if (this.combo >= 10) this.comboLevel = 2;
        else if (this.combo >= 5) this.comboLevel = 1;
        else this.comboLevel = 0;
        const block = document.querySelector('.combo-block');
        block.classList.toggle('active', this.combo > 0);
        block.classList.toggle('high', this.comboLevel >= 2);
        document.getElementById('hud-combo').textContent = `×${Math.max(1, this.comboLevel + 1)}`;
    },

    updateHud() {
        document.getElementById('hud-score').textContent = this.score;
        document.getElementById('hud-lives').textContent = this.lives > 0 ? '🚀'.repeat(this.lives) : '💀';
    },
    updatePowerUpHud() {
        const el = document.getElementById('hud-powerup');
        const btn = document.getElementById('powerup-btn');
        const block = document.querySelector('.powerup-block');
        if (this.inventory) {
            el.textContent = PowerUps.label[this.inventory].split(' ')[0];
            btn.classList.add('active');
            block.classList.add('active');
        } else {
            el.textContent = '—';
            btn.classList.remove('active');
            block.classList.remove('active');
        }
    },

    update(rawDt) {
        if (this.state !== 'playing') return;
        // slow-mo
        let dt = rawDt;
        if (this.slowMoTimer > 0) { this.slowMoTimer -= rawDt; dt *= 0.35; }
        if (this.slowTimer > 0) { this.slowTimer -= rawDt; dt *= 0.5; }

        // Cosmic acceleration
        if (this.config.infinite) {
            this.cosmicTime += rawDt;
            const factor = 1 + this.cosmicTime * this.config.accelPerSecond;
            this._currentSpeed = this.config.speed * factor;
            Audio.setMusicTempo(0.95 + this.cosmicTime * 0.005);
        } else {
            this._currentSpeed = this.config.speed;
        }

        // Spawn naus normals
        if (!this.config.isBoss && this.waveShipsRemaining > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnShip();
                this.waveShipsRemaining--;
                this.spawnTimer = this.config.spawnGap * (0.85 + Math.random() * 0.3);
            }
        } else if (!this.config.isBoss && this.ships.length === 0 && this.lasers.length === 0) {
            this.waveIdx++;
            if (!this.config.infinite && this.waveIdx >= this.config.waves) {
                this.endGame(true);
                return;
            }
            this.waveTimer += dt;
            if (this.waveTimer >= this.config.waveGap) {
                this.waveTimer = 0;
                this.startWave();
            }
        }

        // Boss update
        if (this.boss && this.boss.alive) {
            const b = this.boss;
            b.phaseTime += dt;
            b.spriteFrame = Math.floor(b.phaseTime * 4) % 4;
            b.x += b.vx * dt;
            if (b.x < 120) { b.x = 120; b.vx = Math.abs(b.vx); }
            if (b.x > this.W - 120) { b.x = this.W - 120; b.vx = -Math.abs(b.vx); }
            b.shootCooldown -= dt;
            if (b.shootCooldown <= 0) {
                b.shootCooldown = 1.5 + Math.random() * 1.5;
                this.bossFire();
            }
            b.damageFlash = Math.max(0, b.damageFlash - dt);
        }

        // Music intensity
        if (!this.config.infinite) {
            let closest = 0;
            for (const s of this.ships) {
                if (s.alive) {
                    const r = (s.y - this.pentagramTopY) / Math.max(1, this.dangerY - this.pentagramTopY);
                    if (r > closest) closest = r;
                }
            }
            const bossBoost = this.boss && this.boss.alive ? 0.5 : 0;
            Audio.setIntensity(Math.min(1, closest + bossBoost));
            Audio.setMusicTempo(0.85 + closest * 1.2);
        } else {
            Audio.setIntensity(0.8);
        }

        // Naus
        for (const s of this.ships) {
            if (!s.alive) continue;
            s.y += this._currentSpeed * dt;
            s.phase += dt * 4;
            s.spriteFrame = Math.floor(s.phase * 0.7) % 6;
            s.x = s.originX + Math.sin(s.phase) * 6;
            if (this.config.fireChance > 0) {
                s.shootCooldown -= dt;
                if (s.shootCooldown <= 0) {
                    s.shootCooldown = 2 + Math.random() * 3;
                    if (Math.random() < this.config.fireChance) this.enemyFire(s);
                }
            }
            if (s.y >= this.dangerY) {
                s.alive = false;
                // Feedback educatiu
                this.floatingTexts.push(new FloatingText(`ERA ${s.note.label}`, s.x, s.y - 30, '#ff3366', 22, 1.6));
                Education.recordMiss(s.note.name);
                this.takeDamage('crash');
                this.spawnHitParticles(s.x, s.y, '#ff3366', 18);
                Audio.explosion(this.panOf(s.x));
            }
        }
        this.ships = this.ships.filter(s => s.alive);

        // Lasers
        for (const l of this.lasers) l.life -= rawDt;
        this.lasers = this.lasers.filter(l => l.life > 0);

        // Enemy lasers
        for (const el of this.enemyLasers) {
            el.y += el.vy * dt;
            el.life -= dt;
            if (Math.abs(el.x - this.cannon.x) < this.cannon.w / 2 + 4
                && el.y >= this.cannon.y - 14 && el.y <= this.cannon.y + this.cannon.h) {
                el.life = 0;
                this.cannon.flash = 0.2;
                this.takeDamage('hit');
            }
        }
        this.enemyLasers = this.enemyLasers.filter(el => el.life > 0 && el.y < this.H);

        // Power-ups: descens + recollida
        for (const p of this.powerups) {
            p.y += p.vy * dt;
            p.phase += dt * 3;
            p.life -= dt;
            // recollida quan arriba al nivell del canó
            if (Math.abs(p.x - this.cannon.x) < 50 && Math.abs(p.y - this.cannon.y) < 40) {
                p.life = 0;
                this.collectPowerUp(p);
            }
        }
        this.powerups = this.powerups.filter(p => p.life > 0 && p.y < this.H + 30);

        // Particles
        for (const p of this.particles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.96; p.vy *= 0.96;
            p.life -= dt;
        }
        this.particles = this.particles.filter(p => p.life > 0);

        // Floating texts
        for (const t of this.floatingTexts) t.update(dt);
        this.floatingTexts = this.floatingTexts.filter(t => !t.dead);

        // Death sprites
        for (const d of this.deathSprites) d.life -= rawDt;
        this.deathSprites = this.deathSprites.filter(d => d.life > 0);

        // Cannon decay
        this.cannon.flash = Math.max(0, this.cannon.flash - rawDt);
        if (this.cannon.shieldTime > 0) {
            this.cannon.shieldTime -= rawDt;
            if (this.cannon.shieldTime <= 0) this.cannon.shieldActive = false;
        }
        if (this.shake.time > 0) this.shake.time -= rawDt;
    },

    render() {
        const ctx = this.ctx;
        ctx.save();
        // Shake offset
        let sx = 0, sy = 0;
        if (this.shake.time > 0) {
            const k = this.shake.intensity * (this.shake.time / 0.4);
            sx = (Math.random() - 0.5) * k;
            sy = (Math.random() - 0.5) * k;
        }
        ctx.translate(sx, sy);

        // Fons
        ctx.fillStyle = '#04020e';
        ctx.fillRect(-50, -50, this.W + 100, this.H + 100);

        // Nebulosa procedural (parallax molt lent)
        this.drawBackground(ctx);

        // City silhouette
        this.drawCity(ctx);

        // Pentagrama
        this.drawPentagram(ctx);

        // Línia de perill
        this.drawDangerLine(ctx);

        // Naus
        for (const s of this.ships) this.drawShip(ctx, s);

        // Boss
        if (this.boss && this.boss.alive) this.drawBoss(ctx);

        // Death sprites
        for (const d of this.deathSprites) this.drawDeathSprite(ctx, d);

        // Lasers
        for (const l of this.lasers) this.drawLaser(ctx, l);

        // Enemy lasers
        for (const el of this.enemyLasers) this.drawEnemyLaser(ctx, el);

        // Power-ups
        for (const p of this.powerups) this.drawPowerUp(ctx, p);

        // Cannon
        this.drawCannon(ctx);

        // Partícules
        for (const p of this.particles) this.drawParticle(ctx, p);

        // Floating texts
        for (const t of this.floatingTexts) t.render(ctx);

        // Boss HP bar
        if (this.boss && this.boss.alive) this.drawBossHpBar(ctx);

        ctx.restore();

        // POST FX: bloom
        if (PostFX.enabled) PostFX.drawBloom(this.canvas);
    },

    drawBackground(ctx) {
        const neb = Assets.buildNebula(this.W, this.H);
        const t = performance.now() * 0.00003;
        const offsetY = (t * 30) % this.H;
        ctx.globalAlpha = 0.85;
        ctx.drawImage(neb, 0, offsetY - this.H);
        ctx.drawImage(neb, 0, offsetY);
        ctx.globalAlpha = 1;
    },

    drawCity(ctx) {
        ctx.save();
        const baseY = this.H - 80;
        ctx.fillStyle = 'rgba(255, 43, 214, 0.06)';
        ctx.fillRect(0, baseY - 30, this.W, this.H);
        ctx.fillStyle = 'rgba(8, 4, 24, 0.9)';
        ctx.beginPath();
        ctx.moveTo(0, this.H);
        ctx.lineTo(0, baseY);
        const buildings = 22;
        for (let i = 0; i <= buildings; i++) {
            const x = (i / buildings) * this.W;
            const seed = Math.sin(i * 9.31) * 0.5 + 0.5;
            const h = 24 + seed * 80;
            ctx.lineTo(x, baseY - h);
            ctx.lineTo(x + this.W / buildings * 0.7, baseY - h);
        }
        ctx.lineTo(this.W, baseY);
        ctx.lineTo(this.W, this.H);
        ctx.closePath();
        ctx.fill();
        // Finestres
        ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 6;
        const tt = performance.now() * 0.001;
        for (let i = 0; i < 80; i++) {
            const x = (i * 47) % this.W;
            const y = baseY - 6 - (i * 13) % 70;
            const flicker = Math.sin(tt + i) > 0.7 ? 1 : 0.4;
            ctx.globalAlpha = 0.5 * flicker;
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
    },

    drawPentagram(ctx) {
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, this.pentagramTopY + i * this.lineSpacing);
            ctx.lineTo(this.W, this.pentagramTopY + i * this.lineSpacing);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // Clau de SOL
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#fff066';
        ctx.shadowColor = '#fff066';
        ctx.font = `bold ${this.lineSpacing * 4.6}px serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText('𝄞', 14, this.pentagramTopY + this.lineSpacing * 2.5);
        ctx.restore();
    },

    drawDangerLine(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 50, 100, 0.55)';
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 12;
        ctx.setLineDash([6, 8]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, this.dangerY);
        ctx.lineTo(this.W, this.dangerY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    },

    drawShip(ctx, s) {
        ctx.save();
        // Ledger lines
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.4;
        if (s.note.offset > 4) {
            for (let off = 5; off <= Math.floor(s.note.offset + 0.001); off++) {
                const ly = this.pentagramTopY + off * this.lineSpacing;
                ctx.beginPath();
                ctx.moveTo(s.originX - 16, ly);
                ctx.lineTo(s.originX + 16, ly);
                ctx.stroke();
            }
        } else if (s.note.offset < 0) {
            for (let off = -1; off >= Math.ceil(s.note.offset - 0.001); off--) {
                const ly = this.pentagramTopY + off * this.lineSpacing;
                ctx.beginPath();
                ctx.moveTo(s.originX - 16, ly);
                ctx.lineTo(s.originX + 16, ly);
                ctx.stroke();
            }
        }
        // Stem
        ctx.strokeStyle = s.note.color;
        ctx.shadowColor = s.note.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.moveTo(s.x + 9, s.y - 1);
        ctx.lineTo(s.originX + 9, s.originY - 1);
        ctx.stroke();
        ctx.globalAlpha = 1;
        // Origin pentagram dot
        ctx.fillStyle = s.note.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(s.originX, s.originY, 7, 5.5, -0.32, 0, Math.PI * 2);
        ctx.fill();

        // Sprite
        const sprite = Assets.aliens[s.note.color]?.idle?.[s.spriteFrame];
        if (sprite) {
            ctx.shadowBlur = 0;
            ctx.drawImage(sprite, s.x - sprite.width / 2, s.y - sprite.height / 2);
        }

        // Helper label (mode assistència)
        if (this.helperLabels) {
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#fff';
            ctx.shadowColor = s.note.color;
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(s.note.name, s.x, s.y + 30);
        }
        // Forma daltònic (mode accessibilitat)
        if (this.colorblind) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(s.note.shape.toUpperCase().slice(0, 3), s.x, s.y - 22);
        }
        ctx.restore();
    },

    drawBoss(ctx) {
        const b = this.boss;
        const sprite = Assets.bossSprite[b.spriteFrame];
        ctx.save();
        if (b.damageFlash > 0) ctx.globalAlpha = 0.4 + Math.sin(performance.now() / 30) * 0.3;
        ctx.drawImage(sprite, b.x - sprite.width / 2, b.y - sprite.height / 2);
        ctx.globalAlpha = 1;
        // Indicador de nota actual
        const note = b.currentNote;
        ctx.fillStyle = note.color;
        ctx.shadowColor = note.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y - 10, 22, 18, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(note.name, b.x, b.y - 10);
        ctx.restore();
    },

    drawBossHpBar(ctx) {
        const b = this.boss;
        const w = 360, h = 18;
        const x = (this.W - w) / 2, y = 76;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#ff2bd6';
        ctx.shadowColor = '#ff2bd6';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        // Fill
        const pct = b.hp / b.maxHp;
        const grd = ctx.createLinearGradient(x, y, x + w, y);
        grd.addColorStop(0, '#ff2bd6');
        grd.addColorStop(1, '#ff8833');
        ctx.fillStyle = grd;
        ctx.fillRect(x + 2, y + 2, (w - 4) * pct, h - 4);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`BOSS · ${b.hp}/${b.maxHp}`, this.W / 2, y + h / 2 + 4);
        ctx.restore();
    },

    drawDeathSprite(ctx, d) {
        const a = d.life / d.maxLife;
        const idx = Math.floor((1 - a) * 7);
        const sprite = Assets.aliens[d.color]?.death?.[Math.min(idx, 7)];
        if (sprite) {
            ctx.save();
            ctx.globalAlpha = a;
            ctx.drawImage(sprite, d.x - sprite.width / 2, d.y - sprite.height / 2);
            ctx.restore();
        }
    },

    drawLaser(ctx, l) {
        ctx.save();
        const a = l.life / l.maxLife;
        ctx.strokeStyle = l.color;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 22;
        ctx.lineWidth = 5;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = a * 0.95;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        ctx.restore();
    },

    drawEnemyLaser(ctx, el) {
        ctx.save();
        ctx.strokeStyle = el.color;
        ctx.shadowColor = el.color;
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(el.x, el.y - 14);
        ctx.lineTo(el.x, el.y + 8);
        ctx.stroke();
        ctx.restore();
    },

    drawPowerUp(ctx, p) {
        const sprite = Assets.powerups[p.type];
        if (!sprite) return;
        ctx.save();
        const bob = Math.sin(p.phase * 2) * 3;
        ctx.translate(p.x, p.y + bob);
        ctx.rotate(Math.sin(p.phase) * 0.15);
        if (p.life < 3) ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(p.life * 8));
        ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        ctx.restore();
    },

    drawCannon(ctx) {
        const cx = this.cannon.x, cy = this.cannon.y;
        ctx.save();
        // Sprite
        const sprite = Assets.cannonSprite;
        if (sprite) {
            ctx.drawImage(sprite, cx - sprite.width / 2, cy - sprite.height + 10);
        }
        // Flash damage
        if (this.cannon.flash > 0) {
            ctx.globalAlpha = this.cannon.flash * 5;
            ctx.fillStyle = '#ff3366';
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = 30;
            ctx.fillRect(cx - 30, cy - 20, 60, 30);
        }
        // Shield
        if (this.cannon.shieldActive) {
            ctx.globalAlpha = 0.6 + Math.sin(performance.now() / 100) * 0.2;
            ctx.strokeStyle = '#33ddff';
            ctx.shadowColor = '#33ddff';
            ctx.shadowBlur = 20;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy - 10, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#fff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(cx, cy - 10, 50, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Spark anima
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#fff066';
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy - 50, 3 + Math.sin(performance.now() / 150) * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawParticle(ctx, p) {
        ctx.save();
        const a = p.life / p.maxLife;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    loop(ts) {
        const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
        this.lastTs = ts;
        if (this.state === 'playing') this.update(dt);
        this.render();
        if (this.state !== 'idle') this.animId = requestAnimationFrame(this.loop);
    },

    pause() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        document.getElementById('pause-overlay').classList.remove('hidden');
        Audio.stopMusic();
    },
    resume() {
        if (this.state !== 'paused') return;
        this.state = 'playing';
        this.lastTs = performance.now();
        document.getElementById('pause-overlay').classList.add('hidden');
        Audio.startMusic(0.95 + this.config.level * 0.04);
    },

    computeStars() {
        const acc = this.shotsFired === 0 ? 1 : this.shotsHit / this.shotsFired;
        if (this.perfectRun && acc >= 0.9) return 3;
        if (this.lives === 3 || acc >= 0.7) return 2;
        return 1;
    },

    endGame(won) {
        this.state = 'ended';
        Audio.stopMusic();
        if (won) {
            Audio.victory();
            const lvl = this.config.level;
            if (!this.config.infinite) {
                Storage.setProgress(lvl + 1);
                const stars = this.computeStars();
                Storage.setStarsForLevel(lvl, stars);
                document.getElementById('victory-stars').innerHTML =
                    Array(3).fill(0).map((_, i) => i < stars ? '★' : '☆').join('');
            } else {
                document.getElementById('victory-stars').innerHTML = '∞';
            }
            const accuracy = this.shotsFired === 0 ? 100 : Math.round(100 * this.shotsHit / this.shotsFired);
            document.getElementById('victory-score').textContent = this.score;
            document.getElementById('victory-accuracy').textContent = accuracy + '%';
            document.getElementById('victory-combo').textContent = `×${this.comboMax || 1}`;
            document.getElementById('victory-overlay').classList.remove('hidden');
        } else {
            Audio.defeat();
            if (this.config.infinite) Storage.setCosmic(this.score);
            document.getElementById('gameover-score').textContent = this.score;
            document.getElementById('gameover-combo').textContent = `×${this.comboMax || 1}`;
            document.getElementById('gameover-overlay').classList.remove('hidden');
        }
    },

    quit() {
        this.state = 'idle';
        if (this.animId) cancelAnimationFrame(this.animId);
        Audio.stopMusic();
        document.getElementById('pause-overlay').classList.add('hidden');
        document.getElementById('gameover-overlay').classList.add('hidden');
        document.getElementById('victory-overlay').classList.add('hidden');
        document.getElementById('cinematic-overlay').classList.add('hidden');
    },
};

// ============================================================================
// 12. SHARED BACKGROUND (per a pantalles fora del joc)
// ============================================================================
const SharedBg = {
    canvases: [], nebulaCache: null,
    init() {
        const all = [document.getElementById('bg-canvas'), ...document.querySelectorAll('.bg-canvas-shared')];
        this.canvases = all.filter(Boolean);
        const resize = () => {
            this.canvases.forEach(c => {
                const dpr = window.devicePixelRatio || 1;
                c.width = window.innerWidth * dpr;
                c.height = window.innerHeight * dpr;
                c.style.width = window.innerWidth + 'px';
                c.style.height = window.innerHeight + 'px';
                const ctx = c.getContext('2d');
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            });
            this.nebulaCache = null;
        };
        window.addEventListener('resize', resize);
        resize();
        const tick = () => {
            const w = window.innerWidth, h = window.innerHeight;
            const neb = Assets.buildNebula(w, h);
            const t = performance.now() * 0.00003;
            const offsetY = (t * 30) % h;
            this.canvases.forEach(c => {
                const ctx = c.getContext('2d');
                ctx.clearRect(0, 0, w, h);
                ctx.globalAlpha = 0.85;
                ctx.drawImage(neb, 0, offsetY - h);
                ctx.drawImage(neb, 0, offsetY);
                ctx.globalAlpha = 1;
            });
            requestAnimationFrame(tick);
        };
        tick();
    },
};

// ============================================================================
// 13. SCREENS / UI
// ============================================================================
const Screens = {
    show(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },
};

function renderLevelGrid() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';
    const progress = Storage.getProgress();
    const stars = Storage.getStars();
    for (let i = 1; i <= 20; i++) {
        const card = document.createElement('div');
        const tier = i <= 5 ? 'INICIACIÓ' : i <= 10 ? 'MITJÀ' : i <= 15 ? 'GUERRER' : 'MESTRE';
        const locked = i > progress;
        const isBoss = BOSS_LEVELS.has(i);
        const got = stars[i] || 0;
        card.className = `level-card${locked ? ' locked' : ''}${isBoss ? ' boss' : ''}`;
        let starsHtml = '';
        for (let s = 0; s < 3; s++) starsHtml += `<span class="${s < got ? '' : 'empty'}">★</span>`;
        card.innerHTML = `
            ${isBoss ? '<span class="boss-tag">BOSS</span>' : ''}
            <div class="level-num">${String(i).padStart(2, '0')}</div>
            <span class="level-tier">${tier}</span>
            <div class="level-stars">${starsHtml}</div>
        `;
        if (!locked) card.addEventListener('click', () => startLevel(i));
        grid.appendChild(card);
    }
    const cosmic = document.getElementById('cosmic-card');
    const cosmicRecord = document.getElementById('cosmic-record');
    const cosmicLocked = progress <= 20;
    cosmic.classList.toggle('locked', cosmicLocked);
    const rec = Storage.getCosmic();
    cosmicRecord.textContent = rec > 0 ? `Rècord: ${rec}` : 'Rècord: —';
    cosmic.onclick = cosmicLocked ? null : () => startLevel(21);
}

function renderDashboard() {
    const wrap = document.getElementById('mastery-bars');
    wrap.innerHTML = '';
    const mastery = Storage.getMastery();
    NOTE_NAMES.forEach(name => {
        const m = mastery[name] || { hit: 0, total: 0 };
        const pct = m.total === 0 ? 0 : Math.round(100 * m.hit / m.total);
        const row = document.createElement('div');
        row.className = 'mastery-bar-row';
        row.innerHTML = `
            <div class="mastery-label" style="--c:${NOTE_COLOR[name]}">${name}</div>
            <div class="mastery-track">
                <div class="mastery-fill" style="--c:${NOTE_COLOR[name]}; width:${pct}%"></div>
            </div>
            <div class="mastery-pct">${pct}% (${m.hit}/${m.total})</div>
        `;
        wrap.appendChild(row);
    });
    document.getElementById('stat-progress').textContent =
        `${Math.min(20, Storage.getProgress() - 1)}/20`;
    let totalHit = 0, totalShots = 0;
    NOTE_NAMES.forEach(n => {
        const m = mastery[n]; if (!m) return;
        totalHit += m.hit; totalShots += m.total;
    });
    document.getElementById('stat-accuracy').textContent =
        totalShots === 0 ? '—' : Math.round(100 * totalHit / totalShots) + '%';
    const cosmic = Storage.getCosmic();
    document.getElementById('stat-cosmic').textContent = cosmic > 0 ? cosmic : '—';
    document.getElementById('stat-stars').textContent = Storage.getTotalStars() + '/60';
}

function drawTutorialCanvas() {
    const c = document.getElementById('tutorial-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);
    // background subtil
    ctx.fillStyle = 'rgba(10, 5, 30, 0.5)';
    ctx.fillRect(0, 0, w, h);
    const topY = 60;
    const ls = 22;
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(50, topY + i * ls);
        ctx.lineTo(w - 50, topY + i * ls);
        ctx.stroke();
    }
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#fff066';
    ctx.font = 'bold 90px serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('𝄞', 60, topY + 2.5 * ls + 4);

    // Mostres
    const samples = [
        { idx: 2, x: 200 }, { idx: 4, x: 270 }, { idx: 6, x: 340 },
        { idx: 8, x: 410 }, { idx: 10, x: 480 }, { idx: 0, x: 555 }, { idx: 12, x: 625 }
    ];
    samples.forEach(s => {
        const note = NOTES[s.idx];
        const y = topY + note.offset * ls;
        if (note.offset > 4) {
            for (let off = 5; off <= Math.floor(note.offset + 0.001); off++) {
                const ly = topY + off * ls;
                ctx.beginPath();
                ctx.moveTo(s.x - 14, ly);
                ctx.lineTo(s.x + 14, ly);
                ctx.stroke();
            }
        } else if (note.offset < 0) {
            for (let off = -1; off >= Math.ceil(note.offset - 0.001); off--) {
                const ly = topY + off * ls;
                ctx.beginPath();
                ctx.moveTo(s.x - 14, ly);
                ctx.lineTo(s.x + 14, ly);
                ctx.stroke();
            }
        }
        ctx.shadowColor = note.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = note.color;
        ctx.beginPath();
        ctx.ellipse(s.x, y, 11, 8, -0.32, 0, Math.PI * 2);
        ctx.fill();
        // stem
        ctx.strokeStyle = note.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(s.x + 9, y - 2);
        ctx.lineTo(s.x + 9, y - 38);
        ctx.stroke();
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(note.label, s.x, h - 20);
    });
    ctx.shadowBlur = 0;
}

// ============================================================================
// 14. INPUT
// ============================================================================
const KEY_MAP = {
    '1': 'DO', '2': 'RE', '3': 'MI', '4': 'FA', '5': 'SOL', '6': 'LA', '7': 'SI',
    'q': 'DO', 'w': 'RE', 'e': 'MI', 'r': 'FA', 't': 'SOL', 'y': 'LA', 'u': 'SI',
    'a': 'DO', 's': 'RE', 'd': 'MI', 'f': 'FA', 'g': 'SOL', 'h': 'LA', 'j': 'SI',
};
function flashButton(noteName) {
    const btn = document.querySelector(`.note-btn[data-note="${noteName}"]`);
    if (!btn) return;
    btn.classList.add('firing');
    setTimeout(() => btn.classList.remove('firing'), 100);
}
function handleNoteInput(noteName) {
    if (Game.state !== 'playing') return;
    Audio.resume();
    Game.fireFromCannon(noteName);
}
document.querySelectorAll('.note-btn').forEach(btn => {
    btn.addEventListener('click', () => handleNoteInput(btn.dataset.note));
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleNoteInput(btn.dataset.note);
    }, { passive: false });
});
document.getElementById('powerup-btn').addEventListener('click', () => {
    Audio.resume();
    Game.activatePowerUp();
});
document.getElementById('powerup-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    Audio.resume();
    Game.activatePowerUp();
}, { passive: false });
window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (KEY_MAP[k]) {
        e.preventDefault();
        handleNoteInput(KEY_MAP[k]);
    } else if (k === ' ') {
        e.preventDefault();
        Audio.resume();
        Game.activatePowerUp();
    } else if (k === 'escape' || k === 'p') {
        if (Game.state === 'playing') Game.pause();
        else if (Game.state === 'paused') Game.resume();
    }
});

// ============================================================================
// 15. SETTINGS WIRING
// ============================================================================
function wireSettings() {
    const s = Storage.getSettings();
    const music = document.getElementById('setting-music');
    const sfx = document.getElementById('setting-sfx');
    const cb = document.getElementById('setting-colorblind');
    const rfx = document.getElementById('setting-reduce-fx');
    const hl = document.getElementById('setting-helper-labels');
    music.value = s.music; sfx.value = s.sfx;
    cb.checked = s.colorblind; rfx.checked = s.reduceFx; hl.checked = s.helperLabels;
    const save = () => {
        const next = {
            music: parseInt(music.value, 10),
            sfx: parseInt(sfx.value, 10),
            colorblind: cb.checked,
            reduceFx: rfx.checked,
            helperLabels: hl.checked,
        };
        Storage.setSettings(next);
        Audio.setMusicVolume(next.music);
        Audio.setSfxVolume(next.sfx);
        Game.applySettings();
    };
    [music, sfx].forEach(el => el.addEventListener('input', save));
    [cb, rfx, hl].forEach(el => el.addEventListener('change', save));
}

// ============================================================================
// 16. NAVEGACIÓ
// ============================================================================
function startLevel(level) {
    Audio.resume();
    Screens.show('screen-gameplay');
    Game.start(level);
}

document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => {
        Audio.resume();
        const action = el.dataset.action;
        switch (action) {
            case 'play':
                renderLevelGrid();
                Screens.show('screen-levels');
                break;
            case 'tutorial':
                drawTutorialCanvas();
                Screens.show('screen-tutorial');
                break;
            case 'dashboard':
                renderDashboard();
                Screens.show('screen-dashboard');
                break;
            case 'settings':
                wireSettings();
                Screens.show('screen-settings');
                break;
            case 'back-landing':
                Screens.show('screen-landing');
                break;
            case 'resume':
                Game.resume();
                break;
            case 'retry':
                document.getElementById('gameover-overlay').classList.add('hidden');
                document.getElementById('victory-overlay').classList.add('hidden');
                Game.start(Game.config.level);
                break;
            case 'next':
                document.getElementById('victory-overlay').classList.add('hidden');
                if (Game.config.infinite) {
                    Game.start(21);
                } else if (Game.config.level >= 20) {
                    Game.quit();
                    renderLevelGrid();
                    Screens.show('screen-levels');
                } else {
                    Game.start(Game.config.level + 1);
                }
                break;
            case 'quit':
                Game.quit();
                renderLevelGrid();
                Screens.show('screen-levels');
                break;
            case 'reset-progress':
                if (confirm('Estàs segur? S\'esborrarà tot el progrés i la mestria.')) {
                    Storage.resetAll();
                    renderDashboard();
                    showToast('🗑 Progrés esborrat', '#ff3366');
                }
                break;
        }
    });
});

document.getElementById('hud-pause').addEventListener('click', () => {
    if (Game.state === 'playing') Game.pause();
});

// ============================================================================
// 17. INIT
// ============================================================================
window.addEventListener('load', () => {
    Assets.init();
    SharedBg.init();
    Game.init();
    drawTutorialCanvas();
    renderLevelGrid();
    Screens.show('screen-landing');
});

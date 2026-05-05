/* ============================================================================
   ASTRO-EXPRESS · MOTOR D'ÀUDIO PREMIUM
   - Síntesi FM per notes (sonen com instruments, no oscil·ladors purs)
   - Música ambient procedural amb capes adaptatives al combo
   - ConvolverNode amb impulse response per reverb d'estació
   ============================================================================ */

'use strict';

const AUDIO = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    reverb: null,
    reverbSend: null,
    music: null,
    settings: { master: 0.6, music: 0.4, sfx: 0.7 }
};

const NOTE_FREQ = {
    DO: 261.63, RE: 293.66, MI: 329.63, FA: 349.23,
    SOL: 392.00, LA: 440.00, SI: 493.88
};

function audioInit() {
    if (AUDIO.ctx) return;
    try {
        AUDIO.ctx = new (window.AudioContext || window.webkitAudioContext)();

        AUDIO.masterGain = AUDIO.ctx.createGain();
        AUDIO.masterGain.gain.value = AUDIO.settings.master;
        AUDIO.masterGain.connect(AUDIO.ctx.destination);

        AUDIO.musicGain = AUDIO.ctx.createGain();
        AUDIO.musicGain.gain.value = AUDIO.settings.music;
        AUDIO.musicGain.connect(AUDIO.masterGain);

        AUDIO.sfxGain = AUDIO.ctx.createGain();
        AUDIO.sfxGain.gain.value = AUDIO.settings.sfx;
        AUDIO.sfxGain.connect(AUDIO.masterGain);

        // Reverb d'estació espacial: impulse response sintètic
        AUDIO.reverb = AUDIO.ctx.createConvolver();
        AUDIO.reverb.buffer = generateReverbImpulse(AUDIO.ctx, 2.6, 3.0);
        AUDIO.reverbSend = AUDIO.ctx.createGain();
        AUDIO.reverbSend.gain.value = 0.18;
        AUDIO.reverb.connect(AUDIO.reverbSend).connect(AUDIO.masterGain);
    } catch (e) {
        console.warn('Audio init failed', e);
        AUDIO.ctx = null;
    }
}

function audioResume() {
    if (!AUDIO.ctx) audioInit();
    if (AUDIO.ctx && AUDIO.ctx.state === 'suspended') AUDIO.ctx.resume();
}

function audioSetVolume(channel, value) {
    AUDIO.settings[channel] = value;
    if (!AUDIO.ctx) return;
    if (channel === 'master' && AUDIO.masterGain) AUDIO.masterGain.gain.setTargetAtTime(value, AUDIO.ctx.currentTime, 0.05);
    if (channel === 'music' && AUDIO.musicGain) AUDIO.musicGain.gain.setTargetAtTime(value, AUDIO.ctx.currentTime, 0.05);
    if (channel === 'sfx' && AUDIO.sfxGain) AUDIO.sfxGain.gain.setTargetAtTime(value, AUDIO.ctx.currentTime, 0.05);
}

// Genera un IR de reverb decreixent exponencial — sona com una estació espacial gran
function generateReverbImpulse(ctx, duration, decay) {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            const t = i / length;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
        }
    }
    return buffer;
}

// ============================================================================
// SÍNTESI FM · CADA NOTA SONA COM UN INSTRUMENT (timbre ric, no oscillador pur)
// ============================================================================
function playNoteFM(noteId, options = {}) {
    if (!AUDIO.ctx) return;
    const ctx = AUDIO.ctx;
    const baseFreq = NOTE_FREQ[noteId] || 440;
    const now = ctx.currentTime;
    const duration = options.duration || 0.6;
    const peak = options.peak || 0.18;

    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const ampEnv = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    carrier.type = 'sine';
    modulator.type = 'sine';
    carrier.frequency.value = baseFreq;
    modulator.frequency.value = baseFreq * 2; // ratio 2:1 → timbre brillant
    modGain.gain.value = baseFreq * 1.4;       // index FM

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(baseFreq * 8, now);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + duration);
    filter.Q.value = 2;

    // ADSR envelope
    ampEnv.gain.setValueAtTime(0.0001, now);
    ampEnv.gain.exponentialRampToValueAtTime(peak, now + 0.015);   // attack
    ampEnv.gain.exponentialRampToValueAtTime(peak * 0.7, now + 0.1); // decay
    ampEnv.gain.setValueAtTime(peak * 0.7, now + duration * 0.6);  // sustain
    ampEnv.gain.exponentialRampToValueAtTime(0.0001, now + duration); // release

    modulator.connect(modGain).connect(carrier.frequency);
    carrier.connect(filter).connect(ampEnv);
    ampEnv.connect(AUDIO.sfxGain);
    if (AUDIO.reverb) ampEnv.connect(AUDIO.reverb);

    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + duration + 0.05);
    carrier.stop(now + duration + 0.05);
}

// Acord triada (DO-MI-SOL típic) per als correctes — sona ric
function playTriad(noteId) {
    if (!AUDIO.ctx) return;
    const root = NOTE_FREQ[noteId] || 440;
    const ctx = AUDIO.ctx;
    const now = ctx.currentTime;

    [1, 1.26, 1.5].forEach((mult, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = root * mult;
        gain.gain.setValueAtTime(0.0001, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.5);
        osc.connect(gain).connect(AUDIO.sfxGain);
        if (AUDIO.reverb) gain.connect(AUDIO.reverb);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.55);
    });
}

// UI clicks
function playClick(variant = 'click') {
    if (!AUDIO.ctx) return;
    const ctx = AUDIO.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    osc.type = 'square';
    osc.frequency.setValueAtTime(variant === 'click' ? 1200 : variant === 'hover' ? 600 : 900, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(filter).connect(gain).connect(AUDIO.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
}

// So d'agulla canviant
function playSwitch() {
    if (!AUDIO.ctx) return;
    const ctx = AUDIO.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain).connect(AUDIO.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
}

// Commit sound
function playCommit() {
    if (!AUDIO.ctx) return;
    const ctx = AUDIO.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain).connect(AUDIO.sfxGain);
    osc.start(now);
    osc.stop(now + 0.16);
}

// Col·lisió: capa greu + soroll explosiu
function playCollision() {
    if (!AUDIO.ctx) return;
    const ctx = AUDIO.ctx;
    const now = ctx.currentTime;

    // Capa greu (impacte)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.5);
    osc2.frequency.setValueAtTime(80, now);
    osc2.frequency.exponentialRampToValueAtTime(20, now + 0.5);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc1.connect(gain); osc2.connect(gain);
    gain.connect(AUDIO.sfxGain);
    if (AUDIO.reverb) gain.connect(AUDIO.reverb);
    osc1.start(now); osc2.start(now);
    osc1.stop(now + 0.6); osc2.stop(now + 0.6);

    // Soroll blanc explosiu
    const noiseDur = 0.4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * noiseDur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
    }
    const noise = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.3;
    noise.buffer = buffer;
    noise.connect(noiseFilter).connect(noiseGain).connect(AUDIO.sfxGain);
    if (AUDIO.reverb) noiseGain.connect(AUDIO.reverb);
    noise.start(now);
}

// So combo (puja amb el nivell del combo)
function playCombo(comboLevel) {
    if (!AUDIO.ctx) return;
    const ctx = AUDIO.ctx;
    const now = ctx.currentTime;
    const baseFreq = 600 + Math.min(800, comboLevel * 40);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(AUDIO.sfxGain);
    if (AUDIO.reverb) gain.connect(AUDIO.reverb);
    osc.start(now);
    osc.stop(now + 0.25);
}

// Achievement unlock
function playAchievement() {
    if (!AUDIO.ctx) return;
    const ctx = AUDIO.ctx;
    const seq = [523.25, 659.25, 783.99, 1046.5]; // DO5, MI5, SOL5, DO6
    seq.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + i * 0.08;
        osc.type = 'triangle';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.connect(gain).connect(AUDIO.sfxGain);
        if (AUDIO.reverb) gain.connect(AUDIO.reverb);
        osc.start(t);
        osc.stop(t + 0.45);
    });
}

// Fanfàrria de victòria
function playFanfare() {
    if (!AUDIO.ctx) return;
    const ctx = AUDIO.ctx;
    const seq = [
        { f: 261.63, t: 0 },     // DO
        { f: 329.63, t: 0.12 },  // MI
        { f: 392.00, t: 0.24 },  // SOL
        { f: 523.25, t: 0.36 },  // DO5
        { f: 659.25, t: 0.50, dur: 0.6 } // MI5 sustained
    ];
    seq.forEach(s => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + s.t;
        const dur = s.dur || 0.3;
        osc.type = 'triangle';
        osc.frequency.value = s.f;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(AUDIO.sfxGain);
        if (AUDIO.reverb) gain.connect(AUDIO.reverb);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    });
}

// ============================================================================
// SO DE TREN AMB DOPPLER REAL
// ============================================================================
function createTrainSound(noteId) {
    if (!AUDIO.ctx) return { update: () => {}, stop: () => {}, fade: () => {} };
    const ctx = AUDIO.ctx;
    const baseFreq = NOTE_FREQ[noteId] || 440;
    const now = ctx.currentTime;

    // Capa 1: zumzeig de motor
    const motor = ctx.createOscillator();
    const motorFilter = ctx.createBiquadFilter();
    const motorGain = ctx.createGain();
    motor.type = 'triangle';
    motor.frequency.value = baseFreq * 0.5;
    motorFilter.type = 'lowpass';
    motorFilter.frequency.value = 1500;
    motorGain.gain.setValueAtTime(0.0001, now);
    motorGain.gain.exponentialRampToValueAtTime(0.03, now + 0.4);
    motor.connect(motorFilter).connect(motorGain).connect(AUDIO.sfxGain);

    // Capa 2: harmònic agud
    const high = ctx.createOscillator();
    const highGain = ctx.createGain();
    high.type = 'sine';
    high.frequency.value = baseFreq * 2;
    highGain.gain.setValueAtTime(0.0001, now);
    highGain.gain.exponentialRampToValueAtTime(0.015, now + 0.6);
    high.connect(highGain).connect(AUDIO.sfxGain);

    motor.start(now);
    high.start(now);

    return {
        update(progress) {
            // Doppler: freq augmenta a l'apropar-se, baixa al passar
            const t = ctx.currentTime;
            const dopplerFactor = 1 + (progress - 0.5) * 0.5;
            try {
                motor.frequency.setTargetAtTime(baseFreq * 0.5 * dopplerFactor, t, 0.05);
                high.frequency.setTargetAtTime(baseFreq * 2 * dopplerFactor, t, 0.05);
                const intensity = 0.03 + progress * 0.06;
                motorGain.gain.setTargetAtTime(intensity, t, 0.1);
                highGain.gain.setTargetAtTime(intensity * 0.5, t, 0.1);
            } catch (e) {}
        },
        fade() {
            try {
                const t = ctx.currentTime;
                motorGain.gain.setTargetAtTime(0.0001, t, 0.15);
                highGain.gain.setTargetAtTime(0.0001, t, 0.15);
                motor.stop(t + 0.6);
                high.stop(t + 0.6);
            } catch (e) {}
        },
        stop() {
            try { motor.stop(); high.stop(); } catch (e) {}
        }
    };
}

// ============================================================================
// MÚSICA AMBIENT PROCEDURAL
// Capes que s'activen segons intensitat (combo): pad → arpegi → percussió
// ============================================================================
function startAmbientMusic() {
    if (!AUDIO.ctx) return;
    if (AUDIO.music) return; // ja iniciada
    const ctx = AUDIO.ctx;

    AUDIO.music = {
        nodes: [],
        intensity: 0,
        intensityTarget: 0,
        running: true,
        nextArpTime: 0,
        nextPercTime: 0
    };

    // Capa 1: pad continu (acord menor evocador en ambient)
    // Notes: A2, E3, G3, B3 (Am7) — sci-fi pensatiu
    const padFreqs = [110, 164.81, 196.00, 246.94];
    const padGain = ctx.createGain();
    padGain.gain.value = 0;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 600;
    padGain.connect(padFilter).connect(AUDIO.musicGain);
    if (AUDIO.reverb) padGain.connect(AUDIO.reverb);

    padFreqs.forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        // Lleugera detune per amplada
        const detune = ctx.createOscillator();
        detune.type = 'sawtooth';
        detune.frequency.value = f * 1.005;
        const subGain = ctx.createGain();
        subGain.gain.value = 0.06;
        osc.connect(subGain).connect(padGain);
        detune.connect(subGain);
        osc.start();
        detune.start();
        AUDIO.music.nodes.push(osc, detune);
    });

    // LFO al filtre del pad → moviment lent
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(padFilter.frequency);
    lfo.start();
    AUDIO.music.nodes.push(lfo);
    AUDIO.music.padGain = padGain;

    // Capa 2: arpegi pentatònic procedural
    const arpGain = ctx.createGain();
    arpGain.gain.value = 0;
    arpGain.connect(AUDIO.musicGain);
    if (AUDIO.reverb) arpGain.connect(AUDIO.reverb);
    AUDIO.music.arpGain = arpGain;
    AUDIO.music.arpScale = [220, 246.94, 277.18, 329.63, 369.99, 440]; // A pentatònica
    AUDIO.music.arpStep = 0;

    // Loop d'animació
    function tick() {
        if (!AUDIO.music || !AUDIO.music.running) return;
        const t = ctx.currentTime;

        // Smooth intensity
        AUDIO.music.intensity += (AUDIO.music.intensityTarget - AUDIO.music.intensity) * 0.05;

        // Pad gain segons intensitat (sempre present però varia)
        const padTarget = 0.15 + AUDIO.music.intensity * 0.15;
        AUDIO.music.padGain.gain.setTargetAtTime(padTarget, t, 0.5);

        // Arpegi: només si intensitat > 0.3
        const arpTarget = AUDIO.music.intensity > 0.3 ? 0.12 : 0;
        AUDIO.music.arpGain.gain.setTargetAtTime(arpTarget, t, 0.3);

        // Disparar arpegi rítmic
        if (t > AUDIO.music.nextArpTime && AUDIO.music.intensity > 0.25) {
            const speed = 0.2 - AUDIO.music.intensity * 0.08; // més ràpid amb més intensitat
            spawnArpNote(ctx);
            AUDIO.music.nextArpTime = t + speed;
        }

        // Percussió subtil (kick) en moments d'alta intensitat
        if (t > AUDIO.music.nextPercTime && AUDIO.music.intensity > 0.6) {
            spawnKick(ctx);
            AUDIO.music.nextPercTime = t + 0.5;
        } else if (t > AUDIO.music.nextPercTime) {
            AUDIO.music.nextPercTime = t + 0.5;
        }

        requestAnimationFrame(tick);
    }
    tick();
}

function spawnArpNote(ctx) {
    const m = AUDIO.music;
    const f = m.arpScale[m.arpStep % m.arpScale.length];
    m.arpStep++;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.value = f * 2;
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.connect(filter).connect(gain).connect(m.arpGain);
    osc.start(now);
    osc.stop(now + 0.32);
}

function spawnKick(ctx) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(gain).connect(AUDIO.musicGain);
    osc.start(now);
    osc.stop(now + 0.22);
}

function setMusicIntensity(level) {
    if (!AUDIO.music) return;
    AUDIO.music.intensityTarget = Math.max(0, Math.min(1, level));
}

function stopAmbientMusic() {
    if (!AUDIO.music) return;
    AUDIO.music.running = false;
    AUDIO.music.nodes.forEach(n => { try { n.stop(); } catch (e) {} });
    AUDIO.music = null;
}

/* ============================================================================
   ASTRO-EXPRESS · CONTROL ORBITAL · MOTOR PRINCIPAL · v3.1 AAA
   Integració: curriculum, combo, achievements, slow-mo, post-processing
   ============================================================================ */

'use strict';

// ============================================================================
// DADES · NOTES, CURRICULUM, ACHIEVEMENTS
// ============================================================================
const NOTES = [
    { id: 'DO',  key: '1', staffPosition: 0, color: '#ff3c5a', shape: 'circle' },
    { id: 'RE',  key: '2', staffPosition: 1, color: '#ff8a3c', shape: 'triangle' },
    { id: 'MI',  key: '3', staffPosition: 2, color: '#ffcc00', shape: 'square' },
    { id: 'FA',  key: '4', staffPosition: 3, color: '#00ff9c', shape: 'pentagon' },
    { id: 'SOL', key: '5', staffPosition: 4, color: '#00f0ff', shape: 'hexagon' },
    { id: 'LA',  key: '6', staffPosition: 5, color: '#8a4cff', shape: 'diamond' },
    { id: 'SI',  key: '7', staffPosition: 6, color: '#ff2d95', shape: 'star' }
];
const NOTE_BY_ID = Object.fromEntries(NOTES.map(n => [n.id, n]));

// Currículum pedagògic: cada nivell introdueix notes progressivament
const CURRICULUM = [
    { id: 1,  name: 'KEPLER-186F',     pool: ['DO','SOL'],                                       fallSpeed: 70,  spawnInterval: 2800, target: 8,  desc: 'Línies extremes' },
    { id: 2,  name: 'TRAPPIST-1E',     pool: ['DO','MI','SOL'],                                  fallSpeed: 80,  spawnInterval: 2700, target: 10, desc: 'Línia central' },
    { id: 3,  name: 'PROXIMA-B',       pool: ['DO','RE','MI','SOL'],                             fallSpeed: 85,  spawnInterval: 2600, target: 12, desc: 'Quatre notes' },
    { id: 4,  name: 'GLIESE-581G',     pool: ['DO','RE','MI','FA','SOL'],                        fallSpeed: 95,  spawnInterval: 2500, target: 12, desc: 'Mig pentagrama' },
    { id: 5,  name: 'TAU-CETI-F',      pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 100, spawnInterval: 2400, target: 15, desc: 'Set notes · lent' },
    { id: 6,  name: 'WOLF-1061C',      pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 115, spawnInterval: 2300, target: 15, desc: 'Set notes' },
    { id: 7,  name: 'ROSS-128B',       pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 130, spawnInterval: 2150, target: 16, desc: 'Augmenta el ritme' },
    { id: 8,  name: 'LHS-1140B',       pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 145, spawnInterval: 2000, target: 17, desc: 'Velocitat creuera' },
    { id: 9,  name: 'TEEGARDEN-B',     pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 160, spawnInterval: 1850, target: 18, desc: 'Augment de càrrega' },
    { id: 10, name: 'K2-18B',          pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 175, spawnInterval: 1700, target: 20, desc: 'Repte intermedi' },
    { id: 11, name: 'TOI-700D',        pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 185, spawnInterval: 1550, target: 20, desc: 'Densitat alta' },
    { id: 12, name: 'KEPLER-442B',     pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 195, spawnInterval: 1450, target: 22, desc: 'Pressió creixent' },
    { id: 13, name: 'GLIESE-667CC',    pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 205, spawnInterval: 1350, target: 22, desc: 'Llindar expert' },
    { id: 14, name: 'KEPLER-62F',      pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 215, spawnInterval: 1250, target: 25, desc: 'Lectura ràpida' },
    { id: 15, name: 'KEPLER-1649C',    pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 225, spawnInterval: 1150, target: 25, desc: 'Domini avançat' },
    { id: 16, name: 'KEPLER-22B',      pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 235, spawnInterval: 1080, target: 27, desc: 'Hipervelocitat' },
    { id: 17, name: 'GLIESE-832C',     pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 245, spawnInterval: 1000, target: 28, desc: 'Mestre orbital' },
    { id: 18, name: 'WOLF-359',        pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 255, spawnInterval: 950,  target: 30, desc: 'Saturació' },
    { id: 19, name: 'BARNARD-B',       pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 270, spawnInterval: 900,  target: 30, desc: 'Pre-final' },
    { id: 20, name: 'ALPHA-CENTAURI',  pool: ['DO','RE','MI','FA','SOL','LA','SI'],              fallSpeed: 290, spawnInterval: 850,  target: 35, desc: 'Final · ATAC' }
];

const ACHIEVEMENTS = [
    { id: 'first_hit',   icon: '★', name: 'PRIMER CONTACTE',     desc: 'Encerta el teu primer tren',         check: s => s.totalCorrect >= 1 },
    { id: 'combo_10',    icon: '⚡', name: 'RACHA',                desc: 'Encadena 10 encerts seguits',         check: s => s.bestCombo >= 10 },
    { id: 'combo_25',    icon: '⚡', name: 'FLUX CONTINU',         desc: 'Encadena 25 encerts seguits',         check: s => s.bestCombo >= 25 },
    { id: 'combo_50',    icon: '🔥', name: 'INCANDESCENT',         desc: 'Encadena 50 encerts seguits',         check: s => s.bestCombo >= 50 },
    { id: 'master_DO',   icon: '◉', name: 'MESTRE DEL DO',        desc: 'Encerta 50 vegades la nota DO',      check: s => (s.noteStats.DO?.correct || 0) >= 50 },
    { id: 'master_SOL',  icon: '⬢', name: 'MESTRE DEL SOL',       desc: 'Encerta 50 vegades la nota SOL',     check: s => (s.noteStats.SOL?.correct || 0) >= 50 },
    { id: 'all_notes',   icon: '◈', name: 'POLIGLOT HARMÒNIC',    desc: 'Encerta totes les 7 notes almenys un cop', check: s => NOTES.every(n => (s.noteStats[n.id]?.correct || 0) >= 1) },
    { id: 'level_5',     icon: '▲', name: 'LECTURA SOLVENT',      desc: 'Completa la ruta 5',                 check: s => s.completedLevels >= 5 },
    { id: 'level_10',    icon: '▲', name: 'CONTROLADOR EXPERT',   desc: 'Completa la ruta 10',                check: s => s.completedLevels >= 10 },
    { id: 'level_15',    icon: '▲', name: 'PILOT VETERÀ',         desc: 'Completa la ruta 15',                check: s => s.completedLevels >= 15 },
    { id: 'level_20',    icon: '✦', name: 'COMANDANT D\'ALPHA-7',  desc: 'Completa totes 20 rutes',            check: s => s.completedLevels >= 20 },
    { id: 'perfect',     icon: '◆', name: 'EXECUCIÓ PERFECTA',    desc: 'Completa una ruta sense errors',     check: s => s.perfectRuns >= 1 },
    { id: 'speed_demon', icon: '☄', name: 'DEMONI DE LA VELOCITAT', desc: 'Completa la ruta 15 o superior',  check: s => s.maxLevelCompleted >= 15 },
    { id: 'centurion',   icon: '⊕', name: 'CENTURIÓ',              desc: 'Acumula 1000 encerts totals',         check: s => s.totalCorrect >= 1000 },
    { id: 'orbital_master', icon: '✸', name: 'MESTRE ORBITAL',     desc: 'Desbloca tots els altres assoliments', check: (s, all) => Object.keys(s.unlocked).length >= ACHIEVEMENTS.length - 1 }
];

const STORAGE_KEY = 'astro-express-v3';

// ============================================================================
// ESTAT GLOBAL
// ============================================================================
const state = {
    currentScreen: 'boot',
    currentLevel: 1,
    save: loadSave(),
    starfield: null,
    game: null,
    settings: {
        bloom: true,
        shake: true,
        showLetters: false,
        showShapes: true
    }
};

// ============================================================================
// PERSISTÈNCIA
// ============================================================================
function loadSave() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultSave();
        const data = JSON.parse(raw);
        const def = defaultSave();
        return Object.assign(def, data, { stats: Object.assign(def.stats, data.stats || {}) });
    } catch (e) {
        return defaultSave();
    }
}

function defaultSave() {
    return {
        unlocked: 1,
        completed: {},          // { levelId: { score, accuracy, bestCombo, perfect } }
        stats: {
            totalCorrect: 0,
            totalAttempts: 0,
            bestCombo: 0,
            completedLevels: 0,
            maxLevelCompleted: 0,
            perfectRuns: 0,
            noteStats: {},      // { noteId: { correct, total } }
            unlocked: {}        // achievement ids
        },
        settings: {
            master: 0.6, music: 0.4, sfx: 0.7,
            bloom: true, shake: true, showLetters: false, showShapes: true
        }
    };
}

function saveAll() {
    try {
        state.save.settings = {
            master: AUDIO.settings.master, music: AUDIO.settings.music, sfx: AUDIO.settings.sfx,
            bloom: state.settings.bloom, shake: state.settings.shake,
            showLetters: state.settings.showLetters, showShapes: state.settings.showShapes
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.save));
    } catch (e) {}
}

function resetSave() {
    state.save = defaultSave();
    saveAll();
    renderLevelGrid();
    renderAchievements();
}

// ============================================================================
// INICI
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    initScreenRouting();
    initLevelSelector();
    initSettings();
    initGameplay();
    initKeyboard();

    // Aplica settings desats
    Object.assign(state.settings, state.save.settings || {});

    // Engega l'àudio al primer input
    const start = () => { audioResume(); applyAudioSettings(); };
    document.body.addEventListener('pointerdown', start, { once: true });
    document.body.addEventListener('keydown', start, { once: true });

    runBootSequence();
});

function applyAudioSettings() {
    audioSetVolume('master', state.save.settings.master);
    audioSetVolume('music', state.save.settings.music);
    audioSetVolume('sfx', state.save.settings.sfx);
}

// ============================================================================
// BOOT SEQUENCE
// ============================================================================
function runBootSequence() {
    const fill = document.getElementById('bootFill');
    const log = document.getElementById('bootLog');
    const lines = [
        '> Inicialitzant sistema orbital...',
        '> Carregant motor harmònic v3.1...',
        '> [OK] Calibrant sensors de via',
        '> [OK] Sincronitzant pentagrames',
        '> [OK] Activant protocol SOLFEIG',
        '> Connectant amb Estació Alpha-7...',
        '> [OK] Connexió establerta',
        '> Sistema operatiu · LLEST'
    ];
    let i = 0;
    let progress = 0;
    const total = lines.length;
    const id = setInterval(() => {
        const line = document.createElement('div');
        line.className = 'log-line' + (lines[i].includes('[OK]') ? ' log-ok' : '');
        line.textContent = lines[i];
        log.appendChild(line);
        i++;
        progress = (i / total) * 100;
        fill.style.width = progress + '%';
        if (i >= total) {
            clearInterval(id);
            setTimeout(() => switchScreen('landing'), 600);
        }
    }, 220);
}

// ============================================================================
// FONS · STARFIELD
// ============================================================================
function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const layers = 4;
        const perLayer = 80;
        stars = [];
        for (let l = 0; l < layers; l++) {
            for (let i = 0; i < perLayer; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    z: l + 1,
                    r: (l + 1) * 0.4 + Math.random() * 0.7,
                    twinkle: Math.random() * Math.PI * 2,
                    speed: (l + 1) * 0.05,
                    color: l === 3 ? `hsl(${190 + Math.random() * 60}, 70%, 75%)` : 'rgba(220, 240, 255, 1)'
                });
            }
        }
    }

    function frame(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const s of stars) {
            s.y += s.speed;
            if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
            const tw = 0.5 + 0.5 * Math.sin(t * 0.002 + s.twinkle);
            ctx.globalAlpha = 0.3 + tw * 0.65;
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(frame);
    state.starfield = { canvas, ctx };
}

// ============================================================================
// SCREEN ROUTING + WIPE
// ============================================================================
function switchScreen(name, useWipe = true) {
    if (state.currentScreen === name) return;
    if (useWipe) {
        const wipe = document.getElementById('screenWipe');
        wipe.classList.add('wiping');
        setTimeout(() => {
            doSwitch(name);
            setTimeout(() => wipe.classList.remove('wiping'), 50);
        }, 300);
        // Reset wipe transform after animation
        setTimeout(() => {
            wipe.style.transition = 'none';
            wipe.style.transform = 'translateX(-150%)';
            requestAnimationFrame(() => {
                wipe.style.transition = '';
            });
        }, 700);
    } else {
        doSwitch(name);
    }
}

function doSwitch(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('active');
    state.currentScreen = name;

    // Música ambient en pantalles no-gameplay
    if (name === 'landing' || name === 'levels' || name === 'tutorial' || name === 'achievements' || name === 'settings') {
        if (AUDIO.ctx) startAmbientMusic();
        setMusicIntensity(0.3);
    }
}

function initScreenRouting() {
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        playClick();
        handleAction(action);
    });
}

function handleAction(action) {
    switch (action) {
        case 'goto-landing': switchScreen('landing'); stopGame(); break;
        case 'goto-tutorial': startTutorialFlow(); break;
        case 'tutorial-dismiss-intro': dismissTutorialIntro(); break;
        case 'tutorial-finish-levels': exitTutorial(); switchScreen('levels'); renderLevelGrid(); break;
        case 'tutorial-finish-restart': exitTutorial(); startTutorialFlow(); break;
        case 'goto-levels': switchScreen('levels'); renderLevelGrid(); break;
        case 'goto-achievements': switchScreen('achievements'); renderAchievements(); break;
        case 'goto-settings': switchScreen('settings'); renderSettings(); break;
        case 'resume': resumeGame(); break;
        case 'restart': restartGame(); break;
        case 'next-level': nextLevel(); break;
        case 'exit-to-levels': stopGame(); switchScreen('levels'); renderLevelGrid(); break;
    }
}

function shapeUnicode(shape) {
    return { circle: '●', triangle: '▲', square: '■', pentagon: '⬟', hexagon: '⬢', diamond: '◆', star: '★' }[shape] || '●';
}

// ============================================================================
// TUTORIAL · INTEGRAT AL GAMEPLAY (mateix canvas, vies i andanes)
// El tren es PARA a la línia de compromís fins que premes una andana.
// Sense pèrdua de vides; els errors només reinicien el tren.
// ============================================================================
const TUTORIAL_STAGES = [
    {
        title: 'IDENTIFICA EL DO',
        desc: 'El <strong>DO</strong> apareix sota la línia inferior amb una <strong>línia addicional</strong>. El tren <strong>es pararà</strong> a la línia groga: prem la <strong>tecla 1</strong> (o l\'andana DO) per enviar-lo.',
        pool: ['DO'],
        target: 2,
        fallSpeed: 70,
        spawnInterval: 2400,
        hintNote: 'DO'
    },
    {
        title: 'IDENTIFICA EL SOL',
        desc: 'El <strong>SOL</strong> es troba a la <strong>2a línia</strong> per sota (la línia que envolta la clau de sol). Prem la <strong>tecla 5</strong>.',
        pool: ['SOL'],
        target: 2,
        fallSpeed: 75,
        spawnInterval: 2400,
        hintNote: 'SOL'
    },
    {
        title: 'NOTES BARREJADES',
        desc: 'Ara apareixen <strong>DO i SOL</strong> alternats. Identifica cada nota i envia-la a la seva andana.',
        pool: ['DO', 'SOL'],
        target: 4,
        fallSpeed: 90,
        spawnInterval: 2200
    },
    {
        title: 'AFEGIM EL MI',
        desc: 'El <strong>MI</strong> és a la <strong>línia inferior</strong> del pentagrama. Prem la <strong>tecla 3</strong>.',
        pool: ['DO', 'SOL', 'MI'],
        target: 4,
        fallSpeed: 100,
        spawnInterval: 2100,
        hintNote: 'MI'
    },
    {
        title: 'COMBO',
        desc: 'Encadena <strong>3 encerts seguits</strong>. Si falles, el combo es reinicia a 0.',
        pool: ['DO', 'SOL', 'MI'],
        target: 3,
        targetCombo: true,
        fallSpeed: 110,
        spawnInterval: 2000
    },
    {
        title: 'PROTOCOL DESBLOCAT',
        desc: 'Has completat l\'entrenament. Estàs llest per la teva primera missió orbital.',
        finish: true
    }
];

function startTutorialFlow() {
    state.currentLevel = 0;
    switchScreen('gameplay', false);
    setupTutorial();
    enterTutorialStage(0);
}

function setupTutorial() {
    const g = state.game;
    g.tutorialMode = true;
    g.tutorialStage = 0;
    g.tutorialCorrect = 0;
    g.tutorialPausedForIntro = false;
    g.score = 0;
    g.animatedScore = 0;
    g.lives = 99;
    g.objective = 0;
    g.objectiveTarget = TUTORIAL_STAGES.length - 1;
    g.trains = [];
    g.nextSpawn = 0;
    g.combo = 0;
    g.bestCombo = 0;
    g.armedAndana = 0;
    g.shake = 0;
    g.flashIntensity = 0;
    g.chromAberr = 0;
    g.elapsedSinceStart = 0;
    g.timeScale = 1;
    g.timeScaleTarget = 1;
    g.slowMo = false;
    g.correctHits = 0;
    g.totalHits = 0;
    g.sessionNoteStats = {};
    g.levelErrors = 0;
    g.newNotes = new Set();   // al tutorial sempre es mostra la lletra (via tutorialMode)
    g.levelData = { name: 'TUTORIAL', pool: ['DO', 'SOL'], target: 0 };

    document.getElementById('hudLevel').textContent = 'TUT';
    document.getElementById('hudRouteName').textContent = 'ENTRENAMENT INTERACTIU';
    document.getElementById('hudCombo').textContent = '×1';
    document.getElementById('hudComboBlock').classList.remove('combo-hot', 'combo-fire');
    document.getElementById('slowmoIndicator').classList.remove('show');
    document.getElementById('screen-gameplay').classList.add('tutorial-mode');
    document.querySelectorAll('.overlay-modal').forEach(m => m.classList.remove('show'));
    refreshArmedButton();
    vfxClear();
    setMusicIntensity(0.4);
}

function enterTutorialStage(idx) {
    const g = state.game;
    const stage = TUTORIAL_STAGES[idx];
    if (!stage) return;
    g.tutorialStage = idx;
    g.tutorialCorrect = 0;
    g.combo = 0;
    g.trains.forEach(t => t.sound?.stop());
    g.trains = [];
    vfxClear();

    if (stage.finish) {
        endTutorialFlow();
        return;
    }

    g.fallSpeed = stage.fallSpeed;
    g.spawnInterval = stage.spawnInterval;
    g.levelData = { name: stage.title, pool: stage.pool, target: stage.target };

    document.getElementById('hudObjective').textContent = `0/${stage.target}`;
    document.getElementById('objectiveFill').style.width = '0%';
    document.querySelectorAll('.andana-btn').forEach(b => b.classList.remove('hint'));
    if (stage.hintNote) {
        const hi = NOTES.findIndex(n => n.id === stage.hintNote);
        const btn = document.querySelector(`.andana-btn[data-idx="${hi}"]`);
        if (btn) btn.classList.add('hint');
        // armem automàticament l'andana de pista per a que no obligui a "moure" abans
        g.armedAndana = hi;
        refreshArmedButton();
    }

    showTutorialIntro(stage, idx);
}

function showTutorialIntro(stage, idx) {
    const g = state.game;
    g.tutorialPausedForIntro = true;
    g.running = false;
    const overlay = document.getElementById('tutorialIntroOverlay');
    if (!overlay) return;
    const totalStages = TUTORIAL_STAGES.length - 1;
    overlay.querySelector('.tut-intro-step').textContent = `FASE ${String(idx + 1).padStart(2, '0')} / ${String(totalStages).padStart(2, '0')}`;
    overlay.querySelector('.tut-intro-title').textContent = stage.title;
    overlay.querySelector('.tut-intro-desc').innerHTML = stage.desc;
    const goalText = stage.targetCombo
        ? `${stage.target} encerts <strong>seguits</strong>`
        : `${stage.target} encerts`;
    overlay.querySelector('.tut-intro-objective').innerHTML = '▼ OBJECTIU: ' + goalText;
    overlay.classList.add('show');
}

function dismissTutorialIntro() {
    const g = state.game;
    if (!g || !g.tutorialMode) return;
    g.tutorialPausedForIntro = false;
    g.running = true;
    g.lastTime = performance.now();
    g.nextSpawn = 600;
    document.getElementById('tutorialIntroOverlay')?.classList.remove('show');
}

function endTutorialFlow() {
    const g = state.game;
    g.running = false;
    g.trains.forEach(t => t.sound?.stop());
    g.trains = [];
    document.getElementById('tutorialEndOverlay')?.classList.add('show');
    playFanfare();
}

function exitTutorial() {
    const g = state.game;
    if (g) g.tutorialMode = false;
    stopGame();
    document.getElementById('screen-gameplay').classList.remove('tutorial-mode');
    document.getElementById('tutorialIntroOverlay')?.classList.remove('show');
    document.getElementById('tutorialEndOverlay')?.classList.remove('show');
    document.querySelectorAll('.andana-btn').forEach(b => b.classList.remove('hint'));
}

// ============================================================================
// LEVEL SELECTOR
// ============================================================================
function initLevelSelector() {
    document.getElementById('resetProgressBtn').addEventListener('click', () => {
        if (confirm('Vols reiniciar tot el progrés? Aquesta acció no es pot desfer.')) {
            resetSave();
        }
    });
}

function renderLevelGrid() {
    const grid = document.getElementById('levelsGrid');
    grid.innerHTML = '';
    let completedCount = 0;
    for (let i = 1; i <= CURRICULUM.length; i++) {
        const level = CURRICULUM[i - 1];
        const completion = state.save.completed[i];
        const isCompleted = !!completion;
        const isUnlocked = i <= state.save.unlocked;
        if (isCompleted) completedCount++;

        const card = document.createElement('div');
        card.className = 'level-card' + (isCompleted ? ' completed' : '') + (!isUnlocked ? ' locked' : '');
        const stars = isCompleted ? computeStars(completion) : '';
        card.innerHTML = `
            <div class="level-num">${String(i).padStart(2, '0')}</div>
            <div class="level-name">${level.name}</div>
            <div class="level-difficulty">${difficultyLabel(i)}</div>
            <div class="level-pool">${level.pool.length} NOTES</div>
            ${stars ? `<div class="stars">${stars}</div>` : ''}
            ${!isUnlocked ? '<div class="lock-icon">🔒</div>' : ''}
        `;
        if (isUnlocked) {
            card.addEventListener('click', () => {
                playClick();
                startLevel(i);
            });
        }
        grid.appendChild(card);
    }
    document.getElementById('progressFill').style.width = `${(completedCount / CURRICULUM.length) * 100}%`;
    document.getElementById('progressText').textContent = `${completedCount}/${CURRICULUM.length}`;
}

function computeStars(c) {
    if (!c) return '';
    if (c.accuracy >= 95) return '★★★';
    if (c.accuracy >= 80) return '★★';
    return '★';
}

function difficultyLabel(level) {
    if (level <= 4) return '◆ INICIAL';
    if (level <= 10) return '◆◆ AVANÇAT';
    if (level <= 15) return '◆◆◆ EXPERT';
    return '◆◆◆◆ MESTRE';
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================
function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = '';
    const unlocked = state.save.stats.unlocked || {};
    let unlockedCount = 0;
    ACHIEVEMENTS.forEach(a => {
        const isUnlocked = !!unlocked[a.id];
        if (isUnlocked) unlockedCount++;
        const card = document.createElement('div');
        card.className = 'achievement-card' + (isUnlocked ? ' unlocked' : ' locked');
        card.innerHTML = `
            <div class="achievement-icon">${isUnlocked ? a.icon : '?'}</div>
            <div class="achievement-info">
                <div class="achievement-name">${isUnlocked ? a.name : '—— BLOQUEJAT ——'}</div>
                <div class="achievement-desc">${a.desc}</div>
            </div>
        `;
        grid.appendChild(card);
    });
    document.getElementById('achievFill').style.width = `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`;
    document.getElementById('achievText').textContent = `${unlockedCount}/${ACHIEVEMENTS.length}`;
}

function checkAchievements() {
    const stats = state.save.stats;
    const newlyUnlocked = [];
    ACHIEVEMENTS.forEach(a => {
        if (stats.unlocked[a.id]) return;
        if (a.check(stats, ACHIEVEMENTS)) {
            stats.unlocked[a.id] = Date.now();
            newlyUnlocked.push(a);
        }
    });
    if (newlyUnlocked.length > 0) {
        saveAll();
        newlyUnlocked.forEach((a, i) => {
            setTimeout(() => showAchievementToast(a), i * 600);
        });
    }
}

function showAchievementToast(a) {
    const layer = document.getElementById('toastLayer');
    if (!layer) return;
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="toast-icon">${a.icon}</div>
        <div class="toast-content">
            <div class="toast-title">▣ ASSOLIMENT DESBLOQUEJAT</div>
            <div class="toast-name">${a.name}</div>
            <div class="toast-desc">${a.desc}</div>
        </div>
    `;
    layer.appendChild(toast);
    playAchievement();
    setTimeout(() => toast.remove(), 4500);
}

// ============================================================================
// SETTINGS
// ============================================================================
function initSettings() {
    const sliders = [
        { id: 'setMaster', val: 'setMasterVal', channel: 'master' },
        { id: 'setMusic', val: 'setMusicVal', channel: 'music' },
        { id: 'setSfx', val: 'setSfxVal', channel: 'sfx' }
    ];
    sliders.forEach(s => {
        const el = document.getElementById(s.id);
        const valEl = document.getElementById(s.val);
        if (!el) return;
        el.addEventListener('input', () => {
            const v = parseInt(el.value, 10);
            valEl.textContent = v;
            audioSetVolume(s.channel, v / 100);
            saveAll();
        });
    });

    const toggles = [
        { id: 'setLetterToggle', key: 'showLetters' },
        { id: 'setShapesToggle', key: 'showShapes' },
        { id: 'setBloomToggle', key: 'bloom' },
        { id: 'setShakeToggle', key: 'shake' }
    ];
    toggles.forEach(t => {
        const row = document.getElementById(t.id);
        if (!row) return;
        const sw = row.querySelector('.toggle-switch');
        sw.addEventListener('click', () => {
            const isOn = sw.dataset.state === 'on';
            sw.dataset.state = isOn ? 'off' : 'on';
            state.settings[t.key] = !isOn;
            saveAll();
        });
    });
}

function renderSettings() {
    const s = state.save.settings;
    const set = (id, val, valId) => {
        const el = document.getElementById(id);
        if (el) el.value = Math.round(val * 100);
        const valEl = document.getElementById(valId);
        if (valEl) valEl.textContent = Math.round(val * 100);
    };
    set('setMaster', s.master, 'setMasterVal');
    set('setMusic', s.music, 'setMusicVal');
    set('setSfx', s.sfx, 'setSfxVal');

    const setToggle = (id, val) => {
        const row = document.getElementById(id);
        if (!row) return;
        const sw = row.querySelector('.toggle-switch');
        sw.dataset.state = val ? 'on' : 'off';
    };
    setToggle('setLetterToggle', state.settings.showLetters);
    setToggle('setShapesToggle', state.settings.showShapes);
    setToggle('setBloomToggle', state.settings.bloom);
    setToggle('setShakeToggle', state.settings.shake);
}

// ============================================================================
// KEYBOARD
// ============================================================================
function initKeyboard() {
    document.addEventListener('keydown', (e) => {
        if (state.currentScreen === 'gameplay') {
            const g = state.game;
            // Intro del tutorial: Espai/Enter per començar la fase
            if (g && g.tutorialMode && g.tutorialPausedForIntro) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    dismissTutorialIntro();
                }
                return;
            }
            if (g && g.running && !g.paused) {
                const idx = parseInt(e.key, 10);
                if (idx >= 1 && idx <= 7) { selectAndana(idx - 1); return; }
                if (!g.tutorialMode && (e.key === 'Escape' || e.key === 'p' || e.key === 'P')) togglePause();
            }
        } else if (state.currentScreen === 'landing' && e.key === 'Enter') {
            handleAction('goto-levels');
        }
    });
}

// ============================================================================
// GAMEPLAY · CANVAS ENGINE
// ============================================================================
function initGameplay() {
    const canvas = document.getElementById('gameCanvas');
    const bloomCanvas = document.getElementById('bloomCanvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        vfxResize();
    }
    window.addEventListener('resize', resize);
    vfxInit(bloomCanvas);
    resize();

    state.game = {
        canvas, ctx, bloomCanvas,
        running: false, paused: false,
        level: 1, levelData: CURRICULUM[0],
        score: 0, lives: 3,
        objective: 0, objectiveTarget: 15,
        trains: [],
        nextSpawn: 0,
        spawnInterval: 2400,
        fallSpeed: 90,
        armedAndana: 3,
        shake: 0,
        flashIntensity: 0,
        chromAberr: 0,
        timeScale: 1,             // slow-mo
        timeScaleTarget: 1,
        lastTime: 0,
        elapsedSinceStart: 0,
        correctHits: 0,
        totalHits: 0,
        accuracy: 0,
        combo: 0,
        bestCombo: 0,
        sessionNoteStats: {},     // estadístiques d'aquest nivell
        slowMo: false,
        levelErrors: 0,
        animatedScore: 0          // valor mostrat (animat)
    };

    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    renderAndanaDeck();
    requestAnimationFrame(gameLoop);
}

function renderAndanaDeck() {
    const deck = document.getElementById('andanaDeck');
    deck.innerHTML = '';
    NOTES.forEach((note, i) => {
        const btn = document.createElement('button');
        btn.className = 'andana-btn';
        btn.style.setProperty('--andana-color', note.color);
        btn.dataset.idx = i;
        const shape = state.settings.showShapes ? `<div class="andana-shape">${shapeUnicode(note.shape)}</div>` : '';
        btn.innerHTML = `
            <div class="andana-key"><kbd>${note.key}</kbd></div>
            ${shape}
            <div class="andana-note">${note.id}</div>
        `;
        btn.addEventListener('click', () => selectAndana(i));
        deck.appendChild(btn);
    });
}

function selectAndana(idx) {
    if (!state.game || !state.game.running || state.game.paused) return;
    if (idx < 0 || idx >= NOTES.length) return;
    const g = state.game;
    g.armedAndana = idx;
    refreshArmedButton();
    const btn = document.querySelector(`.andana-btn[data-idx="${idx}"]`);
    if (btn) {
        btn.classList.add('flash-press');
        setTimeout(() => btn.classList.remove('flash-press'), 200);
    }
    playSwitch();

    // Tutorial: si hi ha un tren congelat al punt de compromís, comprometé'l ara
    if (g.tutorialMode) {
        const cssH = g.canvas.height / (window.devicePixelRatio || 1);
        const branchStart = cssH - 320;
        const frozen = g.trains.find(t => !t.resolved && t.committedAndana < 0 && t.y >= branchStart - 4);
        if (frozen) {
            frozen.committedAndana = idx;
            frozen.commitFlash = 1;
            spawnRipple(frozen.currentX, frozen.y, '#ffcc00', 80, 0.6);
            playCommit();
            // Treu pista visual un cop ha actuat
            document.querySelectorAll('.andana-btn.hint').forEach(b => b.classList.remove('hint'));
        }
    }
}

function refreshArmedButton() {
    const armed = state.game ? state.game.armedAndana : -1;
    document.querySelectorAll('.andana-btn').forEach(b => {
        const idx = parseInt(b.dataset.idx, 10);
        b.classList.toggle('armed', idx === armed);
    });
}

// ============================================================================
// LIFECYCLE D'UN NIVELL
// ============================================================================
function startLevel(level) {
    state.currentLevel = level;
    switchScreen('gameplay', false);
    setupLevel(level);
    startCountdown();
}

function computeNewNotesForLevel(levelId) {
    const current = new Set(CURRICULUM[levelId - 1].pool);
    const previous = new Set();
    for (let i = 0; i < levelId - 1; i++) {
        CURRICULUM[i].pool.forEach(n => previous.add(n));
    }
    return new Set([...current].filter(n => !previous.has(n)));
}

function setupLevel(level) {
    const g = state.game;
    const data = CURRICULUM[level - 1];
    g.level = level;
    g.levelData = data;
    g.tutorialMode = false;
    g.newNotes = computeNewNotesForLevel(level);
    g.score = 0;
    g.animatedScore = 0;
    g.lives = 3;
    g.objective = 0;
    g.objectiveTarget = data.target;
    g.trains = [];
    g.nextSpawn = 0;
    g.elapsedSinceStart = 0;
    g.correctHits = 0;
    g.totalHits = 0;
    g.shake = 0;
    g.flashIntensity = 0;
    g.chromAberr = 0;
    g.armedAndana = 3;
    g.combo = 0;
    g.bestCombo = 0;
    g.sessionNoteStats = {};
    g.slowMo = false;
    g.timeScale = 1;
    g.timeScaleTarget = 1;
    g.levelErrors = 0;

    g.fallSpeed = data.fallSpeed;
    g.spawnInterval = data.spawnInterval;

    document.getElementById('hudLevel').textContent = String(level).padStart(2, '0');
    document.getElementById('hudRouteName').textContent = data.name;
    document.getElementById('hudScore').textContent = '0';
    document.getElementById('hudLives').textContent = '♥♥♥';
    document.getElementById('hudObjective').textContent = `0/${g.objectiveTarget}`;
    document.getElementById('objectiveFill').style.width = '0%';
    document.getElementById('hudCombo').textContent = '×1';
    document.getElementById('hudComboBlock').classList.remove('combo-hot', 'combo-fire');
    document.getElementById('slowmoIndicator').classList.remove('show');

    document.querySelectorAll('.overlay-modal').forEach(m => m.classList.remove('show'));
    refreshArmedButton();
    vfxClear();

    setMusicIntensity(0.5);
}

function startCountdown() {
    const overlay = document.getElementById('countdownOverlay');
    const num = document.getElementById('countdownNumber');
    overlay.classList.add('show');
    let n = 3;
    num.textContent = n;
    const interval = setInterval(() => {
        n--;
        if (n > 0) { num.textContent = n; playClick('hover'); }
        else if (n === 0) { num.textContent = '▶'; playClick(); }
        else {
            clearInterval(interval);
            overlay.classList.remove('show');
            state.game.running = true;
            state.game.paused = false;
            state.game.lastTime = performance.now();
        }
    }, 800);
}

function stopGame() {
    if (!state.game) return;
    state.game.running = false;
    state.game.paused = false;
    state.game.tutorialMode = false;
    state.game.tutorialPausedForIntro = false;
    state.game.trains.forEach(t => { if (t.sound) t.sound.stop(); });
    state.game.trains = [];
    vfxClear();
    document.querySelectorAll('.overlay-modal').forEach(m => m.classList.remove('show'));
    document.getElementById('countdownOverlay').classList.remove('show');
    document.getElementById('slowmoIndicator').classList.remove('show');
    document.getElementById('tutorialIntroOverlay')?.classList.remove('show');
    document.getElementById('tutorialEndOverlay')?.classList.remove('show');
    document.getElementById('screen-gameplay').classList.remove('tutorial-mode');
    document.querySelectorAll('.andana-btn').forEach(b => b.classList.remove('hint'));
    setMusicIntensity(0.3);
}

function togglePause() {
    if (!state.game || !state.game.running) return;
    state.game.paused = !state.game.paused;
    const modal = document.getElementById('pauseModal');
    if (state.game.paused) modal.classList.add('show');
    else { modal.classList.remove('show'); state.game.lastTime = performance.now(); }
}

function resumeGame() {
    if (state.game && state.game.paused) togglePause();
}

function restartGame() {
    stopGame();
    setupLevel(state.currentLevel);
    startCountdown();
}

function nextLevel() {
    const next = Math.min(CURRICULUM.length, state.currentLevel + 1);
    if (next > state.save.unlocked) state.save.unlocked = next;
    saveAll();
    state.currentLevel = next;
    setupLevel(next);
    startCountdown();
}

// ============================================================================
// LOOP PRINCIPAL
// ============================================================================
function gameLoop(now) {
    requestAnimationFrame(gameLoop);
    if (!state.game) return;
    const g = state.game;
    if (state.currentScreen !== 'gameplay') {
        renderGame();
        return;
    }
    let dtRaw = Math.min(0.05, (now - g.lastTime) / 1000);
    g.lastTime = now;

    // Smooth slow-mo
    g.timeScale += (g.timeScaleTarget - g.timeScale) * 0.1;
    const dt = dtRaw * g.timeScale;

    if (g.running && !g.paused) {
        update(dt);
    }
    vfxUpdate(dtRaw); // VFX al ritme real
    renderGame();
}

function update(dt) {
    const g = state.game;
    if (g.tutorialMode && g.tutorialPausedForIntro) return;
    g.elapsedSinceStart += dt * 1000;

    const cssH = g.canvas.height / (window.devicePixelRatio || 1);
    const branchStart = cssH - 320;
    const crossY = cssH - 130;

    // Spawn — al tutorial, no spawnegis si ja hi ha un tren congelat al punt de compromís
    g.nextSpawn -= dt * 1000;
    let canSpawn = true;
    if (g.tutorialMode) {
        const frozen = g.trains.some(t => !t.resolved && t.committedAndana < 0 && t.y >= branchStart - 4);
        if (frozen) canSpawn = false;
    }
    if (g.nextSpawn <= 0 && canSpawn) {
        spawnTrain();
        g.nextSpawn = g.spawnInterval * (0.85 + Math.random() * 0.3);
    }

    // Trens
    for (let i = g.trains.length - 1; i >= 0; i--) {
        const train = g.trains[i];

        // Mode tutorial: congela el tren a la línia de compromís fins que premi una andana
        const isUncommitted = !train.resolved && train.committedAndana < 0;
        const atCommit = train.y >= branchStart;
        const freezeForTutorial = g.tutorialMode && isUncommitted && atCommit;

        if (freezeForTutorial) {
            train.y = branchStart;
            train.glowPulse += dt * 6;
        } else {
            train.y += g.fallSpeed * dt * (train.boostTimer > 0 ? 3.2 : 1);
            if (train.boostTimer > 0) train.boostTimer -= dt;
        }

        const progress = Math.min(1, train.y / cssH);
        if (train.sound) train.sound.update(progress);

        // Trail
        train.trail.push({ x: train.currentX, y: train.y, life: 1, color: train.note.color });
        if (train.trail.length > 22) train.trail.shift();
        train.trail.forEach(t => t.life -= dt * 1.2);
        train.trail = train.trail.filter(t => t.life > 0);

        // Position
        if (!train.resolved) {
            if (train.y < branchStart) {
                train.currentX = lerp(train.currentX, getCenterX(), 0.1);
            } else {
                if (train.committedAndana < 0) {
                    if (g.tutorialMode) {
                        // Espera input — no auto-commit
                        train.currentX = lerp(train.currentX, getCenterX(), 0.1);
                    } else {
                        train.committedAndana = g.armedAndana;
                        train.commitFlash = 1;
                        spawnRipple(train.currentX, train.y, '#ffcc00', 80, 0.6);
                        playCommit();
                    }
                }
                if (train.committedAndana >= 0) {
                    const railX = getAndanaX(train.committedAndana);
                    const t = clamp((train.y - branchStart) / (crossY - branchStart), 0, 1);
                    train.currentX = lerp(getCenterX(), railX, easeCubic(t));
                }
            }
        } else {
            train.currentX = lerp(train.currentX, train.assignedX, 0.25);
        }

        // Streak en hipervelocitat
        if (train.boostTimer > 0 && Math.random() < 0.3) {
            spawnStreak(train.currentX, train.y, Math.PI / 2, 30, train.note.color);
        }

        if (train.commitFlash > 0) train.commitFlash = Math.max(0, train.commitFlash - dt * 2.5);

        if (!train.resolved && train.y >= crossY) resolveTrain(train);

        if (train.y > cssH + 120) {
            if (train.sound) train.sound.stop();
            g.trains.splice(i, 1);
        }
    }

    // Decay efectes
    if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 30);
    if (g.flashIntensity > 0) g.flashIntensity = Math.max(0, g.flashIntensity - dt * 3);
    if (g.chromAberr > 0) g.chromAberr = Math.max(0, g.chromAberr - dt * 8);

    // Slow-mo: activar quan vides == 1 (no al tutorial)
    const shouldSlowMo = !g.tutorialMode && g.lives === 1 && g.running;
    if (shouldSlowMo && !g.slowMo) {
        g.slowMo = true;
        g.timeScaleTarget = 0.7;
        document.getElementById('slowmoIndicator').classList.add('show');
    } else if (!shouldSlowMo && g.slowMo) {
        g.slowMo = false;
        g.timeScaleTarget = 1;
        document.getElementById('slowmoIndicator').classList.remove('show');
    }

    // Animar comptador de puntuació
    if (g.animatedScore < g.score) {
        g.animatedScore = Math.min(g.score, g.animatedScore + Math.max(1, (g.score - g.animatedScore) * 0.15));
        document.getElementById('hudScore').textContent = Math.floor(g.animatedScore);
    }

    // Música adaptativa segons combo
    const intensity = 0.4 + Math.min(0.6, g.combo / 30 * 0.6);
    setMusicIntensity(intensity);

    // Final (no en mode tutorial — controla el seu propi cicle)
    if (!g.tutorialMode) {
        if (g.lives <= 0 && g.running) endGame(false);
        if (g.objective >= g.objectiveTarget && g.running) endGame(true);
    }
}

function spawnTrain() {
    const g = state.game;
    const pool = g.levelData.pool;

    let note;
    if (g.tutorialMode) {
        // Tutorial: distribució uniforme del pool de l'etapa
        note = NOTE_BY_ID[pool[Math.floor(Math.random() * pool.length)]];
    } else {
        // Spawn adaptatiu: nota més difícil per al jugador té més pes
        const stats = state.save.stats.noteStats || {};
        const weights = pool.map(noteId => {
            const s = stats[noteId];
            if (!s || s.total < 5) return 1;
            const errorRate = 1 - s.correct / s.total;
            return 1 + errorRate * 1.5; // fins a 2.5x més probable si erra molt
        });
        const totalW = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * totalW;
        let chosen = 0;
        for (let i = 0; i < weights.length; i++) {
            r -= weights[i];
            if (r <= 0) { chosen = i; break; }
        }
        note = NOTE_BY_ID[pool[chosen]];
    }

    const train = {
        x: getCenterX(),
        y: -100,
        currentX: getCenterX(),
        assignedX: getCenterX(),
        note: note,
        targetAndana: NOTES.findIndex(n => n.id === note.id),
        committedAndana: -1,
        commitFlash: 0,
        resolved: false,
        boostTimer: 0,
        trail: [],
        sound: createTrainSound(note.id),
        rotation: 0,
        glowPulse: Math.random() * Math.PI * 2
    };
    g.trains.push(train);
}

function resolveTrain(train) {
    const g = state.game;
    train.resolved = true;
    g.totalHits++;

    const finalAndana = train.committedAndana >= 0 ? train.committedAndana : g.armedAndana;
    const isCorrect = finalAndana === train.targetAndana;
    const railX = getAndanaX(finalAndana);
    train.assignedX = railX;

    // ===== Mode tutorial: sense pèrdua de vides, avança per fases =====
    if (g.tutorialMode) {
        const stage = TUTORIAL_STAGES[g.tutorialStage];
        if (isCorrect) {
            g.combo++;
            if (g.combo > g.bestCombo) g.bestCombo = g.combo;
            train.boostTimer = 0.6;
            playNoteFM(train.note.id, { duration: 0.5, peak: 0.18 });
            if (g.combo % 3 === 0 && g.combo > 0) playCombo(g.combo);
            flashAndana(finalAndana, 'flash-correct');
            spawnParticles(train.currentX, train.y, { type: 'glow', count: 8, color: train.note.color, speed: 120, life: 0.8 });
            spawnParticles(train.currentX, train.y, { type: 'spark', count: 14, color: train.note.color, speed: 280, life: 0.9 });
            spawnRipple(train.currentX, train.y, train.note.color, 100, 0.7);
            spawnFloatingText(train.currentX, train.y - 60, '✓ ' + train.note.id, train.note.color, { size: 26 });

            // Comptador de progrés (per combo o per encert pla)
            if (stage.targetCombo) g.tutorialCorrect = g.combo;
            else g.tutorialCorrect++;

            document.getElementById('hudObjective').textContent = `${Math.min(g.tutorialCorrect, stage.target)}/${stage.target}`;
            document.getElementById('objectiveFill').style.width = `${Math.min(100, (g.tutorialCorrect / stage.target) * 100)}%`;
            updateComboHUD();
            if (train.sound) setTimeout(() => train.sound.fade(), 200);

            // Treu pista després del primer encert
            document.querySelectorAll('.andana-btn.hint').forEach(b => b.classList.remove('hint'));

            if (g.tutorialCorrect >= stage.target) {
                g.objective = g.tutorialStage + 1;
                document.getElementById('hudObjective').textContent = `${g.tutorialStage + 1}/${TUTORIAL_STAGES.length - 1}`;
                setTimeout(() => enterTutorialStage(g.tutorialStage + 1), 900);
            }
        } else {
            g.combo = 0;
            train.boostTimer = -1;
            playCollision();
            flashAndana(finalAndana, 'flash-wrong');
            spawnParticles(train.currentX, train.y, { type: 'spark', count: 22, color: '#ff3c5a', speed: 320, life: 0.9 });
            spawnRipple(train.currentX, train.y, '#ff3c5a', 160, 0.7);
            if (state.settings.shake) g.shake = 12;
            spawnFloatingText(train.currentX, train.y - 60, `Era ${train.note.id}`, '#ff3c5a', { size: 22 });
            if (train.sound) train.sound.stop();
            const idx2 = g.trains.indexOf(train);
            if (idx2 >= 0) g.trains.splice(idx2, 1);

            if (stage.targetCombo) {
                g.tutorialCorrect = 0;
                document.getElementById('hudObjective').textContent = `0/${stage.target}`;
                document.getElementById('objectiveFill').style.width = '0%';
            }
            updateComboHUD();
        }
        return;
    }

    // Estadístiques per nota (sessió + global)
    const noteId = train.note.id;
    g.sessionNoteStats[noteId] = g.sessionNoteStats[noteId] || { correct: 0, total: 0 };
    g.sessionNoteStats[noteId].total++;
    state.save.stats.noteStats[noteId] = state.save.stats.noteStats[noteId] || { correct: 0, total: 0 };
    state.save.stats.noteStats[noteId].total++;
    state.save.stats.totalAttempts = (state.save.stats.totalAttempts || 0) + 1;

    if (isCorrect) {
        // ===== ENCERT =====
        g.combo++;
        if (g.combo > g.bestCombo) g.bestCombo = g.combo;
        if (g.combo > state.save.stats.bestCombo) state.save.stats.bestCombo = g.combo;

        const multiplier = comboMultiplier(g.combo);
        const points = 1 * multiplier;
        g.score += points;
        g.objective += 1;
        g.correctHits++;

        g.sessionNoteStats[noteId].correct++;
        state.save.stats.noteStats[noteId].correct++;
        state.save.stats.totalCorrect = (state.save.stats.totalCorrect || 0) + 1;

        train.boostTimer = 0.6;

        playNoteFM(noteId, { duration: 0.5, peak: 0.18 });
        if (g.combo % 5 === 0 && g.combo > 0) playCombo(g.combo);

        flashAndana(finalAndana, 'flash-correct');

        // VFX
        spawnParticles(train.currentX, train.y, { type: 'glow', count: 8, color: train.note.color, speed: 120, life: 0.8 });
        spawnParticles(train.currentX, train.y, { type: 'spark', count: 14, color: train.note.color, speed: 280, life: 0.9 });
        spawnRipple(train.currentX, train.y, train.note.color, 100, 0.7);

        // Floating text amb multiplicador
        const txt = multiplier > 1 ? `+${points} ×${multiplier}` : `+${points}`;
        spawnFloatingText(train.currentX, train.y - 60, txt, train.note.color, { size: 22 + Math.min(20, g.combo * 0.4) });

        // Combo popup HUD
        if (g.combo >= 2) showComboPopup(g.combo, multiplier);

        bumpHUD('hudScore', 'good');
        updateComboHUD();

        if (train.sound) setTimeout(() => train.sound.fade(), 200);
    } else {
        // ===== ERROR =====
        g.lives -= 1;
        g.combo = 0;
        g.levelErrors++;
        train.boostTimer = -1;

        playCollision();
        flashAndana(finalAndana, 'flash-wrong');

        // VFX dramàtics
        spawnParticles(train.currentX, train.y, { type: 'spark', count: 32, color: '#ff3c5a', speed: 380, life: 1.0 });
        spawnParticles(train.currentX, train.y, { type: 'debris', count: 14, color: '#ffcc00', speed: 250, life: 1.4, gravity: 400 });
        spawnParticles(train.currentX, train.y, { type: 'glow', count: 10, color: '#ff3c5a', speed: 160, life: 1.2 });
        spawnRipple(train.currentX, train.y, '#ff3c5a', 200, 0.9);
        spawnRipple(train.currentX, train.y, '#ffcc00', 140, 0.7);

        if (state.settings.shake) g.shake = 18;
        g.flashIntensity = 0.7;
        g.chromAberr = 1;

        spawnFloatingText(train.currentX, train.y - 60, 'ERROR', '#ff3c5a', { size: 26 });

        if (train.sound) train.sound.stop();
        const idx = g.trains.indexOf(train);
        if (idx >= 0) g.trains.splice(idx, 1);

        bumpHUD('hudLives', 'bad');
        updateComboHUD();
    }

    updateHUD();
    checkAchievements();
}

function comboMultiplier(combo) {
    if (combo >= 50) return 10;
    if (combo >= 25) return 5;
    if (combo >= 15) return 4;
    if (combo >= 10) return 3;
    if (combo >= 5) return 2;
    return 1;
}

function flashAndana(idx, cls) {
    const btn = document.querySelector(`.andana-btn[data-idx="${idx}"]`);
    if (!btn) return;
    btn.classList.add(cls);
    setTimeout(() => btn.classList.remove(cls), 350);
}

function showComboPopup(combo, mult) {
    const layer = document.getElementById('comboPopupLayer');
    if (!layer) return;
    const el = document.createElement('div');
    el.className = 'combo-popup';
    el.style.left = '50%';
    el.style.top = '40%';
    el.style.color = mult >= 5 ? '#ffd54a' : mult >= 3 ? '#ff2d95' : '#ffb347';
    el.style.fontSize = (28 + Math.min(28, combo * 0.5)) + 'px';
    el.style.textShadow = `0 0 20px ${el.style.color}, 0 0 40px ${el.style.color}`;
    el.textContent = `COMBO ×${combo}`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1300);
}

function bumpHUD(id, kind) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('bump', 'bump-' + kind);
    setTimeout(() => el.classList.remove('bump', 'bump-' + kind), 250);
}

function updateHUD() {
    const g = state.game;
    document.getElementById('hudLives').textContent = '♥'.repeat(Math.max(0, g.lives));
    document.getElementById('hudObjective').textContent = `${g.objective}/${g.objectiveTarget}`;
    const pct = Math.min(100, (g.objective / g.objectiveTarget) * 100);
    document.getElementById('objectiveFill').style.width = pct + '%';
}

function updateComboHUD() {
    const g = state.game;
    const block = document.getElementById('hudComboBlock');
    const value = document.getElementById('hudCombo');
    const m = comboMultiplier(g.combo);
    value.textContent = '×' + m;
    block.classList.remove('combo-hot', 'combo-fire');
    if (m >= 5) block.classList.add('combo-fire');
    else if (m >= 3) block.classList.add('combo-hot');
}

// ============================================================================
// FINAL DE NIVELL
// ============================================================================
function endGame(victory) {
    const g = state.game;
    g.running = false;
    g.accuracy = g.totalHits === 0 ? 0 : Math.round((g.correctHits / g.totalHits) * 100);

    g.trains.forEach(t => { if (t.sound) t.sound.stop(); });
    g.trains = [];
    document.getElementById('slowmoIndicator').classList.remove('show');
    g.timeScale = 1; g.timeScaleTarget = 1; g.slowMo = false;

    if (victory) {
        const isPerfect = g.levelErrors === 0;
        const completion = {
            score: g.score,
            accuracy: g.accuracy,
            bestCombo: g.bestCombo,
            perfect: isPerfect,
            timestamp: Date.now()
        };

        const wasCompleted = !!state.save.completed[g.level];
        state.save.completed[g.level] = completion;
        if (!wasCompleted) state.save.stats.completedLevels = (state.save.stats.completedLevels || 0) + 1;
        if (g.level > (state.save.stats.maxLevelCompleted || 0)) state.save.stats.maxLevelCompleted = g.level;
        if (isPerfect) state.save.stats.perfectRuns = (state.save.stats.perfectRuns || 0) + 1;

        const nextLvl = Math.min(CURRICULUM.length, g.level + 1);
        if (nextLvl > state.save.unlocked) state.save.unlocked = nextLvl;
        saveAll();

        document.getElementById('victoryScore').textContent = g.score;
        document.getElementById('victoryAccuracy').textContent = g.accuracy + '%';
        document.getElementById('victoryCombo').textContent = '×' + g.bestCombo;
        document.getElementById('victoryUnlocked').textContent = g.level < CURRICULUM.length ? CURRICULUM[g.level].name : 'TOTES COMPLETADES';

        renderNoteBreakdown();
        document.getElementById('victoryModal').classList.add('show');
        playFanfare();
        checkAchievements();
    } else {
        saveAll();
        document.getElementById('defeatScore').textContent = g.score;
        document.getElementById('defeatObjective').textContent = `${g.objective}/${g.objectiveTarget}`;
        document.getElementById('defeatCombo').textContent = '×' + g.bestCombo;
        document.getElementById('defeatModal').classList.add('show');
    }
}

function renderNoteBreakdown() {
    const g = state.game;
    const list = document.getElementById('noteBreakdown');
    list.innerHTML = '';
    const pool = g.levelData.pool;
    pool.forEach(noteId => {
        const note = NOTE_BY_ID[noteId];
        const s = g.sessionNoteStats[noteId] || { correct: 0, total: 0 };
        const pct = s.total === 0 ? 0 : Math.round((s.correct / s.total) * 100);
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        row.style.setProperty('--note-color', note.color);
        row.innerHTML = `
            <span class="breakdown-note">${note.id}</span>
            <div class="breakdown-bar"><div class="breakdown-bar-fill" style="width: ${pct}%"></div></div>
            <span class="breakdown-pct">${s.correct}/${s.total}</span>
        `;
        list.appendChild(row);
    });
}

// ============================================================================
// HELPERS
// ============================================================================
function getCanvasCSS() {
    const c = state.game.canvas;
    const dpr = window.devicePixelRatio || 1;
    return { w: c.width / dpr, h: c.height / dpr };
}
function getCenterX() { return getCanvasCSS().w / 2; }
function getAndanaX(idx) {
    const { w } = getCanvasCSS();
    const colW = (w - 32) / 7;
    return 16 + colW * (idx + 0.5);
}
function lerp(a, b, t) { return a + (b - a) * t; }
function easeCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ============================================================================
// RENDER
// ============================================================================
function renderGame() {
    const g = state.game;
    if (!g) return;
    const ctx = g.ctx;
    const { w, h } = getCanvasCSS();

    ctx.clearRect(0, 0, w, h);

    ctx.save();

    // Shake (incloent rotació subtil per cinematografia)
    if (g.shake > 0) {
        ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
        ctx.rotate((Math.random() - 0.5) * g.shake * 0.001);
    }

    // Fons gradient subtil
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(2, 8, 24, 0.0)');
    grad.addColorStop(0.5, 'rgba(8, 16, 40, 0.08)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.04)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    drawRailSystem(ctx, w, h);
    drawTrains(ctx);
    drawCrossroadGlow(ctx, w, h);
    vfxRender(ctx, VFX.bloomCtx, state.settings.bloom);

    // Flash global de col·lisió
    if (g.flashIntensity > 0) {
        ctx.fillStyle = `rgba(255, 60, 90, ${g.flashIntensity * 0.35})`;
        ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();

    // Aberració cromàtica (post-process global) — només quan chromAberr > 0
    if (g.chromAberr > 0 && state.settings.bloom) {
        // Simple: un overlay vermell + cyan amb desplaçament
        const offset = g.chromAberr * 4;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = g.chromAberr * 0.3;
        ctx.fillStyle = `rgba(255, 0, 80, 1)`;
        ctx.fillRect(-offset, 0, w, h);
        ctx.fillStyle = `rgba(0, 255, 255, 1)`;
        ctx.fillRect(offset, 0, w, h);
        ctx.restore();
    }
}

function drawRailSystem(ctx, w, h) {
    const g = state.game;
    const centerX = w / 2;
    const branchStartY = h - 320;
    const crossY = h - 130;
    const railTopY = 60;

    // Mapa: andana → tren més avançat compromès en aquest carril
    const committedByAndana = {};
    for (const t of g.trains) {
        if (t.resolved || t.committedAndana < 0) continue;
        const ex = committedByAndana[t.committedAndana];
        if (!ex || t.y > ex.y) committedByAndana[t.committedAndana] = t;
    }

    // Via central
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(centerX, railTopY);
    ctx.lineTo(centerX, branchStartY);
    ctx.stroke();

    // Línies decoratives
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
    ctx.lineWidth = 1;
    for (let off = -28; off <= 28; off += 56) {
        ctx.beginPath();
        ctx.moveTo(centerX + off, railTopY);
        ctx.lineTo(centerX + off, branchStartY);
        ctx.stroke();
    }

    // Línies horitzontals d'escaneig
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    const scanOffset = (g.elapsedSinceStart * 0.05) % 40;
    for (let y = railTopY + scanOffset; y < branchStartY; y += 40) {
        ctx.beginPath();
        ctx.moveTo(centerX - 40, y);
        ctx.lineTo(centerX + 40, y);
        ctx.stroke();
    }
    ctx.restore();

    // Línia de compromís (groga puntejada)
    ctx.save();
    const commitPulse = 0.5 + 0.5 * Math.sin(g.elapsedSinceStart * 0.005);
    ctx.strokeStyle = `rgba(255, 204, 0, ${0.25 + commitPulse * 0.35})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(20, branchStartY);
    ctx.lineTo(w - 20, branchStartY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(255, 204, 0, ${0.6 + commitPulse * 0.4})`;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('▼ LÍNIA DE COMPROMÍS', 24, branchStartY - 8);
    ctx.restore();

    // Ramificacions
    ctx.save();
    for (let i = 0; i < 7; i++) {
        const ax = getAndanaX(i);
        const note = NOTES[i];
        const isArmed = (i === g.armedAndana);
        const committedTrain = committedByAndana[i];
        const cp1y = branchStartY + (crossY - branchStartY) * 0.5;

        // Base tènue
        ctx.strokeStyle = 'rgba(108, 139, 164, 0.18)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, branchStartY);
        ctx.bezierCurveTo(centerX, cp1y, ax, cp1y, ax, crossY);
        ctx.lineTo(ax, h);
        ctx.stroke();

        // Tren compromès
        if (committedTrain) {
            const tColor = committedTrain.note.color;
            const alpha = 0.55 + 0.2 * Math.sin(g.elapsedSinceStart * 0.008 + i);
            ctx.strokeStyle = tColor;
            ctx.lineWidth = 3;
            ctx.shadowColor = tColor;
            ctx.shadowBlur = 18;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(centerX, branchStartY);
            ctx.bezierCurveTo(centerX, cp1y, ax, cp1y, ax, crossY);
            ctx.lineTo(ax, h);
            ctx.stroke();
        }

        // Preview de l'andana armada (sense tren compromès)
        if (isArmed && !committedTrain) {
            const alpha = 0.4 + 0.3 * Math.sin(g.elapsedSinceStart * 0.01);
            ctx.strokeStyle = note.color;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = note.color;
            ctx.shadowBlur = 14;
            ctx.globalAlpha = alpha;
            ctx.setLineDash([10, 6]);
            ctx.beginPath();
            ctx.moveTo(centerX, branchStartY);
            ctx.bezierCurveTo(centerX, cp1y, ax, cp1y, ax, crossY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();

    // Panell ARMAT al lateral dret
    ctx.save();
    const armed = NOTES[g.armedAndana];
    const panelX = w - 200;
    const panelY = branchStartY - 24;
    const panelW = 180;
    const panelH = 44;
    ctx.fillStyle = 'rgba(2, 8, 24, 0.85)';
    ctx.strokeStyle = armed.color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = armed.color;
    ctx.shadowBlur = 16;
    roundRect(ctx, panelX, panelY, panelW, panelH, 4);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(108, 139, 164, 0.9)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PRÒXIM COMPROMÍS', panelX + 10, panelY + 14);
    ctx.fillStyle = armed.color;
    ctx.shadowColor = armed.color;
    ctx.shadowBlur = 10;
    ctx.font = 'bold 18px "Orbitron", sans-serif';
    ctx.fillText(`◆ ${armed.id}`, panelX + 10, panelY + 34);
    ctx.shadowBlur = 14;
    const pulse = 0.6 + 0.4 * Math.sin(g.elapsedSinceStart * 0.008);
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(panelX + panelW - 16, panelY + panelH / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Línia de cruïlla
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(20, crossY);
    ctx.lineTo(w - 20, crossY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('▣ CRUÏLLA D\'ARRIBADA', 24, crossY - 8);
    ctx.restore();
}

function drawCrossroadGlow(ctx, w, h) {
    const g = state.game;
    const crossY = h - 130;
    ctx.save();
    for (const train of g.trains) {
        if (train.resolved || train.committedAndana < 0) continue;
        const ax = getAndanaX(train.committedAndana);
        const intensity = clamp((train.y - (h - 320)) / (crossY - (h - 320)), 0, 1);
        const grad = ctx.createRadialGradient(ax, crossY, 0, ax, crossY, 130);
        grad.addColorStop(0, hexToRgba(train.note.color, 0.25 * intensity));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(ax - 130, crossY - 130, 260, 260);
    }
    ctx.restore();
}

function drawTrains(ctx) {
    const g = state.game;
    for (const train of g.trains) drawTrain(ctx, train);
}

function drawTrain(ctx, train) {
    const note = train.note;
    const x = train.currentX;
    const y = train.y;
    const W = 110;
    const H = 78;

    // Trail
    ctx.save();
    for (let i = 0; i < train.trail.length; i++) {
        const p = train.trail[i];
        const a = p.life * 0.5;
        ctx.fillStyle = hexToRgba(p.color, a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9 * p.life, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    train.glowPulse += 0.1;
    const pulse = 0.85 + 0.15 * Math.sin(train.glowPulse);

    // Aura
    ctx.save();
    const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, W * 0.95 * pulse);
    auraGrad.addColorStop(0, hexToRgba(note.color, 0.5));
    auraGrad.addColorStop(0.6, hexToRgba(note.color, 0.12));
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(x - W * 0.95, y - W * 0.95, W * 1.9, W * 1.9);
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    const r = 14;
    const wHalf = W / 2;
    const hHalf = H / 2;

    // Cos del tren — gradient amb múltiples capes
    ctx.shadowColor = note.color;
    ctx.shadowBlur = 22;
    const grad = ctx.createLinearGradient(0, -hHalf, 0, hHalf);
    grad.addColorStop(0, hexToRgba(note.color, 1));
    grad.addColorStop(0.4, hexToRgba(note.color, 0.85));
    grad.addColorStop(0.6, hexToRgba(note.color, 0.7));
    grad.addColorStop(1, hexToRgba(note.color, 0.95));
    ctx.fillStyle = grad;
    roundRect(ctx, -wHalf, -hHalf, W, H, r);
    ctx.fill();

    // Marc lluminós exterior
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.8;
    roundRect(ctx, -wHalf, -hHalf, W, H, r);
    ctx.stroke();

    // Marc interior (doble)
    ctx.strokeStyle = hexToRgba('#ffffff', 0.3);
    ctx.lineWidth = 1;
    roundRect(ctx, -wHalf + 4, -hHalf + 4, W - 8, H - 8, r - 3);
    ctx.stroke();

    // Pentagrama
    drawPentagram(ctx, -wHalf + 8, -hHalf + 14, W - 16, H - 28, note);

    // Forma accessible al cantó superior esquerre
    if (state.settings.showShapes) {
        const shapeChar = shapeUnicode(note.shape);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = note.color;
        ctx.shadowBlur = 8;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(shapeChar, -wHalf + 12, -hHalf + 16);
        ctx.shadowBlur = 0;
    }

    // ID
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CÀPSULA-' + String(Math.floor(train.glowPulse * 10) % 999).padStart(3, '0'), 0, -hHalf - 6);

    ctx.restore();

    // Etiqueta de destí
    if (!train.resolved) {
        ctx.save();
        ctx.translate(x, y);
        if (train.committedAndana >= 0) {
            const destNote = NOTES[train.committedAndana];
            const isWrong = train.committedAndana !== train.targetAndana;
            const labelColor = isWrong ? '#ff3c5a' : destNote.color;
            ctx.fillStyle = labelColor;
            ctx.shadowColor = labelColor;
            ctx.shadowBlur = 12;
            ctx.font = 'bold 12px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`▶ ${destNote.id}`, 0, -hHalf - 18);
        } else {
            ctx.fillStyle = 'rgba(255, 204, 0, 0.9)';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 10;
            ctx.font = 'bold 12px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('▼ ?', 0, -hHalf - 18);
        }

        if (train.commitFlash > 0) {
            ctx.strokeStyle = `rgba(255, 204, 0, ${train.commitFlash})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 24;
            ctx.beginPath();
            ctx.arc(0, 0, W * 0.7 * (2 - train.commitFlash), 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

function drawPentagram(ctx, x, y, w, h, note) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 8, 24, 0.92)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.strokeRect(x, y, w, h);

    // Geometria musicalment correcta:
    // - 5 línies amb un espai a sobre i ~1.3 espais a sota (per la línia addicional del DO)
    const lineSpacing = h / 6;
    const lineTop = lineSpacing * 0.7;       // y de la línia superior (FA agut)
    const bottomLineY = lineTop + lineSpacing * 4; // y de la línia inferior (MI)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const ly = y + lineTop + lineSpacing * i;
        ctx.beginPath();
        ctx.moveTo(x + 4, ly);
        ctx.lineTo(x + w - 4, ly);
        ctx.stroke();
    }

    // Clau de sol — centrada verticalment al pentagrama
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `bold ${Math.floor(h * 0.7)}px serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('𝄞', x + 4, y + lineTop + lineSpacing * 2);

    // Posició musicalment correcta:
    //   DO (0): línia addicional sota la línia inferior (1 espai sota MI)
    //   RE (1): espai sota la línia inferior
    //   MI (2): línia inferior
    //   FA (3): 1r espai
    //   SOL (4): 2a línia (línia de la clau de sol)
    //   LA (5): 2n espai
    //   SI (6): 3a línia (central)
    const noteIndex = note.staffPosition;
    const ny = y + bottomLineY + lineSpacing * (1 - noteIndex * 0.5);
    const nx = x + w * 0.72;

    // Línia addicional (DO baix) — abans del cap perquè quedi sota
    if (noteIndex === 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nx - 10, ny);
        ctx.lineTo(nx + 10, ny);
        ctx.stroke();
    }

    // Pal — convenció: notes per sota de la línia central (DO-LA) tenen pal amunt;
    // SI (i superiors) tenen pal avall.
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (noteIndex <= 5) {
        // DO, RE, MI, FA, SOL, LA: pal cap amunt, a la dreta del cap
        ctx.moveTo(nx + 5, ny);
        ctx.lineTo(nx + 5, ny - lineSpacing * 3);
    } else {
        // SI: pal cap avall, a l'esquerra del cap
        ctx.moveTo(nx - 5, ny);
        ctx.lineTo(nx - 5, ny + lineSpacing * 3);
    }
    ctx.stroke();

    // Cap (oval inclinat)
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = note.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(nx, ny, 6, 4.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Lletra: automàtica quan la nota és nova al nivell, manual via setting, o sempre al tutorial
    const isNewNote = state.game?.newNotes?.has(note.id);
    const isTutorial = state.game?.tutorialMode;
    const showLetter = state.settings.showLetters || isNewNote || isTutorial;
    if (showLetter) {
        ctx.fillStyle = note.color;
        ctx.shadowColor = note.color;
        ctx.shadowBlur = 6;
        ctx.font = 'bold 9px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(note.id, nx, ny - lineSpacing * 1.8);
    }

    ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

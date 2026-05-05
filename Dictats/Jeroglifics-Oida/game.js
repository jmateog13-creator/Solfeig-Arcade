/* =====================================================
   ELS JEROGLÍFICS DE L'OÏDA — Motor del joc
   ===================================================== */

(() => {
  'use strict';

  const NOTES = {
    'Do4':  { freq: 261.63, y: 250, nom: 'Do', octava: 4, suplementaria: 'sota' },
    'Re4':  { freq: 293.66, y: 235, nom: 'Re', octava: 4 },
    'Mi4':  { freq: 329.63, y: 220, nom: 'Mi', octava: 4 },
    'Fa4':  { freq: 349.23, y: 205, nom: 'Fa', octava: 4 },
    'Sol4': { freq: 392.00, y: 190, nom: 'Sol', octava: 4 },
    'La4':  { freq: 440.00, y: 175, nom: 'La', octava: 4 },
    'Si4':  { freq: 493.88, y: 160, nom: 'Si', octava: 4 },
    'Do5':  { freq: 523.25, y: 145, nom: 'Do', octava: 5 },
    'Re5':  { freq: 587.33, y: 130, nom: 'Re', octava: 5 },
    'Mi5':  { freq: 659.25, y: 115, nom: 'Mi', octava: 5 },
    'Fa5':  { freq: 698.46, y: 100, nom: 'Fa', octava: 5 },
    'Sol5': { freq: 783.99, y: 85,  nom: 'Sol', octava: 5 },
    'La5':  { freq: 880.00, y: 70,  nom: 'La', octava: 5, suplementaria: 'sobre' },
  };

  const PENTA_X_INI = 145, PENTA_X_FI = 760;
  const PENTA_LINIES = [100, 130, 160, 190, 220];

  // JEROGLÍFICS — petjada de l'ESCALA PENTATÒNICA antiga (sonoritat egípcia)
  const NIVELLS = [
    { num: 1,  fase: 1, nom: 'Escriba',      notes: ['Do4', 'Re4', 'Mi4', 'Sol4', 'La4'],                                                                  rondes: 4 },  // pentatònica
    { num: 2,  fase: 1, nom: 'Escriba',      notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4'],                                                    rondes: 5 },  // afegir Fa, Si
    { num: 3,  fase: 1, nom: 'Escriba',      notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5'],                                             rondes: 5 },
    { num: 4,  fase: 1, nom: 'Escriba',      notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5'],                               rondes: 6 },
    { num: 5,  fase: 2, nom: 'Sacerdot',     notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 6 },
    { num: 6,  fase: 2, nom: 'Sacerdot',     notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 7 },
    { num: 7,  fase: 2, nom: 'Sacerdot',     notes: ['Do4', 'Re4', 'Mi4', 'Sol4', 'La4', 'Do5', 'Re5', 'Mi5'],                                             rondes: 7 },  // pentatònica 2 octaves
    { num: 8,  fase: 2, nom: 'Sacerdot',     notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 8 },
    { num: 9,  fase: 3, nom: 'Faraó',        notes: ['Do4', 'Re4', 'Mi4', 'Sol4', 'La4'],                                                                  rondes: 7 },  // drill pentatònica
    { num: 10, fase: 3, nom: 'Faraó',        notes: ['Fa4', 'Si4', 'Do5', 'Mi5'],                                                                          rondes: 7 },  // drill no-pentatònica
    { num: 11, fase: 3, nom: 'Faraó',        notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 9 },
    { num: 12, fase: 3, nom: 'Faraó',        notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 11 },
    { num: 13, fase: 4, nom: 'Déu d\'Egipte', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5'],                rondes: 12 },
    { num: 14, fase: 4, nom: 'Déu d\'Egipte', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],         rondes: 13 },
    { num: 15, fase: 4, nom: 'Déu d\'Egipte', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],         rondes: 16 },
  ];

  const TOTAL_NIVELLS = NIVELLS.length;
  const VIDES_INICIALS = 3;
  const CLAU_PROGRES = 'jeroglifics-oida-progres';
  const VIEW_W = 800, VIEW_H = 360;
  const RADI_HIT = 24;
  const JEROGLIFICS = ['☥', '𓂀', '☉', '𓆣', '𓊵', '𓋹', '𓅓', '𓆎', '𓏏', '𓈖', '𓊪', '𓂻', '𓊃'];

  const estat = {
    pantallaActual: 'landing',
    nivellMaximDesbloquejat: 1,
    nivellActual: null,
    rondaActual: 0,
    notesEncertades: [],
    notaObjectiu: null,
    vides: VIDES_INICIALS,
    bloquejatPerInteraccio: false,
    punts: [],          // {idNota, x, y, encesa, glif, flashError, esquerdes}
    cursor: { x: -100, y: -100, dins: false },
    nomEfimer: null,
  };

  function carregarProgres() {
    try {
      const v = localStorage.getItem(CLAU_PROGRES);
      if (v !== null) {
        const n = parseInt(v, 10);
        if (!Number.isNaN(n) && n >= 1 && n <= TOTAL_NIVELLS) { estat.nivellMaximDesbloquejat = n; return; }
      }
    } catch (_) {}
    estat.nivellMaximDesbloquejat = 1;
  }

  function desarProgres(nou) {
    if (nou > estat.nivellMaximDesbloquejat) {
      estat.nivellMaximDesbloquejat = Math.min(nou, TOTAL_NIVELLS);
      try { localStorage.setItem(CLAU_PROGRES, String(estat.nivellMaximDesbloquejat)); } catch (_) {}
      if (nou > TOTAL_NIVELLS) try { localStorage.setItem('hub:done:jeroglifics', '1'); } catch (_) {}
    }
  }

  function reiniciarProgres() {
    estat.nivellMaximDesbloquejat = 1;
    try { localStorage.removeItem(CLAU_PROGRES); } catch (_) {}
  }

  function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    const obj = document.getElementById('pantalla-' + id);
    if (obj) { obj.classList.add('activa'); estat.pantallaActual = id; }
  }

  function generarEstrellesFons(quantitat = 50) {
    const cont = document.getElementById('estrelles-fons');
    const fragment = document.createDocumentFragment();
    const simbols = ['☥', '𓂀', '𓆣', '☉'];
    for (let i = 0; i < quantitat; i++) {
      const e = document.createElement('div');
      e.className = 'estrella-fons';
      e.textContent = simbols[Math.floor(Math.random() * simbols.length)];
      e.style.fontSize = (Math.random() * 12 + 12) + 'px';
      e.style.left = (Math.random() * 100) + '%';
      e.style.top  = (Math.random() * 100) + '%';
      e.style.setProperty('--dur', (Math.random() * 5 + 3) + 's');
      e.style.setProperty('--delay', (Math.random() * 6) + 's');
      e.style.setProperty('--max-opacitat', (Math.random() * 0.4 + 0.15).toFixed(2));
      fragment.appendChild(e);
    }
    cont.appendChild(fragment);
  }

  // ---------------------------------------------------
  // ÀUDIO
  // ---------------------------------------------------
  const Audio = (() => {
    let ctx = null, masterGain = null;

    function init() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(ctx.destination);
    }

    function reprendre() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

    // Pad amb to "instrument antic" (Ney/flauta) — sine + lleugera modulació
    function tocarPad(freq, duracio = 2.2) {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;
      const sortida = ctx.createGain();
      sortida.gain.setValueAtTime(0, ara);
      sortida.gain.linearRampToValueAtTime(0.50, ara + 0.30);
      sortida.gain.linearRampToValueAtTime(0.36, ara + duracio * 0.6);
      sortida.gain.exponentialRampToValueAtTime(0.0001, ara + duracio);

      const filtre = ctx.createBiquadFilter();
      filtre.type = 'lowpass'; filtre.frequency.value = 1800; filtre.Q.value = 1.2;

      const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = freq;
      const osc2 = ctx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.value = freq * 1.003;
      const osc3 = ctx.createOscillator(); osc3.type = 'sawtooth'; osc3.frequency.value = freq * 0.5;
      const gO3 = ctx.createGain(); gO3.gain.value = 0.10;

      // Lleuger vibrato (LFO)
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 4.5;
      const lfoG = ctx.createGain(); lfoG.gain.value = freq * 0.005;
      lfo.connect(lfoG).connect(osc1.frequency);

      osc1.connect(filtre); osc2.connect(filtre); osc3.connect(gO3).connect(filtre);
      filtre.connect(sortida).connect(masterGain);
      osc1.start(ara); osc2.start(ara); osc3.start(ara); lfo.start(ara);
      const fi = ara + duracio + 0.2;
      osc1.stop(fi); osc2.stop(fi); osc3.stop(fi); lfo.stop(fi);
    }

    // Encert: roca trencant-se (crack) + campaneta daurada
    function tocarEncert() {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;

      // Crack: soroll filtrat curt
      const buffSize = ctx.sampleRate * 0.25;
      const buf = ctx.createBuffer(1, buffSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < buffSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / buffSize);
      const noise = ctx.createBufferSource(); noise.buffer = buf;
      const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1200; nf.Q.value = 0.6;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.4, ara);
      ng.gain.exponentialRampToValueAtTime(0.0001, ara + 0.2);
      noise.connect(nf).connect(ng).connect(masterGain);
      noise.start(ara); noise.stop(ara + 0.25);

      // Tons greus de crack
      const oc = ctx.createOscillator(); oc.type = 'sawtooth';
      oc.frequency.setValueAtTime(120, ara);
      oc.frequency.exponentialRampToValueAtTime(40, ara + 0.15);
      const ocf = ctx.createBiquadFilter(); ocf.type = 'lowpass'; ocf.frequency.value = 500;
      const ocg = ctx.createGain();
      ocg.gain.setValueAtTime(0.001, ara);
      ocg.gain.linearRampToValueAtTime(0.25, ara + 0.01);
      ocg.gain.exponentialRampToValueAtTime(0.0001, ara + 0.2);
      oc.connect(ocf).connect(ocg).connect(masterGain);
      oc.start(ara); oc.stop(ara + 0.25);

      // Campaneta daurada
      [880, 1320, 1760].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain();
        const t = ara + 0.18 + i * 0.05;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        o.connect(g).connect(masterGain);
        o.start(t); o.stop(t + 1.3);
      });
    }

    // Error: cisell lliscant pel buit (soroll filtrat highpass)
    function tocarError() {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;
      const buffSize = ctx.sampleRate * 0.5;
      const buf = ctx.createBuffer(1, buffSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < buffSize; i++) data[i] = (Math.random() * 2 - 1);
      const noise = ctx.createBufferSource(); noise.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2400;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ara);
      g.gain.linearRampToValueAtTime(0.4, ara + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ara + 0.45);
      noise.connect(f).connect(g).connect(masterGain);
      noise.start(ara); noise.stop(ara + 0.5);

      // To greu de pedra
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(180, ara);
      o.frequency.exponentialRampToValueAtTime(80, ara + 0.4);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, ara);
      og.gain.linearRampToValueAtTime(0.2, ara + 0.05);
      og.gain.exponentialRampToValueAtTime(0.0001, ara + 0.5);
      o.connect(og).connect(masterGain);
      o.start(ara); o.stop(ara + 0.55);
    }

    return { init, reprendre, tocarPad, tocarEncert, tocarError };
  })();

  // ---------------------------------------------------
  // SELECTOR
  // ---------------------------------------------------
  function renderitzarSelectorNivells() {
    const graella = document.getElementById('graella-nivells');
    graella.innerHTML = '';
    NIVELLS.forEach(niv => {
      const desbloquejat = niv.num <= estat.nivellMaximDesbloquejat;
      const completat = niv.num < estat.nivellMaximDesbloquejat;
      const boto = document.createElement('button');
      boto.className = `boto-nivell fase-${niv.fase}`;
      if (desbloquejat) boto.classList.add('desbloquejat'); else boto.classList.add('bloquejat');
      if (completat) boto.classList.add('completat');
      const halo = document.createElement('span'); halo.className = 'nivell-halo'; boto.appendChild(halo);
      for (let i = 0; i < 4; i++) {
        const e = document.createElement('span'); e.className = 'nivell-estrelleta';
        e.style.left = (Math.random() * 80 + 10) + '%';
        e.style.top  = (Math.random() * 80 + 10) + '%';
        e.style.setProperty('--retard', (Math.random() * 2) + 's');
        boto.appendChild(e);
      }
      const num = document.createElement('span'); num.className = 'nivell-num'; num.textContent = niv.num;
      const desc = document.createElement('span'); desc.className = 'nivell-desc'; desc.textContent = `${niv.notes.length} jeroglífics`;
      const icona = document.createElement('span'); icona.className = 'nivell-icona';
      icona.textContent = !desbloquejat ? '🔒' : (completat ? '☥' : '⛏️');
      const fase = document.createElement('span'); fase.className = 'nivell-fase-nom'; fase.textContent = niv.nom;
      boto.appendChild(num); boto.appendChild(desc); boto.appendChild(icona); boto.appendChild(fase);
      const estat_txt = !desbloquejat ? 'Bloquejat' : (completat ? 'Completat' : 'Disponible');
      boto.title = `Cambra ${niv.num} — ${niv.nom}\n${niv.notes.length} jeroglífics · ${niv.rondes} rondes\n${estat_txt}`;
      if (desbloquejat) boto.addEventListener('click', () => iniciarNivell(niv.num));
      graella.appendChild(boto);
    });
  }

  function iniciarNivell(num) {
    const niv = NIVELLS.find(n => n.num === num);
    if (!niv) return;
    estat.nivellActual = niv;
    estat.rondaActual = 0;
    estat.notesEncertades = [];
    estat.notaObjectiu = null;
    estat.vides = VIDES_INICIALS;
    estat.bloquejatPerInteraccio = false;
    estat.nomEfimer = null;
    actualitzarHud();
    construirPunts(niv);
    construirIndicadorRondes(niv.rondes);
    netejarFeedback();
    amagarModal();
    mostrarPantalla('joc');
    Audio.init(); Audio.reprendre();
    setTimeout(() => seguentRonda(), 400);
  }

  function actualitzarHud() {
    const niv = estat.nivellActual;
    document.getElementById('hud-nivell').textContent = niv.num;
    document.getElementById('hud-fase').textContent = niv.nom;
    actualitzarVidesHud();
  }

  function actualitzarVidesHud(perd = false) {
    const cont = document.getElementById('hud-vides');
    cont.textContent = '🔥 '.repeat(Math.max(0, estat.vides)).trim() || '— sense torxes —';
    if (perd) { cont.classList.remove('perd'); void cont.offsetWidth; cont.classList.add('perd'); }
  }

  function construirIndicadorRondes(total) {
    const cont = document.getElementById('progres-rondes');
    cont.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const b = document.createElement('div'); b.className = 'bombolla-ronda'; cont.appendChild(b);
    }
  }

  function marcarRondaCompleta(idx) {
    const cont = document.getElementById('progres-rondes');
    const b = cont.children[idx]; if (b) b.classList.add('completa');
  }

  // ---------------------------------------------------
  // CANVAS
  // ---------------------------------------------------
  const canvas = document.getElementById('canvas-cambra');
  const ctx2d = canvas.getContext('2d');

  function construirPunts(nivell) {
    const margeEsq = 175, margeDre = 740;
    const ample = margeDre - margeEsq;
    const pas = nivell.notes.length > 1 ? ample / (nivell.notes.length - 1) : 0;
    estat.punts = nivell.notes.map((id, i) => {
      const x = nivell.notes.length === 1 ? margeEsq + ample / 2 : margeEsq + i * pas;
      return {
        idNota: id, x, y: NOTES[id].y,
        encesa: false, flashError: 0,
        glif: JEROGLIFICS[Math.floor(Math.random() * JEROGLIFICS.length)],
        esquerdes: []
      };
    });
  }

  function dibuixarPentagrama() {
    // 5 línies del pentagrama gravades a la pedra (or)
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(255, 215, 106, 0.65)';
    ctx2d.lineWidth = 1.4;
    ctx2d.shadowColor = 'rgba(255, 200, 100, 0.5)';
    ctx2d.shadowBlur = 5;
    PENTA_LINIES.forEach(y => {
      ctx2d.beginPath(); ctx2d.moveTo(PENTA_X_INI, y); ctx2d.lineTo(PENTA_X_FI, y); ctx2d.stroke();
    });
    ctx2d.restore();

    // Línies suplementàries
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(255, 215, 106, 0.65)';
    ctx2d.lineWidth = 1.4;
    ctx2d.shadowColor = 'rgba(255, 200, 100, 0.4)';
    ctx2d.shadowBlur = 4;
    estat.punts.forEach(p => {
      const sup = NOTES[p.idNota].suplementaria;
      if (sup === 'sota') {
        ctx2d.beginPath(); ctx2d.moveTo(p.x - 16, 250); ctx2d.lineTo(p.x + 16, 250); ctx2d.stroke();
      } else if (sup === 'sobre') {
        ctx2d.beginPath(); ctx2d.moveTo(p.x - 16, 70); ctx2d.lineTo(p.x + 16, 70); ctx2d.stroke();
      }
    });
    ctx2d.restore();

    // Clau de Sol daurada gravada
    ctx2d.save();
    ctx2d.fillStyle = 'rgba(255, 230, 160, 0.95)';
    ctx2d.shadowColor = 'rgba(255, 200, 100, 0.9)';
    ctx2d.shadowBlur = 16;
    ctx2d.font = '150px "Bravura", "Apple Symbols", "Segoe UI Symbol", "Noto Music", "DejaVu Sans", serif';
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'alphabetic';
    ctx2d.fillText('𝄞', 105, 235);
    ctx2d.restore();
  }

  function dibuixarMurFons() {
    const w = VIEW_W, h = VIEW_H;
    // Gradient base de pedra sorrenca
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#5a3a22');
    grad.addColorStop(0.4, '#8b5a3c');
    grad.addColorStop(0.8, '#6b4528');
    grad.addColorStop(1, '#3a2010');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);

    // Textura pseudo-pedra (rectangles ombrejats)
    ctx2d.save();
    for (let y = 0; y < h; y += 60) {
      for (let x = (y / 60) % 2 === 0 ? 0 : -50; x < w; x += 100) {
        ctx2d.strokeStyle = 'rgba(60, 30, 15, 0.4)';
        ctx2d.lineWidth = 1;
        ctx2d.strokeRect(x, y, 100, 60);
      }
    }
    ctx2d.restore();

    // 5 franges horitzontals subtils (les "altures" del pentagrama invisible)
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(255, 215, 106, 0.10)';
    ctx2d.lineWidth = 1;
    [100, 130, 160, 190, 220].forEach(y => {
      ctx2d.beginPath(); ctx2d.moveTo(60, y); ctx2d.lineTo(w - 30, y); ctx2d.stroke();
    });
    ctx2d.restore();
  }

  function dibuixarCanvas() {
    dibuixarMurFons();
    dibuixarPentagrama();

    estat.punts.forEach(p => {
      ctx2d.save();
      if (p.flashError > 0) {
        ctx2d.fillStyle = `rgba(168, 50, 50, ${p.flashError * 0.5})`;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 24, 0, Math.PI * 2); ctx2d.fill();
        p.flashError = Math.max(0, p.flashError - 0.04);
      }
      if (p.encesa) {
        // Esquerdes radials
        ctx2d.strokeStyle = 'rgba(255, 240, 200, 0.6)';
        ctx2d.lineWidth = 1.5;
        ctx2d.shadowColor = 'rgba(255, 220, 130, 0.8)';
        ctx2d.shadowBlur = 8;
        p.esquerdes.forEach(e => {
          ctx2d.beginPath();
          ctx2d.moveTo(p.x, p.y);
          ctx2d.lineTo(p.x + Math.cos(e.ang) * e.len, p.y + Math.sin(e.ang) * e.len);
          ctx2d.stroke();
        });

        // Halo daurat
        const grad = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, 26);
        grad.addColorStop(0, 'rgba(255, 230, 130, 0.9)');
        grad.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
        grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx2d.fillStyle = grad;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 26, 0, Math.PI * 2); ctx2d.fill();

        // Jeroglífic daurat
        ctx2d.fillStyle = '#ffe9b0';
        ctx2d.shadowColor = '#ffd76a';
        ctx2d.shadowBlur = 14;
        ctx2d.font = 'bold 28px serif';
        ctx2d.textAlign = 'center'; ctx2d.textBaseline = 'middle';
        ctx2d.fillText(p.glif, p.x, p.y);
      } else {
        // Marca de zona clicable: clot de pedra amb halo daurat
        const halo = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
        halo.addColorStop(0, 'rgba(255, 215, 106, 0.35)');
        halo.addColorStop(1, 'rgba(255, 215, 106, 0)');
        ctx2d.fillStyle = halo;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 16, 0, Math.PI * 2); ctx2d.fill();

        ctx2d.fillStyle = 'rgba(60, 35, 18, 0.85)';
        ctx2d.strokeStyle = 'rgba(255, 215, 106, 0.85)';
        ctx2d.lineWidth = 2;
        ctx2d.shadowColor = 'rgba(255, 200, 100, 0.6)';
        ctx2d.shadowBlur = 6;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx2d.fill(); ctx2d.stroke();
      }
      ctx2d.restore();
    });

    // Nom efímer
    if (estat.nomEfimer && estat.nomEfimer.alpha > 0) {
      ctx2d.save();
      ctx2d.fillStyle = `rgba(255, 230, 130, ${estat.nomEfimer.alpha})`;
      ctx2d.font = 'italic bold 18px Cinzel, serif';
      ctx2d.textAlign = 'center';
      ctx2d.shadowColor = 'rgba(255, 200, 100, 0.8)';
      ctx2d.shadowBlur = 8;
      ctx2d.fillText(estat.nomEfimer.text, estat.nomEfimer.x, estat.nomEfimer.y - 22);
      estat.nomEfimer.alpha -= 0.012;
      ctx2d.restore();
    }

    // Cursor cisell de bronze
    if (estat.cursor.dins) {
      const cx = estat.cursor.x, cy = estat.cursor.y;
      ctx2d.save();
      // Mànec
      ctx2d.fillStyle = '#6b4528';
      ctx2d.strokeStyle = '#3a2010';
      ctx2d.lineWidth = 1;
      ctx2d.beginPath();
      ctx2d.moveTo(cx + 6, cy + 6);
      ctx2d.lineTo(cx + 24, cy + 24);
      ctx2d.lineTo(cx + 28, cy + 22);
      ctx2d.lineTo(cx + 10, cy + 4);
      ctx2d.closePath();
      ctx2d.fill(); ctx2d.stroke();
      // Punta del cisell (bronze)
      ctx2d.fillStyle = '#c9985a';
      ctx2d.strokeStyle = '#8b5a3c';
      ctx2d.beginPath();
      ctx2d.moveTo(cx, cy);
      ctx2d.lineTo(cx + 8, cy + 4);
      ctx2d.lineTo(cx + 6, cy + 8);
      ctx2d.closePath();
      ctx2d.fill(); ctx2d.stroke();
      ctx2d.restore();
    }

    requestAnimationFrame(dibuixarCanvas);
  }

  // ---------------------------------------------------
  // INTERACCIÓ
  // ---------------------------------------------------
  function obtenirCoordCanvas(ev) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left) * (VIEW_W / r.width),
      y: (ev.clientY - r.top)  * (VIEW_H / r.height)
    };
  }

  canvas.addEventListener('mousemove', (ev) => {
    const c = obtenirCoordCanvas(ev);
    estat.cursor.x = c.x; estat.cursor.y = c.y; estat.cursor.dins = true;
  });
  canvas.addEventListener('mouseleave', () => { estat.cursor.dins = false; });
  canvas.addEventListener('click', (ev) => {
    if (estat.bloquejatPerInteraccio) return;
    const c = obtenirCoordCanvas(ev);
    let trobat = null;
    for (const p of estat.punts) {
      const dx = c.x - p.x, dy = c.y - p.y;
      if (dx * dx + dy * dy <= RADI_HIT * RADI_HIT) { trobat = p; break; }
    }
    if (!trobat) return;
    intentarPunt(trobat);
  });

  function seguentRonda() {
    const niv = estat.nivellActual; if (!niv) return;
    estat.rondaActual += 1;
    if (estat.rondaActual > niv.rondes) { finalitzarVictoria(); return; }
    const candidates = niv.notes.filter(n => !estat.notesEncertades.includes(n));
    const pool = candidates.length > 0 ? candidates : niv.notes;
    estat.notaObjectiu = pool[Math.floor(Math.random() * pool.length)];
    estat.bloquejatPerInteraccio = false;
    netejarFeedback();
    parpellejarBotoCant();
  }

  function parpellejarBotoCant() {
    const b = document.getElementById('boto-escoltar');
    b.classList.remove('sonant'); void b.offsetWidth; b.classList.add('sonant');
    setTimeout(() => b.classList.remove('sonant'), 1300);
  }

  function escoltarObjectiu() {
    if (!estat.notaObjectiu) return;
    Audio.tocarPad(NOTES[estat.notaObjectiu].freq);
    parpellejarBotoCant();
  }

  function intentarPunt(punt) {
    if (!estat.notaObjectiu) { Audio.tocarPad(NOTES[punt.idNota].freq, 1.4); return; }
    if (punt.idNota === estat.notaObjectiu) gestionarEncert(punt);
    else gestionarError(punt);
  }

  function gestionarEncert(punt) {
    estat.bloquejatPerInteraccio = true;
    punt.encesa = true;
    // Generar esquerdes radials
    const numEsq = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numEsq; i++) {
      punt.esquerdes.push({
        ang: (Math.PI * 2 / numEsq) * i + (Math.random() - 0.5) * 0.3,
        len: 18 + Math.random() * 14,
        alpha: 1
      });
    }

    Audio.tocarPad(NOTES[punt.idNota].freq, 1.0);
    setTimeout(() => Audio.tocarEncert(), 80);

    estat.nomEfimer = { text: NOTES[punt.idNota].nom, x: punt.x, y: punt.y, alpha: 1.4 };

    if (!estat.notesEncertades.includes(punt.idNota)) estat.notesEncertades.push(punt.idNota);
    marcarRondaCompleta(estat.rondaActual - 1);
    feedback('☥ Jeroglífic revelat — ' + NOTES[punt.idNota].nom, 'encert');

    setTimeout(() => seguentRonda(), 1400);
  }

  function gestionarError(punt) {
    estat.bloquejatPerInteraccio = true;
    punt.flashError = 1;
    Audio.tocarError();
    canvas.classList.remove('shake'); void canvas.offsetWidth; canvas.classList.add('shake');

    estat.vides -= 1;
    actualitzarVidesHud(true);
    feedback('🔥 El cisell ha lliscat. Escolta de nou la pedra.', 'error');

    if (estat.vides <= 0) setTimeout(() => finalitzarDerrota(), 900);
    else setTimeout(() => { estat.bloquejatPerInteraccio = false; netejarFeedback(); }, 1100);
  }

  function feedback(text, classe) {
    const el = document.getElementById('missatge-feedback');
    el.textContent = text; el.className = 'missatge-feedback actiu ' + (classe || '');
  }

  function netejarFeedback() {
    const el = document.getElementById('missatge-feedback');
    el.textContent = ''; el.className = 'missatge-feedback';
  }

  function finalitzarVictoria() {
    const niv = estat.nivellActual;
    desarProgres(niv.num + 1);
    const titol = document.getElementById('modal-titol');
    const text  = document.getElementById('modal-text');
    const botoP = document.getElementById('boto-modal-principal');
    if (niv.num >= TOTAL_NIVELLS) {
      titol.textContent = '𓂀 Déu d\'Egipte';
      text.textContent  = 'Has revelat tots els secrets de la tomba sagrada. El teu nom serà recordat per l\'eternitat.';
      botoP.textContent = 'Tornar a les Cambres';
      botoP.onclick = () => { amagarModal(); mostrarSelectorNivells(); };
    } else {
      titol.textContent = '☥ Cambra Revelada';
      text.textContent  = `Has desxifrat els jeroglífics de la Cambra ${niv.num}. Una nova porta s'obre davant teu.`;
      botoP.textContent = 'Següent Cambra ▶';
      botoP.onclick = () => { amagarModal(); iniciarNivell(niv.num + 1); };
    }
    mostrarModal();
  }

  function finalitzarDerrota() {
    const niv = estat.nivellActual;
    document.getElementById('modal-titol').textContent = '🔥 Torxa Apagada';
    document.getElementById('modal-text').textContent  = 'La llum s\'ha extingit dins la tomba. Recupera l\'esperit i torna a entrar.';
    const botoP = document.getElementById('boto-modal-principal');
    botoP.textContent = 'Reintentar';
    botoP.onclick = () => { amagarModal(); iniciarNivell(niv.num); };
    mostrarModal();
  }

  function mostrarModal() { document.getElementById('modal-final').classList.remove('ocult'); }
  function amagarModal()  { document.getElementById('modal-final').classList.add('ocult'); }
  function mostrarSelectorNivells() { renderitzarSelectorNivells(); mostrarPantalla('nivells'); }

  function connectarEsdeveniments() {
    document.body.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-accio]'); if (!t) return;
      const accio = t.dataset.accio;
      switch (accio) {
        case 'iniciar': Audio.init(); mostrarSelectorNivells(); break;
        case 'tutorial': mostrarPantalla('tutorial'); break;
        case 'tutorial-fet': mostrarSelectorNivells(); break;
        case 'tornar-landing': mostrarPantalla('landing'); break;
        case 'tornar-base': amagarModal(); mostrarSelectorNivells(); break;
        case 'modal-mapa': amagarModal(); mostrarSelectorNivells(); break;
        case 'reset-progres':
          if (confirm('Vols reiniciar el progrés? Tornaràs a la Cambra 1.')) { reiniciarProgres(); renderitzarSelectorNivells(); }
          break;
      }
    });
    document.getElementById('boto-escoltar').addEventListener('click', () => { Audio.init(); escoltarObjectiu(); });
    document.addEventListener('keydown', (ev) => {
      if (estat.pantallaActual === 'joc' && (ev.code === 'Space' || ev.key === ' ')) {
        ev.preventDefault(); escoltarObjectiu();
      }
    });
  }

  function arrencar() {
    generarEstrellesFons();
    carregarProgres();
    connectarEsdeveniments();
    mostrarPantalla('landing');
    requestAnimationFrame(dibuixarCanvas);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrencar);
  else arrencar();
})();

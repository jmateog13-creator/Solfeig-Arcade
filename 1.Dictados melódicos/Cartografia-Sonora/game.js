/* =====================================================
   CARTOGRAFIA SONORA — Motor del joc
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

  // CARTOGRAFIA — petjada de QUARTES i QUINTES tonals (cadència nàutica I-IV-V)
  const NIVELLS = [
    { num: 1,  fase: 1, nom: 'Mariner',   notes: ['Do4', 'Fa4', 'Sol4'],                                                                                rondes: 4 },  // I-IV-V
    { num: 2,  fase: 1, nom: 'Mariner',   notes: ['Do4', 'Re4', 'Fa4', 'Sol4', 'La4'],                                                                  rondes: 5 },  // afegir 2a/6a
    { num: 3,  fase: 1, nom: 'Mariner',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4'],                                                    rondes: 5 },
    { num: 4,  fase: 1, nom: 'Mariner',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5'],                                      rondes: 6 },
    { num: 5,  fase: 2, nom: 'Navegant',  notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 6 },
    { num: 6,  fase: 2, nom: 'Navegant',  notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 7 },
    { num: 7,  fase: 2, nom: 'Navegant',  notes: ['Do4', 'Sol4', 'Re5', 'La4', 'Mi5', 'Si4', 'Fa5'],                                                    rondes: 7 },  // cercle de 5tes
    { num: 8,  fase: 2, nom: 'Navegant',  notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 8 },
    { num: 9,  fase: 3, nom: 'Cartògraf', notes: ['Do4', 'Sol4', 'Re5', 'La4', 'Mi5'],                                                                  rondes: 7 },  // drill 5tes
    { num: 10, fase: 3, nom: 'Cartògraf', notes: ['Do4', 'Fa4', 'Do5', 'Fa5'],                                                                          rondes: 7 },  // drill 4tes/8s
    { num: 11, fase: 3, nom: 'Cartògraf', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 9 },
    { num: 12, fase: 3, nom: 'Cartògraf', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 11 },
    { num: 13, fase: 4, nom: 'Almirall',  notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5'],                rondes: 12 },
    { num: 14, fase: 4, nom: 'Almirall',  notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],         rondes: 13 },
    { num: 15, fase: 4, nom: 'Almirall',  notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],         rondes: 16 },
  ];

  const TOTAL_NIVELLS = NIVELLS.length;
  const VIDES_INICIALS = 3;
  const CLAU_PROGRES = 'cartografia-sonora-progres';
  const VIEW_W = 800, VIEW_H = 360;
  const RADI_HIT = 24;

  const estat = {
    pantallaActual: 'landing',
    nivellMaximDesbloquejat: 1,
    nivellActual: null,
    rondaActual: 0,
    notesEncertades: [],
    notaObjectiu: null,
    vides: VIDES_INICIALS,
    bloquejatPerInteraccio: false,
    punts: [],          // {idNota, x, y, encesa, flashError}
    arestes: [],        // {x1,y1,x2,y2,alpha}
    taquesError: [],    // {x, y, alpha, radi}
    ultimPort: null,
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
      if (nou > TOTAL_NIVELLS) try { localStorage.setItem('hub:done:cartografia', '1'); } catch (_) {}
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
    const simbols = ['⚓', '🧭', '⛵', '✦', '✧'];
    for (let i = 0; i < quantitat; i++) {
      const e = document.createElement('div');
      e.className = 'estrella-fons';
      e.textContent = simbols[Math.floor(Math.random() * simbols.length)];
      e.style.fontSize = (Math.random() * 10 + 12) + 'px';
      e.style.left = (Math.random() * 100) + '%';
      e.style.top  = (Math.random() * 100) + '%';
      e.style.setProperty('--dur', (Math.random() * 5 + 3) + 's');
      e.style.setProperty('--delay', (Math.random() * 6) + 's');
      e.style.setProperty('--max-opacitat', (Math.random() * 0.35 + 0.1).toFixed(2));
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

    // Pad — campana de vaixell (sine + harmònic + lleu modulació)
    function tocarPad(freq, duracio = 2.2) {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;
      const sortida = ctx.createGain();
      sortida.gain.setValueAtTime(0, ara);
      sortida.gain.linearRampToValueAtTime(0.50, ara + 0.20);
      sortida.gain.linearRampToValueAtTime(0.36, ara + duracio * 0.6);
      sortida.gain.exponentialRampToValueAtTime(0.0001, ara + duracio);

      const filtre = ctx.createBiquadFilter();
      filtre.type = 'lowpass'; filtre.frequency.value = 2200; filtre.Q.value = 0.8;

      const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = freq;
      const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = freq * 2.76; // campana
      const gO2 = ctx.createGain(); gO2.gain.value = 0.12;
      const osc3 = ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = freq * 5.4;
      const gO3 = ctx.createGain(); gO3.gain.value = 0.06;

      osc1.connect(filtre); osc2.connect(gO2).connect(filtre); osc3.connect(gO3).connect(filtre);
      filtre.connect(sortida).connect(masterGain);
      osc1.start(ara); osc2.start(ara); osc3.start(ara);
      const fi = ara + duracio + 0.2;
      osc1.stop(fi); osc2.stop(fi); osc3.stop(fi);
    }

    // Encert: esquitx de ploma (soroll curt) + to suau de campaneta + nota greu de ploma escrivint
    function tocarEncert() {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;

      // Esquitx (soroll curt agut)
      const buffSize = ctx.sampleRate * 0.12;
      const buf = ctx.createBuffer(1, buffSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < buffSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / buffSize);
      const noise = ctx.createBufferSource(); noise.buffer = buf;
      const nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 3000;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.3, ara);
      ng.gain.exponentialRampToValueAtTime(0.0001, ara + 0.12);
      noise.connect(nf).connect(ng).connect(masterGain);
      noise.start(ara); noise.stop(ara + 0.13);

      // Campaneta
      [1200, 1800].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain();
        const t = ara + 0.05 + i * 0.04;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.20, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
        o.connect(g).connect(masterGain);
        o.start(t); o.stop(t + 1.1);
      });

      // To greu de ploma escrivint
      const op = ctx.createOscillator(); op.type = 'triangle'; op.frequency.value = 280;
      const opf = ctx.createBiquadFilter(); opf.type = 'lowpass'; opf.frequency.value = 600;
      const opg = ctx.createGain();
      opg.gain.setValueAtTime(0.0001, ara + 0.1);
      opg.gain.linearRampToValueAtTime(0.12, ara + 0.13);
      opg.gain.exponentialRampToValueAtTime(0.0001, ara + 0.5);
      op.connect(opf).connect(opg).connect(masterGain);
      op.start(ara + 0.1); op.stop(ara + 0.55);
    }

    // Error: vent de tempesta (soroll lowpass amb LFO)
    function tocarError() {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;
      const buffSize = ctx.sampleRate * 0.7;
      const buf = ctx.createBuffer(1, buffSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < buffSize; i++) data[i] = (Math.random() * 2 - 1);
      const noise = ctx.createBufferSource(); noise.buffer = buf;

      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800; f.Q.value = 4;
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 6;
      const lfoG = ctx.createGain(); lfoG.gain.value = 400;
      lfo.connect(lfoG).connect(f.frequency);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ara);
      g.gain.linearRampToValueAtTime(0.45, ara + 0.05);
      g.gain.linearRampToValueAtTime(0.30, ara + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, ara + 0.7);
      noise.connect(f).connect(g).connect(masterGain);
      noise.start(ara); noise.stop(ara + 0.75);
      lfo.start(ara); lfo.stop(ara + 0.75);
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
      const desc = document.createElement('span'); desc.className = 'nivell-desc'; desc.textContent = `${niv.notes.length} ports`;
      const icona = document.createElement('span'); icona.className = 'nivell-icona';
      icona.textContent = !desbloquejat ? '🔒' : (completat ? '⚓' : '🧭');
      const fase = document.createElement('span'); fase.className = 'nivell-fase-nom'; fase.textContent = niv.nom;
      boto.appendChild(num); boto.appendChild(desc); boto.appendChild(icona); boto.appendChild(fase);
      const estat_txt = !desbloquejat ? 'Bloquejat' : (completat ? 'Completat' : 'Disponible');
      boto.title = `Travessia ${niv.num} — ${niv.nom}\n${niv.notes.length} ports · ${niv.rondes} rondes\n${estat_txt}`;
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
    estat.ultimPort = null;
    estat.arestes = [];
    estat.taquesError = [];
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
    cont.textContent = '⚓ '.repeat(Math.max(0, estat.vides)).trim() || '— sense àncores —';
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
  const canvas = document.getElementById('canvas-mapa');
  const ctx2d = canvas.getContext('2d');

  function construirPunts(nivell) {
    const margeEsq = 175, margeDre = 720;
    const ample = margeDre - margeEsq;
    const pas = nivell.notes.length > 1 ? ample / (nivell.notes.length - 1) : 0;
    estat.punts = nivell.notes.map((id, i) => {
      const x = nivell.notes.length === 1 ? margeEsq + ample / 2 : margeEsq + i * pas;
      return { idNota: id, x, y: NOTES[id].y, encesa: false, flashError: 0 };
    });
  }

  function dibuixarPentagrama() {
    // 5 línies del pentagrama dibuixades en tinta
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(20, 50, 100, 0.7)';
    ctx2d.lineWidth = 1.3;
    PENTA_LINIES.forEach(y => {
      ctx2d.beginPath(); ctx2d.moveTo(PENTA_X_INI, y); ctx2d.lineTo(PENTA_X_FI, y); ctx2d.stroke();
    });
    ctx2d.restore();

    // Línies suplementàries
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(20, 50, 100, 0.7)';
    ctx2d.lineWidth = 1.3;
    estat.punts.forEach(p => {
      const sup = NOTES[p.idNota].suplementaria;
      if (sup === 'sota') {
        ctx2d.beginPath(); ctx2d.moveTo(p.x - 16, 250); ctx2d.lineTo(p.x + 16, 250); ctx2d.stroke();
      } else if (sup === 'sobre') {
        ctx2d.beginPath(); ctx2d.moveTo(p.x - 16, 70); ctx2d.lineTo(p.x + 16, 70); ctx2d.stroke();
      }
    });
    ctx2d.restore();

    // Clau de Sol en tinta blau marí
    ctx2d.save();
    ctx2d.fillStyle = 'rgba(20, 50, 100, 0.95)';
    ctx2d.shadowColor = 'rgba(20, 50, 100, 0.6)';
    ctx2d.shadowBlur = 8;
    ctx2d.font = '150px "Bravura", "Apple Symbols", "Segoe UI Symbol", "Noto Music", "DejaVu Sans", serif';
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'alphabetic';
    ctx2d.fillText('𝄞', 105, 235);
    ctx2d.restore();
  }

  function dibuixarMapaFons() {
    const w = VIEW_W, h = VIEW_H;
    // Pergamí
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#e2c590');
    grad.addColorStop(0.5, '#d9b87a');
    grad.addColorStop(1, '#b88a4f');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);

    // Taques d'humitat (gradients radials marrons subtils, posicions fixes per coherència)
    const taques = [
      { x: 100, y: 60, r: 90, a: 0.10 },
      { x: 700, y: 80, r: 110, a: 0.12 },
      { x: 200, y: 280, r: 100, a: 0.08 },
      { x: 600, y: 290, r: 120, a: 0.10 },
      { x: 400, y: 180, r: 80, a: 0.06 },
    ];
    taques.forEach(t => {
      const g = ctx2d.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.r);
      g.addColorStop(0, `rgba(80, 50, 25, ${t.a})`);
      g.addColorStop(1, 'rgba(80, 50, 25, 0)');
      ctx2d.fillStyle = g;
      ctx2d.fillRect(t.x - t.r, t.y - t.r, t.r * 2, t.r * 2);
    });

    // Marc de la carta
    ctx2d.strokeStyle = 'rgba(80, 50, 25, 0.45)';
    ctx2d.lineWidth = 3;
    ctx2d.strokeRect(20, 20, w - 40, h - 40);
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(28, 28, w - 56, h - 56);

    // Roses dels vents a les cantonades
    [{ x: 60, y: 60, r: 22 }, { x: w - 60, y: h - 60, r: 22 }].forEach(rosa => {
      ctx2d.save();
      ctx2d.translate(rosa.x, rosa.y);
      ctx2d.strokeStyle = 'rgba(80, 50, 25, 0.5)';
      ctx2d.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx2d.save();
        ctx2d.rotate((Math.PI / 2) * i);
        ctx2d.beginPath();
        ctx2d.moveTo(0, 0);
        ctx2d.lineTo(rosa.r, 0);
        ctx2d.lineTo(rosa.r * 0.4, rosa.r * 0.15);
        ctx2d.closePath();
        ctx2d.fillStyle = 'rgba(80, 50, 25, 0.25)';
        ctx2d.fill(); ctx2d.stroke();
        ctx2d.restore();
      }
      ctx2d.beginPath(); ctx2d.arc(0, 0, 3, 0, Math.PI * 2); ctx2d.fillStyle = 'rgba(80, 50, 25, 0.6)'; ctx2d.fill();
      ctx2d.restore();
    });
  }

  function dibuixarRosaPort(x, y, r) {
    ctx2d.save();
    ctx2d.translate(x, y);
    ctx2d.strokeStyle = 'rgba(20, 50, 100, 0.85)';
    ctx2d.fillStyle = 'rgba(40, 90, 160, 0.7)';
    ctx2d.lineWidth = 1.2;
    ctx2d.shadowColor = 'rgba(20, 50, 100, 0.4)'; ctx2d.shadowBlur = 6;
    for (let i = 0; i < 8; i++) {
      ctx2d.save();
      ctx2d.rotate((Math.PI / 4) * i);
      ctx2d.beginPath();
      ctx2d.moveTo(0, 0);
      ctx2d.lineTo(r, 0);
      ctx2d.lineTo(r * 0.4, r * 0.18);
      ctx2d.closePath();
      ctx2d.fill(); ctx2d.stroke();
      ctx2d.restore();
    }
    ctx2d.shadowBlur = 0;
    ctx2d.beginPath(); ctx2d.arc(0, 0, 3, 0, Math.PI * 2); ctx2d.fillStyle = '#1a3a6e'; ctx2d.fill();
    ctx2d.restore();
  }

  function dibuixarCanvas() {
    dibuixarMapaFons();
    dibuixarPentagrama();

    // Línies discontínues de ruta (tinta)
    estat.arestes.forEach(a => {
      ctx2d.save();
      ctx2d.setLineDash([6, 5]);
      ctx2d.strokeStyle = `rgba(20, 50, 100, ${a.alpha})`;
      ctx2d.lineWidth = 2;
      ctx2d.shadowColor = 'rgba(20, 50, 100, 0.5)';
      ctx2d.shadowBlur = 4;
      ctx2d.beginPath(); ctx2d.moveTo(a.x1, a.y1); ctx2d.lineTo(a.x2, a.y2); ctx2d.stroke();
      ctx2d.setLineDash([]);
      ctx2d.restore();
    });

    // Taques d'error (tinta esquitxada)
    estat.taquesError = estat.taquesError.filter(t => t.alpha > 0.02);
    estat.taquesError.forEach(t => {
      ctx2d.save();
      const g = ctx2d.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.radi);
      g.addColorStop(0, `rgba(80, 30, 30, ${t.alpha * 0.7})`);
      g.addColorStop(1, 'rgba(80, 30, 30, 0)');
      ctx2d.fillStyle = g;
      ctx2d.fillRect(t.x - t.radi, t.y - t.radi, t.radi * 2, t.radi * 2);
      t.alpha *= 0.992;
      ctx2d.restore();
    });

    // Punts (illots/ports clarament visibles sobre el pentagrama)
    estat.punts.forEach(p => {
      if (p.encesa) {
        dibuixarRosaPort(p.x, p.y, 14);
      } else {
        ctx2d.save();
        // Halo subtil en tinta
        const halo = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
        halo.addColorStop(0, 'rgba(20, 50, 100, 0.30)');
        halo.addColorStop(1, 'rgba(20, 50, 100, 0)');
        ctx2d.fillStyle = halo;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 16, 0, Math.PI * 2); ctx2d.fill();

        // Cap de nota tipus illot/punt nàutic
        ctx2d.fillStyle = 'rgba(40, 90, 160, 0.7)';
        ctx2d.strokeStyle = 'rgba(20, 50, 100, 0.95)';
        ctx2d.lineWidth = 2;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx2d.fill(); ctx2d.stroke();
        ctx2d.restore();
      }
      if (p.flashError > 0) {
        ctx2d.save();
        ctx2d.fillStyle = `rgba(163, 37, 37, ${p.flashError * 0.5})`;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 22, 0, Math.PI * 2); ctx2d.fill();
        p.flashError = Math.max(0, p.flashError - 0.04);
        ctx2d.restore();
      }
    });

    // Nom efímer
    if (estat.nomEfimer && estat.nomEfimer.alpha > 0) {
      ctx2d.save();
      ctx2d.fillStyle = `rgba(20, 50, 100, ${estat.nomEfimer.alpha})`;
      ctx2d.font = 'italic 16px IM Fell English, Georgia, serif';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(estat.nomEfimer.text, estat.nomEfimer.x, estat.nomEfimer.y - 22);
      estat.nomEfimer.alpha -= 0.012;
      ctx2d.restore();
    }

    // Cursor compàs
    if (estat.cursor.dins) {
      const cx = estat.cursor.x, cy = estat.cursor.y;
      ctx2d.save();
      ctx2d.strokeStyle = 'rgba(20, 50, 100, 0.85)';
      ctx2d.lineWidth = 1.5;
      // Creu d'agulla
      ctx2d.beginPath(); ctx2d.moveTo(cx - 12, cy); ctx2d.lineTo(cx + 12, cy); ctx2d.stroke();
      ctx2d.beginPath(); ctx2d.moveTo(cx, cy - 12); ctx2d.lineTo(cx, cy + 12); ctx2d.stroke();
      ctx2d.beginPath(); ctx2d.arc(cx, cy, 7, 0, Math.PI * 2); ctx2d.stroke();
      // Punt central
      ctx2d.fillStyle = '#1a3a6e';
      ctx2d.beginPath(); ctx2d.arc(cx, cy, 2, 0, Math.PI * 2); ctx2d.fill();
      ctx2d.restore();
    }

    requestAnimationFrame(dibuixarCanvas);
  }

  // ---------------------------------------------------
  // INTERACCIÓ
  // ---------------------------------------------------
  function obtenirCoordCanvas(ev) {
    const r = canvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * (VIEW_W / r.width), y: (ev.clientY - r.top) * (VIEW_H / r.height) };
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
    if (!trobat) {
      // Click fora de cap port: petita taca a la posició
      if (estat.notaObjectiu) {
        // No fem res
      }
      return;
    }
    intentarPunt(trobat, c.x, c.y);
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

  function intentarPunt(punt, clickX, clickY) {
    if (!estat.notaObjectiu) { Audio.tocarPad(NOTES[punt.idNota].freq, 1.4); return; }
    if (punt.idNota === estat.notaObjectiu) gestionarEncert(punt);
    else gestionarError(punt, clickX, clickY);
  }

  function gestionarEncert(punt) {
    estat.bloquejatPerInteraccio = true;
    punt.encesa = true;
    Audio.tocarPad(NOTES[punt.idNota].freq, 1.0);
    setTimeout(() => Audio.tocarEncert(), 80);

    estat.nomEfimer = { text: NOTES[punt.idNota].nom, x: punt.x, y: punt.y, alpha: 1.4 };

    if (estat.ultimPort) {
      estat.arestes.push({ x1: estat.ultimPort.x, y1: estat.ultimPort.y, x2: punt.x, y2: punt.y, alpha: 0 });
      const aresta = estat.arestes[estat.arestes.length - 1];
      const inici = performance.now();
      const animar = () => {
        const t = Math.min(1, (performance.now() - inici) / 600);
        aresta.alpha = t * 0.85;
        if (t < 1) requestAnimationFrame(animar);
      };
      requestAnimationFrame(animar);
    }
    estat.ultimPort = { x: punt.x, y: punt.y };

    if (!estat.notesEncertades.includes(punt.idNota)) estat.notesEncertades.push(punt.idNota);
    marcarRondaCompleta(estat.rondaActual - 1);
    feedback('⚓ Port marcat — ' + NOTES[punt.idNota].nom, 'encert');

    setTimeout(() => seguentRonda(), 1400);
  }

  function gestionarError(punt, clickX, clickY) {
    estat.bloquejatPerInteraccio = true;
    punt.flashError = 1;
    estat.taquesError.push({ x: clickX, y: clickY, alpha: 1, radi: 30 + Math.random() * 14 });
    Audio.tocarError();
    canvas.classList.remove('shake'); void canvas.offsetWidth; canvas.classList.add('shake');

    estat.vides -= 1;
    actualitzarVidesHud(true);
    feedback('⛈️ El vaixell s\'ha desviat! Recalcula la latitud.', 'error');

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
      titol.textContent = '🌊 Almirall del Mar';
      text.textContent  = 'Has cartografiat tots els mars del món sonor. Les teves rutes guiaran navegants per generacions.';
      botoP.textContent = 'Tornar al Port';
      botoP.onclick = () => { amagarModal(); mostrarSelectorNivells(); };
    } else {
      titol.textContent = '⚓ Port Trobat';
      text.textContent  = `Has arribat al port secret de la Travessia ${niv.num}. Una nova carta de navegació t'espera.`;
      botoP.textContent = 'Següent Travessia ▶';
      botoP.onclick = () => { amagarModal(); iniciarNivell(niv.num + 1); };
    }
    mostrarModal();
  }

  function finalitzarDerrota() {
    const niv = estat.nivellActual;
    document.getElementById('modal-titol').textContent = '⛈️ Tempesta';
    document.getElementById('modal-text').textContent  = 'El vaixell s\'ha desviat sota la tempesta. Repara les veles i salpa de nou.';
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
          if (confirm('Vols reiniciar el progrés? Tornaràs a la Travessia 1.')) { reiniciarProgres(); renderitzarSelectorNivells(); }
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

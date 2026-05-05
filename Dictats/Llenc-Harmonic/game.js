/* =====================================================
   EL LLENÇ HARMÒNIC — Motor del joc
   ===================================================== */

(() => {
  'use strict';

  const NOTES = {
    'Do4':  { freq: 261.63, y: 250, nom: 'Do', octava: 4, color: '#c8403c', suplementaria: 'sota' },
    'Re4':  { freq: 293.66, y: 235, nom: 'Re', octava: 4, color: '#d96030' },
    'Mi4':  { freq: 329.63, y: 220, nom: 'Mi', octava: 4, color: '#f0a040' },
    'Fa4':  { freq: 349.23, y: 205, nom: 'Fa', octava: 4, color: '#f0c040' },
    'Sol4': { freq: 392.00, y: 190, nom: 'Sol', octava: 4, color: '#a0c040' },
    'La4':  { freq: 440.00, y: 175, nom: 'La', octava: 4, color: '#4a8030' },
    'Si4':  { freq: 493.88, y: 160, nom: 'Si', octava: 4, color: '#3098a0' },
    'Do5':  { freq: 523.25, y: 145, nom: 'Do', octava: 5, color: '#2c5aa0' },
    'Re5':  { freq: 587.33, y: 130, nom: 'Re', octava: 5, color: '#5040a0' },
    'Mi5':  { freq: 659.25, y: 115, nom: 'Mi', octava: 5, color: '#8b3060' },
    'Fa5':  { freq: 698.46, y: 100, nom: 'Fa', octava: 5, color: '#c83080' },
    'Sol5': { freq: 783.99, y: 85,  nom: 'Sol', octava: 5, color: '#d4a045' },
    'La5':  { freq: 880.00, y: 70,  nom: 'La', octava: 5, color: '#f5c060', suplementaria: 'sobre' },
  };

  const PENTA_X_INI = 145, PENTA_X_FI = 760;
  const PENTA_LINIES = [100, 130, 160, 190, 220];

  // LLENÇ — petjada de TRIADES cromàtiques (paral·lel a triades de colors primaris)
  const NIVELLS = [
    { num: 1,  fase: 1, nom: 'Aprenent',      notes: ['Do4', 'Mi4', 'Sol4'],                                                                                rondes: 4 },  // triada Do major (vermell-groc-blau)
    { num: 2,  fase: 1, nom: 'Aprenent',      notes: ['Do4', 'Mi4', 'Fa4', 'La4', 'Do5'],                                                                  rondes: 5 },  // + triada Fa major
    { num: 3,  fase: 1, nom: 'Aprenent',      notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4'],                                                    rondes: 5 },
    { num: 4,  fase: 1, nom: 'Aprenent',      notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5'],                               rondes: 6 },
    { num: 5,  fase: 2, nom: 'Artista',       notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 6 },
    { num: 6,  fase: 2, nom: 'Artista',       notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 7 },
    { num: 7,  fase: 2, nom: 'Artista',       notes: ['Do4', 'Mi4', 'Sol4', 'Do5', 'Mi5', 'La4', 'Re5', 'Fa5'],                                             rondes: 7 },  // triades I-IV-V
    { num: 8,  fase: 2, nom: 'Artista',       notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 8 },
    { num: 9,  fase: 3, nom: 'Mestre',        notes: ['Do4', 'Mi4', 'Sol4', 'Do5', 'Mi5'],                                                                  rondes: 7 },  // drill triada Do
    { num: 10, fase: 3, nom: 'Mestre',        notes: ['Fa4', 'La4', 'Do5', 'Mi5'],                                                                          rondes: 7 },  // drill espais
    { num: 11, fase: 3, nom: 'Mestre',        notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 9 },
    { num: 12, fase: 3, nom: 'Mestre',        notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 11 },
    { num: 13, fase: 4, nom: 'Mestre Pintor', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5'],                rondes: 12 },
    { num: 14, fase: 4, nom: 'Mestre Pintor', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],         rondes: 13 },
    { num: 15, fase: 4, nom: 'Mestre Pintor', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],         rondes: 16 },
  ];

  const TOTAL_NIVELLS = NIVELLS.length;
  const VIDES_INICIALS = 3;
  const CLAU_PROGRES = 'llenc-harmonic-progres';
  const VIEW_W = 800, VIEW_H = 360;
  const RADI_HIT = 26;

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
    pinzellades: [],    // {x, y, color, radi}
    taquesGris: [],     // {x, y, alpha, radi}
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
      if (nou > TOTAL_NIVELLS) try { localStorage.setItem('hub:done:llenc', '1'); } catch (_) {}
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

  function generarEstrellesFons(quantitat = 60) {
    const cont = document.getElementById('estrelles-fons');
    const fragment = document.createDocumentFragment();
    const colors = ['#c8403c', '#f0c040', '#4a8030', '#2c5aa0', '#d4a045', '#8b3060'];
    for (let i = 0; i < quantitat; i++) {
      const e = document.createElement('div');
      e.className = 'estrella-fons';
      const mida = Math.random() * 8 + 4;
      e.style.width = mida + 'px';
      e.style.height = mida + 'px';
      e.style.background = colors[Math.floor(Math.random() * colors.length)];
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

    // Pad — piano cristal·lí (sine + harmònics curts)
    function tocarPad(freq, duracio = 2.0) {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;
      const sortida = ctx.createGain();
      sortida.gain.setValueAtTime(0, ara);
      sortida.gain.linearRampToValueAtTime(0.5, ara + 0.02);
      sortida.gain.exponentialRampToValueAtTime(0.18, ara + 0.5);
      sortida.gain.exponentialRampToValueAtTime(0.0001, ara + duracio);

      const filtre = ctx.createBiquadFilter();
      filtre.type = 'lowpass'; filtre.frequency.value = 3000; filtre.Q.value = 0.5;

      const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = freq;
      const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = freq * 2;
      const gO2 = ctx.createGain(); gO2.gain.value = 0.15;
      const osc3 = ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = freq * 3;
      const gO3 = ctx.createGain(); gO3.gain.value = 0.07;

      osc1.connect(filtre); osc2.connect(gO2).connect(filtre); osc3.connect(gO3).connect(filtre);
      filtre.connect(sortida).connect(masterGain);
      osc1.start(ara); osc2.start(ara); osc3.start(ara);
      const fi = ara + duracio + 0.2;
      osc1.stop(fi); osc2.stop(fi); osc3.stop(fi);
    }

    // Encert: "Swoosh" de pinzell humit (soroll filtrat amb sweep)
    function tocarEncert() {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;

      const buffSize = ctx.sampleRate * 0.4;
      const buf = ctx.createBuffer(1, buffSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < buffSize; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
      const noise = ctx.createBufferSource(); noise.buffer = buf;

      const f = ctx.createBiquadFilter(); f.type = 'bandpass';
      f.frequency.setValueAtTime(800, ara);
      f.frequency.exponentialRampToValueAtTime(2400, ara + 0.3);
      f.Q.value = 2;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ara);
      g.gain.linearRampToValueAtTime(0.35, ara + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ara + 0.4);

      noise.connect(f).connect(g).connect(masterGain);
      noise.start(ara); noise.stop(ara + 0.45);

      // Cling complementari
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 1800;
      const og = ctx.createGain();
      og.gain.setValueAtTime(0, ara + 0.1);
      og.gain.linearRampToValueAtTime(0.18, ara + 0.12);
      og.gain.exponentialRampToValueAtTime(0.0001, ara + 0.7);
      o.connect(og).connect(masterGain);
      o.start(ara + 0.1); o.stop(ara + 0.75);
    }

    // Error: "Plop" sec (pintura caient a terra)
    function tocarError() {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(180, ara);
      o.frequency.exponentialRampToValueAtTime(50, ara + 0.2);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 350;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ara);
      g.gain.linearRampToValueAtTime(0.5, ara + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ara + 0.3);
      o.connect(f).connect(g).connect(masterGain);
      o.start(ara); o.stop(ara + 0.35);

      // Petit tail de soroll humit
      const buffSize = ctx.sampleRate * 0.15;
      const buf = ctx.createBuffer(1, buffSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < buffSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
      const noise = ctx.createBufferSource(); noise.buffer = buf;
      const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 800;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.18, ara);
      ng.gain.exponentialRampToValueAtTime(0.0001, ara + 0.15);
      noise.connect(nf).connect(ng).connect(masterGain);
      noise.start(ara); noise.stop(ara + 0.18);
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
      const desc = document.createElement('span'); desc.className = 'nivell-desc'; desc.textContent = `${niv.notes.length} colors`;
      const icona = document.createElement('span'); icona.className = 'nivell-icona';
      icona.textContent = !desbloquejat ? '🔒' : (completat ? '🖼️' : '🖌️');
      const fase = document.createElement('span'); fase.className = 'nivell-fase-nom'; fase.textContent = niv.nom;
      boto.appendChild(num); boto.appendChild(desc); boto.appendChild(icona); boto.appendChild(fase);
      const estat_txt = !desbloquejat ? 'Bloquejat' : (completat ? 'Completat' : 'Disponible');
      boto.title = `Obra ${niv.num} — ${niv.nom}\n${niv.notes.length} colors · ${niv.rondes} pinzellades\n${estat_txt}`;
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
    estat.pinzellades = [];
    estat.taquesGris = [];
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
    cont.textContent = '🖌️ '.repeat(Math.max(0, estat.vides)).trim() || '— sense pinzells —';
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
  const canvas = document.getElementById('canvas-llens');
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
    // 5 línies dibuixades en carbonet sobre tela
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(80, 50, 30, 0.55)';
    ctx2d.lineWidth = 1.4;
    PENTA_LINIES.forEach(y => {
      ctx2d.beginPath(); ctx2d.moveTo(PENTA_X_INI, y); ctx2d.lineTo(PENTA_X_FI, y); ctx2d.stroke();
    });
    ctx2d.restore();

    // Línies suplementàries
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(80, 50, 30, 0.55)';
    ctx2d.lineWidth = 1.4;
    estat.punts.forEach(p => {
      const sup = NOTES[p.idNota].suplementaria;
      if (sup === 'sota') {
        ctx2d.beginPath(); ctx2d.moveTo(p.x - 16, 250); ctx2d.lineTo(p.x + 16, 250); ctx2d.stroke();
      } else if (sup === 'sobre') {
        ctx2d.beginPath(); ctx2d.moveTo(p.x - 16, 70); ctx2d.lineTo(p.x + 16, 70); ctx2d.stroke();
      }
    });
    ctx2d.restore();

    // Clau de Sol pintada amb to vermellós
    ctx2d.save();
    ctx2d.fillStyle = 'rgba(140, 50, 40, 0.92)';
    ctx2d.shadowColor = 'rgba(80, 30, 20, 0.5)';
    ctx2d.shadowBlur = 6;
    ctx2d.font = '150px "Bravura", "Apple Symbols", "Segoe UI Symbol", "Noto Music", "DejaVu Sans", serif';
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'alphabetic';
    ctx2d.fillText('𝄞', 105, 235);
    ctx2d.restore();
  }

  function dibuixarLlens() {
    const w = VIEW_W, h = VIEW_H;
    // Tela crua de fons
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f4e8d0');
    grad.addColorStop(0.5, '#ebdcc0');
    grad.addColorStop(1, '#d4c4a0');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);

    // Textura de tela (línies fines creuades)
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(150, 120, 80, 0.10)';
    ctx2d.lineWidth = 1;
    for (let y = 0; y < h; y += 4) {
      ctx2d.beginPath(); ctx2d.moveTo(0, y); ctx2d.lineTo(w, y); ctx2d.stroke();
    }
    for (let x = 0; x < w; x += 4) {
      ctx2d.beginPath(); ctx2d.moveTo(x, 0); ctx2d.lineTo(x, h); ctx2d.stroke();
    }
    ctx2d.restore();

  }

  function dibuixarCanvas() {
    dibuixarLlens();
    dibuixarPentagrama();

    // Taques d'error (gris)
    estat.taquesGris = estat.taquesGris.filter(t => t.alpha > 0.02);
    estat.taquesGris.forEach(t => {
      ctx2d.save();
      const g = ctx2d.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.radi);
      g.addColorStop(0, `rgba(100, 90, 80, ${t.alpha * 0.7})`);
      g.addColorStop(1, 'rgba(100, 90, 80, 0)');
      ctx2d.fillStyle = g;
      ctx2d.fillRect(t.x - t.radi, t.y - t.radi, t.radi * 2, t.radi * 2);
      t.alpha *= 0.998;
      ctx2d.restore();
    });

    // Pinzellades (impasto)
    estat.pinzellades.forEach(pz => {
      ctx2d.save();
      // Capa base de color
      ctx2d.fillStyle = pz.color;
      ctx2d.shadowColor = pz.color;
      ctx2d.shadowBlur = 6;
      ctx2d.beginPath();
      // Forma irregular tipus impasto
      const passos = 12;
      for (let i = 0; i < passos; i++) {
        const ang = (Math.PI * 2 / passos) * i;
        const r = pz.radi * (0.85 + Math.sin(i * 1.7 + pz.seed) * 0.15);
        const px = pz.x + Math.cos(ang) * r;
        const py = pz.y + Math.sin(ang) * r * 0.7;
        if (i === 0) ctx2d.moveTo(px, py); else ctx2d.lineTo(px, py);
      }
      ctx2d.closePath();
      ctx2d.fill();
      // Brillantor de pinzell humit
      ctx2d.shadowBlur = 0;
      ctx2d.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx2d.beginPath();
      ctx2d.ellipse(pz.x - pz.radi * 0.3, pz.y - pz.radi * 0.3, pz.radi * 0.4, pz.radi * 0.2, -0.4, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.restore();
    });

    // Punts (zones clicables)
    estat.punts.forEach(p => {
      ctx2d.save();
      if (p.flashError > 0) {
        ctx2d.fillStyle = `rgba(107, 48, 48, ${p.flashError * 0.5})`;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 24, 0, Math.PI * 2); ctx2d.fill();
        p.flashError = Math.max(0, p.flashError - 0.04);
      }
      if (!p.encesa) {
        // Cap de nota tipus esbós a llapis
        const halo = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
        halo.addColorStop(0, 'rgba(80, 50, 30, 0.20)');
        halo.addColorStop(1, 'rgba(80, 50, 30, 0)');
        ctx2d.fillStyle = halo;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 16, 0, Math.PI * 2); ctx2d.fill();

        ctx2d.fillStyle = 'rgba(244, 232, 208, 0.95)';
        ctx2d.strokeStyle = 'rgba(80, 50, 30, 0.85)';
        ctx2d.lineWidth = 2;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx2d.fill(); ctx2d.stroke();
      }
      ctx2d.restore();
    });

    // Nom efímer
    if (estat.nomEfimer && estat.nomEfimer.alpha > 0) {
      ctx2d.save();
      ctx2d.fillStyle = `rgba(60, 30, 60, ${estat.nomEfimer.alpha})`;
      ctx2d.font = 'italic bold 18px Cormorant Garamond, Georgia, serif';
      ctx2d.textAlign = 'center';
      ctx2d.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx2d.shadowBlur = 6;
      ctx2d.fillText(estat.nomEfimer.text, estat.nomEfimer.x, estat.nomEfimer.y - 24);
      estat.nomEfimer.alpha -= 0.012;
      ctx2d.restore();
    }

    // Cursor pinzell
    if (estat.cursor.dins) {
      const cx = estat.cursor.x, cy = estat.cursor.y;
      ctx2d.save();
      // Mànec del pinzell
      ctx2d.strokeStyle = '#3a2010'; ctx2d.lineWidth = 5; ctx2d.lineCap = 'round';
      ctx2d.beginPath(); ctx2d.moveTo(cx + 4, cy + 4); ctx2d.lineTo(cx + 26, cy + 26); ctx2d.stroke();
      ctx2d.strokeStyle = '#8b6028'; ctx2d.lineWidth = 3;
      ctx2d.beginPath(); ctx2d.moveTo(cx + 5, cy + 5); ctx2d.lineTo(cx + 24, cy + 24); ctx2d.stroke();
      // Virola metàl·lica
      ctx2d.fillStyle = '#a8a8a8';
      ctx2d.beginPath();
      ctx2d.ellipse(cx + 3, cy + 3, 4, 6, Math.PI / 4, 0, Math.PI * 2);
      ctx2d.fill();
      // Punta amb pintura (color de la nota objectiu si hi ha)
      const colorPinzell = estat.notaObjectiu ? NOTES[estat.notaObjectiu].color : '#c8403c';
      ctx2d.fillStyle = colorPinzell;
      ctx2d.shadowColor = colorPinzell; ctx2d.shadowBlur = 4;
      ctx2d.beginPath();
      ctx2d.moveTo(cx, cy);
      ctx2d.lineTo(cx + 7, cy + 1);
      ctx2d.lineTo(cx + 1, cy + 7);
      ctx2d.closePath();
      ctx2d.fill();
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
    if (!trobat) return;
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
    Audio.tocarPad(NOTES[punt.idNota].freq, 0.9);
    setTimeout(() => Audio.tocarEncert(), 80);

    // Afegir pinzellada al llenç
    estat.pinzellades.push({
      x: punt.x, y: punt.y,
      color: NOTES[punt.idNota].color,
      radi: 22 + Math.random() * 6,
      seed: Math.random() * 100
    });

    estat.nomEfimer = { text: NOTES[punt.idNota].nom, x: punt.x, y: punt.y, alpha: 1.4 };

    if (!estat.notesEncertades.includes(punt.idNota)) estat.notesEncertades.push(punt.idNota);
    marcarRondaCompleta(estat.rondaActual - 1);
    feedback('🎨 Pinzellada — ' + NOTES[punt.idNota].nom, 'encert');

    setTimeout(() => seguentRonda(), 1400);
  }

  function gestionarError(punt, clickX, clickY) {
    estat.bloquejatPerInteraccio = true;
    punt.flashError = 1;
    estat.taquesGris.push({ x: clickX, y: clickY, alpha: 0.7, radi: 35 + Math.random() * 12 });
    Audio.tocarError();
    canvas.classList.remove('shake'); void canvas.offsetWidth; canvas.classList.add('shake');

    estat.vides -= 1;
    actualitzarVidesHud(true);
    feedback('💧 La pintura ha caigut. Recalcula el color.', 'error');

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
      titol.textContent = '🖼️ Mestre Pintor';
      text.textContent  = 'Has pintat totes les obres mestres. La teva paleta és immortal.';
      botoP.textContent = 'Tornar a la Pinacoteca';
      botoP.onclick = () => { amagarModal(); mostrarSelectorNivells(); };
    } else {
      titol.textContent = '🎨 Obra Revelada';
      text.textContent  = `Has acabat l'Obra ${niv.num}. Una nova tela t'espera per pintar.`;
      botoP.textContent = 'Següent Obra ▶';
      botoP.onclick = () => { amagarModal(); iniciarNivell(niv.num + 1); };
    }
    mostrarModal();
  }

  function finalitzarDerrota() {
    const niv = estat.nivellActual;
    document.getElementById('modal-titol').textContent = '💧 Pinzell Trencat';
    document.getElementById('modal-text').textContent  = 'La paleta s\'ha quedat sense colors. Neteja el llenç i torna-ho a provar.';
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
          if (confirm('Vols reiniciar el progrés? Tornaràs a l\'Obra 1.')) { reiniciarProgres(); renderitzarSelectorNivells(); }
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

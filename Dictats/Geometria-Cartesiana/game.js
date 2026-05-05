/* =====================================================
   GEOMETRIA SÒNICA — Motor del joc
   ===================================================== */

(() => {
  'use strict';

  // ---------------------------------------------------
  // CATÀLEG DE NOTES (mateix mapeig de freqüències i alçades Y)
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // DEFINICIÓ DE NIVELLS
  // ---------------------------------------------------
  // GEOMETRIA — petjada de TERCERES i TRIADES (intervals geomètrics)
  const NIVELLS = [
    { num: 1,  fase: 1, nom: 'Esbós',           notes: ['Do4', 'Mi4', 'Sol4'],                                                                                rondes: 4 },  // triada Do major
    { num: 2,  fase: 1, nom: 'Esbós',           notes: ['Do4', 'Mi4', 'Sol4', 'Si4', 'Re5'],                                                                  rondes: 5 },  // terceres ascendents
    { num: 3,  fase: 1, nom: 'Esbós',           notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5'],                                             rondes: 5 },
    { num: 4,  fase: 1, nom: 'Esbós',           notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5'],                               rondes: 6 },
    { num: 5,  fase: 2, nom: 'Polígon',         notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 6 },
    { num: 6,  fase: 2, nom: 'Polígon',         notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 7 },
    { num: 7,  fase: 2, nom: 'Polígon',         notes: ['Mi4', 'Sol4', 'Si4', 'Re5', 'Fa5', 'Do5', 'La4', 'Mi5'],                                             rondes: 7 },  // salts triada
    { num: 8,  fase: 2, nom: 'Polígon',         notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 8 },
    { num: 9,  fase: 3, nom: 'Geòmetra',        notes: ['Mi4', 'Sol4', 'Si4', 'Re5', 'Fa5'],                                                                  rondes: 7 },  // drill línies
    { num: 10, fase: 3, nom: 'Geòmetra',        notes: ['Fa4', 'La4', 'Do5', 'Mi5'],                                                                          rondes: 7 },  // drill espais
    { num: 11, fase: 3, nom: 'Geòmetra',        notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 9 },
    { num: 12, fase: 3, nom: 'Geòmetra',        notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                        rondes: 11 },
    { num: 13, fase: 4, nom: 'Mestre Cartesià', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5'],                rondes: 12 },
    { num: 14, fase: 4, nom: 'Mestre Cartesià', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],         rondes: 13 },
    { num: 15, fase: 4, nom: 'Mestre Cartesià', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],         rondes: 16 },
  ];

  const TOTAL_NIVELLS = NIVELLS.length;
  const VIDES_INICIALS = 3;
  const CLAU_PROGRES = 'geometria-sonica-progres';
  const VIEW_W = 800, VIEW_H = 360;
  const RADI_VERTEX = 9;
  const RADI_HIT = 22;

  // ---------------------------------------------------
  // ESTAT GLOBAL
  // ---------------------------------------------------
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
    ultimVertex: null,
    cursor: { x: -100, y: -100, dins: false },
    flashCanvas: 0,
    nomEfimer: null,
  };

  // ---------------------------------------------------
  // PROGRÉS
  // ---------------------------------------------------
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
      if (nou > TOTAL_NIVELLS) try { localStorage.setItem('hub:done:geometria', '1'); } catch (_) {}
    }
  }

  function reiniciarProgres() {
    estat.nivellMaximDesbloquejat = 1;
    try { localStorage.removeItem(CLAU_PROGRES); } catch (_) {}
  }

  // ---------------------------------------------------
  // PANTALLES
  // ---------------------------------------------------
  function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    const obj = document.getElementById('pantalla-' + id);
    if (obj) { obj.classList.add('activa'); estat.pantallaActual = id; }
  }

  // ---------------------------------------------------
  // FONS — PUNTS DECORATIUS
  // ---------------------------------------------------
  function generarEstrellesFons(quantitat = 80) {
    const cont = document.getElementById('estrelles-fons');
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < quantitat; i++) {
      const e = document.createElement('div');
      e.className = 'estrella-fons';
      e.style.left = (Math.random() * 100) + '%';
      e.style.top  = (Math.random() * 100) + '%';
      e.style.setProperty('--dur', (Math.random() * 4 + 2.5) + 's');
      e.style.setProperty('--delay', (Math.random() * 6) + 's');
      e.style.setProperty('--max-opacitat', (Math.random() * 0.5 + 0.2).toFixed(2));
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

    function tocarPad(freq, duracio = 2.0) {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;
      const sortida = ctx.createGain();
      sortida.gain.setValueAtTime(0, ara);
      sortida.gain.linearRampToValueAtTime(0.50, ara + 0.20);
      sortida.gain.linearRampToValueAtTime(0.36, ara + duracio * 0.6);
      sortida.gain.exponentialRampToValueAtTime(0.0001, ara + duracio);
      const filtre = ctx.createBiquadFilter();
      filtre.type = 'lowpass'; filtre.frequency.value = 2400; filtre.Q.value = 0.6;
      const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = freq;
      const osc2 = ctx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.value = freq * 1.005;
      const osc3 = ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = freq * 2;
      const gO = ctx.createGain(); gO.gain.value = 0.16;
      osc1.connect(filtre); osc2.connect(filtre); osc3.connect(gO).connect(filtre);
      filtre.connect(sortida).connect(masterGain);
      osc1.start(ara); osc2.start(ara); osc3.start(ara);
      osc1.stop(ara + duracio + 0.2); osc2.stop(ara + duracio + 0.2); osc3.stop(ara + duracio + 0.2);
    }

    // Cling cristal·lí (1500Hz + 2000Hz, atac ràpid, decay curt)
    function tocarEncert() {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;
      [1500, 2000, 3000].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain();
        const t = ara + i * 0.04;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        o.connect(g).connect(masterGain);
        o.start(t); o.stop(t + 1.0);
      });
    }

    // Brunzit greu de corda trencada (sawtooth descendent 200→50Hz amb soroll)
    function tocarError() {
      init(); if (!ctx) return; reprendre();
      const ara = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(200, ara);
      o.frequency.exponentialRampToValueAtTime(50, ara + 0.5);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ara);
      g.gain.linearRampToValueAtTime(0.45, ara + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ara + 0.6);
      o.connect(f).connect(g).connect(masterGain);
      o.start(ara); o.stop(ara + 0.65);

      // Soroll afegit
      const buffSize = ctx.sampleRate * 0.3;
      const buf = ctx.createBuffer(1, buffSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < buffSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const noise = ctx.createBufferSource(); noise.buffer = buf;
      const nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 800;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.18, ara);
      ng.gain.exponentialRampToValueAtTime(0.0001, ara + 0.3);
      noise.connect(nf).connect(ng).connect(masterGain);
      noise.start(ara); noise.stop(ara + 0.35);
    }

    return { init, reprendre, tocarPad, tocarEncert, tocarError };
  })();

  // ---------------------------------------------------
  // SELECTOR DE NIVELLS
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
      const desc = document.createElement('span'); desc.className = 'nivell-desc'; desc.textContent = `${niv.notes.length} vèrtexs`;
      const icona = document.createElement('span'); icona.className = 'nivell-icona';
      icona.textContent = !desbloquejat ? '🔒' : (completat ? '✦' : '◈');
      const fase = document.createElement('span'); fase.className = 'nivell-fase-nom'; fase.textContent = niv.nom;

      boto.appendChild(num); boto.appendChild(desc); boto.appendChild(icona); boto.appendChild(fase);

      const estat_txt = !desbloquejat ? 'Bloquejat' : (completat ? 'Completat' : 'Disponible');
      boto.title = `Nivell ${niv.num} — ${niv.nom}\n${niv.notes.length} vèrtexs · ${niv.rondes} rondes\n${estat_txt}`;

      if (desbloquejat) boto.addEventListener('click', () => iniciarNivell(niv.num));
      graella.appendChild(boto);
    });
  }

  // ---------------------------------------------------
  // INICIAR / FINALITZAR NIVELL
  // ---------------------------------------------------
  function iniciarNivell(num) {
    const niv = NIVELLS.find(n => n.num === num);
    if (!niv) return;
    estat.nivellActual = niv;
    estat.rondaActual = 0;
    estat.notesEncertades = [];
    estat.notaObjectiu = null;
    estat.vides = VIDES_INICIALS;
    estat.bloquejatPerInteraccio = false;
    estat.ultimVertex = null;
    estat.arestes = [];
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
    cont.textContent = '⚡ '.repeat(Math.max(0, estat.vides)).trim() || '— sense càlculs —';
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
  const canvas = document.getElementById('canvas-geometria');
  const ctx2d = canvas.getContext('2d');

  function construirPunts(nivell) {
    const margeEsq = 175, margeDre = 740;
    const ample = margeDre - margeEsq;
    const pas = nivell.notes.length > 1 ? ample / (nivell.notes.length - 1) : 0;
    estat.punts = nivell.notes.map((id, i) => {
      const x = nivell.notes.length === 1 ? margeEsq + ample / 2 : margeEsq + i * pas;
      return { idNota: id, x, y: NOTES[id].y, encesa: false, flashError: 0 };
    });
  }

  function dibuixarPentagrama() {
    const w = VIEW_W;
    // 5 línies del pentagrama en cian brillant
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(108, 246, 255, 0.55)';
    ctx2d.lineWidth = 1.2;
    ctx2d.shadowColor = 'rgba(0, 240, 255, 0.5)';
    ctx2d.shadowBlur = 5;
    PENTA_LINIES.forEach(y => {
      ctx2d.beginPath(); ctx2d.moveTo(PENTA_X_INI, y); ctx2d.lineTo(PENTA_X_FI, y); ctx2d.stroke();
    });
    ctx2d.restore();

    // Línies suplementàries per cada nota fora del pentagrama
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(108, 246, 255, 0.55)';
    ctx2d.lineWidth = 1.2;
    ctx2d.shadowColor = 'rgba(0, 240, 255, 0.4)';
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

    // Clau de Sol
    ctx2d.save();
    ctx2d.fillStyle = 'rgba(108, 246, 255, 0.95)';
    ctx2d.shadowColor = 'rgba(0, 240, 255, 0.85)';
    ctx2d.shadowBlur = 14;
    ctx2d.font = '150px "Bravura", "Apple Symbols", "Segoe UI Symbol", "Noto Music", "DejaVu Sans", serif';
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'alphabetic';
    ctx2d.fillText('𝄞', 105, 235);
    ctx2d.restore();
  }

  function dibuixarCanvas() {
    const w = VIEW_W, h = VIEW_H;
    ctx2d.clearRect(0, 0, w, h);

    // Graella mil·limetrada de fons (subtil)
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx2d.lineWidth = 1;
    for (let x = 0; x <= w; x += 20) { ctx2d.beginPath(); ctx2d.moveTo(x, 0); ctx2d.lineTo(x, h); ctx2d.stroke(); }
    for (let y = 0; y <= h; y += 20) { ctx2d.beginPath(); ctx2d.moveTo(0, y); ctx2d.lineTo(w, y); ctx2d.stroke(); }
    ctx2d.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    for (let x = 0; x <= w; x += 100) { ctx2d.beginPath(); ctx2d.moveTo(x, 0); ctx2d.lineTo(x, h); ctx2d.stroke(); }
    for (let y = 0; y <= h; y += 100) { ctx2d.beginPath(); ctx2d.moveTo(0, y); ctx2d.lineTo(w, y); ctx2d.stroke(); }
    ctx2d.restore();

    // Pentagrama + clau
    dibuixarPentagrama();

    // Arestes
    estat.arestes.forEach(a => {
      ctx2d.save();
      ctx2d.strokeStyle = `rgba(0, 240, 255, ${a.alpha})`;
      ctx2d.lineWidth = 2;
      ctx2d.shadowColor = 'rgba(0, 240, 255, 0.8)';
      ctx2d.shadowBlur = 10;
      ctx2d.beginPath(); ctx2d.moveTo(a.x1, a.y1); ctx2d.lineTo(a.x2, a.y2); ctx2d.stroke();
      ctx2d.restore();
    });

    // Punts (vèrtexs) — clarament visibles sobre el pentagrama
    estat.punts.forEach(p => {
      ctx2d.save();
      if (p.flashError > 0) {
        ctx2d.fillStyle = `rgba(255, 77, 109, ${p.flashError})`;
        ctx2d.shadowColor = 'rgba(255, 77, 109, 0.9)';
        ctx2d.shadowBlur = 16;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, RADI_VERTEX + 4, 0, Math.PI * 2); ctx2d.fill();
        p.flashError = Math.max(0, p.flashError - 0.04);
      } else if (p.encesa) {
        const grad = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, 22);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#6cf6ff');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx2d.fillStyle = grad;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 22, 0, Math.PI * 2); ctx2d.fill();
        ctx2d.fillStyle = '#ffffff';
        ctx2d.shadowColor = 'rgba(0, 240, 255, 1)';
        ctx2d.shadowBlur = 18;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, RADI_VERTEX, 0, Math.PI * 2); ctx2d.fill();
      } else {
        // Vèrtex apagat: cercle ben marcat amb glow lleuger
        const halo = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
        halo.addColorStop(0, 'rgba(0, 240, 255, 0.30)');
        halo.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx2d.fillStyle = halo;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx2d.fill();

        ctx2d.fillStyle = 'rgba(20, 80, 130, 0.85)';
        ctx2d.strokeStyle = 'rgba(108, 246, 255, 0.95)';
        ctx2d.lineWidth = 2;
        ctx2d.shadowColor = 'rgba(0, 240, 255, 0.6)';
        ctx2d.shadowBlur = 6;
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, RADI_VERTEX, 0, Math.PI * 2); ctx2d.fill(); ctx2d.stroke();
      }
      ctx2d.restore();
    });

    // Nom efímer de la nota
    if (estat.nomEfimer && estat.nomEfimer.alpha > 0) {
      ctx2d.save();
      ctx2d.fillStyle = `rgba(108, 246, 255, ${estat.nomEfimer.alpha})`;
      ctx2d.font = 'italic 16px JetBrains Mono, monospace';
      ctx2d.textAlign = 'center';
      ctx2d.shadowColor = 'rgba(0, 240, 255, 0.8)';
      ctx2d.shadowBlur = 8;
      ctx2d.fillText(estat.nomEfimer.text, estat.nomEfimer.x, estat.nomEfimer.y - 18);
      estat.nomEfimer.alpha -= 0.012;
      ctx2d.restore();
    }

    // Cursor crosshair
    if (estat.cursor.dins) {
      ctx2d.save();
      ctx2d.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx2d.lineWidth = 1;
      ctx2d.shadowColor = 'rgba(0, 240, 255, 0.8)';
      ctx2d.shadowBlur = 6;
      const cx = estat.cursor.x, cy = estat.cursor.y;
      ctx2d.beginPath(); ctx2d.moveTo(cx - 10, cy); ctx2d.lineTo(cx + 10, cy); ctx2d.stroke();
      ctx2d.beginPath(); ctx2d.moveTo(cx, cy - 10); ctx2d.lineTo(cx, cy + 10); ctx2d.stroke();
      ctx2d.beginPath(); ctx2d.arc(cx, cy, 6, 0, Math.PI * 2); ctx2d.stroke();
      ctx2d.restore();
    }

    requestAnimationFrame(dibuixarCanvas);
  }

  // ---------------------------------------------------
  // INTERACCIÓ
  // ---------------------------------------------------
  function obtenirCoordCanvas(ev) {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) * (VIEW_W / r.width);
    const y = (ev.clientY - r.top)  * (VIEW_H / r.height);
    return { x, y };
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
    intentarVertex(trobat);
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

  function intentarVertex(punt) {
    if (!estat.notaObjectiu) {
      Audio.tocarPad(NOTES[punt.idNota].freq, 1.4);
      return;
    }
    if (punt.idNota === estat.notaObjectiu) gestionarEncert(punt);
    else gestionarError(punt);
  }

  function gestionarEncert(punt) {
    estat.bloquejatPerInteraccio = true;
    punt.encesa = true;
    Audio.tocarPad(NOTES[punt.idNota].freq, 1.2);
    setTimeout(() => Audio.tocarEncert(), 80);

    estat.nomEfimer = { text: NOTES[punt.idNota].nom, x: punt.x, y: punt.y, alpha: 1.4 };

    if (estat.ultimVertex) {
      estat.arestes.push({ x1: estat.ultimVertex.x, y1: estat.ultimVertex.y, x2: punt.x, y2: punt.y, alpha: 0 });
      const aresta = estat.arestes[estat.arestes.length - 1];
      const inici = performance.now();
      const animar = () => {
        const t = Math.min(1, (performance.now() - inici) / 600);
        aresta.alpha = t * 0.85;
        if (t < 1) requestAnimationFrame(animar);
      };
      requestAnimationFrame(animar);
    }
    estat.ultimVertex = { x: punt.x, y: punt.y };

    if (!estat.notesEncertades.includes(punt.idNota)) estat.notesEncertades.push(punt.idNota);
    marcarRondaCompleta(estat.rondaActual - 1);
    feedback('✦ Vèrtex resolt — ' + NOTES[punt.idNota].nom, 'encert');

    setTimeout(() => seguentRonda(), 1400);
  }

  function gestionarError(punt) {
    estat.bloquejatPerInteraccio = true;
    punt.flashError = 1;
    Audio.tocarError();
    canvas.classList.remove('shake'); void canvas.offsetWidth; canvas.classList.add('shake');

    // Penalització: esborra l'última aresta
    if (estat.arestes.length > 0) {
      estat.arestes.pop();
      // Re-establim l'últim vèrtex a l'anterior (si existeix)
      // Recerquem l'últim punt encès
      const ultimEncess = [...estat.punts].reverse().find(p => p.encesa);
      if (estat.arestes.length === 0 && ultimEncess) estat.ultimVertex = { x: ultimEncess.x, y: ultimEncess.y };
      else if (estat.arestes.length > 0) {
        const ult = estat.arestes[estat.arestes.length - 1];
        estat.ultimVertex = { x: ult.x2, y: ult.y2 };
      }
    }

    estat.vides -= 1;
    actualitzarVidesHud(true);
    feedback('⚠️ Càlcul erroni. Recalcula la coordenada.', 'error');

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

  // ---------------------------------------------------
  // FINAL DE NIVELL
  // ---------------------------------------------------
  function finalitzarVictoria() {
    const niv = estat.nivellActual;
    desarProgres(niv.num + 1);
    const titol = document.getElementById('modal-titol');
    const text  = document.getElementById('modal-text');
    const botoP = document.getElementById('boto-modal-principal');
    if (niv.num >= TOTAL_NIVELLS) {
      titol.textContent = '🎯 Mestre Cartesià';
      text.textContent  = 'Has dominat la geometria sònica completa. La teva precisió és absoluta.';
      botoP.textContent = 'Tornar al Mapa';
      botoP.onclick = () => { amagarModal(); mostrarSelectorNivells(); };
    } else {
      titol.textContent = '📐 Polígon Resolt';
      text.textContent  = `Has calculat totes les coordenades del Nivell ${niv.num}. La figura es revela.`;
      botoP.textContent = 'Següent Nivell ▶';
      botoP.onclick = () => { amagarModal(); iniciarNivell(niv.num + 1); };
    }
    mostrarModal();
  }

  function finalitzarDerrota() {
    const niv = estat.nivellActual;
    document.getElementById('modal-titol').textContent = '⚠️ Càlcul Erroni';
    document.getElementById('modal-text').textContent  = 'Els teus càlculs s\'han desviat. Revisa les fórmules i torna-ho a provar.';
    const botoP = document.getElementById('boto-modal-principal');
    botoP.textContent = 'Reintentar';
    botoP.onclick = () => { amagarModal(); iniciarNivell(niv.num); };
    mostrarModal();
  }

  function mostrarModal() { document.getElementById('modal-final').classList.remove('ocult'); }
  function amagarModal()  { document.getElementById('modal-final').classList.add('ocult'); }

  function mostrarSelectorNivells() { renderitzarSelectorNivells(); mostrarPantalla('nivells'); }

  // ---------------------------------------------------
  // ESDEVENIMENTS
  // ---------------------------------------------------
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
          if (confirm('Vols reiniciar el progrés? Tornaràs al Nivell 1.')) {
            reiniciarProgres(); renderitzarSelectorNivells();
          } break;
      }
    });

    document.getElementById('boto-escoltar').addEventListener('click', () => {
      Audio.init(); escoltarObjectiu();
    });

    document.addEventListener('keydown', (ev) => {
      if (estat.pantallaActual === 'joc' && (ev.code === 'Space' || ev.key === ' ')) {
        ev.preventDefault(); escoltarObjectiu();
      }
    });
  }

  // ---------------------------------------------------
  // ARRENCADA
  // ---------------------------------------------------
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

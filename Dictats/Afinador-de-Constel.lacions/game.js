/* =====================================================
   L'AFINADOR DE CONSTEL·LACIONS — Motor del joc
   ===================================================== */

(() => {
  'use strict';

  // ---------------------------------------------------
  // CATÀLEG DE NOTES (pentagrama en clau de Sol)
  // y = posició vertical dins del viewBox SVG (0..360)
  // ---------------------------------------------------
  const NOTES = {
    'Do4':  { freq: 261.63, y: 250, nom: 'Do', octava: 4, suplementaria: 'sota'  },
    'Re4':  { freq: 293.66, y: 235, nom: 'Re', octava: 4, suplementaria: null    },
    'Mi4':  { freq: 329.63, y: 220, nom: 'Mi', octava: 4 },
    'Fa4':  { freq: 349.23, y: 205, nom: 'Fa', octava: 4 },
    'Sol4': { freq: 392.00, y: 190, nom: 'Sol', octava: 4 },
    'La4':  { freq: 440.00, y: 175, nom: 'La', octava: 4 },
    'Si4':  { freq: 493.88, y: 160, nom: 'Si', octava: 4 },
    'Do5':  { freq: 523.25, y: 145, nom: 'Do', octava: 5 },
    'Re5':  { freq: 587.33, y: 130, nom: 'Re', octava: 5 },
    'Mi5':  { freq: 659.25, y: 115, nom: 'Mi', octava: 5 },
    'Fa5':  { freq: 698.46, y: 100, nom: 'Fa', octava: 5 },
    'Sol5': { freq: 783.99, y: 85,  nom: 'Sol', octava: 5, suplementaria: null   },
    'La5':  { freq: 880.00, y: 70,  nom: 'La', octava: 5, suplementaria: 'sobre' },
  };

  // ---------------------------------------------------
  // DEFINICIÓ DE NIVELLS
  // ---------------------------------------------------
  // Cada nivell construeix l'escala progressivament des de Do Re Mi cap amunt.
  const NIVELLS = [
    // Fase 1 — Explorador (1-5): primera octava (Do4 → Si4)
    { num: 1,  fase: 1, nom: 'Explorador', notes: ['Do4', 'Re4', 'Mi4'],                                      rondes: 4 },
    { num: 2,  fase: 1, nom: 'Explorador', notes: ['Do4', 'Re4', 'Mi4', 'Fa4'],                               rondes: 4 },
    { num: 3,  fase: 1, nom: 'Explorador', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4'],                       rondes: 5 },
    { num: 4,  fase: 1, nom: 'Explorador', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4'],                rondes: 5 },
    { num: 5,  fase: 1, nom: 'Explorador', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4'],         rondes: 6 },

    // Fase 2 — Navegant (6-10): pujada cap a la segona octava
    { num: 6,  fase: 2, nom: 'Navegant',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5'],                       rondes: 6 },
    { num: 7,  fase: 2, nom: 'Navegant',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5'],                rondes: 6 },
    { num: 8,  fase: 2, nom: 'Navegant',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5'],         rondes: 7 },
    { num: 9,  fase: 2, nom: 'Navegant',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],  rondes: 7 },
    { num: 10, fase: 2, nom: 'Navegant',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],  rondes: 8 },

    // Fase 3 — Astrònom (11-15): drills focus + dificultat creixent amb totes les 11 notes
    { num: 11, fase: 3, nom: 'Astrònom',   notes: ['Mi4', 'Sol4', 'Si4', 'Re5', 'Fa5'],                                                             rondes: 7  },  // Drill: només línies
    { num: 12, fase: 3, nom: 'Astrònom',   notes: ['Fa4', 'La4', 'Do5', 'Mi5'],                                                                     rondes: 7  },  // Drill: només espais
    { num: 13, fase: 3, nom: 'Astrònom',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                   rondes: 9  },  // Unificació
    { num: 14, fase: 3, nom: 'Astrònom',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                   rondes: 11 },  // Reforç
    { num: 15, fase: 3, nom: 'Astrònom',   notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5'],                   rondes: 12 },  // Mestria del pentagrama

    // Fase 4 — Mestre de l'Univers (16-20): línies suplementàries i mestria total
    { num: 16, fase: 4, nom: 'Mestre de l\'Univers', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5'],          rondes: 12 }, // + Sol5
    { num: 17, fase: 4, nom: 'Mestre de l\'Univers', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],   rondes: 12 }, // + La5 (totes 13)
    { num: 18, fase: 4, nom: 'Mestre de l\'Univers', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],   rondes: 13 }, // Totes 13
    { num: 19, fase: 4, nom: 'Mestre de l\'Univers', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],   rondes: 14 }, // Travessia
    { num: 20, fase: 4, nom: 'Mestre de l\'Univers', notes: ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa5', 'Sol5', 'La5'],   rondes: 16 }, // Repte final
  ];

  const TOTAL_NIVELLS = NIVELLS.length;
  const VIDES_INICIALS = 3;
  const CLAU_PROGRES = 'afinador-constellacions-progres';

  // ---------------------------------------------------
  // ESTAT GLOBAL
  // ---------------------------------------------------
  const estat = {
    pantallaActual: 'landing',
    nivellMaximDesbloquejat: 1,
    nivellActual: null,
    rondaActual: 0,
    notesEncertades: [],   // ids de les notes encertades en aquesta partida
    notaObjectiu: null,
    vides: VIDES_INICIALS,
    bloquejatPerInteraccio: false,
    ultimaPosicioConstel: null,
  };

  // ---------------------------------------------------
  // PROGRÉS LOCAL (localStorage)
  // ---------------------------------------------------
  function carregarProgres() {
    try {
      const valor = localStorage.getItem(CLAU_PROGRES);
      if (valor !== null) {
        const num = parseInt(valor, 10);
        if (!Number.isNaN(num) && num >= 1 && num <= TOTAL_NIVELLS) {
          estat.nivellMaximDesbloquejat = num;
          return;
        }
      }
    } catch (_) { /* localStorage inaccessible */ }
    estat.nivellMaximDesbloquejat = 1;
  }

  function desarProgres(nouMaxim) {
    if (nouMaxim > estat.nivellMaximDesbloquejat) {
      estat.nivellMaximDesbloquejat = Math.min(nouMaxim, TOTAL_NIVELLS);
      try {
        localStorage.setItem(CLAU_PROGRES, String(estat.nivellMaximDesbloquejat));
      } catch (_) { /* silenciós */ }
      if (nouMaxim > TOTAL_NIVELLS) try { localStorage.setItem('hub:done:afinador', '1'); } catch (_) {}
    }
  }

  function reiniciarProgres() {
    estat.nivellMaximDesbloquejat = 1;
    try { localStorage.removeItem(CLAU_PROGRES); } catch (_) {}
  }

  // ---------------------------------------------------
  // GESTIÓ DE PANTALLES
  // ---------------------------------------------------
  function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    const obj = document.getElementById('pantalla-' + id);
    if (obj) {
      obj.classList.add('activa');
      estat.pantallaActual = id;
    }
  }

  // ---------------------------------------------------
  // FONS — ESTRELLES PARPELLEJANTS
  // ---------------------------------------------------
  function generarEstrellesFons(quantitat = 140) {
    const cont = document.getElementById('estrelles-fons');
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < quantitat; i++) {
      const e = document.createElement('div');
      e.className = 'estrella-fons';
      const mida = Math.random() < 0.85 ? Math.random() * 1.6 + 0.5 : Math.random() * 2.5 + 1.5;
      e.style.width = mida + 'px';
      e.style.height = mida + 'px';
      e.style.left = (Math.random() * 100) + '%';
      e.style.top  = (Math.random() * 100) + '%';
      e.style.setProperty('--dur', (Math.random() * 4 + 2.5) + 's');
      e.style.setProperty('--delay', (Math.random() * 6) + 's');
      e.style.setProperty('--max-opacitat', (Math.random() * 0.6 + 0.3).toFixed(2));
      fragment.appendChild(e);
    }
    cont.appendChild(fragment);
  }

  // ---------------------------------------------------
  // MOTOR D'ÀUDIO
  // ---------------------------------------------------
  const Audio = (() => {
    let ctx = null;
    let masterGain = null;

    function init() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(ctx.destination);
    }

    function reprendre() {
      if (ctx && ctx.state === 'suspended') ctx.resume();
    }

    function tocarPad(freq, duracio = 2.4) {
      init();
      if (!ctx) return;
      reprendre();

      const ara = ctx.currentTime;
      const sortida = ctx.createGain();
      sortida.gain.setValueAtTime(0, ara);
      sortida.gain.linearRampToValueAtTime(0.55, ara + 0.35);
      sortida.gain.linearRampToValueAtTime(0.40, ara + duracio * 0.6);
      sortida.gain.exponentialRampToValueAtTime(0.0001, ara + duracio);

      const filtre = ctx.createBiquadFilter();
      filtre.type = 'lowpass';
      filtre.frequency.value = 2200;
      filtre.Q.value = 0.7;

      // Dos oscil·ladors lleugerament desafinats — coixí espacial
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = freq;

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 1.005;

      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.value = freq * 2;
      const gainOctava = ctx.createGain();
      gainOctava.gain.value = 0.18;

      osc1.connect(filtre);
      osc2.connect(filtre);
      osc3.connect(gainOctava).connect(filtre);
      filtre.connect(sortida).connect(masterGain);

      osc1.start(ara);
      osc2.start(ara);
      osc3.start(ara);
      osc1.stop(ara + duracio + 0.2);
      osc2.stop(ara + duracio + 0.2);
      osc3.stop(ara + duracio + 0.2);
    }

    function tocarEncert(freqBase) {
      init();
      if (!ctx) return;
      reprendre();
      const ara = ctx.currentTime;
      const intervals = [1, 1.5, 2]; // root, 5a, octava (campaneta)
      intervals.forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freqBase * mult * 1.5;
        const g = ctx.createGain();
        const inici = ara + idx * 0.06;
        g.gain.setValueAtTime(0, inici);
        g.gain.linearRampToValueAtTime(0.25, inici + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, inici + 1.4);
        osc.connect(g).connect(masterGain);
        osc.start(inici);
        osc.stop(inici + 1.5);
      });
    }

    function tocarError() {
      init();
      if (!ctx) return;
      reprendre();
      const ara = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ara);
      osc.frequency.exponentialRampToValueAtTime(60, ara + 0.4);

      const filtre = ctx.createBiquadFilter();
      filtre.type = 'lowpass';
      filtre.frequency.value = 400;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ara);
      g.gain.linearRampToValueAtTime(0.45, ara + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ara + 0.5);

      osc.connect(filtre).connect(g).connect(masterGain);
      osc.start(ara);
      osc.stop(ara + 0.55);
    }

    return { init, reprendre, tocarPad, tocarEncert, tocarError };
  })();

  // ---------------------------------------------------
  // SELECTOR DE NIVELLS — RENDERITZAT
  // ---------------------------------------------------
  function renderitzarSelectorNivells() {
    const graella = document.getElementById('graella-nivells');
    graella.innerHTML = '';
    NIVELLS.forEach(niv => {
      const desbloquejat = niv.num <= estat.nivellMaximDesbloquejat;
      const completat = niv.num < estat.nivellMaximDesbloquejat;
      const boto = document.createElement('button');
      boto.className = `boto-nivell fase-${niv.fase}`;
      if (desbloquejat) boto.classList.add('desbloquejat');
      else boto.classList.add('bloquejat');
      if (completat) boto.classList.add('completat');

      // Decoració interior: petites estrelles i halo
      const halo = document.createElement('span');
      halo.className = 'nivell-halo';
      boto.appendChild(halo);
      for (let i = 0; i < 4; i++) {
        const estrellet = document.createElement('span');
        estrellet.className = 'nivell-estrelleta';
        estrellet.style.left = (Math.random() * 80 + 10) + '%';
        estrellet.style.top  = (Math.random() * 80 + 10) + '%';
        estrellet.style.setProperty('--retard', (Math.random() * 2) + 's');
        boto.appendChild(estrellet);
      }

      const num = document.createElement('span');
      num.className = 'nivell-num';
      num.textContent = niv.num;

      const desc = document.createElement('span');
      desc.className = 'nivell-desc';
      desc.textContent = `${niv.notes.length} estrelles`;

      const icona = document.createElement('span');
      icona.className = 'nivell-icona';
      if (!desbloquejat) icona.textContent = '🔒';
      else if (completat) icona.textContent = '⭐';
      else icona.textContent = '✦';

      const fase = document.createElement('span');
      fase.className = 'nivell-fase-nom';
      fase.textContent = niv.nom;

      boto.appendChild(num);
      boto.appendChild(desc);
      boto.appendChild(icona);
      boto.appendChild(fase);

      // Tooltip natiu de respatller
      const estat_txt = !desbloquejat ? 'Bloquejat' : (completat ? 'Completat' : 'Disponible');
      boto.title = `Nivell ${niv.num} — ${niv.nom}\n${niv.notes.length} estrelles · ${niv.rondes} rondes\n${estat_txt}`;

      if (desbloquejat) {
        boto.addEventListener('click', () => iniciarNivell(niv.num));
      }
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
    estat.ultimaPosicioConstel = null;

    actualitzarHud();
    renderitzarPentagrama(niv);
    construirIndicadorRondes(niv.rondes);
    netejarFeedback();
    amagarModal();

    mostrarPantalla('joc');
    Audio.init();
    Audio.reprendre();

    // Petit retard per deixar acabar la transició abans de triar nota
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
    cont.textContent = '☄️ '.repeat(Math.max(0, estat.vides)).trim() ||
                       '— sense energia —';
    if (perd) {
      cont.classList.remove('perd');
      void cont.offsetWidth; // reinicia animació
      cont.classList.add('perd');
    }
  }

  function construirIndicadorRondes(total) {
    const cont = document.getElementById('progres-rondes');
    cont.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const b = document.createElement('div');
      b.className = 'bombolla-ronda';
      cont.appendChild(b);
    }
  }

  function marcarRondaCompleta(idx) {
    const cont = document.getElementById('progres-rondes');
    const b = cont.children[idx];
    if (b) b.classList.add('completa');
  }

  // ---------------------------------------------------
  // RENDERITZAT DEL PENTAGRAMA
  // ---------------------------------------------------
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function renderitzarPentagrama(nivell) {
    const grupPenta = document.getElementById('grup-pentagrama');
    const grupEstrelles = document.getElementById('grup-estrelles');
    const grupConst = document.getElementById('grup-constellacio');
    const grupNoms = document.getElementById('grup-noms-notes');

    grupPenta.innerHTML = '';
    grupEstrelles.innerHTML = '';
    grupConst.innerHTML = '';
    grupNoms.innerHTML = '';

    // Cinc línies del pentagrama (Y: 100, 130, 160, 190, 220)
    const xInici = 80, xFi = 760;
    [100, 130, 160, 190, 220].forEach(y => {
      const linia = document.createElementNS(SVG_NS, 'line');
      linia.setAttribute('x1', xInici);
      linia.setAttribute('x2', xFi);
      linia.setAttribute('y1', y);
      linia.setAttribute('y2', y);
      linia.setAttribute('class', 'linia-pentagrama');
      grupPenta.appendChild(linia);
    });

    // Clau de Sol còsmica a l'esquerra del pentagrama
    dibuixarClauSol(grupPenta);

    // Distribuir estrelles horitzontalment, en l'ordre que apareixen al nivell
    const notes = nivell.notes;
    const margeEsq = 145, margeDre = 730;
    const ample = margeDre - margeEsq;
    const pas = notes.length > 1 ? ample / (notes.length - 1) : 0;

    notes.forEach((idNota, idx) => {
      const dades = NOTES[idNota];
      if (!dades) return;
      const x = notes.length === 1 ? (margeEsq + ample / 2) : (margeEsq + idx * pas);

      // Línies suplementàries si cal (Do4 sota, La5 sobre)
      if (dades.suplementaria === 'sota') {
        afegirLiniaSuplementaria(grupPenta, x, 250);
      } else if (dades.suplementaria === 'sobre') {
        afegirLiniaSuplementaria(grupPenta, x, 70);
      }

      const grup = document.createElementNS(SVG_NS, 'g');
      grup.setAttribute('class', 'estrella-grup');
      grup.setAttribute('transform', `translate(${x} ${dades.y})`);
      grup.dataset.id = idNota;

      // Aurèola brillant (capa de fons que apareix només quan s'encén)
      const aurea = document.createElementNS(SVG_NS, 'circle');
      aurea.setAttribute('class', 'estrella-aurea');
      aurea.setAttribute('r', 22);
      grup.appendChild(aurea);

      // Cos de l'estrella
      const cos = document.createElementNS(SVG_NS, 'circle');
      cos.setAttribute('class', 'estrella-cos');
      cos.setAttribute('r', 7);
      grup.appendChild(cos);

      grup.addEventListener('click', () => intentarEstrella(idNota, grup, x, dades.y));
      grupEstrelles.appendChild(grup);
    });
  }

  function afegirLiniaSuplementaria(grup, x, y) {
    const linia = document.createElementNS(SVG_NS, 'line');
    linia.setAttribute('x1', x - 15);
    linia.setAttribute('x2', x + 15);
    linia.setAttribute('y1', y);
    linia.setAttribute('y2', y);
    linia.setAttribute('class', 'linia-suplementaria');
    grup.appendChild(linia);
  }

  // Clau de Sol — caràcter Unicode 𝄞 (U+1D11E) renderitzat com a glif SVG.
  // S'ancora al centre del bucle a la línia de Sol4 (y = 190).
  function dibuixarClauSol(grup) {
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('class', 'clau-sol');
    t.setAttribute('x', '50');
    t.setAttribute('y', '232');
    t.setAttribute('text-anchor', 'middle');
    t.textContent = '𝄞'; // 𝄞 (parell substitutiu UTF-16)
    grup.appendChild(t);
  }

  // ---------------------------------------------------
  // LÒGICA DE RONDES
  // ---------------------------------------------------
  function seguentRonda() {
    const niv = estat.nivellActual;
    if (!niv) return;

    estat.rondaActual += 1;
    if (estat.rondaActual > niv.rondes) {
      finalitzarVictoria();
      return;
    }

    // Triar nota objectiu — preferir notes encara no encertades en aquesta partida
    const candidates = niv.notes.filter(n => !estat.notesEncertades.includes(n));
    const pool = candidates.length > 0 ? candidates : niv.notes;
    estat.notaObjectiu = pool[Math.floor(Math.random() * pool.length)];

    estat.bloquejatPerInteraccio = false;
    netejarFeedback();

    // Tocar automàticament al començar la primera ronda? Millor que l'usuari premi.
    // Però sí donem una pista visual lleugera al botó.
    parpellejarBotoCant();
  }

  function parpellejarBotoCant() {
    const b = document.getElementById('boto-escoltar');
    b.classList.remove('sonant');
    void b.offsetWidth;
    b.classList.add('sonant');
    setTimeout(() => b.classList.remove('sonant'), 1300);
  }

  function escoltarObjectiu() {
    if (!estat.notaObjectiu) return;
    Audio.tocarPad(NOTES[estat.notaObjectiu].freq);
    parpellejarBotoCant();
  }

  function intentarEstrella(idClicat, grupEl, x, y) {
    if (estat.bloquejatPerInteraccio) return;
    if (!estat.notaObjectiu) {
      // Cap nota activa encara
      Audio.tocarPad(NOTES[idClicat].freq, 1.6);
      return;
    }

    if (idClicat === estat.notaObjectiu) {
      gestionarEncert(idClicat, grupEl, x, y);
    } else {
      gestionarError(grupEl);
    }
  }

  function gestionarEncert(idNota, grupEl, x, y) {
    estat.bloquejatPerInteraccio = true;
    grupEl.classList.add('encesa');

    const dades = NOTES[idNota];
    Audio.tocarPad(dades.freq, 1.4);
    setTimeout(() => Audio.tocarEncert(dades.freq), 80);

    // Mostrar nom de la nota efímerament
    mostrarNomNotaSVG(dades.nom, x, y);

    // Traçar línia de constel·lació
    if (estat.ultimaPosicioConstel) {
      traçarLiniaConstel(estat.ultimaPosicioConstel.x, estat.ultimaPosicioConstel.y, x, y);
    }
    estat.ultimaPosicioConstel = { x, y };

    if (!estat.notesEncertades.includes(idNota)) estat.notesEncertades.push(idNota);

    marcarRondaCompleta(estat.rondaActual - 1);
    feedback('✨ Constel·lació afinada — ' + dades.nom, 'encert');

    setTimeout(() => seguentRonda(), 1400);
  }

  function gestionarError(grupEl) {
    estat.bloquejatPerInteraccio = true;
    grupEl.classList.add('error');
    Audio.tocarError();

    estat.vides -= 1;
    actualitzarVidesHud(true);
    feedback('❌ El cant no era aquest. Escolta de nou.', 'error');

    setTimeout(() => grupEl.classList.remove('error'), 700);

    if (estat.vides <= 0) {
      setTimeout(() => finalitzarDerrota(), 900);
    } else {
      setTimeout(() => {
        estat.bloquejatPerInteraccio = false;
        netejarFeedback();
      }, 1100);
    }
  }

  function mostrarNomNotaSVG(nom, x, y) {
    const grup = document.getElementById('grup-noms-notes');
    const txt = document.createElementNS(SVG_NS, 'text');
    txt.setAttribute('class', 'nom-nota');
    txt.setAttribute('x', x);
    txt.setAttribute('y', y - 18);
    txt.textContent = nom;
    grup.appendChild(txt);
    setTimeout(() => txt.remove(), 1900);
  }

  function traçarLiniaConstel(x1, y1, x2, y2) {
    const grup = document.getElementById('grup-constellacio');
    const linia = document.createElementNS(SVG_NS, 'line');
    linia.setAttribute('x1', x1);
    linia.setAttribute('y1', y1);
    linia.setAttribute('x2', x2);
    linia.setAttribute('y2', y2);
    linia.setAttribute('class', 'linia-constellacio');
    grup.appendChild(linia);
  }

  function feedback(text, classe) {
    const el = document.getElementById('missatge-feedback');
    el.textContent = text;
    el.className = 'missatge-feedback actiu ' + (classe || '');
  }

  function netejarFeedback() {
    const el = document.getElementById('missatge-feedback');
    el.textContent = '';
    el.className = 'missatge-feedback';
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
      titol.textContent = '🌠 Mestre de l\'Univers';
      text.textContent  = 'Has afinat totes les constel·lacions. El teu cant ressona per tota la galàxia.';
      botoP.textContent = 'Tornar al Mapa';
      botoP.onclick = () => { amagarModal(); mostrarSelectorNivells(); };
    } else {
      titol.textContent = '✨ Constel·lació Completada';
      text.textContent  = `Has superat el Nivell ${niv.num}. Una nova porció de cel s'il·lumina davant teu.`;
      botoP.textContent = 'Següent Nivell ▶';
      botoP.onclick = () => { amagarModal(); iniciarNivell(niv.num + 1); };
    }
    mostrarModal();
  }

  function finalitzarDerrota() {
    const niv = estat.nivellActual;
    const titol = document.getElementById('modal-titol');
    const text  = document.getElementById('modal-text');
    const botoP = document.getElementById('boto-modal-principal');

    titol.textContent = '☄️ Energia Esgotada';
    text.textContent  = 'Les teves cometes s\'han apagat. Però l\'univers t\'espera per tornar-hi.';
    botoP.textContent = 'Reintentar';
    botoP.onclick = () => { amagarModal(); iniciarNivell(niv.num); };
    mostrarModal();
  }

  function mostrarModal() {
    document.getElementById('modal-final').classList.remove('ocult');
  }

  function amagarModal() {
    document.getElementById('modal-final').classList.add('ocult');
  }

  // ---------------------------------------------------
  // NAVEGACIÓ DE PANTALLES
  // ---------------------------------------------------
  function mostrarSelectorNivells() {
    renderitzarSelectorNivells();
    mostrarPantalla('nivells');
  }

  // ---------------------------------------------------
  // CONNEXIÓ D'ESDEVENIMENTS
  // ---------------------------------------------------
  function connectarEsdeveniments() {
    document.body.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-accio]');
      if (!t) return;
      const accio = t.dataset.accio;
      switch (accio) {
        case 'iniciar':
          Audio.init();
          mostrarSelectorNivells();
          break;
        case 'tutorial':
          mostrarPantalla('tutorial');
          break;
        case 'tutorial-fet':
          mostrarSelectorNivells();
          break;
        case 'tornar-landing':
          mostrarPantalla('landing');
          break;
        case 'tornar-base':
          amagarModal();
          mostrarSelectorNivells();
          break;
        case 'modal-mapa':
          amagarModal();
          mostrarSelectorNivells();
          break;
        case 'reset-progres':
          if (confirm('Vols reiniciar el progrés? Tornaràs al Nivell 1.')) {
            reiniciarProgres();
            renderitzarSelectorNivells();
          }
          break;
      }
    });

    document.getElementById('boto-escoltar').addEventListener('click', () => {
      Audio.init();
      escoltarObjectiu();
    });

    // Tecla espai per tornar a escoltar dins del joc
    document.addEventListener('keydown', (ev) => {
      if (estat.pantallaActual === 'joc' && (ev.code === 'Space' || ev.key === ' ')) {
        ev.preventDefault();
        escoltarObjectiu();
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrencar);
  } else {
    arrencar();
  }
})();

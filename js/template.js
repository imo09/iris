/* iris - template (punto 187): brainstorming, retrospettiva, flowchart, matrice 2x2, mappa mentale.
   Ogni template è un elenco di oggetti e connettori con coordinate relative; all'inserimento gli id diventano nuovi. */
(function (N) {
  'use strict';
  const I = N.I = N.I || {};
  const C = I.COLORI = { giallo: '#F6E3A6', ottone: '#F1D2A9', verde: '#BFE3DA', azzurro: '#C9DCEB', rosa: '#EDCBD0', lavanda: '#D9D0EA', grigio: '#E2E6E5', bianco: '#FFFFFF' };
  const P = (id, x, y, testo, colore, w, h) => ({ id, tipo: 'postit', x, y, w: w || 160, h: h || 140, testo: testo || '', colore: colore || C.giallo });
  const F = (id, x, y, w, h, testo, colore) => ({ id, tipo: 'cornice', x, y, w, h, testo, colore: colore || C.grigio });
  const S = (id, x, y, w, h, forma, testo, colore) => ({ id, tipo: 'forma', x, y, w, h, forma, testo, colore: colore || C.bianco });
  const T = (id, x, y, testo, dim, w) => ({ id, tipo: 'testo', x, y, w: w || 360, h: dim > 24 ? 56 : 40, testo, dim: dim || 18 });
  const E = (id, da, a, daH, aH, testo) => ({ id, da, a, daH: daH || 'r', aH: aH || 'l', testo: testo || '' });

  I.TEMPLATE = [
    { id: 'vuota', nome: 'Lavagna vuota', desc: 'Si parte da zero', fai: () => ({ oggetti: [], connettori: [] }) },
    {
      id: 'brainstorming', nome: 'Brainstorming', desc: 'Una domanda al centro e idee intorno',
      fai: () => ({ oggetti: [F('f', 0, 0, 980, 640, 'Brainstorming', C.grigio), T('t', 290, 40, 'Qual è la domanda di oggi?', 28, 420),
        P('p1', 60, 140, '', C.giallo), P('p2', 260, 140, '', C.verde), P('p3', 460, 140, '', C.azzurro), P('p4', 660, 140, '', C.rosa),
        P('p5', 60, 340, '', C.lavanda), P('p6', 260, 340, '', C.ottone), P('p7', 460, 340, '', C.giallo), P('p8', 660, 340, '', C.verde)], connettori: [] })
    },
    {
      id: 'retrospettiva', nome: 'Retrospettiva', desc: 'Bene, da migliorare, azioni',
      fai: () => ({ oggetti: [F('f1', 0, 0, 380, 560, 'Cosa è andato bene', '#E3F1ED'), F('f2', 410, 0, 380, 560, 'Cosa migliorare', '#F6E7E8'), F('f3', 820, 0, 380, 560, 'Azioni', '#E5EDF5'),
        P('a1', 30, 70, '', C.verde), P('a2', 200, 70, '', C.verde), P('b1', 440, 70, '', C.rosa), P('b2', 610, 70, '', C.rosa), P('c1', 850, 70, '', C.azzurro), P('c2', 1020, 70, '', C.azzurro)], connettori: [] })
    },
    {
      id: 'flowchart', nome: 'Flowchart', desc: 'Inizio, passi, una decisione',
      fai: () => ({ oggetti: [S('s1', 0, 40, 150, 70, 'ellisse', 'Inizio', C.verde), S('s2', 220, 40, 170, 70, 'rett', 'Primo passo'), S('s3', 460, 15, 170, 120, 'rombo', 'Va bene?', C.giallo),
        S('s4', 700, 40, 170, 70, 'rett', 'Passo successivo'), S('s5', 460, 220, 170, 70, 'rett', 'Correggi'), S('s6', 940, 40, 150, 70, 'ellisse', 'Fine', C.rosa)],
      connettori: [E('e1', 's1', 's2'), E('e2', 's2', 's3'), E('e3', 's3', 's4', 'r', 'l', 'Sì'), E('e4', 's3', 's5', 'b', 't', 'No'), E('e5', 's5', 's2', 'l', 'b'), E('e6', 's4', 's6')] })
    },
    {
      id: 'matrice', nome: 'Matrice 2x2', desc: 'Urgente e importante',
      fai: () => ({ oggetti: [T('ty', 0, -50, 'Importante', 16, 200), T('tx', 660, 690, 'Urgente', 16, 200),
        F('q1', 0, 0, 420, 320, 'Importante, non urgente: pianifica', '#E5EDF5'), F('q2', 440, 0, 420, 320, 'Urgente e importante: fai subito', '#F6E7E8'),
        F('q3', 0, 340, 420, 320, 'Né urgente né importante: elimina', '#ECEFEE'), F('q4', 440, 340, 420, 320, 'Urgente, non importante: delega', '#F7EEDC')], connettori: [] })
    },
    {
      id: 'mappa', nome: 'Mappa mentale', desc: 'Un tema e i suoi rami',
      fai: () => ({ oggetti: [S('c', 330, 220, 200, 100, 'ellisse', 'Tema centrale', C.ottone), S('r1', 0, 40, 170, 60, 'rett', 'Ramo 1', C.verde), S('r2', 0, 380, 170, 60, 'rett', 'Ramo 2', C.azzurro),
        S('r3', 690, 40, 170, 60, 'rett', 'Ramo 3', C.rosa), S('r4', 690, 380, 170, 60, 'rett', 'Ramo 4', C.lavanda), S('r5', 345, 470, 170, 60, 'rett', 'Ramo 5', C.giallo)],
      connettori: [E('e1', 'c', 'r1', 'l', 'r'), E('e2', 'c', 'r2', 'l', 'r'), E('e3', 'c', 'r3', 'r', 'l'), E('e4', 'c', 'r4', 'r', 'l'), E('e5', 'c', 'r5', 'b', 't')] })
    }
  ];

  /* copia un template con id nuovi, spostato di (dx, dy); i connettori seguono gli oggetti */
  I.istanzia = (tpl, dx, dy, uid) => {
    const t = tpl.fai(), mappa = {};
    const oggetti = t.oggetti.map((o, i) => { const id = uid(); mappa[o.id] = id; return Object.assign({}, o, { id, x: o.x + (dx || 0), y: o.y + (dy || 0), z: o.tipo === 'cornice' ? 0 : i + 1, voti: [] }); });
    const connettori = t.connettori.map((e) => Object.assign({}, e, { id: uid(), da: mappa[e.da], a: mappa[e.a] }));
    return { oggetti, connettori };
  };
})(window.N = window.N || {});

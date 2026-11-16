/* iris - avvio dell'app: configurazione del guscio, lavagna nuova da template, backup, dati di prova */
(function (N) {
  'use strict';
  const U = N.U, UI = N.UI, D = N.D, I = N.I, esc = U.esc, ico = UI.ico;
  const Y = window.IrisLib.Y;

  const LOGO = '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0E1D2A"/><rect x="6.5" y="7" width="11" height="11" rx="2" fill="#E8A867"/><rect x="14.5" y="14" width="11" height="11" rx="2" fill="#9FCFC6"/><path d="M12 18v3.5a1.5 1.5 0 0 0 1.5 1.5H14" stroke="#E9EDEC" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
  const ICO_DOC = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="4" width="9" height="9" rx="1.5"/><rect x="11" y="11" width="10" height="9" rx="1.5"/></svg>';

  /* scrive oggetti e connettori in una lavagna (usato per template e dati di prova) */
  async function scrivi(id, contenuto) {
    const x = await D.iris.apri(id);
    x.doc.transact(() => { const o = x.doc.getMap('oggetti'), c = x.doc.getMap('connettori'); contenuto.oggetti.forEach((v) => o.set(v.id, v)); contenuto.connettori.forEach((v) => c.set(v.id, v)); }, 'azione');
    await new Promise((ok) => setTimeout(ok, 400)); x.chiudi();
  }

  function sceltaNuovo() {
    return new Promise((ok) => {
      const w = UI.modale('<h2>Nuova lavagna ' + N.Aiuto.i('lavagne') + '</h2><label class="campo"><span>Titolo</span><input name="t" placeholder="Senza titolo" autofocus></label><p class="ey">Parti da</p><div class="tpls">' +
        I.TEMPLATE.map((t, i) => '<button class="tpl' + (i === 0 ? ' on' : '') + '" data-t="' + t.id + '"><span class="tprev tp-' + t.id + '"></span><b>' + esc(t.nome) + '</b><small class="muted">' + esc(t.desc) + '</small></button>').join('') +
        '</div><div class="azioni"><button class="btn" data-x>Annulla</button><button class="btn pri" data-crea>Crea lavagna</button></div>', { classe: 'media', chiusa: () => ok(null) });
      let scelto = 'vuota';
      w.el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-t]'); if (b) { scelto = b.dataset.t; U.$$('.tpl', w.el).forEach((x) => x.classList.toggle('on', x === b)); }
        if (e.target.closest('[data-crea]')) { const t = w.el.querySelector('[name=t]').value.trim() || (I.TEMPLATE.find((x) => x.id === scelto) || {}).nome; ok({ titolo: scelto === 'vuota' && !w.el.querySelector('[name=t]').value.trim() ? 'Senza titolo' : t, template: scelto }); w.el.parentNode.remove(); }
      });
      w.el.querySelector('[name=t]').onkeydown = (e) => { if (e.key === 'Enter') w.el.querySelector('[data-crea]').click(); };
    });
  }

  async function semina({ D, entraCome, membro }) {
    const P = (id, x, y, testo, colore, voti) => ({ id, tipo: 'postit', x, y, w: 160, h: 130, testo, colore, voti: voti || [], z: 2 });
    entraCome('p-simo');
    const a = await D.documenti.crea('iris', 'Nomi per la nuova app', 'i-nomi');
    await scrivi(a.id, { oggetti: [
      { id: 'f1', tipo: 'cornice', x: 0, y: 0, w: 900, h: 560, testo: 'Brainstorming nomi', colore: '#ECEFEE', z: 0, voti: [] },
      { id: 't1', tipo: 'testo', x: 160, y: 50, w: 580, h: 56, testo: 'Che nome diamo alla nuova app?', dim: 28, z: 1, voti: [] },
      P('n1', 50, 150, 'zeno\nbreve, si ricorda', I.COLORI.giallo, ['p-simo', 'p-giulia']), P('n2', 260, 150, 'rotta', I.COLORI.verde, ['p-giulia']), P('n3', 470, 150, 'bussola', I.COLORI.azzurro), P('n4', 680, 150, 'scia', I.COLORI.rosa, ['p-simo']),
      P('n5', 50, 350, 'Deve funzionare anche in inglese', I.COLORI.lavanda), P('n6', 260, 350, 'Minuscolo, come le altre app', I.COLORI.ottone, ['p-simo', 'p-giulia', 'p-marco']),
      { id: 's1', tipo: 'forma', x: 1000, y: 120, w: 170, h: 80, forma: 'ellisse', testo: 'Scelta finale', colore: I.COLORI.verde, z: 3, voti: [] },
      { id: 's2', tipo: 'forma', x: 1000, y: 330, w: 170, h: 80, forma: 'rett', testo: 'Verifica marchi', colore: '#FFFFFF', z: 3, voti: [] }
    ], connettori: [{ id: 'c1', da: 'n4', a: 's1', daH: 'r', aH: 'l', testo: 'la preferita' }, { id: 'c2', da: 's1', a: 's2', daH: 'b', aH: 't', testo: 'poi' }] });
    await membro(a.id, 'p-giulia', 'editor'); await membro(a.id, 'p-marco', 'lettore');
    await D.iris.commenta(a.id, 'n1', 'Mi piace perché è corto e si scrive facile.');
    entraCome('p-giulia');
    await D.iris.commenta(a.id, 'n6', 'D\'accordo, lo terrei come regola per tutte.');
    const b = await D.documenti.crea('iris', 'Retrospettiva di ottobre', 'i-retro');
    const r = I.istanzia(I.TEMPLATE.find((t) => t.id === 'retrospettiva'), 0, 0, U.uid);
    const testi = ['Consegne puntuali', 'Riunioni brevi', 'Troppe email', 'Documenti sparsi', 'Una board unica', 'Revisione ogni venerdì'];
    r.oggetti.filter((o) => o.tipo === 'postit').forEach((o, i) => { o.testo = testi[i] || ''; });
    await scrivi(b.id, r);
    await membro(b.id, 'p-simo', 'editor');
  }

  N.Shell.avvia({
    app: 'iris', nome: 'iris', versione: '0.4', aiutoHome: 'lavagne', guida: I.GUIDA, motto: 'Una lavagna semplice per pensare insieme, anche a distanza.', logo: LOGO, icoDoc: ICO_DOC,
    titoloHome: 'Lavagne', nuovo: 'Nuova lavagna', vuoto: 'Nessuna lavagna. Creane una con "Nuova lavagna".',
    semina, sceltaNuovo,
    creaContenuto: async (d, scelta) => { const t = I.TEMPLATE.find((x) => x.id === scelta.template); if (t && t.id !== 'vuota') await scrivi(d.id, I.istanzia(t, 0, 0, U.uid)); },
    apri: (doc, el) => I.apriLavagna(doc, el),
    esportaContenuto: async (d) => {
      const stato = await D.iris.stato(d.id), tmp = new Y.Doc(); Y.applyUpdate(tmp, stato); const file = {};
      for (const o of tmp.getMap('oggetti').values()) { if (o.file) { const u = await D.file.url(o.file).catch(() => null); if (u) file[o.file] = u; } }
      tmp.destroy(); return { stato: I.b64(stato), file, commenti: await D.iris.commenti(d.id) };
    },
    importaContenuto: async (d, c) => {
      const tmp = new Y.Doc(); Y.applyUpdate(tmp, I.deb64(c.stato));
      const ogg = Array.from(tmp.getMap('oggetti').values()), con = Array.from(tmp.getMap('connettori').values()); tmp.destroy();
      for (const o of ogg) { if (o.file && c.file && c.file[o.file]) { const f = await D.file.carica(d.id, c.file[o.file], 'immagine', 'image/jpeg'); o.file = f.id; } }
      await scrivi(d.id, { oggetti: ogg, connettori: con });
      for (const k of (c.commenti || [])) await D.iris.commenta(d.id, k.oggetto, k.testo);
    }
  });
})(window.N = window.N || {});

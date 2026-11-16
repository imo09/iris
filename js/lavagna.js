/* iris - la lavagna (punti 182-189): canvas React Flow, oggetti, connettori, cornici, tempo reale con cursori,
   commenti, votazione, template, export PNG e PDF, versioni. Il codice è JavaScript senza build: htm al posto di JSX. */
(function (N) {
  'use strict';
  const L = window.IrisLib, React = L.React, XY = L.XY, Y = L.Y;
  const { useState, useEffect, useRef, useCallback, useMemo, useContext, memo, createContext } = React;
  const { ReactFlow, ReactFlowProvider, Background, MiniMap, Controls, Handle, Position, NodeResizer, NodeToolbar, ViewportPortal, useReactFlow, useViewport, applyNodeChanges, applyEdgeChanges, MarkerType, ConnectionMode, getNodesBounds } = XY;
  const html = L.htm.bind(React.createElement);
  const U = N.U, UI = N.UI, D = N.D, I = N.I;
  const Ctx = createContext(null);
  const POS = { t: Position.Top, r: Position.Right, b: Position.Bottom, l: Position.Left };
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s); };
  const deb64 = (s) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  I.b64 = b64; I.deb64 = deb64;
  const Info = ({ id }) => (N.Aiuto && N.Aiuto.attive() && N.Aiuto.trova(id) ? html`<button className="ibtn" data-aiuto=${id} data-pop="" aria-label="Spiegazione" title="Spiegazione">i</button>` : null);
  const Ico = ({ n }) => html`<span className="ic" dangerouslySetInnerHTML=${{ __html: UI.ico(n) }} />`;
  const cacheFile = {};
  function useFile(id) {
    const [u, setU] = useState(cacheFile[id]);
    useEffect(() => { if (!id || cacheFile[id]) return; D.file.url(id).then((x) => { cacheFile[id] = x; setU(x); }).catch(() => {}); }, [id]);
    return u || cacheFile[id];
  }

  /* ---------- oggetti ---------- */
  const Maniglie = () => html`${['t', 'r', 'b', 'l'].map((p) => html`<${Handle} key=${p} id=${p} type="source" position=${POS[p]} className="mh" />`)}`;
  function TestoMod({ id, testo, classe, segnaposto, stile }) {
    const c = useContext(Ctx); const [ed, setEd] = useState(false); const r = useRef(null);
    useEffect(() => { if (ed && r.current) { r.current.focus(); r.current.select(); } }, [ed]);
    if (ed) return html`<textarea ref=${r} className=${'tmod nodrag nowheel ' + (classe || '')} style=${stile} defaultValue=${testo || ''}
      onBlur=${(e) => { setEd(false); if (e.target.value !== (testo || '')) c.aggiorna(id, { testo: e.target.value }); }}
      onKeyDown=${(e) => { if (e.key === 'Escape') { e.target.value = testo || ''; e.target.blur(); } e.stopPropagation(); }} />`;
    return html`<div className=${'ttx ' + (classe || '') + (testo ? '' : ' vuoto')} style=${stile} onDoubleClick=${(e) => { if (c.ed && !c.voto) { e.stopPropagation(); setEd(true); } }}>${testo || (c.ed ? segnaposto || '' : '')}</div>`;
  }
  function Segni({ id, voti }) {
    const c = useContext(Ctx); const n = c.nCommenti[id] || 0, v = (voti || []).length, mio = (voti || []).includes(c.io);
    if (!n && !v) return null;
    return html`<div className="segni">${v ? html`<span className=${'voti' + (mio ? ' mio' : '')} title=${v + ' voti'}>${Array.from({ length: Math.min(v, 6) }).map((_, i) => html`<i key=${i} />`)}${v > 6 ? html`<b>+${v - 6}</b>` : null}</span>` : null}${n ? html`<span className="ncom" onClick=${(e) => { e.stopPropagation(); c.apriCommenti(id); }}><${Ico} n="chat" />${n}</span>` : null}</div>`;
  }
  const Ridim = ({ sel, min }) => { const c = useContext(Ctx); return c.ed ? html`<${NodeResizer} isVisible=${sel && !c.voto} minWidth=${(min || [60, 40])[0]} minHeight=${(min || [60, 40])[1]} lineClassName="rl" handleClassName="rh" />` : null; };
  const PostIt = memo(({ id, data, selected }) => {
    const c = useContext(Ctx);
    return html`<div className=${'ogg postit' + (c.voto ? ' votabile' : '')} style=${{ background: data.colore }} onClick=${c.voto ? (e) => { e.stopPropagation(); c.vota(id); } : undefined}>
      <${Ridim} sel=${selected} min=${[90, 70]} /><${Maniglie} /><${TestoMod} id=${id} testo=${data.testo} segnaposto="Doppio clic per scrivere" /><${Segni} id=${id} voti=${data.voti} /></div>`;
  });
  const Testo = memo(({ id, data, selected }) => html`<div className="ogg testo"><${Ridim} sel=${selected} min=${[60, 30]} /><${Maniglie} /><${TestoMod} id=${id} testo=${data.testo} segnaposto="Testo" stile=${{ fontSize: (data.dim || 18) + 'px' }} /><${Segni} id=${id} /></div>`);
  const Forma = memo(({ id, data, selected }) => html`<div className=${'ogg forma f-' + (data.forma || 'rett')}>
    <svg className="fsvg" viewBox="0 0 100 100" preserveAspectRatio="none">${data.forma === 'rombo' ? html`<polygon points="50,2 98,50 50,98 2,50" fill=${data.colore || '#fff'} stroke="#7D8C95" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />` : data.forma === 'ellisse' ? html`<ellipse cx="50" cy="50" rx="48.5" ry="48.5" fill=${data.colore || '#fff'} stroke="#7D8C95" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />` : html`<rect x="1" y="1" width="98" height="98" rx="6" ry="6" fill=${data.colore || '#fff'} stroke="#7D8C95" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />`}</svg>
    <${Ridim} sel=${selected} min=${[60, 40]} /><${Maniglie} /><${TestoMod} id=${id} testo=${data.testo} classe="centro" /><${Segni} id=${id} /></div>`);
  const Immagine = memo(({ id, data, selected }) => { const u = useFile(data.file); return html`<div className="ogg immagine"><${Ridim} sel=${selected} min=${[40, 40]} /><${Maniglie} />${u ? html`<img src=${u} alt="" draggable=${false} />` : html`<div className="caric">Immagine non disponibile</div>`}<${Segni} id=${id} /></div>`; });
  const Cornice = memo(({ id, data, selected }) => html`<div className="ogg cornice" style=${{ background: data.colore || '#E2E6E5' }}><${Ridim} sel=${selected} min=${[160, 120]} /><div className="ctit"><${TestoMod} id=${id} testo=${data.testo} segnaposto="Cornice" /></div><${Segni} id=${id} /></div>`);
  const TIPI = { postit: PostIt, testo: Testo, forma: Forma, immagine: Immagine, cornice: Cornice };

  /* ---------- export: PNG e PDF (un PDF minimo con l'immagine JPEG, senza librerie) ---------- */
  function pdfDaJpeg(dataUrl, wPx, hPx, wPt, hPt) {
    const bin = atob(dataUrl.split(',')[1]); const parti = [], off = []; let len = 0;
    const add = (s) => { parti.push(s); len += s.length; };
    const obj = (n, body) => { off[n] = len; add(n + ' 0 obj\n' + body + '\nendobj\n'); };
    add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + wPt + ' ' + hPt + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    off[4] = len; add('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + wPx + ' /Height ' + hPx + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + bin.length + ' >>\nstream\n'); add(bin); add('\nendstream\nendobj\n');
    const cs = 'q ' + wPt + ' 0 0 ' + hPt + ' 0 0 cm /Im0 Do Q';
    obj(5, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
    const xref = len;
    add('xref\n0 6\n0000000000 65535 f \n' + [1, 2, 3, 4, 5].map((n) => String(off[n]).padStart(10, '0') + ' 00000 n \n').join(''));
    add('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
    const s = parti.join(''), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255;
    return new Blob([u], { type: 'application/pdf' });
  }
  I.pdfDaJpeg = pdfDaJpeg;

  /* ---------- cursori degli altri ---------- */
  function Cursori({ awareness }) {
    const [l, setL] = useState([]); const vp = useViewport();
    useEffect(() => {
      const f = () => { const out = []; awareness.getStates().forEach((s, k) => { if (k !== awareness.clientID && s && s.cursore && s.utente) out.push({ k, s }); }); setL(out); };
      awareness.on('change', f); f(); return () => awareness.off('change', f);
    }, [awareness]);
    return html`<${ViewportPortal}>${l.map(({ k, s }) => html`<div key=${k} className="cursore" style=${{ transform: 'translate(' + s.cursore.x + 'px,' + s.cursore.y + 'px) scale(' + (1 / vp.zoom) + ')', color: s.utente.colore }}>
      <svg viewBox="0 0 16 16" width="18" height="18"><path d="M1 1l5.5 14 2-5.5L14 7.5z" fill="currentColor" stroke="#fff" strokeWidth="1" /></svg><span style=${{ background: s.utente.colore }}>${s.utente.nome}</span></div>`)}<//>`;
  }

  /* ---------- barra dell'oggetto selezionato ---------- */
  function BarraOggetto({ n, azioni }) {
    const c = useContext(Ctx); const o = n.data;
    const colori = o.tipo === 'immagine' ? [] : o.tipo === 'testo' ? [] : Object.values(I.COLORI);
    return html`<${NodeToolbar} nodeId=${n.id} isVisible=${true} position=${Position.Top} offset=${12}><div className="barra-ogg">
      ${c.ed && colori.length ? html`<span className="colori">${colori.map((k) => html`<button key=${k} className=${'cs' + (o.colore === k ? ' on' : '')} style=${{ background: k }} title="Colore" onClick=${() => c.aggiorna(o.id, { colore: k })} />`)}</span>` : null}
      ${c.ed && o.tipo === 'forma' ? html`<span className="gr">${[['rett', 'Rettangolo'], ['ellisse', 'Ellisse'], ['rombo', 'Rombo']].map(([f, t]) => html`<button key=${f} className=${'bo' + (o.forma === f ? ' on' : '')} title=${t} onClick=${() => c.aggiorna(o.id, { forma: f })}><span className=${'mini f-' + f} /></button>`)}</span>` : null}
      ${c.ed && o.tipo === 'testo' ? html`<span className="gr"><button className="bo" title="Più piccolo" onClick=${() => c.aggiorna(o.id, { dim: Math.max(12, (o.dim || 18) - 4) })}>A-</button><button className="bo" title="Più grande" onClick=${() => c.aggiorna(o.id, { dim: Math.min(72, (o.dim || 18) + 4) })}>A+</button></span>` : null}
      <span className="gr"><button className="bo" title="Commenta" onClick=${() => c.apriCommenti(o.id, true)}><${Ico} n="chat" /></button>
      ${c.ed ? html`<button className="bo" title="Duplica" onClick=${() => azioni.duplica(o.id)}><${Ico} n="copy" /></button><button className="bo" title="Porta in primo piano" onClick=${() => azioni.avanti(o.id)}><${Ico} n="up" /></button><button className="bo rosso" title="Elimina" onClick=${() => azioni.elimina([o.id])}><${Ico} n="trash" /></button>` : null}<${Info} id="oggetti" /></span>
    </div><//>`;
  }

  /* ---------- pannelli laterali ---------- */
  function PannelloCommenti({ commenti, nodi, focus, setFocus, docId, ruolo, chiudi, rf }) {
    const c = useContext(Ctx); const [aperti, setAperti] = useState(true); const ta = useRef(null);
    useEffect(() => { if (focus && focus.nuovo && ta.current) ta.current.focus(); }, [focus]);
    const nomeOgg = (id) => { const n = nodi.find((x) => x.id === id); if (!n) return 'oggetto eliminato'; const t = (n.data.testo || '').trim(); return ({ postit: 'Post-it', testo: 'Testo', forma: 'Forma', immagine: 'Immagine', cornice: 'Cornice' }[n.type]) + (t ? ': ' + t.slice(0, 40) : ''); };
    const lista = commenti.filter((x) => (!aperti || !x.risolto) && (!focus || !focus.id || x.oggetto === focus.id));
    const vai = (id) => { const n = rf.getNode(id); if (n) { rf.setNodes((ns) => ns.map((x) => Object.assign({}, x, { selected: x.id === id }))); rf.fitView({ nodes: [{ id }], duration: 300, maxZoom: 1.2, padding: 0.6 }); } };
    return html`<aside className="pann"><header><b>Commenti</b><${Info} id="commenti" /><span className="sp" /><button className="ib0" onClick=${chiudi} aria-label="Chiudi"><${Ico} n="x" /></button></header>
      <div className="pfiltro"><label className="sw"><input type="checkbox" checked=${aperti} onChange=${(e) => setAperti(e.target.checked)} /><span>Solo da risolvere</span></label>${focus && focus.id ? html`<button className="chip ch" onClick=${() => setFocus(null)}>${nomeOgg(focus.id)} <${Ico} n="x" /></button>` : null}</div>
      <div className="plista">${lista.length ? lista.map((x) => html`<div key=${x.id} className=${'pcom' + (x.risolto ? ' ris' : '')}>
        <div className="pct"><span dangerouslySetInnerHTML=${{ __html: UI.avatar(N.Shell.profiloDi(x.autore), 24) }} /><b>${N.Shell.nome(x.autore)}</b><small className="muted">${U.fa(x.il)}</small></div>
        <button className="pogg" onClick=${() => vai(x.oggetto)}>${nomeOgg(x.oggetto)}</button><p>${x.testo}</p>
        <div className="pazioni"><button className="btn sm link" onClick=${() => D.iris.aggiornaCommento(docId, x.id, { risolto: !x.risolto }).then(c.ricarica).catch(UI.errore)}>${x.risolto ? 'Riapri' : 'Risolvi'}</button>${x.autore === c.io || ruolo === 'proprietario' ? html`<button className="btn sm link" onClick=${() => D.iris.aggiornaCommento(docId, x.id, { eliminato: U.ora() }).then(c.ricarica).catch(UI.errore)}>Elimina</button>` : null}</div></div>`) : html`<p className="muted small">Nessun commento${aperti ? ' da risolvere' : ''}. Seleziona un oggetto e premi il fumetto per commentarlo.</p>`}</div>
      ${focus && focus.id && nodi.find((n) => n.id === focus.id) ? html`<form className="pnuovo" onSubmit=${(e) => { e.preventDefault(); const t = e.target.t.value; D.iris.commenta(docId, focus.id, t).then(() => { e.target.t.value = ''; c.ricarica(); }).catch(UI.errore); }}>
        <textarea ref=${ta} name="t" rows="2" placeholder="Scrivi un commento" onKeyDown=${(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) e.target.form.requestSubmit(); }} /><button className="btn sm pri">Invia</button></form>` : null}</aside>`;
  }
  function PannelloVoti({ nodi, azzera, ruolo, chiudi, rf }) {
    const c = useContext(Ctx);
    const l = nodi.filter((n) => n.type === 'postit' && (n.data.voti || []).length).sort((a, b) => b.data.voti.length - a.data.voti.length);
    const miei = nodi.filter((n) => (n.data.voti || []).includes(c.io)).length;
    return html`<aside className="pann"><header><b>Votazione</b><${Info} id="voto" /><span className="sp" /><button className="ib0" onClick=${chiudi} aria-label="Chiudi"><${Ico} n="x" /></button></header>
      <p className="muted small">Con la votazione attiva, un tocco su un post-it aggiunge o toglie il tuo puntino. Hai dato ${miei} voti.</p>
      <div className="plista">${l.length ? l.map((n, i) => html`<button key=${n.id} className="pvoto" onClick=${() => rf.fitView({ nodes: [{ id: n.id }], duration: 300, maxZoom: 1.2, padding: 0.8 })}><b>${i + 1}</b><span style=${{ background: n.data.colore }} className="pv-c" /><span className="pv-t">${(n.data.testo || 'Post-it senza testo').slice(0, 60)}</span><span className="chip">${n.data.voti.length}</span></button>`) : html`<p className="muted small">Ancora nessun voto.</p>`}</div>
      ${ruolo === 'proprietario' ? html`<button className="btn sm" onClick=${azzera}>Azzera tutti i voti</button>` : null}</aside>`;
  }
  function PannelloVersioni({ docId, ed, salva, ripristina, chiudi }) {
    const [l, setL] = useState(null);
    const carica = () => D.iris.versioni(docId).then(setL);
    useEffect(() => { carica(); }, []);
    return html`<aside className="pann"><header><b>Versioni</b><${Info} id="versioni" /><span className="sp" /><button className="ib0" onClick=${chiudi} aria-label="Chiudi"><${Ico} n="x" /></button></header>
      <p className="muted small">Una versione si salva in automatico alla prima modifica di ogni giorno; si tengono le ultime 30.</p>
      ${ed ? html`<button className="btn sm" onClick=${async () => { const n = await UI.chiedi('Salva versione', '', 'Nota (facoltativa)'); if (n !== null) { await salva(n); carica(); } }}><${Ico} n="plus" />Salva versione ora</button>` : null}
      <div className="plista">${!l ? html`<p className="muted">Carico...</p>` : l.length ? l.map((v) => html`<div key=${v.id} className="pver"><div><b>${U.dataOra(v.il)}</b><small className="muted">${N.Shell.nome(v.da)}${v.nota ? ' - ' + v.nota : ''}${v.automatica ? ' (automatica)' : ''}</small></div>${ed ? html`<button className="btn sm" onClick=${() => ripristina(v).then(carica)}>Ripristina</button>` : null}</div>`) : html`<p className="muted small">Nessuna versione salvata.</p>`}</div></aside>`;
  }

  /* ---------- lavagna ---------- */
  function Lavagna({ conn, info }) {
    const { doc, awareness } = conn, docId = info.id, ruolo = info.ruolo, ed = ruolo !== 'lettore';
    const io = N.Shell.utente.id;
    const oggetti = useMemo(() => doc.getMap('oggetti'), [doc]), connettori = useMemo(() => doc.getMap('connettori'), [doc]);
    const rf = useReactFlow(); const wrap = useRef(null); const daSel = useRef(null);
    const pref = (k, d) => { try { const v = localStorage.getItem('iris:' + k); return v === null ? d : v === '1'; } catch (e) { return d; } };
    const [griglia, setGriglia] = useState(pref('griglia', true)), [mappa, setMappa] = useState(pref('mappa', false));
    const [voto, setVoto] = useState(false), [pann, setPann] = useState(null), [focus, setFocus] = useState(null), [commenti, setCommenti] = useState([]);
    const aggiorna = useCallback((id, patch) => doc.transact(() => { const o = oggetti.get(id); if (o) oggetti.set(id, Object.assign({}, o, patch)); }, 'azione'), [doc]);
    const nodo = (o, sel) => ({ id: o.id, type: o.tipo, position: { x: o.x, y: o.y }, width: o.w, height: o.h, data: o, selected: !!sel, zIndex: o.tipo === 'cornice' ? -1 : (o.z || 1), dragHandle: o.tipo === 'cornice' ? '.ctit' : undefined });
    const daY = (prev) => { const s = new Set((prev || []).filter((n) => n.selected).map((n) => n.id)); if (daSel.current) { s.clear(); s.add(daSel.current); daSel.current = null; } return Array.from(oggetti.values()).map((o) => nodo(o, s.has(o.id))); };
    const arco = (e, sel) => ({ id: e.id, source: e.da, target: e.a, sourceHandle: e.daH, targetHandle: e.aH, label: e.testo || undefined, type: 'smoothstep', selected: !!sel, markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#7D8C95' }, style: { stroke: '#7D8C95', strokeWidth: 1.8 }, labelStyle: { fill: '#16232E', fontSize: 12.5 }, labelBgStyle: { fill: '#FFFFFF' }, labelBgPadding: [6, 3], labelBgBorderRadius: 4, className: 'arco' });
    const archiDaY = (prev) => { const s = new Set((prev || []).filter((e) => e.selected).map((e) => e.id)); return Array.from(connettori.values()).map((e) => arco(e, s.has(e.id))); };
    const [nodi, setNodi] = useState(() => daY([])), [archi, setArchi] = useState(() => archiDaY([]));
    const um = useMemo(() => new Y.UndoManager([oggetti, connettori], { trackedOrigins: new Set(['azione', 'locale']) }), [doc]);

    /* aggiornamenti dal documento: arrivano da altre schede, dall'annulla o dalle azioni; il trascinamento locale no */
    useEffect(() => {
      const fo = (ev, tr) => { if (tr.origin !== 'locale') setNodi((p) => daY(p)); };
      const fc = (ev, tr) => { if (tr.origin !== 'locale') setArchi((p) => archiDaY(p)); };
      oggetti.observe(fo); connettori.observe(fc);
      return () => { oggetti.unobserve(fo); connettori.unobserve(fc); um.destroy(); };
    }, [doc]);
    /* presenza e cursore */
    useEffect(() => { const u = N.Shell.utente; awareness.setLocalStateField('utente', { id: u.id, nome: (u.nome || u.email).split(' ')[0], colore: U.colore(u.id) }); }, []);
    const muoviCursore = useMemo(() => { let t = 0; return (e) => { const ora = Date.now(); if (ora - t < 40) return; t = ora; awareness.setLocalStateField('cursore', rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })); }; }, [rf]);
    /* commenti (fuori dal documento Yjs) */
    const caricaCommenti = useCallback(() => D.iris.commenti(docId).then(setCommenti).catch(() => {}), [docId]);
    useEffect(() => { caricaCommenti(); return D.on((m) => { if (m.cosa === 'iris-commenti' && m.doc === docId && !N.Sync.offline) caricaCommenti(); }); }, []);
    const nCommenti = useMemo(() => { const o = {}; commenti.forEach((x) => { if (!x.risolto) o[x.oggetto] = (o[x.oggetto] || 0) + 1; }); return o; }, [commenti]);
    /* versione automatica alla prima modifica del giorno */
    const apertura = useRef(Y.encodeStateAsUpdate(doc));
    useEffect(() => {
      const k = 'iris:auto:' + docId; let fatto = false;
      const f = (u, origine) => {
        if (fatto || !ed || (origine !== 'azione' && origine !== 'locale')) return; fatto = true;
        let ult = null; try { ult = localStorage.getItem(k); } catch (e) { /* */ }
        if (ult === U.oggi() || !oggetti.size) return;
        try { localStorage.setItem(k, U.oggi()); } catch (e) { /* */ }
        D.iris.salvaVersione(docId, b64(apertura.current), 'Inizio giornata', true).catch(() => {});
      };
      doc.on('update', f); return () => doc.off('update', f);
    }, []);

    /* scrittura delle posizioni durante il trascinamento: a intervalli, così gli altri vedono il movimento */
    const pendenti = useRef({}); const timer = useRef(null);
    const scriviPendenti = useCallback(() => {
      const p = pendenti.current; pendenti.current = {}; timer.current = null; if (!Object.keys(p).length) return;
      doc.transact(() => { Object.keys(p).forEach((id) => { const o = oggetti.get(id); if (o) oggetti.set(id, Object.assign({}, o, p[id])); }); }, 'locale');
    }, [doc]);
    const accoda = (id, patch, subito) => { pendenti.current[id] = Object.assign(pendenti.current[id] || {}, patch); if (subito) scriviPendenti(); else if (!timer.current) timer.current = setTimeout(scriviPendenti, 60); };

    const elimina = useCallback((ids) => {
      doc.transact(() => { ids.forEach((id) => { oggetti.delete(id); Array.from(connettori.values()).forEach((e) => { if (e.da === id || e.a === id) connettori.delete(e.id); }); }); }, 'azione');
    }, [doc]);
    const onNodesChange = useCallback((ch) => {
      const rimossi = ch.filter((c) => c.type === 'remove').map((c) => c.id);
      if (rimossi.length) { if (ed) elimina(rimossi); return; }
      setNodi((n) => applyNodeChanges(ch, n));
      if (!ed) return;
      ch.forEach((c) => {
        if (c.type === 'position' && c.position) accoda(c.id, { x: Math.round(c.position.x), y: Math.round(c.position.y) }, c.dragging === false);
        if (c.type === 'dimensions' && c.dimensions && c.resizing !== undefined) accoda(c.id, { w: Math.round(c.dimensions.width), h: Math.round(c.dimensions.height) }, c.resizing === false);
      });
    }, [ed]);
    const onEdgesChange = useCallback((ch) => {
      const rimossi = ch.filter((c) => c.type === 'remove').map((c) => c.id);
      if (rimossi.length && ed) doc.transact(() => rimossi.forEach((id) => connettori.delete(id)), 'azione');
      setArchi((e) => applyEdgeChanges(ch.filter((c) => c.type !== 'remove'), e));
    }, [ed]);
    const onConnect = useCallback((p) => { if (!ed || p.source === p.target) return; const id = U.uid(); doc.transact(() => connettori.set(id, { id, da: p.source, a: p.target, daH: p.sourceHandle, aH: p.targetHandle, testo: '' }), 'azione'); }, [ed]);
    /* le cornici portano con sé gli oggetti che contengono */
    const figli = useRef(null);
    const dentro = (f, n) => { const w = n.measured ? n.measured.width : n.width || 0, h = n.measured ? n.measured.height : n.height || 0; return n.position.x >= f.position.x && n.position.y >= f.position.y && n.position.x + w <= f.position.x + (f.measured ? f.measured.width : f.width) && n.position.y + h <= f.position.y + (f.measured ? f.measured.height : f.height); };
    const onNodeDragStart = useCallback((e, n) => { figli.current = n.type === 'cornice' ? { da: Object.assign({}, n.position), l: rf.getNodes().filter((x) => x.id !== n.id && !x.selected && dentro(n, x)).map((x) => ({ id: x.id, p: Object.assign({}, x.position) })) } : null; }, []);
    const onNodeDrag = useCallback((e, n) => {
      const f = figli.current; if (!f || !f.l.length) return;
      const dx = n.position.x - f.da.x, dy = n.position.y - f.da.y, pos = {};
      f.l.forEach((x) => { pos[x.id] = { x: Math.round(x.p.x + dx), y: Math.round(x.p.y + dy) }; accoda(x.id, pos[x.id]); });
      setNodi((ns) => ns.map((x) => pos[x.id] ? Object.assign({}, x, { position: pos[x.id] }) : x));
    }, []);
    const onNodeDragStop = useCallback(() => { figli.current = null; scriviPendenti(); }, []);

    /* azioni */
    const centro = () => { const r = wrap.current.getBoundingClientRect(); return rf.screenToFlowPosition({ x: r.left + r.width / 2, y: r.top + r.height / 2 }); };
    const maxZ = () => Math.max(1, ...Array.from(oggetti.values()).map((o) => o.z || 1));
    const aggiungi = useCallback((tipo, extra, dove) => {
      const base = { postit: { w: 160, h: 140, colore: I.COLORI.giallo, testo: '' }, testo: { w: 260, h: 44, testo: '', dim: 20 }, forma: { w: 170, h: 90, forma: 'rett', colore: I.COLORI.bianco, testo: '' }, cornice: { w: 640, h: 420, testo: 'Cornice', colore: I.COLORI.grigio }, immagine: { w: 320, h: 220 } }[tipo];
      const o = Object.assign({ id: U.uid(), tipo, voti: [] }, base, extra || {});
      const c = dove || centro(); o.x = Math.round(c.x - o.w / 2 + (dove ? 0 : (Math.random() * 30 - 15))); o.y = Math.round(c.y - o.h / 2 + (dove ? 0 : (Math.random() * 30 - 15)));
      o.z = tipo === 'cornice' ? 0 : maxZ() + 1; daSel.current = o.id;
      doc.transact(() => oggetti.set(o.id, o), 'azione');
    }, [doc]);
    const azioni = useMemo(() => ({
      elimina,
      duplica: (id) => { const o = oggetti.get(id); if (!o) return; const n = Object.assign({}, o, { id: U.uid(), x: o.x + 30, y: o.y + 30, voti: [], z: o.tipo === 'cornice' ? 0 : maxZ() + 1 }); daSel.current = n.id; doc.transact(() => oggetti.set(n.id, n), 'azione'); },
      avanti: (id) => aggiorna(id, { z: maxZ() + 1 })
    }), [doc]);
    const immagine = async () => {
      const [f] = await U.scegliFile('image/*'); if (!f) return;
      try { const r = await U.riduciImmagine(f, 1600); const k = Math.min(1, 360 / Math.max(r.larghezza, r.altezza)); const fl = await D.file.carica(docId, r.dataUrl, f.name, f.type === 'image/png' ? 'image/png' : 'image/jpeg'); cacheFile[fl.id] = r.dataUrl; aggiungi('immagine', { file: fl.id, w: Math.round(r.larghezza * k), h: Math.round(r.altezza * k) }); } catch (e) { UI.errore(e); }
    };
    const inserisci = (tpl) => {
      const t0 = I.istanzia(tpl, 0, 0, U.uid); if (!t0.oggetti.length) return;
      const minX = Math.min(...t0.oggetti.map((o) => o.x)), minY = Math.min(...t0.oggetti.map((o) => o.y)), maxX = Math.max(...t0.oggetti.map((o) => o.x + o.w)), maxY = Math.max(...t0.oggetti.map((o) => o.y + o.h));
      const c = centro(), dx = Math.round(c.x - (minX + maxX) / 2), dy = Math.round(c.y - (minY + maxY) / 2), z = maxZ();
      doc.transact(() => { t0.oggetti.forEach((o) => oggetti.set(o.id, Object.assign({}, o, { x: o.x + dx, y: o.y + dy, z: o.tipo === 'cornice' ? 0 : z + (o.z || 1) }))); t0.connettori.forEach((e) => connettori.set(e.id, e)); }, 'azione');
      setTimeout(() => rf.fitView({ duration: 300, padding: 0.15 }), 80);
    };
    const vota = useCallback((id) => { const o = oggetti.get(id); if (!o || !ed) return; const v = new Set(o.voti || []); if (v.has(io)) v.delete(io); else v.add(io); aggiorna(id, { voti: Array.from(v) }); }, [ed]);
    const azzera = async () => { if (await UI.conferma('Azzera i voti', 'Tutti i puntini su tutti i post-it verranno tolti.', 'Azzera', true)) doc.transact(() => { oggetti.forEach((o, k) => { if ((o.voti || []).length) oggetti.set(k, Object.assign({}, o, { voti: [] })); }); }, 'azione'); };
    const salvaVersione = (nota) => D.iris.salvaVersione(docId, b64(Y.encodeStateAsUpdate(doc)), nota).then(() => UI.toast('Versione salvata')).catch(UI.errore);
    const ripristina = async (v) => {
      if (!(await UI.conferma('Ripristina versione', 'La lavagna torna com\'era il ' + U.dataOra(v.il) + '. Prima salvo una versione dello stato attuale.', 'Ripristina'))) return;
      try {
        await D.iris.salvaVersione(docId, b64(Y.encodeStateAsUpdate(doc)), 'Prima del ripristino', true);
        const full = await D.iris.leggiVersione(docId, v.id); const tmp = new Y.Doc(); Y.applyUpdate(tmp, deb64(full.stato));
        doc.transact(() => { oggetti.clear(); connettori.clear(); tmp.getMap('oggetti').forEach((o, k) => oggetti.set(k, o)); tmp.getMap('connettori').forEach((e, k) => connettori.set(k, e)); }, 'azione');
        tmp.destroy(); UI.toast('Versione ripristinata'); setTimeout(() => rf.fitView({ duration: 300, padding: 0.15 }), 80);
      } catch (e) { UI.errore(e); }
    };
    const esporta = async (formato, cornice) => {
      const tutti = rf.getNodes(); const target = cornice ? [cornice].concat(tutti.filter((x) => x.id !== cornice.id && dentro(cornice, x))) : tutti;
      if (!target.length) return UI.toast('La lavagna è vuota');
      const b0 = getNodesBounds(target), b = Object.assign({}, b0, { y: b0.y - 34, height: b0.height + 34 }), pad = 40, w = Math.round(b.width + pad * 2), h = Math.round(b.height + pad * 2);
      const vp = { x: pad - b.x, y: pad - b.y, zoom: 1 }; const scala = Math.min(2, 4000 / Math.max(w, h));
      const el = wrap.current.querySelector('.react-flow__viewport'); wrap.current.classList.add('esporta');
      const sfondo = getComputedStyle(document.documentElement).getPropertyValue('--sup').trim() || '#ffffff';
      const opz = { backgroundColor: sfondo, width: w, height: h, pixelRatio: scala, style: { width: w + 'px', height: h + 'px', transform: 'translate(' + vp.x + 'px,' + vp.y + 'px) scale(' + vp.zoom + ')' }, filter: (n) => !(n.classList && (n.classList.contains('cursore') || n.classList.contains('react-flow__resize-control'))) };
      const nome = (info.titolo || 'lavagna').replace(/[^\w\- àèéìòù]+/gi, '').trim() + (cornice ? ' - ' + (cornice.data.testo || 'cornice') : '');
      try {
        if (formato === 'png') { const u = await L.toPng(el, opz); U.scarica(await (await fetch(u)).blob(), nome + '.png'); }
        else { const u = await L.toJpeg(el, Object.assign({}, opz, { quality: 0.92 })); const img = new Image(); await new Promise((ok) => { img.onload = ok; img.src = u; }); U.scarica(pdfDaJpeg(u, img.naturalWidth, img.naturalHeight, Math.round(w * 0.75), Math.round(h * 0.75)), nome + '.pdf'); }
        UI.toast('Esportazione pronta');
      } catch (e) { UI.errore(e); } finally { wrap.current.classList.remove('esporta'); }
    };
    const apriCommenti = useCallback((id, nuovo) => { setPann('commenti'); setFocus({ id, nuovo: !!nuovo }); }, []);

    /* tastiera: annulla e ripeti */
    useEffect(() => {
      const k = (e) => {
        if (!ed || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') || document.querySelector('.mfondo')) return;
        const m = e.ctrlKey || e.metaKey;
        if (m && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) um.redo(); else um.undo(); }
        if (m && e.key.toLowerCase() === 'y') { e.preventDefault(); um.redo(); }
      };
      addEventListener('keydown', k); return () => removeEventListener('keydown', k);
    }, []);
    const toggle = (k, v, set) => { set(v); try { localStorage.setItem('iris:' + k, v ? '1' : '0'); } catch (e) { /* */ } };
    const sel = nodi.filter((n) => n.selected);
    const corniceSel = sel.length === 1 && sel[0].type === 'cornice' ? sel[0] : null;
    const ctx = { ed, voto, io, aggiorna, vota, nCommenti, apriCommenti, ricarica: caricaCommenti };
    const menuEsporta = (e) => UI.menu(e.currentTarget, [{ testo: 'Lavagna intera in PNG', ico: 'image', fai: () => esporta('png') }, { testo: 'Lavagna intera in PDF', ico: 'file', fai: () => esporta('pdf') }].concat(corniceSel ? ['-', { testo: 'Cornice selezionata in PNG', ico: 'image', fai: () => esporta('png', corniceSel) }, { testo: 'Cornice selezionata in PDF', ico: 'file', fai: () => esporta('pdf', corniceSel) }] : ['-', { testo: 'Per una cornice, selezionala prima', disab: true, fai: () => {} }]));
    const menuTemplate = (e) => UI.menu(e.currentTarget, I.TEMPLATE.filter((t) => t.id !== 'vuota').map((t) => ({ testo: t.nome, ico: 'grid', fai: () => inserisci(t) })), { destra: false });
    const menuForme = (e) => UI.menu(e.currentTarget, [['rett', 'Rettangolo'], ['ellisse', 'Ellisse'], ['rombo', 'Rombo']].map(([f, t]) => ({ testo: t, fai: () => aggiungi('forma', { forma: f }) })), { destra: false });
    const vuota = !nodi.length;

    return html`<${Ctx.Provider} value=${ctx}><div className=${'lav' + (voto ? ' in-voto' : '') + (pann ? ' con-pann' : '')} ref=${wrap} onPointerMove=${muoviCursore}
        onDoubleClick=${(e) => { if (ed && !voto && e.target.classList && e.target.classList.contains('react-flow__pane')) aggiungi('postit', null, rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })); }}>
      <${ReactFlow} nodes=${nodi} edges=${archi} nodeTypes=${TIPI} onNodesChange=${onNodesChange} onEdgesChange=${onEdgesChange} onConnect=${onConnect}
        onNodeDragStart=${onNodeDragStart} onNodeDrag=${onNodeDrag} onNodeDragStop=${onNodeDragStop}
        onEdgeDoubleClick=${ed ? async (e, a) => { const o = connettori.get(a.id); const t = await UI.chiedi('Testo del connettore', o ? o.testo : '', 'Testo'); if (t !== null && o) doc.transact(() => connettori.set(a.id, Object.assign({}, o, { testo: t.trim() })), 'azione'); } : undefined}
        connectionMode=${ConnectionMode.Loose} nodesDraggable=${ed && !voto} nodesConnectable=${ed && !voto} elementsSelectable=${true} deleteKeyCode=${ed ? ['Backspace', 'Delete'] : null}
        zoomOnDoubleClick=${false} elevateNodesOnSelect=${false} minZoom=${0.1} maxZoom=${3} fitView=${true} fitViewOptions=${{ padding: 0.2, maxZoom: 1 }} proOptions=${{ hideAttribution: true }}
        defaultEdgeOptions=${{ type: 'smoothstep' }} snapToGrid=${griglia} snapGrid=${[10, 10]} selectionOnDrag=${false} panOnScroll=${false}>
        ${griglia ? html`<${Background} gap=${20} size=${1.2} />` : null}
        ${mappa ? html`<${MiniMap} pannable=${true} zoomable=${true} nodeColor=${(n) => n.data.colore || '#C9D1D3'} />` : null}
        <${Controls} showInteractive=${false} />
        <${Cursori} awareness=${awareness} />
        ${sel.length === 1 && !voto ? html`<${BarraOggetto} n=${sel[0]} azioni=${azioni} />` : null}
      <//>
      ${ed ? html`<div className="strumenti">
        <button title="Post-it" onClick=${() => aggiungi('postit')}><span className="tpost" /><small>Post-it</small></button>
        <button title="Testo" onClick=${() => aggiungi('testo', { testo: 'Testo' })}><b className="ttxt">T</b><small>Testo</small></button>
        <button title="Forma" data-pop onClick=${menuForme}><span className="tforma" /><small>Forma</small></button>
        <button title="Immagine" onClick=${immagine}><${Ico} n="image" /><small>Immagine</small></button>
        <button title="Cornice" onClick=${() => aggiungi('cornice')}><span className="tcorn" /><small>Cornice</small></button>
        <hr /><button title="Template" data-pop onClick=${menuTemplate}><${Ico} n="grid" /><small>Template</small></button>
        <hr /><button title="Annulla (Ctrl+Z)" onClick=${() => um.undo()}><${Ico} n="undo" /><small>Annulla</small></button>
        <button title="Ripeti (Ctrl+Maiusc+Z)" onClick=${() => um.redo()}><span className="spec"><${Ico} n="undo" /></span><small>Ripeti</small></button><span className="si"><${Info} id="strumenti" /></span></div>` : null}
      <div className="azlav">
        ${ed ? html`<button className=${'btn sm' + (voto ? ' attivo' : '')} onClick=${() => { setVoto(!voto); if (!voto) setPann('voti'); }}><${Ico} n="star" /><span className="solo-l">${voto ? 'Votazione attiva' : 'Vota'}</span></button>` : null}
        <button className=${'btn sm' + (pann === 'commenti' ? ' attivo' : '')} onClick=${() => { setPann(pann === 'commenti' ? null : 'commenti'); setFocus(null); }}><${Ico} n="chat" /><span className="solo-l">Commenti</span>${commenti.filter((x) => !x.risolto).length ? html`<span className="cnt">${commenti.filter((x) => !x.risolto).length}</span>` : null}</button>
        <button className=${'btn sm' + (pann === 'versioni' ? ' attivo' : '')} onClick=${() => setPann(pann === 'versioni' ? null : 'versioni')}><${Ico} n="clock" /><span className="solo-l">Versioni</span></button>
        <button className="btn sm" data-pop onClick=${menuEsporta}><${Ico} n="down" /><span className="solo-l">Esporta</span></button>
        <button className="ib0" data-pop title="Vista" onClick=${(e) => UI.menu(e.currentTarget, [{ testo: (griglia ? 'Nascondi' : 'Mostra') + ' griglia', ico: 'grid', fai: () => toggle('griglia', !griglia, setGriglia) }, { testo: (mappa ? 'Nascondi' : 'Mostra') + ' minimappa', ico: 'image', fai: () => toggle('mappa', !mappa, setMappa) }, { testo: 'Adatta allo schermo', ico: 'search', fai: () => rf.fitView({ duration: 300, padding: 0.15 }) }])}><${Ico} n="menu" /></button><${Info} id="lavagna" />
      </div>
      ${vuota ? html`<div className="suggerimento">${ed ? 'Doppio clic sulla lavagna per un post-it, oppure scegli uno strumento a sinistra.' : 'La lavagna è vuota.'}</div>` : null}
      ${voto ? html`<div className="bvoto">Votazione attiva: tocca un post-it per dare o togliere il tuo voto <button className="btn sm" onClick=${() => setVoto(false)}>Fine</button></div>` : null}
      ${pann === 'commenti' ? html`<${PannelloCommenti} commenti=${commenti} nodi=${nodi} focus=${focus} setFocus=${setFocus} docId=${docId} ruolo=${ruolo} rf=${rf} chiudi=${() => setPann(null)} />` : null}
      ${pann === 'voti' ? html`<${PannelloVoti} nodi=${nodi} azzera=${azzera} ruolo=${ruolo} rf=${rf} chiudi=${() => setPann(null)} />` : null}
      ${pann === 'versioni' ? html`<${PannelloVersioni} docId=${docId} ed=${ed} salva=${salvaVersione} ripristina=${ripristina} chiudi=${() => setPann(null)} />` : null}
    </div><//>`;
  }

  I.apriLavagna = async function (info, el) {
    el.innerHTML = '<div class="iris-root"><div class="boot"><p>Apro la lavagna...</p></div></div>';
    const conn = await D.iris.apri(info.id);
    const box = el.querySelector('.iris-root'); box.innerHTML = '';
    const root = L.ReactDOMClient.createRoot(box);
    root.render(html`<${ReactFlowProvider}><${Lavagna} conn=${conn} info=${info} /><//>`);
    return { chiudi() { root.unmount(); conn.chiudi(); } };
  };
})(window.N = window.N || {});

# iris 0.5 - Revisione del piano (modifiche al documento per l'esecuzione)

Documento del 16/11/2026. Si legge insieme a `iris-piano-0.5.md` (punti 1-318) e contiene solo le modifiche: correzioni, aggiunte e tagli. Obiettivo: una lavagna completa, simile a Miro, ma più leggera. I punti proseguono la numerazione del piano, così ogni numero resta unico.

## Come usare questo documento

319. **Precedenza**: dove questo file e il piano dicono cose diverse vale questo file; ciò che qui non è citato resta com'è nel piano.
320. **Rimandi**: "piano 94" è il punto 94 del piano; i numeri da 319 in su sono di questo file. Le sezioni nuove continuano i codici del piano (A4, D7, ...); i blocchi nuovi sono M e N.
321. **Tipo di modifica**: ogni punto dice se è una **correzione** (il piano, eseguito alla lettera, produce un difetto), un'**aggiunta**, un **taglio** (alleggerimento) o un **chiarimento**.
322. **Ordine di esecuzione**: A, M, B, C, D, E, F, N, G, H, I, J, K, L (tabella aggiornata più sotto). Restano valide le regole del piano 1-5 e 18-26.
323. **Codice di riferimento**: i frammenti marcati "provato" sono stati eseguiti in un browser di prova con `vendor/iris-lib.js` del repository; quelli marcati "da provare" sono indicazioni da verificare durante l'esecuzione.

## Esito della revisione

324. **Confermato sul codice 0.4**: struttura dei file, funzioni del nucleo usate dal piano (`D._mutaTab`, `U.codice`, `versioneSemina`, service worker solo in https) e tutte le esportazioni di React Flow citate nel piano 7, `EdgeToolbar` compresa. Nessun carattere vietato nel codice e nel piano.
325. **Difetti del piano riprodotti in prova**:

| Dove | Cosa succede eseguendo il piano alla lettera | Rimedio |
|---|---|---|
| piano 11 | due persone toccano lo stesso oggetto: il voto, il testo o lo spostamento di una delle due si perde; l'annulla di chi è stato scavalcato non fa nulla | M1, M2, M3 |
| piano 94 | linea rilasciata al centro di un oggetto grande: nasce un'ancora sopra l'oggetto invece del collegamento; un clic su un pallino crea una linea lunga zero | D7, D9 |
| piano 163 | lo strato della penna ferma la rotellina e lo zoom finché lo strumento è attivo | F13 |
| piano 164 | il riquadro di un disegno copre gli oggetti che ha sotto: non si selezionano più | F13 |
| piano 131 | Maiusc+1 e Maiusc+2 non scattano sulle tastiere italiane | E10 |
| piano 104 | su tablet e telefono non esiste un modo per selezionare più oggetti | E10 |
| piano 72 | le lavagne di esempio 0.4 vengono cancellate anche se modificate (contro il piano 19) | C11 |
| piano 80, 107, 126, 308 | rimandi e dipendenze tra blocchi sbagliati | A4, E10, I7 |

326. **Misure di partenza** (codice 0.4, browser di prova senza schermo, valori indicativi, kB = 1.000 byte): libreria 454,82 kB (149,58 kB compressa con il suo CSS); codice proprio 167,40 kB (53,92 kB compresso); font 77,34 kB. Apertura di una lavagna: 0,13 s con 300 oggetti, 0,28 s con 1.000. Trascinamento di 60 passi: 2,64 s con 300 oggetti, 5,04 s con 1.000.
327. **Già leggero, resta com'è**: ancore come nodi per le linee libere (piano 93), anteprime dei template generate (piano 253), PDF scritto a mano (piano 280), divieto di nuove librerie (piano 8).

## Blocco M - Fondamenta leggere (nuovo, subito dopo A)

Scopo: sistemare prima dei blocchi D-J le tre cose su cui tutto il resto si appoggia (dati, annulla, ridisegno). Farlo dopo costa molto di più.

### M1 - Oggetti per campi (`js/modello.js`, nuovo) - correzione

328. **Problema** (riprodotto con due documenti sincronizzati): con `oggetti.set(id, {...o, ...patch})` (piano 11) vince l'ultima scrittura sull'intero oggetto. Simo e Giulia votano insieme lo stesso post-it: resta un voto solo. Simo sposta mentre Giulia scrive: il testo sparisce. Simo cambia colore, Giulia vota, Simo annulla: non succede nulla.
329. **Soluzione**: ogni oggetto e ogni connettore diventa una `Y.Map` di campi (`x`, `y`, `testo`, ...): le modifiche a campi diversi si fondono. Tutto passa da `const M = I.modello(doc)` (Appendice 7, provato): `M.oggetti` e `M.connettori` hanno `leggi(id)`, `tutti()`, `crea(o)`, `aggiorna(id, patch)`, `elimina(id)`, `ascolta(f)` [punto aperto 430].
330. **Compatibilità**: le voci 0.4 (JSON intero) si leggono come sono e diventano `Y.Map` alla prima modifica; nessuna migrazione all'apertura (piano 19).
331. **Regola**: nessun file usa più `doc.getMap('oggetti')` o `doc.getMap('connettori')` direttamente. Dove il piano scrive `oggetti.set(...)` o `connettori.set(...)` si intende `M.oggetti.crea` o `M.oggetti.aggiorna` (lo stesso per i connettori); i nomi nel contesto (`c.aggiorna`, `c.aggiornaArco`) restano.
332. **Punti da adattare nel codice 0.4**: in `js/lavagna.js` `aggiorna`, `scriviPendenti`, `elimina`, `aggiungi`, `duplica`, `inserisci`, `azzera`, `ripristina`, `onConnect`, `onEdgeDoubleClick`, `daY`, `archiDaY`; in `js/app.js` `scrivi`, `semina`, `esportaContenuto`, `importaContenuto`. Per leggere uno stato salvato: `I.modello(tmp).contenuto()`.
333. **Lettura sempre fresca**: `M.oggetti.leggi(id)` restituisce lo stesso oggetto finché non cambia (i componenti `memo` non si ridisegnano) ed è sempre aggiornato; `n.data` di un nodo può restare indietro dopo un trascinamento locale. Allineamento, appunti, export e ricerca leggono dal modello, non da `n.data`.
334. **Campi composti**: un campo che contiene un array o un oggetto resta "tutto o niente". È vietato per i dati scritti da più persone (voti, risposte, "ho finito"): vedi M2.
335. **Peso misurato** (1.000 post-it): lo stato del documento passa da 174,81 kB a 274,94 kB (+57,28%); 100 passi di trascinamento passano da 14,87 kB a 4,17 kB di aggiornamenti (-71,96%). Il maggior peso a riposo si recupera con M6.

### M2 - Voti, risposte e "ho finito": una chiave per persona - correzione

336. **Voti**: mappa `doc.getMap('voti')`, chiave `idOggetto|idUtente`, valore `1`, origine `'voto'`. Si usano `M.vota(id, utente, si)`, `M.indiceVoti()` (restituisce `{ idOggetto: [idUtente] }`) e `M.azzeraVoti()`. Sostituisce il campo `voti` degli oggetti nel piano 217, 218, 221 e 291.
337. **Voti 0.4**: quelli rimasti nel campo `voti` degli oggetti vecchi si sommano nell'indice e si tolgono quando la persona ritira il voto o si azzera tutto (provato).
338. **Indice nel contesto**: `Segni` e `PannelloVoti` leggono `c.voti[id]`. L'indice si ricalcola quando cambia la mappa `voti`; se la lavagna contiene ancora voti 0.4, anche quando cambiano gli oggetti, al massimo una volta per fotogramma.
339. **Risposte della scala** (piano 169-171): mappa `doc.getMap('risposte')`, chiave `idScala|idUtente`, valore da 0 a 1, origine `'voto'`. Il campo `posizioni` sparisce dall'oggetto `scala`; "Azzera risposte" cancella le chiavi di quella scala.
340. **"Ho finito"** (piano 217, 219): chiave `finito|idUtente` nella mappa `sessione`, valore = id della votazione. Il campo `finiti` dentro `sessione.voto` sparisce.
341. **Conseguenze**: template, copia, duplica, "I miei template" e `I.istanzia` non portano e non azzerano più i voti (piano 261, 266); `semina` scrive voti e risposte di esempio nelle mappe (piano 72, 286); il ripristino di una versione non tocca voti e risposte; `importaContenuto` copia anche le chiavi di `voti` e `risposte`.

### M3 - Annulla con confini espliciti - correzione

342. **Problema**: l'`UndoManager` di Yjs fonde le modifiche fatte a meno di 0,50 secondi l'una dall'altra: due azioni rapide diventano un passo solo, e un trascinamento con una pausa si spezza in due.
343. **Soluzione** (dentro `I.modello`, provata): `captureTimeout` di un'ora e confini decisi dal codice. `M.azione(fn)` = un passo di annulla. Per i gesti continui: `M.inizioGesto()` una volta (inizio del trascinamento o del ridimensionamento, prima freccia di una serie dopo 0,80 secondi di pausa), poi `M.gesto(fn)` per ogni scrittura con origine `'locale'`.
344. **Uso**: ogni comando del piano che dice "una transazione `'azione'`" usa `M.azione`; l'`um` della lavagna è `M.um`. Il criterio del piano 269 (annulla toglie il template in un passo) vale così a qualunque velocità.

### M4 - Ridisegno incrementale e contesto stabile - correzione

345. **Problema**: oggi a ogni modifica del documento si ricreano tutti i nodi, e il valore del contesto React è un oggetto nuovo a ogni render: durante un trascinamento si ridisegnano tutti gli oggetti a ogni movimento. Misurato con 1.000 oggetti: 60 passi di trascinamento in 5,04 s; con il solo contesto stabile 4,21 s (-16,45%).
346. **Nodi** (da provare): `M.oggetti.ascolta` dice quali id sono cambiati; si rifanno solo quelli, gli altri restano lo stesso oggetto.

```js
const applicaNodi = (prev, ids) => { const per = new Map(prev.map((n) => [n.id, n]));
  return Array.from(M.oggetti.mappa.keys(), (id) => { const v = per.get(id); if (v && !ids.has(id)) return v;
    const n = nodo(M.oggetti.leggi(id), v && v.selected); return v && v.dragging ? Object.assign(n, { position: v.position, dragging: true }) : n; }); };
useEffect(() => M.oggetti.ascolta((ids, origine) => { if (origine !== 'locale') setNodi((p) => applicaNodi(p, ids)); }), [M]);
```

347. **Connettori**: stessa regola con `M.connettori.ascolta`.
348. **Selezione dei nuovi oggetti** (`daSel`, piano 262): si applica con un secondo `setNodi` che tocca solo i nodi il cui stato `selected` cambia.
349. **Contesto**: due contesti, entrambi creati con `useMemo`. `I.Ctx` stabile (`ed`, `io`, `ruolo`, `docId`, funzioni) e `I.CtxVivo` per ciò che cambia (`voto`, `voti`, `nCommenti`, `unArcoSel`, `modArco`, `modTesto`, opzioni di Vista), letto solo dai componenti che lo usano. Vale anche per i campi che il piano aggiunge al contesto (piano 84, 85).
350. **Derivati**: `sel`, `idSelezionati`, `corniceSel` e simili con `useMemo`; niente `nodi.filter(...)` nel corpo del render.
351. **Da non fare**: non attivare `onlyRenderVisibleElements`. Con 1.000 oggetti zoom e spostamento della vista restano a 17 ms per fotogramma; l'opzione complicherebbe l'export e la modifica del testo. Si rivaluta solo se le misure peggiorano.

### M5 - Presenza leggera - correzione

352. **Stato piccolo**: l'awareness rimanda tutto lo stato locale a ogni cambio di un campo, quindi a ogni movimento del cursore. `selezione` (piano 183) porta al massimo 12 id; oltre, porta solo il riquadro `{ n, x, y, w, h }` e gli altri vedono un rettangolo unico con l'etichetta "24 oggetti". `reazione` torna `null` dopo 3 secondi.
353. **Ritmi in un posto solo**: `I.RITMI = { cursore: 40, vista: 150, trascina: 60 }` (millisecondi) in `js/base.js`: in fase 2 si alzano senza cercare i numeri nel codice.
354. **Un ridisegno per fotogramma** (da provare): molti aggiornamenti di presenza, un solo `setState`.

```js
useEffect(() => { let attesa = 0;
  const leggi = () => { attesa = 0; setStati(Array.from(awareness.getStates(), ([k, s]) => ({ k, s })).filter((x) => x.k !== awareness.clientID && x.s && x.s.utente)); };
  const f = () => { if (!attesa) attesa = requestAnimationFrame(leggi); };
  awareness.on('change', f); leggi(); return () => { awareness.off('change', f); cancelAnimationFrame(attesa); }; }, [awareness]);
```

355. **Cursori fermi mentre sposto la vista**: la transizione del piano 188 si sospende tra `onMoveStart` e `onMoveEnd` (classe `muove` sullo strato), altrimenti i cursori degli altri "scivolano" quando sono io a muovere la vista.

### M6 - Versioni in JSON - taglio

356. **Salvataggio**: `D.iris.salvaVersione(docId, 'json:' + JSON.stringify(M.contenuto()), nota)`: niente storia Yjs né mappe di sessione. Stima per 1.000 post-it: circa 150 kB contro i 366,59 kB dello stato in base64. Nessuna modifica al nucleo.
357. **Ripristino**: se lo stato comincia con `json:` si usa `M.sostituisci(JSON.parse(...))` (un solo passo di annulla, provato); le versioni 0.4 si decodificano come oggi e si leggono con `I.modello(tmp).contenuto()`.
358. **Versione automatica**: la fotografia iniziale (`apertura`) si calcola solo se quella di oggi non è già stata salvata: il controllo su `iris:auto:<docId>` va fatto prima, all'apertura.

### M7 - Misure e controlli automatici - aggiunta

359. **`prove/controlli.js`** (Appendice 8, provato sul codice 0.4): senza browser controlla che ogni file servito sia in `ASSETS` di `sw.js`, che non ci siano caratteri vietati (piano 18) né indirizzi esterni (piano 8), la sintassi dei file, i template (id unici, connettori validi, valori definiti, 44 px tra cornici come nel piano 232) e il peso. Sul codice 0.4 segnala, giustamente, i due titoli coperti della matrice.
360. **`prove/carico.js`** (Appendice 9, provato sul codice 0.4): crea una lavagna da 300 o 1.000 oggetti e misura apertura, 60 passi di trascinamento e zoom. Non ha bisogno del server del piano 29: passa i file del repository al browser di prova intercettando le richieste.
361. **Limiti di leggerezza**:
    1. codice proprio (JS, CSS, HTML; senza `vendor/` e font) entro 150,00 kB compressi; oggi 53,92 kB [punto aperto 435];
    2. con 1.000 oggetti il trascinamento migliora di almeno il 15% rispetto alla partenza e nessun'altra misura peggiora di oltre il 20%;
    3. nessuna barra mostra più di 8 comandi: il resto va nel menu "Altro" (E10).
362. **Quando**: dopo ogni blocco, insieme a `prove/fumo.js` (piano 5). Le misure di partenza e di arrivo vanno nell'handoff (L6).

### Criteri di accettazione M

363. **Conflitti**: in due schede, Simo trascina un post-it mentre Giulia ne cambia il testo: restano entrambe le modifiche; due voti contemporanei sullo stesso post-it restano due.
364. **Annulla**: colore e poi spostamento, fatti in meno di mezzo secondo, sono due passi; un trascinamento con una pausa è un passo; annullare dopo che un altro ha votato lo stesso oggetto funziona e non tocca il voto.
365. **Compatibilità**: una lavagna 0.4, creata prima del Blocco M, si apre uguale, con i suoi voti, e si modifica.
366. **Misure**: `node prove/controlli.js` termina con "OK" e `node prove/carico.js 1000` rispetta i limiti di M7.

## Correzioni e aggiunte ai blocchi del piano

### A4 - Preparazione

367. **File e ordine** (piano 33, 34) - chiarimento: aggiungi `js/modello.js` dopo `js/base.js`. Ordine completo: `js/sync.js`, `js/base.js`, `js/modello.js`, `js/template.js`, `js/scegli-template.js`, `js/guida.js`, `js/oggetti.js`, `js/connettori.js`, `js/selezione.js`, `js/collabora.js`, `js/presenta.js`, `js/pannelli.js`, `js/export.js`, `js/lavagna.js`, `js/app.js`.
368. **Tavolozze subito** (piano 151-153) - correzione: `I.COLORI` esteso, `I.TRATTI` e `I.TINTE` si definiscono nel Blocco A in `js/template.js`: servono già a D (colore delle linee, piano 80) e a E (barra di selezione), che vengono prima di F.
369. **`sw.js`** - chiarimento: il commento in testa dice "generato da tools/build.py"; sostituiscilo con "aggiornato a mano: l'elenco è verificato da prove/controlli.js".
370. **Misura di partenza** - aggiunta: prima della suddivisione del piano 32 esegui `node prove/carico.js 300` e `node prove/carico.js 1000` e annota i valori.

### C11 - Accesso e dati di prova

371. **Vecchi esempi nel cestino** (piano 72, primo passo) - correzione: non cancellare `i-nomi` e `i-retro`; mettili nel cestino del loro proprietario, così chi li aveva modificati li ritrova [punto aperto 434]: `await D._mutaTab('documenti', (t) => { ['i-nomi', 'i-retro'].forEach((k) => { if (t[k] && !t[k].eliminato) t[k].eliminato = U.ora(); }); });`
372. **Codici condivisi tra schede** (piano 53) - correzione: `codiciInviati` in memoria si perde ricaricando la pagina al passo del codice, e il link dell'email non funziona se aperto in un'altra scheda. Tienilo nella tabella `codici` (`D._mutaTab('codici', ...)`), come farà il server.
373. **Dati al sicuro in prova** (nucleo 0.5) - aggiunta: dopo il primo accesso chiama `navigator.storage.persist()` (se esiste, ignorando l'esito) e in Impostazioni mostra "Spazio usato su questo dispositivo: 12,40 MB" da `navigator.storage.estimate()`. In prova tutti i dati vivono nel browser, che può liberare spazio da solo.

### D7 - Rilascio sul corpo di un oggetto e lato automatico - correzione e aggiunta

374. **Problema** (riprodotto): `connectionRadius` vale attorno ai pallini; al centro di un oggetto di 300 px lo stato della connessione dice `isValid: null` e `toNode: null`. Con il piano 94 nasce un'ancora sopra l'oggetto.
375. **Nuova regola di `onConnectEnd`** (sostituisce il piano 94; il riconoscimento dell'oggetto sotto il puntatore è provato):

```js
const inizioLinea = useRef(null);
const onConnectStart = (ev) => { const p = ev.touches ? ev.touches[0] : ev; inizioLinea.current = { x: p.clientX, y: p.clientY }; };
const onConnectEnd = (ev, st) => {
  if (!ed || st.isValid || !st.fromNode) return;
  const p = ev.changedTouches ? ev.changedTouches[0] : ev, i = inizioLinea.current || p;
  if (Math.hypot(p.clientX - i.x, p.clientY - i.y) < 6) return aggiuntaRapida(st.fromNode.id, st.fromHandle.id);            /* clic sul pallino: D9 */
  const el = document.elementFromPoint(p.clientX, p.clientY), nd = el && el.closest('.react-flow__node'), sotto = nd && M.oggetti.leggi(nd.dataset.id);
  if (sotto && sotto.id !== st.fromNode.id && !['cornice', 'ancora', 'disegno'].includes(sotto.tipo)) return collega(st.fromNode.id, st.fromHandle.id, sotto.id, 'auto');
  lineaVersoAncora(st, p);                                                                                                   /* rilascio nel vuoto: piano 94 */
};
```

376. **Lato automatico**: `daH` e `aH` possono valere `'auto'`: la linea esce dal lato rivolto verso l'altro oggetto e lo cambia da sola quando gli oggetti si spostano, come in Miro. Rilascio sul corpo = `'auto'`; rilascio su un pallino = lato fisso, come oggi.
377. **Calcolo** (provato): il lato si decide nell'elenco degli archi passato a React Flow, così punte, riaggancio e anteprima restano quelli della libreria. Gli archi senza `'auto'` e quelli il cui lato non cambia restano lo stesso oggetto.

```js
/* lato automatico: il lato del rettangolo a da cui esce la linea verso il centro di b */
I.latoAuto = (a, b) => { const dx = (b.x + b.w / 2) - (a.x + a.w / 2), dy = (b.y + b.h / 2) - (a.y + a.h / 2); return Math.abs(dx) * a.h >= Math.abs(dy) * a.w ? (dx >= 0 ? 'r' : 'l') : (dy >= 0 ? 'b' : 't'); };
/* dentro Lavagna */
const ultimi = useRef(new Map());
const archiVivi = useMemo(() => {
  const per = new Map(nodi.map((n) => [n.id, n])), r = (n) => ({ x: n.position.x, y: n.position.y, w: n.width || (n.measured || {}).width || 0, h: n.height || (n.measured || {}).height || 0 });
  return archi.map((a) => {
    const e = a.data; if (e.daH !== 'auto' && e.aH !== 'auto') return a;
    const s = per.get(e.da), t = per.get(e.a); if (!s || !t) return a;
    const sh = e.daH === 'auto' ? I.latoAuto(r(s), r(t)) : e.daH, th = e.aH === 'auto' ? I.latoAuto(r(t), r(s)) : e.aH, u = ultimi.current.get(a.id);
    if (u && u.base === a && u.sh === sh && u.th === th) return u.arco;
    const arco = Object.assign({}, a, { sourceHandle: sh, targetHandle: th }); ultimi.current.set(a.id, { base: a, sh, th, arco }); return arco;
  });
}, [archi, nodi]);
```

378. **`arco()`** (piano 82): resta com'è, ma con `sourceHandle` e `targetHandle` sempre validi: per `'auto'` passa `'t'`, poi li corregge `archiVivi`. A `ReactFlow` va `edges=${archiVivi}`.
379. **Riaggancio** (piano 92, 95): su un pallino l'estremità diventa fissa; sul corpo di un oggetto diventa `'auto'`; nel vuoto nasce l'ancora.

### D8 - Spostare una linea libera - aggiunta (da provare)

380. **Comportamento**: trascinando il corpo di un connettore che ha almeno un'ancora si spostano le sue ancore: in Miro una linea libera si sposta tutta. In `I.Connettore` un tracciato trasparente largo 18 px con `onPointerDown` (solo con `ed` e ancore non bloccate) cattura il puntatore e sposta le ancore dello scarto diviso per lo zoom, con `M.inizioGesto()` e poi `M.gesto`.

### D9 - Aggiunta rapida dal pallino - aggiunta

381. **Comportamento** (come i pallini di Miro): un clic su un pallino di un post-it o di una forma, senza trascinare, crea un oggetto uguale e vuoto (stesso tipo, misura, colore e forma) a 80 px in quella direzione, collegato con l'ultimo stile usato; il nuovo oggetto è selezionato e già in scrittura (N1). Un solo passo di annulla. Per gli altri tipi di oggetto il clic non fa nulla.
382. **Impostazione**: `connectOnClick=${false}` su `ReactFlow`, altrimenti il clic avvia la connessione "a due clic" della libreria.
383. **Perché**: flowchart, organigrammi e mappe mentali si costruiscono con clic e scrittura, senza tornare alla barra degli strumenti.

### D10 - Barra del connettore più corta - taglio

384. **Da 13 a 8 comandi** (sostituisce l'elenco del piano 87): Tipo (una tendina con le 3 voci), Inizio (tendina), Inverti, Fine (tendina), Tratto (una tendina con stile e spessore), Colore (tendina), Testo, Elimina.

### E10 - Selezione, tastiera e appunti

385. **Rimando** (piano 107) - correzione: "Salva come template" è nella sezione I6, non I8.
386. **Appunti in due tempi** (piano 126, 161) - correzione: nel Blocco E si fanno gli eventi `copy`, `cut` e `paste` per i soli appunti interni; il Blocco F estende `paste` a immagini, file, link e testo.
387. **Tasti indipendenti dalla tastiera** (piano 131) - correzione: Maiusc+1 e Maiusc+2 si riconoscono con `e.code` (`Digit1`, `Digit2`), perché sulla tastiera italiana `e.key` vale `!` e `"`; per lo zoom accetta anche `NumpadAdd` e `NumpadSubtract`.
388. **Selezione multipla sul tocco** (piano 104) - correzione (meccanismo provato): con `tocco` vero il piano lascia solo Mano e Maiusc, quindi niente gruppi né allineamento su tablet. Aggiungi nella barra strumenti, solo sul tocco, l'interruttore "Più oggetti": attivo, ogni tocco su un oggetto lo aggiunge o lo toglie dalla selezione. Si ottiene con `XY.useStoreApi().setState({ multiSelectionActive: true })`; si spegne con Esc, toccando il vuoto o cambiando strumento.
389. **Appunti leggibili fuori da iris** (piano 161) - correzione (da provare in Chrome, Firefox e Safari): il solo marcatore `iris-appunti:<id>` comparirebbe come testo a chi incolla in un'email. Invece:
    - `text/plain` = i testi degli oggetti copiati, uno per riga;
    - `text/html` = `<span data-iris-appunti="ID"></span>` seguito dagli stessi testi in paragrafi;
    - in `paste` si cerca `data-iris-appunti` nell'HTML: se l'id coincide con quello in `localStorage` si incolla il contenuto interno, altrimenti si segue il piano 161.
390. **Appunti grandi** (piano 126) - correzione: la scrittura in `localStorage` va in `try/catch`; se lo spazio non basta gli appunti restano in memoria, con il toast "Appunti troppo grandi: si possono incollare solo in questa scheda".
391. **Menu "Altro"** (piano 107, 133) - aggiunta: l'ultimo pulsante della barra dell'oggetto e della barra di selezione apre lo stesso menu del tasto destro. Serve su tablet e telefono, dove il tasto destro non c'è, e fa rispettare il limite di 8 comandi: nelle barre restano lo stile, Commenta, Duplica ed Elimina; Blocca, Primo piano, Sfondo, Copia e "Salva come template" vanno nel menu.
392. **Disponi in griglia** (piano 121) - aggiunta: voce in più nella tendina Allinea, con almeno 3 oggetti. Ordina per `y` e poi `x`; colonne = radice quadrata del numero di oggetti, arrotondata in su; 20 px tra gli oggetti; partenza dall'angolo in alto a sinistra della selezione; un solo passo di annulla. Rimette in ordine i post-it dopo un brainstorming con un clic.

### F13 - Oggetti

393. **Penna senza strato** (piano 163, 166) - correzione (provata): uno strato sopra la lavagna ferma la rotellina. Con Penna, Evidenziatore o Gomma attivi passa a `ReactFlow` `panOnDrag=${[1, 2]}`, `selectionOnDrag=${false}`, `nodesDraggable=${false}`, `elementsSelectable=${false}`, `nodesConnectable=${false}`; su `.lav` un `onPointerDownCapture` che, se il bersaglio è dentro `.react-flow__renderer` e il tasto è il sinistro, fa `setPointerCapture` e comincia il tratto; `pointermove` e `pointerup` sullo stesso contenitore. Rotellina e tasto centrale continuano a funzionare. Cursore: `.lav.disegna .react-flow__pane, .lav.disegna .react-flow__node { cursor: crosshair !important; }`.
394. **Anteprima del tratto** - chiarimento: un `<path>` dentro `ViewportPortal`, aggiornato con `setAttribute('d', ...)` tramite `ref`: nessuno stato React per ogni punto.
395. **Disegno sul tocco** - chiarimento (da provare su un dispositivo vero): in modalità disegno `panOnDrag=${false}`; lo zoom resta sui pulsanti della barra dello zoom.
396. **Disegni che non coprono** (piano 164, 166) - correzione (provata): il nodo `disegno` riceve i clic solo sul tratto, non su tutto il riquadro. Aggiungi al disegno un secondo tracciato trasparente e largo, con lo stesso `d`: `<path className="presa" d=${d} fill="none" stroke="transparent" strokeWidth=${Math.max(14, spessore + 8)} />`, e nel CSS `.react-flow__node-disegno { pointer-events: none !important; } .react-flow__node-disegno .presa { pointer-events: stroke; }`. La gomma cerca gli elementi `.presa` in `document.elementsFromPoint`.
397. **Tratti più leggeri** (piano 163, 164) - aggiunta (provata): al rilascio semplifica i punti con `I.semplificaTratto(punti, 0.75 / zoom)` prima di salvarli; nella prova un tratto di 601 punti scende a 49. Il limite di 3.000 punti del piano resta per la raccolta, dopo la semplificazione non ne servono più di 800.

```js
/* semplifica un tratto (Ramer-Douglas-Peucker): p = [[x, y], ...], tol in unità della lavagna */
I.semplificaTratto = (p, tol) => {
  if (p.length < 3) return p;
  const tieni = new Uint8Array(p.length), pila = [[0, p.length - 1]]; tieni[0] = tieni[p.length - 1] = 1;
  while (pila.length) {
    const [a, b] = pila.pop(), ax = p[a][0], ay = p[a][1], dx = p[b][0] - ax, dy = p[b][1] - ay, l2 = dx * dx + dy * dy; let max = 0, k = -1;
    for (let i = a + 1; i < b; i++) { const t = l2 ? Math.max(0, Math.min(1, ((p[i][0] - ax) * dx + (p[i][1] - ay) * dy) / l2)) : 0, ex = p[i][0] - ax - t * dx, ey = p[i][1] - ay - t * dy, d = ex * ex + ey * ey; if (d > max) { max = d; k = i; } }
    if (k >= 0 && max > tol * tol) { tieni[k] = 1; pila.push([a, k], [k, b]); }
  }
  return p.filter((_, i) => tieni[i]);
};
```

398. **Testo che si adatta** (piano 149) - correzione (provata): la discesa di 1 px alla volta costa fino a 12 misure per ogni post-it a ogni apertura. Usa la ricerca binaria con memoria: al massimo 4 misure, nessuna se il testo è già stato visto. Chiave: `testo + '|' + w + '|' + h + '|' + grassetto`.

```js
const memDim = new Map();
I.dimAuto = (el, chiave) => {
  if (memDim.has(chiave)) return memDim.get(chiave);
  let lo = 11, hi = 22;
  while (lo < hi) { const m = Math.ceil((lo + hi) / 2); el.style.fontSize = m + 'px'; if (el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth) lo = m; else hi = m - 1; }
  if (memDim.size > 3000) memDim.clear(); memDim.set(chiave, lo); return lo;
};
```

399. **Pesi con due decimali** (piano 154, nucleo 0.5) - correzione: `U.peso` oggi mostra un decimale ("1,2 MB"); per i megabyte usa `U.num(b / 1048576, 2)`.
400. **Scala di opinione** (piano 169-172) - chiarimento: le risposte stanno nella mappa `risposte` (M2).
401. **Backup** (piano 177) - chiarimento: `importaContenuto` legge con `I.modello(tmp).contenuto()` e copia `voti` e `risposte`.
402. **Apri link dal testo** - aggiunta: se il testo di un post-it, di un testo o di una forma contiene un indirizzo `http(s)`, la barra dell'oggetto mostra "Apri link" (icona `link`), con le regole del piano 158-159. Il modo di disegnare il testo non cambia.

## Blocco N - Uso rapido (nuovo, dopo F)

Sono le abitudini che fanno sembrare Miro veloce. Costano poche righe.

### N1 - Scrivere subito - aggiunta

403. **Oggetto nuovo già in scrittura**: post-it, testo e forma creati da pulsante, tasto, doppio clic sul vuoto o aggiunta rapida (D9) si aprono subito in modifica (`modTesto: id` nel contesto vivo, azzerato alla chiusura del campo); il testo nuovo nasce vuoto, non con la parola "Testo". Oggi serve un secondo doppio clic.
404. **Invio modifica**: con un solo oggetto con testo selezionato e non bloccato, Invio o F2 aprono la modifica con tutto il testo selezionato.
405. **Tab crea il prossimo post-it**: mentre si scrive in un post-it, Tab salva e crea un post-it uguale (misura e colore) 20 px a destra, già in scrittura; se lì c'è già un oggetto, va sotto il primo della riga. Ctrl+Invio salva ed esce; Esc annulla come oggi.
406. **Tabella dei tasti** (piano 131): aggiungi "Invio o F2 - modifica il testo", "Tab, mentre scrivi in un post-it - post-it successivo", "Ctrl+Invio - fine della scrittura".

### N2 - Incollare un elenco - aggiunta

407. **Un post-it per riga**: quando il testo incollato (piano 161) ha da 2 a 50 righe non vuote nasce un solo post-it, come nel piano, e il toast "Testo incollato in un post-it" offre l'azione "Un post-it per riga" (`UI.toast` con azione, già nel nucleo): lo sostituisce con un post-it per riga, in griglia da 5 colonne, in un solo passo di annulla.

### N3 - Guide di allineamento - aggiunta facoltativa (da provare) [punto aperto 433]

408. **Comportamento**: durante il trascinamento, quando un bordo o il centro del riquadro trascinato arriva a meno di 6 px a schermo da un bordo o dal centro di un oggetto visibile, la posizione si aggancia e compare una linea sottile `var(--acc)` nello strato a schermo (piano 185).
409. **Limiti per restare leggeri**: confronto solo con gli oggetti dentro la vista, al massimo 150, raccolti una volta all'inizio del trascinamento; mai con ancore e disegni; con Alt premuto niente aggancio; la guida vince sulla griglia.

### Criteri di accettazione N

410. **Brainstorming da tastiera**: N, scrivo, Tab, scrivo, Tab, scrivo, Ctrl+Invio: tre post-it in fila senza toccare il mouse.
411. **Diagramma a clic**: da una forma, tre clic sui pallini creano tre forme collegate; spostandole, le linee con lato automatico cambiano lato da sole.

## Altre correzioni ai blocchi G-L

### G8 - Collaborazione

412. **Awareness** (piano 183) - correzione: valgono i limiti di M5 (12 id oppure il riquadro; reazione azzerata dopo 3 secondi).
413. **Simulazione in un file a parte** (piano 201-204) - taglio: il codice dei collaboratori finti va in `js/simula.js`, caricato solo al primo uso con un `<script>` aggiunto dal menu Vista. Il file resta in `ASSETS` e ha come prima riga `// su richiesta`, che `prove/controlli.js` riconosce. Il codice dimostrativo non pesa sull'avvio.

### H5 - Facilitazione

414. **Chiusura alla scadenza** (piano 221) - correzione: se chi ha avviato la votazione ha chiuso la scheda, la votazione resterebbe aperta a 00:00. Allo scadere la chiude qualunque scheda con `ed`: quella di chi l'ha avviata subito, le altre dopo un'attesa a caso tra 1 e 3 secondi e solo se lo stato è ancora `'attiva'`. I risultati si calcolano dagli stessi dati, quindi due chiusure danno lo stesso esito.
415. **Voti nascosti, non segreti** (piano 220) - chiarimento: l'anonimato vale nell'interfaccia, non nei dati; la Guida dice "nascosti fino alla fine".

### I7 - Template

416. **Controllo automatico** - aggiunta: `prove/controlli.js` verifica tutte le varianti (M7); a fine blocco deve contarne 39 più la lavagna vuota.
417. **Dipendenza da F** (piano 308) - correzione: i template usano forme, etichette, tinte, emoji e scala del Blocco F (sezioni F1, F3, F4, F9, F10 del piano). Una prima consegna senza quelle sezioni non può contenere I: vedi la tabella qui sotto [punto aperto 432].

### J7 - Esportare i risultati

418. **Post-it in CSV** - aggiunta: voce "Post-it in CSV" nel menu Esporta, anche per il Lettore. Colonne: Cornice; Testo; Colore; Voti; Autore. Ordine: cornici nell'ordine del piano 272, poi `y` e `x`; i post-it fuori dalle cornici in fondo. Si scrive con `U.csvScrivi`, già nel nucleo. È il modo più rapido per portare fuori l'esito di un brainstorming o di una votazione.
419. **Lavagna in un file** - aggiunta: voce "Lavagna in un file (.json)": un backup con un solo documento, nel formato del nucleo (`{ formato: 'nautargo-backup', versione: 1, app: 'iris', data, utente, documenti: [{ documento, contenuto }] }` con `contenuto` da `esportaContenuto`), che si reimporta con "Ripristina da file", già esistente. In prova è l'unico modo per passare una sola lavagna a un'altra persona o a un altro dispositivo.

### K3 - Home

420. **Anteprime solo alla chiusura** (piano 284) - taglio: salva l'anteprima alla chiusura della lavagna, se ci sono state modifiche; niente intervallo ogni 30 secondi (piano 24).

### L6 - Chiusura

421. **Guida** (piano 295) - aggiunta ai testi:
    - `strumenti`, in coda a "come": "Invio modifica l'oggetto selezionato; mentre scrivi in un post-it, Tab crea il successivo.";
    - `connettori`, in coda a "come": "Se rilasci la linea sopra un oggetto, sceglie da sola il lato più vicino. Un clic su un pallino crea un oggetto uguale già collegato.";
    - `esporta`, in coda a "breve": "Anche i post-it in CSV e la lavagna in un file da reimportare.";
    - `voto`, campo "attenzione": "I voti nascosti si vedono alla fine: sono nascosti, non segreti."
422. **Prove finali** (piano 289) - aggiunta: `node prove/controlli.js` e `node prove/carico.js 1000`.
423. **Handoff** (piano 290) - aggiunta: sezione **Misure** con partenza e arrivo: peso del codice proprio, apertura e trascinamento con 300 e 1.000 oggetti.

## Blocchi e dipendenze (sostituisce la tabella del piano dopo il punto 26)

| Blocco | Contenuto | Dipende da | Priorità |
|---|---|---|---|
| A | Come nel piano, più tavolozze, controlli e misura di partenza (A4) | - | obbligatorio |
| M | Fondamenta leggere: dati per campi, voti in mappa, annulla, ridisegno, presenza, misure | A | obbligatorio |
| B | Logo nuovo e icone | A | alta |
| C | Accesso e profili di prova (con C11) | A | alta |
| D | Connettori e linee (con D7-D10) | M | alta |
| E | Selezione, gruppi, blocco, allineamento, appunti (con E10) | M | alta |
| F-base | Forme, stile, testo, tavolozze, emoji, scala, barra strumenti (piano F1-F4, F9-F11) | D, E | alta |
| F-file | Allegati, link, trascina e incolla, penna, backup (piano F5-F8, F12, con F13) | F-base | media |
| N | Uso rapido: N1 con F-base, N2 con F-file, N3 facoltativo | D, E | alta |
| G | Collaborazione (con G8) | M | alta |
| H | Facilitazione (con H5) | G | media |
| I | Template (con I7) | D, E, F-base | alta |
| J | Navigazione, presentazione, export (con J7) | E | media |
| K | Home (con K3) | I | bassa |
| L | Chiusura (con L6) | tutti | obbligatorio |

424. **Consegna in due tempi** (sostituisce il piano 308): se serve dividere, 0.5 = A, M, B, C, D, E, F-base, N1, G, I; 0.5.1 = F-file, N2, N3, H, J, K. Il Blocco L chiude ciascuna delle due.

## Fuori ambito, per restare leggeri

425. **Non in 0.5** (oltre al piano 307): rotazione degli oggetti; testo ricco su una parte del testo (grassetto o elenchi dentro un oggetto); trascinamento con Alt per duplicare (i connettori seguirebbero la copia sbagliata: resta Ctrl+D); `onlyRenderVisibleElements` (M4).
426. **File orfani**: eliminando un'immagine o un allegato il file resta nell'archivio, perché l'annulla e le versioni salvate possono ancora citarlo. In prova non è un problema di spazio; in fase 2 serve una pulizia sul server dei file non più citati dal documento né dalle versioni (da aggiungere al piano 304).

## Appendice 7 - `js/modello.js` (provato)

```js
/* iris - modello dati della lavagna: ogni oggetto e ogni connettore è una Y.Map di campi, così due persone che
   cambiano campi diversi dello stesso oggetto non si sovrascrivono. Le voci 0.4 (JSON intero) si leggono come
   prima e diventano Y.Map alla prima modifica. Voti e risposte stanno in mappe a parte, una chiave per persona. */
(function (N) {
  'use strict';
  const I = N.I = N.I || {}, Y = window.IrisLib.Y;
  function archivio(doc, nome) {
    const m = doc.getMap(nome), cache = new Map(), asc = new Set();
    const nuova = (o) => { const y = new Y.Map(); Object.keys(o).forEach((k) => { if (o[k] !== undefined) y.set(k, o[k]); }); return y; };
    const leggi = (id) => { if (!cache.has(id)) { const v = m.get(id); if (v === undefined) return undefined; cache.set(id, v instanceof Y.Map ? v.toJSON() : v); } return cache.get(id); };
    m.observeDeep((eventi, tr) => {
      const ids = new Set();
      eventi.forEach((ev) => { if (ev.target === m) ev.keysChanged.forEach((k) => ids.add(k)); else if (ev.path.length) ids.add(ev.path[0]); });
      ids.forEach((id) => cache.delete(id)); asc.forEach((f) => f(ids, tr.origin));
    });
    return {
      mappa: m, leggi, ha: (id) => m.has(id), tutti: () => Array.from(m.keys()).map(leggi),
      crea: (o) => { cache.delete(o.id); m.set(o.id, nuova(o)); },
      aggiorna: (id, patch) => {
        const v = m.get(id); if (v === undefined) return; cache.delete(id);
        if (!(v instanceof Y.Map)) return void m.set(id, nuova(Object.assign({}, v, patch)));
        Object.keys(patch).forEach((k) => { if (patch[k] === undefined) v.delete(k); else if (JSON.stringify(v.get(k)) !== JSON.stringify(patch[k])) v.set(k, patch[k]); });
      },
      elimina: (id) => { cache.delete(id); m.delete(id); },
      ascolta: (f) => { asc.add(f); return () => asc.delete(f); }
    };
  }
  I.modello = (doc) => {
    const oggetti = archivio(doc, 'oggetti'), connettori = archivio(doc, 'connettori'), voti = doc.getMap('voti'), risposte = doc.getMap('risposte'), sessione = doc.getMap('sessione');
    const um = new Y.UndoManager([oggetti.mappa, connettori.mappa], { trackedOrigins: new Set(['azione', 'locale']), captureTimeout: 3600000 });
    const M = {
      doc, oggetti, connettori, voti, risposte, sessione, um,
      /* un'azione dell'utente = un passo di annulla */
      azione: (fn) => { um.stopCapturing(); doc.transact(fn, 'azione'); },
      /* gesto continuo (trascinamento, ridimensionamento, frecce): inizioGesto una volta, poi gesto quante volte serve */
      inizioGesto: () => um.stopCapturing(), gesto: (fn) => doc.transact(fn, 'locale'),
      /* voti: chiave "idOggetto|idUtente"; si uniscono ai vecchi voti 0.4 rimasti nel campo voti dell'oggetto */
      vota: (id, utente, si) => doc.transact(() => { if (si) voti.set(id + '|' + utente, 1); else { voti.delete(id + '|' + utente); const o = oggetti.leggi(id); if (o && (o.voti || []).includes(utente)) oggetti.aggiorna(id, { voti: o.voti.filter((u) => u !== utente) }); } }, 'voto'),
      indiceVoti: () => { const out = {}, metti = (id, u) => { (out[id] = out[id] || new Set()).add(u); }; voti.forEach((v, k) => { const i = k.lastIndexOf('|'); metti(k.slice(0, i), k.slice(i + 1)); }); oggetti.mappa.forEach((v, id) => { ((oggetti.leggi(id) || {}).voti || []).forEach((u) => metti(id, u)); }); Object.keys(out).forEach((k) => { out[k] = Array.from(out[k]); }); return out; },
      azzeraVoti: () => doc.transact(() => { Array.from(voti.keys()).forEach((k) => voti.delete(k)); oggetti.mappa.forEach((v, id) => { if (((oggetti.leggi(id) || {}).voti || []).length) oggetti.aggiorna(id, { voti: [] }); }); }, 'voto'),
      /* contenuto in JSON semplice (template, appunti, backup, versioni) e sua riscrittura */
      contenuto: () => ({ oggetti: oggetti.tutti(), connettori: connettori.tutti() }),
      sostituisci: (c) => M.azione(() => { Array.from(oggetti.mappa.keys()).forEach(oggetti.elimina); Array.from(connettori.mappa.keys()).forEach(connettori.elimina); c.oggetti.forEach(oggetti.crea); c.connettori.forEach(connettori.crea); }),
      chiudi: () => um.destroy()
    };
    return M;
  };
})(window.N = window.N || {});
```

## Appendice 8 - `prove/controlli.js` (provato sul codice 0.4)

```js
// prove/controlli.js - controlli statici, senza browser. Uso: node prove/controlli.js  (dalla radice del repository)
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib');
const R = process.argv[2] || '.', err = [], avvisi = [], leggi = (f) => fs.readFileSync(path.join(R, f), 'utf8');
const elenca = (d) => fs.existsSync(path.join(R, d)) ? fs.readdirSync(path.join(R, d)).filter((f) => !f.startsWith('.')).map((f) => d + '/' + f) : [];
const num = (v) => v.toFixed(2).replace('.', ',');
/* 1) service worker: tutto ciò che serve all'app è in ASSETS e tutto ciò che è in ASSETS esiste */
const sw = leggi('sw.js'), assets = (sw.match(/const ASSETS = \[([\s\S]*?)\];/) || ['', ''])[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean);
const serviti = ['index.html', 'manifest.webmanifest'].concat(...['css', 'fonts', 'img', 'js', 'nucleo', 'vendor'].map(elenca));
serviti.filter((f) => !assets.includes(f)).forEach((f) => err.push('manca in ASSETS di sw.js: ' + f));
assets.filter((f) => !fs.existsSync(path.join(R, f))).forEach((f) => err.push('in ASSETS ma non esiste: ' + f));
const html = leggi('index.html'), inPagina = Array.from(html.matchAll(/(?:src|href)="([^"#]+)"/g)).map((m) => m[1]).filter((u) => !/^(https?:|data:)/.test(u));
inPagina.filter((f) => !fs.existsSync(path.join(R, f))).forEach((f) => err.push('index.html carica un file che non esiste: ' + f));
elenca('js').concat(elenca('nucleo')).filter((f) => f.endsWith('.js') && !inPagina.includes(f) && !/\/\/ su richiesta/.test(leggi(f).slice(0, 300))).forEach((f) => avvisi.push('non caricato da index.html: ' + f));
/* 2) testi e codice: caratteri vietati, indirizzi esterni, sintassi */
const sorgenti = serviti.filter((f) => /\.(js|css|html|webmanifest)$/.test(f) && !f.startsWith('vendor/')).concat(fs.readdirSync(R).filter((f) => f.endsWith('.md')));
const VIETATI = new RegExp('[' + String.fromCharCode(0x2014, 0xB7) + ']');
const PERMESSI = /^https?:\/\/(www\.w3\.org\/|localhost[:/]|([a-z]+\.)?nautargo\.com|esempio\.it)/;
sorgenti.forEach((f) => leggi(f).split('\n').forEach((riga, i) => {
  if (VIETATI.test(riga)) err.push(f + ':' + (i + 1) + ' carattere vietato (lineetta lunga o punto mediano)');
  if (!f.endsWith('.md')) (riga.match(/https?:\/\/[^\s'"`)<]+/g) || []).filter((u) => !PERMESSI.test(u)).forEach((u) => err.push(f + ':' + (i + 1) + ' indirizzo esterno: ' + u));
}));
serviti.filter((f) => f.endsWith('.js') && !f.startsWith('vendor/')).forEach((f) => { try { new vm.Script(leggi(f), { filename: f }); } catch (e) { err.push(f + ' errore di sintassi: ' + e.message); } });
/* 3) template: id unici, connettori che puntano a oggetti esistenti, valori definiti, titoli delle cornici liberi */
try {
  const N = {}, ctx = { window: { N, IrisLib: {} }, console }; ctx.window.window = ctx.window; vm.createContext(ctx); vm.runInContext(leggi('js/template.js'), ctx);
  let n = 0;
  (N.I.TEMPLATE || []).forEach((fam) => (fam.varianti || [fam]).forEach((v) => {
    n++; const dove = 'template ' + fam.id + (v === fam ? '' : '/' + v.id), t = v.fai(), ids = new Set();
    t.oggetti.forEach((o) => {
      if (ids.has(o.id)) err.push(dove + ': id doppio ' + o.id); ids.add(o.id);
      ['x', 'y', 'w', 'h'].forEach((k) => { if (!Number.isFinite(o[k])) err.push(dove + ': ' + o.id + '.' + k + ' non è un numero'); });
      Object.keys(o).forEach((k) => { if (o[k] === undefined || (typeof o[k] === 'string' && /undefined|NaN/.test(o[k]))) err.push(dove + ': ' + o.id + '.' + k + ' non definito'); });
    });
    t.connettori.forEach((e) => { if (!ids.has(e.da) || !ids.has(e.a)) err.push(dove + ': connettore ' + e.id + ' verso un oggetto che non esiste'); });
    const cor = t.oggetti.filter((o) => o.tipo === 'cornice');
    cor.forEach((a) => cor.forEach((b) => { if (a !== b && b.y >= a.y + a.h && b.y - (a.y + a.h) < 44 && b.x < a.x + a.w && a.x < b.x + b.w) err.push(dove + ': il titolo di ' + b.id + ' tocca la cornice ' + a.id + ' (spazio ' + (b.y - a.y - a.h) + ' px, minimo 44)'); }));
  }));
  console.log('template controllati: ' + n);
} catch (e) { err.push('js/template.js non si carica fuori dal browser: ' + e.message); }
/* 4) peso del codice proprio (senza vendor e font) */
const propri = serviti.filter((f) => /\.(js|css|html)$/.test(f) && !f.startsWith('vendor/')), peso = (l, gz) => l.reduce((s, f) => s + (gz ? zlib.gzipSync(fs.readFileSync(path.join(R, f)), { level: 9 }).length : fs.statSync(path.join(R, f)).size), 0);
const LIMITE_KB = 150, kb = peso(propri, true) / 1000;
console.log('codice proprio: ' + num(peso(propri) / 1000) + ' kB, compresso ' + num(kb) + ' kB (limite ' + num(LIMITE_KB) + ' kB); librerie: ' + num(peso(serviti.filter((f) => f.startsWith('vendor/')), true) / 1000) + ' kB compresse');
if (kb > LIMITE_KB) err.push('codice proprio oltre il limite: ' + num(kb) + ' kB compressi');
avvisi.forEach((a) => console.log('avviso: ' + a));
if (err.length) { console.error(err.join('\n')); console.error('ERRORI: ' + err.length); process.exit(1); }
console.log('OK');
```

## Appendice 9 - `prove/carico.js` (provato sul codice 0.4)

```js
// prove/carico.js - apertura e trascinamento su una lavagna da N oggetti. Uso: node prove/carico.js [N]  (dalla radice del repository)
/* Nessun server: i file del repository sono serviti al browser di prova dall'intercettazione delle richieste. */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const RADICE = path.resolve(process.env.IRIS_DIR || '.'), URL = 'http://localhost:8123/', N_OGG = +(process.argv[2] || 1000);
const TIPI = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', woff2: 'font/woff2', webmanifest: 'application/manifest+json' };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1360, height: 860 } });
  await ctx.route('**/*', (r) => { const u = new (require('url').URL)(r.request().url()); let f = path.join(RADICE, decodeURIComponent(u.pathname)); if (u.pathname === '/') f = path.join(RADICE, 'index.html'); if (!f.startsWith(RADICE) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, contentType: TIPI[f.split('.').pop()] || 'application/octet-stream', body: fs.readFileSync(f) }); });
  const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(e.message));
  await p.goto(URL); await p.waitForSelector('.acard'); await p.getByRole('button', { name: /Simo|Proprietario/ }).first().click(); await p.waitForSelector('.home');
  await p.evaluate(async (n) => {
    const D = window.N.D, d = await D.documenti.crea('iris', 'Carico ' + n, 'i-carico-' + n), x = await D.iris.apri(d.id), m = x.doc.getMap('oggetti'), c = x.doc.getMap('connettori'), col = Object.values(window.N.I.COLORI);
    x.doc.transact(() => { for (let i = 0; i < n; i++) { const o = { id: 'o' + i, tipo: 'postit', x: (i % 40) * 180, y: Math.floor(i / 40) * 160, w: 160, h: 140, testo: 'Idea numero ' + i + ' con un testo di media lunghezza', colore: col[i % col.length], z: i + 1, voti: [] }; m.set(o.id, o); if (i % 10 === 1) c.set('c' + i, { id: 'c' + i, da: 'o' + (i - 1), a: 'o' + i, daH: 'r', aH: 'l', testo: '' }); } }, 'azione');
    await new Promise((ok) => setTimeout(ok, 600)); x.chiudi();
  }, N_OGG);
  const t0 = Date.now(); await p.evaluate((n) => { location.hash = '#/d/i-carico-' + n; }, N_OGG);
  await p.waitForFunction((n) => document.querySelectorAll('.react-flow__node').length >= n, N_OGG, { timeout: 60000 }); const apertura = Date.now() - t0;
  await p.waitForTimeout(800);
  const conta = () => p.evaluate(() => { window.__f = []; let u = performance.now(); const g = (t) => { window.__f.push(t - u); u = t; window.__raf = requestAnimationFrame(g); }; window.__raf = requestAnimationFrame(g); });
  const leggi = () => p.evaluate(() => { cancelAnimationFrame(window.__raf); const a = window.__f.slice().sort((x, y) => x - y); return { n: a.length, mediana: Math.round(a[Math.floor(a.length / 2)]), p95: Math.round(a[Math.floor(a.length * 0.95)]), max: Math.round(a[a.length - 1]) }; });
  const box = await p.locator('.react-flow__node').first().boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await conta(); const t1 = Date.now(); await p.mouse.move(cx, cy); await p.mouse.down(); for (let i = 1; i <= 60; i++) { await p.mouse.move(cx + i * 2, cy + i); await p.waitForTimeout(16); } await p.mouse.up(); const trascina = Date.now() - t1; const f = await leggi();
  await conta(); await p.mouse.move(900, 500); for (let i = 0; i < 20; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(30); } const z = await leggi();
  const dom = await p.evaluate(() => document.querySelectorAll('.lav *').length);
  console.log(JSON.stringify({ oggetti: N_OGG, aperturaMs: apertura, trascinamentoMs: trascina, fotogrammiTrascina: f, fotogrammiZoom: z, elementiDom: dom, errori: err.slice(0, 3) }));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
```

## Note

427. **Come sono state fatte le verifiche**: Chromium senza schermo guidato da Playwright, con `vendor/iris-lib.js` del repository. I tempi dipendono dalla macchina: servono solo per confrontare prima e dopo.
428. **Non verificato in questa revisione**: comportamento su dispositivi a tocco veri (E10, F13); formati degli appunti nei tre browser (E10); ridisegno incrementale e mappatura dei lati dentro la lavagna completa (M4, D7); trascinamento della linea libera (D8); guide di allineamento (N3); regole dei browser sulla cancellazione dei dati dei siti (C11). Nessuna fonte esterna consultata: i riferimenti a Miro sono quelli già citati nel piano 306.
429. **Piano originale**: `iris-piano-0.5.md` non è nel repository; conviene aggiungerlo accanto a questo file prima di cominciare [punto aperto 431].

## Punti aperti

430. **Modello dei dati**: (a) oggetti per campi come in M1 (predefinito); (b) oggetti JSON interi come oggi, tenendo comunque M2, M3 e M4: meno lavoro, ma restano le perdite quando due persone toccano lo stesso oggetto.
431. **Forma del documento**: (a) questo file resta un'aggiunta al piano (predefinito); (b) fondere tutto in un unico piano 0.5 consolidato e rinumerato.
432. **Consegna**: (a) tutto in 0.5, come nel piano (predefinito); (b) in due tempi, come nel punto 424.
433. **Guide di allineamento (N3)**: (a) rimandate a dopo la 0.5 (predefinito); (b) già in 0.5; (c) non farle.
434. **Vecchie lavagne di esempio**: (a) nel cestino (predefinito); (b) cancellate, come nel piano 72.
435. **Limite di peso del codice proprio**: (a) 150,00 kB compressi (predefinito); (b) un altro valore.

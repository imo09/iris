# iris 0.5 - Piano dei miglioramenti (documento per l'esecuzione)

Versione di partenza: iris 0.4 (handoff del 14/11/2026). Versione di arrivo: iris 0.5. Documento del 16/11/2026.

Questo file contiene tutte le informazioni per eseguire i miglioramenti senza dover chiedere altro: contesto del codice, regole, modello dati, codice dei punti delicati, testi dell'interfaccia, criteri di accettazione. I punti sono numerati in modo continuo per poterli citare; le sezioni hanno un codice (A1, B2, ...) da usare nei rimandi.

## Come usare questo documento

1. **Ordine**: esegui i blocchi nell'ordine A, B, C, ... L. Ogni blocco termina con "Criteri di accettazione": non passare al blocco successivo finché non sono tutti verificati.
2. **Un commit per blocco**: messaggio in italiano, forma "iris 0.5 - Blocco D: connettori con tipi, estremità e stili". Se un blocco è lungo, più commit con lo stesso prefisso.
3. **Decisioni già prese**: dove il documento dice "fai così", non cercare alternative. Dove trovi "[punto aperto N]" (N è il numero del punto nella sezione Punti aperti), applica il valore predefinito indicato e prosegui; la decisione finale è nei Punti aperti in fondo.
4. **Se qualcosa non torna**: se il codice reale differisce da quanto descritto qui (nomi, righe, firme), adatta l'intervento allo spirito del punto e annota la differenza nel file di handoff (L5). Non inventare dati, testi legali o configurazioni esterne.
5. **Prove dopo ogni blocco**: avvia il server locale (A2), esegui lo script di prova (Appendice 4), controlla che la console del browser non mostri errori, prova con due schede aperte su utenti diversi.

## Contesto del codice (stato 0.4)

6. **Che cos'è iris**: lavagna collaborativa (stile Miro) di nautargo, PWA statica pubblicata su GitHub Pages con dominio `iris.nautargo.com` (file `CNAME`). Nessun passaggio di build: i file del repository sono quelli serviti.
7. **Librerie**: tutte in `vendor/iris-lib.js` (pacchetto già compilato, da NON modificare): React 18.3.1, `@xyflow/react` v12 (React Flow, esporta anche `EdgeToolbar`, `EdgeLabelRenderer`, `BaseEdge`, `getStraightPath`, `getBezierPath`, `getSmoothStepPath`, `SelectionMode`, `ConnectionLineType`, `NodeToolbar` con `nodeId` anche array, `reconnectEdge`, `useOnViewportChange`), Yjs (`Y`), `y-indexeddb` (`IndexeddbPersistence`), `y-protocols/awareness` (`awareness`), `htm` (JSX senza build), `html-to-image` (`toPng`, `toJpeg`). Accesso: `window.IrisLib`.
8. **Divieto di nuove librerie**: non si possono aggiungere dipendenze (manca lo strumento di build) né caricare script o font da CDN (l'app deve funzionare offline e non deve chiamare servizi esterni). Tutto si scrive a mano con quello che c'è.
9. **Struttura dei file**:

| File | Ruolo |
|---|---|
| `index.html` | carica CSS e script nell'ordine; schermata di avvio |
| `sw.js` | service worker: `VERSION` e `ASSETS` (elenco file in cache) |
| `manifest.webmanifest` | manifest PWA e icone |
| `nucleo/util.js` | utilità (`N.U`): uid, date, numeri, file, colori persona |
| `nucleo/kv.js` | archivio chiave/valore su IndexedDB (`N.KV`) e canale tra schede (`N.Canale`) |
| `nucleo/dati.js` | strato dati (`N.D`), adattatore "prova" che simula il server con le regole dei ruoli |
| `nucleo/ui.js` | icone (`UI.ico`), avatar, toast, modali, menu (`N.UI`) |
| `nucleo/aiuto.js` | icone "i" e Guida (`N.Aiuto`), capitoli comuni |
| `nucleo/shell.js` | guscio: accesso, home, barra superiore, profilo, rubrica, condivisione, backup (`N.Shell`) |
| `nucleo/stile.css` | stile comune nautargo (variabili colore, pulsanti, accesso, modali) |
| `js/sync.js` | apertura del documento Yjs della lavagna: IndexedDB + BroadcastChannel + awareness |
| `js/template.js` | colori (`I.COLORI`) e 6 template |
| `js/guida.js` | capitoli della Guida di iris |
| `js/lavagna.js` | tutta la lavagna (circa 340 righe): nodi, connettori, cursori, pannelli, votazione, export |
| `js/app.js` | configurazione del guscio, logo, dati di prova (`semina`), backup del contenuto |
| `css/iris.css` | stile della lavagna |

10. **Il nucleo è condiviso con zeno**: `nucleo/*` è lo stesso codice usato dall'app zeno (handoff 0.4: "sorgente unico"). Ogni modifica al nucleo va marcata con il commento `/* nucleo 0.5: <motivo> */` e riportata nell'elenco "Modifiche al nucleo" dell'handoff (L5), così si può replicare in zeno [punto aperto 310].
11. **Modello dati della lavagna**: un documento Yjs per lavagna con due mappe: `oggetti` (id -> oggetto JSON intero) e `connettori` (id -> connettore JSON). Un aggiornamento sostituisce l'intero oggetto (`oggetti.set(id, {...o, ...patch})`). Origini delle transazioni: `'azione'` (azioni utente, annullabili), `'locale'` (trascinamento, annullabile, non ridisegna la scheda che lo genera).
12. **Oggetti esistenti**: `postit`, `testo`, `forma` (rett, ellisse, rombo), `immagine` (file nello strato dati), `cornice` (porta con sé gli oggetti contenuti quando si trascina dal titolo). Campi: `id, tipo, x, y, w, h, testo, colore, z, voti[], forma, dim, file`.
13. **Connettori esistenti**: `{ id, da, a, daH, aH, testo }`, disegnati come `smoothstep` grigio con freccia piena alla fine. Nessuna opzione di stile.
14. **Ruoli** (per documento): `proprietario`, `editor`, `lettore`. Il Lettore vede, esporta e commenta (i commenti sono fuori dal documento Yjs, in `D.iris.commenti`), ma non modifica. Nella lavagna `ed = ruolo !== 'lettore'`.
15. **Tempo reale in prova**: tra schede dello stesso browser con `BroadcastChannel` (`js/sync.js`, classe `ProviderSchede`); l'awareness porta già `utente` e `cursore`. Ogni scheda può essere un utente diverso perché la sessione è in `sessionStorage`. In fase 2 lo stesso ruolo lo farà un provider Supabase: il resto non cambia.
16. **Utenti di prova** (seminati da `D.semina` nel nucleo): `p-simo` (Simo), `p-giulia` (Giulia Rinaldi), `p-marco` (Marco Ferri). Le lavagne di esempio sono seminate da `semina` in `js/app.js`.
17. **Convenzioni di codice**: moduli IIFE `(function (N) { 'use strict'; ... })(window.N = window.N || {});`, nomi in italiano, template ``html`...` `` con `className`, nessun JSX, nessun `import`. Stile compatto come il codice esistente.

## Regole generali di implementazione

18. **Lingua e tipografia dell'interfaccia**: tutti i testi in italiano. Vietati la lineetta lunga (carattere U+2014) e il punto mediano (U+00B7): usa " - ". Numeri decimali con la virgola (es. "1,50 MB"), usa `U.num` e `U.peso`.
19. **Compatibilità con le lavagne esistenti**: ogni campo nuovo ha un valore predefinito; un oggetto o connettore senza il campo deve comportarsi come oggi. Mai migrazioni distruttive.
20. **Permessi**: ogni comando che modifica il documento è visibile e attivo solo se `ed` è vero; gli oggetti bloccati (E4) non si modificano. Il Lettore deve poter navigare, seguire, vedere i cursori, reagire, commentare, cercare, presentare ed esportare.
21. **Origini Yjs**: azioni utente `'azione'` (annullabili); trascinamenti `'locale'`; voti `'voto'`; stato di sessione (timer, votazione) `'sessione'`. Solo `'azione'` e `'locale'` sono tracciate dall'annulla e aggiornano la data di modifica (`js/sync.js` lo fa già filtrando le origini: non cambiarlo).
22. **Niente codice remoto e niente apertura di file caricati nella stessa origine**: gli allegati si scaricano (attributo `download`), non si aprono con `blob:` in una nuova scheda (rischio di esecuzione di HTML caricato). Le immagini si mostrano solo con `<img>`.
23. **Accessibilità minima**: ogni pulsante solo icona ha `title` e `aria-label`; i menu si chiudono con Esc; i comandi da tastiera non scattano mentre si scrive in un campo (`INPUT`, `TEXTAREA`, `SELECT`, `contenteditable`) o con una modale aperta (`.mfondo`).
24. **Prestazioni**: aggiornamenti di awareness al massimo ogni 40 ms (cursore) o 150 ms (vista); niente calcoli pesanti a ogni render (usa `useMemo`); nessun intervallo attivo quando non serve.
25. **Stile visivo**: usa le variabili di `nucleo/stile.css` (`--sup`, `--fg`, `--muted`, `--line`, `--acc`, `--ombra`, ...), così il tema scuro funziona da solo. Raggio 8-12 px, ombre `var(--ombra)`, font `var(--f)`.
26. **Dopo ogni file nuovo**: aggiungilo in `index.html` (nell'ordine indicato in A3) e in `ASSETS` di `sw.js`; cambia `VERSION` in `sw.js` a ogni pubblicazione (formato `iris-0.5-aaaammgg-n`).

## Blocchi e dipendenze

| Blocco | Contenuto | Dipende da | Priorità |
|---|---|---|---|
| A | Preparazione, server locale, script di prova, suddivisione di `lavagna.js` | - | obbligatorio |
| B | Logo nuovo e icone | A | alta |
| C | Accesso (codice da noreply@nautargo.com) e profili di prova per ruolo | A | alta |
| D | Connettori: tipi, estremità, stili, spessori, colori, linee libere | A | alta |
| E | Selezione multipla, gruppi, blocco, allineamento, appunti, scorciatoie | A | alta |
| F | Oggetti nuovi e stile: forme, testo, allegati, link, penna, emoji, scala di opinione | D, E | alta |
| G | Collaborazione: cursori multipli, selezioni altrui, segui, porta tutti qui, simulazione | A | alta |
| H | Facilitazione: timer, votazione condivisa, reazioni | G | media |
| I | Template: libreria a categorie con varianti, scelta, inserimento in blocco | D, E, F | alta |
| J | Navigazione e presentazione: zoom, cornici, presentazione, cerca, PDF multipagina | E | media |
| K | Home: template in evidenza, anteprime delle lavagne (facoltativo) | I | bassa |
| L | Guida, dati di prova, pubblicazione, handoff | tutti | obbligatorio |

## Blocco A - Preparazione

### A1 - Ramo e verifica iniziale

27. **Ramo**: lavora su un ramo dedicato (mai direttamente su `main`, che è pubblicato).
28. **Fotografia iniziale**: prima di toccare il codice apri l'app, entra come Simo, apri "Nomi per la nuova app" e fai uno screenshot: servirà per confrontare che la suddivisione (A3) non cambi nulla.

### A2 - Server locale

29. **Avvio**: dalla radice del repository `python3 -m http.server 8123`, poi apri `http://localhost:8123/`. Il service worker si registra solo in https, quindi in locale non ci sono cache da svuotare.
30. **Dati puliti**: per ripartire da zero usa una finestra anonima o, nella console, `indexedDB.databases().then(l => l.forEach(d => indexedDB.deleteDatabase(d.name)))` e ricarica.
31. **Script di prova**: crea `prove/fumo.js` con il contenuto dell'Appendice 4 (Playwright è disponibile con `require('playwright')`). La cartella `prove/` non va in `sw.js`.

### A3 - Suddivisione di `js/lavagna.js` (nessun cambiamento visibile)

32. **Obiettivo**: `lavagna.js` crescerà molto; prima di aggiungere funzioni dividilo in moduli. Il comportamento deve restare identico.
33. **Nuovi file e contenuto**:

| File | Contenuto spostato o nuovo |
|---|---|
| `js/base.js` | `I.html` (htm legato a React), `I.Ctx` (createContext), `I.Ico`, `I.Info`, `I.useFile` e `cacheFile` (come `I.cacheFile`), `I.b64`, `I.deb64`, `I.pref(chiave, predefinito)` e `I.salvaPref(chiave, valore)` su `localStorage` con try/catch, `I.normalizza(testo)` (minuscolo senza accenti: `s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()`) |
| `js/oggetti.js` | `Maniglie`, `TestoMod`, `Segni`, `Ridim`, tutti i tipi di nodo e `I.TIPI` |
| `js/connettori.js` | per ora vuoto con la struttura IIFE; nel Blocco D conterrà `Connettore`, marcatori e barra |
| `js/selezione.js` | per ora vuoto; nel Blocco E: gruppi, blocco, allineamento, appunti, tastiera |
| `js/collabora.js` | `Cursori` (spostato); nel Blocco G e H: presenza, segui, timer, votazione, reazioni |
| `js/presenta.js` | per ora vuoto; nel Blocco J: barra zoom, pannello cornici, presentazione, cerca |
| `js/pannelli.js` | `PannelloCommenti`, `PannelloVoti`, `PannelloVersioni`, `BarraOggetto` |
| `js/export.js` | `pdfDaJpeg` (che diventa `pdfDaPagine`, J6) e la funzione `esporta` resa indipendente: `I.esporta({ rf, wrap, info, formato, cornice })` |
| `js/lavagna.js` | resta il componente `Lavagna` e `I.apriLavagna` |

34. **Ordine di caricamento in `index.html`** (dopo i file del nucleo, che restano invariati salvo `nucleo/config.js` del Blocco C): `js/sync.js`, `js/base.js`, `js/template.js`, `js/guida.js`, `js/oggetti.js`, `js/connettori.js`, `js/selezione.js`, `js/collabora.js`, `js/presenta.js`, `js/pannelli.js`, `js/export.js`, `js/lavagna.js`, `js/app.js`.
35. **Regola dei moduli**: ogni file legge le dipendenze all'avvio (`const I = N.I, html = I.html, L = window.IrisLib, React = L.React, XY = L.XY;`) e pubblica ciò che serve su `N.I`. Le componenti usate da altri file si leggono al momento del render (``html`<${I.Cursori} .../>` ``), così l'ordine di caricamento conta solo per `base.js`.
36. **Versione**: in `js/app.js` porta `versione: '0.4'` a `'0.5'`; in `sw.js` aggiorna `VERSION` e `ASSETS`.

### Criteri di accettazione A

37. **Identità**: l'app si comporta esattamente come prima (stessi oggetti, cursori tra schede, commenti, votazione, versioni, export PNG e PDF); confronto con lo screenshot di A1.
38. **Console pulita**: nessun errore in console all'avvio, all'apertura di una lavagna e durante l'uso.
39. **Script**: `node prove/fumo.js` termina con "OK".

## Blocco B - Logo

### B1 - Scelta e motivazione

40. **Richiesta**: tenere i due quadrati colorati, togliere la linea che li unisce, rendere il marchio più professionale e finito.
41. **Soluzione adottata (variante A)**: due quadrati uguali con angoli arrotondati, sovrapposti in diagonale e centrati otticamente nella piastrella scura; la zona di sovrapposizione ha un terzo colore chiaro (crema `#F6EFDD`), come due luci colorate che sommate danno luce. Richiama il nome (l'iride regola la luce) e l'idea di due persone che mettono insieme le idee. Geometria su griglia 32: quadrati 12x12, raggio 3, origini (7,7) e (13,13), ingombro 7-25 centrato su 16. Nessuna maschera (`clipPath`): la sovrapposizione è un tracciato, così il logo può comparire più volte nella stessa pagina senza id duplicati. Anteprima: `docs/logo-iris-proposta.png`; confronto delle varianti: `docs/logo-iris-varianti.png` [punto aperto 311].
42. **Colori**: piastrella Inchiostro `#0E1D2A`, quadrato Ottone chiaro `#E8A867`, quadrato Verderame chiaro `#9FCFC6`, sovrapposizione Crema `#F6EFDD`. Sono i colori già del marchio nautargo.

### B2 - File SVG

43. **`img/favicon.svg`** (icona standard, piastrella arrotondata):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0E1D2A"/><rect x="7" y="7" width="12" height="12" rx="3" fill="#E8A867"/><rect x="13" y="13" width="12" height="12" rx="3" fill="#9FCFC6"/><path d="M16 13h3v3a3 3 0 0 1-3 3h-3v-3a3 3 0 0 1 3-3z" fill="#F6EFDD"/></svg>
```

44. **`img/maskable.svg`** (Android adattiva: fondo pieno, marchio ridotto all'80% dentro la zona sicura):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0E1D2A"/><g transform="translate(3.2 3.2) scale(.8)"><rect x="7" y="7" width="12" height="12" rx="3" fill="#E8A867"/><rect x="13" y="13" width="12" height="12" rx="3" fill="#9FCFC6"/><path d="M16 13h3v3a3 3 0 0 1-3 3h-3v-3a3 3 0 0 1 3-3z" fill="#F6EFDD"/></g></svg>
```

45. **Icona Apple** (sorgente per `img/apple-touch-icon.png`, non serve salvarla come file): come `favicon.svg` ma con `<rect width="32" height="32" fill="#0E1D2A"/>` senza `rx` (iOS arrotonda da solo).
46. **Logo in pagina (`LOGO` in `js/app.js`)**: stesso contenuto di `favicon.svg` con `class="logo"` e `aria-hidden="true"`; la piastrella diventa `<rect class="lt" x=".5" y=".5" width="31" height="31" rx="7.5" fill="#0E1D2A"/>` per poter avere un bordo sottile nel tema scuro. In `nucleo/stile.css`: `[data-tema=scuro] .logo .lt { stroke: rgba(233, 237, 236, .16); stroke-width: 1; }` (nucleo 0.5: logo leggibile su fondo scuro; non tocca zeno, che non usa la classe `lt`).
47. **Icona documento (`ICO_DOC` in `js/app.js`)**: allineala al nuovo marchio, senza linea: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="4" y="4" width="10" height="10" rx="2.5"/><rect x="10" y="10" width="10" height="10" rx="2.5"/></svg>`.

### B3 - Icone PNG

48. **Da rigenerare**: `img/icon-192.png` (192, da favicon), `img/icon-512.png` (512, da favicon), `img/icon-maskable-512.png` (512, da maskable), `img/apple-touch-icon.png` (180, da icona Apple). Usa lo script seguente (salvalo fuori dal repository o in `prove/`):

```js
// prove/icone.js - uso: node prove/icone.js  (dalla radice del repository)
const { chromium } = require('playwright'); const fs = require('fs');
const fav = fs.readFileSync('img/favicon.svg', 'utf8'), mask = fs.readFileSync('img/maskable.svg', 'utf8');
const apple = fav.replace('rx="8" fill="#0E1D2A"', 'fill="#0E1D2A"');
const lista = [['img/icon-192.png', fav, 192], ['img/icon-512.png', fav, 512], ['img/icon-maskable-512.png', mask, 512], ['img/apple-touch-icon.png', apple, 180]];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const [file, svg, n] of lista) {
    await p.setViewportSize({ width: n, height: n });
    await p.setContent('<html><body style="margin:0;background:transparent">' + svg.replace('<svg ', '<svg width="' + n + '" height="' + n + '" ') + '</body></html>');
    await p.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: n, height: n } });
  }
  await b.close(); console.log('icone rigenerate');
})();
```

49. **Manifest**: nessuna modifica ai percorsi; `theme_color` e `background_color` restano `#0E1D2A`.

### Criteri di accettazione B

50. **Ovunque**: logo nuovo nella schermata di avvio, nell'accesso, nella barra superiore, nella scheda del browser (favicon) e nelle icone installate. Nessuna linea tra i quadrati.
51. **Leggibilità**: a 16 px si distinguono i due quadrati; nel tema scuro la piastrella ha il bordo sottile.

## Blocco C - Accesso e profili di prova

### C1 - Configurazione centrale (`nucleo/config.js`, nuovo)

52. **Contenuto** (caricato subito dopo `nucleo/util.js`, aggiunto a `index.html` e `sw.js`):

```js
/* nucleo 0.5: configurazione comune; il mittente delle email di accesso è deciso (punto 372 delle istruzioni 0.4) */
(function (N) {
  'use strict';
  N.CONFIG = {
    mittente: 'noreply@nautargo.com', nomeMittente: 'nautargo',
    codice: { cifre: 6, durataMin: 10, attesaSec: 60, tentativi: 5 }
  };
})(typeof window !== 'undefined' ? (window.N = window.N || {}) : (globalThis.N = globalThis.N || {}));
```

### C2 - Strato dati (`nucleo/dati.js`, `D.accesso`)

53. **Codici con scadenza, attesa e tentativi**: `codiciInviati[email]` diventa `{ codice, link, scade, inviato, tentativi }` con `link = U.codice(24)` e `scade = Date.now() + durataMin * 60000`.
54. **`inviaCodice(email)`**: valida l'email come oggi; se esiste un codice inviato da meno di `attesaSec` lancia `errore('attesa', 'Puoi chiedere un nuovo codice tra ' + s + ' secondi')` con `e.attesa = s`; altrimenti genera il codice (sostituisce il precedente) e restituisce `{ inviato: true, mittente, durataMin, attesaSec, codiceProva, linkProva }` (gli ultimi due solo in modalità prova).
55. **`verificaCodice(email, codice)`**: nessun codice -> `'Nessun codice attivo per questa email: chiedine uno nuovo'`; scaduto -> elimina e `'Codice scaduto: chiedine uno nuovo'`; errato -> `tentativi++`, se `tentativi >= 5` elimina e `'Troppi tentativi: chiedi un nuovo codice'`, altrimenti `'Codice errato: ' + (restanti === 1 ? 'resta 1 tentativo' : 'restano ' + restanti + ' tentativi')`; giusto -> elimina ed entra (`_entra`).
56. **`verificaLink(token)`** (nuova): cerca il record con `link === token` non scaduto; se c'è, entra; altrimenti `'Il link non è più valido: chiedi un nuovo codice'`.
57. **Fase 2**: nell'adattatore Supabase le stesse funzioni chiameranno `signInWithOtp` e `verifyOtp` (Appendice 6); i messaggi d'errore restano questi, mappati dai codici del server (429 -> attesa).

### C3 - Schermata di accesso (`nucleo/shell.js`, `Shell.accesso`)

58. **Struttura della scheda** (larghezza massima 420 px, centrata):
    1. marchio (logo 48 px + "iris" + piccolo "nautargo") e motto;
    2. passo corrente (email oppure codice);
    3. solo in modalità prova: divisore "oppure prova senza email" e i pulsanti di ruolo (C5);
    4. piede: "nautargo - modalità prova: i dati restano su questo dispositivo" (in produzione: "nautargo - accesso sicuro con codice via email").
59. **Passo 1, email**: etichetta "La tua email"; campo `type="email"`, `autocomplete="email"`, precompilato con l'ultima email usata (`localStorage['np:ultimaEmail']`); sotto il campo il testo piccolo "Ti mandiamo un codice di 6 cifre da noreply@nautargo.com" (mittente letto da `N.CONFIG`); pulsante primario a tutta larghezza "Ricevi il codice". Durante l'invio il pulsante mostra "Invio in corso..." ed è disattivato.
60. **Passo 2, codice**: testo "Abbiamo mandato il codice a **email** da **noreply@nautargo.com**. Se non lo trovi, controlla Spam o Promozioni." Campo unico per il codice: `inputmode="numeric"`, `autocomplete="one-time-code"`, `maxlength="6"`, carattere monospazio 26 px, spaziatura lettere 0,40em, centrato; a ogni digitazione tieni solo le cifre; a 6 cifre invia da solo. Riga piccola "Il codice vale 10 minuti". Pulsante primario "Entra". Sotto: pulsante testuale "Invia di nuovo" disattivato con conto alla rovescia "Invia di nuovo tra 42 s" (da `attesaSec`), poi attivo; pulsante testuale "Usa un'altra email".
61. **Riquadro prova nel passo 2** (solo modalità prova): "Modalità prova: l'email non parte. Il codice è **123456**." con due pulsanti piccoli "Inserisci il codice" (compila e invia) e "Apri il link dell'email" (va a `#/accesso/<linkProva>`).
62. **Errori**: sotto il campo interessato, in rosso (`var(--bad)`), con `role="alert"`; il campo prende il fuoco. Dopo "Troppi tentativi" o "Codice scaduto" il pulsante "Invia di nuovo" si attiva subito.
63. **Nuovo utente**: dopo il primo accesso resta la richiesta del nome ("Come ti chiami?") già presente; salva l'email in `np:ultimaEmail`.

### C4 - Link dell'email (`#/accesso/<token>`)

64. **Rotta**: in `Shell.disegna`, se l'utente non è entrato e la rotta è `accesso`, chiama `D.accesso.verificaLink(id)`; se riesce entra (stesso percorso di `entrato`), altrimenti mostra la schermata di accesso con l'errore in alto. Se l'utente è già entrato, la rotta porta alla home.

### C5 - Profili di prova: un pulsante per ruolo

65. **Richiesta**: scegliere il profilo di prova con un unico pulsante per ogni possibilità di autorizzazione, con il ruolo scritto chiaramente.
66. **Configurazione dall'app** (`js/app.js`, nuova chiave `profiliProva` passata a `N.Shell.avvia`):

```js
profiliProva: [
  { ruolo: 'proprietario', utente: 'p-simo', icona: 'star', desc: 'Crea lavagne, modifica, invita e gestisce i ruoli' },
  { ruolo: 'editor', utente: 'p-giulia', icona: 'edit', desc: 'Modifica le lavagne, vota e commenta' },
  { ruolo: 'lettore', utente: 'p-marco', icona: 'eye', desc: 'Guarda, commenta ed esporta, senza modificare' }
]
```

67. **Pulsanti** (in `Shell.accesso`, sotto il titolo piccolo "Prova senza email" e la riga "Ogni pulsante ti fa entrare con un ruolo diverso sulle lavagne di esempio"): uno per voce, a tutta larghezza, con icona del ruolo a sinistra, ruolo in grassetto ("Entra come Proprietario"), descrizione piccola sotto, a destra avatar 24 px e nome della persona. `aria-label`: "Entra come Editor (Giulia Rinaldi)". Clic -> `D.accesso.entraProva(utente)`.
68. **Ripiego per zeno**: se `cfg.profiliProva` manca, resta l'elenco attuale "Prova rapida, entra come" (zeno non cambia).
69. **Ruoli disponibili**: oggi i ruoli sono tre (Proprietario, Editor, Lettore); quindi tre pulsanti. Un quarto ruolo "Commentatore" o la ridenominazione di "Lettore" in "Visualizzatore" sono nel [punto aperto 312] (predefinito: tre ruoli, nomi attuali).
70. **Icona `eye`**: va aggiunta a `nucleo/ui.js` (Appendice 2).

### C6 - Dati di prova coerenti con i ruoli

71. **Problema**: oggi Giulia è proprietaria della "Retrospettiva di ottobre" ed editor dell'altra, quindi il ruolo dipende dalla lavagna. I pulsanti di C5 hanno senso solo se ogni persona ha lo stesso ruolo su tutte le lavagne di esempio.
72. **Nuova semina** (`semina` in `js/app.js`, con `versioneSemina: '0.5'` passato a `N.Shell.avvia`, così i browser che hanno già i dati 0.4 ricevono i nuovi esempi):
    1. elimina dalle tabelle le vecchie lavagne `i-nomi` e `i-retro` e i loro membri: `await D._mutaTab('documenti', (t) => { delete t['i-nomi']; delete t['i-retro']; })` e `await D._mutaTab('membri', (m) => { Object.keys(m).filter((k) => k.startsWith('i-nomi|') || k.startsWith('i-retro|')).forEach((k) => delete m[k]); })`;
    2. come Simo crea `i5-nomi` ("Nomi per la nuova app", contenuto attuale), `i5-retro` ("Retrospettiva di ottobre", contenuto attuale) e `i5-workshop` ("Workshop di prodotto", contenuto in L2);
    3. per tutte e tre: Giulia `editor`, Marco `lettore`;
    4. commenti di esempio: Simo su `n1`, Giulia su `n6` (come oggi), Marco su un post-it della retrospettiva ("Proporrei di provarlo da subito").

### C7 - Menu utente

73. **Voci**: in modalità prova la voce "Cambia utente (prova)" resta e "Esci" si nasconde (fanno la stessa cosa); in produzione resta solo "Esci".

### C8 - Testi di aiuto

74. **Capitolo "Accesso"** in `nucleo/aiuto.js` (nucleo 0.5), campo `breve`: "Entri con la tua email: ricevi da noreply@nautargo.com un codice di 6 cifre, oppure apri il link dell'email."; campo `attenzione`: "Il codice vale 10 minuti e si può chiedere di nuovo dopo un minuto. In modalità prova l'email non parte: il codice compare a schermo e puoi entrare con un pulsante per ogni ruolo."

### C9 - Modello dell'email (da usare in fase 2)

75. **File**: crea `docs/email/codice-accesso.html` e `docs/email/codice-accesso.txt` con il contenuto dell'Appendice 5 (non vanno in `sw.js`). Servono per configurare il servizio di invio quando sarà pronto.

### C10 - Configurazione esterna (non la fa chi esegue: va annotata nell'handoff)

76. **Elenco per Simo**, da riportare tale e quale nell'handoff 0.5:
    1. scegliere un servizio SMTP per `noreply@nautargo.com`, preferibilmente con sede e dati in UE per il GDPR (punto 374 delle istruzioni 0.4, ancora aperto);
    2. verificare il dominio `nautargo.com` sul servizio e pubblicare i record DNS che indica: SPF (TXT), DKIM (TXT o CNAME), DMARC (TXT, all'inizio `v=DMARC1; p=none; rua=mailto:<indirizzo di controllo>`, poi `p=quarantine` quando i rapporti sono puliti);
    3. in Supabase (fase 2), sezione Authentication: SMTP personalizzato con mittente `noreply@nautargo.com` e nome `nautargo`; modello "Magic Link" sostituito con quello dell'Appendice 5; scadenza del codice a 600 secondi; controllare i limiti di invio (il servizio integrato di Supabase ha limiti molto bassi, con SMTP proprio si alzano dalle impostazioni Rate Limits);
    4. inviare una prova a Gmail, Outlook e iCloud e controllare che non finisca in Spam.

### Criteri di accettazione C

77. **Flusso completo in prova**: email -> codice a schermo -> inserimento automatico a 6 cifre -> ingresso. Codice errato 5 volte -> blocco con messaggio; "Invia di nuovo" disattivato per 60 s con conto alla rovescia; link simulato funzionante.
78. **Ruoli**: con il pulsante "Entra come Lettore" sulle tre lavagne di esempio compare il chip "Lettore" e non ci sono strumenti di modifica; con "Editor" si modifica ma non si gestiscono i ruoli; con "Proprietario" tutto.
79. **Testi**: il mittente `noreply@nautargo.com` compare nel passo 1 e nel passo 2 ed è letto da `N.CONFIG`.

## Blocco D - Connettori e linee

Riferimento: in Miro una linea ha tipo (dritta, ortogonale, curva), estremità scelte separatamente per inizio e fine (anche "nessuna"), spessore (la punta cresce con lo spessore), colore, stile (continuo, puntinato, tratteggiato), testo; si stacca e riattacca trascinando l'estremità; una nuova linea eredita lo stile dell'ultima usata.

### D1 - Modello dati del connettore

80. **Campi** (tutti facoltativi, con questi predefiniti in `I.STILE_BASE`):

| Campo | Valori | Predefinito | Note |
|---|---|---|---|
| `tipo` | `'dritta'`, `'curva'`, `'ortogonale'` | `'ortogonale'` | "curva" è la linea libera morbida; "ortogonale" ha gomiti arrotondati (come oggi) |
| `inizio` | `'nessuna'`, `'freccia'`, `'triangolo'`, `'cerchio'`, `'cerchioVuoto'`, `'rombo'`, `'barra'` | `'nessuna'` | estremità sull'oggetto di partenza |
| `fine` | come sopra | `'triangolo'` | come oggi (freccia piena) |
| `stile` | `'continua'`, `'tratteggiata'`, `'puntinata'` | `'continua'` | |
| `spessore` | `1`, `2`, `3`, `5` | `2` | in px |
| `colore` | colori di `I.TRATTI` (F4) | `'#7D8C95'` | |
| `testo` | stringa | `''` | già esistente |

81. **Lettura**: `I.stileConnettore = (e) => Object.assign({}, I.STILE_BASE, e)`; un connettore 0.4 senza campi appare identico a oggi.

### D2 - Componente `Connettore` (`js/connettori.js`)

82. **Registrazione**: in `Lavagna` passa `edgeTypes=${I.TIPI_ARCHI}` (`{ connettore: I.Connettore }`) a `ReactFlow`; la funzione `arco()` diventa `({ id: e.id, source: e.da, target: e.a, sourceHandle: e.daH, targetHandle: e.aH, type: 'connettore', data: e, selected: !!sel })`: niente più `markerEnd`, `style`, `label` nell'arco. Togli `defaultEdgeOptions`.
83. **Codice di riferimento** (i marcatori sono dentro l'arco, con id unici per arco: così funzionano anche nell'export PNG/PDF, che copia solo il contenuto del viewport):

```js
(function (N) {
  'use strict';
  const I = N.I, L = window.IrisLib, React = L.React, html = I.html;
  const { BaseEdge, EdgeLabelRenderer, EdgeToolbar, getStraightPath, getBezierPath, getSmoothStepPath } = L.XY;
  I.STILE_BASE = { tipo: 'ortogonale', inizio: 'nessuna', fine: 'triangolo', stile: 'continua', spessore: 2, colore: '#7D8C95' };
  I.stileConnettore = (e) => Object.assign({}, I.STILE_BASE, e);
  /* estremità disegnate in un riquadro 10x10 con la punta verso destra; orient auto-start-reverse le gira all'inizio */
  const EST = {
    freccia: { d: 'M1.5 1.5L9 5L1.5 8.5', pieno: false, ref: 9 },
    triangolo: { d: 'M0 0L10 5L0 10Z', pieno: true, ref: 9 },
    cerchio: { c: true, pieno: true, ref: 8.6 },
    cerchioVuoto: { c: true, pieno: false, ref: 8.6 },
    rombo: { d: 'M0 5L5 0L10 5L5 10Z', pieno: true, ref: 9.5 },
    barra: { d: 'M8 0.5L8 9.5', pieno: false, ref: 8 }
  };
  I.ESTREMITA = EST;
  function Marcatore({ id, forma, colore, spessore }) {
    const f = EST[forma]; if (!f) return null;
    const lato = 8 + spessore * 3;
    return html`<marker id=${id} viewBox="-1 -1 12 12" refX=${f.ref} refY="5" markerWidth=${lato} markerHeight=${lato} markerUnits="userSpaceOnUse" orient="auto-start-reverse">
      ${f.c ? html`<circle cx="5" cy="5" r="3.6" style=${{ fill: f.pieno ? colore : 'var(--sup)', stroke: colore, strokeWidth: 1.4 }} />`
        : html`<path d=${f.d} style=${{ fill: f.pieno ? colore : 'none', stroke: colore, strokeWidth: f.pieno ? 0.8 : 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }} />`}</marker>`;
  }
  I.percorso = (s, p) => {
    const a = { sourceX: p.sourceX, sourceY: p.sourceY, targetX: p.targetX, targetY: p.targetY, sourcePosition: p.sourcePosition, targetPosition: p.targetPosition };
    if (s.tipo === 'dritta') return getStraightPath(a);
    if (s.tipo === 'curva') return getBezierPath(Object.assign({ curvature: 0.3 }, a));
    return getSmoothStepPath(Object.assign({ borderRadius: 10, offset: 24 }, a));
  };
  I.Connettore = function Connettore(p) {
    const c = React.useContext(I.Ctx), s = I.stileConnettore(p.data);
    const [path, lx, ly] = I.percorso(s, p), k = s.spessore;
    const dash = s.stile === 'tratteggiata' ? (k * 4) + ' ' + (k * 3) : s.stile === 'puntinata' ? '0.1 ' + (k * 2.6) : undefined;
    const mi = 'mk-' + p.id + '-i', mf = 'mk-' + p.id + '-f';
    const [mod, setMod] = React.useState(false);
    return html`<g className=${'conn' + (p.selected ? ' sel' : '')}>
      <defs><${Marcatore} id=${mi} forma=${s.inizio} colore=${s.colore} spessore=${k} /><${Marcatore} id=${mf} forma=${s.fine} colore=${s.colore} spessore=${k} /></defs>
      ${p.selected ? html`<path d=${path} className="alone" style=${{ strokeWidth: k + 8 }} />` : null}
      <${BaseEdge} id=${p.id} path=${path} interactionWidth=${18}
        markerStart=${EST[s.inizio] ? 'url(#' + mi + ')' : undefined} markerEnd=${EST[s.fine] ? 'url(#' + mf + ')' : undefined}
        style=${{ stroke: s.colore, strokeWidth: k, strokeDasharray: dash, strokeLinecap: s.stile === 'puntinata' ? 'round' : 'butt', fill: 'none' }} />
      ${s.testo || mod ? html`<${EdgeLabelRenderer}><div className="etich nodrag nopan" style=${{ transform: 'translate(-50%,-50%) translate(' + lx + 'px,' + ly + 'px)' }}
          onDoubleClick=${(e) => { if (c.ed) { e.stopPropagation(); setMod(true); } }}>
        ${mod ? html`<${I.TestoArco} id=${p.id} testo=${s.testo} fine=${() => setMod(false)} />` : s.testo}</div><//>` : null}
      ${p.selected && c.ed && c.unArcoSel ? html`<${EdgeToolbar} edgeId=${p.id} x=${lx} y=${ly - 22} alignY="bottom"><${I.BarraConnettore} id=${p.id} s=${s} modifica=${() => setMod(true)} /><//>` : null}
    </g>`;
  };
  I.TIPI_ARCHI = { connettore: I.Connettore };
})(window.N = window.N || {});
```

84. **`c.unArcoSel`**: nel contesto, vero quando c'è esattamente un connettore selezionato e nessun nodo; la barra si mostra solo in quel caso.
85. **Doppio clic sull'arco senza testo**: `onEdgeDoubleClick` in `ReactFlow` imposta nel contesto `c.modArco = id`; il componente con quell'id apre il campo (`mod` vero anche se `c.modArco === p.id`). Sostituisce la finestra `UI.chiedi` attuale.
86. **`I.TestoArco`**: `textarea` piccola (classe `tmod nodrag nowheel`), fuoco e selezione all'apertura; Invio salva, Maiusc+Invio va a capo, Esc annulla, perdita del fuoco salva; scrive con `c.aggiornaArco(id, { testo })` (origine `'azione'`).

### D3 - Barra del connettore (`I.BarraConnettore`)

87. **Gruppi da sinistra a destra** (pulsanti 32 px con mini disegni SVG 20x14, stato attivo con classe `on`):
    1. **Tipo**: Dritta, Curva, Ortogonale;
    2. **Inizio** (tendina) e **Fine** (tendina): 7 voci ciascuna con disegno (nessuna, freccia, triangolo, cerchio, cerchio vuoto, rombo, barra) + pulsante "Inverti direzione" (scambia `inizio` e `fine`);
    3. **Stile**: continua, tratteggiata, puntinata;
    4. **Spessore** (tendina): 1, 2, 3, 5 con una riga dello spessore corrispondente;
    5. **Colore** (tendina): pastiglie di `I.TRATTI`;
    6. **Testo**: apre il campo del testo;
    7. **Elimina** (rosso).
88. **Tendina**: componente React `I.Tendina({ etichetta, titolo, children })`: pulsante che apre un pannello sotto di sé (`position: absolute`, `var(--sup)`, bordo, ombra), chiuso da clic esterno o Esc. Riutilizzala per tutte le barre (D, E, F).
89. **Scrittura**: ogni scelta chiama `c.aggiornaArco(id, patch)` e poi salva lo stile corrente (senza `testo`) in `localStorage['iris:stileConnettore']` con `I.salvaPref`.

### D4 - Creazione, riaggancio ed estremità libere

90. **Stile delle nuove linee**: `onConnect` crea il connettore con `Object.assign({}, I.STILE_BASE, ultimoStile)`, dove `ultimoStile` è letto da `iris:stileConnettore` (se manca, i predefiniti).
91. **Linea di anteprima**: `connectionLineType` di `ReactFlow` segue il tipo dell'ultimo stile (`ConnectionLineType.Straight`, `Bezier`, `SmoothStep`); `connectionRadius=${40}` per agganciare la maniglia più vicina anche rilasciando sull'oggetto.
92. **Riaggancio**: passa `onReconnect=${(vecchio, nuovo) => ...}` che aggiorna `da`, `a`, `daH`, `aH` del connettore (origine `'azione'`); `edgesReconnectable=${ed}`.
93. **Oggetto `ancora`** (nuovo tipo di nodo, per linee con una o due estremità libere): `{ tipo: 'ancora', w: 12, h: 12 }`; disegno: cerchio di 10 px con bordo `var(--acc)`, visibile solo al passaggio del mouse, quando è selezionato o quando la lavagna ha un connettore selezionato (classe `con-arco-sel` su `.lav`); 4 maniglie `t r b l` tutte al centro (stile `left: 50%; top: 50%`), così la linea finisce nel punto. Niente ridimensionamento, niente barra oggetto, non votabile né commentabile, esclusa da allineamento e ricerca.
94. **Rilascio nel vuoto**: `onConnectEnd(evento, stato)`: se `!stato.isValid && stato.fromNode` crea un'ancora nel punto di rilascio (`rf.screenToFlowPosition` del puntatore, per il tocco `evento.changedTouches[0]`), poi il connettore da `fromNode`/`fromHandle` all'ancora. Maniglia dell'ancora: quella rivolta verso l'oggetto di partenza (se `|dx| > |dy|` allora `dx > 0 ? 'l' : 'r'`, altrimenti `dy > 0 ? 't' : 'b'`).
95. **Riaggancio nel vuoto**: `onReconnectEnd(evento, arco, tipoManiglia, stato)`: se `!stato.isValid` crea un'ancora nel punto e sposta lì l'estremità trascinata.
96. **Eliminazione**: quando si elimina un connettore, elimina anche le ancore rimaste senza connettori; quando si elimina un'ancora, si eliminano i suoi connettori (già fatto da `elimina`).

### D5 - Strumento "Linee"

97. **Pulsante "Linee"** nella barra strumenti (scorciatoia L) con menu: "Linea dritta" (dritta, nessuna/nessuna), "Freccia" (dritta, nessuna/triangolo), "Freccia doppia" (dritta, triangolo/triangolo), "Linea curva" (curva, nessuna/nessuna), "Connettore ortogonale" (ortogonale, nessuna/triangolo). Ogni voce crea due ancore al centro della vista, a 200 px di distanza in orizzontale, e il connettore tra loro (maniglie `r` e `l`), seleziona il connettore e aggiorna l'ultimo stile.

### D6 - CSS

98. **Regole** (in `css/iris.css`; togli la regola attuale `.react-flow__edge.selected .react-flow__edge-path { stroke: var(--acc) !important; }` che coprirebbe il colore scelto):

```css
.conn .alone { fill: none; stroke: var(--acc); opacity: .35; }
.etich { position: absolute; pointer-events: all; background: var(--sup); color: var(--fg); border-radius: 4px; padding: 2px 6px; font-size: 12.5px; white-space: pre-wrap; max-width: 220px; text-align: center; box-shadow: 0 0 0 1px var(--line2); }
.etich .tmod { min-width: 120px; min-height: 22px !important; }
.react-flow__node-ancora .anc { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--acc); background: var(--sup); opacity: 0; transition: opacity .15s; margin: 1px; }
.react-flow__node-ancora:hover .anc, .react-flow__node-ancora.selected .anc, .con-arco-sel .react-flow__node-ancora .anc { opacity: 1; }
.react-flow__node-ancora .mh { left: 50% !important; top: 50% !important; transform: translate(-50%, -50%); opacity: 0 !important; }
```

### Criteri di accettazione D

99. **Opzioni**: per un connettore selezionato si cambiano tipo (dritta, curva, ortogonale), estremità di inizio e fine separatamente (7 forme), stile, spessore, colore e testo; le punte crescono con lo spessore e prendono il colore della linea.
100. **Linee libere**: trascinando da una maniglia nel vuoto nasce una linea con estremità libera spostabile; lo strumento Linee crea linee e frecce non collegate; un'estremità libera si può riagganciare a un oggetto e viceversa.
101. **Memoria dello stile**: dopo aver impostato "curva tratteggiata blu", il connettore successivo nasce uguale.
102. **Export**: PNG e PDF mostrano frecce e stili corretti. **Retrocompatibilità**: i connettori delle lavagne 0.4 sono identici a prima.

## Blocco E - Selezione, gruppi, blocco, allineamento, appunti

### E1 - Navigazione e strumenti Seleziona e Mano

103. **Comportamento predefinito (come Miro)**: con lo strumento **Seleziona** (V) il trascinamento sul vuoto disegna il riquadro di selezione; la vista si sposta con la barra spaziatrice tenuta premuta, con il tasto centrale o destro del mouse, con la rotellina (o due dita sul trackpad, vedi sotto); con lo strumento **Mano** (H) il trascinamento sposta la vista.
104. **Proprietà di `ReactFlow`** (con `mano = strumento === 'mano' || tocco || !ed`, dove `tocco = matchMedia('(pointer: coarse)').matches`):
    - `panOnDrag=${mano ? true : [1, 2]}`, `selectionOnDrag=${!mano}`, `selectionMode=${SelectionMode.Full}`, `selectionKeyCode=${mano ? 'Shift' : null}`;
    - `multiSelectionKeyCode=${['Shift', 'Meta', 'Control']}` (Maiusc+clic aggiunge o toglie dalla selezione);
    - `panActivationKeyCode="Space"`;
    - navigazione `mouse` (predefinita): `zoomOnScroll=${true}`, `panOnScroll=${false}`; navigazione `trackpad`: `zoomOnScroll=${false}`, `panOnScroll=${true}` (il pizzico zooma comunque); scelta nel menu Vista, salvata in `iris:navigazione`;
    - `onPaneContextMenu=${(e) => e.preventDefault()}` (il tasto destro sposta la vista, non apre il menu del browser).
105. **Barra strumenti**: in testa due pulsanti "Seleziona" (icona `pointer`) e "Mano" (icona `hand`), con stato attivo; Esc riporta a Seleziona.

### E2 - Barra della selezione multipla

106. **Quando**: più di un nodo selezionato (escluse le ancore) e nessuna votazione in corso. Usa `NodeToolbar` con `nodeId=${idSelezionati}` (accetta un array e si posiziona sopra il riquadro comune).
107. **Pulsanti**: "Raggruppa" o "Separa" (secondo lo stato, E3), "Blocca" o "Sblocca" (E4), "Allinea" (tendina, E5), "Distribuisci" (tendina, attiva con almeno 3 oggetti), "Colore" (tendina; vale per gli oggetti che hanno un colore), "Duplica", "Salva come template" (I8), "Elimina". Mostra a sinistra il numero: "5 oggetti".

### E3 - Gruppi

108. **Dato**: campo `gruppo` (stringa id) sugli oggetti. Un oggetto appartiene al massimo a un gruppo; raggruppare oggetti già in gruppi diversi li unisce in un gruppo nuovo (niente gruppi annidati).
109. **Raggruppa** (Ctrl+G, almeno 2 oggetti non bloccati): assegna lo stesso `gruppo = U.uid()` a tutti i selezionati (una transazione `'azione'`). **Separa** (Ctrl+Maiusc+G): toglie `gruppo` agli oggetti dei gruppi selezionati.
110. **Selezione del gruppo**: in `onNodesChange`, dopo `applyNodeChanges`, per ogni cambiamento `select` con `selected: true` su un nodo con `data.gruppo` (e il gruppo non "aperto", vedi sotto) seleziona tutti i nodi con lo stesso gruppo.
111. **Trascinamento del gruppo**: React Flow sposta solo i nodi già selezionati all'inizio del trascinamento; per il primo trascinamento di un gruppo non selezionato generalizza la logica delle cornici: in `onNodeDragStart(e, nodo, nodi)` calcola gli "accompagnatori" = (oggetti contenuti nelle cornici trascinate) unito (membri dei gruppi dei nodi trascinati), tolti i nodi già trascinati e gli oggetti bloccati; salva le loro posizioni iniziali; in `onNodeDrag` spostali dello stesso scarto del nodo trascinato (come oggi per le cornici, con `accoda`); in `onNodeDragStop` scrivi le posizioni.
112. **Gruppo aperto**: il doppio clic su un membro "apre" il gruppo (`gruppoAperto.current = gruppo`): da quel momento i clic selezionano i singoli membri e il doppio clic modifica il testo; un clic sul vuoto o su un oggetto fuori dal gruppo lo richiude.
113. **Contorno**: quando un gruppo è selezionato disegna un rettangolo tratteggiato `var(--acc)` attorno ai membri (margine 8 px) nello strato in coordinate schermo (G2), con etichetta piccola "Gruppo".
114. **Copia, duplica, template**: i gruppi si mantengono con id nuovi (stesso vecchio gruppo -> stesso nuovo gruppo).

### E4 - Blocco degli oggetti

115. **Dato**: campo `bloccato: true`. **Comandi**: "Blocca" e "Sblocca" nelle barre (singola e multipla), Ctrl+Maiusc+L, menu contestuale. Solo chi ha `ed` blocca e sblocca.
116. **Effetti di un oggetto bloccato**: nodo con `draggable: false` e `deletable: false`; niente maniglie di ridimensionamento; niente modifica del testo; nessun cambio di colore o stile; non si sposta con le frecce, con l'allineamento o come accompagnatore; resta selezionabile, commentabile, votabile e collegabile con connettori.
117. **Segno visivo**: piccola icona lucchetto (`lock`, 14 px) in alto a destra quando l'oggetto è selezionato o al passaggio del mouse; per chi ha `ed` il clic sul lucchetto sblocca.
118. **Barra di un oggetto bloccato**: solo "Sblocca", "Commenta", "Copia".
119. **Uso tipico**: bloccare le cornici e i titoli di un template, così si spostano solo i post-it.

### E5 - Allineamento e distribuzione

120. **Su**: oggetti selezionati non bloccati e non ancore, coordinate `x, y, w, h` del documento.
121. **Allinea**: a sinistra (`x = min x`), al centro orizzontale (`x = cx - w/2` con `cx` centro del riquadro comune), a destra (`x = max(x + w) - w`), in alto, al centro verticale, in basso.
122. **Distribuisci orizzontalmente**: ordina per `x`; `vuoto = (destraMax - sinistraMin - somma larghezze) / (n - 1)`; piazza in sequenza dal primo. Verticalmente uguale su `y` e altezze.
123. **Scrittura**: una sola transazione `'azione'` (un solo annulla).

### E6 - Ordine di sovrapposizione

124. **zIndex**: nella funzione `nodo()` usa per le cornici `zIndex = -1 - Math.min(998, Math.floor((o.w * o.h) / 20000))` (le cornici grandi stanno sotto le piccole: serve per le cornici annidate dei template) e per gli altri `zIndex = 1000 + (o.z || 1)`.
125. **Comandi**: "Porta in primo piano" (`z = max + 1`, PagSu) e "Porta sullo sfondo" (`z = min - 1`, PagGiù), nella barra e nel menu contestuale.

### E7 - Copia, taglia, incolla, duplica

126. **Appunti interni** (implementati con gli eventi `copy`, `cut` e `paste` del browser come descritto in F7, non con il `keydown`): la copia scrive in `localStorage['iris:appunti']` `{ v: 1, da: docId, oggetti, connettori }` con gli oggetti selezionati (le cornici portano gli oggetti contenuti) e i connettori con entrambe le estremità nella selezione. Ctrl+X copia ed elimina (solo `ed`).
127. **Incolla** (Ctrl+V tramite l'evento `paste`, solo `ed`): id nuovi, gruppi rimappati, posizione: il riquadro incollato si centra sull'ultima posizione del puntatore nella lavagna (se nota), altrimenti spostamento di +24 px; seleziona gli oggetti incollati. Se la lavagna di origine è diversa, per immagini e allegati copia il file: `D.file.url(id)` della lavagna di origine (serve l'accesso) e `D.file.carica(docId, ...)` nella nuova; se il file non è leggibile, salta l'oggetto con un avviso.
128. **Duplica** (Ctrl+D): come copia e incolla con spostamento +24 px, anche per selezioni multiple (oggi duplica un solo oggetto).
129. **Appunti di sistema**: gestiti in F7 (immagini, testo e link incollati da altre app).

### E8 - Tastiera (`js/selezione.js`, un solo gestore)

130. **Regola**: un unico `keydown` registrato dalla lavagna, ignorato se il fuoco è in un campo, in un elemento `contenteditable` o se c'è una modale aperta. Comandi di modifica solo con `ed`.
131. **Tabella** (riportata anche nella finestra "Scorciatoie", J5):

| Tasti | Azione |
|---|---|
| V / H | strumento Seleziona / Mano |
| N, T, S, L, P, E, F | post-it, testo, forma (ultima usata), linee (linea dritta), penna, gomma, cornice |
| Ctrl+Z / Ctrl+Maiusc+Z o Ctrl+Y | annulla / ripeti |
| Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+D | copia, taglia, incolla, duplica |
| Ctrl+A | seleziona tutto (escluse le ancore) |
| Canc o Backspace | elimina (non gli oggetti bloccati) |
| Esc | deseleziona, chiude il gruppo aperto, torna a Seleziona |
| Frecce / Maiusc+frecce | sposta di 1 px / 10 px |
| Ctrl+G / Ctrl+Maiusc+G | raggruppa / separa |
| Ctrl+Maiusc+L | blocca o sblocca |
| PagSu / PagGiù | primo piano / sfondo |
| Maiusc+1 / Maiusc+2 | adatta allo schermo / zoom sulla selezione |
| Ctrl++ / Ctrl+- / Ctrl+0 | zoom avanti / indietro / 100% (con `preventDefault`, accetta `e.key` `'+'` o `'='`) |
| Ctrl+F | cerca nella lavagna |
| ? | finestra delle scorciatoie |

132. **Frecce**: spostano i selezionati non bloccati con i loro accompagnatori (E3), una transazione `'azione'`.

### E9 - Menu contestuale

133. **Tasto destro su un oggetto** (`onNodeContextMenu`, con `preventDefault`): menu `UI.menu` aperto alla posizione del puntatore (crea un elemento ancora temporaneo `position: fixed` 1x1 in quel punto e rimuovilo alla chiusura). Voci: Copia, Taglia, Incolla, Duplica, '-', Raggruppa o Separa, Blocca o Sblocca, Primo piano, Sfondo, '-', Commenta, '-', Elimina (pericolo). Per il Lettore: Copia e Commenta.
134. **Tasto destro sul vuoto**: menu con Incolla (se ci sono appunti), Seleziona tutto, Adatta allo schermo.

### Criteri di accettazione E

135. **Selezione**: riquadro col trascinamento, Maiusc+clic, Ctrl+A; spostamento della vista con spazio, tasto centrale, rotellina; strumento Mano.
136. **Gruppi**: raggruppati, un clic seleziona tutto il gruppo e il trascinamento lo sposta intero anche al primo tocco; doppio clic su un membro lo modifica da solo; separazione funzionante; annulla riporta allo stato precedente.
137. **Blocco**: un oggetto bloccato non si sposta, non si ridimensiona, non si cancella, non cambia testo; lo sblocco dal lucchetto funziona; il Lettore non vede i comandi.
138. **Allineamento e distribuzione** corretti su 3-5 oggetti di misure diverse; **appunti** tra due lavagne diverse, immagini comprese.

## Blocco F - Oggetti nuovi e stile

### F1 - Forme: catalogo esteso

139. **Disegno in pixel reali**: le forme oggi usano `viewBox 0 0 100 100` deformato (gli angoli arrotondati si schiacciano). Disegnale con le misure vere del nodo: `<svg viewBox=${'0 0 ' + w + ' ' + h} width=${w} height=${h} className="fsvg">` con `w, h` dalle props del nodo (`width`, `height`, ripiego `data.w`, `data.h`). Togli `vectorEffect` e `preserveAspectRatio="none"`.
140. **Catalogo** (`I.FORME`, ordine del menu): `rett` Rettangolo, `arrotondato` Rettangolo arrotondato, `ellisse` Ellisse, `rombo` Rombo, `triangolo` Triangolo, `esagono` Esagono, `parallelogramma` Parallelogramma (dati), `cilindro` Cilindro (database), `documento` Documento, `stella` Stella, `freccia` Freccia, `fumetto` Fumetto.
141. **Tracciati** (`I.tracciatoForma(forma, w, h)` restituisce l'attributo `d` di un `<path>`):

```js
I.tracciatoForma = (f, w, h) => {
  const r = (ww, hh, rr) => 'M' + rr + ' 0H' + (ww - rr) + 'A' + rr + ' ' + rr + ' 0 0 1 ' + ww + ' ' + rr + 'V' + (hh - rr) + 'A' + rr + ' ' + rr + ' 0 0 1 ' + (ww - rr) + ' ' + hh + 'H' + rr + 'A' + rr + ' ' + rr + ' 0 0 1 0 ' + (hh - rr) + 'V' + rr + 'A' + rr + ' ' + rr + ' 0 0 1 ' + rr + ' 0Z';
  switch (f) {
    case 'arrotondato': return r(w, h, Math.min(w, h) * 0.22);
    case 'ellisse': return `M0 ${h / 2}A${w / 2} ${h / 2} 0 1 1 ${w} ${h / 2}A${w / 2} ${h / 2} 0 1 1 0 ${h / 2}Z`;
    case 'rombo': return `M${w / 2} 0L${w} ${h / 2}L${w / 2} ${h}L0 ${h / 2}Z`;
    case 'triangolo': return `M${w / 2} 0L${w} ${h}L0 ${h}Z`;
    case 'esagono': { const k = Math.min(w * 0.25, h * 0.5); return `M${k} 0H${w - k}L${w} ${h / 2}L${w - k} ${h}H${k}L0 ${h / 2}Z`; }
    case 'parallelogramma': { const k = Math.min(w * 0.2, h * 0.6); return `M${k} 0H${w}L${w - k} ${h}H0Z`; }
    case 'cilindro': { const e = Math.min(h * 0.14, 20); return `M0 ${e}A${w / 2} ${e} 0 0 1 ${w} ${e}V${h - e}A${w / 2} ${e} 0 0 1 0 ${h - e}Z M0 ${e}A${w / 2} ${e} 0 0 0 ${w} ${e}`; }
    case 'documento': return `M0 0H${w}V${h * 0.86}Q${w * 0.75} ${h * 0.7} ${w / 2} ${h * 0.86}T0 ${h * 0.86}Z`;
    case 'stella': { const cx = w / 2, cy = h / 2, p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 0.45 : 1; p.push((cx + Math.cos(a) * cx * q).toFixed(1) + ' ' + (cy + Math.sin(a) * cy * q).toFixed(1)); } return 'M' + p.join('L') + 'Z'; }
    case 'freccia': { const k = Math.min(w * 0.35, h * 0.6); return `M0 ${h * 0.28}H${w - k}V0L${w} ${h / 2}L${w - k} ${h}V${h * 0.72}H0Z`; }
    case 'fumetto': { const b = h * 0.8, q = Math.min(12, w * 0.1, b * 0.2); return `M${q} 0H${w - q}A${q} ${q} 0 0 1 ${w} ${q}V${b - q}A${q} ${q} 0 0 1 ${w - q} ${b}H${w * 0.4}L${w * 0.18} ${h}L${w * 0.24} ${b}H${q}A${q} ${q} 0 0 1 0 ${b - q}V${q}A${q} ${q} 0 0 1 ${q} 0Z`; }
    default: return r(w, h, Math.min(4, w / 4, h / 4));
  }
};
```

142. **Spazio del testo** (CSS sul contenitore `.forma.f-<nome> .ttx`): rombo e esagono `padding: 0 18%`; triangolo `padding: 38% 20% 0`; stella `padding: 22% 26% 10%`; cilindro `padding-top: 14%`; documento `padding-bottom: 14%`; fumetto `padding-bottom: 20%`; freccia `padding-right: 28%`.
143. **Menu Forme**: griglia 4x3 di pulsanti con anteprima (lo stesso tracciato a 28x20) e nome nel `title`; l'ultima forma usata diventa quella della scorciatoia S (`iris:ultimaForma`).
144. **Cambio forma** dalla barra dell'oggetto: tendina con la stessa griglia.

### F2 - Stile delle forme

145. **Campi nuovi** (piatti, per aggiornare con `Object.assign`): `colore` (riempimento; `'trasparente'` = nessun riempimento), `bordoColore` (predefinito `'#7D8C95'`), `bordoSpessore` (`0`, `1`, `2`, `4`; predefinito `1.5` per le forme esistenti, `0` = senza bordo), `bordoStile` (`'continua'`, `'tratteggiata'`, `'puntinata'`).
146. **Barra della forma**: Riempimento (tendina: colori `I.COLORI` + pastiglia "Trasparente" a scacchi), Bordo (tendina: colori `I.TRATTI`, spessori, stili), Forma (tendina F1), Testo (F3).

### F3 - Testo: formato, adattamento e autore

147. **Campi**: `dim` (numero in px; per il post-it anche `'auto'`, predefinito `'auto'`), `grassetto` (booleano; predefinito `true` per `testo`, `false` per gli altri), `allinea` (`'sinistra'`, `'centro'`, `'destra'`; predefinito `'centro'` per le forme, `'sinistra'` per post-it e testo), `coloreTesto` (solo `testo` e `forma`; predefinito `var(--fg)` per il testo, `#1E2A33` per le forme).
148. **Barra**: tendina Dimensione (post-it: Auto, Piccolo 13, Medio 16, Grande 22, Enorme 32; testo e forme: 12, 14, 16, 20, 28, 36, 48, 64), pulsante **G** grassetto, tendina Allineamento (tre icone), tendina Colore testo (solo testo e forma).
149. **Adattamento automatico nel post-it** (`dim: 'auto'`, come in Miro il testo si riduce per stare nel foglio): `useLayoutEffect` su `[testo, width, height]`: parti da 22 px e scendi di 1 fino a 11 finché `el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth`; applica la dimensione trovata con lo stile in linea.
150. **Autore del post-it**: in `aggiungi('postit')` salva `autore: io`. Con l'opzione Vista "Mostra autori dei post-it" (`iris:autori`, predefinito spento) il post-it mostra in basso a sinistra il nome breve dell'autore (11 px, `rgba(30, 42, 51, .55)`).

### F4 - Tavolozze

151. **Post-it e riempimenti (`I.COLORI`, 12 colori)**: giallo `#F6E3A6`, ottone `#F1D2A9`, arancio `#F5C7A1`, corallo `#F0B9B0`, rosa `#EDCBD0`, lavanda `#D9D0EA`, azzurro `#C9DCEB`, blu `#AFCBEA`, verde `#BFE3DA`, lime `#DDEBB4`, grigio `#E2E6E5`, bianco `#FFFFFF`. I primi valori esistenti restano invariati (compatibilità).
152. **Linee, bordi e testo (`I.TRATTI`, 9 colori)**: grigio `#7D8C95`, inchiostro `#16232E`, ottone `#C99A4E`, ruggine `#B4544A`, verderame `#2F9184`, blu `#4E7FA6`, viola `#7A6AA8`, verde `#5E8C4A`, bianco `#FFFFFF`.
153. **Tinte delle cornici (`I.TINTE`)**: grigio `#ECEFEE`, verde `#E3F1ED`, rosa `#F6E7E8`, azzurro `#E5EDF5`, sabbia `#F7EEDC`, lavanda `#ECE8F4`, bianco `#FAFBFB`. La barra della cornice mostra queste, non i colori dei post-it.

### F5 - Allegati (file)

154. **Oggetto `allegato`**: `{ tipo: 'allegato', file, nome, mime, dimensione, w: 260, h: 76 }`. Scheda: a sinistra un'etichetta 40x48 arrotondata con la sigla e il colore del tipo (PDF `#B4544A`, DOC/DOCX/ODT `#4E7FA6`, XLS/XLSX/ODS/CSV `#2F9184`, PPT/PPTX/ODP `#C99A4E`, ZIP/RAR/7Z `#5E6C76`, TXT/MD `#5E6C76`, altri "FILE" `#7D8C95`), al centro il nome (massimo 2 righe con puntini) e sotto "1,20 MB" (`U.peso`), a destra il pulsante "Scarica" (icona `down`, classe `nodrag`).
155. **Scaricare**: `const u = await D.file.url(o.file); U.scarica(await (await fetch(u)).blob(), o.nome);`. Doppio clic sulla scheda = Scarica. Mai aprire il file in una scheda (regola generale sui file caricati).
156. **Caricare**: voce "File" del pulsante "Allega"; `U.scegliFile('', true)` (più file); ogni file: se è un'immagine usa il flusso immagine esistente, altrimenti `U.leggiDataUrl(f)` e `D.file.carica(docId, dataUrl, f.name, f.type || 'application/octet-stream')`; errori (oltre 5 MB) con `UI.errore`. Gli oggetti si dispongono a cascata (+24 px).
157. **Lettore**: vede e scarica, non carica.

### F6 - Link

158. **Oggetto `link`**: `{ tipo: 'link', url, titolo, w: 280, h: 84 }`. Voce "Link" del pulsante "Allega": `UI.chiedi('Aggiungi un link', '', 'Indirizzo')`; se manca lo schema aggiungi `https://`; valida con `new URL()` e accetta solo `http:` e `https:`; `titolo` iniziale = nome del dominio senza `www.`.
159. **Scheda**: icona `link`, titolo modificabile (`TestoMod`), dominio in piccolo, pulsante "Apri" -> `window.open(url, '_blank', 'noopener,noreferrer')`. Nessuna anteprima scaricata da internet (privacy e funzionamento offline).

### F7 - Trascina e rilascia, incolla da altre app

160. **Rilascio di file sulla lavagna** (solo `ed`): sul contenitore `.lav` gestisci `dragover` (con `preventDefault` se ci sono file) e `drop`: posizione = punto di rilascio in coordinate lavagna; immagini -> `immagine`, altri file -> `allegato`, a cascata. Durante il trascinamento mostra un bordo tratteggiato `var(--acc)` sulla lavagna con il testo "Rilascia per aggiungere".
161. **Appunti con gli eventi del browser** (sostituisce l'uso diretto di Ctrl+C e Ctrl+V di E7, che resta valido per il contenuto): sul `document`, finché la lavagna è aperta e il fuoco non è in un campo:
    - `copy` e `cut`: se ci sono oggetti selezionati, scrivi gli appunti interni come in E7 con un `id` nuovo, poi `e.clipboardData.setData('text/plain', 'iris-appunti:' + id)` e `e.preventDefault()`; per `cut` elimina dopo la copia;
    - `paste`: se il testo è `'iris-appunti:' + id` uguale a quello in `localStorage` -> incolla interno (E7); se ci sono file immagine -> `immagine` alla posizione del puntatore; altri file -> `allegato`; testo che è un indirizzo `http(s)` -> `link`; altro testo (massimo 2000 caratteri) -> post-it con quel testo;
    - le voci Copia e Incolla del menu contestuale usano direttamente `localStorage` (e `navigator.clipboard.writeText` per il marcatore, ignorando gli errori).

### F8 - Penna, evidenziatore, gomma

162. **Strumento "Penna"** (P) con tendina: Penna, Evidenziatore, Gomma; colori `I.TRATTI`; spessori 2, 4, 8 (evidenziatore sempre 16 e opacità 0,35). Preferenze in `iris:penna`.
163. **Disegno**: con Penna o Evidenziatore attivi, sopra la lavagna c'è uno strato trasparente (`.tela-penna`, `cursor: crosshair`) che riceve i puntatori; a `pointerdown` inizia il tratto (`setPointerCapture`), a ogni `pointermove` aggiunge il punto in coordinate lavagna (`rf.screenToFlowPosition`) se dista almeno `1,5 / zoom` dal precedente (massimo 3000 punti) e disegna l'anteprima; a `pointerup` crea l'oggetto.
164. **Oggetto `disegno`**: `{ tipo: 'disegno', x, y, w, h, w0, h0, punti, colore, spessore, opacita }`: `x, y` = minimo dei punti meno metà spessore; `w0, h0` = dimensioni iniziali; `punti` = stringa `"x,y x,y ..."` relativa a `x, y`, con una cifra decimale. Disegno: `<svg viewBox=${'0 0 ' + w0 + ' ' + h0} preserveAspectRatio="none" width="100%" height="100%"><path d=${I.lisciaTratto(punti)} fill="none" stroke=${colore} strokeWidth=${spessore} strokeLinecap="round" strokeLinejoin="round" opacity=${opacita} /></svg>`; ridimensionabile; nessun testo; colore cambiabile dalla barra.
165. **Lisciatura**:

```js
I.lisciaTratto = (s) => {
  const p = s.split(' ').map((q) => q.split(',').map(Number));
  if (p.length < 3) return 'M' + p.map((q) => q.join(' ')).join('L');
  let d = 'M' + p[0][0] + ' ' + p[0][1];
  for (let i = 1; i < p.length - 1; i++) { const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; d += 'Q' + p[i][0] + ' ' + p[i][1] + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1); }
  const u = p[p.length - 1]; return d + 'L' + u[0] + ' ' + u[1];
};
```

166. **Gomma** (E): strato come la penna; durante il trascinamento `document.elementsFromPoint(x, y)` trova i nodi `.react-flow__node-disegno` (attributo `data-id`), li rende semitrasparenti e al rilascio li elimina in una sola transazione. Un clic su un disegno lo elimina. La gomma cancella solo i disegni.

### F9 - Emoji e adesivi

167. **Strumento "Emoji"** (nel menu "Altro"): tendina con 40 emoji in griglia da 8: 👍 👎 ❤️ 🎉 😀 🙂 😐 😟 😢 😡 🤔 🤯 😍 🔥 ⭐ ✅ ❌ ❓ ❗ 💡 🚀 🎯 📌 📎 🏁 ⚠️ 🛑 💬 👀 🙌 👏 💪 🧠 🕐 📅 💰 📈 📉 🐞 ⛵.
168. **Oggetto `emoji`**: `{ tipo: 'emoji', emoji, w: 64, h: 64 }`, carattere centrato con `font-size: min(w, h) * 0,80 px`, `line-height: 1`; ridimensionamento con `keepAspectRatio`; votabile e commentabile; nella barra solo azioni comuni e "Cambia emoji".

### F10 - Scala di opinione (come nella seconda schermata di riferimento)

169. **Oggetto `scala`**: `{ tipo: 'scala', domanda: 'Quanto sei d\'accordo?', sinistra: 'Per niente', destra: 'Del tutto', posizioni: {}, w: 600, h: 170 }`; `posizioni` = `{ idUtente: numero da 0 a 1 }`.
170. **Disegno**: riquadro bianco con bordo `var(--line)` e raggio 12; in alto la domanda (modificabile con doppio clic) e a destra "5 risposte"; al centro una barra alta 64 px con sfumatura `linear-gradient(90deg, #F2B8AE, #F6E3A6 50%, #BFE3DA)`, raggio 10, bordo `rgba(14, 29, 42, .12)`; sotto le etichette sinistra e destra (modificabili) e "Neutrale" al centro; sulla barra gli avatar (26 px, `UI.avatar`) delle persone alla loro posizione, sfalsati in alto e in basso se distano meno di 4%.
171. **Votare** (chi ha `ed`, oggetto non bloccato): clic sulla barra = mi posiziono lì; il mio avatar ha un anello `var(--acc)` e si trascina lungo la barra (classe `nodrag`, eventi puntatore sull'avatar, anteprima locale durante il movimento, scrittura al rilascio con origine `'voto'`); un pulsante piccolo "Togli la mia risposta". Il Lettore vede e basta.
172. **Barra oggetto**: "Azzera risposte" (solo proprietario), azioni comuni.

### F11 - Barra degli strumenti (ordine finale)

173. **Ordine**: Seleziona, Mano, '-', Template, Post-it, Testo, Forme (tendina), Linee (tendina), Penna (tendina), Cornice, Allega (tendina: Immagine, File, Link), Altro (tendina: Emoji, Scala di opinione), '-', Annulla, Ripeti, icona "i".
174. **Misure**: pulsanti 52x46 con icona ed etichetta 10,50 px; con altezza finestra sotto 760 px nascondi le etichette (`@media (max-height: 760px)`); su telefono la barra resta in basso orizzontale e scorrevole come oggi.
175. **Post-it rapido**: oltre al clic sul pulsante e al doppio clic sul vuoto, se si trascina il pulsante Post-it sulla lavagna il post-it nasce nel punto di rilascio (`draggable` HTML5 con `dataTransfer.setData('iris/strumento', 'postit')`, gestito dal `drop` di F7).

### F12 - Backup e ripristino

176. **Esporta**: `esportaContenuto` raccoglie già i file di tutti gli oggetti con `o.file` (immagini e allegati): lascialo così.
177. **Importa**: oggi forza `'immagine'` e `'image/jpeg'`. Correggi: `const mime = (dati.match(/^data:([^;,]+)/) || [])[1] || 'application/octet-stream'; D.file.carica(d.id, dati, o.nome || (o.tipo === 'immagine' ? 'immagine' : 'file'), mime)`.

### Criteri di accettazione F

178. **Forme**: 12 forme senza deformazioni degli angoli a qualunque misura; riempimento trasparente; bordo di colore, spessore e stile scelti.
179. **Testo**: dimensione, grassetto, allineamento e colore; il testo lungo nel post-it si riduce da solo; l'autore compare se l'opzione è attiva.
180. **Allegati e link**: caricamento di un PDF da 1 MB e di un file oltre 5 MB (errore); scaricamento; rilascio di file sulla lavagna; incolla di un'immagine e di un indirizzo; il backup con un allegato si ripristina con nome e tipo corretti.
181. **Penna**: tratti lisci, evidenziatore trasparente, gomma che cancella più tratti in un gesto; annulla e ripeti funzionano.
182. **Emoji e scala**: emoji ridimensionabile; nella scala due utenti in due schede si posizionano e si vedono a vicenda in tempo reale.

## Blocco G - Collaborazione in tempo reale

Riferimento: in Miro si vedono contemporaneamente i cursori di tutti con il nome in un'etichetta colorata; si può nascondere i cursori altrui (scelta personale); si può seguire una persona, portare una persona o tutti nella propria vista; chi viene portato segue finché non si muove.

### G1 - Schema dell'awareness

183. **Campi dello stato locale** (`awareness.setLocalStateField`):

| Campo | Contenuto | Aggiornamento |
|---|---|---|
| `utente` | `{ id, nome, colore }` (già esistente) | all'apertura |
| `cursore` | `{ x, y }` in coordinate lavagna, oppure `null` quando il puntatore esce dalla lavagna | ogni 40 ms al massimo |
| `vista` | `{ x, y, w, h }` rettangolo visibile in coordinate lavagna | ogni 150 ms al massimo, su cambi di vista e ridimensionamenti |
| `selezione` | array di id selezionati (massimo 50) | a ogni cambio di selezione |
| `richiamo` | `{ id, vista }` per "Porta tutti qui", oppure `null` | su comando |
| `reazione` | `{ id, e, x, y }` ultima reazione (H4) | su comando |
| `presenta` | `{ cornice }` durante la presentazione (J3), oppure `null` | su comando |

184. **Uscita del puntatore**: `onPointerLeave` della lavagna imposta `cursore: null`; alla chiusura della lavagna l'awareness si distrugge già (`js/sync.js`).

### G2 - Strato in coordinate schermo

185. **Perché**: cursori, selezioni altrui, contorno dei gruppi e reazioni non devono ingrandirsi con lo zoom né finire nell'export. Crea `I.Strato`, figlio di `ReactFlow` (come `Background`), `position: absolute; inset: 0; pointer-events: none; z-index: 5; overflow: hidden`, che legge `useViewport()` e converte: `sx = x * zoom + vx`, `sy = y * zoom + vy`.
186. **Contenuto**: contorno dei gruppi selezionati (E3), selezioni altrui (G4), cursori (G3), reazioni (H4), nell'ordine.

### G3 - Cursori

187. **Disegno** (come nella schermata di riferimento): freccia SVG 20 px piena del colore della persona con bordo bianco 1,5 px; etichetta a pillola spostata di (14, 18) px: sfondo colore della persona, testo bianco 13 px peso 600, padding 3 x 10 px, `border-radius: 999px`, ombra leggera. Mantieni sul contenitore la classe `cursore` (la usa lo script di prova).
188. **Fluidità**: il contenitore del cursore usa `transform: translate(sx, sy)` con `transition: transform 90ms linear`.
189. **Inattività**: se il cursore di una persona non cambia da 8 secondi diventa semitrasparente (opacità 0,35); un aggiornamento ogni 2 secondi basta, solo se ci sono cursori.
190. **Più schede della stessa persona**: mostra un cursore per scheda (ogni scheda è un client), con lo stesso nome.
191. **Mostra o nascondi**: voce Vista "Mostra i cursori degli altri" (`iris:cursori`, predefinito acceso); vale solo per chi la cambia.

### G4 - Selezioni degli altri

192. **Disegno**: per ogni altra persona e ogni id della sua `selezione` trovato nella lavagna (`rf.getInternalNode(id)`, posizione `internals.positionAbsolute` e misure `measured`), un rettangolo con bordo 2 px del colore della persona, raggio 6, e in alto a sinistra una targhetta piccola con il nome. Così si capisce chi sta lavorando su cosa.

### G5 - Persone presenti nella lavagna

193. **Gruppo di avatar** in `.azlav`, a sinistra dei pulsanti: tutte le persone nell'awareness (prima te), al massimo 5 avatar da 28 px con anello del loro colore, poi "+N". Titolo: "Giulia Rinaldi - sta guardando".
194. **Clic su un'altra persona**: menu "Segui Giulia" e "Vai da Giulia" (una sola volta, senza seguire).
195. **Clic su di te**: menu "Porta tutti qui" (solo `ed`) e, se attivo, "Smetti di farti seguire" (azzera `richiamo`).
196. **Guscio**: nella lavagna nascondi la presenza del guscio per non avere due elenchi: `.guscio:has(.lav) #pres { display: none; }`.

### G6 - Segui e Porta tutti qui

197. **Seguire**: stato `seguito` (clientID). A ogni cambio dell'awareness, se la `vista` della persona seguita è cambiata di oltre 2 px: `zoom = clamp(min(larghezzaMia / v.w, altezzaMia / v.h), 0,10, 3)` e `rf.setCenter(v.x + v.w / 2, v.y + v.h / 2, { zoom, duration: 180 })`.
198. **Segno visivo**: bordo interno di 3 px del colore della persona attorno alla lavagna (`.lav.seguendo` con `--col-seguito`) e in alto al centro la pillola "Stai seguendo Giulia" con il pulsante "Smetti".
199. **Smettere**: pulsante "Smetti", oppure qualsiasi tuo `pointerdown`, `wheel` o freccia sulla lavagna.
200. **Porta tutti qui**: imposta `richiamo: { id: U.uid(), vista }`. Chi riceve un richiamo con id mai visto (insieme `visti`) da un altro client inizia a seguirlo e vede il toast "Giulia ti ha portato nella sua vista". "Smetti di farti seguire" imposta `richiamo: null` e chi seguiva per richiamo smette.

### G7 - Collaboratori simulati (solo modalità prova)

201. **Scopo**: vedere più cursori contemporaneamente anche da soli, per provare e mostrare l'app prima della fase 2.
202. **Voce Vista** "Simula collaboratori (prova)", visibile solo se `N.D.modo === 'prova'`, non salvata (si spegne chiudendo la lavagna).
203. **Comportamento**: 3 persone finte prese tra Giulia Rinaldi, Marco Ferri, Elisa Conti, Andrea Neri escludendo te (colori `#7A6AA8`, `#2F9184`, `#B4544A`, `#4E7FA6`); ognuna sceglie un punto a caso nella vista attuale ogni 1,50-3 secondi e ci va con interpolazione (`requestAnimationFrame` limitato a 30 aggiornamenti al secondo); ogni circa 6 secondi una "seleziona" per 3 secondi un oggetto visibile a caso (G4). Gli stati finti si uniscono solo localmente all'elenco dei cursori: niente scritture nel documento, niente awareness inviata.
204. **Etichetta**: il titolo dell'avatar e del cursore aggiunge "(simulato)".

### Criteri di accettazione G

205. **Due o tre schede** con utenti diversi sulla stessa lavagna: ogni scheda vede gli altri cursori con nome e colore, fluidi; le selezioni altrui sono evidenziate; gli avatar compaiono nella lavagna.
206. **Segui e Porta tutti qui** funzionano in entrambe le direzioni e si interrompono muovendosi; nascondere i cursori vale solo per sé.
207. **Simulazione**: con una sola scheda si vedono 3 cursori in movimento; spegnendo spariscono; nessuna modifica al documento (la data di modifica non cambia).

## Blocco H - Facilitazione

### H1 - Stato di sessione condiviso

208. **Mappa nuova**: `const sessione = doc.getMap('sessione')`, con chiavi `timer`, `voto`, `votoRisultati`. Scritture con origine `'sessione'` (non annullabili, non cambiano la data di modifica). Non è nell'`UndoManager` e non si cancella ripristinando una versione.
209. **Chi comanda**: avviano e fermano timer e votazioni solo gli utenti con `ed`; tutti vedono lo stato.

### H2 - Timer condiviso

210. **Dato** `sessione.timer`: `{ fine, resto, durata, da }` (millisecondi): in corsa `fine` = istante di fine e `resto: null`; in pausa `fine: null` e `resto` = tempo rimasto.
211. **Avvio** (pulsante "Timer", icona `timer`, in `.azlav`): tendina con 1, 3, 5, 10, 15 minuti, campo "minuti" libero (1-120) e "Avvia".
212. **Visualizzazione per tutti**: pillola in `.azlav` con il tempo `mm:ss` (aggiornato ogni 250 ms solo mentre il timer esiste); per chi ha `ed`: "+1 min", "Pausa" o "Riprendi", "Ferma". Negli ultimi 10 secondi la pillola diventa `var(--warn)`.
213. **Fine**: a zero la pillola mostra "Tempo!" e lampeggia per 5 secondi, toast "Tempo scaduto" e due bip brevi (preferenza Vista "Suoni", `iris:suoni`, predefinito acceso); ogni client suona una sola volta per lo stesso valore di `fine`. Poi la pillola resta "00:00" con "Chiudi" per chi ha `ed`.
214. **Bip**:

```js
I.bip = () => { try { const a = new (window.AudioContext || window.webkitAudioContext)(); [0, 0.25].forEach((t) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, a.currentTime + t); g.gain.exponentialRampToValueAtTime(0.2, a.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t + 0.18); o.connect(g).connect(a.destination); o.start(a.currentTime + t); o.stop(a.currentTime + t + 0.2); }); setTimeout(() => a.close(), 800); } catch (e) { /* audio non disponibile */ } };
```

### H3 - Votazione condivisa (sostituisce la modalità attuale)

215. **Problema attuale**: la modalità voto è uno stato locale di ogni utente; gli altri non sanno che è in corso e non ci sono limiti. Diventa una sessione condivisa come in Miro.
216. **Avvio** (pulsante "Vota", solo `ed`, se non c'è una votazione attiva): modale "Nuova votazione" con: "Voti per persona" (3, 5, 10, Illimitati; predefinito 5), "Cosa si vota" (Solo i post-it, Tutti gli oggetti), "Durata" (Nessuna, 3, 5, 10 minuti), casella "Nascondi i voti degli altri fino alla fine" (predefinita attiva), casella "Azzera i voti precedenti" (predefinita attiva). Pulsante "Avvia votazione".
217. **Dato** `sessione.voto`: `{ id, da, stato: 'attiva' | 'chiusa', votiPerPersona, tipi: 'postit' | 'tutti', anonima, fine, finiti: { idUtente: true }, avviata, chiusa }`. I voti restano nel campo `voti` degli oggetti (array di id utente, un voto per persona per oggetto), scritti con origine `'voto'`.
218. **Votare** (tutti gli utenti con `ed`, durante la sessione attiva): clic su un oggetto votabile = aggiunge o toglie il proprio voto; se i voti sono finiti, toast "Hai usato tutti i voti: togline uno per votare altro"; se l'oggetto non è votabile, toast "In questa votazione si votano solo i post-it". Durante la votazione nodi non trascinabili e niente doppio clic.
219. **Banda in basso** (per tutti): "Votazione in corso - ti restano 3 voti su 5" + mm:ss se c'è la durata + pulsante "Ho finito" (aggiunge a `finiti`). Per chi l'ha avviata e per il proprietario: "Hanno finito 1 su 3" (persone presenti nell'awareness) e "Termina".
220. **Anonimato**: con `anonima` e sessione attiva i puntini sugli oggetti mostrano solo il proprio voto; alla chiusura compaiono tutti.
221. **Chiusura**: "Termina", oppure allo scadere della durata (scrive solo il client di chi l'ha avviata; se non è presente, chiunque con `ed` può premere "Termina"). Salva `sessione.votoRisultati = { il, partecipanti, totale, classifica: [{ id, testo, n }] }` (prime 20 voci) e apre per tutti il pannello "Risultati" (l'attuale `PannelloVoti`, con in testa "Votazione del 16/11/2026 14:32 - 3 partecipanti, 12 voti" e il pulsante "Nuova votazione").
222. **Lettore**: vede banda e risultati, non vota (il Lettore non scrive nel documento; in fase 2 si potrà valutare un voto tramite funzione del server).

### H4 - Reazioni

223. **Pulsante "Reazioni"** (icona `smile`, per tutti, Lettore compreso): tendina con 👍 ❤️ 😂 🎉 👏 🤔. Clic -> `reazione: { id: U.uid(), e, x, y }` con la posizione del proprio cursore (o il centro della vista); al massimo una ogni 300 ms.
224. **Visualizzazione**: ogni client, per ogni reazione con id nuovo, mostra nello strato (G2) l'emoji 32 px con sotto il nome piccolo, che sale di 80 px e svanisce in 2,50 secondi (animazione CSS), poi la toglie.

### Criteri di accettazione H

225. **Timer**: avviato in una scheda, visibile e sincronizzato nelle altre; pausa, +1 min e fine con suono una sola volta.
226. **Votazione**: avviata da Simo, Giulia vede la banda e vota col limite; con anonimato i voti altrui compaiono solo alla fine; risultati visibili a tutti; il Lettore vede senza votare.
227. **Reazioni** visibili a tutti, anche inviate dal Lettore.

## Blocco I - Template

Riferimento (prima schermata): finestra grande con categorie a sinistra ("Tutti", "Per te", casi d'uso come Riunioni e workshop, Ideazione, Ricerca e design, Agile, Strategia, Diagrammi), ricerca per nome o categoria, schede con anteprima e nome; un template inserito si sposta tutto insieme.

### I1 - Struttura dei dati (`js/template.js`)

228. **Categorie** (`I.CATEGORIE`, in quest'ordine): `idee` Idee e brainstorming, `riunioni` Riunioni e workshop, `retro` Retrospettive, `strategia` Strategia e pianificazione, `ricerca` Ricerca e design, `agile` Agile e progetti, `diagrammi` Diagrammi e mappe.
229. **Famiglie con varianti** (`I.TEMPLATE`): `{ id, nome, categoria, desc, varianti: [{ id, nome, desc, fai }] }`. La prima variante è quella predefinita. Per compatibilità ogni famiglia ha anche `fai = varianti[0].fai` (il codice di `semina` e del backup continua a funzionare).
230. **Ricerca di una variante**: `I.trovaTemplate(idFamiglia, idVariante)` restituisce `{ famiglia, variante }` (variante predefinita se `idVariante` manca).
231. **Aiutanti esistenti** (`P`, `F`, `S`, `T`, `E`) restano; `E` accetta un settimo argomento facoltativo `stile` unito al connettore (`Object.assign`). Nuovi aiutanti:

```js
const Lb = (id, x, y, testo, w) => ({ id, tipo: 'testo', x, y, w: w || 155, h: 24, testo, dim: 14, grassetto: true });
const M = (id, x, y, emoji, lato) => ({ id, tipo: 'emoji', x, y, w: lato || 64, h: lato || 64, emoji });
const A = (id, x, y) => ({ id, tipo: 'ancora', x, y, w: 12, h: 12 });
const TN = I.TINTE; I.TINTE_SEQ = [TN.verde, TN.rosa, TN.azzurro, TN.sabbia, TN.lavanda, TN.grigio];
/* colonne affiancate con post-it vuoti; o: { w, h, n (numero o array), tinte, colori, titolo } */
function colonne(titoli, o) {
  o = o || {}; const w = o.w || 360, h = o.h || 560, gap = 30, y0 = o.titolo ? 90 : 0, out = { oggetti: [], connettori: [] };
  if (o.titolo) out.oggetti.push(T('tit', 0, 0, o.titolo, 28, titoli.length * (w + gap) - gap));
  titoli.forEach((t, i) => {
    const x = i * (w + gap), n = Array.isArray(o.n) ? o.n[i] : (o.n == null ? 2 : o.n), pw = Math.floor((w - 50) / 2);
    out.oggetti.push(F('c' + i, x, y0, w, h, t, (o.tinte || [])[i] || I.TINTE_SEQ[i % I.TINTE_SEQ.length]));
    for (let k = 0; k < n; k++) out.oggetti.push(P('p' + i + '_' + k, x + 20 + (k % 2) * (pw + 10), y0 + 60 + Math.floor(k / 2) * 150, '', (o.colori || [])[i] || C.giallo, pw, 130));
  });
  return out;
}
/* cornici libere: ogni cella è [x, y, w, h, titolo, tinta, numeroPostit, colorePostit]; o: { titolo, larghezza, pre (prefisso degli id, predefinito 'g') } */
function griglia(celle, o) {
  o = o || {}; const y0 = o.titolo ? 90 : 0, g = o.pre || 'g', out = { oggetti: [], connettori: [] };
  if (o.titolo) out.oggetti.push(T('tit', 0, 0, o.titolo, 28, o.larghezza || 900));
  celle.forEach((c, i) => {
    out.oggetti.push(F(g + i, c[0], c[1] + y0, c[2], c[3], c[4], c[5] || I.TINTE_SEQ[i % I.TINTE_SEQ.length]));
    const n = c[6] == null ? 2 : c[6], col = c[7] || C.giallo, perRiga = Math.max(1, Math.floor((c[2] - 30) / 170));
    for (let k = 0; k < n; k++) out.oggetti.push(P(g + i + '_' + k, c[0] + 20 + (k % perRiga) * 170, c[1] + y0 + 60 + Math.floor(k / perRiga) * 150, '', col, 155, 130));
  });
  return out;
}
/* matrice 2x2: q = 4 titoli (alto sx, alto dx, basso sx, basso dx), assi = [asseY, asseX] o null */
const matrice = (q, assi, tinte, n) => {
  const t = griglia([[0, 0, 420, 320, q[0], tinte[0], n], [450, 0, 420, 320, q[1], tinte[1], n], [0, 370, 420, 320, q[2], tinte[2], n], [450, 370, 420, 320, q[3], tinte[3], n]]);
  if (assi) t.oggetti.push(T('ay', 0, -84, '↑ ' + assi[0], 16, 300), T('ax', 570, 704, assi[1] + ' →', 16, 300));
  return t;
};
/* canvas a 9 blocchi (Business Model Canvas, Lean Canvas) */
const canvas9 = (t) => griglia([
  [0, 0, 230, 520, t[0], TN.grigio, 2], [250, 0, 230, 238, t[1], TN.grigio, 1], [250, 282, 230, 238, t[2], TN.grigio, 1],
  [500, 0, 230, 520, t[3], TN.sabbia, 2], [750, 0, 230, 238, t[4], TN.grigio, 1], [750, 282, 230, 238, t[5], TN.grigio, 1],
  [1000, 0, 230, 520, t[6], TN.grigio, 2], [0, 564, 605, 260, t[7], TN.grigio, 3], [625, 564, 605, 260, t[8], TN.grigio, 3]
]);
```

232. **Spazi tra cornici**: il titolo di una cornice sta 30 px sopra di essa; tra cornici impilate lascia sempre almeno 44 px (gli aiutanti lo rispettano). Correggi anche la matrice attuale, dove i titoli in basso coprono le cornici in alto.

### I2 - Catalogo (39 varianti in 18 famiglie, più "Lavagna vuota")

233. **Notazione**: `TN.x` = tinta cornice (F4), `C.x` = colore post-it (F4), `S(id, x, y, w, h, forma, testo, colore)`, `E(id, da, a, daH, aH, testo, stile)`. Testi esatti come scritti.
234. **Lavagna vuota** (`vuota`): nessun oggetto; compare solo nella creazione di una lavagna nuova, in testa.
235. **Brainstorming** (`brainstorming`, idee, "Una domanda e tante idee"):
    - `domanda` "Domanda al centro": l'attuale template brainstorming invariato.
    - `brainwriting` "Brainwriting 6-3-5": `T('tit', 0, 0, 'Brainwriting 6-3-5: 6 persone, 3 idee, 5 minuti a giro', 24, 740)`; per `i` da 0 a 2 `S('h'+i, 180 + i*180, 60, 160, 44, 'arrotondato', 'Idea ' + (i+1), C.grigio)`; per `r` da 0 a 5 `Lb('r'+r, 0, 124 + r*150 + 53, 'Persona ' + (r+1), 160)` e per ogni `i` `P('p'+r+'_'+i, 180 + i*180, 124 + r*150, '', colori[r], 160, 130)` con `colori = [C.giallo, C.verde, C.azzurro, C.rosa, C.lavanda, C.ottone]`.
    - `crazy8` "Crazy 8": `T('tit', 0, 0, 'Crazy 8: 8 schizzi in 8 minuti', 24, 980)`; per `k` da 0 a 7 `F('s'+k, (k % 4) * 250, 100 + Math.floor(k / 4) * 290, 220, 230, 'Schizzo ' + (k+1), TN.bianco)`.
    - `affinita` "Mappa di affinità": `griglia([[0, 0, 760, 400, 'Idee da raggruppare', TN.grigio, 8, C.giallo], [0, 460, 370, 300, 'Gruppo 1', TN.verde, 0], [395, 460, 370, 300, 'Gruppo 2', TN.azzurro, 0], [790, 460, 370, 300, 'Gruppo 3', TN.rosa, 0], [1185, 460, 370, 300, 'Gruppo 4', TN.lavanda, 0]])`.
236. **Mappa mentale** (`mappa`, idee, "Un tema e i suoi rami"):
    - `radiale` "Radiale": l'attuale template mappa mentale.
    - `albero` "Ad albero": `S('c', 0, 260, 200, 80, 'arrotondato', 'Tema', C.ottone)`; rami `S('b'+i, 320, [60, 280, 500][i], 170, 60, 'rett', 'Ramo ' + (i+1), [C.verde, C.azzurro, C.rosa][i])`; per ogni ramo due foglie `S('f'+i+j, 600, by - 40 + j*100, 160, 50, 'rett', 'Idea', C.bianco)` (con `by` la y del ramo); connettori `E(..., 'c', 'b'+i, 'r', 'l', '', { tipo: 'curva', fine: 'nessuna' })` e `E(..., 'b'+i, 'f'+i+j, 'r', 'l', '', { tipo: 'curva', fine: 'nessuna' })`.
237. **Retrospettiva** (`retrospettiva`, retro, "Guardarsi indietro per migliorare"):
    - `bma` "Bene, migliorare, azioni": `colonne(['Cosa è andato bene', 'Cosa migliorare', 'Azioni'], { tinte: [TN.verde, TN.rosa, TN.azzurro], colori: [C.verde, C.rosa, C.azzurro] })`.
    - `ssc` "Start, stop, continue": `colonne(['Inizia a fare', 'Smetti di fare', 'Continua a fare'], { tinte: [TN.verde, TN.rosa, TN.azzurro], colori: [C.verde, C.corallo, C.azzurro] })`.
    - `4l` "4L": `colonne(['Mi è piaciuto', 'Ho imparato', 'Mi è mancato', 'Avrei voluto'], { tinte: [TN.verde, TN.azzurro, TN.rosa, TN.lavanda], colori: [C.verde, C.azzurro, C.rosa, C.lavanda] })`.
    - `msg` "Arrabbiato, deluso, contento": `colonne(['Mi ha fatto arrabbiare', 'Mi ha deluso', 'Mi ha fatto piacere'], { tinte: [TN.rosa, TN.azzurro, TN.verde], colori: [C.corallo, C.azzurro, C.verde] })`.
    - `barca` "Barca a vela": `matrice(['Vento: cosa ci spinge', 'Isola: dove vogliamo arrivare', 'Àncore: cosa ci frena', 'Scogli: i rischi davanti'], null, [TN.verde, TN.azzurro, TN.sabbia, TN.rosa], 2)` più `M('barca', 403, 313, '⛵', 64)`.
238. **Riunione** (`riunione`, riunioni, "Riunioni utili e decisioni chiare"):
    - `agenda` "Agenda e decisioni": `griglia([[0, 0, 380, 560, 'Agenda', TN.grigio, 3, C.bianco], [410, 0, 380, 560, 'Note', TN.azzurro, 2, C.azzurro], [820, 0, 380, 560, 'Decisioni', TN.verde, 2, C.verde], [1230, 0, 380, 560, 'Azioni: chi, cosa, entro quando', TN.sabbia, 2, C.ottone], [0, 620, 1610, 230, 'Parcheggio delle idee', TN.lavanda, 4, C.lavanda]])`.
    - `leancoffee` "Lean Coffee": `colonne(['Argomenti proposti', 'Da discutere', 'In discussione', 'Discusso'], { n: [4, 0, 0, 0], tinte: [TN.sabbia, TN.azzurro, TN.lavanda, TN.verde], colori: [C.giallo] })`.
    - `checkin` "Check-in": `griglia([[0, 300, 640, 360, 'Una parola per oggi', TN.sabbia, 6, C.giallo]])` più `T('tit', 0, 0, 'Check-in: come arrivi oggi?', 28, 640)` e `{ id: 'sc', tipo: 'scala', x: 0, y: 70, w: 640, h: 170, domanda: 'Quanta energia hai oggi?', sinistra: 'Poca', destra: 'Tanta', posizioni: {} }`.
    - `kickoff` "Kick-off di progetto": `griglia` con 6 celle 400x300 in 3 colonne e 2 righe (`x = colonna * 430`, `y = riga * 350`), titoli in ordine 'Obiettivo', 'Perimetro: dentro e fuori', 'Chi fa cosa', 'Rischi', 'Tappe principali', 'Domande aperte', 2 post-it ciascuna, tinte in sequenza.
239. **Matrice 2x2** (`matrice`, strategia, "Decidere su due assi"):
    - `eisenhower` "Urgente e importante": `matrice(['Importante, non urgente: pianifica', 'Urgente e importante: fai subito', 'Né urgente né importante: elimina', 'Urgente, non importante: delega'], ['Importanza', 'Urgenza'], [TN.azzurro, TN.rosa, TN.grigio, TN.sabbia], 0)`.
    - `impatto` "Impatto e sforzo": `matrice(['Vittorie rapide: molto impatto, poco sforzo', 'Grandi progetti: molto impatto, molto sforzo', 'Riempitivi: poco impatto, poco sforzo', 'Da evitare: poco impatto, molto sforzo'], ['Impatto', 'Sforzo'], [TN.verde, TN.azzurro, TN.grigio, TN.rosa], 2)`.
    - `swot` "SWOT": `matrice(['Punti di forza', 'Debolezze', 'Opportunità', 'Minacce'], null, [TN.verde, TN.rosa, TN.azzurro, TN.sabbia], 2)`.
    - `procontro` "Pro e contro": `colonne(['Pro', 'Contro', 'Decisione'], { n: [4, 4, 1], tinte: [TN.verde, TN.rosa, TN.sabbia], colori: [C.verde, C.corallo, C.giallo] })`.
240. **Roadmap** (`roadmap`, strategia, "Dove andiamo e quando"):
    - `opp` "Ora, prossimo, poi": `colonne(['Ora', 'Prossimo', 'Poi'], { n: 4, tinte: [TN.verde, TN.azzurro, TN.lavanda], colori: [C.verde, C.azzurro, C.lavanda] })`.
    - `trimestri` "Per trimestre": intestazioni `S('q'+i, i*320, 0, 300, 50, 'arrotondato', 'T' + (i+1), C.grigio)` per `i` da 0 a 3; righe `['Prodotto', 'Marketing', 'Operazioni']` con `F('r'+r, 0, 100 + r*240, 1260, 190, nome, [TN.verde, TN.sabbia, TN.azzurro][r])` e un post-it per trimestre `P('p'+r+'_'+i, i*320 + 72, 130 + r*240, '', [C.verde, C.ottone, C.azzurro][r], 155, 130)`.
241. **OKR** (`okr`, strategia, "Obiettivo e risultati chiave"), variante unica `base`: `S('o', 0, 0, 1000, 90, 'arrotondato', 'Obiettivo: cosa vogliamo ottenere', C.ottone)`; per `i` da 0 a 2: `S('k'+i, i*350, 170, 300, 80, 'rett', 'Risultato chiave ' + (i+1) + ': come lo misuriamo', C.azzurro)`, `E('e'+i, 'o', 'k'+i, 'b', 't')`, `P('a'+i, i*350 + 72, 300, '', C.giallo, 155, 130)`, `P('b'+i, i*350 + 72, 450, '', C.giallo, 155, 130)`.
242. **Canvas** (`canvas`, strategia, "Il modello di business su una pagina"):
    - `bmc` "Business Model Canvas": `canvas9(['Partner chiave', 'Attività chiave', 'Risorse chiave', 'Proposta di valore', 'Relazioni con i clienti', 'Canali', 'Segmenti di clientela', 'Struttura dei costi', 'Flussi di ricavi'])`.
    - `lean` "Lean Canvas": `canvas9(['Problema', 'Soluzione', 'Metriche chiave', 'Proposta di valore unica', 'Vantaggio competitivo', 'Canali', 'Segmenti di clientela', 'Struttura dei costi', 'Flussi di ricavi'])`.
243. **Persona** (`persona`, ricerca, "Chi è il nostro cliente"), variante unica `base` (come il "Customer profile" della seconda schermata):

```js
S('foto', 0, 0, 180, 180, 'ellisse', 'Foto', C.grigio),
Lb('ln', 220, 0, 'Nome'), P('pn', 220, 28, '', C.lavanda, 155, 72), Lb('le', 395, 0, 'Età'), P('pe', 395, 28, '', C.lavanda, 155, 72),
Lb('lo', 220, 112, 'Occupazione'), P('po', 220, 140, '', C.lavanda, 155, 72), Lb('li', 395, 112, 'Interessi'), P('pi', 395, 140, '', C.lavanda, 155, 72),
Lb('ls', 0, 240, 'Storia', 330), P('ps', 0, 268, '', C.bianco, 330, 262),
Lb('lb', 370, 240, 'Bisogni'), P('pb', 370, 268, '', C.giallo, 155, 110), Lb('lp', 545, 240, 'Problemi'), P('pp', 545, 268, '', C.giallo, 155, 110),
Lb('lg', 370, 400, 'Obiettivi'), P('pg', 370, 428, '', C.rosa, 155, 110), Lb('lc', 545, 400, 'Scenario'), P('pc', 545, 428, '', C.azzurro, 155, 110)
```

244. **Customer journey map** (`percorso`, ricerca, "Il percorso del cliente, fase per fase"), variante unica `base` (come la seconda schermata, senza immagini):
    - intestazioni: `S('h'+i, i*260, 0, 240, 50, 'arrotondato', 'Fase ' + (i+1) + ': ' + ['Scoperta', 'Scelta', 'Acquisto', 'Uso'][i], C.grigio)`;
    - righe (cornici) `F('r'+r, -20, 100 + r*220, 1060, 170, nome, tinta)` per `[['Azioni', TN.lavanda, C.lavanda], ['Punti di contatto', TN.grigio, C.bianco], ['Emozioni', TN.sabbia, null], ['Problemi', TN.azzurro, C.azzurro], ['Opportunità', TN.verde, C.verde]]`;
    - nelle righe con colore: `P('p'+r+'_'+i, i*260 + 42, 120 + r*220, '', colore, 155, 130)` per ogni fase;
    - nella riga Emozioni: `M('m'+i, i*260 + 88, 120 + 440 + [40, 0, 76, 16][i], ['🙂', '🤩', '😟', '😀'][i], 64)` e i connettori `E('em'+i, 'm'+i, 'm'+(i+1), 'r', 'l', '', { tipo: 'curva', fine: 'nessuna', stile: 'tratteggiata', colore: '#16232E' })` per `i` da 0 a 2 (la curva delle emozioni).
245. **Mappa dell'empatia** (`empatia`, ricerca, "Cosa dice, pensa, fa e prova"), variante unica `base`: `matrice(['Dice', 'Pensa', 'Fa', 'Prova'], null, [TN.azzurro, TN.lavanda, TN.verde, TN.rosa], 2)`, più `S('u', 335, 270, 200, 150, 'ellisse', 'Utente', C.ottone)` e `griglia([[0, 740, 420, 240, 'Difficoltà', TN.sabbia, 2], [450, 740, 420, 240, 'Desideri', TN.verde, 2]], { pre: 'x' })` (prefisso diverso per non duplicare gli id della matrice).
246. **Design sprint** (`sprintdesign`, ricerca, "Cinque giorni dall'idea al test"), variante unica: `colonne(['Lunedì: capire', 'Martedì: ideare', 'Mercoledì: decidere', 'Giovedì: prototipare', 'Venerdì: testare'], { w: 320, n: 2 })`.
247. **Kanban** (`kanban`, agile, "Il flusso del lavoro a colonne"):
    - `base` "Da fare, in corso, fatto": `colonne(['Da fare', 'In corso', 'Fatto'], { n: [4, 2, 2], tinte: [TN.grigio, TN.azzurro, TN.verde], colori: [C.giallo, C.azzurro, C.verde] })`.
    - `revisione` "Con revisione": `colonne(['Da fare', 'In corso', 'In revisione', 'Fatto'], { n: [4, 2, 1, 1], tinte: [TN.grigio, TN.azzurro, TN.lavanda, TN.verde], colori: [C.giallo, C.azzurro, C.lavanda, C.verde] })`.
    - `wip` "Con limiti di lavoro in corso": come `revisione` con titoli 'Da fare', 'In corso (massimo 3)', 'In revisione (massimo 2)', 'Fatto'.
248. **Sprint** (`sprint`, agile, "Pianificare e seguire lo sprint"):
    - `pianificazione` "Pianificazione": `griglia([[0, 0, 1250, 200, 'Obiettivo dello sprint', TN.sabbia, 1, C.ottone], [0, 250, 400, 610, 'Backlog', TN.grigio, 6, C.giallo], [430, 250, 400, 610, 'Selezionati per lo sprint', TN.azzurro, 2, C.azzurro], [860, 250, 390, 280, 'Capacità del team', TN.verde, 1, C.verde], [860, 580, 390, 280, 'Rischi e dipendenze', TN.rosa, 1, C.corallo]])`.
    - `daily` "Stand-up quotidiano": `colonne(['Ieri', 'Oggi', 'Ostacoli'], { n: 4, tinte: [TN.grigio, TN.azzurro, TN.rosa], colori: [C.grigio, C.azzurro, C.corallo] })`.
    - `storymap` "Mappa delle storie utente": `S('a'+i, i*300, 0, 260, 70, 'arrotondato', 'Attività ' + (i+1), C.azzurro)` per `i` da 0 a 3; `F('v1', -20, 130, 1220, 330, 'Versione 1', TN.verde)` con `P('s'+i+k, i*300 + 52, 160 + k*150, '', C.giallo, 155, 130)` (`k` 0 e 1); `F('v2', -20, 510, 1220, 190, 'Versione 2', TN.lavanda)` con `P('t'+i, i*300 + 52, 540, '', C.giallo, 155, 130)`.
249. **5 perché** (`perche`, diagrammi, "Risalire alla causa di un problema"), variante unica: `S('p', 0, 0, 360, 80, 'arrotondato', 'Problema', C.rosa)`; per `i` da 1 a 5 `S('w'+i, 0, 140 + (i-1)*130, 360, 80, 'rett', 'Perché? ' + i, C.bianco)`; `S('r', 0, 790, 360, 80, 'arrotondato', 'Causa radice', C.giallo)`; connettori in catena `p -> w1 -> ... -> w5 -> r` con maniglie `b` e `t`.
250. **Flowchart** (`flowchart`, diagrammi, "Passi e decisioni di un processo"):
    - `semplice` "Semplice": l'attuale template flowchart.
    - `corsie` "Con corsie": cornici `F('l1', 0, 0, 1120, 200, 'Cliente', TN.azzurro)`, `F('l2', 0, 250, 1120, 200, 'Vendite', TN.sabbia)`, `F('l3', 0, 500, 1120, 200, 'Magazzino', TN.verde)`; forme `S('s1', 40, 65, 150, 70, 'ellisse', 'Ordine', C.verde)`, `S('s2', 240, 315, 170, 70, 'rett', 'Verifica ordine')`, `S('s3', 470, 295, 170, 110, 'rombo', 'Disponibile?', C.giallo)`, `S('s4', 740, 565, 170, 70, 'rett', 'Prepara la spedizione')`, `S('s5', 930, 65, 150, 70, 'ellisse', 'Consegna', C.rosa)`, `S('s6', 740, 315, 170, 70, 'rett', 'Avvisa il cliente')`; connettori `s1 b -> s2 t`, `s2 r -> s3 l`, `s3 b -> s4 l` testo 'Sì', `s3 r -> s6 l` testo 'No', `s4 r -> s5 b`, `s6 t -> s5 l`.
251. **Organigramma** (`organigramma`, diagrammi, "Chi fa parte di cosa"), variante unica: `S('d', 500, 0, 200, 70, 'arrotondato', 'Direzione', C.ottone)`; `S('a'+i, 105 + i*400, 150, 190, 70, 'rett', 'Area ' + (i+1), C.azzurro)` per `i` da 0 a 2; `S('r'+i+j, 15 + i*400 + j*190, 300, 180, 60, 'rett', 'Ruolo', C.bianco)` per `j` 0 e 1; connettori ortogonali senza punta (`{ fine: 'nessuna' }`): `d b -> a t`, `a b -> r t`.
252. **Lisca di pesce** (`lisca`, diagrammi, "Diagramma di Ishikawa: cause ed effetto"), variante unica: `S('t', 1000, 230, 200, 100, 'arrotondato', 'Problema', C.rosa)`; ancore `A('a0', 0, 274)`, `A('s1', 250, 274)`, `A('s2', 500, 274)`, `A('s3', 750, 274)`; spina `E('sp', 'a0', 't', 'r', 'l', '', { tipo: 'dritta', spessore: 3, colore: '#16232E' })`; categorie `S('c1', 100, 40, 160, 60, 'rett', 'Metodi')`, `S('c2', 350, 40, ..., 'Macchine')`, `S('c3', 600, 40, ..., 'Materiali')`, `S('c4', 100, 460, ..., 'Persone')`, `S('c5', 350, 460, ..., 'Misure')`, `S('c6', 600, 460, ..., 'Ambiente')`; connettori dritti color inchiostro dalle categorie alle ancore: `c1 b -> s1 t`, `c2 b -> s2 t`, `c3 b -> s3 t`, `c4 t -> s1 b`, `c5 t -> s2 b`, `c6 t -> s3 b`.

### I3 - Anteprime generate (`I.anteprima`)

253. **Scopo**: ogni template ha un'anteprima disegnata dai suoi oggetti, senza immagini preparate a mano (sostituisce i disegni CSS `.tp-*`). Restituisce una stringa SVG:

```js
I.anteprima = (t, W, H) => {
  const o = t.oggetti || []; if (!o.length) return '<svg viewBox="0 0 ' + W + ' ' + H + '"></svg>';
  const x0 = Math.min(...o.map((a) => a.x)), y0 = Math.min(...o.map((a) => a.y - (a.tipo === 'cornice' ? 34 : 0)));
  const x1 = Math.max(...o.map((a) => a.x + a.w)), y1 = Math.max(...o.map((a) => a.y + a.h));
  const k = Math.min((W - 12) / (x1 - x0), (H - 12) / (y1 - y0)), ox = (W - (x1 - x0) * k) / 2, oy = (H - (y1 - y0) * k) / 2;
  const X = (v) => ((v - x0) * k + ox).toFixed(1), Y = (v) => ((v - y0) * k + oy).toFixed(1), Lg = (v) => (v * k).toFixed(1), id = {};
  o.forEach((a) => { id[a.id] = a; }); let s = '';
  o.filter((a) => a.tipo === 'cornice').sort((a, b) => b.w * b.h - a.w * a.h).forEach((a) => { s += '<rect x="' + X(a.x) + '" y="' + Y(a.y) + '" width="' + Lg(a.w) + '" height="' + Lg(a.h) + '" rx="' + Lg(10) + '" fill="' + a.colore + '" stroke="rgba(14,29,42,.14)" stroke-width=".6"/>'; });
  (t.connettori || []).forEach((e) => { const a = id[e.da], b = id[e.a]; if (a && b) s += '<line x1="' + X(a.x + a.w / 2) + '" y1="' + Y(a.y + a.h / 2) + '" x2="' + X(b.x + b.w / 2) + '" y2="' + Y(b.y + b.h / 2) + '" stroke="' + (e.colore || '#9AA6AD') + '" stroke-width="1"/>'; });
  o.forEach((a) => {
    if (a.tipo === 'postit') s += '<rect x="' + X(a.x) + '" y="' + Y(a.y) + '" width="' + Lg(a.w) + '" height="' + Lg(a.h) + '" rx="1.5" fill="' + a.colore + '"/>';
    if (a.tipo === 'forma') s += '<path transform="translate(' + X(a.x) + ' ' + Y(a.y) + ')" d="' + I.tracciatoForma(a.forma || 'rett', a.w * k, a.h * k) + '" fill="' + (a.colore === 'trasparente' ? 'none' : a.colore || '#fff') + '" stroke="#7D8C95" stroke-width=".7"/>';
    if (a.tipo === 'testo') s += '<rect x="' + X(a.x) + '" y="' + Y(a.y + a.h * 0.3) + '" width="' + Lg(a.w * 0.7) + '" height="' + Math.max(2, a.h * k * 0.35).toFixed(1) + '" rx="1" fill="#5E6C76" opacity=".45"/>';
    if (a.tipo === 'emoji') s += '<circle cx="' + X(a.x + a.w / 2) + '" cy="' + Y(a.y + a.h / 2) + '" r="' + Lg(a.w * 0.4) + '" fill="#F6E3A6"/>';
    if (a.tipo === 'scala') s += '<rect x="' + X(a.x) + '" y="' + Y(a.y + a.h * 0.35) + '" width="' + Lg(a.w) + '" height="' + Lg(a.h * 0.35) + '" rx="2" fill="#F6E3A6"/>';
    if (a.tipo === 'immagine' || a.tipo === 'allegato' || a.tipo === 'link') s += '<rect x="' + X(a.x) + '" y="' + Y(a.y) + '" width="' + Lg(a.w) + '" height="' + Lg(a.h) + '" rx="2" fill="#DCE2E0"/>';
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100%">' + s + '</svg>';
};
```

### I4 - Finestra di scelta (`js/scegli-template.js`, nuovo, caricato dopo `js/template.js`)

254. **Funzione**: `I.scegliTemplate({ modo })` con `modo` `'nuova'` (creazione lavagna) o `'inserisci'` (lavagna aperta); restituisce una Promise con `{ titolo, famiglia, variante, contenuto, cornice }` oppure `null`. Costruita con `UI.modale` (HTML, come l'attuale `sceltaNuovo`), così funziona sia dalla home sia dalla lavagna.
255. **Misure**: classe `grande`: `width: min(1100px, 96vw); height: min(760px, 92vh); display: grid; grid-template-columns: 220px 1fr;` su telefono una colonna con le categorie come chip scorrevoli in alto.
256. **Colonna sinistra**: "Tutti i template", "Recenti" (se ce ne sono), "I miei template" (con numero), titoletto "Casi d'uso", le 7 categorie. Voce attiva con sfondo `var(--sel)`.
257. **Parte destra**: in modo `'nuova'` in alto il campo "Titolo della lavagna" (segnaposto = nome del template scelto, poi "Senza titolo" per la vuota); campo di ricerca "Cerca per nome o categoria" (filtra su nome, descrizione, categoria e nomi delle varianti con `I.normalizza`); titolo della sezione; griglia di schede (3 colonne, 2 su telefono).
258. **Scheda**: anteprima `I.anteprima(variantePredefinita.fai(), 320, 200)` in un riquadro 16:10 (`var(--sup2)`, bordo `var(--line2)`, raggio 10), nome in grassetto, descrizione `muted` 12,50 px, chip "4 varianti" se più di una.
259. **Dettaglio** (clic su una scheda): pulsante "‹ Tutti i template"; anteprima grande (640x380); nome e descrizione; "Varianti": riquadri selezionabili con mini anteprima (160x100) e nome, l'anteprima grande segue la variante scelta; casella "Inserisci dentro una cornice con il nome del template" (`iris:tplCornice`, predefinita attiva) [punto aperto 313]; pulsante primario "Inserisci" o "Crea lavagna"; doppio clic su una variante = conferma.
260. **Lavagna vuota**: prima scheda solo in modo `'nuova'`; in modo `'inserisci'` non compare.

### I5 - Inserimento: il blocco si sposta tutto insieme

261. **`I.istanzia(fonte, dx, dy, uid, opz)`** (aggiorna l'esistente): id nuovi per oggetti e connettori, **rimappa anche `gruppo`** (stesso vecchio -> stesso nuovo), azzera `voti`, mantiene `z` relativi; se `opz.contenitore` è una stringa e nessuna cornice del template contiene già tutti gli altri oggetti, aggiunge una cornice contenitore: margine 40 px attorno al riquadro di tutti gli oggetti (per le cornici conta anche il titolo, 34 px sopra), `testo = opz.contenitore` (nome della famiglia, più " - " e nome della variante se non è la predefinita), `colore = TN.bianco`.
262. **Inserimento nella lavagna** (`inserisci`): centra il contenuto nella vista come oggi, scrive in una transazione `'azione'`, poi **seleziona tutti gli oggetti inseriti** (estendi `daSel` a un insieme di id) e fa `rf.fitView({ nodes: ids.map((id) => ({ id })), duration: 300, padding: 0.15 })`; toast "Template inserito: trascinalo per spostarlo tutto insieme". Così, appena inserito, il blocco si sposta con un solo trascinamento; dopo, si sposta dal titolo della cornice contenitore (che porta con sé tutto) oppure lo si raggruppa (E3).
263. **Pulsante "Template"** della barra strumenti: apre `I.scegliTemplate({ modo: 'inserisci' })` (sostituisce il menu attuale).
264. **Nuova lavagna**: `sceltaNuovo` in `js/app.js` usa `I.scegliTemplate({ modo: 'nuova' })`; `creaContenuto` scrive `I.istanzia(variante, 0, 0, U.uid, { contenitore })`.
265. **Recenti**: dopo ogni uso salva `'famiglia/variante'` in testa a `iris:tplRecenti` (massimo 6, senza doppioni).

### I6 - I miei template

266. **Salvataggio** (barra della selezione multipla, "Salva come template"): chiede il nome (`UI.chiedi('Salva come template', '', 'Nome')`), prende gli oggetti selezionati (con il contenuto delle cornici) e i connettori interni, porta le coordinate a partire da (0, 0), toglie `voti`, esclude immagini e allegati (toast "Immagini e allegati non vengono salvati nel template" se ce n'erano), salva in `N.KV` alla chiave `'itpl:' + idUtente` un elenco `{ id, nome, creato, oggetti, connettori }`.
267. **Uso**: categoria "I miei template" nella finestra, schede con anteprima e un pulsante piccolo "Elimina" (con conferma). In fase 2 diventerà una tabella del server con proprietario.

### Criteri di accettazione I

268. **Catalogo**: tutte le 39 varianti si inseriscono senza sovrapposizioni dei titoli e con anteprime riconoscibili; la ricerca "retro" trova le retrospettive, "swot" la matrice SWOT.
269. **Blocco unico**: appena inserito, un solo trascinamento sposta tutto il template; dopo un clic altrove, trascinare il titolo della cornice contenitore sposta tutto; annulla toglie il template intero in un passo.
270. **Nuova lavagna** da template con titolo; "I miei template" salva e riusa una selezione con connettori e gruppi.

## Blocco J - Navigazione e presentazione

### J1 - Barra dello zoom (in basso a destra, come Miro)

271. **Sostituisce `Controls`**: componente `I.BarraZoom` dentro `<${Panel} position="bottom-right">` con: pulsante "Cornici" (icona `frames`, apre J2), "-", percentuale (es. "100%", clic -> menu: Adatta allo schermo, Zoom sulla selezione, 50%, 100%, 200%), "+", "Adatta" (icona `fit`), "?" (J5). Stile come `.barra-ogg`. Su telefono resta solo la percentuale.

### J2 - Pannello delle cornici

272. **Elenco** (pannello laterale `cornici`): cornici in ordine di presentazione: se tutte hanno il campo `ordine` usa quello, altrimenti per righe (ordina per `y`, considera la stessa riga entro 80 px, poi per `x`). Riga: numero, pastiglia del colore, titolo (o "Cornice senza titolo"); clic -> inquadra la cornice; per chi ha `ed` frecce su e giù che riscrivono `ordine` da 1 a n per tutte le cornici in una transazione. In testa il pulsante "Presenta".

### J3 - Presentazione

273. **Avvio**: "Presenta" (pannello cornici e `.azlav`, icona `play`); se non ci sono cornici, toast "Per presentare aggiungi almeno una cornice".
274. **Modo presentazione**: classe `presenta` su `.lav` che nasconde barra strumenti, `.azlav`, pannelli, barre degli oggetti e minimappa; nessuna modifica possibile; `requestFullscreen` sulla lavagna (ignora l'errore se negato); per ogni passo `rf.fitView({ nodes: [cornice e oggetti contenuti], padding: 0.04, duration: 400 })`.
275. **Comandi**: in basso al centro "‹", "2 / 7", "›", "Esci"; tasti Freccia destra, Freccia giù, Spazio, PagGiù avanti; Freccia sinistra, Freccia su, PagSu indietro; Inizio e Fine; Esc esce (anche l'uscita dal fullscreen fa uscire).
276. **Pubblico**: durante la presentazione imposta `presenta: { cornice }` nell'awareness; gli altri vedono la pillola "Simo sta presentando" con il pulsante "Segui" (G6).

### J4 - Cerca nella lavagna

277. **Pannello `cerca`** (Ctrl+F, voce del menu Vista): campo con fuoco; risultati sugli oggetti il cui testo (`testo`, `titolo`, `nome`, `domanda`) contiene la ricerca normalizzata, e sui testi dei connettori; riga: tipo ("Post-it", "Forma", ...) e 50 caratteri di testo; "3 risultati"; clic -> seleziona e inquadra; Invio -> risultato successivo in giro.

### J5 - Finestra delle scorciatoie

278. **Contenuto**: la tabella di E8 in una modale (tasto ?, pulsante "?" della barra zoom, voce del menu Vista).

### J6 - Export ampliato

279. **Voci nuove** del menu Esporta: "Selezione in PNG" (con più oggetti selezionati: riquadro dei selezionati) e "Tutte le cornici in PDF, una per pagina" (ordine di J2).
280. **PDF multipagina** (sostituisce `pdfDaJpeg`, che diventa `pdfDaPagine([pagina])`):

```js
I.pdfDaPagine = (pagine) => { /* pagine: [{ dataUrl, wPx, hPx, wPt, hPt }] con JPEG */
  const parti = [], off = []; let len = 0; const add = (s) => { parti.push(s); len += s.length; };
  const obj = (k, corpo) => { off[k] = len; add(k + ' 0 obj\n' + corpo + '\nendobj\n'); };
  const n = pagine.length, tot = 3 + 3 * n;
  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'); obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [' + pagine.map((p, i) => (3 + 3 * i) + ' 0 R').join(' ') + '] /Count ' + n + ' >>');
  pagine.forEach((p, i) => {
    const kp = 3 + 3 * i, ki = kp + 1, kc = kp + 2, bin = atob(p.dataUrl.split(',')[1]);
    obj(kp, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + p.wPt + ' ' + p.hPt + '] /Resources << /XObject << /Im' + i + ' ' + ki + ' 0 R >> >> /Contents ' + kc + ' 0 R >>');
    off[ki] = len; add(ki + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + p.wPx + ' /Height ' + p.hPx + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + bin.length + ' >>\nstream\n'); add(bin); add('\nendstream\nendobj\n');
    const cs = 'q ' + p.wPt + ' 0 0 ' + p.hPt + ' 0 0 cm /Im' + i + ' Do Q'; obj(kc, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
  });
  let x = 'xref\n0 ' + tot + '\n0000000000 65535 f \n'; for (let k = 1; k < tot; k++) x += String(off[k]).padStart(10, '0') + ' 00000 n \n';
  const inizioXref = len; add(x); add('trailer\n<< /Size ' + tot + ' /Root 1 0 R >>\nstartxref\n' + inizioXref + '\n%%EOF');
  const s = parti.join(''), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255;
  return new Blob([u], { type: 'application/pdf' });
};
```

281. **Esclusioni nell'export**: lo strato G2 è fuori dal viewport e non entra; aggiungi alla classe `.esporta` anche il contorno dei gruppi, il lucchetto, le maniglie delle ancore (le ancore restano invisibili) e le barre.

### Criteri di accettazione J

282. **Zoom** dalla barra e da tastiera; pannello cornici con riordino; presentazione a schermo intero con frecce e uscita; ricerca che inquadra i risultati; PDF con una pagina per cornice nell'ordine scelto, apribile in un lettore PDF.

## Blocco K - Home (facoltativo, dopo I) [punto aperto 315]

283. **K1 - Template in evidenza**: sopra "Tue", una fascia "Parti da un template" con 6 schede piccole (Brainstorming, Retrospettiva, Kanban, Riunione, Customer journey map, Flowchart; anteprima 200x120) e il pulsante "Tutti i template" che apre `I.scegliTemplate({ modo: 'nuova' })`. Nel guscio (nucleo 0.5): segnaposto `<div id="intro-home"></div>` dopo l'intestazione della home e chiamata facoltativa `if (c.introHome) c.introHome(U.$('#intro-home', el), Shell)`; `Shell.nuovo(preimpostata)` accetta una scelta già fatta e salta `sceltaNuovo`.
284. **K2 - Anteprime delle lavagne**: alla chiusura della lavagna e ogni 30 secondi se ci sono modifiche, salva `N.KV.set('ianteprima:' + docId, I.anteprima({ oggetti, connettori }, 160, 100))`. Nel guscio (nucleo 0.5): attributo `data-doc` su ogni `.dcard` e chiamata facoltativa `c.decoraHome(el, docs)` dopo il disegno; iris sostituisce il contenuto di `.dico` con l'anteprima salvata (classe `conanteprima`: 64x40 px, raggio 6, bordo `var(--line2)`, sfondo `var(--sup2)`).

## Blocco L - Chiusura

### L1 - Guida e icone "i"

285. **Capitoli**: aggiorna `js/guida.js` con i testi dell'Appendice 3 (capitoli nuovi e aggiornati). Ogni pannello o barra nuova ha la sua icona "i" (`I.Info`) con l'id del capitolo.

### L2 - Lavagna di esempio "Workshop di prodotto" (`i5-workshop`)

286. **Contenuto** (creato in `semina`, con un aiutante `conPrefisso(t, pre, dx, dy)` che antepone `pre` agli id di oggetti e connettori e sposta le coordinate):
    1. cornice bloccata "Istruzioni" (0, -260, 760x200) con un testo: "Benvenuti! A sinistra il profilo del cliente, a destra il suo percorso. Aggiungete post-it, votate le idee migliori e usate il timer per i tempi.";
    2. template Persona con prefisso `pe-` a (0, 0), compilato: Nome "Chiara Bassi", Età "28 anni", Occupazione "Sviluppatrice", Interessi "Viaggi zaino in spalla, fotografia, cucina locale", Storia "Vuole organizzare due settimane nel Sud-est asiatico ma si sente sopraffatta dalla pianificazione.", Bisogni "Strumenti semplici per pianificare e prenotare", Problemi "Troppe opzioni, prezzi poco chiari", Obiettivi "Un itinerario su misura e nel budget", Scenario "Prima volta da sola in un viaggio con più paesi";
    3. template Customer journey map con prefisso `cj-` a (900, 0), con alcuni post-it compilati: Azioni "Cerca mete popolari", "Salva i luoghi preferiti", "Prenota voli e ostelli", "Condivide le foto"; Problemi "Non so da dove cominciare", "Troppe alternative", "Non so se rientro nel budget"; Opportunità "Itinerari suggeriti", "Confronto prezzi chiaro";
    4. scala di opinione a (0, 640): domanda "Quanto conosciamo questo cliente?", sinistra "Per niente", destra "Benissimo", posizioni `{ 'p-giulia': 0.62, 'p-marco': 0.35 }`;
    5. connettore curvo tratteggiato con freccia da `pe-ps` (Storia) a `cj-h0` (Fase 1), testo "ispira";
    6. allegato "Brief del workshop.txt" a (0, 860): file creato con `D.file.carica(docId, 'data:text/plain;base64,' + btoa(unescape(encodeURIComponent(testo))), 'Brief del workshop.txt', 'text/plain')` con testo "Obiettivo: capire come aiutare chi organizza un viaggio con più tappe. Durata: 90 minuti.";
    7. un gruppo di tre post-it (stesso `gruppo`) a (900, 1200) con le idee "Pianificatore guidato", "Avvisi sui prezzi", "Itinerari della community".

### L3 - Pubblicazione

287. **File**: `index.html` con l'ordine di A3 (più `nucleo/config.js` dopo `nucleo/util.js` e `js/scegli-template.js` dopo `js/template.js`); `sw.js` con tutti i file nuovi in `ASSETS` e `VERSION` nuova; `docs/` e `prove/` fuori da `ASSETS`.
288. **Verifica della cache**: con il sito in https (anteprima di GitHub Pages) il toast "Nuova versione disponibile" deve comparire al secondo caricamento.

### L4 - Prove finali

289. **Elenco**: tutti i criteri di accettazione da A a K; `node prove/fumo.js`; tema chiaro e scuro; schermo telefono (Playwright con dispositivo `iPhone 13`: barra strumenti in basso, pannelli dal basso, finestra template a una colonna); offline simulato (pulsante di stato: le modifiche restano in coda e si uniscono al rientro); tre schede con i tre ruoli contemporaneamente.

### L5 - Handoff 0.5

290. **File** `iris-zeno-handoff-0.5.md` nello stile dello 0.4, con le sezioni: **Fatto** (un punto per blocco), **Modifiche al nucleo** (file, funzione, motivo: da riportare in zeno), **Differenze dal piano** (ogni punto adattato e perché), **Da fare** (Simo: configurazione email di C10, scelte dei Punti aperti, pubblicazione; fase 2), **Punti aperti** (quelli ancora senza risposta).

## Appendice 1 - Modello dati completo degli oggetti

291. **Campi comuni**: `id`, `tipo`, `x`, `y`, `w`, `h`, `z`, `voti` (array), `gruppo` (facoltativo), `bloccato` (facoltativo).
292. **Per tipo** (predefiniti tra parentesi):

| Tipo | Campi specifici | Misura iniziale |
|---|---|---|
| `postit` | `testo`, `colore` (giallo), `dim` ('auto'), `grassetto` (false), `allinea` ('sinistra'), `autore` | 160x140 |
| `testo` | `testo`, `dim` (20), `grassetto` (true), `allinea` ('sinistra'), `coloreTesto` | 260x44 |
| `forma` | `forma` ('rett'), `testo`, `colore` (bianco), `bordoColore` ('#7D8C95'), `bordoSpessore` (1,5), `bordoStile` ('continua'), `dim` (14), `grassetto` (false), `allinea` ('centro'), `coloreTesto` | 170x90 |
| `cornice` | `testo` ('Cornice'), `colore` (TN.grigio), `ordine` | 640x420 |
| `immagine` | `file` | proporzionale, lato massimo 360 |
| `allegato` | `file`, `nome`, `mime`, `dimensione` | 260x76 |
| `link` | `url`, `titolo` | 280x84 |
| `disegno` | `punti`, `w0`, `h0`, `colore`, `spessore`, `opacita` | dal tratto |
| `emoji` | `emoji` | 64x64 |
| `scala` | `domanda`, `sinistra`, `destra`, `posizioni` | 600x170 |
| `ancora` | nessuno | 12x12 |

293. **Connettori**: vedi D1. **Sessione**: vedi H1 (`timer`, `voto`, `votoRisultati`). **Awareness**: vedi G1.

## Appendice 2 - Icone nuove (`nucleo/ui.js`, mappa `P`)

294. **Tracciati** (viewBox 24, tratto 1,80, stesso stile delle icone esistenti; nucleo 0.5, aggiunte innocue per zeno):

```js
lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
group: '<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"/><rect x="7" y="7" width="5" height="5" rx="1"/><rect x="12" y="12" width="5" height="5" rx="1"/>',
ungroup: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
pointer: '<path d="M5 3l14 7-6 2-2 6z"/>',
hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.6-2.2L4 17.5c-.8-1-.6-2.4.4-3.1a2 2 0 0 1 2.6.3L8 16"/>',
line: '<path d="M5 19L19 5"/><circle cx="5" cy="19" r="1.6"/><circle cx="19" cy="5" r="1.6"/>',
arrow: '<path d="M5 19L19 5M10 5h9v9"/>',
pen: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
play: '<path d="M7 4l13 8-13 8z"/>',
eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
eyeoff: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>',
target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
zoomin: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M8 11h6M11 8v6"/>',
zoomout: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M8 11h6"/>',
fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
frames: '<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/>',
timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
alignL: '<path d="M4 3v18"/><rect x="7" y="6" width="12" height="4" rx="1"/><rect x="7" y="14" width="7" height="4" rx="1"/>',
alignC: '<path d="M12 3v18"/><rect x="5" y="6" width="14" height="4" rx="1"/><rect x="8" y="14" width="8" height="4" rx="1"/>',
alignR: '<path d="M20 3v18"/><rect x="5" y="6" width="12" height="4" rx="1"/><rect x="10" y="14" width="7" height="4" rx="1"/>',
alignT: '<path d="M3 4h18"/><rect x="6" y="7" width="4" height="12" rx="1"/><rect x="14" y="7" width="4" height="7" rx="1"/>',
alignM: '<path d="M3 12h18"/><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="8" width="4" height="8" rx="1"/>',
alignB: '<path d="M3 20h18"/><rect x="6" y="5" width="4" height="12" rx="1"/><rect x="14" y="10" width="4" height="7" rx="1"/>',
distH: '<path d="M4 3v18M20 3v18"/><rect x="9" y="7" width="6" height="10" rx="1"/>',
distV: '<path d="M3 4h18M3 20h18"/><rect x="7" y="9" width="10" height="6" rx="1"/>'
```

## Appendice 3 - Testi della Guida (`js/guida.js`)

295. **Capitoli aggiornati e nuovi** (stessi campi dei capitoli esistenti):
    - `lavagne` "Lavagne e template", breve: "Una lavagna è uno spazio infinito; puoi partire da zero o da uno dei 39 template."; come: "Con "Nuova lavagna" scegli una categoria, un template e la sua variante. Dentro una lavagna il pulsante Template inserisce un modello nel punto che stai guardando: appena inserito è tutto selezionato e si sposta insieme."; opzioni: "Categorie: idee, riunioni, retrospettive, strategia, ricerca, agile, diagrammi. "I miei template" raccoglie le selezioni che hai salvato.".
    - `strumenti` "Strumenti", breve: "Seleziona, Mano, Template, Post-it, Testo, Forme, Linee, Penna, Cornice, Allega e Altro."; come: "Con Seleziona trascini sul vuoto per selezionare; per spostare la vista tieni premuta la barra spaziatrice, usa il tasto destro o lo strumento Mano. Il doppio clic sul vuoto crea un post-it."; opzioni: "Ogni strumento ha una lettera: V, H, N, T, S, L, P, E, F. Premi ? per l'elenco completo.".
    - `connettori` "Linee e connettori" (nuovo), breve: "Collega gli oggetti o disegna linee libere, con tipo, estremità, stile, spessore e colore."; come: "Trascina da un pallino sul bordo di un oggetto verso un altro oggetto, oppure nel vuoto per una linea libera. Seleziona la linea per cambiarne l'aspetto; trascina un'estremità per riagganciarla."; opzioni: "Tipi: dritta, curva, ortogonale. Estremità: nessuna, freccia, triangolo, cerchio, cerchio vuoto, rombo, barra. La linea successiva nasce con l'ultimo stile usato.".
    - `oggetti` "Oggetti, gruppi e blocco", breve: "Seleziona uno o più oggetti per cambiarne stile, raggrupparli, bloccarli o allinearli."; come: "Un gruppo si seleziona e si sposta con un clic; il doppio clic modifica un singolo elemento. Un oggetto bloccato non si sposta e non si modifica finché non lo sblocchi dal lucchetto."; attenzione: "Blocca cornici e titoli dei template: così si spostano solo i post-it.".
    - `allegati` "Allegati e link" (nuovo), breve: "Aggiungi immagini, file fino a 5 MB e link, anche trascinandoli sulla lavagna o incollandoli."; attenzione: "I file si scaricano, non si aprono dentro iris.".
    - `lavagna` "Lavorare insieme", breve: "Vedi i cursori e le selezioni di tutti, in tempo reale."; come: "Tocca l'avatar di una persona per seguirla o raggiungerla; tocca il tuo per portare tutti nella tua vista."; opzioni: "Dal menu Vista puoi nascondere i cursori degli altri (solo per te) e, in prova, simulare dei collaboratori.".
    - `facilita` "Timer, votazione e reazioni" (nuovo), breve: "Strumenti per guidare un incontro: un timer visibile a tutti, votazioni con limiti e reazioni rapide."; come: "Chi modifica avvia il timer o una votazione; tutti vedono il tempo e la banda della votazione. Le reazioni le può mandare chiunque."; opzioni: "Votazione: voti per persona, solo post-it o tutti gli oggetti, durata, voti nascosti fino alla fine.".
    - `presenta` "Cornici e presentazione" (nuovo), breve: "Le cornici diventano diapositive, nell'ordine che scegli."; come: "Apri il pannello Cornici dalla barra in basso a destra, riordinale e premi Presenta. Frecce per scorrere, Esc per uscire.".
    - `voto`: aggiorna con i testi di H3; `esporta`: aggiungi "Selezione in PNG e tutte le cornici in un PDF, una per pagina."

## Appendice 4 - Script di prova (`prove/fumo.js`)

296. **Uso**: con il server di A2 attivo, `node prove/fumo.js`. Estendilo a ogni blocco con i controlli principali. Fino al Blocco C i pulsanti di ruolo non esistono: usa `{ name: /Simo/ }` e `{ name: /Giulia/ }` al posto di `/Proprietario/` e `/Editor/`.

```js
const { chromium } = require('playwright');
const URL = process.env.IRIS_URL || 'http://localhost:8123/';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1360, height: 860 } });
  const errori = []; const nuova = async () => { const p = await ctx.newPage(); p.on('pageerror', (e) => errori.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); }); return p; };
  const a = await nuova(); await a.goto(URL); await a.waitForSelector('.acard');
  await a.getByRole('button', { name: /Proprietario/ }).click();
  await a.getByText('Nomi per la nuova app').click(); await a.waitForSelector('.react-flow__node');
  const n = await a.locator('.react-flow__node').count(); if (n < 5) throw new Error('nodi mancanti: ' + n);
  const c = await nuova(); await c.goto(URL); await c.getByRole('button', { name: /Editor/ }).click();
  await c.getByText('Nomi per la nuova app').click(); await c.waitForSelector('.react-flow__node');
  await c.mouse.move(700, 400); await c.mouse.move(720, 420);
  await a.waitForSelector('.cursore', { timeout: 5000 });
  if (errori.length) throw new Error('errori in console:\n' + errori.join('\n'));
  console.log('OK'); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
```

## Appendice 5 - Email del codice di accesso (`docs/email/`)

297. **Oggetto**: `{{ .Token }} è il tuo codice di accesso nautargo`.
298. **Versione HTML** (`codice-accesso.html`, stili in linea, nessuna immagine esterna):

```html
<!doctype html><html lang="it"><body style="margin:0;background:#F3F5F4;font-family:Arial,Helvetica,sans-serif;color:#16232E">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:480px;background:#FFFFFF;border:1px solid #DCE2E0;border-radius:14px" cellpadding="0" cellspacing="0">
<tr><td style="padding:28px 28px 8px;font-size:22px;font-weight:bold">nautargo</td></tr>
<tr><td style="padding:8px 28px;font-size:15px;line-height:1.5">Ecco il tuo codice per entrare in iris e zeno:</td></tr>
<tr><td style="padding:12px 28px"><div style="font-family:'Courier New',monospace;font-size:34px;letter-spacing:8px;font-weight:bold;background:#F6EDDD;border-radius:10px;padding:14px 0;text-align:center">{{ .Token }}</div></td></tr>
<tr><td style="padding:8px 28px;font-size:14px;line-height:1.5;color:#5E6C76">Il codice vale 10 minuti. Se non hai chiesto tu di entrare, ignora questa email: senza il codice nessuno può accedere.</td></tr>
<tr><td style="padding:12px 28px 24px"><a href="{{ .SiteURL }}/#/accesso/{{ .TokenHash }}" style="display:inline-block;background:#0E1D2A;color:#F3F5F4;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">Entra con un clic</a></td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #EBEFEE;font-size:12px;color:#5E6C76">Email automatica inviata da noreply@nautargo.com: non rispondere a questo indirizzo.</td></tr>
</table></td></tr></table></body></html>
```

299. **Versione testo** (`codice-accesso.txt`): "nautargo - Il tuo codice di accesso a iris e zeno è {{ .Token }}. Vale 10 minuti. Se non hai chiesto tu di entrare, ignora questa email. Email automatica inviata da noreply@nautargo.com: non rispondere."
300. **Variabili**: `{{ .Token }}`, `{{ .SiteURL }}`, `{{ .TokenHash }}` sono variabili dei modelli email di Supabase; prima dell'uso vanno verificate sulla documentazione aggiornata (vedi Note) e il link va adattato se le due app hanno indirizzi diversi.

## Appendice 6 - Note per la fase 2 (Supabase)

301. **Accesso**: `inviaCodice` -> `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`; `verificaCodice` -> `supabase.auth.verifyOtp({ email, token, type: 'email' })`; `verificaLink` -> `supabase.auth.verifyOtp({ token_hash, type: 'email' })`. Con le rotte a `#` il link usa il token nel percorso (`#/accesso/<token_hash>`), non il frammento con i token che Supabase usa nel flusso implicito. Da verificare sulla documentazione al momento dell'implementazione.
302. **Tempo reale**: awareness (cursori, viste, selezioni, richiami, reazioni) su un canale Realtime per lavagna; documento Yjs con il provider scelto in fase 2; mappa `sessione` dentro il documento Yjs.
303. **Timer**: tra dispositivi diversi gli orologi possono differire; in fase 2 calcola `fine` con l'ora del server (o salva `durata` e istante di avvio del server).
304. **File**: allegati e immagini nello Storage privato con URL firmati a scadenza breve; stesso limite di dimensione deciso nel [punto aperto 318].
305. **I miei template e anteprime della home**: tabelle con proprietario e regole RLS; le anteprime possono restare sul dispositivo.

## Note

306. **Fonti consultate**: Miro Help Center e community (linee: tipi dritta, ortogonale, curva; punte per ciascuna estremità e dimensione legata allo spessore; stili normale, puntinato, tratteggiato; blocco con Ctrl+Maiusc+L; gruppi con doppio clic per il singolo elemento; votazione con voti per persona, durata, "Ho finito", voti anonimi; Porta tutti da me e Segui; cursori nascondibili solo per sé; timer visibile a tutti), documentazione Supabase sull'accesso senza password (codice con `{{ .Token }}` nel modello "Magic Link", una richiesta ogni 60 secondi, scadenza predefinita di un'ora) e guide di terzi sull'SMTP personalizzato. In questa sessione le pagine di help.miro.com e supabase.com non erano raggiungibili direttamente: i dettagli vengono dai riassunti dei risultati di ricerca e vanno ricontrollati per la fase 2 (in particolare `type: 'email'`, `{{ .TokenHash }}` e i limiti di invio).
307. **Fuori ambito 0.5** (funzioni di Miro valutate e rimandate, candidate per la 0.6): tabelle, schede con assegnatario e scadenza, mappe mentali con disposizione automatica, etichette (tag), modalità privata, commenti in un punto qualsiasi e menzioni, assistente AI, videochiamata, widget kanban.
308. **Quantità di lavoro**: i blocchi D, E, F, G e I sono i più corposi; se serve dividere la consegna, una 0.5 con A, B, C, D, E, G e I è già completa rispetto alla richiesta, e F, H, J, K possono seguire in 0.5.1.
309. **Anteprima del logo**: l'immagine `docs/logo-iris-proposta.png` (favicon a varie misure, marchio con logotipo su chiaro e scuro, icone Android e iOS) accompagna questo piano.

## Punti aperti

310. **Dove modificare il nucleo**: (a) qui, marcando le modifiche e riportandole in zeno a mano (predefinito); (b) nel repository sorgente comune, se esiste ancora quello con `tools/build.py`, rigenerando i pacchetti di iris e zeno.
311. **Logo**: (a) variante A, sovrapposizione color crema (predefinita, nell'anteprima); (b) variante C, sovrapposizione "scavata" nel colore della piastrella; (c) variante B, quadrato davanti con un bordo di stacco; (d) variante D, come A con quadrati più piccoli e più aria attorno (tutte in `docs/logo-iris-varianti.png`).
312. **Ruoli dei profili di prova**: (a) tre ruoli attuali, tre pulsanti (predefinito); (b) quattro ruoli come Miro, con "Commentatore" (vede e commenta) e "Visualizzatore" (solo vede ed esporta): tocca nucleo, regole dei dati e zeno; (c) solo rinominare "Lettore" in "Visualizzatore" nelle etichette.
313. **Template inseriti**: (a) tutto selezionato appena inserito, più cornice contenitore con il nome (predefinito); (b) gruppo permanente al posto della cornice; (c) solo selezione, senza cornice né gruppo.
314. **Navigazione predefinita**: (a) mouse, la rotellina ingrandisce (predefinito, come oggi); (b) trackpad, due dita spostano e il pizzico ingrandisce.
315. **Home**: (a) fare K1 e K2 (predefinito se c'è tempo); (b) aggiungere anche preferiti, ricerca e vista elenco come nella prima schermata (tocca il nucleo e quindi anche zeno); (c) rimandare tutta la home.
316. **Voto del Lettore**: (a) il Lettore non vota (predefinito); (b) in fase 2 vota tramite una funzione del server.
317. **Servizio di invio email per noreply@nautargo.com**: serve la scelta del fornitore SMTP (legata al punto 374 delle istruzioni 0.4 sul GDPR); nessun valore predefinito.
318. **Limite dei file in prova**: (a) 5 MB come oggi (predefinito); (b) 10 MB.

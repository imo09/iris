/* iris - capitoli della Guida e testi delle icone "i" (paragrafi come in sestante). I capitoli comuni sono in nucleo/aiuto.js */
(function (N) {
  'use strict';
  const I = N.I = N.I || {};
  I.GUIDA = [
    { id: 'lavagne', titolo: 'Lavagne e template', breve: 'Una lavagna è uno spazio infinito per post-it, forme, testi, immagini e collegamenti.',
      serve: 'Pensare insieme: idee, retrospettive, schemi, mappe.',
      come: 'Crea una lavagna con "Nuova lavagna" e scegli da dove partire: vuota o da un template.',
      opzioni: 'Template: Brainstorming, Retrospettiva, Flowchart, Matrice 2x2, Mappa mentale. Si possono anche inserire in una lavagna già aperta, dal pulsante Template.' },
    { id: 'strumenti', titolo: 'Strumenti', breve: 'Post-it, Testo, Forma, Immagine, Cornice, Template, Annulla e Ripeti.',
      serve: 'Aggiungere oggetti alla lavagna.',
      come: 'Tocca uno strumento: l\'oggetto compare al centro della vista. Il doppio clic su uno spazio vuoto crea subito un post-it lì. Per collegare due oggetti trascina da uno dei pallini sul bordo verso l\'altro oggetto.',
      opzioni: 'Ctrl+Z annulla, Ctrl+Maiusc+Z ripete; Canc o Backspace eliminano l\'oggetto selezionato. Il doppio clic su un connettore gli dà un testo.',
      attenzione: 'Annulla e Ripeti valgono per le tue modifiche, non per quelle degli altri.' },
    { id: 'oggetti', titolo: 'Oggetti e cornici', breve: 'Seleziona un oggetto per cambiarne colore, forma o dimensione, commentarlo, duplicarlo o eliminarlo.',
      serve: 'Dare ordine e significato alla lavagna.',
      come: 'Il doppio clic su un oggetto ne modifica il testo; le maniglie agli angoli lo ridimensionano. Una cornice si sposta dal titolo e porta con sé gli oggetti che contiene.',
      esempio: 'Tre cornici affiancate "Bene", "Da migliorare", "Azioni" per una retrospettiva.' },
    { id: 'lavagna', titolo: 'Lavorare insieme', breve: 'Vedi in tempo reale le modifiche e i cursori degli altri; in alto a destra Vota, Commenti, Versioni ed Esporta.',
      serve: 'Lavorare sulla stessa lavagna anche a distanza.',
      come: 'Le modifiche di tutti si uniscono da sole, anche quelle fatte offline. I cursori mostrano il nome di chi sta guardando.',
      opzioni: 'Dal menu a tre punti: griglia, minimappa, adatta allo schermo.',
      attenzione: 'Il Lettore vede tutto e può commentare, ma non modifica la lavagna.' },
    { id: 'voto', titolo: 'Votazione', breve: 'Con la votazione attiva, un tocco su un post-it aggiunge o toglie il tuo puntino.',
      serve: 'Scegliere insieme le idee migliori.',
      come: 'Premi Vota: si apre la classifica dei post-it più votati. Premi Fine per tornare a lavorare.',
      opzioni: 'Il proprietario può azzerare tutti i voti.' },
    { id: 'commenti', titolo: 'Commenti', breve: 'Note legate a un oggetto, da segnare come risolte.',
      serve: 'Discutere senza riempire la lavagna di testo.',
      come: 'Seleziona un oggetto e premi il fumetto nella sua barra, poi scrivi. Il numero sull\'oggetto conta i commenti da risolvere; toccandolo si apre il filo.',
      opzioni: '"Solo da risolvere" nasconde quelli chiusi. Toccando il nome dell\'oggetto la lavagna lo inquadra.' },
    { id: 'versioni', titolo: 'Versioni', breve: 'Fotografie della lavagna, da ripristinare se serve.',
      serve: 'Tornare indietro dopo un cambiamento grande.',
      come: 'Una versione si salva da sola alla prima modifica di ogni giorno; puoi salvarne una quando vuoi con una nota.',
      attenzione: 'Ripristinare sostituisce la lavagna per tutti; prima viene salvata una versione dello stato attuale. Si tengono le ultime 30.' },
    { id: 'esporta', titolo: 'Esporta', breve: 'PNG o PDF della lavagna intera o della cornice selezionata.',
      serve: 'Condividere il risultato con chi non usa iris o allegarlo a un documento.',
      come: 'Premi Esporta e scegli il formato. Per una cornice, selezionala prima.' }
  ];
})(window.N = window.N || {});

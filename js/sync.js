/* iris - apertura del documento Yjs di una lavagna (punti 145, 184, 280), adattatore "locale":
   copia sul dispositivo con y-indexeddb, tempo reale e cursori tra schede con BroadcastChannel.
   In produzione lo stesso compito lo farà y-supabase; il resto di iris non cambia. */
(function (N) {
  'use strict';
  const L = window.IrisLib, Y = L.Y, AW = L.awareness;
  const D = N.D;

  class ProviderSchede {
    constructor(doc, stanza, awareness) {
      this.doc = doc; this.aw = awareness; this.id = N.TAB + '-' + Math.random().toString(36).slice(2, 6);
      this.bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('iris:' + stanza) : null;
      this.online = !N.Sync.offline;
      this.suUp = (u, origine) => { if (origine !== this && this.online) this.manda({ t: 'up', u }); };
      this.suAw = ({ added, updated, removed }, origine) => { if (origine === 'local' && this.online) this.manda({ t: 'aw', u: AW.encodeAwarenessUpdate(this.aw, added.concat(updated, removed)) }); };
      doc.on('update', this.suUp); awareness.on('update', this.suAw);
      if (this.bc) this.bc.onmessage = (e) => this.ricevi(e.data);
      this.suSync = () => { const on = !N.Sync.offline; if (on === this.online) return; this.online = on; if (on) this.saluta(); else this.esciAw(); };
      N.Sync.on(this.suSync);
      this.saluta();
    }
    manda(m) { if (this.bc) try { this.bc.postMessage(Object.assign({ da: this.id }, m)); } catch (e) { /* */ } }
    saluta() { this.manda({ t: 'sv', sv: Y.encodeStateVector(this.doc), risposta: false }); this.manda({ t: 'aw', u: AW.encodeAwarenessUpdate(this.aw, [this.doc.clientID]) }); this.manda({ t: 'awq' }); }
    ricevi(m) {
      if (!this.online || !m || m.da === this.id) return;
      if (m.t === 'up') Y.applyUpdate(this.doc, m.u, this);
      if (m.t === 'sv') { this.manda({ t: 'up', u: Y.encodeStateAsUpdate(this.doc, m.sv) }); if (!m.risposta) this.manda({ t: 'sv', sv: Y.encodeStateVector(this.doc), risposta: true }); }
      if (m.t === 'aw') AW.applyAwarenessUpdate(this.aw, m.u, this);
      if (m.t === 'awq') this.manda({ t: 'aw', u: AW.encodeAwarenessUpdate(this.aw, [this.doc.clientID]) });
    }
    esciAw() { const stato = this.aw.getLocalState(); this.manda({ t: 'aw', u: AW.encodeAwarenessUpdate(this.aw, [this.doc.clientID], new Map([[this.doc.clientID, null]])) }); const altri = Array.from(this.aw.getStates().keys()).filter((k) => k !== this.doc.clientID); AW.removeAwarenessStates(this.aw, altri, this); this.aw.setLocalState(stato); }
    chiudi() { this.esciAw(); this.doc.off('update', this.suUp); this.aw.off('update', this.suAw); N.Sync.asc = N.Sync.asc.filter((f) => f !== this.suSync); if (this.bc) this.bc.close(); }
  }

  /* apre la lavagna: restituisce il documento già collegato, la presenza (awareness) e una funzione di chiusura */
  D.iris.apri = async function (id) {
    await D.documenti.apri(id);
    const doc = new Y.Doc();
    const idb = new L.IndexeddbPersistence('iris-lavagna:' + id, doc);
    await Promise.race([idb.whenSynced, new Promise((ok) => setTimeout(ok, 2500))]);
    const awareness = new AW.Awareness(doc);
    const prov = new ProviderSchede(doc, id, awareness);
    let tocco = null;
    const suModifica = (u, origine) => { if (origine === 'azione' || origine === 'locale') { clearTimeout(tocco); tocco = setTimeout(() => D.documenti.tocca(id).catch(() => {}), 1500); } };
    doc.on('update', suModifica);
    return { doc, awareness, chiudi() { doc.off('update', suModifica); prov.chiudi(); awareness.destroy(); idb.destroy(); doc.destroy(); } };
  };
  /* stato completo (per backup e versioni) e scrittura di uno stato in una lavagna nuova */
  D.iris.stato = async function (id) { const x = await D.iris.apri(id); const s = Y.encodeStateAsUpdate(x.doc); x.chiudi(); return s; };
  D.iris.scriviStato = async function (id, stato) { const x = await D.iris.apri(id); Y.applyUpdate(x.doc, stato, 'azione'); await new Promise((ok) => setTimeout(ok, 300)); x.chiudi(); };
  N.IrisSync = { ProviderSchede };
})(window.N = window.N || {});

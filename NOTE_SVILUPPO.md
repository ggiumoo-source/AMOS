# AMOS Profilo di Studio — Note di sviluppo

App web interattiva ispirata alla batteria **AMOS** (De Beni, Cornoldi et al.) per generare
un profilo di studio e raccomandazioni di tecniche, in due modalità: **studente** (autovalutazione,
solo report orientativo) e **professionista** (profilo valutativo + report).

> Uso educativo/personale. Gli item e gli stimoli sono ricostruiti dalle appendici della versione
> *secondaria di 2° grado e università*; lo strumento **non sostituisce** la somministrazione clinica.

## Stack e struttura
- React + TypeScript + Vite, Tailwind, shadcn/ui, framer-motion, recharts, lucide-react.
- `src/data/questionnaires.ts` — definizioni questionari, item, scale, tecniche, helper di scoring.
- `src/hooks/useAMOS.ts` — stato app, scoring, selezione tecniche, generazione consigli, persistenza.
- `src/components/` — `LandingScreen`, `StudentInfoForm`, `QuestionnaireSelect`, `QuestionnaireView`
  (con `QItem` e `QShell`), `QSCStimulus`, `ResultsView`, `TechniqueDetail`.

## Build / deploy
```
npm install
npm run dev      # sviluppo su http://localhost:3000
npm run build    # genera dist/ (statico, base relativa './')
```
`dist/` è deployabile su qualsiasi host statico. Esiste anche un file HTML autocontenuto
(JS+CSS inline) per l'uso con doppio clic; nota: su `file://` alcuni browser bloccano
`localStorage`, quindi la ripresa-sessione si attiva solo se l'app è servita da un host.

## Questionari
- **QAS** — 50 item, scala 1-5, 7 scale (Motivazione, Organizzazione, Elaborazione, Flessibilità,
  Concentrazione, Ansia, Atteggiamento), con item in *reverse*.
- **QSS** — 39 strategie × 2 parti (Parte 1 = Utilità 1-7, Parte 2 = Uso 1-7); ogni strategia è
  classificata **funzionale**/**disfunzionale**. Id: Parte 1 `sN`, Parte 2 `sNb`.
- **QAR** — 14 item, scala 1-5, scale Ansia e Resilienza.
- **QSC** — 2 task con stimolo reale (figura globale/analitico 30s; foglio verbale/visivo, fase
  sguardo + memorizzazione 60s + richiamo). 18 item, ancore di risposta differenziate
  (`agreement` = per niente→moltissimo; `frequency` = mai→sempre).

## Logica di scoring (version-agnostic)
- **QAS**: somma per scala con reverse `6 - x`; interpretazione **criteriale** = media-item
  confrontata col punto medio 3 (`criterionScore = media - 3`). Bande/etichette via
  `interpretCriterion` (scale positive) e `interpretCriterionInverse` (Ansia).
- **QSS**: per ogni set (funzionale/disfunzionale) media Utilità (P1) e media Uso (P2);
  **Coerenza = media, item per item, di |Utilità − Uso|** (più bassa = più coerente).
- **QSC**: medie per polo (globale/analitico, verbale/visivo) → stile dominante.
- **QAR**: medie Ansia/Resilienza → livello.
- **Tecniche**: punteggio per debolezze QAS (criterio), QSS (utilità/uso), ansia QAR, e **boost per
  stile cognitivo QSC** (poli visivo/verbale, globale/analitico).
- **Consigli**: micro-azioni concrete legate alle scale deboli + divario utilità-uso QSS + ansia QAR.

## ⚠️ Scelte PROVVISORIE da validare sul manuale
Le appendici contengono solo testi e scale di risposta, **non** la chiave di scoring. Quindi sono
state inferite dai contenuti (e vanno verificate sul manuale secondaria/università):
1. **Mappa QAS item→scala + reverse** — in `questionnaires.ts`, sui 50 item (`scaleId`, `reverse`).
   La scala "Ansia" interna al QAS è debole (l'ansia è propriamente nel QAR).
2. **Classificazione funzionale/disfunzionale QSS** — campo `functional` (disfunzionali provvisori:
   strategie 5,6,7,9,11,20,21,24,38).

## Come attivare la modalità NORMATIVA (norme reali)
L'interpretazione è criteriale di default. Per passare agli z normativi:
1. In `questionnaires.ts` popola `SECUNIV_NORMS` nel formato per indicatore/fascia:
   ```ts
   export const SECUNIV_NORMS = {
     'qas_motivazione': { 'classe3': { mean: 27.4, sd: 4.1 }, /* ... */ },
     // ... una voce per scala/indicatore e fascia (vedi foglio NORMATIVI dell'Excel)
   };
   ```
2. Reintroduci il calcolo z = (grezzo − mean)/sd dove `hasNormsFor()` è vero, mantenendo il criterio
   come fallback. Le bande normative restano z<−1 / −1..1 / >1.
   (Le funzioni 8-15 `QAS_NORMS`, `QSS_NORMS`, `calculateZScore`, `getAgeFromNorms` sono rimaste nel
   file come riferimento: attualmente **non usate** e rimosse dal bundle dal tree-shaking.)

## Stato sintetico
Risolti i bug iniziali (figura QSC mancante, navigazione bloccata). QSC fedele all'appendice.
QAS/QSS con mappe provvisorie. Coerenza QSS secondo formula AMOS. Interpretazione criteriale con slot
norme. PDF completo (tutte le schede via `forceMount` + `@media print`) con grafici a dimensione fissa.
Tecniche pesate sullo stile cognitivo e arricchite (quando usarla / materie). Lettura guidata del
profilo. Questionari accessibili (radiogroup, tastiera, focus, target tattili). Ripresa automatica
della sessione con avviso. Consigli finali azionabili.

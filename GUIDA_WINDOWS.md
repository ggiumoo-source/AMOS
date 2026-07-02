# GUIDA — App Windows portabile per il professionista

Obiettivo: ottenere **un solo file `.exe`** (portabile, senza installazione) che il professionista
apre sul suo PC per **importare e conservare** le valutazioni inviate dagli studenti.

Tu non installi niente sul computer: il file `.exe` viene creato **nel cloud**. Segui i passaggi.

---

## PARTE 1 — Creare il file `.exe` (una volta sola, tutto dal browser)

> ⚠️ PERCHÉ PRIMA NON FUNZIONAVA: quando trascini i file su GitHub, il sito **ignora la cartella
> `.github`** (le cartelle che iniziano con un punto). Per questo nella scheda Actions non compariva
> niente. Qui sotto il metodo che funziona sempre: carichi i file normali e poi **crei a mano** il
> file del workflow (2 minuti).

### 1A — Crea il repository e carica i file
1. Vai su **https://github.com** e crea un account gratuito.
2. In alto a destra: **+** → **New repository** → nome (es. `amos-app`) → **Create repository**.
3. Clicca **“uploading an existing file”**.
4. Scompatta lo zip del progetto, apri la cartella, **seleziona tutto il contenuto**
   (`src`, `electron`, `public`, `index.html`, `package.json`, `vite.config.ts`, ecc.) e **trascinalo**
   nella finestra di GitHub.
   - Se la cartella `.github` non si carica, va bene: la creiamo al passo 1C.
   - NON caricare `node_modules` e `dist`.
5. In fondo → **Commit changes**. Aspetta la fine del caricamento.

### 1B — Verifica (importante)
Nella pagina principale del repo devi vedere **direttamente** `package.json` e la cartella `electron`.
Se invece vedi **una sola cartella** (es. `app`) con tutto dentro, i file sono annidati: il
`package.json` **deve stare alla radice**. In tal caso rifai il caricamento entrando in quella
cartella, oppure scrivimi e ti aiuto.

### 1C — Crea il file del workflow (il passo che risolve tutto)
1. Nel repo clicca **Add file** → **Create new file**.
2. Nel nome file in alto scrivi **esattamente** (con le barre `/`):
   ```
   .github/workflows/build-exe.yml
   ```
   Man mano che scrivi le `/`, GitHub crea da solo le cartelle.
3. Nel riquadro grande **incolla tutto il contenuto** del file `build-exe.yml`
   (è nel progetto in `.github/workflows/build-exe.yml`; se non lo trovi, te lo incollo io).
4. In fondo **Commit changes** → **Commit changes**.

### 1D — Avvia la build e scarica l'exe
1. Scheda **Actions**: ora compare **“Build Windows EXE (portabile)”**.
2. Cliccaci → **Run workflow** → **Run workflow** (o parte da sola dopo il commit).
3. Aspetta il **pallino verde** (8–12 minuti). Apri la build completata.
4. Sezione **Artifacts** in fondo → scarica **AMOS-Windows-portable** (è uno zip): aprilo →
   dentro c'è **`AMOS-Profilo-di-Studio-portable.exe`**.

---

## PARTE 2 — Usare l'app sul PC del professionista
1. Copia il file `.exe` dove vuoi (Desktop, una cartella, una chiavetta).
2. **Doppio clic**. La prima volta Windows può mostrare **“Windows ha protetto il PC”**
   (normale: l'app non è firmata). Clicca **“Ulteriori informazioni”** → **“Esegui comunque”**.
3. Nell'app: **“Archivio pazienti (professionista)”** → **“Importa valutazione”** → scegli il `.json`
   inviato dallo studente. La valutazione si apre e viene salvata.

## PARTE 3 — I dati restano salvati (senza reimportare)
- Le valutazioni restano sul PC (cartella AppData), **non dentro l'exe**: chiudi l'app o sposti l'exe,
  i dati restano e li ritrovi riaprendo. Sono legati a quel PC/utente Windows.
- Nessun dato esce dal computer.

## PARTE 4 — Cosa fa lo studente
1. Apre il file **HTML** e compila i questionari.
2. Nel report clicca **“Esporta per il professionista”** → ottiene un file `.json`.
3. Te lo invia (email, WhatsApp…). Tu lo importi come nella PARTE 2.

---

## (Facoltativo) Aggiornare l'app in futuro
Sostituisci su GitHub i file cambiati: la build riparte da sola e scarichi il nuovo `.exe`.
I dati già salvati sul PC **restano** (sono in AppData, non nell'exe).

## In caso di problemi
- La build in **Actions** è rossa? Aprila, guarda quale passo è fallito e mandami lo screenshot.
- Nessun pulsante “Esegui comunque”? Clicca prima **“Ulteriori informazioni”**.
- App bianca all'avvio? Verifica di aver caricato la cartella `electron` e il `package.json` alla radice.

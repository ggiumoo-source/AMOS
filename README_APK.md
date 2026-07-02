# Ottenere l'APK Android (senza installare nulla sul tuo PC)

Questo progetto è già configurato per generare un'app Android.
Tu **non devi installare niente**: la compilazione avviene automaticamente nel cloud
tramite GitHub Actions, e alla fine scarichi il file `.apk`.

## Passi (tutto da browser)

1. Crea un account gratuito su **https://github.com** (se non l'hai già).
2. Clicca **New repository** → dagli un nome (es. `amos-app`) → **Create repository**.
3. Nella pagina del repo vuoto, clicca **“uploading an existing file”** e trascina
   **tutto il contenuto di questa cartella** (NON la cartella stessa: i file e le sottocartelle
   che vedi qui, incluse `android/`, `src/`, `.github/`, `package.json`, ecc.).
   - Salta pure le cartelle `node_modules` e `dist` se presenti: si ricreano da sole.
4. In fondo, clicca **Commit changes**. Il caricamento può richiedere qualche minuto.
5. Vai sulla scheda **Actions** del repo. Parte da sola la build “Build Android APK”
   (altrimenti clicca sul workflow e poi **Run workflow**).
6. Attendi il pallino verde (≈ 5-10 minuti). Apri la run completata e, in fondo, nella sezione
   **Artifacts**, scarica **AMOS-Profilo-di-Studio-apk**: dentro c'è `app-debug.apk`.

## Installare l'APK sul telefono
1. Copia `app-debug.apk` sul telefono (o scaricalo direttamente da GitHub dal browser del telefono).
2. Aprilo: Android chiederà di consentire l'installazione da “origini sconosciute” → consenti.
3. Fine: trovi “AMOS Profilo di Studio” tra le app.

> È un APK **di debug**, perfetto per installazione personale/su pochi dispositivi.
> Per il Play Store servirebbe un APK/AAB **firmato** (passaggi aggiuntivi): si può aggiungere quando serve.

## In alternativa: usarla come “app” senza APK
Se ti basta un'icona a schermo intero senza file da installare, pubblica la cartella `dist/`
su un hosting statico (o riusa il link kimi.page), aprila con **Chrome su Android** e scegli
**“Aggiungi a schermata Home”**: si comporta come un'app e funziona offline.

## Per chi avesse Android Studio (build locale, opzionale)
```
npm install
npm run build
npx cap sync android
npx cap open android      # poi Build > Build APK
```
oppure: `cd android && ./gradlew assembleDebug` → `android/app/build/outputs/apk/debug/`.

## Per personalizzare nome/icona
- Nome e ID app: `capacitor.config.ts` (`appName`, `appId`).
- Icone: già generate in `android/app/src/main/res/mipmap-*`. Sostituisci i `ic_launcher*.png`
  con le tue (stesse dimensioni) per cambiarle.

import { useState, useEffect, useCallback } from 'react';
import type {
  UserMode, StudentInfo, RawAnswers, AMOSProfile,
  QASScores, QSSScores, QSCScores, QARScores, QuestionnaireResult, StudyTechnique
} from '@/types/amos';
import {
  questionnaires, studyTechniques,
  criterionScore, getLevelFromZ, interpretZ
} from '@/data/questionnaires';

export type AppScreen =
  | 'landing'
  | 'student-info'
  | 'questionnaire-select'
  | 'questionnaire'
  | 'results'
  | 'technique-detail'
  | 'techniques-catalog'
  | 'archive';

export function useAMOS() {
  // Ripresa automatica di una sessione in corso (refresh / chiusura accidentale).
  const SESSION_KEY = 'amos-session-v1';
  const RESUMABLE = ['student-info', 'questionnaire-select', 'questionnaire'];
  const [saved] = useState<Record<string, unknown> | null>(() => {
    try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
  });

  const [mode, setMode] = useState<UserMode>((saved?.mode as UserMode) ?? 'student');
  const [screen, setScreen] = useState<AppScreen>(
    saved && RESUMABLE.includes(saved.screen as string) ? (saved.screen as AppScreen) : 'landing'
  );
  const [studentInfo, setStudentInfo] = useState<StudentInfo>((saved?.studentInfo as StudentInfo) ?? {
    name: '', surname: '', age: 14, gender: '',
    schoolGrade: '', schoolType: '',
    date: new Date().toISOString().split('T')[0],
    examiner: '', notes: '',
  });

  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<string[]>((saved?.selectedQuestionnaires as string[]) ?? []);
  const [currentQIndex, setCurrentQIndex] = useState((saved?.currentQIndex as number) ?? 0);
  const [answers, setAnswers] = useState<RawAnswers>((saved?.answers as RawAnswers) ?? {});
  const [profile, setProfile] = useState<AMOSProfile | null>(null);
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const [resumedSession, setResumedSession] = useState<boolean>(
    !!(saved && RESUMABLE.includes(saved.screen as string))
  );
  const dismissResume = useCallback(() => setResumedSession(false), []);

  // Salvataggio continuo della sessione in corso.
  useEffect(() => {
    try {
      if (screen === 'landing') return;
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        mode, screen, studentInfo, selectedQuestionnaires, currentQIndex, answers,
      }));
    } catch { /* storage non disponibile: si prosegue senza persistenza */ }
  }, [mode, screen, studentInfo, selectedQuestionnaires, currentQIndex, answers]);


  const activeQuestionnaires = questionnaires.filter(q => selectedQuestionnaires.includes(q.id));
  const currentQ = activeQuestionnaires[currentQIndex];
  const isLastQ = currentQIndex === activeQuestionnaires.length - 1;

  // ============================================================
  // NAVIGAZIONE
  // ============================================================

  const startApp = useCallback((m: UserMode) => {
    setMode(m);
    setScreen('student-info');
  }, []);

  const openTechniquesCatalog = useCallback(() => setScreen('techniques-catalog'), []);
  const closeTechniquesCatalog = useCallback(() => setScreen('landing'), []);

  // ============================================================
  // ARCHIVIO PAZIENTI + PONTE EXPORT/IMPORT (Opzione A, senza backend)
  // ============================================================
  const PROFILES_KEY = 'amos-profiles';
  const loadProfiles = (): AMOSProfile[] => {
    try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]'); } catch { return []; }
  };
  const [patients, setPatients] = useState<AMOSProfile[]>([]);

  const openArchive = useCallback(() => { setPatients(loadProfiles()); setScreen('archive'); }, []);
  const closeArchive = useCallback(() => setScreen('landing'), []);
  const openPatient = useCallback((p: AMOSProfile) => { setProfile(p); setScreen('results'); }, []);
  const deletePatient = useCallback((timestamp: number) => {
    const list = loadProfiles().filter(p => p.timestamp !== timestamp);
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(list)); } catch { /* ignore */ }
    setPatients(list);
  }, []);

  // Stringa da esportare (il profilo completo dello studente).
  const exportProfileJSON = useCallback((): string => (profile ? JSON.stringify(profile) : ''), [profile]);

  // Importa un profilo esportato: lo aggiunge all'archivio e lo apre.
  const importProfile = useCallback((json: string): boolean => {
    try {
      const p = JSON.parse(json) as AMOSProfile;
      if (!p || !p.studentInfo || !p.results) return false;
      const list = loadProfiles();
      if (!list.some(x => x.timestamp === p.timestamp)) {
        list.push(p);
        try { localStorage.setItem(PROFILES_KEY, JSON.stringify(list)); } catch { /* ignore */ }
      }
      setPatients(list);
      setProfile(p);
      setScreen('results');
      return true;
    } catch { return false; }
  }, []);

  const updateStudentInfo = useCallback((info: Partial<StudentInfo>) => {
    setStudentInfo(prev => ({ ...prev, ...info }));
  }, []);

  const goToQuestionnaireSelect = useCallback(() => {
    if (studentInfo.name && studentInfo.surname && studentInfo.age) {
      setScreen('questionnaire-select');
    }
  }, [studentInfo]);

  const selectQuestionnaires = useCallback((ids: string[]) => {
    setSelectedQuestionnaires(ids);
    setCurrentQIndex(0);
    setAnswers({});
    setScreen('questionnaire');
  }, []);

  const nextQuestionnaire = useCallback(() => {
    if (isLastQ) {
      calculateProfile();
      setScreen('results');
    } else {
      setCurrentQIndex(p => p + 1);
    }
  }, [isLastQ]);

  const prevQuestionnaire = useCallback(() => {
    if (currentQIndex > 0) setCurrentQIndex(p => p - 1);
    else setScreen('questionnaire-select');
  }, [currentQIndex]);

  // ============================================================
  // RISPOSTE
  // ============================================================

  const setQSSAnswer = useCallback((itemId: string, part: 'part1' | 'part2', value: number) => {
    setAnswers(prev => {
      const qss = prev.qss || {};
      const existing = qss[itemId] || { part1: null, part2: null };
      return {
        ...prev,
        qss: {
          ...qss,
          [itemId]: {
            ...existing,
            [part]: value,
          },
        },
      };
    });
  }, []);

  const setQASAnswer = useCallback((itemId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      qas: { ...prev.qas, [itemId]: value },
    }));
  }, []);

  const setQARAnswer = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      qar: { ...prev.qar, [questionId]: value },
    }));
  }, []);

  const setQSCAnswer = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      qsc: { ...prev.qsc, [questionId]: value },
    }));
  }, []);

  // ============================================================
  // PROGRESSO
  // ============================================================

  const getProgress = useCallback((qId: string): number => {
    switch (qId) {
      case 'qas': {
        const qasDef = questionnaires.find(q => q.id === 'qas');
        if (!qasDef?.items) return 0;
        const ans = answers.qas || {};
        const filled = qasDef.items.filter(i => ans[i.id] != null).length;
        return Math.round((filled / qasDef.items.length) * 100);
      }
      case 'qss': {
        const qssDef = questionnaires.find(q => q.id === 'qss');
        if (!qssDef?.parts) return 0;
        const ans = answers.qss || {};
        let totalItems = 0;
        let filled = 0;
        qssDef.parts.forEach(part => {
          part.items.forEach(item => {
            totalItems++;
            const a = ans[item.id];
            if (a && a[`part${item.part}` as 'part1' | 'part2'] != null) filled++;
          });
        });
        return Math.round((filled / totalItems) * 100);
      }
      case 'qar': {
        const qarDef = questionnaires.find(q => q.id === 'qar');
        if (!qarDef?.questions) return 0;
        const ans = answers.qar || {};
        const filled = qarDef.questions.filter(q => ans[q.id] != null).length;
        return Math.round((filled / qarDef.questions.length) * 100);
      }
      case 'qsc': {
        const qscDef = questionnaires.find(q => q.id === 'qsc');
        if (!qscDef?.tasks) return 0;
        const ans = answers.qsc || {};
        let total = 0; let filled = 0;
        qscDef.tasks.forEach(t => {
          t.questions.forEach(q => {
            total++;
            if (ans[q.id] != null) filled++;
          });
        });
        return Math.round((filled / total) * 100);
      }
      default: return 0;
    }
  }, [answers]);

  const canProceed = useCallback((qId: string): boolean => {
    return getProgress(qId) === 100;
  }, [getProgress]);

  // ============================================================
  // CALCOLO SCORING
  // ============================================================

  const calculateProfile = useCallback(() => {
    const results: Record<string, QuestionnaireResult> = {};

    // ---- QAS SCORING ----
    if (selectedQuestionnaires.includes('qas') && answers.qas) {
      const qasDef = questionnaires.find(q => q.id === 'qas');
      if (qasDef?.items) {
        const scaleScores: Record<string, number> = {};
        const scaleCounts: Record<string, number> = {};
        qasDef.scales.forEach(s => { scaleScores[s.id] = 0; scaleCounts[s.id] = 0; });

        qasDef.items.forEach(item => {
          const val = answers.qas![item.id];
          scaleCounts[item.scaleId] = (scaleCounts[item.scaleId] || 0) + 1;
          if (val != null) {
            const score = item.reverse ? (6 - val) : val;
            scaleScores[item.scaleId] = (scaleScores[item.scaleId] || 0) + score;
          }
        });

        // z criteriale = scostamento della media-item dal punto medio (3) della scala 1-5.
        const cz = (id: string) => {
          const n = scaleCounts[id] || 1;
          return criterionScore(scaleScores[id] / n, 3);
        };

        const scores: QASScores = {
          motivation: scaleScores.motivation,
          organization: scaleScores.organization,
          elaboration: scaleScores.elaboration,
          flexibility: scaleScores.flexibility,
          concentration: scaleScores.concentration,
          anxiety: scaleScores.anxiety,
          attitude: scaleScores.attitude,
          total: Object.values(scaleScores).reduce((a, b) => a + b, 0),
          zMotivation: cz('motivation'),
          zOrganization: cz('organization'),
          zElaboration: cz('elaboration'),
          zFlexibility: cz('flexibility'),
          zConcentration: cz('concentration'),
          zAnxiety: cz('anxiety'),
          zAttitude: cz('attitude'),
          zTotal: 0,
        };
        scores.zTotal = parseFloat(((scores.zMotivation + scores.zOrganization + scores.zElaboration + scores.zFlexibility + scores.zConcentration + scores.zAttitude) / 6).toFixed(2));

        results.qas = { questionnaireId: 'qas', scores };
      }
    }

    // ---- QSS SCORING ----
    if (selectedQuestionnaires.includes('qss') && answers.qss) {
      const qssDef = questionnaires.find(q => q.id === 'qss');
      if (qssDef?.parts) {
        // Abbina ogni strategia tra Parte 1 (utilità) e Parte 2 (uso): id base "sN" <-> "sNb".
        type Strat = { func: boolean; p1: number | null; p2: number | null };
        const byBase: Record<string, Strat> = {};
        qssDef.parts.forEach(part => {
          part.items.forEach(item => {
            const base = item.id.replace(/b$/, '');
            const ans = answers.qss![item.id];
            const rec = (byBase[base] ||= { func: !!item.functional, p1: null, p2: null });
            rec.func = !!item.functional;
            if (item.part === 1) rec.p1 = ans?.part1 ?? rec.p1;
            else rec.p2 = ans?.part2 ?? rec.p2;
          });
        });
        const strategies = Object.values(byBase);
        const F = strategies.filter(s => s.func);
        const D = strategies.filter(s => !s.func);
        const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
        const p1of = (arr: Strat[]) => mean(arr.map(s => s.p1).filter((v): v is number => v != null));
        const p2of = (arr: Strat[]) => mean(arr.map(s => s.p2).filter((v): v is number => v != null));
        // Coerenza AMOS = media, item per item, di |Utilità - Uso| (più bassa = maggiore coerenza).
        const coherence = (arr: Strat[]) => mean(
          arr.filter(s => s.p1 != null && s.p2 != null)
             .map(s => Math.abs((s.p1 as number) - (s.p2 as number)))
        );

        const muF = p1of(F);
        const muDf = p1of(D);
        const moF = p2of(F);
        const moDf = p2of(D);

        const scores: QSSScores = {
          utilityFunctional: parseFloat(muF.toFixed(2)),
          utilityDysfunctional: parseFloat(muDf.toFixed(2)),
          useFunctional: parseFloat(moF.toFixed(2)),
          useDysfunctional: parseFloat(moDf.toFixed(2)),
          coherenceFunctional: parseFloat(coherence(F).toFixed(2)),
          coherenceDysfunctional: parseFloat(coherence(D).toFixed(2)),
          zUtilityFunctional: criterionScore(muF, 4),
          zUtilityDysfunctional: criterionScore(muDf, 4),
          zUseFunctional: criterionScore(moF, 4),
          zUseDysfunctional: criterionScore(moDf, 4),
        };

        results.qss = { questionnaireId: 'qss', scores };
      }
    }

    // ---- QAR SCORING ----
    if (selectedQuestionnaires.includes('qar') && answers.qar) {
      const qarDef = questionnaires.find(q => q.id === 'qar');
      if (qarDef?.questions) {
        let anxiety = 0, resilience = 0;
        let nAnxiety = 0, nResilience = 0;

        qarDef.questions.forEach(q => {
          const val = answers.qar![q.id];
          if (val == null) return;
          if (q.scale === 'anxiety') { anxiety += val; nAnxiety++; }
          else { resilience += val; nResilience++; }
        });

        const avgAnxiety = nAnxiety > 0 ? anxiety / nAnxiety : 0;
        const avgResilience = nResilience > 0 ? resilience / nResilience : 0;

        const scores: QARScores = {
          anxiety: parseFloat(avgAnxiety.toFixed(2)),
          resilience: parseFloat(avgResilience.toFixed(2)),
          level: avgAnxiety > 3.5 ? 'high' : avgAnxiety > 2.5 ? 'medium' : 'low',
        };

        results.qar = { questionnaireId: 'qar', scores };
      }
    }

    // ---- QSC SCORING ----
    if (selectedQuestionnaires.includes('qsc') && answers.qsc) {
      const qscDef = questionnaires.find(q => q.id === 'qsc');
      if (qscDef?.tasks) {
        let global = 0, analytic = 0, verbal = 0, visual = 0;
        let nG = 0, nA = 0, nVb = 0, nVs = 0;

        qscDef.tasks.forEach(t => {
          t.questions.forEach(q => {
            const val = answers.qsc![q.id];
            if (val == null) return;
            if (q.scale === 'global') { global += val; nG++; }
            else if (q.scale === 'analytic') { analytic += val; nA++; }
            else if (q.scale === 'verbal') { verbal += val; nVb++; }
            else if (q.scale === 'visual') { visual += val; nVs++; }
          });
        });

        const avgG = nG > 0 ? global / nG : 0;
        const avgA = nA > 0 ? analytic / nA : 0;
        const avgVb = nVb > 0 ? verbal / nVb : 0;
        const avgVs = nVs > 0 ? visual / nVs : 0;

        const domGA = avgG > avgA ? 'globale' : 'analitico';
        const domVV = avgVb > avgVs ? 'verbale' : 'visivo';

        const scores: QSCScores = {
          global: parseFloat(avgG.toFixed(2)),
          analytic: parseFloat(avgA.toFixed(2)),
          verbal: parseFloat(avgVb.toFixed(2)),
          visual: parseFloat(avgVs.toFixed(2)),
          dominantStyle: `${domGA}-${domVV}`,
        };

        results.qsc = { questionnaireId: 'qsc', scores };
      }
    }

    // ---- PROFILO SINTETICO ----
    const qasResult = results.qas?.scores as QASScores | undefined;
    const qscResult = results.qsc?.scores as QSCScores | undefined;
    const qarResult = results.qar?.scores as QARScores | undefined;

    let dominantStyle = 'Non valutato';
    if (qscResult) {
      dominantStyle = `Globale/Analitico: ${qscResult.global > qscResult.analytic ? 'Globale' : 'Analitico'} | Visivo/Verbale: ${qscResult.visual > qscResult.verbal ? 'Visivo' : 'Verbale'}`;
    }

    let motivationProfile = 'Non valutato';
    if (qasResult) {
      const levels = {
        motivation: getLevelFromZ(qasResult.zMotivation),
        organization: getLevelFromZ(qasResult.zOrganization),
        elaboration: getLevelFromZ(qasResult.zElaboration),
        flexibility: getLevelFromZ(qasResult.zFlexibility),
        concentration: getLevelFromZ(qasResult.zConcentration),
      };
      const lowScales = Object.entries(levels).filter(([, v]) => v === 'low').map(([k]) => k);
      if (lowScales.length === 0) motivationProfile = 'Profilo equilibrato';
      else motivationProfile = `Aree da rafforzare: ${lowScales.join(', ')}`;
    }

    let anxietyLevel = 'Non valutato';
    if (qarResult) {
      anxietyLevel = qarResult.level === 'high' ? 'Ansia elevata' : qarResult.level === 'medium' ? 'Ansia moderata' : 'Ansia bassa';
    } else if (qasResult) {
      anxietyLevel = interpretZ(qasResult.zAnxiety);
    }

    // Seleziona tecniche
    const recommendedTechniques = selectTechniques(results);

    // Genera consigli
    const generalAdvice = generateAdvice(results, qasResult, qscResult, qarResult);

    const newProfile: AMOSProfile = {
      mode,
      studentInfo,
      selectedQuestionnaires,
      results,
      dominantStyle,
      motivationProfile,
      anxietyLevel,
      recommendedTechniques,
      generalAdvice,
      timestamp: Date.now(),
    };

    setProfile(newProfile);

    try {
      const saved = JSON.parse(localStorage.getItem('amos-profiles') || '[]');
      saved.push(newProfile);
      localStorage.setItem('amos-profiles', JSON.stringify(saved));
    } catch { /* ignore */ }
  }, [answers, selectedQuestionnaires, studentInfo, mode]);

  // ============================================================
  // DETAIL VIEW
  // ============================================================

  const goToTechnique = useCallback((id: string) => {
    setSelectedTechniqueId(id);
    setScreen('technique-detail');
  }, []);

  const goBackToResults = useCallback(() => {
    setScreen('results');
    setSelectedTechniqueId(null);
  }, []);

  const resetApp = useCallback(() => {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    setResumedSession(false);
    setMode('student');
    setScreen('landing');
    setStudentInfo({ name: '', surname: '', age: 14, gender: '', schoolGrade: '', schoolType: '', date: new Date().toISOString().split('T')[0], examiner: '', notes: '' });
    setSelectedQuestionnaires([]);
    setCurrentQIndex(0);
    setAnswers({});
    setProfile(null);
    setSelectedTechniqueId(null);
  }, []);

  const selectedTechnique = studyTechniques.find(t => t.id === selectedTechniqueId) || null;

  return {
    mode, screen, studentInfo, currentQ, currentQIndex,
    answers, profile, selectedTechnique, isLastQ,
    questionnaires, activeQuestionnaires, selectedQuestionnaires,
    startApp, updateStudentInfo, goToQuestionnaireSelect,
    selectQuestionnaires, setQSSAnswer, setQASAnswer, setQARAnswer, setQSCAnswer,
    getProgress, canProceed, nextQuestionnaire, prevQuestionnaire,
    goToTechnique, goBackToResults, resetApp,
    resumedSession, dismissResume,
    openTechniquesCatalog, closeTechniquesCatalog,
    studyTechniques,
    patients, openArchive, closeArchive, openPatient, deletePatient,
    exportProfileJSON, importProfile,
  };
}

// ============================================================
// SELEZIONE TECNICHE
// ============================================================

function selectTechniques(results: Record<string, QuestionnaireResult>): StudyTechnique[] {
  const qas = results.qas?.scores as QASScores | undefined;
  const qss = results.qss?.scores as QSSScores | undefined;
  const qar = results.qar?.scores as QARScores | undefined;

  const scores: Record<string, number> = {};
  studyTechniques.forEach(t => {
    scores[t.id] = 0;

    t.targetScales.forEach(scale => {
      if (qas) {
        const zMap: Record<string, number> = {
          motivation: qas.zMotivation,
          organization: qas.zOrganization,
          elaboration: qas.zElaboration,
          flexibility: qas.zFlexibility,
          concentration: qas.zConcentration,
          anxiety: qas.zAnxiety,
          attitude: qas.zAttitude,
        };
        const z = zMap[scale];
        if (z != null && z < 0) scores[t.id] += Math.abs(z) * 2;
      }
      if (qss) {
        if (scale === 'organization') {
          if (qss.zUseFunctional < 0) scores[t.id] += 2;
        }
        if (scale === 'elaboration') {
          if (qss.zUtilityFunctional < 0) scores[t.id] += 2;
        }
      }
    });

    if (qar && qar.level === 'high') {
      if (t.targetScales.includes('anxiety')) scores[t.id] += 3;
    }
  });

  // Boost in base allo stile cognitivo dominante (poli QSC), per direzionare il metodo.
  const qsc = results.qsc?.scores as QSCScores | undefined;
  if (qsc) {
    const styleBoost: Record<string, string[]> = {
      visual: ['schemi_diagrammi', 'mnemonic_techniques'],
      verbal: ['cornell', 'feynman', 'self_explanation', 'elaborative_interrogation'],
      global: ['schemi_diagrammi', 'predictive_reading', 'feynman'],
      analytic: ['cornell', 'interleaving', 'active_recall', 'practice_testing'],
    };
    const poles: string[] = [
      qsc.visual >= qsc.verbal ? 'visual' : 'verbal',
      qsc.global >= qsc.analytic ? 'global' : 'analytic',
    ];
    poles.forEach(p => styleBoost[p].forEach(id => { if (id in scores) scores[id] += 1.5; }));
  }

  return studyTechniques
    .map(t => ({ ...t, _score: scores[t.id] || 0 }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 6);
}

// ============================================================
// GENERAZIONE CONSIGLI
// ============================================================

function generateAdvice(
  results: Record<string, QuestionnaireResult>,
  qas?: QASScores,
  qsc?: QSCScores,
  qar?: QARScores
): string[] {
  const advice: string[] = [];
  const qss = results.qss?.scores as QSSScores | undefined;

  if (qsc) {
    const visual = qsc.visual >= qsc.verbal;
    const global = qsc.global >= qsc.analytic;
    advice.push(visual
      ? 'Sfrutta il tuo orientamento visivo: trasforma i concetti in schemi, mappe e immagini.'
      : 'Sfrutta il tuo orientamento verbale: riformula i contenuti a parole tue, a voce o per iscritto.');
    advice.push(global
      ? "Parti dal quadro d'insieme: inquadra l'argomento a grandi linee prima di entrare nei dettagli."
      : "Procedi per passi: scomponi l'argomento in parti e affrontale una alla volta.");
  }

  if (qas) {
    if (qas.zMotivation < -1) advice.push('Motivazione: collega ogni materia a un obiettivo concreto (un voto, un progetto, una curiosità) e scrivilo in cima agli appunti, così ogni sessione ha uno scopo chiaro.');
    if (qas.zOrganization < -1) advice.push('Organizzazione: una volta a settimana prepara un piano con giorni, orari e argomenti; all\u2019inizio di ogni sessione fissa 2-3 obiettivi del giorno.');
    if (qas.zElaboration < -1) advice.push('Elaborazione: dopo ogni paragrafo chiudi il libro e riformula il concetto a parole tue in una frase; se non ci riesci, rileggi solo quel punto.');
    if (qas.zFlexibility < -1) advice.push('Flessibilità: scegli il metodo in base al materiale \u2014 schema per i processi, riassunto per i concetti, esercizi per le procedure \u2014 invece di studiare tutto allo stesso modo.');
    if (qas.zConcentration < -1) advice.push('Concentrazione: lavora in blocchi da 25 minuti con il telefono in un\u2019altra stanza; quando ti distrai, segna un trattino su un foglio invece di seguire il pensiero.');
    if (qas.zAttitude < -1) advice.push('Atteggiamento: tieni un breve registro degli errori (cosa, perch\u00e9, come evitarlo): \u00e8 il gesto che pi\u00f9 di tutti affina il metodo nel tempo.');
    if (qas.zAnxiety > 0.5) advice.push('Ansia: nei giorni prima di una prova fai una simulazione a tempo \u2014 ridurre l\u2019incertezza \u00e8 il modo pi\u00f9 efficace per abbassare la tensione.');
  }

  if (qss) {
    if (qss.utilityFunctional - qss.useFunctional >= 1.5)
      advice.push('Strategie: conosci metodi efficaci ma li usi poco. Scegline UNO (es. l\u2019auto-spiegazione) e applicalo a ogni sessione per due settimane, finch\u00e9 diventa automatico.');
    if (qss.useDysfunctional >= 4.5)
      advice.push('Riduci le strategie passive (rileggere, sottolineare molto): sostituiscile chiudendo il libro e provando a ripetere a memoria ci\u00f2 che hai appena letto.');
  }

  if (qar) {
    if (qar.level === 'high') {
      advice.push('Ansia da prestazione: prepara un rituale pre-prova breve e ripetibile (tre respiri lenti, rilettura della prima riga, parti dalle domande che sai): d\u00e0 al cervello un segnale di controllo.');
      advice.push('Allena la prova in condizioni reali, a tempo e senza appunti: la familiarit\u00e0 con la situazione riduce l\u2019ansia pi\u00f9 di qualsiasi rassicurazione.');
    }
  }

  if (advice.length === 0) {
    advice.push('Studia in blocchi da 25-30 minuti con brevi pause: la concentrazione cala dopo quella soglia.');
    advice.push('Collega ogni nuovo argomento a qualcosa che gi\u00e0 conosci: i ricordi ancorati durano di pi\u00f9.');
    advice.push('Verifica ci\u00f2 che sai chiudendo il libro e provando a ripetere: \u00e8 pi\u00f9 efficace della semplice rilettura.');
  }

  return advice;
}

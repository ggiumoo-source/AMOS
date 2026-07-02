// ============================================================
// AMOS - Abilità e Metodi di Studio (Cornoldi et al.)
// Tipi TypeScript - Versione fedele alla struttura originale
// ============================================================

export type UserMode = 'psychologist' | 'student';

export interface StudentInfo {
  name: string;
  surname: string;
  age: number;
  gender: 'M' | 'F' | 'NS' | '';
  schoolGrade: string;
  schoolType: string;
  date: string;
  examiner?: string;
  notes?: string;
}

export type ScaleValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;
export type QASValue = number | null;

export interface QuestionnaireDef {
  id: string;
  acronym: string;
  name: string;
  description: string;
  instructions: string;
  optional: boolean;
  scales: ScaleDef[];
  // per QSS che ha 2 parti
  parts?: QuestionnairePart[];
  // per QAS che ha items raggruppati
  items?: QASItem[];
  // per QSC che ha task cognitivi
  tasks?: QSCTask[];
  // per QAR
  questions?: QARQuestion[];
  // per QC
  qcItems?: QCItem[];
  // per QA
  qaItems?: QAItem[];
}

export interface QuestionnairePart {
  id: string;
  name: string;
  instructions: string;
  items: QSSItem[];
}

export interface ScaleDef {
  id: string;
  name: string;
  description: string;
  // reverse scoring items
  reverseItems?: number[];
}

export interface QSSItem {
  id: string;
  text: string;
  functional: boolean; // + = funzionale, - = disfunzionale
  part: 1 | 2; // parte 1 = utilità, parte 2 = uso
}

export interface QASItem {
  id: string;
  text: string;
  scaleId: string;
  reverse?: boolean;
}

export interface QSCTask {
  id: string;
  name: string;
  type: 'drawing' | 'memory' | 'likert' | 'frequency';
  description: string;
  questions: QSCQuestion[];
}

export interface QSCQuestion {
  id: string;
  text: string;
  scale: 'global' | 'analytic' | 'verbal' | 'visual';
  scaleAnchor?: 'agreement' | 'frequency';
}

export interface QARQuestion {
  id: string;
  text: string;
  scale: 'anxiety' | 'resilience';
  reverse?: boolean;
}

export interface QCItem {
  id: string;
  text: string;
  scale: 'intelligence' | 'confidence' | 'objectives';
}

export interface QAItem {
  id: string;
  text: string;
  locus: 'effort' | 'ability' | 'help' | 'task' | 'chance';
  outcome: 'success' | 'failure';
}

// ============================================================
// RISULTATI
// ============================================================

export interface RawAnswers {
  // QSS: itemId -> {part1: value, part2: value}
  qss?: Record<string, { part1: ScaleValue; part2: ScaleValue }>;
  // QAS: itemId -> value
  qas?: Record<string, QASValue>;
  // QSC: questionId -> value
  qsc?: Record<string, QASValue>;
  // QAR: questionId -> value
  qar?: Record<string, QASValue>;
  // QC: itemId -> value
  qc?: Record<string, QASValue>;
  // QA: itemId -> value
  qa?: Record<string, QASValue>;
  // PS: provedi studio
  ps?: Record<string, number>;
}

export interface QSSScores {
  utilityFunctional: number;
  utilityDysfunctional: number;
  useFunctional: number;
  useDysfunctional: number;
  coherenceFunctional: number;
  coherenceDysfunctional: number;
  zUtilityFunctional: number;
  zUtilityDysfunctional: number;
  zUseFunctional: number;
  zUseDysfunctional: number;
}

export interface QASScores {
  motivation: number;
  organization: number;
  elaboration: number;
  flexibility: number;
  concentration: number;
  anxiety: number;
  attitude: number;
  total: number;
  // Punteggi Z
  zMotivation: number;
  zOrganization: number;
  zElaboration: number;
  zFlexibility: number;
  zConcentration: number;
  zAnxiety: number;
  zAttitude: number;
  zTotal: number;
}

export interface QSCScores {
  global: number;
  analytic: number;
  verbal: number;
  visual: number;
  dominantStyle: string;
}

export interface QARScores {
  anxiety: number;
  resilience: number;
  level: 'low' | 'medium' | 'high';
}

export interface QCScores {
  intelligence: number;
  confidence: number;
  objectives: number;
}

export interface QAScores {
  successEffort: number;
  successAbility: number;
  successHelp: number;
  successTask: number;
  successChance: number;
  failureEffort: number;
  failureAbility: number;
  failureHelp: number;
  failureTask: number;
  failureChance: number;
}

export interface PSScores {
  titles: number;
  openQuestions: number;
  trueFalse: number;
  total: number;
}

export interface QuestionnaireResult {
  questionnaireId: string;
  scores: QSSScores | QASScores | QSCScores | QARScores | QCScores | QAScores | PSScores;
}

export interface AMOSProfile {
  mode: UserMode;
  studentInfo: StudentInfo;
  selectedQuestionnaires: string[];
  results: Record<string, QuestionnaireResult>;
  // Sintesi
  dominantStyle: string;
  motivationProfile: string;
  anxietyLevel: string;
  recommendedTechniques: StudyTechnique[];
  generalAdvice: string[];
  timestamp: number;
}

export interface StudyTechnique {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: string[];
  targetScales: string[];
  targetLevels: string[];
  whenToUse?: string;
  subjects?: string[];
}

// Norme per calcolo punteggi Z
export interface NormData {
  age: number;
  mean: number;
  sd: number;
}

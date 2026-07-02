import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Brain, ShieldCheck, Sparkles, RotateCcw,
  TrendingUp, Lightbulb, Star, ChevronRight, Printer, Send
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import type { AMOSProfile, UserMode, QASScores, QSSScores, QARScores, QSCScores } from '@/types/amos';
import { getLevelColor, interpretCriterion, interpretCriterionInverse } from '@/data/questionnaires';

// ============================================================
// LETTURA GUIDATA DEL PROFILO (sintesi in linguaggio chiaro)
// ============================================================
function qssReading(s: QSSScores): string[] {
  const out: string[] = [];
  if (s.utilityFunctional >= 5) out.push('Riconosci bene quali strategie di studio sono efficaci.');
  else if (s.utilityFunctional < 4) out.push('La consapevolezza di quali strategie funzionano è ancora limitata: vale la pena conoscerle meglio.');

  const gap = s.utilityFunctional - s.useFunctional;
  if (gap >= 1.5) out.push('Sai cosa sarebbe utile ma lo metti in pratica meno: il margine di crescita più grande è passare dalla teoria all\u2019uso concreto.');
  else if (s.useFunctional >= 5) out.push('Applichi con buona costanza le strategie efficaci.');

  if (s.useDysfunctional >= 4.5) out.push('Ti appoggi ancora parecchio a strategie superficiali (rilettura passiva, sottolineatura estesa, sottofondo audio): prova a sostituirle gradualmente.');

  if (s.coherenceFunctional >= 1.8) out.push('C\u2019\u00e8 una certa incoerenza tra ci\u00f2 che ritieni utile e ci\u00f2 che fai davvero.');
  else out.push('Buona coerenza tra ci\u00f2 che ritieni utile e ci\u00f2 che usi.');
  return out;
}

function qarReading(s: QARScores): string[] {
  const out: string[] = [];
  if (s.anxiety >= 3.5) out.push('L\u2019ansia legata a studio ed esami \u00e8 marcata.');
  else if (s.anxiety < 2.5) out.push('L\u2019ansia legata allo studio appare contenuta.');
  else out.push('L\u2019ansia legata allo studio \u00e8 su livelli moderati.');

  if (s.resilience >= 3.5) out.push('Disponi di buone risorse di resilienza per riprenderti dalle difficolt\u00e0.');
  else if (s.resilience < 2.5) out.push('Le risorse per fronteggiare le difficolt\u00e0 sono al momento limitate: rafforzarle pu\u00f2 fare la differenza.');

  if (s.anxiety >= 3.5 && s.resilience >= 3.5) out.push('Provi ansia ma hai gli strumenti per gestirla: il lavoro \u00e8 incanalarla, non eliminarla.');
  if (s.anxiety >= 3.5 && s.resilience < 2.5) out.push('La combinazione di ansia alta e poca resilienza merita attenzione: un supporto mirato pu\u00f2 aiutare.');
  return out;
}

function qscReading(s: QSCScores): string[] {
  const visual = s.visual >= s.verbal;
  const global = s.global >= s.analytic;
  return [
    visual
      ? 'Orientamento prevalentemente visivo: ricordi e comprendi meglio con immagini, schemi e mappe.'
      : 'Orientamento prevalentemente verbale: lavori meglio con il testo, le spiegazioni e le parole.',
    global
      ? 'Approccio globale: parti dalla visione d\u2019insieme, ti \u00e8 utile inquadrare prima il quadro generale.'
      : 'Approccio analitico: procedi per dettagli e passi successivi, ti \u00e8 utile scomporre l\u2019argomento.',
    'Le tecniche consigliate nella scheda dedicata sono gi\u00e0 pesate su questo stile.',
  ];
}

function ReadingCard({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <Card className="mb-6 border-indigo-200 bg-indigo-50/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-indigo-600" />Lettura del profilo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface Props {
  profile: AMOSProfile;
  onTechniqueClick: (id: string) => void;
  onRestart: () => void;
  mode: UserMode;
}



export function ResultsView({ profile, onTechniqueClick, onRestart, mode }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExport = useCallback(() => {
    try {
      const data = JSON.stringify(profile);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safe = (s: string) => (s || '').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
      a.href = url;
      a.download = `valutazione_${safe(profile.studentInfo.surname)}_${safe(profile.studentInfo.name)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  }, [profile]);

  const qasScores = profile.results.qas?.scores as QASScores | undefined;
  const qssScores = profile.results.qss?.scores as QSSScores | undefined;
  const qarScores = profile.results.qar?.scores as QARScores | undefined;
  const qscScores = profile.results.qsc?.scores as QSCScores | undefined;

  // Radar data from QAS
  const radarData = qasScores ? [
    { subject: 'Motivazione', A: Math.min(100, Math.max(0, (qasScores.zMotivation + 2) / 4 * 100)) },
    { subject: 'Organizzazione', A: Math.min(100, Math.max(0, (qasScores.zOrganization + 2) / 4 * 100)) },
    { subject: 'Elaborazione', A: Math.min(100, Math.max(0, (qasScores.zElaboration + 2) / 4 * 100)) },
    { subject: 'Flessibilità', A: Math.min(100, Math.max(0, (qasScores.zFlexibility + 2) / 4 * 100)) },
    { subject: 'Concentrazione', A: Math.min(100, Math.max(0, (qasScores.zConcentration + 2) / 4 * 100)) },
    { subject: 'Atteggiamento', A: Math.min(100, Math.max(0, (qasScores.zAttitude + 2) / 4 * 100)) },
  ] : [];

  // Bar data for all scales
  // media-item per scala (1-5); l'Ansia ha valenza invertita per il colore.
  const barData: Array<{ name: string; mean: number; level: 'low' | 'medium' | 'high' }> = [];
  if (qasScores) {
    const s = [
      { n: 'Motivazione', z: qasScores.zMotivation, anx: false },
      { n: 'Organizzazione', z: qasScores.zOrganization, anx: false },
      { n: 'Elaborazione', z: qasScores.zElaboration, anx: false },
      { n: 'Flessibilità', z: qasScores.zFlexibility, anx: false },
      { n: 'Concentrazione', z: qasScores.zConcentration, anx: false },
      { n: 'Ansia', z: qasScores.zAnxiety, anx: true },
      { n: 'Atteggiamento', z: qasScores.zAttitude, anx: false },
    ];
    s.forEach(x => {
      const mean = parseFloat((x.z + 3).toFixed(1));
      const good: 'low' | 'medium' | 'high' = mean >= 3.5 ? 'high' : mean >= 2.5 ? 'medium' : 'low';
      const level: 'low' | 'medium' | 'high' = x.anx
        ? (good === 'high' ? 'low' : good === 'low' ? 'high' : 'medium')
        : good;
      barData.push({ name: x.n, mean, level });
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">Report AMOS</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} title="Esporta la valutazione da inviare al professionista">
              <Send className="w-4 h-4 mr-1" />Esporta per il professionista
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />Stampa / PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onRestart}>
              <RotateCcw className="w-4 h-4 mr-1" />Nuova Valutazione
            </Button>
          </div>
        </div>
      </header>

      <div ref={reportRef} className="max-w-5xl mx-auto px-6 py-8">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-3">
                  {mode === 'psychologist' ? 'Report Professionale' : 'Report Personale'}
                </Badge>
                <h2 className="text-3xl font-bold mb-2">Profilo di Studio</h2>
                <p className="text-blue-100">{profile.studentInfo.name} {profile.studentInfo.surname} · {profile.studentInfo.age} anni{profile.studentInfo.gender ? ` · ${profile.studentInfo.gender === 'M' ? 'M' : profile.studentInfo.gender === 'F' ? 'F' : 'N/S'}` : ''}</p>
                <p className="text-blue-200 text-sm mt-1">{profile.studentInfo.schoolType} · {profile.studentInfo.schoolGrade}</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-blue-200 text-sm">Data</p>
                <p className="text-white font-medium">{profile.studentInfo.date}</p>
                {profile.studentInfo.examiner && <>
                  <p className="text-blue-200 text-sm mt-2">Esaminatore</p>
                  <p className="text-white font-medium">{profile.studentInfo.examiner}</p>
                </>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* SINTESI */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {qscScores && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><Brain className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">Stile Cognitivo</p>
                    <p className="font-semibold text-slate-800 text-sm">{qscScores.dominantStyle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {qasScores && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">Profilo Motivazionale</p>
                    <p className="font-semibold text-slate-800 text-sm">{profile.motivationProfile}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {(qarScores || (qasScores && profile.anxietyLevel !== 'Non valutato')) && (
            <Card className="border-rose-200 bg-rose-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg"><ShieldCheck className="w-5 h-5 text-rose-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500">Livello di Ansia</p>
                    <p className="font-semibold text-slate-800 text-sm">{profile.anxietyLevel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* TABS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue={qasScores ? "qas" : Object.keys(profile.results)[0] || "techniques"} className="space-y-6">
            <TabsList className="flex flex-wrap gap-1 h-auto print:hidden">
              {qasScores && <TabsTrigger value="qas">QAS</TabsTrigger>}
              {qssScores && <TabsTrigger value="qss">QSS</TabsTrigger>}
              {qarScores && <TabsTrigger value="qar">QAR</TabsTrigger>}
              {qscScores && <TabsTrigger value="qsc">QSC</TabsTrigger>}
              <TabsTrigger value="techniques">Tecniche</TabsTrigger>
            </TabsList>

            {/* QAS TAB */}
            {qasScores && (
              <TabsContent forceMount value="qas" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {radarData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="w-5 h-5 text-violet-600" />Profilo QAS
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full overflow-x-auto flex justify-center">
                          <RadarChart width={400} height={280} data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Radar name="Punteggio" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
                          </RadarChart>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <QASDetail scores={qasScores} mode={mode} />
                </div>
                {barData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Profilo per scala (media-item, 1-5)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full overflow-x-auto">
                        <BarChart width={520} height={300} data={barData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
                          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#475569' }} />
                          <Tooltip formatter={(v: number) => [`media ${v} / 5`, '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                          <ReferenceLine x={3} stroke="#94a3b8" strokeDasharray="4 4" />
                          <Bar dataKey="mean" radius={[0, 4, 4, 0]} barSize={20}>
                            {barData.map((e, i) => <Cell key={i} fill={getLevelColor(e.level)} />)}
                          </Bar>
                        </BarChart>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {/* QSS TAB */}
            {qssScores && (
              <TabsContent forceMount value="qss">
                <ReadingCard items={qssReading(qssScores)} />
                <QSSDetail scores={qssScores} mode={mode} />
              </TabsContent>
            )}

            {/* QAR TAB */}
            {qarScores && (
              <TabsContent forceMount value="qar">
                <ReadingCard items={qarReading(qarScores)} />
                <QARDetail scores={qarScores} />
              </TabsContent>
            )}

            {/* QSC TAB */}
            {qscScores && (
              <TabsContent forceMount value="qsc">
                <ReadingCard items={qscReading(qscScores)} />
                <QSCDetail scores={qscScores} />
              </TabsContent>
            )}

            {/* TECHNIQUES TAB */}
            <TabsContent forceMount value="techniques" className="space-y-4">
              <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />Consigli Personalizzati
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {profile.generalAdvice.map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700">{a}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-3">
                {profile.recommendedTechniques.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={`cursor-pointer hover:shadow-md transition-all ${i === 0 ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200'}`}
                      onClick={() => onTechniqueClick(t.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${i === 0 ? 'bg-blue-100' : 'bg-slate-100'}`}>
                              <Lightbulb className={`w-5 h-5 ${i === 0 ? 'text-blue-600' : 'text-slate-500'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-800">{t.title}</h3>
                                {i === 0 && <Badge className="bg-blue-600 text-[10px]">Top</Badge>}
                              </div>
                              <Badge variant="outline" className="text-[10px] mb-1">{t.category}</Badge>
                              <p className="text-sm text-slate-600">{t.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            Report generato il {new Date(profile.timestamp).toLocaleString('it-IT')} · AMOS Profilo di Studio
          </p>
          {mode === 'psychologist' && (
            <p className="text-xs text-slate-400 mt-1">Questo report è uno strumento di supporto e non sostituisce la valutazione clinica.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// DETTAGLI SCALA
// ============================================================

function QASDetail({ scores, mode }: { scores: QASScores; mode: UserMode }) {
  const scales = [
    { label: 'Motivazione', raw: scores.motivation, z: scores.zMotivation },
    { label: 'Organizzazione', raw: scores.organization, z: scores.zOrganization },
    { label: 'Elaborazione', raw: scores.elaboration, z: scores.zElaboration },
    { label: 'Flessibilità', raw: scores.flexibility, z: scores.zFlexibility },
    { label: 'Concentrazione', raw: scores.concentration, z: scores.zConcentration },
    { label: 'Ansia', raw: scores.anxiety, z: scores.zAnxiety },
    { label: 'Atteggiamento', raw: scores.attitude, z: scores.zAttitude },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />Punteggi QAS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
          Interpretazione <strong>criteriale</strong>: confronto della media-item con il punto medio della scala (3 su 5),
          non con un campione normativo. Le bande normative (z) si attiveranno quando saranno inserite le norme della
          versione secondaria/università.
        </p>
        {scales.map(s => {
          const isAnxiety = s.label === 'Ansia';
          const meanItem = s.z + 3; // z criteriale = media-item - 3
          // Livello-colore: per scale positive alto=verde; per Ansia invertito.
          const good: 'low' | 'medium' | 'high' = meanItem >= 3.5 ? 'high' : meanItem >= 2.5 ? 'medium' : 'low';
          const colorLevel: 'low' | 'medium' | 'high' = isAnxiety
            ? (good === 'high' ? 'low' : good === 'low' ? 'high' : 'medium')
            : good;
          const label = isAnxiety ? interpretCriterionInverse(meanItem) : interpretCriterion(meanItem);
          const fill = Math.min(100, Math.max(0, (meanItem - 1) / 4 * 100));
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{s.label}</span>
                <div className="flex items-center gap-2">
                  {mode === 'psychologist' && <span className="text-xs text-slate-400">tot: {s.raw} · media {meanItem.toFixed(1)}/5</span>}
                  <Badge variant="outline" className="text-xs" style={{ borderColor: getLevelColor(colorLevel), color: getLevelColor(colorLevel) }}>
                    {label}
                  </Badge>
                </div>
              </div>
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-1/2 w-px bg-slate-400 z-10" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fill}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getLevelColor(colorLevel) }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">media item {meanItem.toFixed(1)} su 5 (punto medio 3)</p>
            </div>
          );
        })}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">Totale QAS</span>
            <Badge variant="outline" className="text-xs font-bold">Z medio = {scores.zTotal}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QSSDetail({ scores, mode }: { scores: QSSScores; mode: UserMode }) {
  const rows = [
    { label: 'Utilità Funzionale', v: scores.utilityFunctional, z: scores.zUtilityFunctional },
    { label: 'Utilità Disfunzionale', v: scores.utilityDysfunctional, z: scores.zUtilityDysfunctional },
    { label: 'Uso Funzionale', v: scores.useFunctional, z: scores.zUseFunctional },
    { label: 'Uso Disfunzionale', v: scores.useDysfunctional, z: scores.zUseDysfunctional },
    { label: 'Coerenza Funzionale', v: scores.coherenceFunctional, z: null },
    { label: 'Coerenza Disfunzionale', v: scores.coherenceDysfunctional, z: null },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />Punteggi QSS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-700">{r.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-800">M = {r.v}</span>
              {r.z !== null && mode === 'psychologist' && (
                <Badge variant="outline" className="text-xs">Z = {r.z}</Badge>
              )}
            </div>
          </div>
        ))}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          <strong>Nota:</strong> Una coerenza funzionale positiva indica che lo studente ritiene utili le strategie funzionali ma non le usa abbastanza (potenziale da sviluppare). Una coerenza disfunzionale negativa indica che usa meno strategie disfunzionali di quanto ritiene utile (pattern adattivo).
        </div>
      </CardContent>
    </Card>
  );
}

function QARDetail({ scores }: { scores: QARScores }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-600" />Ansia e Resilienza
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
            <p className="text-xs text-rose-600 mb-1">Ansia Media</p>
            <p className="text-3xl font-bold text-rose-700">{scores.anxiety}</p>
            <p className="text-xs text-rose-500 mt-1">su 5</p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-xs text-emerald-600 mb-1">Resilienza Media</p>
            <p className="text-3xl font-bold text-emerald-700">{scores.resilience}</p>
            <p className="text-xs text-emerald-500 mt-1">su 5</p>
          </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700">
          {scores.level === 'high' ? (
            <p>Il livello di ansia risulta <strong>elevato</strong>. Si consiglia di esplorare strategie di gestione dello stress e di valutare il rapporto ansia/prestazione.</p>
          ) : scores.level === 'medium' ? (
            <p>Il livello di ansia risulta <strong>moderato</strong>. Monitorare l'evoluzione nel tempo e rafforzare le strategie di coping.</p>
          ) : (
            <p>Il livello di ansia risulta <strong>basso</strong>. Il profilo ansioso è contenuto, indicando buona capacità di gestione dello stress.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QSCDetail({ scores }: { scores: QSCScores }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-600" />Stili Cognitivi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <p className="text-xs text-blue-600 mb-1">Globale</p>
            <p className="text-3xl font-bold text-blue-700">{scores.global}</p>
            <p className="text-xs text-blue-500 mt-1">media</p>
          </div>
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl text-center">
            <p className="text-xs text-violet-600 mb-1">Analitico</p>
            <p className="text-3xl font-bold text-violet-700">{scores.analytic}</p>
            <p className="text-xs text-violet-500 mt-1">media</p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-xs text-emerald-600 mb-1">Verbale</p>
            <p className="text-3xl font-bold text-emerald-700">{scores.verbal}</p>
            <p className="text-xs text-emerald-500 mt-1">media</p>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
            <p className="text-xs text-orange-600 mb-1">Visivo</p>
            <p className="text-3xl font-bold text-orange-700">{scores.visual}</p>
            <p className="text-xs text-orange-500 mt-1">media</p>
          </div>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Stile dominante:</strong> {scores.dominantStyle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

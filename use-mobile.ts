import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lightbulb, BookOpen, Timer, Brain, Target, Shuffle, Search, FileText, GraduationCap, Sparkles } from 'lucide-react';
import type { StudyTechnique } from '@/types/amos';

interface Props { technique: StudyTechnique; onBack: () => void; }

const ICON_MAP: Record<string, typeof Lightbulb> = {
  schemi_diagrammi: Brain, cornell: BookOpen, spaced_repetition: Timer,
  active_recall: Brain, pomodoro: Timer, self_explanation: Search,
  feynman: FileText, interleaving: Shuffle, elaborative_interrogation: Search,
  predictive_reading: BookOpen, mnemonic_techniques: Brain, practice_testing: GraduationCap,
};

const CAT_COLORS: Record<string, string> = {
  Organizzazione: 'bg-blue-50 text-blue-700 border-blue-200',
  Appunti: 'bg-violet-50 text-violet-700 border-violet-200',
  Memorizzazione: 'bg-rose-50 text-rose-700 border-rose-200',
  Elaborazione: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Gestione Tempo': 'bg-amber-50 text-amber-700 border-amber-200',
  Metacognizione: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Flessibilità: 'bg-orange-50 text-orange-700 border-orange-200',
  Comprensione: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Preparazione: 'bg-lime-50 text-lime-700 border-lime-200',
};

export function TechniqueDetail({ technique, onBack }: Props) {
  const Icon = ICON_MAP[technique.id] || Lightbulb;
  const colorClass = CAT_COLORS[technique.category] || CAT_COLORS.Organizzazione;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Torna al Report</Button>
          <Badge variant="outline" className={colorClass}>{technique.category}</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-2 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-2xl ${colorClass.split(' ')[0]}`}>
                  <Icon className={`w-8 h-8 ${colorClass.split(' ')[1]}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">{technique.title}</h1>
                  <p className="text-slate-600 leading-relaxed">{technique.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {technique.whenToUse && (
            <Card className="mb-6 border-amber-200 bg-amber-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />Quando usarla
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">{technique.whenToUse}</p>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />Aree di intervento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {technique.targetScales.map(s => (
                  <Badge key={s} variant="secondary" className="text-xs capitalize">{translateScale(s)}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {technique.subjects && technique.subjects.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />Materie ideali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {technique.subjects.map(s => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />Guida Passo dopo Passo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technique.steps.map((step, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">{idx + 1}</div>
                    <div className="flex-1 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />Suggerimento Pratico
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Non cercare di applicare tutte le tecniche contemporaneamente. Inizia con quella più alta in classifica e praticala per almeno 2-3 settimane prima di aggiungerne un'altra. La costanza è più importante della quantità di metodi utilizzati.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function translateScale(s: string): string {
  const map: Record<string, string> = {
    motivation: 'Motivazione', organization: 'Organizzazione', elaboration: 'Elaborazione',
    flexibility: 'Flessibilità', concentration: 'Concentrazione', anxiety: 'Ansia', attitude: 'Atteggiamento',
  };
  return map[s] || s;
}

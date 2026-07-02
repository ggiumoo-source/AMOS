import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { ArrowLeft, ArrowRight, BookOpen, Brain, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import type { QuestionnaireDef } from '@/types/amos';

interface Props {
  questionnaires: QuestionnaireDef[];
  onSelect: (ids: string[]) => void;
  onBack: () => void;
}

const ICONS: Record<string, typeof BookOpen> = {
  qas: Sparkles,
  qss: BookOpen,
  qar: ShieldCheck,
  qsc: Brain,
};

const COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  qas: { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
  qss: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  qar: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
  qsc: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
};

export function QuestionnaireSelect({ questionnaires, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<string[]>(['qas', 'qss']);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => setSelected(questionnaires.map(q => q.id));
  const selectCore = () => setSelected(['qas', 'qss']);

  const mandatory = questionnaires.filter(q => !q.optional);
  const optional = questionnaires.filter(q => q.optional);

  const totalItems = selected.reduce((sum, id) => {
    const q = questionnaires.find(x => x.id === id);
    if (!q) return sum;
    if (q.items) return sum + q.items.length;
    if (q.parts) return sum + q.parts.reduce((s, p) => s + p.items.length, 0);
    if (q.questions) return sum + q.questions.length;
    if (q.tasks) return sum + q.tasks.reduce((s, t) => s + t.questions.length, 0);
    return sum;
  }, 0);

  const estMinutes = Math.ceil(totalItems * 0.4);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />Indietro
          </Button>
          <h1 className="text-lg font-semibold text-slate-800">Seleziona i questionari</h1>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Quali aree vuoi valutare?</h2>
            <p className="text-slate-500 text-sm">Puoi scegliere uno o più questionari per ottenere un profilo mirato.</p>
          </div>

          {/* Quick Select */}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={selectCore}>Solo Core (QAS + QSS)</Button>
            <Button variant="outline" size="sm" onClick={selectAll}>Tutti i questionari</Button>
          </div>

          {/* Mandatory */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Questionari Core</h3>
            <div className="space-y-3">
              {mandatory.map(q => <QCard key={q.id} q={q} selected={selected} onToggle={toggle} />)}
            </div>
          </div>

          {/* Optional */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Questionari Opzionali</h3>
            <div className="space-y-3">
              {optional.map(q => <QCard key={q.id} q={q} selected={selected} onToggle={toggle} />)}
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">{selected.length}</div>
                    <div className="text-xs text-slate-500">Questionari</div>
                  </div>
                  <div className="w-px h-8 bg-slate-300" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">{totalItems}</div>
                    <div className="text-xs text-slate-500">Domande</div>
                  </div>
                  <div className="w-px h-8 bg-slate-300" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">~{estMinutes}</div>
                    <div className="text-xs text-slate-500">Minuti</div>
                  </div>
                </div>
                <Button
                  onClick={() => onSelect(selected)}
                  disabled={selected.length === 0}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Inizia
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function QCard({ q, selected, onToggle }: { q: QuestionnaireDef; selected: string[]; onToggle: (id: string) => void }) {
  const colors = COLORS[q.id] || COLORS.qas;
  const Icon = ICONS[q.id] || BookOpen;
  const isSelected = selected.includes(q.id);

  const count = q.items?.length || q.parts?.reduce((s, p) => s + p.items.length, 0) || q.questions?.length || q.tasks?.reduce((s, t) => s + t.questions.length, 0) || 0;

  return (
    <Card
      className={`cursor-pointer border-2 transition-all ${isSelected ? `${colors.border} shadow-md` : 'border-transparent hover:border-slate-200'}`}
      onClick={() => onToggle(q.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox checked={isSelected} className="mt-1" onCheckedChange={() => onToggle(q.id)} />
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-800">{q.acronym} - {q.name}</h4>
              {q.optional && <Badge variant="outline" className="text-[10px]">Opzionale</Badge>}
              {isSelected && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </div>
            <p className="text-xs text-slate-500 mb-2">{q.description}</p>
            <Badge variant="secondary" className={`text-[10px] ${colors.badge}`}>{count} item</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

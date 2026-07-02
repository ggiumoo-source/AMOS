import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, BookOpen, Brain, ShieldCheck, Sparkles } from 'lucide-react';
import type { QuestionnaireDef, RawAnswers } from '@/types/amos';
import { QSCStimulus } from '@/components/QSCStimulus';

interface Props {
  questionnaire: QuestionnaireDef;
  qIndex: number;
  totalQ: number;
  answers: RawAnswers;
  onQSSAnswer: (itemId: string, part: 'part1' | 'part2', value: number) => void;
  onQASAnswer: (itemId: string, value: number) => void;
  onQARAnswer: (qId: string, value: number) => void;
  onQSCAnswer: (qId: string, value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  isLast: boolean;
  getProgress: (qId: string) => number;
}

const Q_COLORS: Record<string, { bg: string; accent: string; icon: typeof BookOpen }> = {
  qas: { bg: 'bg-violet-500', accent: 'text-violet-600', icon: Sparkles },
  qss: { bg: 'bg-blue-500', accent: 'text-blue-600', icon: BookOpen },
  qar: { bg: 'bg-rose-500', accent: 'text-rose-600', icon: ShieldCheck },
  qsc: { bg: 'bg-amber-500', accent: 'text-amber-600', icon: Brain },
};

export function QuestionnaireView({
  questionnaire, qIndex, totalQ, answers,
  onQSSAnswer, onQASAnswer, onQARAnswer, onQSCAnswer,
  onNext, onPrev, canProceed, isLast, getProgress
}: Props) {
  const [currentPart, setCurrentPart] = useState(0);
  const [page, setPage] = useState(0);
  const [stimulusDone, setStimulusDone] = useState<Record<string, boolean>>({});
  const colors = Q_COLORS[questionnaire.id] || Q_COLORS.qas;
  const Icon = colors.icon;
  const progress = getProgress(questionnaire.id);

  useEffect(() => { setPage(0); setCurrentPart(0); setStimulusDone({}); }, [questionnaire.id]);

  // RENDER QAS
  if (questionnaire.id === 'qas' && questionnaire.items) {
    const perPage = 7;
    const totalPages = Math.ceil(questionnaire.items.length / perPage);
    const items = questionnaire.items.slice(page * perPage, (page + 1) * perPage);

    return (
      <QShell questionnaire={questionnaire} qIndex={qIndex} totalQ={totalQ} progress={progress}
        colors={colors} Icon={Icon} page={page} totalPages={totalPages}
        onPageChange={setPage} onPrev={onPrev} onNext={canProceed ? onNext : undefined}
        nextLabel={page < totalPages - 1 ? 'Pagina successiva' : isLast ? 'Vedi Risultati' : 'Prossimo Questionario'}
        canPageNext={page === totalPages - 1 ? canProceed : items.every(i => (answers.qas?.[i.id]) != null)}>
        {items.map((item, idx) => {
          const val = answers.qas?.[item.id];
          return (
            <QItem key={item.id} num={page * perPage + idx + 1} text={item.text} value={val}
              max={5} onSelect={(v) => onQASAnswer(item.id, v)}
              color={colors.bg} />
          );
        })}
      </QShell>
    );
  }

  // RENDER QSS
  if (questionnaire.id === 'qss' && questionnaire.parts) {
    const part = questionnaire.parts[currentPart];
    const perPage = 8;
    const totalPages = Math.ceil(part.items.length / perPage);
    const items = part.items.slice(page * perPage, (page + 1) * perPage);

    return (
      <QShell questionnaire={questionnaire} qIndex={qIndex} totalQ={totalQ} progress={progress}
        colors={colors} Icon={Icon} page={page} totalPages={totalPages}
        onPageChange={setPage} onPrev={currentPart === 0 && page === 0 ? onPrev : () => { if (page > 0) setPage(p => p - 1); else { setCurrentPart(0); setPage(totalPages - 1); } }}
        onNext={page === totalPages - 1 && currentPart === questionnaire.parts.length - 1 && canProceed ? onNext : undefined}
        nextLabel={page < totalPages - 1 ? 'Pagina successiva' : currentPart === 0 ? 'Vai alla Parte 2' : isLast ? 'Vedi Risultati' : 'Prossimo Questionario'}
        canPageNext={page === totalPages - 1 && currentPart === 0 ? true : page === totalPages - 1 ? canProceed : items.every(i => {
          const a = answers.qss?.[i.id];
          return a && a[currentPart === 0 ? 'part1' : 'part2'] != null;
        })}
        extraHeader={
          <div className="flex gap-2 mb-3">
            {questionnaire.parts.map((p, i) => (
              <Badge key={p.id} variant={i === currentPart ? 'default' : 'outline'}
                className={i === currentPart ? colors.bg + ' text-white' : ''}>
                {p.name}
              </Badge>
            ))}
          </div>
        }
        onPageNext={() => {
          if (page < totalPages - 1) setPage(p => p + 1);
          else if (currentPart < (questionnaire.parts?.length || 0) - 1) {
            setCurrentPart(c => c + 1); setPage(0);
          }
        }}>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          <strong>Parte {currentPart + 1}:</strong> {part.instructions.substring(0, 200)}...
        </div>
        {items.map((item, idx) => {
          const a = answers.qss?.[item.id];
          const val = currentPart === 0 ? a?.part1 : a?.part2;
          return (
            <QItem key={item.id} num={page * perPage + idx + 1} text={item.text} value={val}
              max={7} onSelect={(v) => onQSSAnswer(item.id, currentPart === 0 ? 'part1' : 'part2', v)}
              color={colors.bg} />
          );
        })}
      </QShell>
    );
  }

  // RENDER QAR
  if (questionnaire.id === 'qar' && questionnaire.questions) {
    const perPage = 7;
    const totalPages = Math.ceil(questionnaire.questions.length / perPage);
    const items = questionnaire.questions.slice(page * perPage, (page + 1) * perPage);

    return (
      <QShell questionnaire={questionnaire} qIndex={qIndex} totalQ={totalQ} progress={progress}
        colors={colors} Icon={Icon} page={page} totalPages={totalPages}
        onPageChange={setPage} onPrev={onPrev} onNext={canProceed ? onNext : undefined}
        nextLabel={page < totalPages - 1 ? 'Pagina successiva' : isLast ? 'Vedi Risultati' : 'Prossimo Questionario'}
        canPageNext={page === totalPages - 1 ? canProceed : items.every(i => (answers.qar?.[i.id]) != null)}>
        {items.map((item, idx) => {
          const val = answers.qar?.[item.id];
          return (
            <QItem key={item.id} num={page * perPage + idx + 1} text={item.text} value={val}
              max={5} onSelect={(v) => onQARAnswer(item.id, v)}
              color={colors.bg} />
          );
        })}
      </QShell>
    );
  }

  // RENDER QSC
  if (questionnaire.id === 'qsc' && questionnaire.tasks) {
    const task = questionnaire.tasks[currentPart];

    // Fase di osservazione dello stimolo (figura / foglio) prima delle domande.
    const needsStimulus = task.type === 'drawing' || task.type === 'memory';
    if (needsStimulus && !stimulusDone[task.id]) {
      return (
        <QSCStimulus
          task={task}
          onComplete={() => setStimulusDone(prev => ({ ...prev, [task.id]: true }))}
        />
      );
    }

    const perPage = 5;
    const totalPages = Math.ceil(task.questions.length / perPage);
    const items = task.questions.slice(page * perPage, (page + 1) * perPage);

    return (
      <QShell questionnaire={questionnaire} qIndex={qIndex} totalQ={totalQ} progress={progress}
        colors={colors} Icon={Icon} page={page} totalPages={totalPages}
        onPageChange={setPage}
        onPrev={currentPart === 0 && page === 0 ? onPrev : () => { if (page > 0) setPage(p => p - 1); else { setCurrentPart(0); setPage(totalPages - 1); } }}
        onNext={page === totalPages - 1 && currentPart === questionnaire.tasks!.length - 1 && canProceed ? onNext : undefined}
        nextLabel={page < totalPages - 1 ? 'Pagina successiva' : currentPart === 0 ? 'Task successivo' : isLast ? 'Vedi Risultati' : 'Prossimo Questionario'}
        canPageNext={page === totalPages - 1 && currentPart === 0 ? true : page === totalPages - 1 ? canProceed : items.every(i => (answers.qsc?.[i.id]) != null)}
        extraHeader={
          <div className="flex gap-2 mb-3">
            {questionnaire.tasks!.map((t, i) => (
              <Badge key={t.id} variant={i === currentPart ? 'default' : 'outline'}
                className={i === currentPart ? colors.bg + ' text-white' : ''}>
                {t.name}
              </Badge>
            ))}
          </div>
        }
        onPageNext={() => {
          if (page < totalPages - 1) setPage(p => p + 1);
          else if (currentPart < (questionnaire.tasks?.length || 0) - 1) {
            setCurrentPart(c => c + 1); setPage(0);
          }
        }}>
        <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
          <strong>{task.name}:</strong> {task.description}
        </div>
        {items.map((item, idx) => {
          const val = answers.qsc?.[item.id];
          const freq = (item as { scaleAnchor?: string }).scaleAnchor === 'frequency';
          return (
            <QItem key={item.id} num={page * perPage + idx + 1} text={item.text} value={val}
              max={5} onSelect={(v) => onQSCAnswer(item.id, v)}
              minLabel={freq ? 'mai' : 'per niente'} maxLabel={freq ? 'sempre' : 'moltissimo'}
              color={colors.bg} />
          );
        })}
      </QShell>
    );
  }

  return null;
}

// ============================================================
// SHELL
// ============================================================

function QShell({
  questionnaire, qIndex, totalQ, progress, colors, Icon, page, totalPages,
  onPageChange, onPrev, onNext, nextLabel, canPageNext, children, extraHeader,
  onPageNext
}: {
  questionnaire: QuestionnaireDef; qIndex: number; totalQ: number; progress: number;
  colors: any; Icon: any; page: number; totalPages: number;
  onPageChange: (p: number) => void; onPrev?: () => void; onNext?: () => void;
  nextLabel: string; canPageNext: boolean; children: React.ReactNode; extraHeader?: React.ReactNode;
  onPageNext?: () => void;
}) {
  // Allo scorrimento di pagina (o cambio questionario) torna in cima, così
  // la prima domanda della nuova pagina è subito visibile.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, questionnaire?.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={onPrev}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {qIndex === 0 && page === 0 ? 'Indietro' : 'Precedente'}
            </Button>
            <Badge variant="outline">{qIndex + 1} / {totalQ}</Badge>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{progress}% completato</span>
            <span>{questionnaire.acronym}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors.bg} bg-opacity-10`}>
              <Icon className={`w-5 h-5 ${colors.accent}`} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">{questionnaire.name}</h2>
              <p className="text-xs text-slate-500">{questionnaire.description}</p>
            </div>
          </div>
          {extraHeader}
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            {children}
          </motion.div>

          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}>
              <ArrowLeft className="w-4 h-4 mr-1" />Indietro
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => onPageChange(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === page ? `${colors.bg} w-5` : 'bg-slate-300'}`} />
              ))}
            </div>

            {onNext && page === totalPages - 1 ? (
              <Button size="sm" onClick={onNext} className={colors.bg}>
                {nextLabel}<ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onPageNext || (() => onPageChange(page + 1))}
                disabled={!canPageNext}>
                {nextLabel}<ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// ITEM
// ============================================================

function QItem({ num, text, value, max, onSelect, color, minLabel = 'minimo', maxLabel = 'massimo' }: {
  num: number; text: string; value: number | null | undefined; max: number; onSelect: (v: number) => void; color: string;
  minLabel?: string; maxLabel?: string;
}) {
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (target: number) => {
    const t = Math.min(max, Math.max(1, target));
    onSelect(t);
    btnRefs.current[t - 1]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = value ?? 0;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': e.preventDefault(); move(cur ? cur + 1 : 1); break;
      case 'ArrowLeft': case 'ArrowUp': e.preventDefault(); move(cur ? cur - 1 : 1); break;
      case 'Home': e.preventDefault(); move(1); break;
      case 'End': e.preventDefault(); move(max); break;
    }
  };

  return (
    <Card className={`border transition-all ${value ? 'border-blue-200 shadow-sm' : 'border-slate-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${value ? color : 'bg-slate-200'}`}>
            {num}
          </span>
          <p id={`qitem-${num}-label`} className="text-sm text-slate-800 leading-relaxed pt-0.5">{text}</p>
        </div>
        <div className="ml-10">
          <div role="radiogroup" aria-labelledby={`qitem-${num}-label`} onKeyDown={onKeyDown}
            className="flex items-center gap-1">
            {Array.from({ length: max }).map((_, i) => {
              const v = i + 1;
              const selected = value === v;
              const focusable = selected || (value == null && v === 1);
              const hint = v === 1 ? ` (${minLabel})` : v === max ? ` (${maxLabel})` : '';
              return (
                <button key={v}
                  ref={el => { btnRefs.current[i] = el; }}
                  role="radio" aria-checked={selected} aria-label={`${v}${hint}`}
                  tabIndex={focusable ? 0 : -1}
                  onClick={() => onSelect(v)}
                  className={`flex-1 min-h-11 py-2.5 rounded-lg text-sm font-bold transition-all
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 ${
                    selected ? `${color} text-white shadow-md scale-105` : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}>
                  {v}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5 px-1">
            <span className="text-[10px] text-slate-400">1 = {minLabel}</span>
            <span className="text-[10px] text-slate-400">{max} = {maxLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

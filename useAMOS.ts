import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Eye, EyeOff, Timer, Pencil, ArrowRight,
  Beer, Croissant, Rabbit, Volleyball, Flower2, Scissors,
  CookingPot, Glasses, Popcorn, Bike, Sprout,
} from 'lucide-react';

interface Props {
  task: { id: string; name: string; type?: string };
  onComplete: () => void;
}

type Phase = {
  key: string;
  seconds: number | null;          // null = fase senza timer (avanzamento manuale)
  stimulus: 'figure' | 'sheet' | null;
  recall?: boolean;
  title: string;
  instruction: string;
  cta: string;
};

// Stile globale/analitico: osserva la figura 30s -> disegnala a memoria.
const GA_PHASES: Phase[] = [
  {
    key: 'observe', seconds: 30, stimulus: 'figure',
    title: 'Osserva la figura',
    instruction: 'Osserva attentamente la figura per 30 secondi e cerca di memorizzarla. Allo scadere del tempo verrà nascosta.',
    cta: 'Ho memorizzato, nascondi',
  },
  {
    key: 'draw', seconds: null, stimulus: null,
    title: 'Disegnala a memoria',
    instruction: 'Ora prendi un foglio e prova a disegnare la figura a memoria, nel modo più completo che riesci. Quando hai finito, prosegui: le prime domande riguardano proprio come l\u2019hai riprodotta.',
    cta: 'Ho disegnato, prosegui',
  },
];

// Stile verbale/visivo: sguardo veloce -> memorizza 60s -> richiama 60s.
const VV_PHASES: Phase[] = [
  {
    key: 'glance', seconds: 15, stimulus: 'sheet',
    title: 'Guarda velocemente',
    instruction: 'Guarda velocemente questo foglio. Subito dopo una domanda ti chiederà se, per prima cosa, sei andato a leggere le parole.',
    cta: 'Continua',
  },
  {
    key: 'memorize', seconds: 60, stimulus: 'sheet',
    title: 'Memorizza il contenuto',
    instruction: 'Ora cerca di memorizzare tutto il contenuto della pagina: parole e figure. Hai 60 secondi.',
    cta: 'Ho memorizzato',
  },
  {
    key: 'recall', seconds: 60, stimulus: null, recall: true,
    title: 'Scrivi cosa ricordi',
    instruction: 'Hai 60 secondi per scrivere qui sotto tutte le parole e le figure che ricordi.',
    cta: 'Ho finito',
  },
];

export function QSCStimulus({ task, onComplete }: Props) {
  const isMemory = task.id === 'verbal_visual' || task.type === 'memory';
  const phases = isMemory ? VV_PHASES : GA_PHASES;

  const [idx, setIdx] = useState(0);
  const phase = phases[idx];
  const [seconds, setSeconds] = useState<number>(phases[0].seconds ?? 0);
  const [recallText, setRecallText] = useState('');

  // Reset del timer a ogni cambio di fase.
  useEffect(() => { setSeconds(phases[idx].seconds ?? 0); }, [idx, phases]);

  // Countdown delle fasi a tempo (auto-avanzamento allo zero).
  useEffect(() => {
    if (phases[idx].seconds == null) return;
    if (seconds <= 0) {
      if (idx < phases.length - 1) setIdx(i => i + 1); else onComplete();
      return;
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, idx, phases, onComplete]);

  const advance = () => { if (idx < phases.length - 1) setIdx(i => i + 1); else onComplete(); };

  const timed = phase.seconds != null;
  const pct = timed && phase.seconds ? Math.round(((phase.seconds - seconds) / phase.seconds) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/60 to-white">
      <header className="px-6 py-4 border-b border-amber-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            {isMemory ? <Eye className="w-5 h-5 text-amber-600" /> : <Pencil className="w-5 h-5 text-amber-600" />}
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-sm">{task.name}</h2>
            <p className="text-xs text-slate-500">Fase {idx + 1} di {phases.length} · {phase.title}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
            {phase.instruction}
          </div>

          {timed && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-amber-700 font-semibold tabular-nums">
                <Timer className="w-4 h-4" /><span>{seconds}s</span>
              </div>
              <div className="flex-1 h-2 rounded-full bg-amber-100 overflow-hidden">
                <motion.div className="h-full bg-amber-500" animate={{ width: `${pct}%` }} transition={{ ease: 'linear' }} />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={phase.key}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {phase.stimulus === 'figure' && (
                <Card className="border-amber-200 shadow-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-8 flex items-center justify-center bg-white">
                    <CompositeFigure />
                  </CardContent>
                </Card>
              )}
              {phase.stimulus === 'sheet' && (
                <Card className="border-amber-200 shadow-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-6 flex items-center justify-center bg-white">
                    <MemorySheet />
                  </CardContent>
                </Card>
              )}
              {phase.recall && (
                <textarea
                  value={recallText}
                  onChange={e => setRecallText(e.target.value)}
                  placeholder="Scrivi qui le parole e le figure che ricordi..."
                  className="w-full min-h-[160px] p-4 rounded-xl border border-slate-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-300 resize-y"
                />
              )}
              {phase.stimulus === null && !phase.recall && (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
                  <div className="p-5 rounded-full bg-amber-100"><EyeOff className="w-10 h-10 text-amber-600" /></div>
                  <p className="text-sm text-slate-500 max-w-sm">La figura è stata nascosta.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-end pt-2">
            <Button className="bg-amber-500 hover:bg-amber-600" onClick={advance}>
              {idx === phases.length - 1
                ? <>Rispondi alle domande<ArrowRight className="w-4 h-4 ml-1" /></>
                : <>{phase.cta}<ArrowRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   Figura composita (stile globale/analitico) — fedele all'appendice C:
   corpo a "pesce" con bandierina, cerchio-muso, 6 punti, rettangolo
   nero interno, diagonali, strisce e coda triangolare.
   ============================================================ */
function CompositeFigure() {
  return (
    <svg viewBox="0 0 460 300" className="w-full max-w-lg" role="img" aria-label="Figura geometrica composita">
      <g fill="none" stroke="#1e293b" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        {/* Bandierina su asta */}
        <line x1="210" y1="92" x2="210" y2="34" />
        <rect x="210" y="34" width="62" height="34" />
        <line x1="210" y1="34" x2="272" y2="68" />
        {/* Corpo */}
        <rect x="130" y="92" width="200" height="120" />
        <line x1="230" y1="92" x2="230" y2="212" />
        <line x1="130" y1="152" x2="330" y2="152" />
        {/* Muso sinistro + cerchio */}
        <line x1="130" y1="92" x2="80" y2="152" />
        <line x1="130" y1="212" x2="80" y2="152" />
        <line x1="58" y1="152" x2="130" y2="152" />
        <circle cx="70" cy="152" r="22" />
        {/* Diagonali quadrante destro-alto */}
        <line x1="230" y1="92" x2="330" y2="152" />
        <line x1="330" y1="92" x2="230" y2="152" />
        {/* Strisce quadrante destro-basso */}
        <line x1="230" y1="180" x2="330" y2="180" />
        {/* Coda */}
        <line x1="330" y1="152" x2="362" y2="152" />
        <path d="M362 128 L400 152 L362 176 Z" />
        {/* 6 punti (2x3) quadrante sinistro-alto */}
        <g fill="#1e293b" stroke="none">
          {[114, 134].map(y => [160, 186, 212].map(x => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="6.5" />
          )))}
        </g>
        {/* Rettangolo bianco con rettangolo nero (quadrante sinistro-basso) */}
        <rect x="150" y="168" width="62" height="34" />
        <rect x="166" y="178" width="30" height="14" fill="#1e293b" stroke="none" />
      </g>
    </svg>
  );
}

/* ============================================================
   Foglio parole + figure (stile verbale/visivo) — fedele all'appendice C:
   6 righe, ciascuna con 2 figure e 2 parole.
   ============================================================ */
const SHEET_ROWS: Array<Array<{ t: 'icon'; I: typeof Beer } | { t: 'word'; w: string }>> = [
  [{ t: 'icon', I: Beer }, { t: 'icon', I: Croissant }, { t: 'word', w: 'ROSPO' }, { t: 'word', w: 'PIZZA' }],
  [{ t: 'icon', I: Rabbit }, { t: 'icon', I: Volleyball }, { t: 'word', w: 'CORDA' }, { t: 'word', w: 'TAZZA' }],
  [{ t: 'icon', I: Flower2 }, { t: 'icon', I: Scissors }, { t: 'word', w: 'BARCA' }, { t: 'word', w: 'SCALA' }],
  [{ t: 'icon', I: CookingPot }, { t: 'icon', I: Glasses }, { t: 'word', w: 'PASTA' }, { t: 'word', w: 'NERVI' }],
  [{ t: 'icon', I: Pencil }, { t: 'icon', I: Popcorn }, { t: 'word', w: 'PORTA' }, { t: 'word', w: 'PRATO' }],
  [{ t: 'icon', I: Bike }, { t: 'icon', I: Sprout }, { t: 'word', w: 'STUFA' }, { t: 'word', w: 'CAMPO' }],
];

function MemorySheet() {
  return (
    <div className="grid grid-cols-4 gap-x-4 gap-y-3 w-full max-w-lg">
      {SHEET_ROWS.flat().map((cell, idx) => (
        <div key={idx} className="aspect-[5/4] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
          {cell.t === 'word'
            ? <span className="text-sm sm:text-base font-semibold tracking-widest text-slate-700">{cell.w}</span>
            : (() => { const Ic = cell.I; return <Ic className="w-7 h-7 sm:w-8 sm:h-8 text-slate-700" strokeWidth={1.7} />; })()}
        </div>
      ))}
    </div>
  );
}

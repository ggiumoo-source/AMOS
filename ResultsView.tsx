import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, GraduationCap, Sparkles, Stethoscope, User, FolderOpen } from 'lucide-react';
import type { UserMode } from '@/types/amos';

interface LandingScreenProps {
  onStart: (mode: UserMode) => void;
  onOpenCatalog: () => void;
  onOpenArchive: () => void;
}

export function LandingScreen({ onStart, onOpenCatalog, onOpenArchive }: LandingScreenProps) {
  const [hoveredMode, setHoveredMode] = useState<UserMode | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full" />
          <div className="absolute top-40 right-20 w-48 h-48 border border-white/10 rounded-full" />
          <div className="absolute bottom-20 left-1/3 w-24 h-24 border border-white/15 rounded-full" />
          <div className="absolute top-20 right-1/3 w-16 h-16 bg-white/5 rounded-full" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Brain className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              AMOS Profilo di Studio
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-4">
              Scopri il tuo profilo di apprendimento e ricevi tecniche di studio 
              personalizzate basate sulla batteria AMOS di Cornoldi
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-blue-200">
              <BookOpen className="w-4 h-4" />
              <span>Strategie di Studio</span>
              <span className="mx-2">·</span>
              <Brain className="w-4 h-4" />
              <span>Stili Cognitivi</span>
              <span className="mx-2">·</span>
              <Sparkles className="w-4 h-4" />
              <span>Motivazione</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Mode Selection */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-center text-slate-800 mb-2">
            Scegli la modalità
          </h2>
          <p className="text-slate-500 text-center mb-10">
            Seleziona il profilo più adatto alle tue esigenze
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Student Mode */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredMode('student')}
              onMouseLeave={() => setHoveredMode(null)}
            >
              <Card 
                className={`cursor-pointer border-2 transition-all duration-300 h-full ${
                  hoveredMode === 'student' 
                    ? 'border-blue-500 shadow-lg shadow-blue-100' 
                    : 'border-transparent shadow-md hover:shadow-lg'
                }`}
                onClick={() => onStart('student')}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <GraduationCap className="w-8 h-8 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-slate-800">
                          Modalità Studente
                        </h3>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Autovalutazione
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        Compila i questionari in autonomia e ricevi un report 
                        personalizzato con tecniche di studio consigliate e consigli 
                        pratici per migliorare il tuo metodo di studio.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <User className="w-4 h-4" />
                        <span>Ideale per studenti della scuola secondaria e università</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Psychologist Mode */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredMode('psychologist')}
              onMouseLeave={() => setHoveredMode(null)}
            >
              <Card 
                className={`cursor-pointer border-2 transition-all duration-300 h-full ${
                  hoveredMode === 'psychologist' 
                    ? 'border-emerald-500 shadow-lg shadow-emerald-100' 
                    : 'border-transparent shadow-md hover:shadow-lg'
                }`}
                onClick={() => onStart('psychologist')}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <Stethoscope className="w-8 h-8 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-slate-800">
                          Modalità Professionista
                        </h3>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Completa
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        Accesso al profilo valutativo completo con punteggi dettagliati, 
                        fasce di riferimento, report grafico e piano di intervento 
                        personalizzato per uso clinico.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <Stethoscope className="w-4 h-4" />
                        <span>Per psicologi, educatori e professionisti</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-8 text-center">
          <button
            onClick={onOpenCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-200 bg-white text-indigo-700 text-sm font-medium hover:bg-indigo-50 transition-colors shadow-sm">
            <BookOpen className="w-4 h-4" />
            Sfoglia tutte le tecniche di studio
          </button>
          <p className="text-xs text-slate-400 mt-2">Il catalogo completo con la guida passo passo di ogni tecnica</p>
          <div className="mt-4">
            <button
              onClick={onOpenArchive}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-white text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition-colors shadow-sm">
              <FolderOpen className="w-4 h-4" />
              Archivio pazienti (professionista)
            </button>
            <p className="text-xs text-slate-400 mt-2">Importa e consulta le valutazioni ricevute dagli studenti</p>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-center text-slate-800 mb-8">
            Cosa include la valutazione
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, label: 'QSS', desc: 'Strategie di Studio' },
              { icon: Sparkles, label: 'QAS', desc: 'Abilità di Studio' },
              { icon: Brain, label: 'QSC', desc: 'Stili Cognitivi' },
              { icon: User, label: 'QC', desc: 'Motivazione' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center p-4 bg-white rounded-xl shadow-sm"
              >
                <item.icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="font-semibold text-slate-800">{item.label}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-xs text-slate-400 max-w-xl mx-auto"
        >
          <p>
            Questo strumento è ispirato alla batteria AMOS (Abilità e Metodi di Studio) 
            di Cesare Cornoldi. Non sostituisce la somministrazione clinica del test 
            validato né la consulenza psicologica professionale.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

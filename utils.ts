import { useAMOS } from '@/hooks/useAMOS';
import { LandingScreen } from '@/components/LandingScreen';
import { StudentInfoForm } from '@/components/StudentInfoForm';
import { QuestionnaireSelect } from '@/components/QuestionnaireSelect';
import { QuestionnaireView } from '@/components/QuestionnaireView';
import { ResultsView } from '@/components/ResultsView';
import { TechniqueDetail } from '@/components/TechniqueDetail';
import { TechniquesCatalog } from '@/components/TechniquesCatalog';
import { PatientArchive } from '@/components/PatientArchive';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

function App() {
  const amos = useAMOS();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {amos.resumedSession && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md">
          <div className="flex items-center gap-3 bg-white border border-blue-200 shadow-lg rounded-xl px-4 py-2.5">
            <span className="text-sm text-slate-700 flex-1">
              Sessione ripresa: continui da dove avevi lasciato.
            </span>
            <button onClick={amos.resetApp}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 whitespace-nowrap">
              Ricomincia
            </button>
            <button onClick={amos.dismissResume} aria-label="Chiudi avviso"
              className="text-slate-400 hover:text-slate-600 text-lg leading-none">
              ×
            </button>
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        {amos.screen === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <LandingScreen onStart={amos.startApp} onOpenCatalog={amos.openTechniquesCatalog} onOpenArchive={amos.openArchive} />
          </motion.div>
        )}

        {amos.screen === 'techniques-catalog' && (
          <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <TechniquesCatalog techniques={amos.studyTechniques} onBack={amos.closeTechniquesCatalog} />
          </motion.div>
        )}

        {amos.screen === 'archive' && (
          <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <PatientArchive
              patients={amos.patients}
              onBack={amos.closeArchive}
              onOpen={amos.openPatient}
              onDelete={amos.deletePatient}
              onImport={amos.importProfile}
            />
          </motion.div>
        )}

        {amos.screen === 'student-info' && (
          <motion.div key="student-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <StudentInfoForm
              mode={amos.mode}
              studentInfo={amos.studentInfo}
              onUpdate={amos.updateStudentInfo}
              onNext={amos.goToQuestionnaireSelect}
              onBack={amos.resetApp}
            />
          </motion.div>
        )}

        {amos.screen === 'questionnaire-select' && (
          <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <QuestionnaireSelect
              questionnaires={amos.questionnaires}
              onSelect={amos.selectQuestionnaires}
              onBack={() => amos.resetApp()}
            />
          </motion.div>
        )}

        {amos.screen === 'questionnaire' && amos.currentQ && (
          <motion.div key={`q-${amos.currentQ.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <QuestionnaireView
              questionnaire={amos.currentQ}
              qIndex={amos.currentQIndex}
              totalQ={amos.activeQuestionnaires.length}
              answers={amos.answers}
              onQSSAnswer={amos.setQSSAnswer}
              onQASAnswer={amos.setQASAnswer}
              onQARAnswer={amos.setQARAnswer}
              onQSCAnswer={amos.setQSCAnswer}
              onNext={amos.nextQuestionnaire}
              onPrev={amos.prevQuestionnaire}
              canProceed={amos.canProceed(amos.currentQ.id)}
              isLast={amos.isLastQ}
              getProgress={amos.getProgress}
            />
          </motion.div>
        )}

        {amos.screen === 'results' && amos.profile && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <ResultsView
              profile={amos.profile}
              onTechniqueClick={amos.goToTechnique}
              onRestart={amos.resetApp}
              mode={amos.mode}
            />
          </motion.div>
        )}

        {amos.screen === 'technique-detail' && amos.selectedTechnique && (
          <motion.div key="technique" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <TechniqueDetail technique={amos.selectedTechnique} onBack={amos.goBackToResults} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

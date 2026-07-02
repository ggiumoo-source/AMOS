import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, User, Calendar, School, Stethoscope } from 'lucide-react';
import type { UserMode, StudentInfo } from '@/types/amos';

interface Props {
  mode: UserMode;
  studentInfo: StudentInfo;
  onUpdate: (info: Partial<StudentInfo>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StudentInfoForm({ mode, studentInfo, onUpdate, onNext, onBack }: Props) {
  const isComplete = studentInfo.name && studentInfo.surname && studentInfo.age && studentInfo.schoolGrade;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Indietro</Button>
          <Badge variant={mode === 'psychologist' ? 'default' : 'secondary'} className={mode === 'psychologist' ? 'bg-emerald-600' : ''}>
            {mode === 'psychologist' ? 'Professionista' : 'Studente'}
          </Badge>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${mode === 'psychologist' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                  {mode === 'psychologist' ? <Stethoscope className="w-5 h-5 text-emerald-600" /> : <User className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <CardTitle className="text-xl">Dati dello Studente</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    {mode === 'psychologist' ? 'Inserisci i dati anagrafici e scolastici' : 'Inserisci i tuoi dati per personalizzare il report'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" value={studentInfo.name} onChange={e => onUpdate({ name: e.target.value })} placeholder="Mario" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Cognome</Label>
                  <Input id="surname" value={studentInfo.surname} onChange={e => onUpdate({ surname: e.target.value })} placeholder="Rossi" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Età</Label>
                  <Input id="age" type="number" min={11} max={30} value={studentInfo.age} onChange={e => onUpdate({ age: parseInt(e.target.value) || 14 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Genere</Label>
                  <select id="gender" name="amos-gender" autoComplete="off" value={studentInfo.gender} onChange={e => onUpdate({ gender: e.target.value as 'M' | 'F' | 'NS' | '' })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleziona</option>
                    <option value="M">Maschio</option>
                    <option value="F">Femmina</option>
                    <option value="NS">Preferisco non specificare</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Data</Label>
                  <Input id="date" type="date" value={studentInfo.date} onChange={e => onUpdate({ date: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolType" className="flex items-center gap-1"><School className="w-3.5 h-3.5" />Tipo di Scuola</Label>
                <Input id="schoolType" value={studentInfo.schoolType} onChange={e => onUpdate({ schoolType: e.target.value })} placeholder="es. Liceo Scientifico, Università..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolGrade" className="flex items-center gap-1"><School className="w-3.5 h-3.5" />Classe / Anno</Label>
                <Input id="schoolGrade" value={studentInfo.schoolGrade} onChange={e => onUpdate({ schoolGrade: e.target.value })} placeholder="es. 3ª superiore, 1º anno..." />
              </div>

              {mode === 'psychologist' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <Label htmlFor="examiner" className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" />Esaminatore</Label>
                    <Input id="examiner" value={studentInfo.examiner || ''} onChange={e => onUpdate({ examiner: e.target.value })} placeholder="Nome e cognome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Note Anamnestiche</Label>
                    <textarea id="notes" value={studentInfo.notes || ''} onChange={e => onUpdate({ notes: e.target.value })}
                      placeholder="Eventuali note rilevanti..." rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                </motion.div>
              )}

              <div className="pt-4">
                <Button onClick={onNext} disabled={!isComplete}
                  className={`w-full py-6 text-lg font-medium ${isComplete ? (mode === 'psychologist' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700') : 'bg-slate-300 cursor-not-allowed'}`}
                  size="lg">
                  Seleziona i Questionari<ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {!isComplete && <p className="text-xs text-slate-400 text-center mt-2">Compila nome, cognome, età e classe</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

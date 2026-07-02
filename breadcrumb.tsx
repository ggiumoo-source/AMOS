import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Upload, FolderOpen, Trash2, Eye, FileText } from 'lucide-react';
import type { AMOSProfile } from '@/types/amos';

interface Props {
  patients: AMOSProfile[];
  onBack: () => void;
  onOpen: (p: AMOSProfile) => void;
  onDelete: (timestamp: number) => void;
  onImport: (json: string) => boolean;
}

export function PatientArchive({ patients, onBack, onOpen, onDelete, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const ok = onImport(text);
      if (!ok) setMsg({ type: 'err', text: 'File non valido: non contiene una valutazione AMOS.' });
    } catch {
      setMsg({ type: 'err', text: 'Impossibile leggere il file.' });
    }
  };

  const fmtDate = (ts: number) => {
    try { return new Date(ts).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="w-4 h-4" />Home
          </Button>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="font-semibold text-slate-800">Archivio pazienti</h1>
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-sm text-emerald-900 mb-3">
              Importa la valutazione che lo studente ti ha inviato (file <code>.json</code> esportato a fine
              questionario). Verrà aggiunta all'archivio, salvato solo su questo dispositivo.
            </p>
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
            <Button onClick={() => { setMsg(null); fileRef.current?.click(); }} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Upload className="w-4 h-4" />Importa valutazione
            </Button>
            {msg && (
              <p className={`text-xs mt-2 ${msg.type === 'ok' ? 'text-emerald-700' : 'text-rose-600'}`}>{msg.text}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600">
              Valutazioni salvate ({patients.length})
            </h2>
          </div>

          {patients.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nessuna valutazione in archivio.</p>
              <p className="text-xs mt-1">Importa un file oppure completa un questionario in questa sessione.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...patients].sort((a, b) => b.timestamp - a.timestamp).map(p => (
                <Card key={p.timestamp} className="border-slate-200">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 truncate">
                        {p.studentInfo.surname} {p.studentInfo.name || '—'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.studentInfo.age} anni · {p.selectedQuestionnaires.map(q => q.toUpperCase()).join(', ')} · {fmtDate(p.timestamp)}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onOpen(p)} className="gap-1">
                      <Eye className="w-4 h-4" />Apri
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(p.timestamp)}
                      aria-label="Elimina" className="text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

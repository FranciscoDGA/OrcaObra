import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  runMigration,
  hasLocalData,
  getMigrationStatus,
  type MigrationProgress,
} from '../lib/migration-service';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export default function MigrationPage() {
  const navigate = useNavigate();
  const { session, initialized } = useAuthStore();
  const [progress, setProgress] = useState<MigrationProgress>(() => getMigrationStatus());
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!isSupabaseConfigured()) {
      navigate('/', { replace: true });
      return;
    }
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    if (progress.status === 'completed') {
      navigate('/', { replace: true });
      return;
    }
    if (!hasLocalData()) {
      navigate('/', { replace: true });
      return;
    }
  }, [initialized, session, progress.status, navigate]);

  const handleMigrate = async () => {
    setStarted(true);
    await runMigration(setProgress);
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  if (!started && progress.status !== 'in_progress') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📦</div>
          <h1 className="text-xl font-bold text-white mb-3">
            Encontramos dados neste dispositivo
          </h1>
          <p className="text-white/70 text-sm mb-6">
            Dados locais foram detectados. Deseja migrá-los para sua conta na nuvem?
          </p>
          <div className="space-y-3">
            <button
              onClick={handleMigrate}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
            >
              Migrar para minha conta
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-3 bg-white/10 hover:bg-white/15 text-white/70 rounded-xl transition-colors"
            >
              Pular por agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">
          {progress.status === 'completed'
            ? '✅'
            : progress.status === 'failed'
              ? '❌'
              : '⏳'}
        </div>
        <h1 className="text-xl font-bold text-white mb-3">Migração</h1>

        <div className="space-y-2 text-left text-sm mb-6">
          <StatusLine
            label="Perfil"
            done={progress.status === 'completed' || (progress.completed > 0 && progress.step.includes('perfil'))}
          />
          <StatusLine
            label="Empresa"
            done={progress.status === 'completed' || (progress.completed > 0 && progress.step.includes('empresa'))}
          />
          <StatusLine
            label="Configurações"
            done={progress.status === 'completed' || (progress.completed > 0 && progress.step.includes('configurações'))}
          />
          <StatusLine
            label={`Clientes (${progress.completed}/${progress.total})`}
            active={progress.step.includes('clientes')}
            done={progress.completed > 0}
          />
          <StatusLine
            label={`Materiais (${progress.completed}/${progress.total})`}
            active={progress.step.includes('materiais')}
            done={progress.completed > 0}
          />
          <StatusLine
            label={`Orçamentos (${progress.completed}/${progress.total})`}
            active={progress.step.includes('orçamentos')}
            done={progress.completed > 0}
          />
          <StatusLine
            label={`Execuções (${progress.completed}/${progress.total})`}
            active={progress.step.includes('execuções')}
            done={progress.completed > 0}
          />
        </div>

        {progress.step && (
          <p className="text-white/60 text-xs mb-4">{progress.step}</p>
        )}

        {progress.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-xs">{progress.error}</p>
          </div>
        )}

        {progress.status === 'completed' && (
          <button
            onClick={handleSkip}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
          >
            Continuar
          </button>
        )}

        {progress.status === 'failed' && (
          <div className="space-y-3">
            <button
              onClick={handleMigrate}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-3 bg-white/10 hover:bg-white/15 text-white/70 rounded-xl transition-colors"
            >
              Pular por agora
            </button>
          </div>
        )}

        {progress.status === 'in_progress' && (
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: progress.total > 0
                  ? `${Math.round((progress.completed / progress.total) * 100)}%`
                  : '0%',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusLine({
  label,
  done,
  active,
}: {
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-4">
        {done ? '✅' : active ? '🔄' : '⬜'}
      </span>
      <span
        className={`${done ? 'text-emerald-400' : active ? 'text-white' : 'text-white/40'}`}
      >
        {label}
      </span>
    </div>
  );
}

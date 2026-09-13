import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, HardHat, Ruler, TrendingUp, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { generateId } from '../../lib/id';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const PROFESSIONS = ['Pedreiro', 'Mestre de obra', 'Empreiteiro', 'Outro'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setUser, setSettings, completeOnboarding } = useSettingsStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [profession, setProfession] = useState(PROFESSIONS[0]);

  const [workerDailyRate, setWorkerDailyRate] = useState('250');
  const [helperDailyRate, setHelperDailyRate] = useState('150');
  const [defaultHelpers, setDefaultHelpers] = useState('1');
  const [minimumMargin, setMinimumMargin] = useState('10');
  const [recommendedMargin, setRecommendedMargin] = useState('20');
  const [fullMargin, setFullMargin] = useState('30');

  const [nameError, setNameError] = useState('');

  function handleContinue() {
    if (!name.trim()) {
      setNameError('Informe seu nome');
      return;
    }
    setNameError('');
    setStep(2);
  }

  function handleFinish() {
    setUser({
      id: generateId(),
      name: name.trim(),
      profession,
      createdAt: new Date().toISOString(),
    });

    setSettings({
      workerDailyRate: Number(workerDailyRate) || 250,
      helperDailyRate: Number(helperDailyRate) || 150,
      defaultHelpers: Number(defaultHelpers) || 1,
      minimumMargin: Number(minimumMargin) || 10,
      recommendedMargin: Number(recommendedMargin) || 20,
      fullMargin: Number(fullMargin) || 30,
    });

    completeOnboarding();
    navigate('/');
  }

  const progress = step === 1 ? 50 : 100;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">
            <span className="text-teal-600">Orça</span>Obra
          </h1>
          <p className="text-slate-500 text-sm mt-1">Orçamentos inteligentes para sua obra</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span>Passo {step} de 2</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Seus dados</h2>
                  <p className="text-sm text-slate-500">Como devemos te chamar?</p>
                </div>
              </div>

              <Input
                label="Seu nome"
                placeholder="Ex: João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={nameError}
              />

              <Select
                label="Sua profissão"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                options={PROFESSIONS.map((p) => ({ value: p, label: p }))}
              />

              <Button fullWidth onClick={handleContinue}>
                Continuar
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Daily rates */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Valores diários</h2>
                    <p className="text-sm text-slate-500">Custos da sua equipe</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Pedreiro (R$/dia)"
                    type="number"
                    min="0"
                    value={workerDailyRate}
                    onChange={(e) => setWorkerDailyRate(e.target.value)}
                  />
                  <Input
                    label="Ajuda (R$/dia)"
                    type="number"
                    min="0"
                    value={helperDailyRate}
                    onChange={(e) => setHelperDailyRate(e.target.value)}
                  />
                </div>

                <div className="mt-3">
                  <Input
                    label="Número de ajudantes"
                    type="number"
                    min="0"
                    value={defaultHelpers}
                    onChange={(e) => setDefaultHelpers(e.target.value)}
                  />
                </div>
              </div>

              {/* Margins */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Margens de lucro</h2>
                    <p className="text-sm text-slate-500">Percentuais para precificação</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Mínima (%)"
                    type="number"
                    min="0"
                    value={minimumMargin}
                    onChange={(e) => setMinimumMargin(e.target.value)}
                  />
                  <Input
                    label="Recomendada (%)"
                    type="number"
                    min="0"
                    value={recommendedMargin}
                    onChange={(e) => setRecommendedMargin(e.target.value)}
                  />
                  <Input
                    label="Cheia (%)"
                    type="number"
                    min="0"
                    value={fullMargin}
                    onChange={(e) => setFullMargin(e.target.value)}
                  />
                </div>
              </div>

              <Button fullWidth onClick={handleFinish}>
                Entrar no OrçaObra
                <ChevronRight className="w-4 h-4 ml-2 inline" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

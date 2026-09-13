import { useState, useEffect } from 'react';
import { Save, Settings, MapPin } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { REGIONS, MAJOR_CITIES, getDefaultRatesForCity, getDefaultRatesForRegion } from '../../data/regions';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const PROFESSIONS = ['Pedreiro', 'Mestre de obra', 'Empreiteiro', 'Outro'];

export default function SettingsPage() {
  const { user, settings, setSettings, setUser } = useSettingsStore();

  const [name, setName] = useState('');
  const [profession, setProfession] = useState(PROFESSIONS[0]);
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [workerDailyRate, setWorkerDailyRate] = useState('280');
  const [helperDailyRate, setHelperDailyRate] = useState('150');
  const [defaultHelpers, setDefaultHelpers] = useState('1');
  const [minimumMargin, setMinimumMargin] = useState('10');
  const [recommendedMargin, setRecommendedMargin] = useState('20');
  const [fullMargin, setFullMargin] = useState('30');
  const [defaultWastePercent, setDefaultWastePercent] = useState('10');
  const [defaultRiskReservePercent, setDefaultRiskReservePercent] = useState('5');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setProfession(user.profession || PROFESSIONS[0]);
    }
    setRegion(settings.region || '');
    setCity(settings.city || '');
    setWorkerDailyRate(settings.workerDailyRate.toString());
    setHelperDailyRate(settings.helperDailyRate.toString());
    setDefaultHelpers(settings.defaultHelpers.toString());
    setMinimumMargin(settings.minimumMargin.toString());
    setRecommendedMargin(settings.recommendedMargin.toString());
    setFullMargin(settings.fullMargin.toString());
    setDefaultWastePercent(settings.defaultWastePercent.toString());
    setDefaultRiskReservePercent(settings.defaultRiskReservePercent.toString());
  }, [user, settings]);

  function handleCityChange(newCity: string) {
    setCity(newCity);
    const rates = getDefaultRatesForCity(newCity);
    if (rates) {
      setWorkerDailyRate(rates.workerRate.toString());
      setHelperDailyRate(rates.helperRate.toString());
    }
  }

  function handleRegionChange(newRegion: string) {
    setRegion(newRegion);
    setCity('');
    const rates = getDefaultRatesForRegion(newRegion);
    if (rates) {
      setWorkerDailyRate(rates.workerRate.toString());
      setHelperDailyRate(rates.helperRate.toString());
    }
  }

  function handleSave() {
    if (user) {
      setUser({ ...user, name: name.trim() || user.name, profession });
    }
    setSettings({
      region,
      city,
      workerDailyRate: Number(workerDailyRate) || 280,
      helperDailyRate: Number(helperDailyRate) || 150,
      defaultHelpers: Number(defaultHelpers) || 1,
      minimumMargin: Number(minimumMargin) || 10,
      recommendedMargin: Number(recommendedMargin) || 20,
      fullMargin: Number(fullMargin) || 30,
      defaultWastePercent: Number(defaultWastePercent) || 10,
      defaultRiskReservePercent: Number(defaultRiskReservePercent) || 5,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const selectedRegion = REGIONS.find((r) => r.id === region);
  const citiesInRegion = MAJOR_CITIES.filter((c) => c.region === region);

  return (
    <PageLayout>
      <PageHeader title="Configurações" backTo="/" subtitle="Preferências do aplicativo" />

      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">Dados pessoais</h2>
          </div>
          <div className="space-y-3">
            <Input
              label="Seu nome"
              placeholder="Ex: João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Select
              label="Profissão"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              options={PROFESSIONS.map((p) => ({ value: p, label: p }))}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">Região</h2>
          </div>
          <div className="space-y-3">
            <Select
              label="Região"
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
              options={[
                { value: '', label: 'Selecione sua região...' },
                ...REGIONS.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
            {region && (
              <Select
                label="Cidade"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                options={[
                  { value: '', label: 'Todas as cidades da região' },
                  ...citiesInRegion.map((c) => ({ value: c.name, label: `${c.name} - ${c.state}` })),
                ]}
              />
            )}
            {selectedRegion && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm">
                <p className="font-semibold text-teal-800 mb-1">Referência de mercado (SINAPI + mercado 2026):</p>
                <div className="grid grid-cols-2 gap-2 text-teal-700">
                  <div>
                    <span className="text-xs">Pedreiro:</span>
                    <p className="font-bold">R$ {selectedRegion.workerRate.min} – {selectedRegion.workerRate.max}/dia</p>
                    <p className="text-xs">Mediana: R$ {selectedRegion.workerRate.median}</p>
                  </div>
                  <div>
                    <span className="text-xs">Ajudante:</span>
                    <p className="font-bold">R$ {selectedRegion.helperRate.min} – {selectedRegion.helperRate.max}/dia</p>
                    <p className="text-xs">Mediana: R$ {selectedRegion.helperRate.median}</p>
                  </div>
                </div>
                <p className="text-xs text-teal-600 mt-2">
                  Valores de referência. Preços reais variam conforme cidade, bairro, padrão da obra e negociação.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Valores diários</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Pedreiro (R$/dia)"
              type="number"
              min="0"
              value={workerDailyRate}
              onChange={(e) => setWorkerDailyRate(e.target.value)}
            />
            <Input
              label="Ajudante (R$/dia)"
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
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Margens de lucro</h2>
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
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Outros</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Perda padrão (%)"
              type="number"
              min="0"
              max="100"
              value={defaultWastePercent}
              onChange={(e) => setDefaultWastePercent(e.target.value)}
            />
            <Input
              label="Reserva de risco (%)"
              type="number"
              min="0"
              max="100"
              value={defaultRiskReservePercent}
              onChange={(e) => setDefaultRiskReservePercent(e.target.value)}
            />
          </div>
        </Card>

        <Button fullWidth onClick={handleSave}>
          <Save className="w-4 h-4 mr-2 inline" />
          {saved ? 'Salvo!' : 'Salvar configurações'}
        </Button>
      </div>
    </PageLayout>
  );
}

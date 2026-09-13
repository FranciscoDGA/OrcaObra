import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, Calculator, Zap,
} from 'lucide-react';
import { parseNaturalDescription } from '../../lib/ai-parser';
import { findService } from '../../data/services';
import { generateId } from '../../lib/id';
import { formatMoney } from '../../lib/money';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import type { Budget, ParseResult } from '../../lib/types';

const QUICK_ESTIMATES: Record<string, { min: number; max: number; perM2: number }> = {
  pintura: { min: 800, max: 5000, perM2: 25 },
  revestimento: { min: 1500, max: 8000, perM2: 45 },
  piso: { min: 2000, max: 10000, perM2: 55 },
  reforma: { min: 3000, max: 20000, perM2: 120 },
  construcao: { min: 5000, max: 50000, perM2: 180 },
  geral: { min: 1000, max: 10000, perM2: 35 },
};

export default function QuickBudgetPage() {
  const navigate = useNavigate();
  const { addBudget } = useBudgetStore();
  const { settings } = useSettingsStore();

  const [description, setDescription] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState('');
  const [simPrice, setSimPrice] = useState('');
  const [showSim, setShowSim] = useState(false);

  function handleInterpret() {
    setError('');
    if (!description.trim()) {
      setError('Digite uma descrição do serviço');
      return;
    }
    const parsed = parseNaturalDescription(description);
    setResult(parsed);
    setShowSim(false);
    setSimPrice('');
  }

  function getEstimate(area: number | null, serviceType: string) {
    const key = Object.keys(QUICK_ESTIMATES).find((k) => serviceType.includes(k)) || 'geral';
    const est = QUICK_ESTIMATES[key];
    if (area && area > 0) {
      const estimated = area * est.perM2;
      return { min: estimated * 0.8, max: estimated * 1.3, suggested: estimated };
    }
    return { min: est.min, max: est.max, suggested: (est.min + est.max) / 2 };
  }

  function handleConfirm() {
    if (!result) return;

    const service = findService(result.parsedData.serviceType);
    const now = new Date().toISOString();
    const area = result.parsedData.area;
    const estimate = getEstimate(area, result.parsedData.serviceType);

    const budget: Budget = {
      id: generateId(),
      clientId: null,
      serviceType: result.parsedData.serviceType,
      serviceCategory: service?.category ?? '',
      description: result.rawDescription,
      projectName: '',
      projectDescription: result.rawDescription,
      siteAddress: '',
      city: '',
      measurements: {
        width: result.parsedData.measurements.width,
        length: result.parsedData.measurements.length,
        height: result.parsedData.measurements.height,
      },
      quantities: {},
      options: {},
      calculated: {
        floorArea: area,
        perimeter: null,
        wallArea: null,
        volume: null,
        linearMeters: null,
      },
      estimatedDays: null,
      daysCalculationMode: 'fixed',
      productivityPerDay: null,
      teamDailyCost: null,
      laborCost: null,
      workerCost: null,
      helperCost: null,
      workerDailyRate: settings.workerDailyRate,
      helperDailyRate: settings.helperDailyRate,
      numberOfHelpers: settings.defaultHelpers,
      transportCost: 0,
      foodCost: 0,
      fuelCost: 0,
      toolCost: 0,
      otherCost: 0,
      expenseCost: 0,
      riskReservePercent: settings.defaultRiskReservePercent,
      riskReserve: 0,
      materialCost: 0,
      materialSellingPrice: 0,
      totalCost: estimate.suggested * 0.6,
      minimumMargin: settings.minimumMargin,
      recommendedMargin: settings.recommendedMargin,
      fullMargin: settings.fullMargin,
      minimumPrice: estimate.min,
      recommendedPrice: estimate.suggested,
      fullPrice: estimate.max,
      effectiveUnitPrice: area ? estimate.suggested / area : null,
      pricingVersion: 'v1',
      selectedPriceType: 'recommended',
      customPrice: null,
      discount: 0,
      finalPrice: estimate.suggested,
      paymentMethod: '',
      paymentTerms: [],
      includedServices: [],
      excludedServices: [],
      agreedDays: null,
      validityDays: 30,
      expiresAt: null,
      approvalStatus: 'pending',
      approvedAt: null,
      rejectedAt: null,
      status: 'draft',
      projectMode: 'simple',
      stages: [],
      materials: [],
      createdAt: now,
      updatedAt: now,
    };

    const saved = addBudget(budget);
    navigate(`/budget/${saved.id}/result`);
  }

  const confidenceColor: Record<string, string> = {
    alta: 'text-emerald-700 bg-emerald-50',
    media: 'text-amber-700 bg-amber-50',
    baixa: 'text-red-700 bg-red-50',
  };

  const estimate = result ? getEstimate(result.parsedData.area, result.parsedData.serviceType) : null;

  return (
    <PageLayout>
      <PageHeader title="Orçamento Rápido" backTo="/" subtitle="Descreva o serviço em linguagem natural" />

      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-slate-800">Descreva o serviço</h2>
          </div>
          <Textarea
            placeholder="Ex: Pintura de quarto 4x3 metros, paredes e teto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <Button fullWidth className="mt-3" onClick={handleInterpret}>
            <Sparkles className="w-4 h-4 mr-2 inline" />
            Interpretar com IA
          </Button>
        </Card>

        {result && (
          <>
            <Card>
              <h2 className="font-bold text-slate-800 mb-3">Resultado da interpretação</h2>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-slate-600">Serviço</span>
                  <span className="text-sm font-semibold text-slate-800 capitalize">{result.parsedData.serviceType.replace(/_/g, ' ')}</span>
                </div>

                {result.parsedData.area !== null && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-slate-600">Área</span>
                    <span className="text-sm font-semibold text-slate-800">{result.parsedData.area} m²</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-slate-600">Dimensões</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {[
                      result.parsedData.measurements.width && `L: ${result.parsedData.measurements.width}m`,
                      result.parsedData.measurements.length && `C: ${result.parsedData.measurements.length}m`,
                      result.parsedData.measurements.height && `A: ${result.parsedData.measurements.height}m`,
                    ].filter(Boolean).join(' × ') || 'Não informado'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-slate-600">Confiança</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${confidenceColor[result.confidence] ?? ''}`}>
                    {result.confidence === 'alta' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                    {result.confidence === 'baixa' && <AlertTriangle className="w-3 h-3 mr-1 inline" />}
                    {result.confidence}
                  </span>
                </div>

                {result.missingInformation.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                    <p className="text-xs font-semibold text-amber-800 mb-1">Informações faltantes</p>
                    <p className="text-xs text-amber-700">{result.missingInformation.join(', ')}</p>
                  </div>
                )}
              </div>
            </Card>

            {estimate && (
              <Card className="border-teal-200 bg-teal-50">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-5 h-5 text-teal-600" />
                  <h2 className="font-bold text-teal-800">Estimativa rápida</h2>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-teal-600">Mínimo</p>
                    <p className="text-sm font-bold text-teal-800">{formatMoney(estimate.min)}</p>
                  </div>
                  <div className="bg-white rounded-xl py-1">
                    <p className="text-xs text-teal-600">Sugerido</p>
                    <p className="text-lg font-extrabold text-teal-700">{formatMoney(estimate.suggested)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-600">Cheio</p>
                    <p className="text-sm font-bold text-teal-800">{formatMoney(estimate.max)}</p>
                  </div>
                </div>

                {!showSim ? (
                  <Button fullWidth variant="outline" className="mt-3" onClick={() => { setShowSim(true); setSimPrice(estimate.suggested.toString()); }}>
                    <TrendingUp className="w-4 h-4 mr-1 inline" />
                    Simular preço
                  </Button>
                ) : (
                  <div className="mt-3 space-y-2">
                    <Input
                      label="Preço de venda (R$)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={simPrice}
                      onChange={(e) => setSimPrice(e.target.value)}
                    />
                    {simPrice && (
                      <div className="bg-white rounded-xl p-3 text-center">
                        {(() => {
                          const price = Number(simPrice) || 0;
                          const cost = estimate.suggested * 0.6;
                          const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
                          return (
                            <>
                              <p className="text-xs text-slate-500">Margem estimada</p>
                              <p className={`text-xl font-extrabold ${margin >= 20 ? 'text-emerald-700' : margin >= 10 ? 'text-amber-700' : 'text-red-700'}`}>
                                {margin.toFixed(1)}%
                              </p>
                              <p className="text-xs text-slate-500">Lucro: {formatMoney(price - cost)}</p>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            <Button fullWidth onClick={handleConfirm}>
              Criar orçamento completo
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Button>
          </>
        )}
      </div>
    </PageLayout>
  );
}

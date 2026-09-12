import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { parseNaturalDescription } from '../../lib/ai-parser';
import { findService } from '../../data/services';
import { generateId } from '../../lib/id';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import type { Budget, ParseResult } from '../../lib/types';

export default function QuickBudgetPage() {
  const navigate = useNavigate();
  const { addBudget } = useBudgetStore();
  const { settings } = useSettingsStore();

  const [description, setDescription] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState('');

  function handleInterpret() {
    setError('');
    if (!description.trim()) {
      setError('Digite uma descrição do serviço');
      return;
    }
    const parsed = parseNaturalDescription(description);
    setResult(parsed);
  }

  function handleConfirm() {
    if (!result) return;

    const service = findService(result.parsedData.serviceType);
    const now = new Date().toISOString();

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
        floorArea: result.parsedData.area,
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
      totalCost: 0,
      minimumMargin: settings.minimumMargin,
      recommendedMargin: settings.recommendedMargin,
      fullMargin: settings.fullMargin,
      minimumPrice: null,
      recommendedPrice: null,
      fullPrice: null,
      effectiveUnitPrice: null,
      pricingVersion: 'v1',
      selectedPriceType: null,
      customPrice: null,
      discount: 0,
      finalPrice: null,
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
    navigate(`/budget/${saved.id}/step/1`);
  }

  const confidenceColor: Record<string, string> = {
    alta: 'text-emerald-700 bg-emerald-50',
    media: 'text-amber-700 bg-amber-50',
    baixa: 'text-red-700 bg-red-50',
  };

  return (
    <PageLayout>
      <PageHeader title="Orçamento Rápido" backTo="/" subtitle="Descreva o serviço em linguagem natural" />

      <div className="space-y-4">
        <Card>
          <Textarea
            label="Descrição do serviço"
            placeholder="Ex: Pintura de quarto 4x3 metros, paredes e teto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <Button fullWidth className="mt-3" onClick={handleInterpret}>
            <Sparkles className="w-4 h-4 mr-2 inline" />
            Interpretar descrição
          </Button>
        </Card>

        {result && (
          <Card>
            <h2 className="text-lg font-bold text-slate-800 mb-3">Resultado da interpretação</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Tipo de serviço</span>
                <span className="text-sm font-semibold text-slate-800 capitalize">{result.parsedData.serviceType}</span>
              </div>

              {result.parsedData.area !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Área calculada</span>
                  <span className="text-sm font-semibold text-slate-800">{result.parsedData.area} m²</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Dimensões</span>
                <span className="text-sm font-semibold text-slate-800">
                  {[
                    result.parsedData.measurements.width && `L: ${result.parsedData.measurements.width}m`,
                    result.parsedData.measurements.length && `C: ${result.parsedData.measurements.length}m`,
                    result.parsedData.measurements.height && `A: ${result.parsedData.measurements.height}m`,
                  ]
                    .filter(Boolean)
                    .join(' × ') || 'Não informado'}
                </span>
              </div>

              {result.parsedData.services.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Serviços detectados</span>
                  <span className="text-sm font-semibold text-slate-800">{result.parsedData.services.join(', ')}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Confiança</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${confidenceColor[result.confidence] ?? ''}`}>
                  {result.confidence === 'alta' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                  {result.confidence === 'baixa' && <AlertTriangle className="w-3 h-3 mr-1 inline" />}
                  {result.confidence}
                </span>
              </div>

              {result.missingInformation.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-amber-800 mb-1">Informações faltantes</p>
                  <ul className="text-sm text-amber-700 list-disc list-inside">
                    {result.missingInformation.map((info) => (
                      <li key={info}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button fullWidth className="mt-4" onClick={handleConfirm}>
              Confirmar e criar orçamento
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Button>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { findService } from '../../data/services';
import { calculatePricing, estimateDays } from '../../lib/pricing';
import type { DaysCalculationMode } from '../../lib/types';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function PricingPage() {
  const navigate = useNavigate();
  const { budgetId: id } = useParams<{ budgetId: string }>();

  const budgets = useBudgetStore((s) => s.budgets);
  const updateBudget = useBudgetStore((s) => s.updateBudget);
  const settings = useSettingsStore((s) => s.settings);

  const found = budgets.find((b) => b.id === id);
  const isFullProject = found?.projectMode === 'full';
  const svc = found && !isFullProject ? findService(found.serviceType) : null;

  const budget = found;
  const totalSteps = isFullProject ? 1 : (svc?.steps?.length ?? 1);
  const quantity = budget
    ? (budget.quantities.quantity1 ??
      budget.measurements.floorArea ??
      budget.measurements.area ??
      budget.measurements.wallArea ??
      budget.measurements.length ??
      1)
    : 1;

  const [daysMode, setDaysMode] = useState<DaysCalculationMode>(budget?.daysCalculationMode || 'manual');
  const [manualDays, setManualDays] = useState(budget?.estimatedDays?.toString() ?? '');
  const [productivity, setProductivity] = useState(budget?.productivityPerDay?.toString() ?? '');
  const [workerRate, setWorkerRate] = useState(budget?.workerDailyRate?.toString() ?? settings.workerDailyRate.toString());
  const [helperRate, setHelperRate] = useState(budget?.helperDailyRate?.toString() ?? settings.helperDailyRate.toString());
  const [helpers, setHelpers] = useState(budget?.numberOfHelpers?.toString() ?? settings.defaultHelpers.toString());
  const [transport, setTransport] = useState(budget?.transportCost?.toString() ?? '');
  const [food, setFood] = useState(budget?.foodCost?.toString() ?? '');
  const [fuel, setFuel] = useState(budget?.fuelCost?.toString() ?? '');
  const [tools, setTools] = useState(budget?.toolCost?.toString() ?? '');
  const [other, setOther] = useState(budget?.otherCost?.toString() ?? '');
  const [riskPct, setRiskPct] = useState(budget?.riskReservePercent?.toString() ?? settings.defaultRiskReservePercent.toString());
  const [material, setMaterial] = useState(budget?.materialCost?.toString() ?? '');
  const [minMargin, setMinMargin] = useState(budget?.minimumMargin?.toString() ?? settings.minimumMargin.toString());
  const [recMargin, setRecMargin] = useState(budget?.recommendedMargin?.toString() ?? settings.recommendedMargin.toString());
  const [fullMarginVal, setFullMarginVal] = useState(budget?.fullMargin?.toString() ?? settings.fullMargin.toString());

  if (!budget) {
    return (
      <div className="pb-6">
        <PageHeader title="Orçamento não encontrado" backTo="/" />
        <p className="text-slate-500 text-center mt-8">Orçamento não encontrado.</p>
      </div>
    );
  }

  if (!isFullProject && !svc) {
    return (
      <div className="pb-6">
        <PageHeader title="Serviço não encontrado" backTo="/" />
        <p className="text-slate-500 text-center mt-8">Tipo de serviço "{budget.serviceType}" não encontrado no catálogo.</p>
      </div>
    );
  }

  function handleCalculate() {
    if (!budget) return;
    const b = budget;
    const parsedDaysMode = daysMode;
    const parsedManualDays = parseFloat(manualDays) || b.estimatedDays;
    const parsedProductivity = parseFloat(productivity) || b.productivityPerDay;
    const parsedWorkerRate = parseFloat(workerRate) || settings.workerDailyRate;
    const parsedHelperRate = parseFloat(helperRate) || settings.helperDailyRate;
    const parsedHelpers = parseInt(helpers, 10) || settings.defaultHelpers;
    const parsedTransport = parseFloat(transport) || 0;
    const parsedFood = parseFloat(food) || 0;
    const parsedFuel = parseFloat(fuel) || 0;
    const parsedTools = parseFloat(tools) || 0;
    const parsedOther = parseFloat(other) || 0;
    const parsedRiskPct = parseFloat(riskPct) || settings.defaultRiskReservePercent;
    const parsedMaterial = parseFloat(material) || b.materialCost;
    const parsedMinMargin = parseFloat(minMargin) || settings.minimumMargin;
    const parsedRecMargin = parseFloat(recMargin) || settings.recommendedMargin;
    const parsedFullMargin = parseFloat(fullMarginVal) || settings.fullMargin;

    const estimatedDays = estimateDays({
      mode: parsedDaysMode,
      manualDays: parsedManualDays,
      quantity,
      productivityPerDay: parsedProductivity,
    });

    const result = calculatePricing({
      workerDailyRate: parsedWorkerRate,
      helperDailyRate: parsedHelperRate,
      numberOfHelpers: parsedHelpers,
      daysCalculationMode: parsedDaysMode,
      manualDays: parsedManualDays,
      productivityPerDay: parsedProductivity,
      quantity,
      transportCost: parsedTransport,
      foodCost: parsedFood,
      fuelCost: parsedFuel,
      toolCost: parsedTools,
      otherCost: parsedOther,
      materialCost: parsedMaterial,
      riskReservePercent: parsedRiskPct,
      minimumMargin: parsedMinMargin,
      recommendedMargin: parsedRecMargin,
      fullMargin: parsedFullMargin,
    });

    const updated = {
      ...b,
      id: b.id,
      daysCalculationMode: parsedDaysMode,
      estimatedDays,
      productivityPerDay: parsedProductivity,
      workerDailyRate: parsedWorkerRate,
      helperDailyRate: parsedHelperRate,
      numberOfHelpers: parsedHelpers,
      transportCost: parsedTransport,
      foodCost: parsedFood,
      fuelCost: parsedFuel,
      toolCost: parsedTools,
      otherCost: parsedOther,
      expenseCost: result.expenseCost,
      riskReservePercent: parsedRiskPct,
      riskReserve: result.riskReserve,
      materialCost: parsedMaterial,
      laborCost: result.laborCost,
      teamDailyCost: result.teamDailyCost,
      workerCost: parsedWorkerRate * estimatedDays,
      helperCost: parsedHelperRate * parsedHelpers * estimatedDays,
      totalCost: result.totalCost,
      minimumMargin: parsedMinMargin,
      recommendedMargin: parsedRecMargin,
      fullMargin: parsedFullMargin,
      minimumPrice: result.minimumPrice,
      recommendedPrice: result.recommendedPrice,
      fullPrice: result.fullPrice,
      effectiveUnitPrice: result.effectiveUnitPrice,
      pricingVersion: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateBudget(updated);
    navigate(`/budget/${id}/result`);
  }

  const backTo = isFullProject
    ? `/budget/new/full`
    : `/budget/${id}/step/${totalSteps}`;

  return (
    <div className="pb-6">
      <PageHeader
        title="Custos e prazo"
        backTo={backTo}
        subtitle="Defina os parâmetros de precificação"
      />

      <div className="space-y-5 mt-2">
        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Prazo</h3>
          <div className="space-y-3">
            <Select
              label="Modo de cálculo de dias"
              options={[
                { value: 'manual', label: 'Manual' },
                { value: 'productivity', label: 'Por produtividade' },
              ]}
              value={daysMode}
              onChange={(e) => setDaysMode(e.target.value as DaysCalculationMode)}
            />
            <Input
              type="number"
              label="Dias estimados"
              step="1"
              value={manualDays}
              onChange={(e) => setManualDays(e.target.value)}
              help="Modo manual: informe diretamente"
            />
            <Input
              type="number"
              label="Produtividade por dia"
              step="0.01"
              value={productivity}
              onChange={(e) => setProductivity(e.target.value)}
              help="Modo produtividade: unidade/dia"
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Mão de obra</h3>
          <div className="space-y-3">
            <Input
              type="number"
              label="Diária do pedreiro (R$)"
              step="0.01"
              value={workerRate}
              onChange={(e) => setWorkerRate(e.target.value)}
            />
            <Input
              type="number"
              label="Diária do ajudante (R$)"
              step="0.01"
              value={helperRate}
              onChange={(e) => setHelperRate(e.target.value)}
            />
            <Input
              type="number"
              label="Número de ajudantes"
              step="1"
              value={helpers}
              onChange={(e) => setHelpers(e.target.value)}
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Despesas</h3>
          <div className="space-y-3">
            <Input
              type="number"
              label="Transporte (R$)"
              step="0.01"
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
            />
            <Input
              type="number"
              label="Alimentação (R$)"
              step="0.01"
              value={food}
              onChange={(e) => setFood(e.target.value)}
            />
            <Input
              type="number"
              label="Combustível (R$)"
              step="0.01"
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
            />
            <Input
              type="number"
              label="Ferramentas (R$)"
              step="0.01"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
            />
            <Input
              type="number"
              label="Outras despesas (R$)"
              step="0.01"
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Reserva e materiais</h3>
          <div className="space-y-3">
            <Input
              type="number"
              label="Reserva de risco (%)"
              step="1"
              value={riskPct}
              onChange={(e) => setRiskPct(e.target.value)}
            />
            <Input
              type="number"
              label="Custo dos materiais (R$)"
              step="0.01"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Margens</h3>
          <div className="space-y-3">
            <Input
              type="number"
              label="Margem mínima (%)"
              step="1"
              value={minMargin}
              onChange={(e) => setMinMargin(e.target.value)}
            />
            <Input
              type="number"
              label="Margem recomendada (%)"
              step="1"
              value={recMargin}
              onChange={(e) => setRecMargin(e.target.value)}
            />
            <Input
              type="number"
              label="Margem cheia (%)"
              step="1"
              value={fullMarginVal}
              onChange={(e) => setFullMarginVal(e.target.value)}
            />
          </div>
        </section>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" fullWidth onClick={() => navigate(backTo)}>
          <ArrowLeft size={18} className="mr-2 inline" />
          Voltar
        </Button>
        <Button fullWidth onClick={handleCalculate}>
          <Calculator size={18} className="mr-2 inline" />
          Calcular orçamento
        </Button>
      </div>
    </div>
  );
}

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { findService } from '../../data/services';
import { calculatePricing, estimateDays } from '../../lib/pricing';
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
  if (!found) {
    return (
      <div className="pb-6">
        <PageHeader title="Orçamento não encontrado" backTo="/" />
        <p className="text-slate-500 text-center mt-8">Orçamento não encontrado.</p>
      </div>
    );
  }

  const isFullProject = found.projectMode === 'full';
  const svc = isFullProject ? null : findService(found.serviceType);

  if (!isFullProject && !svc) {
    return (
      <div className="pb-6">
        <PageHeader title="Serviço não encontrado" backTo="/" />
        <p className="text-slate-500 text-center mt-8">Tipo de serviço "{found.serviceType}" não encontrado no catálogo.</p>
      </div>
    );
  }

  const budget = found;
  const totalSteps = isFullProject ? 1 : (svc?.steps?.length ?? 1);
  const quantity =
    budget.quantities.quantity1 ??
    budget.measurements.floorArea ??
    budget.measurements.area ??
    budget.measurements.wallArea ??
    budget.measurements.length ??
    1;

  function handleCalculate() {
    const b = budget!;
    const el = (field: string) =>
      document.querySelector<HTMLInputElement>(`[data-field="${field}"]`);

    const daysMode = el('daysCalculationMode')?.value ?? b.daysCalculationMode ?? 'manual';
    const manualDays = parseFloat(el('estimatedDays')?.value ?? '') || b.estimatedDays;
    const productivity = parseFloat(el('productivityPerDay')?.value ?? '') || b.productivityPerDay;
    const workerRate = parseFloat(el('workerDailyRate')?.value ?? '') || settings.workerDailyRate;
    const helperRate = parseFloat(el('helperDailyRate')?.value ?? '') || settings.helperDailyRate;
    const helpers = parseInt(el('numberOfHelpers')?.value ?? '', 10) || settings.defaultHelpers;
    const transport = parseFloat(el('transportCost')?.value ?? '') || 0;
    const food = parseFloat(el('foodCost')?.value ?? '') || 0;
    const fuel = parseFloat(el('fuelCost')?.value ?? '') || 0;
    const tools = parseFloat(el('toolCost')?.value ?? '') || 0;
    const other = parseFloat(el('otherCost')?.value ?? '') || 0;
    const riskPct = parseFloat(el('riskReservePercent')?.value ?? '') || settings.defaultRiskReservePercent;
    const material = parseFloat(el('materialCost')?.value ?? '') || b.materialCost;
    const minMargin = parseFloat(el('minimumMargin')?.value ?? '') || settings.minimumMargin;
    const recMargin = parseFloat(el('recommendedMargin')?.value ?? '') || settings.recommendedMargin;
    const fullMargin = parseFloat(el('fullMargin')?.value ?? '') || settings.fullMargin;

    const estimatedDays = estimateDays({
      mode: daysMode,
      manualDays,
      quantity,
      productivityPerDay: productivity,
    });

    const result = calculatePricing({
      workerDailyRate: workerRate,
      helperDailyRate: helperRate,
      numberOfHelpers: helpers,
      daysCalculationMode: daysMode,
      manualDays,
      productivityPerDay: productivity,
      quantity,
      transportCost: transport,
      foodCost: food,
      fuelCost: fuel,
      toolCost: tools,
      otherCost: other,
      materialCost: material,
      riskReservePercent: riskPct,
      minimumMargin: minMargin,
      recommendedMargin: recMargin,
      fullMargin: fullMargin,
    });

    const updated = {
      ...b,
      daysCalculationMode: daysMode,
      estimatedDays,
      productivityPerDay: productivity,
      workerDailyRate: workerRate,
      helperDailyRate: helperRate,
      numberOfHelpers: helpers,
      transportCost: transport,
      foodCost: food,
      fuelCost: fuel,
      toolCost: tools,
      otherCost: other,
      expenseCost: result.expenseCost,
      riskReservePercent: riskPct,
      riskReserve: result.riskReserve,
      materialCost: material,
      laborCost: result.laborCost,
      teamDailyCost: result.teamDailyCost,
      workerCost: workerRate * estimatedDays,
      helperCost: helperRate * helpers * estimatedDays,
      totalCost: result.totalCost,
      minimumMargin: minMargin,
      recommendedMargin: recMargin,
      fullMargin: fullMargin,
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
              data-field="daysCalculationMode"
              label="Modo de cálculo de dias"
              options={[
                { value: 'manual', label: 'Manual' },
                { value: 'productivity', label: 'Por produtividade' },
              ]}
              defaultValue={budget.daysCalculationMode || 'manual'}
            />
            <Input
              data-field="estimatedDays"
              type="number"
              label="Dias estimados"
              step="1"
              defaultValue={budget.estimatedDays ?? ''}
              help="Modo manual: informe diretamente"
            />
            <Input
              data-field="productivityPerDay"
              type="number"
              label="Produtividade por dia"
              step="0.01"
              defaultValue={budget.productivityPerDay ?? ''}
              help="Modo produtividade: unidade/dia"
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Mão de obra</h3>
          <div className="space-y-3">
            <Input
              data-field="workerDailyRate"
              type="number"
              label="Diária do pedreiro (R$)"
              step="0.01"
              defaultValue={budget.workerDailyRate ?? settings.workerDailyRate}
            />
            <Input
              data-field="helperDailyRate"
              type="number"
              label="Diária do ajudante (R$)"
              step="0.01"
              defaultValue={budget.helperDailyRate ?? settings.helperDailyRate}
            />
            <Input
              data-field="numberOfHelpers"
              type="number"
              label="Número de ajudantes"
              step="1"
              defaultValue={budget.numberOfHelpers ?? settings.defaultHelpers}
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Despesas</h3>
          <div className="space-y-3">
            <Input
              data-field="transportCost"
              type="number"
              label="Transporte (R$)"
              step="0.01"
              defaultValue={budget.transportCost || ''}
            />
            <Input
              data-field="foodCost"
              type="number"
              label="Alimentação (R$)"
              step="0.01"
              defaultValue={budget.foodCost || ''}
            />
            <Input
              data-field="fuelCost"
              type="number"
              label="Combustível (R$)"
              step="0.01"
              defaultValue={budget.fuelCost || ''}
            />
            <Input
              data-field="toolCost"
              type="number"
              label="Ferramentas (R$)"
              step="0.01"
              defaultValue={budget.toolCost || ''}
            />
            <Input
              data-field="otherCost"
              type="number"
              label="Outras despesas (R$)"
              step="0.01"
              defaultValue={budget.otherCost || ''}
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Reserva e materiais</h3>
          <div className="space-y-3">
            <Input
              data-field="riskReservePercent"
              type="number"
              label="Reserva de risco (%)"
              step="1"
              defaultValue={budget.riskReservePercent ?? settings.defaultRiskReservePercent}
            />
            <Input
              data-field="materialCost"
              type="number"
              label="Custo dos materiais (R$)"
              step="0.01"
              defaultValue={budget.materialCost || ''}
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Margens</h3>
          <div className="space-y-3">
            <Input
              data-field="minimumMargin"
              type="number"
              label="Margem mínima (%)"
              step="1"
              defaultValue={budget.minimumMargin ?? settings.minimumMargin}
            />
            <Input
              data-field="recommendedMargin"
              type="number"
              label="Margem recomendada (%)"
              step="1"
              defaultValue={budget.recommendedMargin ?? settings.recommendedMargin}
            />
            <Input
              data-field="fullMargin"
              type="number"
              label="Margem cheia (%)"
              step="1"
              defaultValue={budget.fullMargin ?? settings.fullMargin}
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

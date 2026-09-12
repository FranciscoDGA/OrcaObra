import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, TrendingUp, Hammer } from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatMoney } from '../../lib/money';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { useState } from 'react';

export default function ResultPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const budgets = useBudgetStore((s) => s.budgets);
  const updateBudget = useBudgetStore((s) => s.updateBudget);
  const [simPrice, setSimPrice] = useState<number | null>(null);
  const [simMargin, setSimMargin] = useState<number | null>(null);

  const found = budgets.find((b) => b.id === id);

  if (!found) {
    return (
      <div className="pb-6">
        <PageHeader title="Orçamento não encontrado" backTo="/" />
        <p className="text-slate-500 text-center mt-8">Orçamento não encontrado.</p>
      </div>
    );
  }

  const budget = found;
  const laborCost = budget.laborCost ?? 0;
  const days = budget.estimatedDays ?? 0;
  const expenses = budget.expenseCost ?? 0;
  const materials = budget.materialCost ?? 0;
  const riskReserve = budget.riskReserve ?? 0;
  const totalCost = budget.totalCost ?? 0;
  const minPrice = budget.minimumPrice ?? 0;
  const recPrice = budget.recommendedPrice ?? 0;
  const fullPrice = budget.fullPrice ?? 0;

  const isApproved = budget.status === 'Aprovado';

  function handleApprove() {
    const now = new Date().toISOString();
    updateBudget({
      id: budget.id,
      clientId: budget.clientId,
      serviceType: budget.serviceType,
      serviceCategory: budget.serviceCategory,
      description: budget.description,
      projectName: budget.projectName,
      projectDescription: budget.projectDescription,
      siteAddress: budget.siteAddress,
      city: budget.city,
      measurements: budget.measurements,
      quantities: budget.quantities,
      options: budget.options,
      calculated: budget.calculated,
      estimatedDays: budget.estimatedDays,
      daysCalculationMode: budget.daysCalculationMode,
      productivityPerDay: budget.productivityPerDay,
      teamDailyCost: budget.teamDailyCost,
      laborCost: budget.laborCost,
      workerCost: budget.workerCost,
      helperCost: budget.helperCost,
      workerDailyRate: budget.workerDailyRate,
      helperDailyRate: budget.helperDailyRate,
      numberOfHelpers: budget.numberOfHelpers,
      transportCost: budget.transportCost,
      foodCost: budget.foodCost,
      fuelCost: budget.fuelCost,
      toolCost: budget.toolCost,
      otherCost: budget.otherCost,
      expenseCost: budget.expenseCost,
      riskReservePercent: budget.riskReservePercent,
      riskReserve: budget.riskReserve,
      materialCost: budget.materialCost,
      materialSellingPrice: budget.materialSellingPrice,
      totalCost: budget.totalCost,
      minimumMargin: budget.minimumMargin,
      recommendedMargin: budget.recommendedMargin,
      fullMargin: budget.fullMargin,
      minimumPrice: budget.minimumPrice,
      recommendedPrice: budget.recommendedPrice,
      fullPrice: budget.fullPrice,
      effectiveUnitPrice: budget.effectiveUnitPrice,
      pricingVersion: budget.pricingVersion,
      selectedPriceType: budget.selectedPriceType,
      customPrice: budget.customPrice,
      discount: budget.discount,
      finalPrice: budget.finalPrice,
      paymentMethod: budget.paymentMethod,
      paymentTerms: budget.paymentTerms,
      includedServices: budget.includedServices,
      excludedServices: budget.excludedServices,
      agreedDays: budget.agreedDays,
      validityDays: budget.validityDays,
      expiresAt: budget.expiresAt,
      approvalStatus: 'Aprovado',
      approvedAt: now,
      rejectedAt: budget.rejectedAt,
      status: 'Aprovado',
      projectMode: budget.projectMode,
      stages: budget.stages,
      materials: budget.materials,
      createdAt: budget.createdAt,
      updatedAt: now,
    });
  }

  function handleSimulate() {
    const raw = window.prompt('Informe o preço de venda (R$):');
    if (!raw) return;
    const price = parseFloat(raw.replace(',', '.'));
    if (isNaN(price) || price <= 0) return;

    setSimPrice(price);
    if (totalCost > 0) {
      const margin = ((price - totalCost) / price) * 100;
      setSimMargin(Math.round(margin * 100) / 100);
    }
  }

  return (
    <div className="pb-6">
      <PageHeader
        title="Resultado do orçamento"
        backTo={`/budget/${id}/pricing`}
      />

      <div className="flex items-center gap-3 mb-4 mt-2">
        <StatusBadge status={budget.status} />
        {budget.serviceType && (
          <span className="text-sm text-slate-500 capitalize">
            {budget.serviceType.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Mínimo</p>
          <p className="text-xl font-bold text-amber-900">{formatMoney(minPrice)}</p>
        </Card>
        <Card className="border-green-200 bg-green-50 ring-2 ring-green-300">
          <p className="text-xs font-semibold text-green-700 uppercase mb-1">Recomendado</p>
          <p className="text-xl font-bold text-green-900">{formatMoney(recPrice)}</p>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Cheio</p>
          <p className="text-xl font-bold text-blue-900">{formatMoney(fullPrice)}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="font-bold text-slate-900 mb-3">Detalhamento de custos</h3>
        <div className="divide-y divide-slate-100 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-slate-600">Mão de obra</span>
            <span className="font-semibold">{formatMoney(laborCost)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-600">Dias estimados</span>
            <span className="font-semibold">{days} dia{days !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-600">Despesas</span>
            <span className="font-semibold">{formatMoney(expenses)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-600">Materiais</span>
            <span className="font-semibold">{formatMoney(materials)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-600">Reserva de risco</span>
            <span className="font-semibold">{formatMoney(riskReserve)}</span>
          </div>
          <div className="flex justify-between py-2 bg-slate-50 -mx-5 px-5 rounded-b-xl">
            <span className="font-bold text-slate-900">Total</span>
            <span className="font-bold text-slate-900">{formatMoney(totalCost)}</span>
          </div>
        </div>
      </Card>

      {simPrice !== null && simMargin !== null && (
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-purple-600" />
            <h3 className="font-bold text-purple-900 text-sm">Simulação de preço</h3>
          </div>
          <p className="text-sm text-purple-700">
            Preço informado: <strong>{formatMoney(simPrice)}</strong>
          </p>
          <p className="text-sm text-purple-700">
            Margem: <strong>{simMargin}%</strong>
          </p>
        </Card>
      )}

      <div className="space-y-3">
        <Button fullWidth onClick={() => navigate(`/budget/${id}/proposal`)}>
          <FileText size={18} className="mr-2 inline" />
          Gerar proposta
        </Button>

        {!isApproved && (
          <Button fullWidth variant="secondary" onClick={handleApprove}>
            <CheckCircle size={18} className="mr-2 inline" />
            Aprovar orçamento
          </Button>
        )}

        <Button fullWidth variant="light" onClick={handleSimulate}>
          <TrendingUp size={18} className="mr-2 inline" />
          Simular preço
        </Button>

        {isApproved && (
          <Button fullWidth variant="primary" onClick={() => navigate(`/works/${id}`)}>
            <Hammer size={18} className="mr-2 inline" />
            Iniciar obra
          </Button>
        )}

        <Button fullWidth variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft size={18} className="mr-2 inline" />
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}

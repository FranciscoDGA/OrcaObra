import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, TrendingUp, Percent, Save } from 'lucide-react';
import { useExecutionStore } from '../../store/useExecutionStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatMoney } from '../../lib/money';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function WorkDetailPage() {
  const { executionId } = useParams<{ executionId: string }>();
  const { executions, loadExecutions, saveExecution } = useExecutionStore();
  const { budgets, loadBudgets } = useBudgetStore();

  const [execution, setExecution] = useState(executions.find((e) => e.id === executionId) ?? null);
  const [progressInput, setProgressInput] = useState('');

  useEffect(() => {
    loadExecutions();
    loadBudgets();
  }, [loadExecutions, loadBudgets]);

  useEffect(() => {
    const found = executions.find((e) => e.id === executionId) ?? null;
    setExecution(found);
    if (found) setProgressInput(found.progressPercent.toString());
  }, [executionId, executions]);

  const budget = execution ? budgets.find((b) => b.id === execution.projectId) ?? null : null;

  function handleSaveProgress() {
    if (!execution) return;
    const value = Math.min(100, Math.max(0, Number(progressInput) || 0));
    saveExecution({ ...execution, progressPercent: value });
  }

  if (!execution || !budget) {
    return (
      <PageLayout>
        <PageHeader title="Obra" backTo="/works" />
        <Card>
          <p className="text-slate-500 text-center py-8">Obra não encontrada.</p>
        </Card>
      </PageLayout>
    );
  }

  const recommendedPrice = budget.recommendedPrice ?? budget.totalCost ?? 0;

  return (
    <PageLayout>
      <PageHeader
        title={budget.projectName || budget.serviceType}
        backTo="/works"
        subtitle="Detalhes da obra"
      />

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <DollarSign className="w-6 h-6 text-teal-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Contratado</p>
            <p className="text-sm font-bold text-slate-800">{formatMoney(recommendedPrice)}</p>
          </Card>
          <Card className="text-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Custo real</p>
            <p className="text-sm font-bold text-slate-800">{formatMoney(execution.actualTotalCost)}</p>
          </Card>
          <Card className="text-center">
            <Percent className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Progresso</p>
            <p className="text-sm font-bold text-slate-800">{execution.progressPercent}%</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">Progresso da obra</h2>
            <span className="text-2xl font-extrabold text-teal-700">{execution.progressPercent}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${execution.progressPercent}%` }}
            />
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Novo progresso (%)"
                type="number"
                min="0"
                max="100"
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveProgress} className="shrink-0">
              <Save className="w-4 h-4 mr-1 inline" />
              Salvar progresso
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}

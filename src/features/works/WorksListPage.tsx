import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FolderOpen } from 'lucide-react';
import { useExecutionStore } from '../../store/useExecutionStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatMoney } from '../../lib/money';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_progress: { label: 'Em andamento', color: 'text-blue-700 bg-blue-50' },
  completed: { label: 'Concluído', color: 'text-emerald-700 bg-emerald-50' },
  paused: { label: 'Pausado', color: 'text-amber-700 bg-amber-50' },
  cancelled: { label: 'Cancelado', color: 'text-red-700 bg-red-50' },
};

export default function WorksListPage() {
  const navigate = useNavigate();
  const { executions, loadExecutions } = useExecutionStore();
  const { budgets, loadBudgets } = useBudgetStore();

  useEffect(() => {
    loadExecutions();
    loadBudgets();
  }, [loadExecutions, loadBudgets]);

  function getProjectName(projectId: string): string {
    const budget = budgets.find((b) => b.id === projectId);
    return budget?.projectName || budget?.serviceType || 'Projeto sem nome';
  }

  return (
    <PageLayout>
      <PageHeader title="Obras" subtitle={`${executions.length} obra(s)`} />

      {executions.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhuma obra em andamento</p>
            <p className="text-sm text-slate-400 mt-1">Inicie uma obra a partir de um orçamento aprovado</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {executions.map((execution) => {
            const statusInfo = STATUS_LABELS[execution.status] ?? { label: execution.status, color: 'text-slate-700 bg-slate-50' };

            return (
              <button
                key={execution.id}
                onClick={() => navigate(`/work/${execution.id}`)}
                className="w-full text-left"
              >
                <Card className="hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{getProjectName(execution.projectId)}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-sm text-slate-500">{execution.progressPercent}%</span>
                        <span className="text-sm font-semibold text-slate-700">{formatMoney(execution.actualTotalCost)}</span>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-slate-400 ml-2 shrink-0" />
                  </div>

                  <div className="mt-3">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${execution.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}

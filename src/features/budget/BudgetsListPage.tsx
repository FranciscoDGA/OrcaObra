import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatMoney, formatDate } from '../../lib/money';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { FileText } from 'lucide-react';

export default function BudgetsListPage() {
  const budgets = useBudgetStore((s) => s.budgets);
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Orçamentos" subtitle="Todos os seus orçamentos." />
      {budgets.length === 0 ? (
        <Card className="text-center py-10">
          <FileText className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 mb-4">Nenhum orçamento ainda.</p>
          <Button variant="primary" onClick={() => navigate('/new')}>
            Criar primeiro orçamento
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {budgets.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/budget/${b.id}/result`)}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 text-left hover:border-teal-300 transition-colors shadow-sm"
            >
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {b.projectName || b.serviceType || 'Orçamento'}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {b.serviceType} • {formatDate(b.updatedAt || b.createdAt)}
                  {b.finalPrice ? ` • ${formatMoney(b.finalPrice)}` : ''}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

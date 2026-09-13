import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatMoney, formatDate } from '../../lib/money';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { FileText, Pencil, Trash2 } from 'lucide-react';

export default function BudgetsListPage() {
  const budgets = useBudgetStore((s) => s.budgets);
  const deleteBudget = useBudgetStore((s) => s.deleteBudget);
  const navigate = useNavigate();

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (window.confirm('Excluir este orçamento?')) {
      deleteBudget(id);
    }
  }

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
            <div
              key={b.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
            >
              <button
                className="flex-1 min-w-0 text-left"
                onClick={() => navigate(`/budget/${b.id}/edit`)}
              >
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {b.projectName || b.serviceType || 'Orçamento'}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {b.serviceType} • {formatDate(b.updatedAt || b.createdAt)}
                  {b.finalPrice ? ` • ${formatMoney(b.finalPrice)}` : ''}
                </p>
              </button>
              <StatusBadge status={b.status} />
              <button
                onClick={() => navigate(`/budget/${b.id}/edit`)}
                className="p-2 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
                title="Editar"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={(e) => handleDelete(e, b.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

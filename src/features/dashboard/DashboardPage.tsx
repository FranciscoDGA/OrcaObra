import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Plus,
  Users,
  Package,
  ChevronRight,
  FileText,
  Hammer,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatMoney, formatDate } from '../../lib/money';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

export default function DashboardPage() {
  const navigate = useNavigate();
  const budgets = useBudgetStore((s) => s.budgets);
  const deleteBudget = useBudgetStore((s) => s.deleteBudget);
  const user = useSettingsStore((s) => s.user);

  const recentBudgets = [...budgets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const displayName = user?.name?.split(' ')[0] ?? 'Profissional';

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (window.confirm('Excluir este orçamento?')) {
      deleteBudget(id);
    }
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">
          Olá, {displayName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Organize sua obra do orçamento ao resultado.
        </p>
      </div>

      {/* Hero: Quick budget */}
      <Card
        className="bg-gradient-to-br from-teal-500 to-teal-700 border-teal-600 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate('/quick')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Orçamento rápido</h2>
              <p className="text-teal-100 text-sm">Crie em segundos com IA</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70" />
        </div>
      </Card>

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/new')}
        >
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
              <Plus className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">Novo orçamento</span>
            <span className="text-xs text-slate-500">Orçamento detalhado</span>
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/works')}
        >
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Hammer className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">Minhas obras</span>
            <span className="text-xs text-slate-500">Acompanhe execução</span>
          </div>
        </Card>
      </div>

      {/* Recent budgets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800">Meus orçamentos</h2>
          {budgets.length > 0 && (
            <button
              onClick={() => navigate('/orcamentos')}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Ver todos
            </button>
          )}
        </div>

        {recentBudgets.length === 0 ? (
          <Card className="text-center py-8">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Nenhum orçamento ainda.</p>
            <Button onClick={() => navigate('/new')}>
              <Plus className="w-4 h-4 mr-2 inline" />
              Criar primeiro orçamento
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentBudgets.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
              >
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => navigate(`/budget/${b.id}/edit`)}
                >
                  <h3 className="text-sm font-bold text-slate-800 truncate">
                    {b.projectName || b.serviceType}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{b.serviceType}</span>
                    <span>·</span>
                    <span>{formatDate(b.createdAt)}</span>
                  </div>
                </button>
                <div className="flex flex-col items-end gap-1 ml-2">
                  {b.finalPrice != null && (
                    <span className="text-sm font-bold text-slate-800">
                      {formatMoney(b.finalPrice)}
                    </span>
                  )}
                  <StatusBadge status={b.status} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/budget/${b.id}/edit`);
                  }}
                  className="p-2 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, b.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/clients')}
        >
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">Clientes</span>
            <span className="text-xs text-slate-500">Gerencie contatos</span>
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/materials')}
        >
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">Meus materiais</span>
            <span className="text-xs text-slate-500">Lista e preços</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

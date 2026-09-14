import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, Percent, Save, Plus, Trash2,
} from 'lucide-react';
import { useExecutionStore } from '../../store/useExecutionStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatMoney, formatDate } from '../../lib/money';
import { generateId } from '../../lib/id';
import { recalcExecution } from '../../lib/execution-utils';
import {
  PAYMENT_CATEGORIES, EXPENSE_CATEGORIES,
  STAGE_STATUS_COLORS, STAGE_STATUS_LABELS,
} from '../../lib/constants';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import type { Execution, Payment, Expense, LogEntry, ExecutionStage, StageStatus } from '../../lib/types';

export default function WorkDetailPage() {
  const navigate = useNavigate();
  const { executionId } = useParams<{ executionId: string }>();
  const { executions, loadExecutions, saveExecution, deleteExecution } = useExecutionStore();
  const { budgets, loadBudgets } = useBudgetStore();

  const [execution, setExecution] = useState<Execution | null>(null);
  const [activeTab, setActiveTab] = useState<'stages' | 'payments' | 'expenses' | 'log'>('stages');
  const [progressInput, setProgressInput] = useState('');

  // Payment form
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc] = useState('');
  const [payCategory, setPayCategory] = useState('sinal');

  // Expense form
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState('material');

  // Log form
  const [logMessage, setLogMessage] = useState('');

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
    const updated = recalcExecution({ ...execution, progressPercent: value });
    saveExecution(updated);
  }

  function handleStageToggle(stageId: string, newStatus: StageStatus) {
    if (!execution) return;
    const stages = execution.stages.map((s: ExecutionStage) =>
      s.id === stageId
        ? { ...s, status: newStatus, progressPercent: newStatus === 'completed' ? 100 : s.progressPercent }
        : s
    );
    const completedCount = stages.filter((s) => s.status === 'completed').length;
    const progress = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;
    saveExecution(recalcExecution({ ...execution, stages, progressPercent: progress }));
  }

  function handleAddPayment() {
    if (!execution || !payAmount) return;
    const payment: Payment = {
      id: generateId(),
      date: new Date().toISOString(),
      amount: Number(payAmount) || 0,
      description: payDesc.trim() || PAYMENT_CATEGORIES.find((c) => c.value === payCategory)?.label || payCategory,
    };
    saveExecution(recalcExecution({ ...execution, payments: [...execution.payments, payment] }));
    setPayAmount('');
    setPayDesc('');
  }

  function handleDeletePayment(id: string) {
    if (!execution) return;
    saveExecution(recalcExecution({
      ...execution,
      payments: execution.payments.filter((p) => p.id !== id),
    }));
  }

  function handleAddExpense() {
    if (!execution || !expAmount) return;
    const expense: Expense = {
      id: generateId(),
      date: new Date().toISOString(),
      amount: Number(expAmount) || 0,
      category: expCategory,
      description: expDesc.trim(),
    };
    saveExecution(recalcExecution({ ...execution, expenses: [...execution.expenses, expense] }));
    setExpAmount('');
    setExpDesc('');
  }

  function handleDeleteExpense(id: string) {
    if (!execution) return;
    saveExecution(recalcExecution({
      ...execution,
      expenses: execution.expenses.filter((e) => e.id !== id),
    }));
  }

  function handleAddLog() {
    if (!execution || !logMessage.trim()) return;
    const entry: LogEntry = {
      id: generateId(),
      date: new Date().toISOString(),
      message: logMessage.trim(),
    };
    saveExecution({ ...execution, logs: [...execution.logs, entry] });
    setLogMessage('');
  }

  function handleDeleteLog(id: string) {
    if (!execution) return;
    saveExecution({ ...execution, logs: execution.logs.filter((l) => l.id !== id) });
  }

  function handleDelete() {
    if (!execution) return;
    if (window.confirm('Excluir esta obra? Esta ação não pode ser desfeita.')) {
      deleteExecution(execution.id);
      navigate('/works');
    }
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
  const totalPayments = execution.payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = execution.expenses.reduce((s, e) => s + e.amount, 0);

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
            <DollarSign className="w-5 h-5 text-teal-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Contratado</p>
            <p className="text-sm font-bold text-slate-800">{formatMoney(recommendedPrice)}</p>
          </Card>
          <Card className="text-center">
            <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Recebido</p>
            <p className="text-sm font-bold text-slate-800">{formatMoney(totalPayments)}</p>
          </Card>
          <Card className="text-center">
            <Percent className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Progresso</p>
            <p className="text-sm font-bold text-slate-800">{execution.progressPercent}%</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800">Progresso</h2>
            <span className="text-xl font-extrabold text-teal-700">{execution.progressPercent}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${execution.progressPercent}%` }}
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                type="number"
                min="0"
                max="100"
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveProgress} className="shrink-0">
              <Save className="w-4 h-4 mr-1 inline" />
              Salvar
            </Button>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['stages', 'payments', 'expenses', 'log'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'stages' && 'Etapas'}
              {tab === 'payments' && `Pagamentos (${execution.payments.length})`}
              {tab === 'expenses' && `Despesas (${execution.expenses.length})`}
              {tab === 'log' && `Diário (${execution.logs.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'stages' && (
          <Card>
            <h3 className="font-bold text-slate-800 mb-3">Etapas da obra</h3>
            {execution.stages.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma etapa definida</p>
            ) : (
              <div className="space-y-2">
                {execution.stages.map((stage) => (
                  <div key={stage.id} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-slate-800">{stage.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STAGE_STATUS_COLORS[stage.status] || 'bg-slate-100 text-slate-600'}`}>
                        {STAGE_STATUS_LABELS[stage.status] || stage.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {(['pending', 'in_progress', 'completed', 'paused'] as StageStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStageToggle(stage.id, status)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            stage.status === status
                              ? 'bg-teal-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
                          }`}
                        >
                          {STAGE_STATUS_LABELS[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'payments' && (
          <>
            <Card>
              <h3 className="font-bold text-slate-800 mb-3">Adicionar pagamento</h3>
              <div className="space-y-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Valor (R$)"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
                <Select
                  value={payCategory}
                  onChange={(e) => setPayCategory(e.target.value)}
                  options={PAYMENT_CATEGORIES}
                />
                <Input
                  placeholder="Descrição"
                  value={payDesc}
                  onChange={(e) => setPayDesc(e.target.value)}
                />
                <Button fullWidth onClick={handleAddPayment} disabled={!payAmount}>
                  <Plus className="w-4 h-4 mr-1 inline" /> Adicionar
                </Button>
              </div>
            </Card>

            {execution.payments.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-4">Nenhum pagamento registrado</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {execution.payments.map((p) => (
                  <Card key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{formatMoney(p.amount)}</p>
                      <p className="text-xs text-slate-500">{p.description || 'Sem descrição'} · {formatDate(p.date)}</p>
                    </div>
                    <button onClick={() => handleDeletePayment(p.id)} className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </Card>
                ))}
                <Card className="bg-teal-50 border-teal-200">
                  <div className="flex justify-between font-bold text-teal-800">
                    <span>Total recebido</span>
                    <span>{formatMoney(totalPayments)}</span>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {activeTab === 'expenses' && (
          <>
            <Card>
              <h3 className="font-bold text-slate-800 mb-3">Adicionar despesa</h3>
              <div className="space-y-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Valor (R$)"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                />
                <Select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  options={EXPENSE_CATEGORIES}
                />
                <Input
                  placeholder="Descrição"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                />
                <Button fullWidth onClick={handleAddExpense} disabled={!expAmount}>
                  <Plus className="w-4 h-4 mr-1 inline" /> Adicionar
                </Button>
              </div>
            </Card>

            {execution.expenses.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma despesa registrada</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {execution.expenses.map((e) => (
                  <Card key={e.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{formatMoney(e.amount)}</p>
                      <p className="text-xs text-slate-500">
                        {EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label || e.category}
                        {e.description ? ` · ${e.description}` : ''} · {formatDate(e.date)}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteExpense(e.id)} className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </Card>
                ))}
                <Card className="bg-amber-50 border-amber-200">
                  <div className="flex justify-between font-bold text-amber-800">
                    <span>Total despesas</span>
                    <span>{formatMoney(totalExpenses)}</span>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {activeTab === 'log' && (
          <>
            <Card>
              <h3 className="font-bold text-slate-800 mb-3">Adicionar registro</h3>
              <div className="space-y-2">
                <Textarea
                  placeholder="Descreva o que aconteceu hoje..."
                  rows={2}
                  value={logMessage}
                  onChange={(e) => setLogMessage(e.target.value)}
                />
                <Button fullWidth onClick={handleAddLog} disabled={!logMessage.trim()}>
                  <Plus className="w-4 h-4 mr-1 inline" /> Adicionar registro
                </Button>
              </div>
            </Card>

            {execution.logs.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-4">Nenhum registro no diário</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {[...execution.logs].reverse().map((log) => (
                  <Card key={log.id} className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800">{log.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(log.date)}</p>
                    </div>
                    <button onClick={() => handleDeleteLog(log.id)} className="p-1 text-red-400 hover:text-red-600 ml-2">
                      <Trash2 size={14} />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {execution.projectedResult !== null && (
          <Card className={execution.projectedResult >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}>
            <h3 className="font-bold text-sm mb-2">Projeção financeira</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Recebido</span>
                <span className="font-semibold">{formatMoney(totalPayments)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Custo real</span>
                <span className="font-semibold">{formatMoney(execution.actualTotalCost)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                <span className="font-bold">Resultado</span>
                <span className={`font-bold ${execution.projectedResult >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {formatMoney(execution.projectedResult)}
                </span>
              </div>
              {execution.projectedMargin !== null && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Margem</span>
                  <span className="font-semibold">{execution.projectedMargin.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </Card>
        )}

        <Button fullWidth variant="danger" onClick={handleDelete}>
          <Trash2 size={18} className="mr-2 inline" />
          Excluir obra
        </Button>
      </div>
    </PageLayout>
  );
}

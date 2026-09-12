import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { findService } from '../../data/services';
import { calculateForService } from '../../lib/geometry';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

export default function BudgetStepPage() {
  const navigate = useNavigate();
  const { budgetId: id, step: stepParam } = useParams<{ budgetId: string; step: string }>();
  const step = Number(stepParam) || 1;

  const budgets = useBudgetStore((s) => s.budgets);
  const updateBudget = useBudgetStore((s) => s.updateBudget);

  const found = budgets.find((b) => b.id === id);
  const svc = found ? findService(found.serviceType) : undefined;

  if (!found || !svc) {
    return (
      <div className="pb-6">
        <PageHeader title="Orçamento não encontrado" backTo="/" />
        <p className="text-slate-500 text-center mt-8">Orçamento não encontrado.</p>
      </div>
    );
  }

  const budget = found;
  const service = svc;

  const totalSteps = service.steps.length;
  const currentStepFields = service.steps[step - 1];

  if (!currentStepFields) {
    navigate(`/budget/${id}/pricing`);
    return null;
  }

  function collectFields(): {
    measurements: Record<string, number | null>;
    quantities: Record<string, number>;
    options: Record<string, string>;
    description: string;
  } {
    const b = budget!;
    const measurements = { ...b.measurements };
    const quantities = { ...b.quantities };
    const options = { ...b.options };
    let description = b.description;

    currentStepFields.forEach((field) => {
      const el = document.querySelector<HTMLElement>(`[data-field="${field.id}"]`);
      if (!el) return;

      const raw = (el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;

      if (field.target === 'measurements') {
        measurements[field.id] = raw === '' ? null : parseFloat(raw);
      } else if (field.target === 'quantities') {
        quantities[field.id] = raw === '' ? 0 : parseFloat(raw);
      } else if (field.target === 'options') {
        options[field.id] = raw;
      } else if (field.target === 'description') {
        description = raw;
      }
    });

    return { measurements, quantities, options, description };
  }

  function handleContinue() {
    const collected = collectFields();
    const svc = service!;
    const calculated = calculateForService(collected.measurements, svc.geometry);

    const updated = {
      ...budget!,
      measurements: collected.measurements,
      quantities: collected.quantities,
      options: collected.options,
      description: collected.description,
      calculated,
      updatedAt: new Date().toISOString(),
    };

    updateBudget(updated);

    if (step < totalSteps) {
      navigate(`/budget/${id}/step/${step + 1}`);
    } else {
      navigate(`/budget/${id}/pricing`);
    }
  }

  function handleBack() {
    if (step > 1) {
      navigate(`/budget/${id}/step/${step - 1}`);
    } else {
      navigate(`/services/${service.category}`);
    }
  }

  function renderField(field: (typeof currentStepFields)[number]) {
    const currentValue =
      field.target === 'measurements'
        ? budget.measurements[field.id] ?? ''
        : field.target === 'quantities'
          ? budget.quantities[field.id] ?? ''
          : field.target === 'options'
            ? budget.options[field.id] ?? (field.type === 'yesno' ? '' : field.options?.[0] ?? '')
            : budget.description;

    switch (field.type) {
      case 'number':
        return (
          <Input
            key={field.id}
            data-field={field.id}
            data-target={field.target}
            type="number"
            label={field.label}
            step={field.step ?? '0.01'}
            defaultValue={currentValue}
            required={field.required}
            inputMode="decimal"
          />
        );
      case 'select':
        return (
          <Select
            key={field.id}
            data-field={field.id}
            data-target={field.target}
            label={field.label}
            options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
            defaultValue={currentValue}
            required={field.required}
          />
        );
      case 'yesno':
        return (
          <Select
            key={field.id}
            data-field={field.id}
            data-target={field.target}
            label={field.label}
            options={[
              { value: '', label: 'Selecione...' },
              { value: 'Sim', label: 'Sim' },
              { value: 'Não', label: 'Não' },
            ]}
            defaultValue={currentValue}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            key={field.id}
            data-field={field.id}
            data-target={field.target}
            label={field.label}
            defaultValue={currentValue}
            required={field.required}
          />
        );
      case 'text':
        return (
          <Input
            key={field.id}
            data-field={field.id}
            data-target={field.target}
            type="text"
            label={field.label}
            defaultValue={currentValue}
            required={field.required}
          />
        );
      default:
        return null;
    }
  }

  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <div className="pb-6">
      <PageHeader
        title={`${service.type.replace(/_/g, ' ')}`}
        backTo={step > 1 ? `/budget/${id}/step/${step - 1}` : `/services/${service.category}`}
        subtitle={`Passo ${step} de ${totalSteps}`}
      />

      <div className="mb-6 mt-2">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Progresso</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {currentStepFields.map((field) => renderField(field))}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" fullWidth onClick={handleBack}>
          <ArrowLeft size={18} className="mr-2 inline" />
          Voltar
        </Button>
        <Button fullWidth onClick={handleContinue}>
          Continuar
          <ArrowRight size={18} className="ml-2 inline" />
        </Button>
      </div>
    </div>
  );
}

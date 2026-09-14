import { useState } from 'react';
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
import type { ServiceField } from '../../lib/types';

function initFieldValues(
  fields: ServiceField[],
  budget: { measurements: Record<string, number | null>; quantities: Record<string, number>; options: Record<string, string>; description: string },
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    let raw: string | number | null | undefined;
    if (field.target === 'measurements') {
      raw = budget.measurements[field.id];
    } else if (field.target === 'quantities') {
      raw = budget.quantities[field.id];
    } else if (field.target === 'options') {
      raw = budget.options[field.id] ?? (field.type === 'yesno' ? '' : field.options?.[0] ?? '');
    } else {
      raw = budget.description;
    }
    values[field.id] = raw != null ? String(raw) : '';
  }
  return values;
}

export default function BudgetStepPage() {
  const navigate = useNavigate();
  const { budgetId: id, step: stepParam } = useParams<{ budgetId: string; step: string }>();
  const step = Number(stepParam) || 1;

  const budgets = useBudgetStore((s) => s.budgets);
  const updateBudget = useBudgetStore((s) => s.updateBudget);

  const found = budgets.find((b) => b.id === id);
  const svc = found ? findService(found.serviceType) : undefined;
  const budget = found;
  const service = svc;
  const totalSteps = service?.steps?.length ?? 1;
  const currentStepFields = service?.steps?.[step - 1];

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    () => (currentStepFields && budget ? initFieldValues(currentStepFields, budget) : {}),
  );

  if (!budget || !service) {
    return (
      <div className="pb-6">
        <PageHeader title="Orçamento não encontrado" backTo="/" />
        <p className="text-slate-500 text-center mt-8">Orçamento não encontrado.</p>
      </div>
    );
  }

  if (!currentStepFields) {
    navigate(`/budget/${id}/pricing`);
    return null;
  }

  function handleFieldChange(fieldId: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleContinue() {
    if (!budget || !currentStepFields || !service) return;
    const measurements = { ...budget.measurements };
    const quantities = { ...budget.quantities };
    const options = { ...budget.options };
    let description = budget.description;

    for (const field of currentStepFields) {
      const raw = fieldValues[field.id] ?? '';
      if (field.target === 'measurements') {
        measurements[field.id] = raw === '' ? null : parseFloat(raw);
      } else if (field.target === 'quantities') {
        quantities[field.id] = raw === '' ? 0 : parseFloat(raw);
      } else if (field.target === 'options') {
        options[field.id] = raw;
      } else if (field.target === 'description') {
        description = raw;
      }
    }

    const calculated = calculateForService(measurements, service.geometry);

    const updated = {
      ...budget,
      id: budget.id,
      measurements,
      quantities,
      options,
      description,
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
    if (!service) return;
    if (step > 1) {
      navigate(`/budget/${id}/step/${step - 1}`);
    } else {
      navigate(`/services/${service.category}`);
    }
  }

  function renderField(field: ServiceField) {
    const value = fieldValues[field.id] ?? '';

    switch (field.type) {
      case 'number':
        return (
          <Input
            key={field.id}
            type="number"
            label={field.label}
            step={field.step ?? '0.01'}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            inputMode="decimal"
          />
        );
      case 'select':
        return (
          <Select
            key={field.id}
            label={field.label}
            options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'yesno':
        return (
          <Select
            key={field.id}
            label={field.label}
            options={[
              { value: '', label: 'Selecione...' },
              { value: 'Sim', label: 'Sim' },
              { value: 'Não', label: 'Não' },
            ]}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            key={field.id}
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'text':
        return (
          <Input
            key={field.id}
            type="text"
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
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

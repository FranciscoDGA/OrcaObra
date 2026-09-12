import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { generateId } from '../../lib/id';
import { calculateForService } from '../../lib/geometry';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import type { Budget, Stage } from '../../lib/types';

const PROJECT_TYPES = ['Casa', 'Edícula', 'Reforma', 'Ampliação', 'Comércio', 'Outro'];

const STAGE_NAMES = [
  'Fundação',
  'Estrutura',
  'Alvenaria',
  'Cobertura',
  'Reboco',
  'Contrapiso',
  'Piso',
  'Portas e janelas',
];

function emptyFullBudget(): Budget {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    clientId: null,
    serviceType: 'Obra completa',
    serviceCategory: 'Construção',
    description: '',
    projectName: '',
    projectDescription: '',
    siteAddress: '',
    city: '',
    measurements: {},
    quantities: {},
    options: {},
    calculated: {},
    estimatedDays: null,
    daysCalculationMode: 'manual',
    productivityPerDay: null,
    teamDailyCost: null,
    laborCost: null,
    workerCost: null,
    helperCost: null,
    workerDailyRate: null,
    helperDailyRate: null,
    numberOfHelpers: null,
    transportCost: 0,
    foodCost: 0,
    fuelCost: 0,
    toolCost: 0,
    otherCost: 0,
    expenseCost: 0,
    riskReservePercent: null,
    riskReserve: 0,
    materialCost: 0,
    materialSellingPrice: 0,
    totalCost: 0,
    minimumMargin: null,
    recommendedMargin: null,
    fullMargin: null,
    minimumPrice: null,
    recommendedPrice: null,
    fullPrice: null,
    effectiveUnitPrice: null,
    pricingVersion: '1.0.0',
    selectedPriceType: null,
    customPrice: null,
    discount: 0,
    finalPrice: null,
    paymentMethod: 'À vista',
    paymentTerms: [],
    includedServices: [],
    excludedServices: [],
    agreedDays: null,
    validityDays: 7,
    expiresAt: null,
    approvalStatus: 'PENDING',
    approvedAt: null,
    rejectedAt: null,
    status: 'Rascunho',
    projectMode: 'full',
    stages: [],
    materials: [],
    createdAt: now,
    updatedAt: now,
  };
}

export default function FullProjectPage() {
  const navigate = useNavigate();
  const addBudget = useBudgetStore((s) => s.addBudget);

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('Casa');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  function toggleStage(stage: string) {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  }

  function handleSave() {
    const w = Math.max(0, parseFloat(width) || 0);
    const l = Math.max(0, parseFloat(length) || 0);
    const h = Math.max(0, parseFloat(height) || 0);

    const measurements = { width: w || null, length: l || null, height: h || null };
    const calculated = calculateForService(measurements, ['area', 'perimeter', 'wallArea']);

    const stages: Stage[] = selectedStages.map((stageName, i) => ({
      id: generateId(),
      name: stageName,
      enabled: true,
      order: i,
      estimatedDays: 0,
      laborCost: 0,
      expenseCost: 0,
      riskReserve: 0,
      minimumPrice: 0,
      recommendedPrice: 0,
      fullPrice: 0,
    }));

    const budget: Budget = {
      ...emptyFullBudget(),
      projectName: name,
      serviceType: 'Obra completa',
      serviceCategory: 'Construção',
      projectDescription: `${projectType} — ${w}m × ${l}m × ${h}m`,
      measurements,
      calculated,
      stages,
      description: notes,
    };

    const saved = addBudget(budget);
    navigate(`/budget/${saved.id}/pricing`);
  }

  return (
    <div className="pb-6">
      <PageHeader title="Obra completa" backTo="/new" subtitle="Monte uma casa ou projeto por etapas." />

      <div className="space-y-4 mt-2">
        <Card>
          <div className="space-y-4">
            <Input
              label="Nome da obra"
              placeholder="Ex.: Casa do João"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Select
              label="Tipo"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              options={PROJECT_TYPES.map((t) => ({ value: t, label: t }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Largura (m)"
                type="number"
                min="0"
                step="0.01"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <Input
                label="Comprimento (m)"
                type="number"
                min="0"
                step="0.01"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>

            <Input
              label="Altura das paredes (m)"
              type="number"
              min="0"
              step="0.01"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-900 mb-3">Etapas da obra</h3>
          <div className="space-y-2">
            {STAGE_NAMES.map((stage) => (
              <label
                key={stage}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedStages.includes(stage)
                    ? 'border-teal-300 bg-teal-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedStages.includes(stage)}
                  onChange={() => toggleStage(stage)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-slate-700">{stage}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <Textarea
            label="Observações"
            placeholder="Detalhes importantes sobre a obra..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Card>

        <Button fullWidth onClick={handleSave} disabled={!name.trim()}>
          <Building2 size={18} className="mr-2 inline" />
          Salvar e ir para precificação
        </Button>
      </div>
    </div>
  );
}

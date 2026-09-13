import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Trash2, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
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

const DEFAULT_STAGES = [
  'Fundação',
  'Estrutura',
  'Alvenaria',
  'Cobertura',
  'Reboco',
  'Contrapiso',
  'Piso',
  'Portas e janelas',
];

const EXTRA_SERVICES = [
  'Limpeza pós-obra',
  'Paisagismo',
  'Instalação elétrica',
  'Hidráulica',
  'Pintura',
  'Solveragem',
  'Marmoraria',
  'Vidraçaria',
  'Serralheria',
];

interface Room {
  id: string;
  name: string;
  width: string;
  length: string;
  height: string;
}

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
    paymentMethod: '',
    paymentTerms: [],
    includedServices: [],
    excludedServices: [],
    agreedDays: null,
    validityDays: 30,
    expiresAt: null,
    approvalStatus: 'pending',
    approvedAt: null,
    rejectedAt: null,
    status: 'draft',
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
  const settings = useSettingsStore((s) => s.settings);

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('Casa');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [floors, setFloors] = useState('1');
  const [notes, setNotes] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [stageDetails, setStageDetails] = useState<Record<string, { days: string; labor: string; expense: string }>>({});
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  function toggleStage(stage: string) {
    setSelectedStages((prev) => {
      const next = prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage];
      if (!prev.includes(stage) && !stageDetails[stage]) {
        setStageDetails((d) => ({ ...d, [stage]: { days: '', labor: '', expense: '' } }));
      }
      return next;
    });
  }

  function moveStage(stageName: string, direction: 'up' | 'down') {
    setSelectedStages((prev) => {
      const idx = prev.indexOf(stageName);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }

  function updateStageDetail(stage: string, field: 'days' | 'labor' | 'expense', value: string) {
    setStageDetails((d) => ({ ...d, [stage]: { ...d[stage], [field]: value } }));
  }

  function addRoom() {
    setRooms((prev) => [...prev, { id: generateId(), name: '', width: '', length: '', height: '' }]);
  }

  function updateRoom(id: string, field: keyof Room, value: string) {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function removeRoom(id: string) {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }

  function toggleExtra(service: string) {
    setSelectedExtras((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  function handleSave() {
    const w = Math.max(0, parseFloat(width) || 0);
    const l = Math.max(0, parseFloat(length) || 0);
    const h = Math.max(0, parseFloat(height) || 0);
    const numFloors = Math.max(1, parseInt(floors) || 1);

    const measurements = { width: w || null, length: l || null, height: h || null };
    const calculated = calculateForService(measurements, ['area', 'perimeter', 'wallArea']);

    const totalFloorArea = w * l * numFloors;
    const roomArea = rooms.reduce((sum, r) => {
      const rw = parseFloat(r.width) || 0;
      const rl = parseFloat(r.length) || 0;
      return sum + rw * rl;
    }, 0);

    const stages: Stage[] = selectedStages.map((stageName, i) => {
      const detail = stageDetails[stageName] || { days: '', labor: '', expense: '' };
      const days = parseInt(detail.days) || 0;
      const labor = parseFloat(detail.labor) || 0;
      const expense = parseFloat(detail.expense) || 0;
      const riskReserve = (labor + expense) * (settings.defaultRiskReservePercent / 100);

      return {
        id: generateId(),
        name: stageName,
        enabled: true,
        order: i,
        estimatedDays: days,
        laborCost: labor,
        expenseCost: expense,
        riskReserve,
        minimumPrice: 0,
        recommendedPrice: 0,
        fullPrice: 0,
      };
    });

    const budget: Budget = {
      ...emptyFullBudget(),
      projectName: name,
      serviceType: 'Obra completa',
      serviceCategory: 'Construção',
      projectDescription: `${projectType} — ${w}m × ${l}m × ${h}m — ${numFloors} pavimento(s)`,
      measurements: { ...measurements, floors: numFloors, totalFloorArea, roomArea: roomArea || null },
      quantities: {},
      options: { floors: numFloors.toString(), rooms: rooms.length.toString() },
      calculated,
      stages,
      includedServices: selectedExtras,
      description: notes,
    };

    const saved = addBudget(budget);
    navigate(`/budget/${saved.id}/pricing`);
  }

  const totalFloorArea = (parseFloat(width) || 0) * (parseFloat(length) || 0) * (parseInt(floors) || 1);

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

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Altura das paredes (m)"
                type="number"
                min="0"
                step="0.01"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <Input
                label="Pavimentos"
                type="number"
                min="1"
                step="1"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
              />
            </div>

            {totalFloorArea > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm">
                <p className="text-teal-700">
                  <strong>Área total:</strong> {totalFloorArea.toFixed(1)} m²
                  {rooms.length > 0 && <> · <strong>Cômodos:</strong> {rooms.length}</>}
                </p>
              </div>
            )}
          </div>
        </Card>

        {rooms.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Cômodos</h3>
              <button onClick={addRoom} className="text-sm text-teal-600 font-semibold">+ Adicionar</button>
            </div>
            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="bg-slate-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Nome (ex: Sala)"
                      value={room.name}
                      onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button onClick={() => removeRoom(room.id)} className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="L (m)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={room.width}
                      onChange={(e) => updateRoom(room.id, 'width', e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      placeholder="C (m)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={room.length}
                      onChange={(e) => updateRoom(room.id, 'length', e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      placeholder="H (m)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={room.height}
                      onChange={(e) => updateRoom(room.id, 'height', e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  {parseFloat(room.width) > 0 && parseFloat(room.length) > 0 && (
                    <p className="text-xs text-slate-500">
                      Área: {(parseFloat(room.width) * parseFloat(room.length)).toFixed(1)} m²
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">Etapas da obra</h3>
            <button onClick={addRoom} className="text-sm text-teal-600 font-semibold flex items-center gap-1">
              <Plus size={14} /> Cômodo
            </button>
          </div>
          <div className="space-y-2">
            {selectedStages.map((stage, idx) => {
              const isExpanded = expandedStage === stage;
              const detail = stageDetails[stage] || { days: '', labor: '', expense: '' };
              return (
                <div key={stage} className="border border-teal-200 bg-teal-50 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 p-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveStage(stage, 'up')}
                        disabled={idx === 0}
                        className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveStage(stage, 'down')}
                        disabled={idx === selectedStages.length - 1}
                        className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 flex-1">{stage}</span>
                    <button
                      onClick={() => setExpandedStage(isExpanded ? null : stage)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleStage(stage)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2 border-t border-teal-100">
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <Input
                          label="Dias"
                          type="number"
                          min="0"
                          value={detail.days}
                          onChange={(e) => updateStageDetail(stage, 'days', e.target.value)}
                        />
                        <Input
                          label="Mão de obra (R$)"
                          type="number"
                          min="0"
                          step="0.01"
                          value={detail.labor}
                          onChange={(e) => updateStageDetail(stage, 'labor', e.target.value)}
                        />
                        <Input
                          label="Despesas (R$)"
                          type="number"
                          min="0"
                          step="0.01"
                          value={detail.expense}
                          onChange={(e) => updateStageDetail(stage, 'expense', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {selectedStages.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Selecione as etapas abaixo
              </p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {DEFAULT_STAGES.filter((s) => !selectedStages.includes(s)).map((stage) => (
              <button
                key={stage}
                onClick={() => toggleStage(stage)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-colors"
              >
                + {stage}
              </button>
            ))}
          </div>
        </Card>

        {selectedExtras.length > 0 && (
          <Card>
            <h3 className="font-bold text-slate-900 mb-3">Serviços extras selecionados</h3>
            <div className="space-y-1">
              {selectedExtras.map((svc) => (
                <div key={svc} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-slate-700">{svc}</span>
                  <button onClick={() => toggleExtra(svc)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900">Serviços extras</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXTRA_SERVICES.filter((s) => !selectedExtras.includes(s)).map((svc) => (
              <button
                key={svc}
                onClick={() => toggleExtra(svc)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-colors"
              >
                + {svc}
              </button>
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

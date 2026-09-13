import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Trash2, User } from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useClientStore } from '../../store/useClientStore';
import { calculateForService } from '../../lib/geometry';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import ClientPickerModal from '../../components/ui/ClientPickerModal';

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

export default function EditBudgetPage() {
  const navigate = useNavigate();
  const { budgetId: id } = useParams<{ budgetId: string }>();
  const budgets = useBudgetStore((s) => s.budgets);
  const updateBudget = useBudgetStore((s) => s.updateBudget);
  const deleteBudget = useBudgetStore((s) => s.deleteBudget);

  const found = budgets.find((b) => b.id === id);

  const { clients, loadClients } = useClientStore();
  const [clientId, setClientId] = useState<string | null>(null);
  const [showClientPicker, setShowClientPicker] = useState(false);

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('Casa');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [projectName, setProjectName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (found) {
      setClientId(found.clientId || null);
      setName(found.projectName || '');
      setProjectName(found.projectName || '');
      setSiteAddress(found.siteAddress || '');
      setCity(found.city || '');
      setNotes(found.description || '');
      setWidth(found.measurements?.width?.toString() || '');
      setLength(found.measurements?.length?.toString() || '');
      setHeight(found.measurements?.height?.toString() || '');

      const descParts = (found.projectDescription || '').split(' — ');
      if (descParts.length > 0 && PROJECT_TYPES.includes(descParts[0])) {
        setProjectType(descParts[0]);
      }

      if (found.stages && found.stages.length > 0) {
        setSelectedStages(found.stages.map((s) => s.name));
      }
    }
  }, [found]);

  if (!found) {
    return (
      <div className="pb-6">
        <PageHeader title="Orçamento não encontrado" backTo="/" />
        <p className="text-slate-500 text-center mt-8">Orçamento não encontrado.</p>
      </div>
    );
  }

  const isFullProject = found.projectMode === 'full';

  function toggleStage(stage: string) {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  }

  function handleSave() {
    if (!found) return;
    const w = Math.max(0, parseFloat(width) || 0);
    const l = Math.max(0, parseFloat(length) || 0);
    const h = Math.max(0, parseFloat(height) || 0);

    const measurements = { width: w || null, length: l || null, height: h || null };
    const calculated = calculateForService(measurements, ['area', 'perimeter', 'wallArea']);

    const stages = isFullProject
      ? selectedStages.map((stageName, i) => {
          const existing = found!.stages?.find((s) => s.name === stageName);
          return {
            id: existing?.id || `stage_${Date.now()}_${i}`,
            name: stageName,
            enabled: true,
            order: i,
            estimatedDays: existing?.estimatedDays || 0,
            laborCost: existing?.laborCost || 0,
            expenseCost: existing?.expenseCost || 0,
            riskReserve: existing?.riskReserve || 0,
            minimumPrice: existing?.minimumPrice || 0,
            recommendedPrice: existing?.recommendedPrice || 0,
            fullPrice: existing?.fullPrice || 0,
          };
        })
      : found.stages;

    updateBudget({
      ...found,
      clientId,
      projectName: projectName || name,
      projectDescription: `${projectType} — ${w}m × ${l}m × ${h}m`,
      siteAddress,
      city,
      measurements,
      calculated,
      stages,
      description: notes,
      updatedAt: new Date().toISOString(),
    });
    navigate(-1);
  }

  function handleDelete() {
    if (!found) return;
    if (window.confirm('Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.')) {
      deleteBudget(found.id);
      navigate('/');
    }
  }

  function handleGoToPricing() {
    navigate(`/budget/${id}/pricing`);
  }

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <div className="pb-6">
      <PageHeader title="Editar orçamento" backTo="/" subtitle={found?.projectName || found?.serviceType || ''} />

      <div className="space-y-4 mt-2">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-800">Cliente</h2>
            </div>
            <button
              onClick={() => setShowClientPicker(true)}
              className="text-sm text-teal-600 font-semibold hover:text-teal-700"
            >
              {selectedClient ? 'Trocar' : 'Selecionar'}
            </button>
          </div>
          {selectedClient ? (
            <div className="bg-slate-50 rounded-xl p-3 mb-3">
              <p className="font-semibold text-slate-800">{selectedClient.name}</p>
              <div className="flex gap-3 text-sm text-slate-500 mt-0.5">
                {selectedClient.phone && <span>{selectedClient.phone}</span>}
                {selectedClient.city && <span>{selectedClient.city}</span>}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClientPicker(true)}
              className="w-full p-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors text-sm mb-3"
            >
              Toque para selecionar um cliente
            </button>
          )}
        </Card>

        <Card>
          <div className="space-y-3">
            <Input
              label="Nome do projeto"
              placeholder="Ex.: Casa do João"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Input
              label="Endereço"
              placeholder="Endereço da obra"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
            />
            <Input
              label="Cidade"
              placeholder="Ex.: São Paulo - SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </Card>

        {isFullProject && (
          <>
            <Card>
              <div className="space-y-3">
                <Select
                  label="Tipo de projeto"
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
          </>
        )}

        <Card>
          <Textarea
            label="Observações"
            placeholder="Detalhes importantes sobre a obra..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Card>

        <div className="space-y-3">
          <Button fullWidth onClick={handleSave}>
            <Save size={18} className="mr-2 inline" />
            Salvar alterações
          </Button>

          <Button fullWidth variant="secondary" onClick={handleGoToPricing}>
            Ir para precificação
          </Button>

          <Button fullWidth variant="danger" onClick={handleDelete}>
            <Trash2 size={18} className="mr-2 inline" />
            Excluir orçamento
          </Button>
        </div>
      </div>

      <ClientPickerModal
        isOpen={showClientPicker}
        onClose={() => setShowClientPicker(false)}
        onSelect={setClientId}
        selectedClientId={clientId}
      />
    </div>
  );
}

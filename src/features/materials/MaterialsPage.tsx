import { useEffect, useState } from 'react';
import { Package, Trash2, Plus } from 'lucide-react';
import { useMaterialStore } from '../../store/useMaterialStore';
import { MATERIAL_CATEGORIES, MATERIAL_UNITS } from '../../data/materials';
import { formatMoney } from '../../lib/money';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function MaterialsPage() {
  const { materials, loadMaterials, addMaterial, deleteMaterial } = useMaterialStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(MATERIAL_CATEGORIES[0]);
  const [unit, setUnit] = useState<string>(MATERIAL_UNITS[0]);
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  function handleAdd() {
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      return;
    }
    setNameError('');
    addMaterial({
      name: name.trim(),
      category,
      unit,
      unitPrice: Number(price) || 0,
      supplier: supplier.trim(),
      notes: '',
    });
    setName('');
    setPrice('');
    setSupplier('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <PageLayout>
      <PageHeader title="Materiais" subtitle={`${materials.length} material(is) cadastrado(s)`} />

      <div className="space-y-4">
        <Card>
          <h2 className="text-sm font-bold text-slate-800 mb-3">Adicionar material</h2>
          <div className="space-y-3" onKeyDown={handleKeyDown}>
            <Input
              label="Nome"
              placeholder="Ex: Cimento CP-II"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={MATERIAL_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
              <Select
                label="Unidade"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={MATERIAL_UNITS.map((u) => ({ value: u, label: u }))}
              />
            </div>
            <Input
              label="Preço unitário (R$)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Input
              label="Fornecedor"
              placeholder="Ex: Casa Construção"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
            <Button fullWidth onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2 inline" />
              Adicionar material
            </Button>
          </div>
        </Card>

        {materials.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum material cadastrado</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {materials.map((material) => (
              <Card key={material.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{material.name}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-slate-500 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">{material.category}</span>
                      <span>{material.unit}</span>
                      <span className="font-semibold text-teal-700">{formatMoney(material.unitPrice)}</span>
                    </div>
                    {material.supplier && (
                      <p className="text-xs text-slate-400 mt-1">{material.supplier}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMaterial(material.id)}
                    className="ml-3 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

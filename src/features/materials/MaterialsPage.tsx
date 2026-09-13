import { useEffect, useState } from 'react';
import { Package, Trash2, Plus, Pencil, Search } from 'lucide-react';
import { useMaterialStore } from '../../store/useMaterialStore';
import { MATERIAL_CATEGORIES, MATERIAL_UNITS } from '../../data/materials';
import { formatMoney } from '../../lib/money';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import type { Material } from '../../lib/types';

export default function MaterialsPage() {
  const { materials, loadMaterials, addMaterial, updateMaterial, deleteMaterial } = useMaterialStore();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(MATERIAL_CATEGORIES[0]);
  const [unit, setUnit] = useState<string>(MATERIAL_UNITS[0]);
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  function resetForm() {
    setName('');
    setCategory(MATERIAL_CATEGORIES[0]);
    setUnit(MATERIAL_UNITS[0]);
    setPrice('');
    setSupplier('');
    setNotes('');
    setEditingId(null);
    setNameError('');
  }

  function handleEdit(m: Material) {
    setEditingId(m.id);
    setName(m.name);
    setCategory(m.category);
    setUnit(m.unit);
    setPrice(m.unitPrice.toString());
    setSupplier(m.supplier);
    setNotes(m.notes || '');
  }

  function handleAdd() {
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      return;
    }
    setNameError('');

    if (editingId) {
      const existing = materials.find((m) => m.id === editingId);
      if (existing) {
        updateMaterial({
          ...existing,
          name: name.trim(),
          category,
          unit,
          unitPrice: Number(price) || 0,
          supplier: supplier.trim(),
          notes,
        });
      }
    } else {
      addMaterial({
        name: name.trim(),
        category,
        unit,
        unitPrice: Number(price) || 0,
        supplier: supplier.trim(),
        notes,
      });
    }
    resetForm();
  }

  function handleDelete(id: string) {
    if (window.confirm('Excluir este material?')) {
      deleteMaterial(id);
      if (editingId === id) resetForm();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    m.supplier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      <PageHeader title="Materiais" subtitle={`${materials.length} material(is) cadastrado(s)`} />

      <div className="space-y-4">
        <Card>
          <h2 className="text-sm font-bold text-slate-800 mb-3">
            {editingId ? 'Editar material' : 'Adicionar material'}
          </h2>
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
            <div className="flex gap-2">
              <Button fullWidth onClick={handleAdd}>
                {editingId ? (
                  <>Salvar alterações</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2 inline" />Adicionar</>
                )}
              </Button>
              {editingId && (
                <Button fullWidth variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Buscar material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {filtered.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {materials.length === 0 ? 'Nenhum material cadastrado' : 'Nenhum material encontrado'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((material) => (
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
                      <p className="text-xs text-slate-400 mt-1">Fornecedor: {material.supplier}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(material)}
                      className="p-2 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

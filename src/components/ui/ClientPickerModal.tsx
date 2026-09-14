import { useState, useEffect } from 'react';
import { X, UserPlus, Search, Users } from 'lucide-react';
import { useClientStore } from '../../store/useClientStore';
import Button from './Button';
import Input from './Input';

interface ClientPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (clientId: string | null) => void;
  selectedClientId?: string | null;
}

export default function ClientPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedClientId,
}: ClientPickerModalProps) {
  const { clients, loadClients, addClient } = useClientStore();
  const [search, setSearch] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadClients();
      setSearch('');
      setShowNewForm(false);
      setNewName('');
      setNewPhone('');
      setNewCity('');
    }
  }, [isOpen, loadClients]);

  if (!isOpen) return null;

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreateAndSelect() {
    if (!newName.trim()) return;
    const client = await addClient({ name: newName.trim(), phone: newPhone.trim(), city: newCity.trim() });
    onSelect(client.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">Selecionar cliente</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Buscar por nome, telefone ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 transition-colors text-sm font-semibold"
          >
            <UserPlus size={18} />
            {showNewForm ? 'Cancelar' : 'Novo cliente'}
          </button>

          {showNewForm && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 space-y-2">
              <Input
                placeholder="Nome *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                placeholder="Telefone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
              <Input
                placeholder="Cidade"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
              />
              <Button fullWidth onClick={handleCreateAndSelect} disabled={!newName.trim()}>
                Criar e selecionar
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">
                {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => { onSelect(null); onClose(); }}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  selectedClientId === null
                    ? 'border-teal-300 bg-teal-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-medium text-slate-500">Sem cliente vinculado</p>
              </button>
              {filtered.map((client) => (
                <button
                  key={client.id}
                  onClick={() => { onSelect(client.id); onClose(); }}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    selectedClientId === client.id
                      ? 'border-teal-300 bg-teal-50 ring-1 ring-teal-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-slate-800">{client.name}</p>
                  <div className="flex gap-3 text-sm text-slate-500 mt-0.5">
                    {client.phone && <span>{client.phone}</span>}
                    {client.city && <span>{client.city}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

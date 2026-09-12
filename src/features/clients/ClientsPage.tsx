import { useEffect, useState } from 'react';
import { Users, Trash2, UserPlus } from 'lucide-react';
import { useClientStore } from '../../store/useClientStore';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ClientsPage() {
  const { clients, loadClients, addClient, deleteClient } = useClientStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  function handleAdd() {
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      return;
    }
    setNameError('');
    addClient({ name: name.trim(), phone: phone.trim(), city: city.trim() });
    setName('');
    setPhone('');
    setCity('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <PageLayout>
      <PageHeader title="Clientes" subtitle={`${clients.length} cliente(s) cadastrado(s)`} />

      <div className="space-y-4">
        <Card>
          <h2 className="text-sm font-bold text-slate-800 mb-3">Adicionar cliente</h2>
          <div className="space-y-3" onKeyDown={handleKeyDown}>
            <Input
              label="Nome"
              placeholder="Nome do cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
            />
            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Cidade"
              placeholder="Ex: São Paulo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Button fullWidth onClick={handleAdd}>
              <UserPlus className="w-4 h-4 mr-2 inline" />
              Adicionar
            </Button>
          </div>
        </Card>

        {clients.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum cliente cadastrado</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {clients.map((client) => (
              <Card key={client.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{client.name}</p>
                  <div className="flex gap-3 text-sm text-slate-500">
                    {client.phone && <span>{client.phone}</span>}
                    {client.city && <span>{client.city}</span>}
                  </div>
                </div>
                <button
                  onClick={() => deleteClient(client.id)}
                  className="ml-3 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

import { create } from 'zustand';
import type { Client } from '../lib/types';
import { repository } from '../lib/repository';

interface ClientState {
  clients: Client[];
  loadClients: () => void;
  addClient: (data: { name: string; phone?: string; city?: string }) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
}

export const useClientStore = create<ClientState>()((set) => ({
  clients: repository.getClients(),

  loadClients: () => {
    set({ clients: repository.getClients() });
  },

  addClient: (data: { name: string; phone?: string; city?: string }) => {
    const client = repository.addClient(data);
    set((state) => ({ clients: [...state.clients, client] }));
    return client;
  },

  updateClient: (client: Client) => {
    repository.updateClient(client);
    set((state) => ({
      clients: state.clients.map((c) => (c.id === client.id ? client : c)),
    }));
  },

  deleteClient: (id: string) => {
    repository.deleteClient(id);
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    }));
  },
}));

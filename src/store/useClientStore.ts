import { create } from 'zustand';
import type { Client } from '../lib/types';
import { repositoryFacade } from '../lib/repository-facade';

interface ClientState {
  clients: Client[];
  loadFromRepository: () => Promise<void>;
  loadClients: () => Promise<void>;
  addClient: (data: { name: string; phone?: string; city?: string }) => Promise<Client>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  clearAll: () => void;
}

export const useClientStore = create<ClientState>()((set) => ({
  clients: [],

  loadFromRepository: async () => {
    const clients = await repositoryFacade.loadClients();
    set({ clients });
  },

  loadClients: async () => {
    const clients = await repositoryFacade.loadClients();
    set({ clients });
  },

  addClient: async (data: { name: string; phone?: string; city?: string }) => {
    const client = await repositoryFacade.addClient(data);
    set((state) => ({ clients: [...state.clients, client] }));
    return client;
  },

  updateClient: async (client: Client) => {
    await repositoryFacade.updateClient(client);
    set((state) => ({
      clients: state.clients.map((c) => (c.id === client.id ? client : c)),
    }));
  },

  deleteClient: async (id: string) => {
    await repositoryFacade.deleteClient(id);
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    }));
  },

  clearAll: () => {
    set({ clients: [] });
  },
}));

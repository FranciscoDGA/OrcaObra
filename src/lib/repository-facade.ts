import { isSupabaseConfigured } from './supabase';
import { repository } from './repository';
import { repositorySupabase } from './repository-supabase';
import { useAuthStore } from '../store/useAuthStore';
import type {
  User,
  Settings,
  Budget,
  Client,
  Material,
  Execution,
  Company,
} from './types';

function useCloud(): boolean {
  if (!isSupabaseConfigured()) return false;
  const { session, user } = useAuthStore.getState();
  return !!session && !!user?.companyId;
}

function getCompanyId(): string {
  const { user } = useAuthStore.getState();
  if (!user?.companyId) throw new Error('No company resolved');
  return user.companyId;
}

export const repositoryFacade = {
  // ── User ─────────────────────────────────────────────

  getUser(): User | null {
    return repository.getUser();
  },

  saveUser(user: User): void {
    repository.saveUser(user);
  },

  // ── Settings ─────────────────────────────────────────

  getSettings(): Settings {
    return repository.getSettings();
  },

  async loadSettings(): Promise<Settings> {
    if (useCloud()) {
      return repositorySupabase.getSettings();
    }
    return repository.getSettings();
  },

  async saveSettings(partial: Partial<Settings>): Promise<void> {
    if (useCloud()) {
      await repositorySupabase.saveSettings(partial);
    } else {
      repository.saveSettings(partial);
    }
  },

  // ── Companies ────────────────────────────────────────

  getCompanies(): Company[] {
    return repository.getCompanies();
  },

  getCompany(id: string): Company | null {
    return repository.getCompany(id);
  },

  async loadCompany(id: string): Promise<Company | null> {
    if (useCloud()) {
      return repositorySupabase.getCompany(id);
    }
    return repository.getCompany(id);
  },

  addCompany(data: { name: string }): Company {
    return repository.addCompany(data);
  },

  // ── Budgets ──────────────────────────────────────────

  getBudgets(): Budget[] {
    return repository.getBudgets();
  },

  async loadBudgets(): Promise<Budget[]> {
    if (useCloud()) {
      return repositorySupabase.getBudgets(getCompanyId());
    }
    return repository.getBudgets();
  },

  getBudget(id: string): Budget | null {
    return repository.getBudget(id);
  },

  async addBudget(budget: Budget): Promise<Budget> {
    if (useCloud()) {
      return repositorySupabase.addBudget(budget, getCompanyId());
    }
    return repository.addBudget(budget);
  },

  async updateBudget(budget: Budget): Promise<void> {
    if (useCloud()) {
      await repositorySupabase.updateBudget(budget);
    } else {
      repository.updateBudget(budget);
    }
  },

  async deleteBudget(id: string): Promise<void> {
    if (useCloud()) {
      await repositorySupabase.deleteBudget(id);
    } else {
      repository.deleteBudget(id);
    }
  },

  // ── Clients ──────────────────────────────────────────

  getClients(): Client[] {
    return repository.getClients();
  },

  async loadClients(): Promise<Client[]> {
    if (useCloud()) {
      return repositorySupabase.getClients(getCompanyId());
    }
    return repository.getClients();
  },

  async addClient(data: {
    name: string;
    phone?: string;
    city?: string;
    address?: string;
    notes?: string;
  }): Promise<Client> {
    if (useCloud()) {
      const companyId = getCompanyId();
      return repositorySupabase.addClient(
        { name: data.name, phone: data.phone ?? '', address: data.address ?? '', city: data.city ?? '', notes: data.notes ?? '' },
        companyId,
      );
    }
    return repository.addClient(data);
  },

  async updateClient(client: Client): Promise<void> {
    if (useCloud()) {
      await repositorySupabase.updateClient(client);
    } else {
      repository.updateClient(client);
    }
  },

  async deleteClient(id: string): Promise<void> {
    if (useCloud()) {
      await repositorySupabase.deleteClient(id);
    } else {
      repository.deleteClient(id);
    }
  },

  // ── Materials ────────────────────────────────────────

  getMaterials(): Material[] {
    return repository.getMaterials();
  },

  async loadMaterials(): Promise<Material[]> {
    if (useCloud()) {
      return repositorySupabase.getMaterials(getCompanyId());
    }
    return repository.getMaterials();
  },

  async addMaterial(data: Omit<Material, 'id' | 'lastUpdated'>): Promise<Material> {
    if (useCloud()) {
      return repositorySupabase.addMaterial(data, getCompanyId());
    }
    return repository.addMaterial(data);
  },

  async updateMaterial(material: Material): Promise<void> {
    if (useCloud()) {
      await repositorySupabase.updateMaterial(material);
    } else {
      repository.updateMaterial(material);
    }
  },

  async deleteMaterial(id: string): Promise<void> {
    if (useCloud()) {
      await repositorySupabase.deleteMaterial(id);
    } else {
      repository.deleteMaterial(id);
    }
  },

  // ── Executions ───────────────────────────────────────

  getExecutions(): Execution[] {
    return repository.getExecutions();
  },

  async loadExecutions(): Promise<Execution[]> {
    if (useCloud()) {
      return repositorySupabase.getExecutions(getCompanyId());
    }
    return repository.getExecutions();
  },

  async startExecution(budget: Budget): Promise<Execution> {
    if (useCloud()) {
      return repositorySupabase.startExecution(budget, getCompanyId());
    }
    return repository.startExecution(budget);
  },

  async saveExecution(execution: Execution): Promise<void> {
    if (useCloud()) {
      await repositorySupabase.saveExecution(execution);
    } else {
      repository.saveExecution(execution);
    }
  },

  async deleteExecution(id: string): Promise<void> {
    if (useCloud()) {
      await repositorySupabase.deleteExecution(id);
    } else {
      repository.deleteExecution(id);
    }
  },

  // ── Company ownership migration (local only) ─────────

  migrateCompanyOwnership(): void {
    repository.migrateCompanyOwnership();
  },
};

import { describe, it, expect, vi, beforeEach } from 'vitest';

const store: Record<string, string> = {};

vi.mock('../lib/storage', () => ({
  read: vi.fn((name: string, fallback: unknown) => {
    const raw = store[name];
    if (raw === undefined) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }),
  write: vi.fn((name: string, value: unknown) => {
    store[name] = JSON.stringify(value);
  }),
  remove: vi.fn((name: string) => {
    delete store[name];
  }),
}));

vi.mock('../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: vi.fn(() => false),
}));

import { repositoryFacade } from '../lib/repository-facade';
import { repository } from '../lib/repository';
import { useBudgetStore } from '../store/useBudgetStore';
import { useClientStore } from '../store/useClientStore';
import { useMaterialStore } from '../store/useMaterialStore';
import { useExecutionStore } from '../store/useExecutionStore';
import type { Budget } from '../lib/types';

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  useBudgetStore.setState({ budgets: [], editingBudgetId: null, currentStep: 0, selectedCategory: null });
  useClientStore.setState({ clients: [] });
  useMaterialStore.setState({ materials: [] });
  useExecutionStore.setState({ executions: [] });
});

function makeBudget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: 'b1',
    clientId: null,
    serviceType: 'Pintura',
    serviceCategory: 'Acabamento',
    description: '',
    projectName: 'Projeto Teste',
    projectDescription: '',
    siteAddress: '',
    city: '',
    measurements: {},
    quantities: {},
    options: {},
    calculated: { floorArea: null, perimeter: null, wallArea: null, volume: null, linearMeters: null },
    estimatedDays: null,
    daysCalculationMode: 'fixed',
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
    pricingVersion: 'v1',
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
    projectMode: 'simple',
    stages: [],
    materials: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('Repository Facade — local mode', () => {
  it('getUser returns null when empty', () => {
    expect(repositoryFacade.getUser()).toBeNull();
  });

  it('saveUser and getUser roundtrip', () => {
    repositoryFacade.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    expect(repositoryFacade.getUser()!.name).toBe('João');
  });

  it('getSettings returns defaults', () => {
    expect(repositoryFacade.getSettings().fullMargin).toBe(30);
  });

  it('async loadSettings returns defaults', async () => {
    expect((await repositoryFacade.loadSettings()).fullMargin).toBe(30);
  });

  it('async saveSettings persists', async () => {
    await repositoryFacade.saveSettings({ fullMargin: 50 });
    expect((await repositoryFacade.loadSettings()).fullMargin).toBe(50);
  });

  it('async loadBudgets returns empty', async () => {
    expect(await repositoryFacade.loadBudgets()).toEqual([]);
  });

  it('async addBudget creates', async () => {
    const b = await repositoryFacade.addBudget(makeBudget({ id: 'n1' }));
    expect(b.id).toBe('n1');
  });

  it('async updateBudget updates', async () => {
    await repositoryFacade.addBudget(makeBudget({ id: 'b1', projectName: 'A' }));
    await repositoryFacade.updateBudget(makeBudget({ id: 'b1', projectName: 'B' }));
    expect(repositoryFacade.getBudget('b1')!.projectName).toBe('B');
  });

  it('async deleteBudget removes', async () => {
    await repositoryFacade.addBudget(makeBudget({ id: 'b1' }));
    await repositoryFacade.deleteBudget('b1');
    expect(repositoryFacade.getBudgets()).toHaveLength(0);
  });

  it('async loadClients returns empty', async () => {
    expect(await repositoryFacade.loadClients()).toEqual([]);
  });

  it('async addClient creates', async () => {
    const c = await repositoryFacade.addClient({ name: 'Maria' });
    expect(c.name).toBe('Maria');
  });

  it('async deleteClient removes', async () => {
    const c = await repositoryFacade.addClient({ name: 'M' });
    await repositoryFacade.deleteClient(c.id);
    expect(repositoryFacade.getClients()).toHaveLength(0);
  });

  it('async loadMaterials returns empty', async () => {
    expect(await repositoryFacade.loadMaterials()).toEqual([]);
  });

  it('async addMaterial creates', async () => {
    const m = await repositoryFacade.addMaterial({ name: 'Cimento', category: 'Mat', unit: 'kg', unitPrice: 30, supplier: 'V', notes: '' });
    expect(m.name).toBe('Cimento');
  });

  it('async loadExecutions returns empty', async () => {
    expect(await repositoryFacade.loadExecutions()).toEqual([]);
  });
});

describe('Store — empty by default', () => {
  it('budget store starts empty', () => {
    expect(useBudgetStore.getState().budgets).toEqual([]);
  });

  it('client store starts empty', () => {
    expect(useClientStore.getState().clients).toEqual([]);
  });

  it('material store starts empty', () => {
    expect(useMaterialStore.getState().materials).toEqual([]);
  });

  it('execution store starts empty', () => {
    expect(useExecutionStore.getState().executions).toEqual([]);
  });
});

describe('Store loadFromRepository — local mode', () => {
  it('budget store loads from localStorage', async () => {
    repository.saveUser({ id: 'u1', name: 'J', profession: 'P', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget({ id: 'load-1' }));

    await useBudgetStore.getState().loadFromRepository();
    expect(useBudgetStore.getState().budgets).toHaveLength(1);
    expect(useBudgetStore.getState().budgets[0].id).toBe('load-1');
  });

  it('client store loads from localStorage', async () => {
    repository.saveUser({ id: 'u1', name: 'J', profession: 'P', createdAt: '2026-01-01' });
    repository.addClient({ name: 'Load Client' });

    await useClientStore.getState().loadFromRepository();
    expect(useClientStore.getState().clients).toHaveLength(1);
    expect(useClientStore.getState().clients[0].name).toBe('Load Client');
  });

  it('material store loads from localStorage', async () => {
    repository.saveUser({ id: 'u1', name: 'J', profession: 'P', createdAt: '2026-01-01' });
    repository.addMaterial({ name: 'Areia', category: 'Mat', unit: 'm3', unitPrice: 50, supplier: 'L', notes: '' });

    await useMaterialStore.getState().loadFromRepository();
    expect(useMaterialStore.getState().materials).toHaveLength(1);
    expect(useMaterialStore.getState().materials[0].name).toBe('Areia');
  });
});

describe('Store clearAll', () => {
  it('budget store clearAll empties state', async () => {
    repository.saveUser({ id: 'u1', name: 'J', profession: 'P', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget());
    await useBudgetStore.getState().loadFromRepository();
    expect(useBudgetStore.getState().budgets).toHaveLength(1);

    useBudgetStore.getState().clearAll();
    expect(useBudgetStore.getState().budgets).toEqual([]);
  });

  it('client store clearAll empties state', async () => {
    repository.saveUser({ id: 'u1', name: 'J', profession: 'P', createdAt: '2026-01-01' });
    repository.addClient({ name: 'M' });
    await useClientStore.getState().loadFromRepository();
    expect(useClientStore.getState().clients).toHaveLength(1);

    useClientStore.getState().clearAll();
    expect(useClientStore.getState().clients).toEqual([]);
  });

  it('material store clearAll empties state', async () => {
    repository.saveUser({ id: 'u1', name: 'J', profession: 'P', createdAt: '2026-01-01' });
    repository.addMaterial({ name: 'C', category: '', unit: '', unitPrice: 0, supplier: '', notes: '' });
    await useMaterialStore.getState().loadFromRepository();
    expect(useMaterialStore.getState().materials).toHaveLength(1);

    useMaterialStore.getState().clearAll();
    expect(useMaterialStore.getState().materials).toEqual([]);
  });
});

describe('Store CRUD — local mode', () => {
  it('budget: add + update + delete', async () => {
    repository.saveUser({ id: 'u1', name: 'J', profession: 'P', createdAt: '2026-01-01' });

    const saved = await useBudgetStore.getState().addBudget(makeBudget({ id: 'crud-1', projectName: 'Orig' }));
    expect(useBudgetStore.getState().budgets).toHaveLength(1);
    expect(saved.id).toBe('crud-1');

    await useBudgetStore.getState().updateBudget(makeBudget({ id: 'crud-1', projectName: 'Upd' }));
    expect(useBudgetStore.getState().budgets[0].projectName).toBe('Upd');

    await useBudgetStore.getState().deleteBudget('crud-1');
    expect(useBudgetStore.getState().budgets).toHaveLength(0);
  });

  it('client: add + delete', async () => {
    repository.saveUser({ id: 'u1', name: 'J', profession: 'P', createdAt: '2026-01-01' });

    const c = await useClientStore.getState().addClient({ name: 'Novo' });
    expect(useClientStore.getState().clients).toHaveLength(1);

    await useClientStore.getState().deleteClient(c.id);
    expect(useClientStore.getState().clients).toHaveLength(0);
  });

  it('material: add + update + delete', async () => {
    repository.saveUser({ id: 'u1', name: 'J', profession: 'P', createdAt: '2026-01-01' });

    const m = await useMaterialStore.getState().addMaterial({ name: 'Tijolo', category: 'Mat', unit: 'un', unitPrice: 1.5, supplier: 'L', notes: '' });
    expect(useMaterialStore.getState().materials).toHaveLength(1);

    await useMaterialStore.getState().updateMaterial({ ...m, unitPrice: 2 });
    expect(useMaterialStore.getState().materials[0].unitPrice).toBe(2);

    await useMaterialStore.getState().deleteMaterial(m.id);
    expect(useMaterialStore.getState().materials).toHaveLength(0);
  });
});

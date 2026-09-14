import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

const lsStore: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  Object.keys(lsStore).forEach((k) => delete lsStore[k]);
  clearMigrationStatus();
});

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => lsStore[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { lsStore[key] = value; }),
    removeItem: vi.fn((key: string) => { delete lsStore[key]; }),
    clear: vi.fn(() => { Object.keys(lsStore).forEach((k) => delete lsStore[k]); }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

import {
  createSnapshot,
  validateSnapshot,
  hasLocalData,
  getMigrationStatus,
  clearMigrationStatus,
} from '../lib/migration-service';
import { repository } from '../lib/repository';
import type { Budget, Client, Material, Execution } from '../lib/types';

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

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'c1',
    name: 'João Silva',
    phone: '11999999999',
    address: 'Rua A',
    city: 'São Paulo',
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeMaterial(overrides: Partial<Material> = {}): Material {
  return {
    id: 'm1',
    name: 'Cimento CP-II',
    category: 'Materiais',
    unit: 'kg',
    unitPrice: 30,
    supplier: 'Votoran',
    lastUpdated: '2026-01-01T00:00:00.000Z',
    notes: '',
    ...overrides,
  };
}

function makeExecution(overrides: Partial<Execution> = {}): Execution {
  return {
    id: 'e1',
    projectId: 'b1',
    status: 'in_progress',
    startDate: '2026-01-01T00:00:00.000Z',
    plannedEndDate: null,
    actualEndDate: null,
    progressPercent: 0,
    plannedLaborCost: 0,
    plannedMaterialCost: 0,
    plannedFreightCost: 0,
    plannedOtherExpense: 0,
    plannedRiskReserve: 0,
    actualLaborCost: 0,
    actualMaterialCost: 0,
    actualFreightCost: 0,
    actualOtherExpense: 0,
    actualTotalCost: 0,
    projectedFinalCost: 0,
    projectedResult: null,
    projectedMargin: null,
    stages: [],
    payments: [],
    expenses: [],
    logs: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('createSnapshot', () => {
  it('returns empty snapshot when localStorage is empty', () => {
    const snapshot = createSnapshot();
    expect(snapshot.user).toBeNull();
    expect(snapshot.companies).toEqual([]);
    expect(snapshot.clients).toEqual([]);
    expect(snapshot.materials).toEqual([]);
    expect(snapshot.budgets).toEqual([]);
    expect(snapshot.executions).toEqual([]);
  });

  it('collects all local data', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addCompany({ name: 'ABC' });
    repository.addClient({ name: 'Maria' });
    repository.addMaterial({ name: 'Cimento', category: 'Mat', unit: 'kg', unitPrice: 30, supplier: 'Votoran', notes: '' });
    repository.addBudget(makeBudget({ id: 'b1' }));

    const snapshot = createSnapshot();
    expect(snapshot.user!.name).toBe('João');
    expect(snapshot.companies).toHaveLength(1);
    expect(snapshot.clients).toHaveLength(1);
    expect(snapshot.materials).toHaveLength(1);
    expect(snapshot.budgets).toHaveLength(1);
  });

  it('preserves all budget fields in snapshot', () => {
    repository.addBudget(makeBudget({
      id: 'budget-123',
      projectName: 'Casa São Paulo',
      laborCost: 5000,
      materialCost: 3000,
      fullPrice: 12000,
      stages: [{ id: 's1', name: 'Etapa 1', enabled: true, order: 1, estimatedDays: 5, laborCost: 1000, expenseCost: 0, riskReserve: 0, minimumPrice: 0, recommendedPrice: 0, fullPrice: 1000 }],
    }));

    const snapshot = createSnapshot();
    const budget = snapshot.budgets[0];
    expect(budget.id).toBe('budget-123');
    expect(budget.projectName).toBe('Casa São Paulo');
    expect(budget.laborCost).toBe(5000);
    expect(budget.stages).toHaveLength(1);
  });
});

describe('validateSnapshot', () => {
  it('valid snapshot passes', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    const snapshot = createSnapshot();
    const result = validateSnapshot(snapshot);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects snapshot without user', () => {
    const snapshot = createSnapshot();
    const result = validateSnapshot(snapshot);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('No local user found');
  });

  it('rejects user without name', () => {
    repository.saveUser({ id: 'u1', name: '', profession: 'Pedreiro', createdAt: '2026-01-01' });
    const snapshot = createSnapshot();
    const result = validateSnapshot(snapshot);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('User has no name');
  });

  it('validates client has id and name', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    const snapshot = createSnapshot();
    snapshot.clients = [{ ...makeClient(), id: '' }];
    const result = validateSnapshot(snapshot);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Client missing id');
  });

  it('validates budget has id', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    const snapshot = createSnapshot();
    snapshot.budgets = [{ ...makeBudget(), id: '' }];
    const result = validateSnapshot(snapshot);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Budget missing id');
  });

  it('validates execution has id and projectId', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    const snapshot = createSnapshot();
    snapshot.executions = [{ ...makeExecution(), id: '' }];
    const result = validateSnapshot(snapshot);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Execution missing id');
  });

  it('validates material has id and name', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    const snapshot = createSnapshot();
    snapshot.materials = [{ ...makeMaterial(), id: '' }];
    const result = validateSnapshot(snapshot);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Material missing id');
  });
});

describe('hasLocalData', () => {
  it('returns false when localStorage is empty', () => {
    expect(hasLocalData()).toBe(false);
  });

  it('returns true when clients exist', () => {
    repository.addClient({ name: 'Maria' });
    expect(hasLocalData()).toBe(true);
  });

  it('returns true when materials exist', () => {
    repository.addMaterial({ name: 'Cimento', category: 'Mat', unit: 'kg', unitPrice: 30, supplier: 'Votoran', notes: '' });
    expect(hasLocalData()).toBe(true);
  });

  it('returns true when budgets exist', () => {
    repository.addBudget(makeBudget());
    expect(hasLocalData()).toBe(true);
  });

  it('returns true when executions exist', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget({ id: 'b1' }));
    const budget = repository.getBudget('b1')!;
    repository.startExecution(budget);
    expect(hasLocalData()).toBe(true);
  });

  it('returns false with only user and settings', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.saveSettings({ workerDailyRate: 300 });
    expect(hasLocalData()).toBe(false);
  });
});

describe('Migration status persistence', () => {
  it('getMigrationStatus returns not_started by default', () => {
    const status = getMigrationStatus();
    expect(status.status).toBe('not_started');
    expect(status.completed).toBe(0);
    expect(status.total).toBe(0);
    expect(status.error).toBeNull();
  });

  it('clearMigrationStatus removes stored status', () => {
    const status = getMigrationStatus();
    status.status = 'completed';
    localStorage.setItem('orcaobra.v1.migrationStatus', JSON.stringify(status));

    clearMigrationStatus();
    const fresh = getMigrationStatus();
    expect(fresh.status).toBe('not_started');
  });
});

describe('Budget-client reference integrity', () => {
  it('budget with clientId referencing existing client is valid', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    const client = repository.addClient({ name: 'Maria' });
    repository.addBudget(makeBudget({ clientId: client.id }));

    const snapshot = createSnapshot();
    expect(snapshot.budgets[0].clientId).toBe(client.id);
    expect(snapshot.clients.find((c) => c.id === client.id)).toBeTruthy();
  });

  it('budget with null clientId is valid', () => {
    repository.addBudget(makeBudget({ clientId: null }));
    const snapshot = createSnapshot();
    expect(snapshot.budgets[0].clientId).toBeNull();
  });
});

describe('Execution-budget reference integrity', () => {
  it('execution references budget via projectId', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget({ id: 'budget-abc' }));
    const budget = repository.getBudget('budget-abc')!;
    repository.startExecution(budget);

    const snapshot = createSnapshot();
    expect(snapshot.executions[0].projectId).toBe('budget-abc');
    expect(snapshot.budgets.find((b) => b.id === 'budget-abc')).toBeTruthy();
  });
});

describe('Empty data migration', () => {
  it('validates empty data snapshot correctly', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    const snapshot = createSnapshot();
    const result = validateSnapshot(snapshot);
    expect(result.valid).toBe(true);
    expect(snapshot.clients).toHaveLength(0);
    expect(snapshot.materials).toHaveLength(0);
    expect(snapshot.budgets).toHaveLength(0);
    expect(snapshot.executions).toHaveLength(0);
  });
});

describe('Legacy companyId handling', () => {
  it('entities without companyId have null companyId', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget({ companyId: undefined }));
    repository.addClient({ name: 'Maria' });
    repository.addMaterial({ name: 'Cimento', category: 'Mat', unit: 'kg', unitPrice: 30, supplier: 'Votoran', notes: '' });

    const snapshot = createSnapshot();
    expect(snapshot.budgets[0].companyId).toBeNull();
    expect(snapshot.clients[0].companyId).toBeNull();
    expect(snapshot.materials[0].companyId).toBeNull();
  });

  it('entities with explicit companyId preserve it', () => {
    const c = repository.addCompany({ name: 'ABC' });
    repository.saveUser({ id: 'u1', companyId: c.id, name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget({ companyId: c.id }));

    const snapshot = createSnapshot();
    expect(snapshot.budgets[0].companyId).toBe(c.id);
  });
});

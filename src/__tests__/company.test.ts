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

import { repository } from '../lib/repository';
import type { Budget } from '../lib/types';

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
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

describe('Company', () => {
  it('getCompanies returns empty array when empty', () => {
    expect(repository.getCompanies()).toEqual([]);
  });

  it('addCompany creates and returns company', () => {
    const c = repository.addCompany({ name: 'Construtora ABC' });
    expect(c.name).toBe('Construtora ABC');
    expect(c.id).toBeTruthy();
    expect(c.status).toBe('active');
    expect(c.createdAt).toBeTruthy();
  });

  it('getCompany returns company by id', () => {
    const c = repository.addCompany({ name: 'Construtora ABC' });
    expect(repository.getCompany(c.id)!.name).toBe('Construtora ABC');
  });

  it('getCompany returns null for unknown id', () => {
    expect(repository.getCompany('unknown')).toBeNull();
  });

  it('updateCompany updates existing company', () => {
    const c = repository.addCompany({ name: 'Before' });
    repository.updateCompany({ ...c, name: 'After' });
    expect(repository.getCompany(c.id)!.name).toBe('After');
  });

  it('updateCompany warns for non-existent id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    repository.updateCompany({ id: 'x', name: 'X', status: 'active', createdAt: '', updatedAt: '' });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('deleteCompany removes company', () => {
    const c = repository.addCompany({ name: 'ABC' });
    repository.deleteCompany(c.id);
    expect(repository.getCompanies()).toEqual([]);
  });
});

describe('User with companyId', () => {
  it('user without companyId is valid (legacy compatibility)', () => {
    const user = { id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' };
    repository.saveUser(user);
    const loaded = repository.getUser()!;
    expect(loaded.companyId).toBeUndefined();
    expect(loaded.name).toBe('João');
  });

  it('user with companyId is valid', () => {
    const c = repository.addCompany({ name: 'ABC' });
    const user = { id: 'u1', companyId: c.id, name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' };
    repository.saveUser(user);
    const loaded = repository.getUser()!;
    expect(loaded.companyId).toBe(c.id);
  });
});

describe('Company ownership migration', () => {
  it('creates default company when user exists but no companies', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });

    repository.migrateCompanyOwnership();

    const companies = repository.getCompanies();
    expect(companies).toHaveLength(1);
    expect(companies[0].name).toBe('João');
    expect(companies[0].status).toBe('active');

    const user = repository.getUser()!;
    expect(user.companyId).toBe(companies[0].id);
  });

  it('does not create company when companies already exist', () => {
    repository.addCompany({ name: 'Existing' });
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });

    repository.migrateCompanyOwnership();

    expect(repository.getCompanies()).toHaveLength(1);
    expect(repository.getCompanies()[0].name).toBe('Existing');
  });

  it('does not create company when no user exists', () => {
    repository.migrateCompanyOwnership();
    expect(repository.getCompanies()).toHaveLength(0);
  });

  it('is idempotent', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });

    repository.migrateCompanyOwnership();
    const afterFirst = repository.getCompanies().length;

    repository.migrateCompanyOwnership();
    const afterSecond = repository.getCompanies().length;

    expect(afterSecond).toBe(afterFirst);
  });
});

describe('Ownership — entities with companyId', () => {
  it('budget created via addBudget has companyId: null when user has no company', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget());
    const b = repository.getBudgets()[0];
    expect(b.companyId).toBeNull();
  });

  it('budget created via addBudget gets companyId from current user', () => {
    const c = repository.addCompany({ name: 'ABC' });
    repository.saveUser({ id: 'u1', companyId: c.id, name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget());
    const b = repository.getBudgets()[0];
    expect(b.companyId).toBe(c.id);
  });

  it('budget with explicit companyId is preserved', () => {
    const c1 = repository.addCompany({ name: 'ABC' });
    const c2 = repository.addCompany({ name: 'XYZ' });
    repository.saveUser({ id: 'u1', companyId: c1.id, name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget({ companyId: c2.id }));
    const b = repository.getBudgets()[0];
    expect(b.companyId).toBe(c2.id);
  });

  it('client created via addClient gets companyId from current user', () => {
    const c = repository.addCompany({ name: 'ABC' });
    repository.saveUser({ id: 'u1', companyId: c.id, name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addClient({ name: 'Maria' });
    const cl = repository.getClients()[0];
    expect(cl.companyId).toBe(c.id);
  });

  it('client created via addClient has companyId: null when user has no company', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addClient({ name: 'Maria' });
    const cl = repository.getClients()[0];
    expect(cl.companyId).toBeNull();
  });

  it('material created via addMaterial gets companyId from current user', () => {
    const c = repository.addCompany({ name: 'ABC' });
    repository.saveUser({ id: 'u1', companyId: c.id, name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addMaterial({ name: 'Cimento', category: 'Materiais', unit: 'kg', unitPrice: 30, supplier: 'Votoran', notes: '' });
    const m = repository.getMaterials()[0];
    expect(m.companyId).toBe(c.id);
  });

  it('material created via addMaterial has companyId: null when user has no company', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addMaterial({ name: 'Cimento', category: 'Materiais', unit: 'kg', unitPrice: 30, supplier: 'Votoran', notes: '' });
    const m = repository.getMaterials()[0];
    expect(m.companyId).toBeNull();
  });

  it('execution created via startExecution gets companyId from budget', () => {
    const c = repository.addCompany({ name: 'ABC' });
    repository.saveUser({ id: 'u1', companyId: c.id, name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget({ id: 'b1' }));
    const budget = repository.getBudget('b1')!;
    repository.startExecution(budget);
    const ex = repository.getExecutions()[0];
    expect(ex.companyId).toBe(c.id);
  });

  it('execution created via startExecution has companyId: null when user has no company', () => {
    repository.saveUser({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    repository.addBudget(makeBudget({ id: 'b1' }));
    const budget = repository.getBudget('b1')!;
    repository.startExecution(budget);
    const ex = repository.getExecutions()[0];
    expect(ex.companyId).toBeNull();
  });
});

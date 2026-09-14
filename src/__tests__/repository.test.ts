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
import type { Budget, Execution } from '../lib/types';

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

describe('repository', () => {
  describe('User', () => {
    it('getUser returns null when empty', () => {
      expect(repository.getUser()).toBeNull();
    });

    it('saveUser and getUser round-trip', () => {
      const user = { id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' };
      repository.saveUser(user);
      expect(repository.getUser()).toEqual(user);
    });
  });

  describe('Settings', () => {
    it('getSettings returns defaults when empty', () => {
      const s = repository.getSettings();
      expect(s.workerDailyRate).toBe(280);
      expect(s.helperDailyRate).toBe(150);
      expect(s.defaultHelpers).toBe(1);
      expect(s.fullMargin).toBe(30);
    });

    it('saveSettings merges with defaults', () => {
      repository.saveSettings({ workerDailyRate: 350 });
      const s = repository.getSettings();
      expect(s.workerDailyRate).toBe(350);
      expect(s.helperDailyRate).toBe(150);
    });

    it('saveSettings overwrites previous save', () => {
      repository.saveSettings({ workerDailyRate: 350 });
      repository.saveSettings({ workerDailyRate: 400, region: 'SP' });
      const s = repository.getSettings();
      expect(s.workerDailyRate).toBe(400);
      expect(s.region).toBe('SP');
    });
  });

  describe('Budget — CRUD', () => {
    it('getBudgets returns empty array when empty', () => {
      expect(repository.getBudgets()).toEqual([]);
    });

    it('addBudget returns normalized budget with id', () => {
      const b = makeBudget();
      const saved = repository.addBudget(b);
      expect(saved.id).toBe('b1');
      expect(saved.projectName).toBe('Projeto Teste');
    });

    it('addBudget stores and retrieves', () => {
      repository.addBudget(makeBudget({ id: 'b1', projectName: 'A' }));
      repository.addBudget(makeBudget({ id: 'b2', projectName: 'B' }));
      const all = repository.getBudgets();
      expect(all).toHaveLength(2);
    });

    it('getBudget returns budget by id', () => {
      repository.addBudget(makeBudget({ id: 'b1' }));
      expect(repository.getBudget('b1')).not.toBeNull();
      expect(repository.getBudget('b1')!.id).toBe('b1');
    });

    it('getBudget returns null for unknown id', () => {
      expect(repository.getBudget('unknown')).toBeNull();
    });

    it('updateBudget updates existing budget', () => {
      repository.addBudget(makeBudget({ id: 'b1', projectName: 'Before' }));
      repository.updateBudget(makeBudget({ id: 'b1', projectName: 'After' }));
      expect(repository.getBudget('b1')!.projectName).toBe('After');
    });

    it('updateBudget sets updatedAt', () => {
      repository.addBudget(makeBudget({ id: 'b1' }));
      repository.updateBudget(makeBudget({ id: 'b1' }));
      const b = repository.getBudget('b1')!;
      expect(b.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
    });

    it('updateBudget warns for non-existent id', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      repository.updateBudget(makeBudget({ id: 'nonexistent' }));
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('deleteBudget removes budget', () => {
      repository.addBudget(makeBudget({ id: 'b1' }));
      repository.deleteBudget('b1');
      expect(repository.getBudgets()).toEqual([]);
    });

    it('deleteBudget is safe for unknown id', () => {
      repository.deleteBudget('unknown');
      expect(repository.getBudgets()).toEqual([]);
    });

    it('normalizeBudget fills missing fields with defaults', () => {
      const raw = { id: 'b1' } as unknown as Budget;
      repository.addBudget(raw);
      const b = repository.getBudget('b1')!;
      expect(b.measurements).toEqual({});
      expect(b.quantities).toEqual({});
      expect(b.calculated).toEqual({ floorArea: null, perimeter: null, wallArea: null, volume: null, linearMeters: null });
      expect(b.status).toBe('draft');
      expect(b.approvalStatus).toBe('pending');
      expect(b.projectMode).toBe('simple');
    });
  });

  describe('Client — CRUD', () => {
    it('getClients returns empty array when empty', () => {
      expect(repository.getClients()).toEqual([]);
    });

    it('addClient creates and returns client', () => {
      const c = repository.addClient({ name: 'Maria' });
      expect(c.name).toBe('Maria');
      expect(c.id).toBeTruthy();
      expect(c.phone).toBe('');
    });

    it('getClient returns client by id', () => {
      const c = repository.addClient({ name: 'Maria' });
      expect(repository.getClient(c.id)!.name).toBe('Maria');
    });

    it('getClient returns null for unknown id', () => {
      expect(repository.getClient('unknown')).toBeNull();
    });

    it('updateClient updates existing client', () => {
      const c = repository.addClient({ name: 'Before' });
      repository.updateClient({ ...c, name: 'After' });
      expect(repository.getClient(c.id)!.name).toBe('After');
    });

    it('updateClient warns for non-existent id', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      repository.updateClient({ id: 'x', name: 'X', phone: '', address: '', city: '', notes: '', createdAt: '', updatedAt: '' });
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('deleteClient removes client', () => {
      const c = repository.addClient({ name: 'Maria' });
      repository.deleteClient(c.id);
      expect(repository.getClients()).toEqual([]);
    });
  });

  describe('Material — CRUD', () => {
    it('getMaterials returns empty array when empty', () => {
      expect(repository.getMaterials()).toEqual([]);
    });

    it('addMaterial creates and returns material', () => {
      const m = repository.addMaterial({ name: 'Cimento', category: 'Materiais', unit: 'kg', unitPrice: 30, supplier: 'Votoran', notes: '' });
      expect(m.name).toBe('Cimento');
      expect(m.id).toBeTruthy();
      expect(m.lastUpdated).toBeTruthy();
    });

    it('updateMaterial updates existing material', () => {
      const m = repository.addMaterial({ name: 'Cimento', category: 'Materiais', unit: 'kg', unitPrice: 30, supplier: 'Votoran', notes: '' });
      repository.updateMaterial({ ...m, unitPrice: 35 });
      const updated = repository.getMaterials().find((x) => x.id === m.id)!;
      expect(updated.unitPrice).toBe(35);
    });

    it('updateMaterial warns for non-existent id', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      repository.updateMaterial({ id: 'x', name: 'X', category: '', unit: '', unitPrice: 0, supplier: '', lastUpdated: '', notes: '' });
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('deleteMaterial removes material', () => {
      const m = repository.addMaterial({ name: 'Cimento', category: 'Materiais', unit: 'kg', unitPrice: 30, supplier: 'Votoran', notes: '' });
      repository.deleteMaterial(m.id);
      expect(repository.getMaterials()).toEqual([]);
    });
  });

  describe('Execution — CRUD', () => {
    it('getExecutions returns empty array when empty', () => {
      expect(repository.getExecutions()).toEqual([]);
    });

    it('startExecution creates execution from budget', () => {
      const budget = makeBudget({
        id: 'b1',
        stages: [{ id: 's1', name: 'Fundação', enabled: true, order: 0, estimatedDays: 5, laborCost: 1000, expenseCost: 500, riskReserve: 75, minimumPrice: 0, recommendedPrice: 0, fullPrice: 0 }],
        laborCost: 5000,
        materialCost: 3000,
        transportCost: 200,
        foodCost: 100,
        fuelCost: 50,
        toolCost: 30,
        otherCost: 20,
        riskReserve: 400,
      });
      const ex = repository.startExecution(budget);
      expect(ex.projectId).toBe('b1');
      expect(ex.status).toBe('in_progress');
      expect(ex.stages).toHaveLength(1);
      expect(ex.stages[0].name).toBe('Fundação');
      expect(ex.plannedLaborCost).toBe(5000);
      expect(ex.plannedMaterialCost).toBe(3000);
    });

    it('saveExecution upserts (creates if new)', () => {
      const ex: Execution = {
        id: 'e1', projectId: 'b1', status: 'in_progress', startDate: '2026-01-01',
        plannedEndDate: null, actualEndDate: null, progressPercent: 0,
        plannedLaborCost: 0, plannedMaterialCost: 0, plannedFreightCost: 0,
        plannedOtherExpense: 0, plannedRiskReserve: 0,
        actualLaborCost: 0, actualMaterialCost: 0, actualFreightCost: 0,
        actualOtherExpense: 0, actualTotalCost: 0, projectedFinalCost: 0,
        projectedResult: null, projectedMargin: null,
        stages: [], payments: [], expenses: [], logs: [],
        createdAt: '2026-01-01', updatedAt: '2026-01-01',
      };
      repository.saveExecution(ex);
      expect(repository.getExecutions()).toHaveLength(1);
    });

    it('saveExecution upserts (updates existing)', () => {
      const ex: Execution = {
        id: 'e1', projectId: 'b1', status: 'in_progress', startDate: '2026-01-01',
        plannedEndDate: null, actualEndDate: null, progressPercent: 0,
        plannedLaborCost: 0, plannedMaterialCost: 0, plannedFreightCost: 0,
        plannedOtherExpense: 0, plannedRiskReserve: 0,
        actualLaborCost: 0, actualMaterialCost: 0, actualFreightCost: 0,
        actualOtherExpense: 0, actualTotalCost: 0, projectedFinalCost: 0,
        projectedResult: null, projectedMargin: null,
        stages: [], payments: [], expenses: [], logs: [],
        createdAt: '2026-01-01', updatedAt: '2026-01-01',
      };
      repository.saveExecution(ex);
      repository.saveExecution({ ...ex, progressPercent: 50 });
      const found = repository.getExecutions().find((e) => e.id === 'e1')!;
      expect(found.progressPercent).toBe(50);
    });

    it('deleteExecution removes execution', () => {
      const ex: Execution = {
        id: 'e1', projectId: 'b1', status: 'in_progress', startDate: '2026-01-01',
        plannedEndDate: null, actualEndDate: null, progressPercent: 0,
        plannedLaborCost: 0, plannedMaterialCost: 0, plannedFreightCost: 0,
        plannedOtherExpense: 0, plannedRiskReserve: 0,
        actualLaborCost: 0, actualMaterialCost: 0, actualFreightCost: 0,
        actualOtherExpense: 0, actualTotalCost: 0, projectedFinalCost: 0,
        projectedResult: null, projectedMargin: null,
        stages: [], payments: [], expenses: [], logs: [],
        createdAt: '2026-01-01', updatedAt: '2026-01-01',
      };
      repository.saveExecution(ex);
      repository.deleteExecution('e1');
      expect(repository.getExecutions()).toEqual([]);
    });
  });

  describe('Empty state', () => {
    it('all getters return empty/null defaults', () => {
      expect(repository.getBudgets()).toEqual([]);
      expect(repository.getClients()).toEqual([]);
      expect(repository.getMaterials()).toEqual([]);
      expect(repository.getExecutions()).toEqual([]);
      expect(repository.getUser()).toBeNull();
      expect(repository.getSettings()).toHaveProperty('workerDailyRate');
    });
  });

  describe('Multiple entities coexist', () => {
    it('budgets, clients, materials, executions are independent', () => {
      repository.addBudget(makeBudget({ id: 'b1' }));
      repository.addClient({ name: 'C1' });
      repository.addMaterial({ name: 'M1', category: '', unit: '', unitPrice: 0, supplier: '', notes: '' });
      const ex: Execution = {
        id: 'e1', projectId: 'b1', status: 'in_progress', startDate: '2026-01-01',
        plannedEndDate: null, actualEndDate: null, progressPercent: 0,
        plannedLaborCost: 0, plannedMaterialCost: 0, plannedFreightCost: 0,
        plannedOtherExpense: 0, plannedRiskReserve: 0,
        actualLaborCost: 0, actualMaterialCost: 0, actualFreightCost: 0,
        actualOtherExpense: 0, actualTotalCost: 0, projectedFinalCost: 0,
        projectedResult: null, projectedMargin: null,
        stages: [], payments: [], expenses: [], logs: [],
        createdAt: '2026-01-01', updatedAt: '2026-01-01',
      };
      repository.saveExecution(ex);

      expect(repository.getBudgets()).toHaveLength(1);
      expect(repository.getClients()).toHaveLength(1);
      expect(repository.getMaterials()).toHaveLength(1);
      expect(repository.getExecutions()).toHaveLength(1);

      repository.deleteBudget('b1');
      expect(repository.getBudgets()).toHaveLength(0);
      expect(repository.getClients()).toHaveLength(1);
      expect(repository.getMaterials()).toHaveLength(1);
      expect(repository.getExecutions()).toHaveLength(1);
    });
  });
});

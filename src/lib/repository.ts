import type {
  User,
  Settings,
  Budget,
  Client,
  Material,
  Execution,
} from './types';
import { read, write } from './storage';
import { generateId } from './id';

function normalizeBudget(budget: Budget): Budget {
  return {
    id: budget.id ?? generateId(),
    clientId: budget.clientId ?? null,
    serviceType: budget.serviceType ?? '',
    serviceCategory: budget.serviceCategory ?? '',
    description: budget.description ?? '',
    projectName: budget.projectName ?? '',
    projectDescription: budget.projectDescription ?? '',
    siteAddress: budget.siteAddress ?? '',
    city: budget.city ?? '',
    measurements: budget.measurements ?? {},
    quantities: budget.quantities ?? {},
    options: budget.options ?? {},
    calculated: budget.calculated ?? {
      floorArea: null,
      perimeter: null,
      wallArea: null,
      volume: null,
      linearMeters: null,
    },
    estimatedDays: budget.estimatedDays ?? null,
    daysCalculationMode: budget.daysCalculationMode ?? 'fixed',
    productivityPerDay: budget.productivityPerDay ?? null,
    teamDailyCost: budget.teamDailyCost ?? null,
    laborCost: budget.laborCost ?? null,
    workerCost: budget.workerCost ?? null,
    helperCost: budget.helperCost ?? null,
    workerDailyRate: budget.workerDailyRate ?? null,
    helperDailyRate: budget.helperDailyRate ?? null,
    numberOfHelpers: budget.numberOfHelpers ?? null,
    transportCost: budget.transportCost ?? 0,
    foodCost: budget.foodCost ?? 0,
    fuelCost: budget.fuelCost ?? 0,
    toolCost: budget.toolCost ?? 0,
    otherCost: budget.otherCost ?? 0,
    expenseCost: budget.expenseCost ?? 0,
    riskReservePercent: budget.riskReservePercent ?? null,
    riskReserve: budget.riskReserve ?? 0,
    materialCost: budget.materialCost ?? 0,
    materialSellingPrice: budget.materialSellingPrice ?? 0,
    totalCost: budget.totalCost ?? 0,
    minimumMargin: budget.minimumMargin ?? null,
    recommendedMargin: budget.recommendedMargin ?? null,
    fullMargin: budget.fullMargin ?? null,
    minimumPrice: budget.minimumPrice ?? null,
    recommendedPrice: budget.recommendedPrice ?? null,
    fullPrice: budget.fullPrice ?? null,
    effectiveUnitPrice: budget.effectiveUnitPrice ?? null,
    pricingVersion: budget.pricingVersion ?? 'v1',
    selectedPriceType: budget.selectedPriceType ?? null,
    customPrice: budget.customPrice ?? null,
    discount: budget.discount ?? 0,
    finalPrice: budget.finalPrice ?? null,
    paymentMethod: budget.paymentMethod ?? '',
    paymentTerms: budget.paymentTerms ?? [],
    includedServices: budget.includedServices ?? [],
    excludedServices: budget.excludedServices ?? [],
    agreedDays: budget.agreedDays ?? null,
    validityDays: budget.validityDays ?? 30,
    expiresAt: budget.expiresAt ?? null,
    approvalStatus: budget.approvalStatus ?? 'pending',
    approvedAt: budget.approvedAt ?? null,
    rejectedAt: budget.rejectedAt ?? null,
    status: budget.status ?? 'draft',
    projectMode: budget.projectMode ?? 'simple',
    stages: budget.stages ?? [],
    materials: budget.materials ?? [],
    createdAt: budget.createdAt ?? new Date().toISOString(),
    updatedAt: budget.updatedAt ?? new Date().toISOString(),
  };
}

const DEFAULT_SETTINGS: Settings = {
  workerDailyRate: 280,
  helperDailyRate: 150,
  defaultHelpers: 1,
  minimumMargin: 10,
  recommendedMargin: 20,
  fullMargin: 30,
  defaultWastePercent: 10,
  defaultRiskReservePercent: 5,
  currency: 'R$',
  region: '',
  city: '',
};

export const repository = {
  getUser(): User | null {
    return read<User | null>('user', null);
  },

  saveUser(user: User): void {
    write('user', user);
  },

  getSettings(): Settings {
    const partial = read<Partial<Settings>>('settings', {});
    return { ...DEFAULT_SETTINGS, ...partial };
  },

  saveSettings(settings: Partial<Settings>): void {
    const current = this.getSettings();
    const merged = { ...current, ...settings };
    write('settings', merged);
  },

  getBudgets(): Budget[] {
    const raw = read<Budget[]>('budgets', []);
    return raw.map(normalizeBudget);
  },

  addBudget(budget: Budget): Budget {
    const budgets = this.getBudgets();
    const normalized = normalizeBudget(budget);
    budgets.push(normalized);
    write('budgets', budgets);
    return normalized;
  },

  getBudget(id: string): Budget | null {
    const budgets = this.getBudgets();
    return budgets.find((b) => b.id === id) ?? null;
  },

  updateBudget(budget: Budget): void {
    const budgets = this.getBudgets();
    const index = budgets.findIndex((b) => b.id === budget.id);
    if (index === -1) return;
    const normalized = normalizeBudget(budget);
    normalized.updatedAt = new Date().toISOString();
    budgets[index] = normalized;
    write('budgets', budgets);
  },

  deleteBudget(id: string): void {
    const budgets = this.getBudgets();
    const filtered = budgets.filter((b) => b.id !== id);
    write('budgets', filtered);
  },

  getClients(): Client[] {
    return read<Client[]>('clients', []);
  },

  addClient(data: {
    name: string;
    phone?: string;
    city?: string;
    address?: string;
    notes?: string;
  }): Client {
    const clients = this.getClients();
    const now = new Date().toISOString();
    const client: Client = {
      id: generateId(),
      name: data.name,
      phone: data.phone ?? '',
      address: data.address ?? '',
      city: data.city ?? '',
      notes: data.notes ?? '',
      createdAt: now,
      updatedAt: now,
    };
    clients.push(client);
    write('clients', clients);
    return client;
  },

  getClient(id: string): Client | null {
    const clients = this.getClients();
    return clients.find((c) => c.id === id) ?? null;
  },

  updateClient(client: Client): void {
    const clients = this.getClients();
    const index = clients.findIndex((c) => c.id === client.id);
    if (index === -1) return;
    client.updatedAt = new Date().toISOString();
    clients[index] = client;
    write('clients', clients);
  },

  deleteClient(id: string): void {
    const clients = this.getClients();
    const filtered = clients.filter((c) => c.id !== id);
    write('clients', filtered);
  },

  getMaterials(): Material[] {
    return read<Material[]>('materials', []);
  },

  addMaterial(data: Omit<Material, 'id' | 'lastUpdated'>): Material {
    const materials = this.getMaterials();
    const now = new Date().toISOString();
    const material: Material = {
      ...data,
      id: generateId(),
      lastUpdated: now,
    };
    materials.push(material);
    write('materials', materials);
    return material;
  },

  updateMaterial(material: Material): void {
    const materials = this.getMaterials();
    const index = materials.findIndex((m) => m.id === material.id);
    if (index === -1) return;
    material.lastUpdated = new Date().toISOString();
    materials[index] = material;
    write('materials', materials);
  },

  deleteMaterial(id: string): void {
    const materials = this.getMaterials();
    const filtered = materials.filter((m) => m.id !== id);
    write('materials', filtered);
  },

  getExecutions(): Execution[] {
    return read<Execution[]>('executions', []);
  },

  startExecution(budget: Budget): Execution {
    const now = new Date().toISOString();
    const execution: Execution = {
      id: generateId(),
      projectId: budget.id,
      status: 'in_progress',
      startDate: now,
      plannedEndDate: null,
      actualEndDate: null,
      progressPercent: 0,
      plannedLaborCost: budget.laborCost ?? 0,
      plannedMaterialCost: budget.materialCost ?? 0,
      plannedFreightCost: budget.transportCost ?? 0,
      plannedOtherExpense: (budget.foodCost ?? 0) + (budget.fuelCost ?? 0) + (budget.toolCost ?? 0) + (budget.otherCost ?? 0),
      plannedRiskReserve: budget.riskReserve ?? 0,
      actualLaborCost: 0,
      actualMaterialCost: 0,
      actualFreightCost: 0,
      actualOtherExpense: 0,
      actualTotalCost: 0,
      projectedFinalCost: 0,
      projectedResult: null,
      projectedMargin: null,
      stages: budget.stages.map((s) => ({
        id: s.id,
        name: s.name,
        status: 'pending',
        progressPercent: 0,
      })),
      payments: [],
      expenses: [],
      logs: [],
      createdAt: now,
      updatedAt: now,
    };
    const executions = this.getExecutions();
    executions.push(execution);
    write('executions', executions);
    return execution;
  },

  saveExecution(execution: Execution): void {
    const executions = this.getExecutions();
    const index = executions.findIndex((e) => e.id === execution.id);
    const updated = { ...execution, updatedAt: new Date().toISOString() };
    if (index === -1) {
      executions.push(updated);
    } else {
      executions[index] = updated;
    }
    write('executions', executions);
  },

  deleteExecution(id: string): void {
    const executions = this.getExecutions();
    const filtered = executions.filter((e) => e.id !== id);
    write('executions', filtered);
  },
};

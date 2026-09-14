import { supabase } from './supabase';
import { repository } from './repository';
import type {
  User,
  Company,
  Settings,
  Client,
  Material,
  Budget,
  Execution,
} from './types';

// ─── Types ──────────────────────────────────────────────

export interface MigrationIdMap {
  clients: Record<string, string>;
  materials: Record<string, string>;
  budgets: Record<string, string>;
  executions: Record<string, string>;
}

export interface LocalDataSnapshot {
  user: User | null;
  companies: Company[];
  settings: Settings;
  clients: Client[];
  materials: Material[];
  budgets: Budget[];
  executions: Execution[];
}

export type MigrationStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export interface MigrationProgress {
  status: MigrationStatus;
  step: string;
  completed: number;
  total: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface MigrationResult {
  success: boolean;
  error?: string;
  idMap?: MigrationIdMap;
  counts?: {
    clients: number;
    materials: number;
    budgets: number;
    executions: number;
  };
}

// ─── Storage key for migration status ───────────────────

const MIGRATION_STATUS_KEY = 'orcaobra.v1.migrationStatus';
const MIGRATION_IDMAP_KEY = 'orcaobra.v1.migrationIdMap';

// ─── Phase 1-2: Snapshot ────────────────────────────────

export function createSnapshot(): LocalDataSnapshot {
  return {
    user: repository.getUser(),
    companies: repository.getCompanies(),
    settings: repository.getSettings(),
    clients: repository.getClients(),
    materials: repository.getMaterials(),
    budgets: repository.getBudgets(),
    executions: repository.getExecutions(),
  };
}

// ─── Phase 3: Validate ─────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSnapshot(snapshot: LocalDataSnapshot): ValidationResult {
  const errors: string[] = [];

  if (!snapshot.user) {
    errors.push('No local user found');
  } else {
    if (!snapshot.user.name || snapshot.user.name.trim() === '') {
      errors.push('User has no name');
    }
  }

  for (const client of snapshot.clients) {
    if (!client.id) errors.push('Client missing id');
    if (!client.name) errors.push(`Client ${client.id} missing name`);
  }

  for (const material of snapshot.materials) {
    if (!material.id) errors.push('Material missing id');
    if (!material.name) errors.push(`Material ${material.id} missing name`);
  }

  for (const budget of snapshot.budgets) {
    if (!budget.id) errors.push('Budget missing id');
  }

  for (const execution of snapshot.executions) {
    if (!execution.id) errors.push('Execution missing id');
    if (!execution.projectId) errors.push(`Execution ${execution.id} missing projectId`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Phase 4-5: ID Map ─────────────────────────────────

function createEmptyIdMap(): MigrationIdMap {
  return { clients: {}, materials: {}, budgets: {}, executions: {} };
}

function loadStoredIdMap(): MigrationIdMap | null {
  try {
    const raw = localStorage.getItem(MIGRATION_IDMAP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MigrationIdMap;
  } catch {
    return null;
  }
}

function saveIdMap(idMap: MigrationIdMap): void {
  try {
    localStorage.setItem(MIGRATION_IDMAP_KEY, JSON.stringify(idMap));
  } catch {
    // storage full or unavailable
  }
}

// ─── Migration status persistence ───────────────────────

export function getMigrationStatus(): MigrationProgress {
  try {
    const raw = localStorage.getItem(MIGRATION_STATUS_KEY);
    if (!raw) {
      return {
        status: 'not_started',
        step: '',
        completed: 0,
        total: 0,
        error: null,
        startedAt: null,
        completedAt: null,
      };
    }
    return JSON.parse(raw) as MigrationProgress;
  } catch {
    return {
      status: 'not_started',
      step: '',
      completed: 0,
      total: 0,
      error: null,
      startedAt: null,
      completedAt: null,
    };
  }
}

function saveMigrationStatus(progress: MigrationProgress): void {
  try {
    localStorage.setItem(MIGRATION_STATUS_KEY, JSON.stringify(progress));
  } catch {
    // storage full or unavailable
  }
}

// ─── Phase 6-15: Migration functions ────────────────────

async function migrateProfile(
  user: User,
  authUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  const { error } = await supabase!.from('profiles').upsert(
    {
      id: authUserId,
      name: user.name,
      profession: user.profession,
      created_at: user.createdAt || now,
      updated_at: now,
    },
    { onConflict: 'id' },
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

async function migrateCompany(
  companies: Company[],
  authUserId: string,
  userName: string,
): Promise<{ success: boolean; companyId?: string; error?: string }> {
  const now = new Date().toISOString();

  // Check if user already has a membership
  const { data: existingMembership } = await supabase!
    .from('company_memberships')
    .select('company_id')
    .eq('user_id', authUserId)
    .limit(1)
    .single();

  if (existingMembership) {
    return { success: true, companyId: existingMembership.company_id };
  }

  // No existing membership — create company from local data
  if (companies.length > 0) {
    const localCompany = companies[0];

    const { data: company, error: companyError } = await supabase!
      .from('companies')
      .insert({
        name: localCompany.name,
        status: localCompany.status || 'active',
        created_at: localCompany.createdAt || now,
        updated_at: now,
      })
      .select()
      .single();

    if (companyError) return { success: false, error: companyError.message };

    const { error: membershipError } = await supabase!
      .from('company_memberships')
      .insert({
        company_id: company.id,
        user_id: authUserId,
        role: 'owner',
        created_at: now,
      });

    if (membershipError) return { success: false, error: membershipError.message };
    return { success: true, companyId: company.id };
  }

  // No local companies — create a default one
  const { data: company, error: companyError } = await supabase!
    .from('companies')
    .insert({
      name: `${userName || 'Empresa'} — Empresa`,
      status: 'active',
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (companyError) return { success: false, error: companyError.message };

  const { error: membershipError } = await supabase!
    .from('company_memberships')
    .insert({
      company_id: company.id,
      user_id: authUserId,
      role: 'owner',
      created_at: now,
    });

  if (membershipError) return { success: false, error: membershipError.message };
  return { success: true, companyId: company.id };
}

async function migrateSettings(
  settings: Settings,
  authUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  const { error } = await supabase!.from('settings').upsert(
    {
      user_id: authUserId,
      data: settings,
      updated_at: now,
    },
    { onConflict: 'user_id' },
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

async function migrateClients(
  clients: Client[],
  cloudCompanyId: string,
  idMap: MigrationIdMap,
): Promise<{ success: boolean; count: number; error?: string }> {
  const now = new Date().toISOString();
  let count = 0;

  for (const client of clients) {
    const cloudId = idMap.clients[client.id];
    if (cloudId) {
      count++;
      continue;
    }

    const { data, error } = await supabase!
      .from('clients')
      .insert({
        name: client.name,
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        notes: client.notes || '',
        company_id: cloudCompanyId,
        created_at: client.createdAt || now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) return { success: false, count, error: error.message };
    idMap.clients[client.id] = data.id;
    count++;
  }

  return { success: true, count };
}

async function migrateMaterials(
  materials: Material[],
  cloudCompanyId: string,
  idMap: MigrationIdMap,
): Promise<{ success: boolean; count: number; error?: string }> {
  const now = new Date().toISOString();
  let count = 0;

  for (const material of materials) {
    const cloudId = idMap.materials[material.id];
    if (cloudId) {
      count++;
      continue;
    }

    const { data, error } = await supabase!
      .from('materials')
      .insert({
        name: material.name,
        category: material.category,
        unit: material.unit,
        unit_price: material.unitPrice,
        supplier: material.supplier || '',
        notes: material.notes || '',
        company_id: cloudCompanyId,
        last_updated: material.lastUpdated || now,
      })
      .select()
      .single();

    if (error) return { success: false, count, error: error.message };
    idMap.materials[material.id] = data.id;
    count++;
  }

  return { success: true, count };
}

async function migrateBudgets(
  budgets: Budget[],
  cloudCompanyId: string,
  idMap: MigrationIdMap,
): Promise<{ success: boolean; count: number; error?: string }> {
  const now = new Date().toISOString();
  let count = 0;

  for (const budget of budgets) {
    const cloudId = idMap.budgets[budget.id];
    if (cloudId) {
      count++;
      continue;
    }

    // Resolve clientId via idMap
    const cloudClientId = budget.clientId ? idMap.clients[budget.clientId] ?? null : null;

    const dbRow: Record<string, unknown> = {
      company_id: cloudCompanyId,
      client_id: cloudClientId,
      service_type: budget.serviceType,
      service_category: budget.serviceCategory,
      description: budget.description,
      project_name: budget.projectName,
      project_description: budget.projectDescription,
      site_address: budget.siteAddress,
      city: budget.city,
      measurements: budget.measurements,
      quantities: budget.quantities,
      options: budget.options,
      calculated: budget.calculated,
      estimated_days: budget.estimatedDays,
      days_calculation_mode: budget.daysCalculationMode,
      productivity_per_day: budget.productivityPerDay,
      team_daily_cost: budget.teamDailyCost,
      labor_cost: budget.laborCost,
      worker_cost: budget.workerCost,
      helper_cost: budget.helperCost,
      worker_daily_rate: budget.workerDailyRate,
      helper_daily_rate: budget.helperDailyRate,
      number_of_helpers: budget.numberOfHelpers,
      transport_cost: budget.transportCost,
      food_cost: budget.foodCost,
      fuel_cost: budget.fuelCost,
      tool_cost: budget.toolCost,
      other_cost: budget.otherCost,
      expense_cost: budget.expenseCost,
      risk_reserve_percent: budget.riskReservePercent,
      risk_reserve: budget.riskReserve,
      material_cost: budget.materialCost,
      material_selling_price: budget.materialSellingPrice,
      total_cost: budget.totalCost,
      minimum_margin: budget.minimumMargin,
      recommended_margin: budget.recommendedMargin,
      full_margin: budget.fullMargin,
      minimum_price: budget.minimumPrice,
      recommended_price: budget.recommendedPrice,
      full_price: budget.fullPrice,
      effective_unit_price: budget.effectiveUnitPrice,
      pricing_version: budget.pricingVersion,
      selected_price_type: budget.selectedPriceType,
      custom_price: budget.customPrice,
      discount: budget.discount,
      final_price: budget.finalPrice,
      payment_method: budget.paymentMethod,
      payment_terms: budget.paymentTerms,
      included_services: budget.includedServices,
      excluded_services: budget.excludedServices,
      agreed_days: budget.agreedDays,
      validity_days: budget.validityDays,
      expires_at: budget.expiresAt,
      approval_status: budget.approvalStatus,
      approved_at: budget.approvedAt,
      rejected_at: budget.rejectedAt,
      status: budget.status,
      project_mode: budget.projectMode,
      stages: budget.stages,
      materials: budget.materials,
      created_at: budget.createdAt || now,
      updated_at: now,
    };

    const { data, error } = await supabase!
      .from('budgets')
      .insert(dbRow)
      .select('id')
      .single();

    if (error) return { success: false, count, error: error.message };
    idMap.budgets[budget.id] = data.id;
    count++;
  }

  return { success: true, count };
}

async function migrateExecutions(
  executions: Execution[],
  cloudCompanyId: string,
  idMap: MigrationIdMap,
): Promise<{ success: boolean; count: number; error?: string }> {
  const now = new Date().toISOString();
  let count = 0;

  for (const execution of executions) {
    const cloudId = idMap.executions[execution.id];
    if (cloudId) {
      count++;
      continue;
    }

    // Resolve projectId via idMap
    const cloudProjectId = idMap.budgets[execution.projectId] ?? execution.projectId;

    const dbRow: Record<string, unknown> = {
      company_id: cloudCompanyId,
      project_id: cloudProjectId,
      status: execution.status,
      start_date: execution.startDate,
      planned_end_date: execution.plannedEndDate,
      actual_end_date: execution.actualEndDate,
      progress_percent: execution.progressPercent,
      planned_labor_cost: execution.plannedLaborCost,
      planned_material_cost: execution.plannedMaterialCost,
      planned_freight_cost: execution.plannedFreightCost,
      planned_other_expense: execution.plannedOtherExpense,
      planned_risk_reserve: execution.plannedRiskReserve,
      actual_labor_cost: execution.actualLaborCost,
      actual_material_cost: execution.actualMaterialCost,
      actual_freight_cost: execution.actualFreightCost,
      actual_other_expense: execution.actualOtherExpense,
      actual_total_cost: execution.actualTotalCost,
      projected_final_cost: execution.projectedFinalCost,
      projected_result: execution.projectedResult,
      projected_margin: execution.projectedMargin,
      stages: execution.stages,
      payments: execution.payments,
      expenses: execution.expenses,
      logs: execution.logs,
      created_at: execution.createdAt || now,
      updated_at: now,
    };

    const { data, error } = await supabase!
      .from('executions')
      .insert(dbRow)
      .select('id')
      .single();

    if (error) return { success: false, count, error: error.message };
    idMap.executions[execution.id] = data.id;
    count++;
  }

  return { success: true, count };
}

// ─── Phase 33-34: Post-migration verification ──────────

async function verifyMigration(
  cloudCompanyId: string,
  snapshot: LocalDataSnapshot,
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  const { count: cloudClients } = await supabase!
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', cloudCompanyId);

  const { count: cloudMaterials } = await supabase!
    .from('materials')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', cloudCompanyId);

  const { count: cloudBudgets } = await supabase!
    .from('budgets')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', cloudCompanyId);

  const { count: cloudExecutions } = await supabase!
    .from('executions')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', cloudCompanyId);

  if (cloudClients !== snapshot.clients.length) {
    errors.push(`Clients: local=${snapshot.clients.length} cloud=${cloudClients}`);
  }
  if (cloudMaterials !== snapshot.materials.length) {
    errors.push(`Materials: local=${snapshot.materials.length} cloud=${cloudMaterials}`);
  }
  if (cloudBudgets !== snapshot.budgets.length) {
    errors.push(`Budgets: local=${snapshot.budgets.length} cloud=${cloudBudgets}`);
  }
  if (cloudExecutions !== snapshot.executions.length) {
    errors.push(`Executions: local=${snapshot.executions.length} cloud=${cloudExecutions}`);
  }

  // Verify reference integrity: budget.clientId resolved
  const idMap = loadStoredIdMap();
  if (idMap) {
    for (const budget of snapshot.budgets) {
      if (budget.clientId && !idMap.clients[budget.clientId]) {
        errors.push(`Budget ${budget.id} references unmapped client ${budget.clientId}`);
      }
    }
    for (const execution of snapshot.executions) {
      if (!idMap.budgets[execution.projectId]) {
        errors.push(`Execution ${execution.id} references unmapped budget ${execution.projectId}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Main migration function ────────────────────────────

export async function runMigration(
  onProgress?: (progress: MigrationProgress) => void,
): Promise<MigrationResult> {
  const progress: MigrationProgress = {
    status: 'in_progress',
    step: 'Preparando dados...',
    completed: 0,
    total: 0,
    error: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  const report = (p: MigrationProgress) => {
    saveMigrationStatus(p);
    onProgress?.(p);
  };

  try {
    // 1. Check auth
    const { data: { session } } = await supabase!.auth.getSession();
    const authUser = session?.user;
    if (!authUser) {
      progress.status = 'failed';
      progress.error = 'Usuário não autenticado';
      report(progress);
      return { success: false, error: 'Usuário não autenticado' };
    }

    // 2. Create snapshot
    progress.step = 'Criando snapshot dos dados locais...';
    report(progress);

    const snapshot = createSnapshot();

    // 3. Validate
    progress.step = 'Validando dados...';
    report(progress);

    const validation = validateSnapshot(snapshot);
    if (!validation.valid) {
      progress.status = 'failed';
      progress.error = `Dados inválidos: ${validation.errors.join(', ')}`;
      report(progress);
      return { success: false, error: `Dados inválidos: ${validation.errors.join(', ')}` };
    }

    // Load or create idMap (for retry support)
    let idMap = loadStoredIdMap() || createEmptyIdMap();

    // 4. Migrate profile
    progress.step = 'Migrando perfil...';
    report(progress);

    const profileResult = await migrateProfile(snapshot.user!, authUser.id);
    if (!profileResult.success) {
      progress.status = 'failed';
      progress.error = `Erro ao migrar perfil: ${profileResult.error}`;
      report(progress);
      return { success: false, error: `Erro ao migrar perfil: ${profileResult.error}` };
    }

    // 5. Migrate company
    progress.step = 'Migrando empresa...';
    report(progress);

    const companyResult = await migrateCompany(snapshot.companies, authUser.id, snapshot.user?.name || 'Empresa');
    if (!companyResult.success || !companyResult.companyId) {
      progress.status = 'failed';
      progress.error = `Erro ao migrar empresa: ${companyResult.error}`;
      report(progress);
      return { success: false, error: `Erro ao migrar empresa: ${companyResult.error}` };
    }

    const cloudCompanyId = companyResult.companyId;

    // 6. Migrate settings
    progress.step = 'Migrando configurações...';
    report(progress);

    const settingsResult = await migrateSettings(snapshot.settings, authUser.id);
    if (!settingsResult.success) {
      progress.status = 'failed';
      progress.error = `Erro ao migrar configurações: ${settingsResult.error}`;
      report(progress);
      return { success: false, error: `Erro ao migrar configurações: ${settingsResult.error}` };
    }

    // 7. Migrate clients
    const totalEntities = snapshot.clients.length + snapshot.materials.length + snapshot.budgets.length + snapshot.executions.length;
    progress.total = totalEntities;

    progress.step = 'Migrando clientes...';
    report(progress);

    const clientsResult = await migrateClients(snapshot.clients, cloudCompanyId, idMap);
    if (!clientsResult.success) {
      progress.status = 'failed';
      progress.error = `Erro ao migrar clientes: ${clientsResult.error}`;
      saveIdMap(idMap);
      report(progress);
      return { success: false, error: `Erro ao migrar clientes: ${clientsResult.error}` };
    }
    progress.completed = clientsResult.count;
    saveIdMap(idMap);
    report(progress);

    // 8. Migrate materials
    progress.step = 'Migrando materiais...';
    report(progress);

    const materialsResult = await migrateMaterials(snapshot.materials, cloudCompanyId, idMap);
    if (!materialsResult.success) {
      progress.status = 'failed';
      progress.error = `Erro ao migrar materiais: ${materialsResult.error}`;
      saveIdMap(idMap);
      report(progress);
      return { success: false, error: `Erro ao migrar materiais: ${materialsResult.error}` };
    }
    progress.completed = clientsResult.count + materialsResult.count;
    saveIdMap(idMap);
    report(progress);

    // 9. Migrate budgets
    progress.step = 'Migrando orçamentos...';
    report(progress);

    const budgetsResult = await migrateBudgets(snapshot.budgets, cloudCompanyId, idMap);
    if (!budgetsResult.success) {
      progress.status = 'failed';
      progress.error = `Erro ao migrar orçamentos: ${budgetsResult.error}`;
      saveIdMap(idMap);
      report(progress);
      return { success: false, error: `Erro ao migrar orçamentos: ${budgetsResult.error}` };
    }
    progress.completed = clientsResult.count + materialsResult.count + budgetsResult.count;
    saveIdMap(idMap);
    report(progress);

    // 10. Migrate executions
    progress.step = 'Migrando execuções...';
    report(progress);

    const executionsResult = await migrateExecutions(snapshot.executions, cloudCompanyId, idMap);
    if (!executionsResult.success) {
      progress.status = 'failed';
      progress.error = `Erro ao migrar execuções: ${executionsResult.error}`;
      saveIdMap(idMap);
      report(progress);
      return { success: false, error: `Erro ao migrar execuções: ${executionsResult.error}` };
    }
    progress.completed = totalEntities;
    saveIdMap(idMap);
    report(progress);

    // 11. Verify
    progress.step = 'Verificando migração...';
    report(progress);

    const verification = await verifyMigration(cloudCompanyId, snapshot);
    if (!verification.valid) {
      progress.status = 'failed';
      progress.error = `Verificação falhou: ${verification.errors.join(', ')}`;
      report(progress);
      return { success: false, error: `Verificação falhou: ${verification.errors.join(', ')}` };
    }

    // 12. Complete
    progress.status = 'completed';
    progress.step = 'Migração concluída!';
    progress.completedAt = new Date().toISOString();
    report(progress);

    return {
      success: true,
      idMap,
      counts: {
        clients: clientsResult.count,
        materials: materialsResult.count,
        budgets: budgetsResult.count,
        executions: executionsResult.count,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    progress.status = 'failed';
    progress.error = `Erro inesperado: ${message}`;
    report(progress);
    return { success: false, error: `Erro inesperado: ${message}` };
  }
}

// ─── Retry support ──────────────────────────────────────

export async function retryMigration(
  onProgress?: (progress: MigrationProgress) => void,
): Promise<MigrationResult> {
  const currentStatus = getMigrationStatus();
  if (currentStatus.status === 'completed') {
    return { success: true, counts: { clients: 0, materials: 0, budgets: 0, executions: 0 } };
  }
  return runMigration(onProgress);
}

// ─── Has local data ─────────────────────────────────────

export function hasLocalData(): boolean {
  const snapshot = createSnapshot();
  return (
    snapshot.clients.length > 0 ||
    snapshot.materials.length > 0 ||
    snapshot.budgets.length > 0 ||
    snapshot.executions.length > 0
  );
}

// ─── Clear migration status (for testing) ───────────────

export function clearMigrationStatus(): void {
  try {
    localStorage.removeItem(MIGRATION_STATUS_KEY);
    localStorage.removeItem(MIGRATION_IDMAP_KEY);
  } catch {
    // ignore
  }
}

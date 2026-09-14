export type BudgetStatus = 'draft' | 'Rascunho' | 'Enviado' | 'Aprovado' | 'Recusado' | 'Convertido em obra' | 'Expirado';
export type ApprovalStatus = 'pending' | 'Pendente' | 'Aprovado';
export type ProjectMode = 'simple' | 'full' | 'individual';
export type DaysCalculationMode = 'manual' | 'productivity' | 'fixed';
export type PriceType = 'minimum' | 'recommended' | 'full' | 'custom';

export type ExecutionStatus = 'in_progress' | 'completed' | 'paused' | 'cancelled';
export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'paused';

export type ConfidenceLevel = 'alta' | 'media' | 'baixa';

export type PaymentMethod = '' | 'a_vista' | 'parcelado' | 'por_etapa' | 'combinado';
export type PaymentTerm = 'sinal' | 'meio' | 'entrega' | 'semanal' | 'quinzenal' | 'mensal';

export type CompanyStatus = 'active' | 'inactive';

export interface Company {
  id: string;
  name: string;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  companyId?: string | null;
  name: string;
  profession: string;
  createdAt: string;
}

export interface Settings {
  workerDailyRate: number;
  helperDailyRate: number;
  defaultHelpers: number;
  minimumMargin: number;
  recommendedMargin: number;
  fullMargin: number;
  defaultWastePercent: number;
  defaultRiskReservePercent: number;
  currency: string;
  region: string;
  city: string;
}

export interface CalculatedGeometry {
  floorArea?: number | null;
  perimeter?: number | null;
  wallArea?: number | null;
  volume?: number | null;
  linearMeters?: number | null;
}

export interface Stage {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  estimatedDays: number;
  laborCost: number;
  expenseCost: number;
  riskReserve: number;
  minimumPrice: number;
  recommendedPrice: number;
  fullPrice: number;
}

export interface ProjectMaterial {
  materialId: string;
  name: string;
  quantity: number;
  wastePercent: number;
  unitPrice: number;
  unit: string;
  freightCost: number;
}

export interface Budget {
  id: string;
  companyId?: string | null;
  clientId: string | null;
  serviceType: string;
  serviceCategory: string;
  description: string;
  projectName: string;
  projectDescription: string;
  siteAddress: string;
  city: string;
  measurements: Record<string, number | null>;
  quantities: Record<string, number>;
  options: Record<string, string>;
  calculated: CalculatedGeometry;
  estimatedDays: number | null;
  daysCalculationMode: DaysCalculationMode;
  productivityPerDay: number | null;
  teamDailyCost: number | null;
  laborCost: number | null;
  workerCost: number | null;
  helperCost: number | null;
  workerDailyRate: number | null;
  helperDailyRate: number | null;
  numberOfHelpers: number | null;
  transportCost: number;
  foodCost: number;
  fuelCost: number;
  toolCost: number;
  otherCost: number;
  expenseCost: number;
  riskReservePercent: number | null;
  riskReserve: number;
  materialCost: number;
  materialSellingPrice: number;
  totalCost: number;
  minimumMargin: number | null;
  recommendedMargin: number | null;
  fullMargin: number | null;
  minimumPrice: number | null;
  recommendedPrice: number | null;
  fullPrice: number | null;
  effectiveUnitPrice: number | null;
  pricingVersion: string;
  selectedPriceType: PriceType | null;
  customPrice: number | null;
  discount: number;
  finalPrice: number | null;
  paymentMethod: PaymentMethod;
  paymentTerms: PaymentTerm[];
  includedServices: string[];
  excludedServices: string[];
  agreedDays: number | null;
  validityDays: number;
  expiresAt: string | null;
  approvalStatus: ApprovalStatus;
  approvedAt: string | null;
  rejectedAt: string | null;
  status: BudgetStatus;
  projectMode: ProjectMode;
  stages: Stage[];
  materials: ProjectMaterial[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  companyId?: string | null;
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  companyId?: string | null;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
  notes: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  description: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

export interface LogEntry {
  id: string;
  date: string;
  message: string;
}

export interface ExecutionStage {
  id: string;
  name: string;
  status: StageStatus;
  progressPercent: number;
}

export interface Execution {
  id: string;
  companyId?: string | null;
  projectId: string;
  status: ExecutionStatus;
  startDate: string;
  plannedEndDate: string | null;
  actualEndDate: string | null;
  progressPercent: number;
  plannedLaborCost: number;
  plannedMaterialCost: number;
  plannedFreightCost: number;
  plannedOtherExpense: number;
  plannedRiskReserve: number;
  actualLaborCost: number;
  actualMaterialCost: number;
  actualFreightCost: number;
  actualOtherExpense: number;
  actualTotalCost: number;
  projectedFinalCost: number;
  projectedResult: number | null;
  projectedMargin: number | null;
  stages: ExecutionStage[];
  payments: Payment[];
  expenses: Expense[];
  logs: LogEntry[];
  createdAt: string;
  updatedAt: string;
}

export type ServiceFieldType = 'number' | 'text' | 'select' | 'yesno' | 'textarea';

export interface ServiceField {
  id: string;
  label: string;
  target: 'measurements' | 'quantities' | 'options' | 'description';
  type: ServiceFieldType;
  step?: string;
  options?: string[];
  required: boolean;
}

export interface Service {
  type: string;
  category: string;
  icon: string;
  geometry: string[];
  steps: ServiceField[][];
  custom?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

export interface ParseResult {
  rawDescription: string;
  parsedData: {
    serviceType: string;
    measurements: { width: number | null; length: number | null; height: number | null };
    options: Record<string, unknown>;
    services: string[];
    area: number | null;
  };
  missingInformation: string[];
  confidence: ConfidenceLevel;
}

export const PROJECT_TYPES = ['Casa', 'Edícula', 'Reforma', 'Ampliação', 'Comércio', 'Outro'];

export const DEFAULT_STAGES = [
  'Fundação',
  'Estrutura',
  'Alvenaria',
  'Cobertura',
  'Reboco',
  'Contrapiso',
  'Piso',
  'Portas e janelas',
];

export const EXTRA_SERVICES = [
  'Limpeza pós-obra',
  'Paisagismo',
  'Instalação elétrica',
  'Hidráulica',
  'Pintura',
  'Solveragem',
  'Marmoraria',
  'Vidraçaria',
  'Serralheria',
];

export const PROFESSIONS = ['Pedreiro', 'Mestre de obra', 'Empreiteiro', 'Outro'];

export const PAYMENT_CATEGORIES = [
  { value: 'sinal', label: 'Sinal' },
  { value: 'etapa', label: 'Pagamento por etapa' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'final', label: 'Pagamento final' },
  { value: 'outro', label: 'Outro' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'material', label: 'Material' },
  { value: 'mao_de_obra', label: 'Mão de obra' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'ferramenta', label: 'Ferramenta' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'outro', label: 'Outro' },
];

export const STAGE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
};

export const STAGE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  paused: 'Pausado',
};

export const EXECUTION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_progress: { label: 'Em andamento', color: 'text-blue-700 bg-blue-50' },
  completed: { label: 'Concluído', color: 'text-emerald-700 bg-emerald-50' },
  paused: { label: 'Pausado', color: 'text-amber-700 bg-amber-50' },
  cancelled: { label: 'Cancelado', color: 'text-red-700 bg-red-50' },
};

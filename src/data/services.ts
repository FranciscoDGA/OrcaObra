import type { Service, ServiceCategory, ServiceField } from '../lib/types';

function numberField(
  id: string,
  label: string,
  target: ServiceField['target'],
  opts?: { step?: string; required?: boolean }
): ServiceField {
  return {
    id,
    label,
    target,
    type: 'number',
    step: opts?.step ?? '0.01',
    required: opts?.required ?? true,
  };
}

function yesNo(
  id: string,
  label: string,
  target: ServiceField['target'],
  opts?: { required?: boolean }
): ServiceField {
  return {
    id,
    label,
    target,
    type: 'yesno',
    options: ['Sim', 'Não'],
    required: opts?.required ?? false,
  };
}

function selectField(
  id: string,
  label: string,
  target: ServiceField['target'],
  options: string[],
  opts?: { required?: boolean }
): ServiceField {
  return {
    id,
    label,
    target,
    type: 'select',
    options,
    required: opts?.required ?? false,
  };
}

function quantityField(
  id: string,
  label: string,
  opts?: { step?: string; required?: boolean }
): ServiceField {
  return {
    id,
    label,
    target: 'quantities',
    type: 'number',
    step: opts?.step ?? '1',
    required: opts?.required ?? false,
  };
}

const roomMeasurements: ServiceField[] = [
  numberField('width', 'Largura (m)', 'measurements'),
  numberField('length', 'Comprimento (m)', 'measurements'),
  numberField('height', 'Pé-direito (m)', 'measurements', { required: false }),
];

const roomDetails: ServiceField[] = [
  yesNo('hasDoor', 'Possui porta?', 'options'),
  yesNo('hasWindow', 'Possui janela?', 'options'),
  selectField(
    'windowType',
    'Tipo de janela',
    'options',
    ['Corrediça', 'Basculante', 'Maxim-ar', 'Guilhotina', 'Outra'],
    { required: false }
  ),
  numberField('doorWidth', 'Largura da porta (m)', 'measurements', { required: false }),
  numberField('windowWidth', 'Largura da janela (m)', 'measurements', { required: false }),
  numberField('windowHeight', 'Altura da janela (m)', 'measurements', { required: false }),
];

function room(extraFields?: ServiceField[]): ServiceField[][] {
  return [[...roomMeasurements, ...(extraFields ?? [])], roomDetails];
}

export const CATEGORIES: ServiceCategory[] = [
  { id: 'construcao', name: 'Construção', icon: '🏗️' },
  { id: 'alvenaria', name: 'Alvenaria', icon: '🧱' },
  { id: 'revestimentos', name: 'Revestimentos', icon: '🎨' },
  { id: 'pisos', name: 'Pisos', icon: '🔲' },
  { id: 'fundacao', name: 'Fundação', icon: '🪨' },
  { id: 'cobertura', name: 'Cobertura', icon: '🏠' },
  { id: 'reforma', name: 'Reforma', icon: '🔧' },
  { id: 'personalizado', name: 'Personalizado', icon: '✏️' },
];

export const SERVICES: Service[] = [
  // ── Construção ──────────────────────────────────────────────
  {
    type: 'casa',
    category: 'construcao',
    icon: '🏠',
    geometry: ['floorArea', 'perimeter', 'wallArea', 'volume'],
    steps: [
      [
        numberField('width', 'Largura do terreno (m)', 'measurements'),
        numberField('length', 'Comprimento do terreno (m)', 'measurements'),
        numberField('floorArea', 'Área da construção (m²)', 'measurements'),
        numberField('floors', 'Número de pavimentos', 'measurements', { step: '1' }),
      ],
      [
        selectField('floorType', 'Tipo de piso', 'options', ['Cerâmica', 'Porcelanato', 'Madeira', 'Concreto', 'Terracota']),
        selectField('wallType', 'Tipo de parede', 'options', ['Alvenaria bloco 14cm', 'Alvenaria bloco 19cm', 'Alvenaria tijolo', 'Drywall']),
        yesNo('hasBasement', 'Possui porão/subsolo?', 'options'),
        yesNo('hasGarage', 'Possui garagem?', 'options'),
        yesNo('hasBalcony', 'Possui varanda?', 'options'),
      ],
      [
        numberField('height', 'Pé-direito (m)', 'measurements', { step: '0.10' }),
        numberField('wallHeight', 'Altura das paredes internas (m)', 'measurements', { step: '0.10', required: false }),
        numberField('externalWallHeight', 'Altura das paredes externas (m)', 'measurements', { step: '0.10', required: false }),
      ],
    ],
  },
  {
    type: 'quarto',
    category: 'construcao',
    icon: '🛏️',
    geometry: ['floorArea', 'perimeter', 'wallArea'],
    steps: room(),
  },
  {
    type: 'banheiro',
    category: 'construcao',
    icon: '🚿',
    geometry: ['floorArea', 'perimeter', 'wallArea'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        numberField('height', 'Pé-direito (m)', 'measurements'),
      ],
      [
        yesNo('hasDoor', 'Possui porta?', 'options'),
        yesNo('hasWindow', 'Possui janela?', 'options'),
        yesNo('hasShower', 'Possui box de vidro?', 'options'),
        yesNo('hasToilet', 'Possui vaso sanitário?', 'options'),
        yesNo('hasSink', 'Possui lavatório?', 'options'),
        selectField('wallTileHeight', 'Altura do revestimento cerâmico', 'options', ['Até 1.50m', 'Até 2.00m', 'Até teto']),
      ],
    ],
  },
  {
    type: 'cozinha',
    category: 'construcao',
    icon: '🍳',
    geometry: ['floorArea', 'perimeter', 'wallArea'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        numberField('height', 'Pé-direito (m)', 'measurements'),
      ],
      [
        yesNo('hasDoor', 'Possui porta?', 'options'),
        yesNo('hasWindow', 'Possui janela?', 'options'),
        selectField('wallTileHeight', 'Altura do revestimento cerâmico', 'options', ['Até 1.50m', 'Até teto']),
        yesNo('hasCountertop', 'Possui bancada?', 'options'),
      ],
    ],
  },
  {
    type: 'sala',
    category: 'construcao',
    icon: '🛋️',
    geometry: ['floorArea', 'perimeter', 'wallArea'],
    steps: room(),
  },
  {
    type: 'edicula',
    category: 'construcao',
    icon: '🏘️',
    geometry: ['floorArea', 'perimeter', 'wallArea', 'volume'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        numberField('height', 'Pé-direito (m)', 'measurements'),
        numberField('floorArea', 'Área total (m²)', 'measurements', { required: false }),
      ],
      [
        selectField('edículaType', 'Tipo', 'options', ['Completa', 'Sala + Banheiro', 'Sala + Quarto', 'Apenas sala', 'Outro']),
        yesNo('hasKitchen', 'Possui cozinha?', 'options'),
        yesNo('hasBathroom', 'Possui banheiro?', 'options'),
        selectField('wallType', 'Tipo de parede', 'options', ['Alvenaria bloco 14cm', 'Alvenaria bloco 19cm', 'Drywall']),
      ],
    ],
  },
  {
    type: 'garagem',
    category: 'construcao',
    icon: '🚗',
    geometry: ['floorArea', 'perimeter', 'wallArea'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        numberField('height', 'Pé-direito (m)', 'measurements'),
      ],
      [
        selectField('vehicleCount', 'Número de veículos', 'options', ['1', '2', '3']),
        yesNo('hasRoof', 'Possui cobertura?', 'options'),
        yesNo('hasWall', 'Possui paredes laterais?', 'options'),
        selectField('floorType', 'Tipo de piso', 'options', ['Concreto', 'Cerâmica', 'Asfáltico']),
      ],
    ],
  },

  // ── Alvenaria ───────────────────────────────────────────────
  {
    type: 'parede',
    category: 'alvenaria',
    icon: '🧱',
    geometry: ['wallArea', 'linearMeters'],
    steps: [
      [
        numberField('length', 'Comprimento da parede (m)', 'measurements'),
        numberField('height', 'Altura da parede (m)', 'measurements'),
        selectField('thickness', 'Espessura', 'options', ['9cm', '14cm', '19cm', '29cm']),
      ],
      [
        yesNo('hasDoor', 'Possui abertura para porta?', 'options'),
        yesNo('hasWindow', 'Possui abertura para janela?', 'options'),
        numberField('doorCount', 'Quantidade de portas', 'measurements', { step: '1', required: false }),
        numberField('windowCount', 'Quantidade de janelas', 'measurements', { step: '1', required: false }),
      ],
    ],
  },
  {
    type: 'muro',
    category: 'alvenaria',
    icon: '🧱',
    geometry: ['wallArea', 'linearMeters'],
    steps: [
      [
        numberField('length', 'Comprimento do muro (m)', 'measurements'),
        numberField('height', 'Altura do muro (m)', 'measurements'),
        selectField('thickness', 'Espessura', 'options', ['9cm', '14cm', '19cm']),
      ],
      [
        yesNo('hasBase', 'Possui sapata/baldrame?', 'options'),
        selectField('finish', 'Acabamento', 'options', ['Sem acabamento', 'Reboco', 'Chapisco + Emboço', 'Reboco + Pintura']),
      ],
    ],
  },
  {
    type: 'levantamento_comodo',
    category: 'alvenaria',
    icon: '📐',
    geometry: ['floorArea', 'wallArea'],
    steps: [
      [
        numberField('width', 'Largura do cômodo (m)', 'measurements'),
        numberField('length', 'Comprimento do cômodo (m)', 'measurements'),
        numberField('height', 'Pé-direito (m)', 'measurements'),
        selectField('blockType', 'Tipo de bloco', 'options', ['Bloco 14cm', 'Bloco 19cm', 'Tijolo cerâmico', 'Tijolo concreto']),
      ],
    ],
  },

  // ── Revestimentos ───────────────────────────────────────────
  {
    type: 'reboco_interno',
    category: 'revestimentos',
    icon: '🎨',
    geometry: ['wallArea'],
    steps: [
      [
        numberField('wallArea', 'Área das paredes (m²)', 'measurements'),
        numberField('height', 'Pé-direito (m)', 'measurements', { required: false }),
      ],
      [
        selectField('wallType', 'Tipo de superfície', 'options', ['Alvenaria', 'Concreto', 'Drywall']),
        yesNo('hasChapisco', 'Já possui chapisco?', 'options'),
      ],
    ],
  },
  {
    type: 'reboco_externo',
    category: 'revestimentos',
    icon: '🎨',
    geometry: ['wallArea'],
    steps: [
      [
        numberField('wallArea', 'Área da fachada (m²)', 'measurements'),
        numberField('height', 'Altura da fachada (m)', 'measurements'),
        numberField('perimeter', 'Perímetro (m)', 'measurements', { required: false }),
      ],
      [
        selectField('wallType', 'Tipo de superfície', 'options', ['Alvenaria', 'Concreto']),
        selectField('scaffoldNeeded', 'Necessita andaime?', 'options', ['Sim', 'Não']),
      ],
    ],
  },
  {
    type: 'chapisco',
    category: 'revestimentos',
    icon: '🎨',
    geometry: ['wallArea'],
    steps: [
      [
        numberField('wallArea', 'Área a ser chapiscada (m²)', 'measurements'),
      ],
      [
        selectField('surfaceType', 'Tipo de superfície', 'options', ['Alvenaria', 'Concreto', 'Argamassa antiga']),
        selectField('chapiscoType', 'Tipo de chapisco', 'options', ['Rock-on', 'Tradicional', 'Acrílico']),
      ],
    ],
  },
  {
    type: 'emboco',
    category: 'revestimentos',
    icon: '🎨',
    geometry: ['wallArea'],
    steps: [
      [
        numberField('wallArea', 'Área do emboço (m²)', 'measurements'),
        numberField('thickness', 'Espessura (cm)', 'measurements', { step: '0.5' }),
      ],
      [
        selectField('surfaceType', 'Tipo de superfície', 'options', ['Alvenaria', 'Concreto']),
        yesNo('hasChapisco', 'Já possui chapisco?', 'options'),
      ],
    ],
  },

  // ── Pisos ───────────────────────────────────────────────────
  {
    type: 'contrapiso',
    category: 'pisos',
    icon: '🔲',
    geometry: ['floorArea'],
    steps: [
      [
        numberField('floorArea', 'Área do contrapiso (m²)', 'measurements'),
        numberField('thickness', 'Espessura (cm)', 'measurements', { step: '0.5' }),
      ],
      [
        selectField('surfaceType', 'Tipo de superfície', 'options', ['Laje', 'Solo', 'Contrapiso antigo']),
        yesNo('hasWaterproofing', 'Necessita impermeabilização?', 'options'),
      ],
    ],
  },
  {
    type: 'piso_grosso',
    category: 'pisos',
    icon: '🔲',
    geometry: ['floorArea'],
    steps: [
      [
        numberField('floorArea', 'Área do piso grosso (m²)', 'measurements'),
        numberField('thickness', 'Espessura (cm)', 'measurements', { step: '0.5' }),
      ],
      [
        selectField('surfaceType', 'Tipo de superfície', 'options', ['Contrapiso', 'Solo', 'Laje']),
      ],
    ],
  },
  {
    type: 'assentamento_piso',
    category: 'pisos',
    icon: '🔲',
    geometry: ['floorArea'],
    steps: [
      [
        numberField('floorArea', 'Área do piso (m²)', 'measurements'),
        selectField('tileType', 'Tipo de piso', 'options', ['Cerâmica', 'Porcelanato', 'Cimento queimado', 'Madeira', 'Vinílico']),
        numberField('tileWidth', 'Largura da peça (cm)', 'measurements', { step: '1', required: false }),
        numberField('tileLength', 'Comprimento da peça (cm)', 'measurements', { step: '1', required: false }),
      ],
      [
        yesNo('needsCutting', 'Necessita cortes especiais?', 'options'),
        yesNo('hasPattern', 'Possui desenho/mosaico?', 'options'),
        selectField('baseType', 'Tipo de base', 'options', ['Contrapiso', 'Piso grosso', 'Laje']),
      ],
    ],
  },
  {
    type: 'calcada',
    category: 'pisos',
    icon: '🚶',
    geometry: ['floorArea', 'linearMeters'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
      ],
      [
        selectField('material', 'Material', 'options', ['Concreto', 'Pedra', 'Cerâmica', 'Brita']),
        yesNo('hasBase', 'Possui base/baldrames?', 'options'),
        selectField('finish', 'Acabamento', 'options', ['Liso', 'Escorregadio', 'Projetado']),
      ],
    ],
  },

  // ── Fundação ────────────────────────────────────────────────
  {
    type: 'radier',
    category: 'fundacao',
    icon: '🪨',
    geometry: ['floorArea', 'volume'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        numberField('thickness', 'Espessura (m)', 'measurements', { step: '0.05' }),
      ],
      [
        selectField('concreteClass', 'Classe do concreto', 'options', ['C15', 'C20', 'C25', 'C30']),
        yesNo('hasMesh', 'Possui malha de aço?', 'options'),
        selectField('baseType', 'Tipo de base', 'options', ['Solo compactado', 'Brita', 'Concreto magro']),
      ],
    ],
  },
  {
    type: 'sapata',
    category: 'fundacao',
    icon: '🪨',
    geometry: ['floorArea', 'volume', 'linearMeters'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        numberField('height', 'Altura (m)', 'measurements'),
        numberField('quantity', 'Quantidade', 'measurements', { step: '1' }),
      ],
      [
        selectField('concreteClass', 'Classe do concreto', 'options', ['C15', 'C20', 'C25', 'C30']),
        yesNo('hasReinforcement', 'Possui armadura?', 'options'),
      ],
    ],
  },
  {
    type: 'baldrame',
    category: 'fundacao',
    icon: '🪨',
    geometry: ['linearMeters', 'volume'],
    steps: [
      [
        numberField('length', 'Comprimento total (m)', 'measurements'),
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('height', 'Altura (m)', 'measurements'),
      ],
      [
        selectField('concreteClass', 'Classe do concreto', 'options', ['C15', 'C20', 'C25', 'C30']),
        yesNo('hasReinforcement', 'Possui armadura?', 'options'),
        selectField('groundType', 'Tipo de solo', 'options', ['Firme', 'Mole', 'Argiloso', 'Arenoso']),
      ],
    ],
  },

  // ── Cobertura ───────────────────────────────────────────────
  {
    type: 'telhado',
    category: 'cobertura',
    icon: '🏠',
    geometry: ['floorArea'],
    steps: [
      [
        numberField('width', 'Largura da cobertura (m)', 'measurements'),
        numberField('length', 'Comprimento da cobertura (m)', 'measurements'),
        selectField('roofType', 'Tipo de telha', 'options', ['Cerâmica', 'Fibrocimento', 'Metálica', 'Concreto', 'Shingle']),
      ],
      [
        selectField('slope', 'Inclinação', 'options', ['10%', '15%', '20%', '30%', '45%']),
        yesNo('hasGutter', 'Possui calhas?', 'options'),
        yesNo('hasDownspout', 'Possui condutores?', 'options'),
        numberField('overhang', 'Beiral (m)', 'measurements', { step: '0.10', required: false }),
      ],
    ],
  },
  {
    type: 'estrutura_cobertura',
    category: 'cobertura',
    icon: '🏠',
    geometry: ['floorArea', 'linearMeters'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        selectField('structureType', 'Tipo de estrutura', 'options', ['Madeira', 'Metallica', 'Concreto armado']),
      ],
      [
        selectField('woodType', 'Tipo de madeira', 'options', ['Pinus', 'Eucalipto', 'Peroba', 'Cumaru'], { required: false }),
        numberField('beamSpacing', 'Distância entre terças (m)', 'measurements', { step: '0.10', required: false }),
        yesNo('hasInsulation', 'Possui isolamento?', 'options'),
      ],
    ],
  },
  {
    type: 'cobertura_completa',
    category: 'cobertura',
    icon: '🏠',
    geometry: ['floorArea'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        selectField('roofType', 'Tipo de telha', 'options', ['Cerâmica', 'Fibrocimento', 'Metálica', 'Concreto', 'Shingle']),
        selectField('structureType', 'Estrutura', 'options', ['Madeira', 'Metallica', 'Concreto armado']),
      ],
      [
        selectField('slope', 'Inclinação', 'options', ['10%', '15%', '20%', '30%', '45%']),
        yesNo('hasGutter', 'Possui calhas?', 'options'),
        yesNo('hasDownspout', 'Possui condutores?', 'options'),
        numberField('overhang', 'Beiral (m)', 'measurements', { step: '0.10', required: false }),
        yesNo('hasInsulation', 'Possui isolamento?', 'options'),
      ],
    ],
  },

  // ── Reforma ─────────────────────────────────────────────────
  {
    type: 'reforma_banheiro',
    category: 'reforma',
    icon: '🔧',
    geometry: ['floorArea', 'wallArea'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        numberField('height', 'Pé-direito (m)', 'measurements'),
      ],
      [
        yesNo('removeTile', 'Retirar azulejos?', 'options'),
        yesNo('removeFloor', 'Retirar piso?', 'options'),
        yesNo('replacePlumbing', 'Trocar hidráulica?', 'options'),
        yesNo('replaceElectrical', 'Trocar elétrica?', 'options'),
        selectField('wallTileHeight', 'Altura do novo revestimento', 'options', ['Até 1.50m', 'Até 2.00m', 'Até teto']),
        yesNo('installShower', 'Instalar box de vidro?', 'options'),
        yesNo('installSink', 'Instalar lavatório?', 'options'),
        yesNo('installToilet', 'Instalar vaso sanitário?', 'options'),
      ],
    ],
  },
  {
    type: 'reforma_cozinha',
    category: 'reforma',
    icon: '🔧',
    geometry: ['floorArea', 'wallArea'],
    steps: [
      [
        numberField('width', 'Largura (m)', 'measurements'),
        numberField('length', 'Comprimento (m)', 'measurements'),
        numberField('height', 'Pé-direito (m)', 'measurements'),
      ],
      [
        yesNo('removeTile', 'Retirar azulejos?', 'options'),
        yesNo('removeFloor', 'Retirar piso?', 'options'),
        yesNo('replacePlumbing', 'Trocar hidráulica?', 'options'),
        yesNo('replaceElectrical', 'Trocar elétrica?', 'options'),
        yesNo('installCountertop', 'Instalar bancada?', 'options'),
        selectField('wallTileHeight', 'Altura do revestimento cerâmico', 'options', ['Até 1.50m', 'Até teto']),
      ],
    ],
  },
  {
    type: 'demolicao',
    category: 'reforma',
    icon: '🔧',
    geometry: ['floorArea', 'wallArea', 'volume'],
    steps: [
      [
        selectField('demolitionType', 'Tipo de demolição', 'options', ['Parede', 'Piso', 'Cobertura', 'Edificação completa']),
        numberField('area', 'Área (m²)', 'measurements'),
      ],
      [
        yesNo('hasStructuralWall', 'Envolve paredes estruturais?', 'options'),
        yesNo('needsDisposal', 'Necessita remoção de entulho?', 'options'),
        yesNo('hasElectrical', 'Possui instalações elétricas para desligar?', 'options'),
        yesNo('hasPlumbing', 'Possui instalações hidráulicas para desligar?', 'options'),
      ],
    ],
  },
  {
    type: 'retirada_piso',
    category: 'reforma',
    icon: '🔧',
    geometry: ['floorArea'],
    steps: [
      [
        numberField('floorArea', 'Área do piso (m²)', 'measurements'),
        selectField('floorType', 'Tipo de piso', 'options', ['Cerâmica', 'Porcelanato', 'Concreto', 'Madeira', 'Vinílico']),
      ],
      [
        yesNo('needsDisposal', 'Necessita remoção de entulho?', 'options'),
        yesNo('removeBase', 'Retirar rodapé/baldrames?', 'options'),
      ],
    ],
  },

  // ── Personalizado ───────────────────────────────────────────
  {
    type: 'outro',
    category: 'personalizado',
    icon: '✏️',
    geometry: ['floorArea', 'wallArea', 'volume'],
    custom: true,
    steps: [
      [
        numberField('area', 'Área estimada (m²)', 'measurements', { required: false }),
        numberField('height', 'Altura (m)', 'measurements', { step: '0.10', required: false }),
        numberField('length', 'Comprimento (m)', 'measurements', { required: false }),
      ],
      [
        quantityField('quantity1', 'Quantidade item 1', { required: false }),
        quantityField('quantity2', 'Quantidade item 2', { required: false }),
        quantityField('quantity3', 'Quantidade item 3', { required: false }),
      ],
    ],
  },
];

export function categories(): ServiceCategory[] {
  return CATEGORIES;
}

export function servicesForCategory(categoryId: string): Service[] {
  return SERVICES.filter((s) => s.category === categoryId);
}

export function findService(type: string): Service | undefined {
  return SERVICES.find((s) => s.type === type);
}

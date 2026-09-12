import type { ParseResult } from './types';

export function numberFrom(value: unknown): number | null {
  if (typeof value === 'number') return isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(',', '.'));
    return isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function matchNumber(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  if (!match || !match[1]) return null;
  return numberFrom(match[1]);
}

export function parseNaturalDescription(raw: string): ParseResult {
  const normalized = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const measurements = {
    width: null as number | null,
    length: null as number | null,
    height: null as number | null,
  };

  const widthPatterns = [
    /larg[uo]r?\s*(?:de\s*)?(\d+[\.,]?\d*)/,
    /l\s*[=:x]\s*(\d+[\.,]?\d*)/,
    /(\d+[\.,]?\d*)\s*m?\s*(?:de\s*)?larg/,
    /w\s*[=:]\s*(\d+[\.,]?\d*)/,
  ];
  for (const p of widthPatterns) {
    const v = matchNumber(normalized, p);
    if (v !== null) { measurements.width = v; break; }
  }

  const lengthPatterns = [
    /comprimento\s*(?:de\s*)?(\d+[\.,]?\d*)/,
    /c\s*[=:x]\s*(\d+[\.,]?\d*)/,
    /(\d+[\.,]?\d*)\s*m?\s*(?:de\s*)?comp/,
    /l\s*[=:]\s*(\d+[\.,]?\d*)/,
  ];
  for (const p of lengthPatterns) {
    const v = matchNumber(normalized, p);
    if (v !== null && measurements.length === null) {
      measurements.length = v;
      break;
    }
  }

  const heightPatterns = [
    /altura\s*(?:de\s*)?(\d+[\.,]?\d*)/,
    /h\s*[=:x]\s*(\d+[\.,]?\d*)/,
    /(\d+[\.,]?\d*)\s*m?\s*(?:de\s*)?alt/,
  ];
  for (const p of heightPatterns) {
    const v = matchNumber(normalized, p);
    if (v !== null) { measurements.height = v; break; }
  }

  const sizePatterns = [
    /(\d+[\.,]?\d*)\s*x\s*(\d+[\.,]?\d*)/,
    /(\d+[\.,]?\d*)\s*por\s*(\d+[\.,]?\d*)/,
  ];
  if (measurements.width === null && measurements.length === null) {
    for (const p of sizePatterns) {
      const match = normalized.match(p);
      if (match) {
        measurements.width = numberFrom(match[1]);
        measurements.length = numberFrom(match[2]);
        break;
      }
    }
  }

  const servicePatterns: [RegExp, string][] = [
    [/pint/, 'Pintura'],
    [/azulej/, 'Revestimento'],
    [/pis[oa]/, 'Piso'],
    [/telhad/, 'Telhado'],
    [/eletric/, 'Elétrica'],
    [/hidraul/, 'Hidráulica'],
    [/marcen/, 'Marcenaria'],
    [/serralh/, 'Serralheria'],
    [/jardin/, 'Jardinagem'],
    [/limpeza/, 'Limpeza'],
    [/gesso/, 'Gesso'],
    [/drywal/, 'Drywall'],
    [/porcelanat/, 'Porcelanato'],
    [/laminad/, 'Laminado'],
  ];

  const services: string[] = [];
  for (const [pattern, name] of servicePatterns) {
    if (pattern.test(normalized)) {
      services.push(name);
    }
  }

  let serviceType = 'geral';
  if (services.length > 0) {
    serviceType = services[0].toLowerCase();
  } else {
    const typeMap: [RegExp, string][] = [
      [/reform/, 'reforma'],
      [/constru/, 'construcao'],
      [/manuten/, 'manutencao'],
      [/acabamento/, 'acabamento'],
    ];
    for (const [p, t] of typeMap) {
      if (p.test(normalized)) { serviceType = t; break; }
    }
  }

  const area =
    measurements.width !== null && measurements.length !== null
      ? measurements.width * measurements.length
      : null;

  const missingInformation: string[] = [];
  if (measurements.width === null) missingInformation.push('largura');
  if (measurements.length === null) missingInformation.push('comprimento');
  if (services.length === 0) missingInformation.push('tipo de serviço');

  const confidence =
    missingInformation.length === 0 ? 'alta'
    : missingInformation.length <= 2 ? 'media'
    : 'baixa';

  return {
    rawDescription: raw,
    parsedData: {
      serviceType,
      measurements,
      options: {},
      services,
      area,
    },
    missingInformation,
    confidence,
  };
}

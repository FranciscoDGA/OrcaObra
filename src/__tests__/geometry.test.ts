import { describe, it, expect } from 'vitest';
import {
  round2,
  valid,
  calculateArea,
  calculatePerimeter,
  calculateWallArea,
  calculateVolume,
  calculateForService,
} from '../lib/geometry';

describe('round2', () => {
  it('arredonda para 2 casas decimais (comportamento float)', () => {
    // NOTA: 1.005 arredonda para 1.0 devido a precisão de ponto flutuante do JS
    // Math.round(1.005 * 100) / 100 = 1.00 (não 1.01)
    expect(round2(1.005)).toBe(1.0);
    expect(round2(1.004)).toBe(1.0);
    expect(round2(2.1)).toBe(2.1);
  });

  it('trata negativos (comportamento float)', () => {
    // Mesmo comportamento para negativos
    expect(round2(-1.005)).toBe(-1.0);
    expect(round2(-1.004)).toBe(-1.0);
  });

  it('trata zero', () => {
    expect(round2(0)).toBe(0);
  });

  it('trata números inteiros', () => {
    expect(round2(5)).toBe(5);
    expect(round2(100)).toBe(100);
  });

  it('trata números grandes', () => {
    expect(round2(99999.999)).toBe(100000);
  });
});

describe('valid', () => {
  it('retorna true para números finitos', () => {
    expect(valid(0)).toBe(true);
    expect(valid(5)).toBe(true);
    expect(valid(-3.14)).toBe(true);
    expect(valid(0.001)).toBe(true);
  });

  it('retorna false para null', () => {
    expect(valid(null)).toBe(false);
  });

  it('retorna false para undefined', () => {
    expect(valid(undefined)).toBe(false);
  });

  it('retorna false para NaN', () => {
    expect(valid(NaN)).toBe(false);
  });

  it('retorna false para Infinity', () => {
    expect(valid(Infinity)).toBe(false);
    expect(valid(-Infinity)).toBe(false);
  });
});

describe('calculateArea', () => {
  it('calcula área retangular', () => {
    expect(calculateArea(4, 5)).toBe(20);
  });

  it('trata dimensões decimais', () => {
    expect(calculateArea(3.5, 2.5)).toBe(8.75);
  });

  it('trata dimensão zero', () => {
    expect(calculateArea(0, 5)).toBe(0);
    expect(calculateArea(4, 0)).toBe(0);
  });

  it('trata dimensão 1x1', () => {
    expect(calculateArea(1, 1)).toBe(1);
  });

  it('trata valores grandes', () => {
    expect(calculateArea(100, 100)).toBe(10000);
  });

  it('arredonda resultado', () => {
    expect(calculateArea(1.1, 1.1)).toBe(1.21);
    expect(calculateArea(0.3, 0.3)).toBe(0.09);
  });
});

describe('calculatePerimeter', () => {
  it('calcula perímetro retangular', () => {
    expect(calculatePerimeter(4, 5)).toBe(18);
  });

  it('trata dimensões decimais', () => {
    expect(calculatePerimeter(3.5, 2.5)).toBe(12);
  });

  it('trata dimensão zero', () => {
    expect(calculatePerimeter(0, 5)).toBe(10);
    expect(calculatePerimeter(4, 0)).toBe(8);
  });

  it('quadrado 5x5', () => {
    expect(calculatePerimeter(5, 5)).toBe(20);
  });

  it('arredonda resultado', () => {
    expect(calculatePerimeter(1.1, 1.1)).toBe(4.4);
  });
});

describe('calculateWallArea', () => {
  it('calcula área de parede', () => {
    expect(calculateWallArea(18, 2.8)).toBe(50.4);
  });

  it('trata perímetro zero', () => {
    expect(calculateWallArea(0, 2.8)).toBe(0);
  });

  it('trata altura zero', () => {
    expect(calculateWallArea(18, 0)).toBe(0);
  });

  it('trata valores decimais', () => {
    expect(calculateWallArea(12.5, 3.2)).toBe(40);
  });

  it('arredonda resultado', () => {
    expect(calculateWallArea(10, 1.33)).toBe(13.3);
  });
});

describe('calculateVolume', () => {
  it('calcula volume', () => {
    expect(calculateVolume(4, 5, 2.8)).toBe(56);
  });

  it('trata dimensões decimais', () => {
    expect(calculateVolume(3.5, 2.5, 2.4)).toBe(21);
  });

  it('trata dimensão zero', () => {
    expect(calculateVolume(0, 5, 2.8)).toBe(0);
    expect(calculateVolume(4, 0, 2.8)).toBe(0);
    expect(calculateVolume(4, 5, 0)).toBe(0);
  });

  it('cubo 3x3x3', () => {
    expect(calculateVolume(3, 3, 3)).toBe(27);
  });

  it('arredonda resultado', () => {
    expect(calculateVolume(1.1, 1.1, 1.1)).toBe(1.33);
  });
});

describe('calculateForService', () => {
  const measurements = { width: 4, length: 5, height: 2.8 };

  it('calcula area quando geometry inclui area', () => {
    const result = calculateForService(measurements, ['area']);
    expect(result.floorArea).toBe(20);
  });

  it('calcula perimeter quando geometry inclui perimeter', () => {
    const result = calculateForService(measurements, ['perimeter']);
    expect(result.perimeter).toBe(18);
  });

  it('calcula wallArea quando geometry inclui wallArea E perimeter', () => {
    // wallArea depende de perimeter estar na geometry
    const result = calculateForService(measurements, ['wallArea', 'perimeter']);
    expect(result.wallArea).toBe(50.4);
  });

  it('wallArea é null quando geometry não inclui perimeter', () => {
    // COMPORTAMENTO: wallArea precisa que perimeter seja calculado
    const result = calculateForService(measurements, ['wallArea']);
    expect(result.wallArea).toBeNull();
  });

  it('calcula volume quando geometry inclui volume', () => {
    const result = calculateForService(measurements, ['volume']);
    expect(result.volume).toBe(56);
  });

  it('calcula linear quando geometry inclui linear', () => {
    const result = calculateForService(measurements, ['linear']);
    expect(result.linearMeters).toBe(5);
  });

  it('calcula múltiplas geometrias', () => {
    const result = calculateForService(measurements, ['area', 'perimeter', 'wallArea', 'volume']);
    expect(result.floorArea).toBe(20);
    expect(result.perimeter).toBe(18);
    expect(result.wallArea).toBe(50.4);
    expect(result.volume).toBe(56);
  });

  it('retorna null para campos não solicitados', () => {
    const result = calculateForService(measurements, ['area']);
    expect(result.perimeter).toBeNull();
    expect(result.wallArea).toBeNull();
    expect(result.volume).toBeNull();
    expect(result.linearMeters).toBeNull();
  });

  it('retorna null quando width falta', () => {
    const incomplete = { width: null, length: 5, height: 2.8 };
    const result = calculateForService(incomplete, ['area', 'perimeter', 'wallArea', 'volume']);
    expect(result.floorArea).toBeNull();
    expect(result.perimeter).toBeNull();
    expect(result.wallArea).toBeNull();
    expect(result.volume).toBeNull();
  });

  it('retorna null quando length falta', () => {
    const incomplete = { width: 4, length: null, height: 2.8 };
    const result = calculateForService(incomplete, ['area', 'perimeter', 'wallArea', 'volume']);
    expect(result.floorArea).toBeNull();
    expect(result.perimeter).toBeNull();
    expect(result.wallArea).toBeNull();
    expect(result.volume).toBeNull();
  });

  it('retorna null quando height falta para wallArea', () => {
    const incomplete = { width: 4, length: 5, height: null };
    const result = calculateForService(incomplete, ['wallArea']);
    expect(result.wallArea).toBeNull();
  });

  it('retorna null quando height falta para volume', () => {
    const incomplete = { width: 4, length: 5, height: null };
    const result = calculateForService(incomplete, ['volume']);
    expect(result.volume).toBeNull();
  });

  it('trata measurements vazios', () => {
    const result = calculateForService({}, ['area', 'perimeter', 'wallArea', 'volume', 'linear']);
    expect(result.floorArea).toBeNull();
    expect(result.perimeter).toBeNull();
    expect(result.wallArea).toBeNull();
    expect(result.volume).toBeNull();
    expect(result.linearMeters).toBeNull();
  });

  it('trata geometry array vazio', () => {
    const result = calculateForService(measurements, []);
    expect(result.floorArea).toBeNull();
    expect(result.perimeter).toBeNull();
    expect(result.wallArea).toBeNull();
    expect(result.volume).toBeNull();
    expect(result.linearMeters).toBeNull();
  });

  it('wallArea depende de perimeter calculado', () => {
    // wallArea só é calculado quando perimeter está na geometry
    const result = calculateForService(measurements, ['wallArea', 'perimeter']);
    expect(result.wallArea).toBe(50.4);
  });

  it('wallArea é null se perimeter não está na geometry', () => {
    // COMPORTAMENTO: sem perimeter na geometry, wallArea é null
    const result = calculateForService(measurements, ['wallArea']);
    expect(result.wallArea).toBeNull();
  });

  it('linear usa length quando disponível', () => {
    const result = calculateForService({ width: 3, length: 7, height: 2.5 }, ['linear']);
    expect(result.linearMeters).toBe(7);
  });

  it('linear é null quando length é null', () => {
    const result = calculateForService({ width: 3, length: null, height: 2.5 }, ['linear']);
    expect(result.linearMeters).toBeNull();
  });
});

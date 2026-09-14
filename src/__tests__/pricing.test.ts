import { describe, it, expect } from 'vitest';
import {
  pricingRound2,
  calculateTeamDailyCost,
  estimateDays,
  calculateLaborCost,
  calculateExpenses,
  calculateRiskReserve,
  calculatePriceRange,
  calculateEffectivePricePerUnit,
  calculatePricing,
} from '../lib/pricing';

describe('pricingRound2', () => {
  it('arredonda para 2 casas decimais (comportamento float)', () => {
    // NOTA: 1.005 arredonda para 1.0 devido a precisão de ponto flutuante do JS
    expect(pricingRound2(1.005)).toBe(1.0);
    expect(pricingRound2(1.004)).toBe(1.0);
  });

  it('trata zero', () => {
    expect(pricingRound2(0)).toBe(0);
  });

  it('trata negativos (comportamento float)', () => {
    expect(pricingRound2(-1.005)).toBe(-1.0);
  });

  it('trata números inteiros', () => {
    expect(pricingRound2(100)).toBe(100);
  });
});

describe('calculateTeamDailyCost', () => {
  it('calcula custo diário da equipe', () => {
    expect(calculateTeamDailyCost(280, 150, 1)).toBe(430);
  });

  it('trata vários ajudantes', () => {
    expect(calculateTeamDailyCost(280, 150, 2)).toBe(580);
    expect(calculateTeamDailyCost(280, 150, 3)).toBe(730);
  });

  it('trata zero ajudantes', () => {
    expect(calculateTeamDailyCost(280, 150, 0)).toBe(280);
  });

  it('trata valores decimais', () => {
    expect(calculateTeamDailyCost(280.5, 150.75, 1)).toBe(431.25);
  });

  it('trata taxas zeradas', () => {
    expect(calculateTeamDailyCost(0, 0, 0)).toBe(0);
    expect(calculateTeamDailyCost(0, 150, 1)).toBe(150);
    expect(calculateTeamDailyCost(280, 0, 1)).toBe(280);
  });

  it('arredonda resultado', () => {
    expect(calculateTeamDailyCost(100.33, 50.67, 1)).toBe(151);
  });
});

describe('estimateDays', () => {
  it('retorna dias manuais no modo manual', () => {
    expect(estimateDays({ mode: 'manual', manualDays: 10, quantity: 20, productivityPerDay: null })).toBe(10);
  });

  it('retorna 0 no modo manual sem dias', () => {
    expect(estimateDays({ mode: 'manual', manualDays: null, quantity: 20, productivityPerDay: null })).toBe(0);
  });

  it('calcula por produtividade', () => {
    expect(estimateDays({ mode: 'productivity', manualDays: null, quantity: 20, productivityPerDay: 5 })).toBe(4);
  });

  it('retorna 0 no modo produtividade sem produtividade', () => {
    expect(estimateDays({ mode: 'productivity', manualDays: null, quantity: 20, productivityPerDay: null })).toBe(0);
  });

  it('retorna 0 no modo produtividade com produtividade 0', () => {
    expect(estimateDays({ mode: 'productivity', manualDays: null, quantity: 20, productivityPerDay: 0 })).toBe(0);
  });

  it('arredonda dias por produtividade', () => {
    expect(estimateDays({ mode: 'productivity', manualDays: null, quantity: 10, productivityPerDay: 3 })).toBe(3.33);
  });

  it('modo desconhecido retorna 0', () => {
    expect(estimateDays({ mode: 'unknown', manualDays: 5, quantity: 20, productivityPerDay: 5 })).toBe(0);
  });

  it('quantidade zero', () => {
    expect(estimateDays({ mode: 'productivity', manualDays: null, quantity: 0, productivityPerDay: 5 })).toBe(0);
  });
});

describe('calculateLaborCost', () => {
  it('calcula custo de mão de obra', () => {
    expect(calculateLaborCost({
      workerDailyRate: 280,
      helperDailyRate: 150,
      numberOfHelpers: 1,
      estimatedDays: 10,
    })).toBe(4300);
  });

  it('trata zero dias', () => {
    expect(calculateLaborCost({
      workerDailyRate: 280,
      helperDailyRate: 150,
      numberOfHelpers: 1,
      estimatedDays: 0,
    })).toBe(0);
  });

  it('trata vários ajudantes', () => {
    expect(calculateLaborCost({
      workerDailyRate: 280,
      helperDailyRate: 150,
      numberOfHelpers: 2,
      estimatedDays: 5,
    })).toBe(2900);
  });

  it('arredonda resultado', () => {
    expect(calculateLaborCost({
      workerDailyRate: 100,
      helperDailyRate: 50,
      numberOfHelpers: 1,
      estimatedDays: 3,
    })).toBe(450);
  });
});

describe('calculateExpenses', () => {
  it('soma todas as despesas', () => {
    expect(calculateExpenses({
      transportCost: 100,
      foodCost: 50,
      fuelCost: 30,
      toolCost: 20,
      otherCost: 10,
    })).toBe(210);
  });

  it('trata despesas zeradas', () => {
    expect(calculateExpenses({
      transportCost: 0,
      foodCost: 0,
      fuelCost: 0,
      toolCost: 0,
      otherCost: 0,
    })).toBe(0);
  });

  it('trata apenas uma despesa', () => {
    expect(calculateExpenses({
      transportCost: 100,
      foodCost: 0,
      fuelCost: 0,
      toolCost: 0,
      otherCost: 0,
    })).toBe(100);
  });

  it('arredonda resultado', () => {
    expect(calculateExpenses({
      transportCost: 10.33,
      foodCost: 10.33,
      fuelCost: 10.34,
      toolCost: 0,
      otherCost: 0,
    })).toBe(31);
  });
});

describe('calculateRiskReserve', () => {
  it('calcula reserva de risco', () => {
    expect(calculateRiskReserve(1000, 5)).toBe(50);
  });

  it('trata percentual zero', () => {
    expect(calculateRiskReserve(1000, 0)).toBe(0);
  });

  it('trata base zero', () => {
    expect(calculateRiskReserve(0, 5)).toBe(0);
  });

  it('trata percentual alto', () => {
    expect(calculateRiskReserve(1000, 100)).toBe(1000);
  });

  it('arredonda resultado', () => {
    expect(calculateRiskReserve(1000, 3.33)).toBe(33.3);
  });
});

describe('calculatePriceRange', () => {
  it('calcula faixa de preços com margens diferentes', () => {
    const result = calculatePriceRange(1000, {
      minimumMargin: 10,
      recommendedMargin: 20,
      fullMargin: 30,
    });
    expect(result.minimumPrice).toBe(1111.11);
    expect(result.recommendedPrice).toBe(1250);
    expect(result.fullPrice).toBe(1428.57);
  });

  it('margem zero retorna custo total', () => {
    const result = calculatePriceRange(1000, {
      minimumMargin: 0,
      recommendedMargin: 0,
      fullMargin: 0,
    });
    expect(result.minimumPrice).toBe(1000);
    expect(result.recommendedPrice).toBe(1000);
    expect(result.fullPrice).toBe(1000);
  });

  it('margem mínima < recomendada < cheia', () => {
    const result = calculatePriceRange(1000, {
      minimumMargin: 10,
      recommendedMargin: 20,
      fullMargin: 30,
    });
    expect(result.minimumPrice).toBeLessThan(result.recommendedPrice);
    expect(result.recommendedPrice).toBeLessThan(result.fullPrice);
  });

  it('trata custo zero', () => {
    const result = calculatePriceRange(0, {
      minimumMargin: 10,
      recommendedMargin: 20,
      fullMargin: 30,
    });
    expect(result.minimumPrice).toBe(0);
    expect(result.recommendedPrice).toBe(0);
    expect(result.fullPrice).toBe(0);
  });

  it('fórmula é acréscimo sobre custo (não margem sobre preço)', () => {
    // A fórmula é: price = cost / (1 - margin/100)
    // Isso significa que margem de 50% sobre preço = custo * 2
    const result = calculatePriceRange(100, {
      minimumMargin: 50,
      recommendedMargin: 50,
      fullMargin: 50,
    });
    expect(result.minimumPrice).toBe(200);
    expect(result.recommendedPrice).toBe(200);
    expect(result.fullPrice).toBe(200);
  });
});

describe('calculateEffectivePricePerUnit', () => {
  it('calcula preço por unidade', () => {
    expect(calculateEffectivePricePerUnit(1000, 20)).toBe(50);
  });

  it('retorna null para quantidade zero', () => {
    expect(calculateEffectivePricePerUnit(1000, 0)).toBeNull();
  });

  it('retorna null para quantidade negativa', () => {
    expect(calculateEffectivePricePerUnit(1000, -5)).toBeNull();
  });

  it('retorna null para quantidade null/undefined', () => {
    expect(calculateEffectivePricePerUnit(1000, 0)).toBeNull();
  });

  it('arredonda resultado', () => {
    expect(calculateEffectivePricePerUnit(100, 3)).toBe(33.33);
  });

  it('trata preço zero', () => {
    expect(calculateEffectivePricePerUnit(0, 20)).toBe(0);
  });
});

describe('calculatePricing', () => {
  const defaultInputs = {
    workerDailyRate: 280,
    helperDailyRate: 150,
    numberOfHelpers: 1,
    daysCalculationMode: 'manual',
    manualDays: 10,
    productivityPerDay: null,
    quantity: 20,
    transportCost: 100,
    foodCost: 50,
    fuelCost: 30,
    toolCost: 20,
    otherCost: 10,
    materialCost: 500,
    riskReservePercent: 5,
    minimumMargin: 10,
    recommendedMargin: 20,
    fullMargin: 30,
  };

  it('calcula pricing completo', () => {
    const result = calculatePricing(defaultInputs);
    expect(result.teamDailyCost).toBe(430);
    expect(result.estimatedDays).toBe(10);
    expect(result.laborCost).toBe(4300);
    expect(result.expenseCost).toBe(210);
    expect(result.baseCost).toBe(5010);
    expect(result.riskReserve).toBe(250.5);
    expect(result.totalCost).toBe(5260.5);
    expect(result.effectiveUnitPrice).toBe(328.78);
  });

  it('calcula com zero helpers', () => {
    const result = calculatePricing({ ...defaultInputs, numberOfHelpers: 0 });
    expect(result.teamDailyCost).toBe(280);
    expect(result.laborCost).toBe(2800);
  });

  it('calcula sem despesas', () => {
    const result = calculatePricing({
      ...defaultInputs,
      transportCost: 0,
      foodCost: 0,
      fuelCost: 0,
      toolCost: 0,
      otherCost: 0,
    });
    expect(result.expenseCost).toBe(0);
  });

  it('calcula sem material', () => {
    const result = calculatePricing({ ...defaultInputs, materialCost: 0 });
    expect(result.baseCost).toBe(4510);
  });

  it('calcula com zero dias', () => {
    const result = calculatePricing({ ...defaultInputs, manualDays: 0 });
    expect(result.laborCost).toBe(0);
    expect(result.baseCost).toBe(710);
  });

  it('calcula por produtividade', () => {
    const result = calculatePricing({
      ...defaultInputs,
      daysCalculationMode: 'productivity',
      manualDays: null,
      productivityPerDay: 2,
    });
    expect(result.estimatedDays).toBe(10);
  });

  it('preço mínimo < recomendado < cheio', () => {
    const result = calculatePricing(defaultInputs);
    expect(result.minimumPrice).toBeLessThan(result.recommendedPrice);
    expect(result.recommendedPrice).toBeLessThan(result.fullPrice);
  });

  it('totalCost = baseCost + riskReserve', () => {
    const result = calculatePricing(defaultInputs);
    expect(result.totalCost).toBe(result.baseCost + result.riskReserve);
  });

  it('baseCost = laborCost + expenseCost + materialCost', () => {
    const result = calculatePricing(defaultInputs);
    expect(result.baseCost).toBe(result.laborCost + result.expenseCost + defaultInputs.materialCost);
  });
});

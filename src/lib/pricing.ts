export function pricingRound2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateTeamDailyCost(
  workerDailyRate: number,
  helperDailyRate: number,
  numberOfHelpers: number
): number {
  return pricingRound2(workerDailyRate + helperDailyRate * numberOfHelpers);
}

export function estimateDays({
  mode,
  manualDays,
  quantity,
  productivityPerDay,
}: {
  mode: string;
  manualDays: number | null;
  quantity: number;
  productivityPerDay: number | null;
}): number {
  if (mode === 'manual' && manualDays != null) {
    return manualDays;
  }
  if (mode === 'productivity' && productivityPerDay && productivityPerDay > 0) {
    return pricingRound2(quantity / productivityPerDay);
  }
  return 0;
}

export function calculateLaborCost({
  workerDailyRate,
  helperDailyRate,
  numberOfHelpers,
  estimatedDays,
}: {
  workerDailyRate: number;
  helperDailyRate: number;
  numberOfHelpers: number;
  estimatedDays: number;
}): number {
  const teamCost = calculateTeamDailyCost(workerDailyRate, helperDailyRate, numberOfHelpers);
  return pricingRound2(teamCost * estimatedDays);
}

export function calculateExpenses({
  transportCost,
  foodCost,
  fuelCost,
  toolCost,
  otherCost,
}: {
  transportCost: number;
  foodCost: number;
  fuelCost: number;
  toolCost: number;
  otherCost: number;
}): number {
  return pricingRound2(transportCost + foodCost + fuelCost + toolCost + otherCost);
}

export function calculateRiskReserve(baseCost: number, riskReservePercent: number): number {
  return pricingRound2(baseCost * (riskReservePercent / 100));
}

export function calculatePriceRange(
  totalCost: number,
  {
    minimumMargin,
    recommendedMargin,
    fullMargin,
  }: {
    minimumMargin: number;
    recommendedMargin: number;
    fullMargin: number;
  }
): {
  minimumPrice: number;
  recommendedPrice: number;
  fullPrice: number;
} {
  return {
    minimumPrice: pricingRound2(totalCost / (1 - minimumMargin / 100)),
    recommendedPrice: pricingRound2(totalCost / (1 - recommendedMargin / 100)),
    fullPrice: pricingRound2(totalCost / (1 - fullMargin / 100)),
  };
}

export function calculateEffectivePricePerUnit(
  price: number,
  quantity: number
): number | null {
  if (!quantity || quantity <= 0) return null;
  return pricingRound2(price / quantity);
}

export interface PricingInputs {
  workerDailyRate: number;
  helperDailyRate: number;
  numberOfHelpers: number;
  daysCalculationMode: string;
  manualDays: number | null;
  productivityPerDay: number | null;
  quantity: number;
  transportCost: number;
  foodCost: number;
  fuelCost: number;
  toolCost: number;
  otherCost: number;
  materialCost: number;
  riskReservePercent: number;
  minimumMargin: number;
  recommendedMargin: number;
  fullMargin: number;
}

export interface PricingResult {
  teamDailyCost: number;
  estimatedDays: number;
  laborCost: number;
  expenseCost: number;
  baseCost: number;
  riskReserve: number;
  totalCost: number;
  minimumPrice: number;
  recommendedPrice: number;
  fullPrice: number;
  effectiveUnitPrice: number | null;
}

export function calculatePricing(inputs: PricingInputs): PricingResult {
  const teamDailyCost = calculateTeamDailyCost(
    inputs.workerDailyRate,
    inputs.helperDailyRate,
    inputs.numberOfHelpers
  );

  const estimatedDays = estimateDays({
    mode: inputs.daysCalculationMode,
    manualDays: inputs.manualDays,
    quantity: inputs.quantity,
    productivityPerDay: inputs.productivityPerDay,
  });

  const laborCost = calculateLaborCost({
    workerDailyRate: inputs.workerDailyRate,
    helperDailyRate: inputs.helperDailyRate,
    numberOfHelpers: inputs.numberOfHelpers,
    estimatedDays,
  });

  const expenseCost = calculateExpenses({
    transportCost: inputs.transportCost,
    foodCost: inputs.foodCost,
    fuelCost: inputs.fuelCost,
    toolCost: inputs.toolCost,
    otherCost: inputs.otherCost,
  });

  const baseCost = pricingRound2(laborCost + expenseCost + inputs.materialCost);
  const riskReserve = calculateRiskReserve(baseCost, inputs.riskReservePercent);
  const totalCost = pricingRound2(baseCost + riskReserve);

  const { minimumPrice, recommendedPrice, fullPrice } = calculatePriceRange(totalCost, {
    minimumMargin: inputs.minimumMargin,
    recommendedMargin: inputs.recommendedMargin,
    fullMargin: inputs.fullMargin,
  });

  const effectiveUnitPrice = calculateEffectivePricePerUnit(
    recommendedPrice,
    inputs.quantity
  );

  return {
    teamDailyCost,
    estimatedDays,
    laborCost,
    expenseCost,
    baseCost,
    riskReserve,
    totalCost,
    minimumPrice,
    recommendedPrice,
    fullPrice,
    effectiveUnitPrice,
  };
}

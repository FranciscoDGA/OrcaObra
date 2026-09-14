import type { Execution } from './types';

export function recalcExecution(exec: Execution): Execution {
  const totalPayments = exec.payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = exec.expenses.reduce((s, e) => s + e.amount, 0);
  const actualTotal = exec.actualLaborCost + exec.actualMaterialCost + exec.actualFreightCost + totalExpenses;
  const projected = actualTotal > 0 ? actualTotal : 0;
  const result = totalPayments > 0 ? totalPayments - projected : null;
  const margin = totalPayments > 0 ? ((totalPayments - projected) / totalPayments) * 100 : null;

  return {
    ...exec,
    actualOtherExpense: totalExpenses,
    actualTotalCost: actualTotal,
    projectedFinalCost: projected,
    projectedResult: result,
    projectedMargin: margin,
    updatedAt: new Date().toISOString(),
  };
}

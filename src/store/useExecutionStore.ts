import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Execution, Budget } from '../lib/types';
import { read, write } from '../lib/storage';
import { generateId } from '../lib/id';

interface ExecutionState {
  executions: Execution[];
  loadExecutions: () => void;
  startExecution: (budget: Budget) => Execution;
  saveExecution: (execution: Execution) => void;
  getExecutionByProject: (projectId: string) => Execution | null;
}

export const useExecutionStore = create<ExecutionState>()(
  persist(
    (set, get) => ({
      executions: [],

      loadExecutions: () => {
        const executions = read<Execution[]>('executions', []);
        set({ executions });
      },

      startExecution: (budget: Budget) => {
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
        const executions = read<Execution[]>('executions', []);
        executions.push(execution);
        write('executions', executions);
        set({ executions });
        return execution;
      },

      saveExecution: (execution: Execution) => {
        const executions = read<Execution[]>('executions', []);
        const index = executions.findIndex((e) => e.id === execution.id);
        const updated = { ...execution, updatedAt: new Date().toISOString() };
        if (index === -1) {
          executions.push(updated);
        } else {
          executions[index] = updated;
        }
        write('executions', executions);
        set({ executions });
      },

      getExecutionByProject: (projectId: string) => {
        const { executions } = get();
        return executions.find((e) => e.projectId === projectId) ?? null;
      },
    }),
    {
      name: 'orcaobra-executions',
      partialize: (state) => ({ executions: state.executions }),
    }
  )
);

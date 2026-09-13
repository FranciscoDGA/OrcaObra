import { create } from 'zustand';
import type { Execution, Budget } from '../lib/types';
import { repository } from '../lib/repository';

interface ExecutionState {
  executions: Execution[];
  loadExecutions: () => void;
  startExecution: (budget: Budget) => Execution;
  saveExecution: (execution: Execution) => void;
  deleteExecution: (id: string) => void;
  getExecutionByProject: (projectId: string) => Execution | null;
}

export const useExecutionStore = create<ExecutionState>()((set, get) => ({
  executions: repository.getExecutions(),

  loadExecutions: () => {
    set({ executions: repository.getExecutions() });
  },

  startExecution: (budget: Budget) => {
    const execution = repository.startExecution(budget);
    set((state) => ({ executions: [...state.executions, execution] }));
    return execution;
  },

  saveExecution: (execution: Execution) => {
    repository.saveExecution(execution);
    set((state) => ({
      executions: state.executions.map((e) => (e.id === execution.id ? execution : e)),
    }));
  },

  deleteExecution: (id: string) => {
    repository.deleteExecution(id);
    set((state) => ({
      executions: state.executions.filter((e) => e.id !== id),
    }));
  },

  getExecutionByProject: (projectId: string) => {
    return get().executions.find((e) => e.projectId === projectId) ?? null;
  },
}));

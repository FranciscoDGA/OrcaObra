import { create } from 'zustand';
import type { Execution, Budget } from '../lib/types';
import { repositoryFacade } from '../lib/repository-facade';

interface ExecutionState {
  executions: Execution[];
  loadFromRepository: () => Promise<void>;
  loadExecutions: () => Promise<void>;
  startExecution: (budget: Budget) => Promise<Execution>;
  saveExecution: (execution: Execution) => Promise<void>;
  deleteExecution: (id: string) => Promise<void>;
  getExecutionByProject: (projectId: string) => Execution | null;
  clearAll: () => void;
}

export const useExecutionStore = create<ExecutionState>()((set, get) => ({
  executions: [],

  loadFromRepository: async () => {
    const executions = await repositoryFacade.loadExecutions();
    set({ executions });
  },

  loadExecutions: async () => {
    const executions = await repositoryFacade.loadExecutions();
    set({ executions });
  },

  startExecution: async (budget: Budget) => {
    const execution = await repositoryFacade.startExecution(budget);
    set((state) => ({ executions: [...state.executions, execution] }));
    return execution;
  },

  saveExecution: async (execution: Execution) => {
    await repositoryFacade.saveExecution(execution);
    set((state) => ({
      executions: state.executions.map((e) => (e.id === execution.id ? execution : e)),
    }));
  },

  deleteExecution: async (id: string) => {
    await repositoryFacade.deleteExecution(id);
    set((state) => ({
      executions: state.executions.filter((e) => e.id !== id),
    }));
  },

  getExecutionByProject: (projectId: string) => {
    return get().executions.find((e) => e.projectId === projectId) ?? null;
  },

  clearAll: () => {
    set({ executions: [] });
  },
}));

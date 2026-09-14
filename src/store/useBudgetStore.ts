import { create } from 'zustand';
import type { Budget } from '../lib/types';
import { repositoryFacade } from '../lib/repository-facade';

interface BudgetState {
  budgets: Budget[];
  editingBudgetId: string | null;
  currentStep: number;
  selectedCategory: string | null;
  loadFromRepository: () => Promise<void>;
  loadBudgets: () => Promise<void>;
  addBudget: (budget: Budget) => Promise<Budget>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  setEditingBudget: (id: string | null) => void;
  setCurrentStep: (step: number) => void;
  setSelectedCategory: (cat: string | null) => void;
  clearAll: () => void;
}

export const useBudgetStore = create<BudgetState>()((set) => ({
  budgets: [],
  editingBudgetId: null,
  currentStep: 0,
  selectedCategory: null,

  loadFromRepository: async () => {
    const budgets = await repositoryFacade.loadBudgets();
    set({ budgets });
  },

  loadBudgets: async () => {
    const budgets = await repositoryFacade.loadBudgets();
    set({ budgets });
  },

  addBudget: async (budget: Budget) => {
    const saved = await repositoryFacade.addBudget(budget);
    set((state) => ({ budgets: [saved, ...state.budgets] }));
    return saved;
  },

  updateBudget: async (budget: Budget) => {
    await repositoryFacade.updateBudget(budget);
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === budget.id ? budget : b)),
    }));
  },

  deleteBudget: async (id: string) => {
    await repositoryFacade.deleteBudget(id);
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    }));
  },

  setEditingBudget: (id: string | null) => {
    set({ editingBudgetId: id });
  },

  setCurrentStep: (step: number) => {
    set({ currentStep: step });
  },

  setSelectedCategory: (cat: string | null) => {
    set({ selectedCategory: cat });
  },

  clearAll: () => {
    set({ budgets: [], editingBudgetId: null, currentStep: 0, selectedCategory: null });
  },
}));

import { create } from 'zustand';
import type { Budget } from '../lib/types';
import { repository } from '../lib/repository';

interface BudgetState {
  budgets: Budget[];
  editingBudgetId: string | null;
  currentStep: number;
  selectedCategory: string | null;
  loadBudgets: () => void;
  addBudget: (budget: Budget) => Budget;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  setEditingBudget: (id: string | null) => void;
  setCurrentStep: (step: number) => void;
  setSelectedCategory: (cat: string | null) => void;
}

export const useBudgetStore = create<BudgetState>()((set) => ({
  budgets: repository.getBudgets(),
  editingBudgetId: null,
  currentStep: 0,
  selectedCategory: null,

  loadBudgets: () => {
    set({ budgets: repository.getBudgets() });
  },

  addBudget: (budget: Budget) => {
    const saved = repository.addBudget(budget);
    set((state) => ({ budgets: [saved, ...state.budgets] }));
    return saved;
  },

  updateBudget: (budget: Budget) => {
    repository.updateBudget(budget);
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === budget.id ? budget : b)),
    }));
  },

  deleteBudget: (id: string) => {
    repository.deleteBudget(id);
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
}));

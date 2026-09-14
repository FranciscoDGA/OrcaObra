import { create } from 'zustand';
import type { User, Settings } from '../lib/types';
import { repository } from '../lib/repository';

interface SettingsState {
  user: User | null;
  settings: Settings;
  onboardingComplete: boolean;
  setUser: (user: User) => void;
  setSettings: (settings: Partial<Settings>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  loadFromStorage: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  workerDailyRate: 280,
  helperDailyRate: 150,
  defaultHelpers: 1,
  minimumMargin: 10,
  recommendedMargin: 20,
  fullMargin: 30,
  defaultWastePercent: 10,
  defaultRiskReservePercent: 5,
  currency: 'R$',
  region: '',
  city: '',
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  user: null,
  settings: { ...DEFAULT_SETTINGS },
  onboardingComplete: false,

  setUser: (user: User) => {
    repository.saveUser(user);
    set({ user });
  },

  setSettings: (partial: Partial<Settings>) => {
    repository.saveSettings(partial);
    const current = get().settings;
    set({ settings: { ...current, ...partial } });
  },

  completeOnboarding: () => {
    set({ onboardingComplete: true });
  },

  resetOnboarding: () => {
    set({ onboardingComplete: false });
  },

  loadFromStorage: () => {
    const user = repository.getUser();
    const settings = repository.getSettings();
    set({ user, settings });
  },
}));

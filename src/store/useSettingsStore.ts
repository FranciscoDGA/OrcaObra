import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      user: null,
      settings: {
        workerDailyRate: 250,
        helperDailyRate: 150,
        defaultHelpers: 1,
        minimumMargin: 10,
        recommendedMargin: 20,
        fullMargin: 35,
        defaultWastePercent: 10,
        defaultRiskReservePercent: 5,
        currency: 'R$',
      },
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
    }),
    {
      name: 'orcaobra-settings',
    }
  )
);

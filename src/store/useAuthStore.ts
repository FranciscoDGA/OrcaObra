import { create } from 'zustand';
import type { User } from '../lib/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { repository } from '../lib/repository';
import type { Session } from '@supabase/supabase-js';
import { useBudgetStore } from './useBudgetStore';
import { useClientStore } from './useClientStore';
import { useMaterialStore } from './useMaterialStore';
import { useExecutionStore } from './useExecutionStore';
import { useSettingsStore } from './useSettingsStore';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string, profession: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => void;
  loadProfile: (authUserId: string) => Promise<void>;
}

async function loadAllStores(): Promise<void> {
  await Promise.all([
    useBudgetStore.getState().loadFromRepository(),
    useClientStore.getState().loadFromRepository(),
    useMaterialStore.getState().loadFromRepository(),
    useExecutionStore.getState().loadFromRepository(),
    useSettingsStore.getState().loadFromRepository(),
  ]);
}

function clearAllStores(): void {
  useBudgetStore.getState().clearAll();
  useClientStore.getState().clearAll();
  useMaterialStore.getState().clearAll();
  useExecutionStore.getState().clearAll();
}

let signingUp = false;

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;
    set({ initialized: true });

    if (!isSupabaseConfigured()) {
      const localUser = repository.getUser();
      set({ user: localUser, loading: false });
      loadAllStores();
      return;
    }

    supabase!.auth.onAuthStateChange(async (_event, session) => {
      if (signingUp) return;

      set({ session });

      if (session?.user) {
        await get().loadProfile(session.user.id);
        if (get().user) {
          await loadAllStores();
          set({ loading: false });
        }
      } else {
        set({ user: null, loading: false });
        clearAllStores();
      }
    });
  },

  loadProfile: async (authUserId: string) => {
    if (!supabase) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .single();

    if (!profile) return;

    const { data: membership } = await supabase
      .from('company_memberships')
      .select('company_id')
      .eq('user_id', authUserId)
      .limit(1)
      .single();

    const user: User = {
      id: authUserId,
      companyId: membership?.company_id ?? null,
      name: profile.name,
      profession: profile.profession,
      createdAt: profile.created_at,
    };
    set({ user });
    repository.saveUser(user);
  },

  signIn: async (email, password) => {
    if (!supabase) return { error: 'Supabase não configurado' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  },

  signUp: async (email, password, name, profession) => {
    if (!supabase) return { error: 'Supabase não configurado' };

    signingUp = true;

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      if (!data.user) return { error: 'Falha ao criar usuário' };

      const userId = data.user.id;
      const now = new Date().toISOString();

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, name, profession, created_at: now, updated_at: now });
      if (profileError) return { error: profileError.message };

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: `${name} — Empresa`, status: 'active', created_at: now, updated_at: now })
        .select()
        .single();
      if (companyError) return { error: companyError.message };

      const { error: membershipError } = await supabase
        .from('company_memberships')
        .insert({ company_id: company.id, user_id: userId, role: 'owner', created_at: now });
      if (membershipError) return { error: membershipError.message };

      const user: User = {
        id: userId,
        companyId: company.id,
        name,
        profession,
        createdAt: now,
      };

      const session = await supabase.auth.getSession();
      set({ session: session.data.session, user });
      repository.saveUser(user);

      await loadAllStores();
      set({ loading: false });

      return {};
    } finally {
      signingUp = false;
    }
  },

  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearAllStores();
    set({ session: null, user: null });
  },
}));

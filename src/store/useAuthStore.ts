import { create } from 'zustand';
import type { User } from '../lib/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { repository } from '../lib/repository';
import type { Session } from '@supabase/supabase-js';

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
      return;
    }

    supabase!.auth.getSession().then(({ data: { session } }) => {
      set({ session, loading: false });
      if (session?.user) {
        get().loadProfile(session.user.id);
      }
    });

    supabase!.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session?.user) {
        get().loadProfile(session.user.id);
      } else {
        set({ user: null });
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

    if (profile) {
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
    }
  },

  signIn: async (email, password) => {
    if (!supabase) return { error: 'Supabase não configurado' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  },

  signUp: async (email, password, name, profession) => {
    if (!supabase) return { error: 'Supabase não configurado' };

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
    set({ user });
    repository.saveUser(user);

    return {};
  },

  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    set({ session: null, user: null });
  },
}));

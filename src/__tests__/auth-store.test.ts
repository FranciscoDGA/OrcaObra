import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => {
  const mockSingle = vi.fn();
  const mockLimit = vi.fn(() => ({ single: mockSingle }));
  const mockEq = vi.fn(() => ({ single: mockSingle, limit: mockLimit }));
  const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })), eq: mockEq }));
  const mockFrom = vi.fn(() => ({
    insert: mockInsert,
    select: vi.fn(() => ({ eq: mockEq, limit: mockLimit })),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: mockEq,
    single: mockSingle,
    limit: mockLimit,
  }));

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
        signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        signOut: vi.fn().mockResolvedValue({}),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
      from: mockFrom,
    },
    isSupabaseConfigured: () => true,
  };
});

vi.mock('../lib/repository', () => ({
  repository: {
    getUser: vi.fn().mockReturnValue(null),
    saveUser: vi.fn(),
  },
}));

import { useAuthStore } from '../store/useAuthStore';

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ session: null, user: null, loading: false, initialized: false });
});

describe('useAuthStore', () => {
  it('signIn calls supabase auth', async () => {
    const result = await useAuthStore.getState().signIn('test@email.com', 'pass');
    expect(result.error).toBeUndefined();
  });

  it('signUp calls supabase auth and creates profile', async () => {
    const { supabase } = await import('../lib/supabase');
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'user-1', name: 'Test', profession: 'Eng', created_at: '2026-01-01' },
      error: null,
    });
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })), eq: mockEq }));
    (supabase!.from as ReturnType<typeof vi.fn>).mockReturnValue({
      insert: mockInsert,
      select: vi.fn(() => ({ eq: mockEq, single: mockSingle })),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: mockEq,
      single: mockSingle,
    });

    const result = await useAuthStore.getState().signUp('test@email.com', 'pass', 'Test', 'Eng');
    expect(result.error).toBeUndefined();
  });

  it('signIn returns error when supabase returns error', async () => {
    const { supabase } = await import('../lib/supabase');
    (supabase!.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ error: { message: 'Invalid login' } });
    const result = await useAuthStore.getState().signIn('test@email.com', 'wrong');
    expect(result.error).toBe('Invalid login');
  });

  it('signOut clears state', async () => {
    useAuthStore.setState({ session: { user: { id: '1' } } as any, user: { id: '1', name: 'Test' } as any });
    await useAuthStore.getState().signOut();
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('initialize sets initialized flag', async () => {
    const { supabase } = await import('../lib/supabase');
    (supabase!.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { session: null } });
    useAuthStore.getState().initialize();
    expect(useAuthStore.getState().initialized).toBe(true);
  });
});

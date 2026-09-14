import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({}),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
  },
  isSupabaseConfigured: () => true,
}));

import { repositorySupabase } from '../lib/repository-supabase';
import { supabase } from '../lib/supabase';

beforeEach(() => {
  vi.clearAllMocks();
});

function chainable(finalResult: unknown) {
  const response = { data: finalResult, error: null };
  const obj: Record<string, unknown> = {};
  const method = vi.fn(() => obj);
  for (const name of ['select', 'eq', 'limit', 'single', 'insert', 'update', 'delete', 'upsert']) {
    if (name === 'single') {
      obj[name] = vi.fn().mockResolvedValue(response);
    } else {
      obj[name] = method;
    }
  }
  return obj;
}

describe('repositorySupabase', () => {
  it('isConfigured returns true', () => {
    expect(repositorySupabase.isConfigured).toBe(true);
  });

  it('getUser returns null when no session', async () => {
    (supabase!.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { session: null } });
    const user = await repositorySupabase.getUser();
    expect(user).toBeNull();
  });

  it('getBudgets returns empty array when supabase returns null', async () => {
    (supabase!.from as ReturnType<typeof vi.fn>).mockReturnValue(chainable(null));
    const budgets = await repositorySupabase.getBudgets('company-1');
    expect(budgets).toEqual([]);
  });

  it('getSettings returns defaults when no row exists', async () => {
    (supabase!.from as ReturnType<typeof vi.fn>).mockReturnValue(chainable(null));
    const settings = await repositorySupabase.getSettings();
    expect(settings.workerDailyRate).toBe(280);
    expect(settings.fullMargin).toBe(30);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';

const store: Record<string, string> = {};

const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

const { migrateLegacySettings } = await import('../lib/storage');

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
});

function setLegacy(state: object | null) {
  if (state === null) {
    delete store['orcaobra-settings'];
  } else {
    store['orcaobra-settings'] = JSON.stringify({ state, version: 0 });
  }
}

function getNew(key: string) {
  const raw = store[`orcaobra.v1.${key}`];
  return raw ? JSON.parse(raw) : undefined;
}

describe('migrateLegacySettings', () => {
  it('migra user e settings quando legado existe e novo não existe', () => {
    setLegacy({
      user: { id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' },
      settings: { workerDailyRate: 350, helperDailyRate: 180 },
      onboardingComplete: true,
    });

    migrateLegacySettings();

    expect(getNew('user')).toEqual({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    expect(getNew('settings')).toEqual({ workerDailyRate: 350, helperDailyRate: 180 });
  });

  it('preserva dados novos quando legado e novo coexistem', () => {
    store['orcaobra.v1.user'] = JSON.stringify({ id: 'u2', name: 'Maria', profession: 'Arquiteta', createdAt: '2026-06-01' });
    store['orcaobra.v1.settings'] = JSON.stringify({ workerDailyRate: 500 });

    setLegacy({
      user: { id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' },
      settings: { workerDailyRate: 350 },
    });

    migrateLegacySettings();

    expect(getNew('user')).toEqual({ id: 'u2', name: 'Maria', profession: 'Arquiteta', createdAt: '2026-06-01' });
    expect(getNew('settings')).toEqual({ workerDailyRate: 500 });
  });

  it('não quebra quando legado está vazio', () => {
    setLegacy(null);

    migrateLegacySettings();

    expect(getNew('user')).toBeUndefined();
    expect(getNew('settings')).toBeUndefined();
  });

  it('não quebra quando legado é inválido', () => {
    store['orcaobra-settings'] = 'not-json{{{';

    migrateLegacySettings();

    expect(getNew('user')).toBeUndefined();
    expect(getNew('settings')).toBeUndefined();
  });

  it('idempotente — segunda execução não duplica', () => {
    setLegacy({
      user: { id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' },
      settings: { workerDailyRate: 350 },
    });

    migrateLegacySettings();
    const afterFirst = { user: getNew('user'), settings: getNew('settings') };

    migrateLegacySettings();
    const afterSecond = { user: getNew('user'), settings: getNew('settings') };

    expect(afterSecond).toEqual(afterFirst);
  });

  it('ignora user com campos obrigatórios faltando', () => {
    setLegacy({
      user: { name: 'João' },
      settings: { workerDailyRate: 350 },
    });

    migrateLegacySettings();

    expect(getNew('user')).toBeUndefined();
    expect(getNew('settings')).toEqual({ workerDailyRate: 350 });
  });

  it('ignora settings com tipo numérico inválido', () => {
    setLegacy({
      user: { id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' },
      settings: { workerDailyRate: 'not-a-number' },
    });

    migrateLegacySettings();

    expect(getNew('user')).toEqual({ id: 'u1', name: 'João', profession: 'Pedreiro', createdAt: '2026-01-01' });
    expect(getNew('settings')).toBeUndefined();
  });

  it('preenche campos opcionais do user com defaults', () => {
    setLegacy({
      user: { id: 'u1', name: 'João' },
    });

    migrateLegacySettings();

    const user = getNew('user');
    expect(user.profession).toBe('');
    expect(user.createdAt).toBeTruthy();
  });

  it('legado com user null não cria user no novo storage', () => {
    setLegacy({
      user: null,
      settings: { workerDailyRate: 350 },
    });

    migrateLegacySettings();

    expect(getNew('user')).toBeUndefined();
    expect(getNew('settings')).toEqual({ workerDailyRate: 350 });
  });

  it('legado sem state não causa erro', () => {
    store['orcaobra-settings'] = JSON.stringify({ version: 0 });

    migrateLegacySettings();

    expect(getNew('user')).toBeUndefined();
    expect(getNew('settings')).toBeUndefined();
  });
});

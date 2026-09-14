const PREFIX = 'orcaobra.v1.';
const LEGACY_KEY = 'orcaobra-settings';

export function read<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function write<T>(name: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(value));
  } catch {
    // silently fail if storage is full or unavailable
  }
}

export function remove(name: string): void {
  try {
    localStorage.removeItem(PREFIX + name);
  } catch {
    // silently fail
  }
}

interface LegacyUser {
  id?: unknown;
  name?: unknown;
  profession?: unknown;
  createdAt?: unknown;
}

interface LegacySettings {
  workerDailyRate?: unknown;
  helperDailyRate?: unknown;
  defaultHelpers?: unknown;
  minimumMargin?: unknown;
  recommendedMargin?: unknown;
  fullMargin?: unknown;
  defaultWastePercent?: unknown;
  defaultRiskReservePercent?: unknown;
  currency?: unknown;
  region?: unknown;
  city?: unknown;
}

interface LegacyPayload {
  state?: {
    user?: LegacyUser | null;
    settings?: LegacySettings;
  };
}

function isValidUser(u: LegacyUser): boolean {
  return typeof u.id === 'string' && typeof u.name === 'string';
}

function isValidSettings(s: LegacySettings): boolean {
  const numberKeys = [
    'workerDailyRate', 'helperDailyRate', 'defaultHelpers',
    'minimumMargin', 'recommendedMargin', 'fullMargin',
    'defaultWastePercent', 'defaultRiskReservePercent',
  ] as const;
  return numberKeys.every((k) => s[k] === undefined || typeof s[k] === 'number');
}

export function migrateLegacySettings(): void {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw === null) return;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return;

    const payload = parsed as LegacyPayload;
    if (!payload.state || typeof payload.state !== 'object') return;

    const { user, settings } = payload.state;

    if (user && isValidUser(user)) {
      const existingRaw = localStorage.getItem(PREFIX + 'user');
      if (existingRaw === null) {
        const migrated = {
          id: user.id,
          name: user.name,
          profession: typeof user.profession === 'string' ? user.profession : '',
          createdAt: typeof user.createdAt === 'string' ? user.createdAt : new Date().toISOString(),
        };
        write('user', migrated);
      }
    }

    if (settings && isValidSettings(settings)) {
      const existingRaw = localStorage.getItem(PREFIX + 'settings');
      if (existingRaw === null) {
        write('settings', settings);
      }
    }
  } catch {
    // legacy data corrupted — ignore and continue
  }
}

migrateLegacySettings();

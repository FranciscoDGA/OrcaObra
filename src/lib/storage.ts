const PREFIX = 'orcaobra.v1.';

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

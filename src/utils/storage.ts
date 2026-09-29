import { useEffect, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

export const readStoredValue = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) {
    return fallback;
  }

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const writeStoredValue = <T,>(key: string, value: T) => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save "${key}" to localStorage`, error);
  }
};

export const usePersistentState = <T,>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(() => readStoredValue(key, initialValue));

  useEffect(() => {
    writeStoredValue(key, state);
  }, [key, state]);

  return [state, setState] as const;
};

/**
 * LocalSave.ts
 * Centralized utility for handling localStorage operations.
 */
import { saveToOnline } from './OnlineSave';

// Keys for localStorage
export const STORAGE_KEYS = {
    POMODORO_TASKS: 'pomodoro-tasks',
    WORK_PROJECTS: 'work-projects',
    POMODORO_SETTINGS: 'pomodoro-settings',
    FINANCE_TRANSACTIONS: 'finance-transactions',
    FINANCE_EXCHANGE_RATE: 'finance-exchange-rate',
    FINANCE_RECURRING: 'finance-recurring',
    IDEAS: 'planeao-ideas',
    IDEA_SETTINGS: 'planeao-idea-settings'
} as const;

export interface StoragePayload<T = any> {
    _data: T;
    _lastModified: number;
}

export const getLocalPayload = <T = any>(key: string): StoragePayload<T> | null => {
    const str = localStorage.getItem(key);
    if (!str) return null;
    try {
        const parsed = JSON.parse(str);
        if (parsed && typeof parsed === 'object' && '_lastModified' in parsed && '_data' in parsed) {
            return parsed as StoragePayload<T>;
        }
        // Legacy format migration
        return {
            _data: parsed,
            _lastModified: 0 // old data has timestamp 0
        };
    } catch {
        return null;
    }
};

export const setLocalPayload = <T = any>(key: string, payload: StoragePayload<T>): void => {
    try {
        localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
        console.error(`Error saving payload to localStorage key "${key}":`, error);
    }
};

/**
 * Save data to localStorage
 * @param key The key to store data under
 * @param data The data to store
 */
export const saveToLocal = <T>(key: string, data: T): void => {
    try {
        const existingPayload = getLocalPayload<T>(key);
        if (existingPayload !== null && JSON.stringify(existingPayload._data) === JSON.stringify(data)) {
            // Unchanged data - suppress saving to protect _lastModified timestamp parity with Firebase
            return;
        }

        const payload: StoragePayload<T> = {
            _data: data,
            _lastModified: Date.now()
        };
        setLocalPayload(key, payload);
        // Also fire and forget to online save
        saveToOnline(key, payload).catch(err => console.error("Error syncing to online:", err));
    } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
    }
};

/**
 * Load data from localStorage
 * @param key The key to retrieve data from
 * @param fallback The fallback value if no data is found or error occurs
 * @returns The stored data or the fallback value
 */
export const loadFromLocal = <T>(key: string, fallback: T): T => {
    try {
        const payload = getLocalPayload<T>(key);
        if (payload === null) {
            // Save fallback so it gets a timestamp of 0. This prevents next identical save call from generating a Date.now() timestamp overriding online.
            setLocalPayload(key, { _data: fallback, _lastModified: 0 });
            return fallback;
        }
        return payload._data;
    } catch (error) {
        console.error(`Error loading from localStorage key "${key}":`, error);
        return fallback;
    }
};

/**
 * Remove data from localStorage
 * @param key The key to remove
 */
export const removeFromLocal = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage key "${key}":`, error);
    }
};

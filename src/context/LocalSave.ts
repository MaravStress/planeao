/**
 * LocalSave.ts
 * Centralized utility for handling localStorage operations.
 */
import { saveToOnline } from './OnlineSave';

// Keys for localStorage
export const STORAGE_KEYS = {
    POMODORO_TASKS: 'pomodoro-tasks',
    WORK_PROJECTS: 'work-projects',
    POMODORO_SETTINGS: 'pomodoro-settings', // Added for settings persistence if needed later
    FINANCE_TRANSACTIONS: 'finance-transactions',
    FINANCE_EXCHANGE_RATE: 'finance-exchange-rate',
    FINANCE_RECURRING: 'finance-recurring',
    IDEAS: 'planeao-ideas',
    IDEA_SETTINGS: 'planeao-idea-settings'
} as const;

/**
 * Save data to localStorage
 * @param key The key to store data under
 * @param data The data to store
 */
export const saveToLocal = <T>(key: string, data: T): void => {
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
        // Also fire and forget to online save
        saveToOnline(key, data).catch(err => console.error("Error syncing to online:", err));
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
        const serializedData = localStorage.getItem(key);
        if (serializedData === null) {
            return fallback;
        }
        return JSON.parse(serializedData);
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

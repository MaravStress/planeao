import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { HabitField, HabitSettings } from '../types/habits';
import { loadFromLocal, saveToLocal, getLocalPayload, removeFromLocal, STORAGE_KEYS } from './LocalSave';
import { getOnlinePayload } from './OnlineSave';
import { auth } from '../firebase';

interface HabitsContextType {
    settings: HabitSettings;
    addField: (field: HabitField) => void;
    updateField: (field: HabitField) => void;
    removeField: (fieldId: string) => void;
    updateSettings: (newSettings: HabitSettings) => void;
    isLoaded: boolean;
    loadHabits: () => Promise<void>;
    unloadHabits: () => void;
}

const DEFAULT_SETTINGS: HabitSettings = {
    fields: []
};

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<HabitSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            saveToLocal(STORAGE_KEYS.HABIT_SETTINGS, settings);
            saveToLocal(STORAGE_KEYS.HABIT_SETTINGS_BACKUP, settings);
        }
    }, [settings, isLoaded]);

    const loadHabits = async () => {
        let loadedSettings = loadFromLocal<HabitSettings>(STORAGE_KEYS.HABIT_SETTINGS_BACKUP, DEFAULT_SETTINGS);
        if (!Array.isArray(loadedSettings.fields)) {
            loadedSettings = DEFAULT_SETTINGS;
        }
        saveToLocal(STORAGE_KEYS.HABIT_SETTINGS, loadedSettings);
        setSettings(loadedSettings);

        const user = auth.currentUser;
        if (user) {
            try {
                const onlineSettingsPayload = await getOnlinePayload(STORAGE_KEYS.HABIT_SETTINGS_BACKUP);
                const localSettingsPayload = getLocalPayload(STORAGE_KEYS.HABIT_SETTINGS_BACKUP);
                const localTime = localSettingsPayload?._lastModified || 0;

                if (onlineSettingsPayload && onlineSettingsPayload._lastModified > localTime) {
                    const online = onlineSettingsPayload._data;
                    if (online && Array.isArray(online.fields)) {
                        saveToLocal(STORAGE_KEYS.HABIT_SETTINGS, online);
                        saveToLocal(STORAGE_KEYS.HABIT_SETTINGS_BACKUP, online);
                        setSettings(online);
                    }
                }
            } catch (error) {
                console.error("Error loading online habits settings:", error);
            }
        }

        setIsLoaded(true);
    };

    const unloadHabits = () => {
        setIsLoaded(false);
        removeFromLocal(STORAGE_KEYS.HABIT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
    };

    const addField = (field: HabitField) => {
        setSettings((prev) => ({ ...prev, fields: [...prev.fields, field] }));
    };

    const updateField = (field: HabitField) => {
        setSettings((prev) => ({ ...prev, fields: prev.fields.map((f) => (f.id === field.id ? field : f)) }));
    };

    const removeField = (fieldId: string) => {
        setSettings((prev) => ({ ...prev, fields: prev.fields.filter((f) => f.id !== fieldId) }));
    };

    const updateSettings = (newSettings: HabitSettings) => {
        setSettings(newSettings);
    };

    return (
        <HabitsContext.Provider value={{ settings, addField, updateField, removeField, updateSettings, isLoaded, loadHabits, unloadHabits }}>
            {children}
        </HabitsContext.Provider>
    );
};

export const useHabits = () => {
    const context = useContext(HabitsContext);
    if (context === undefined) {
        throw new Error('useHabits must be used within a HabitsProvider');
    }
    return context;
};
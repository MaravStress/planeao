import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { HabitField, HabitSettings, HabitMonthData, HabitChecklistItem } from '../types/habits';
import { loadFromLocal, saveToLocal, getLocalPayload, removeFromLocal, STORAGE_KEYS } from './LocalSave';
import { getOnlinePayload } from './OnlineSave';
import { auth } from '../firebase';

interface AddMonthResult {
    month: HabitMonthData;
    isNew: boolean;
}

interface HabitsContextType {
    settings: HabitSettings;
    months: HabitMonthData[];
    addField: (field: HabitField) => void;
    updateField: (field: HabitField) => void;
    removeField: (fieldId: string) => void;
    updateSettings: (newSettings: HabitSettings) => void;
    addMonth: (year: number, month: number) => AddMonthResult;
    deleteMonth: (monthId: string) => void;
    updateDayNote: (monthId: string, day: number, note: string) => void;
    updateDayValue: (monthId: string, day: number, fieldId: string, value: boolean | number | undefined) => void;
    addChecklistItem: (monthId: string, text: string) => void;
    toggleChecklistItem: (monthId: string, itemId: string) => void;
    removeChecklistItem: (monthId: string, itemId: string) => void;
    reorderChecklist: (monthId: string, fromIndex: number, toIndex: number) => void;
    isLoaded: boolean;
    loadHabits: () => Promise<void>;
    unloadHabits: () => void;
}

const DEFAULT_SETTINGS: HabitSettings = {
    fields: []
};

const createDefaultMonth = (): HabitMonthData => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return {
        id: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
        year: currentYear,
        month: currentMonth,
        days: {}
    };
};

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<HabitSettings>(DEFAULT_SETTINGS);
    const [months, setMonths] = useState<HabitMonthData[]>([createDefaultMonth()]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            saveToLocal(STORAGE_KEYS.HABIT_SETTINGS, settings);
            saveToLocal(STORAGE_KEYS.HABIT_SETTINGS_BACKUP, settings);
        }
    }, [settings, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            saveToLocal(STORAGE_KEYS.HABIT_MONTHS, months);
            saveToLocal(STORAGE_KEYS.HABIT_MONTHS_BACKUP, months);
        }
    }, [months, isLoaded]);

    const loadHabits = async () => {
        let loadedSettings = loadFromLocal<HabitSettings>(STORAGE_KEYS.HABIT_SETTINGS_BACKUP, DEFAULT_SETTINGS);
        if (!Array.isArray(loadedSettings.fields)) {
            loadedSettings = DEFAULT_SETTINGS;
        }
        saveToLocal(STORAGE_KEYS.HABIT_SETTINGS, loadedSettings);
        setSettings(loadedSettings);

        const defaultM = createDefaultMonth();
        let loadedMonths = loadFromLocal<HabitMonthData[]>(STORAGE_KEYS.HABIT_MONTHS_BACKUP, [defaultM]);
        if (!Array.isArray(loadedMonths) || loadedMonths.length === 0) {
            loadedMonths = [defaultM];
        }
        saveToLocal(STORAGE_KEYS.HABIT_MONTHS, loadedMonths);
        setMonths(loadedMonths);

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

                const onlineMonthsPayload = await getOnlinePayload(STORAGE_KEYS.HABIT_MONTHS_BACKUP);
                const localMonthsPayload = getLocalPayload(STORAGE_KEYS.HABIT_MONTHS_BACKUP);
                const localMonthsTime = localMonthsPayload?._lastModified || 0;

                if (onlineMonthsPayload && onlineMonthsPayload._lastModified > localMonthsTime) {
                    const onlineMonths = onlineMonthsPayload._data;
                    if (Array.isArray(onlineMonths) && onlineMonths.length > 0) {
                        saveToLocal(STORAGE_KEYS.HABIT_MONTHS, onlineMonths);
                        saveToLocal(STORAGE_KEYS.HABIT_MONTHS_BACKUP, onlineMonths);
                        setMonths(onlineMonths);
                    }
                }
            } catch (error) {
                console.error("Error loading online habits data:", error);
            }
        }

        setIsLoaded(true);
    };

    const unloadHabits = () => {
        setIsLoaded(false);
        removeFromLocal(STORAGE_KEYS.HABIT_SETTINGS);
        removeFromLocal(STORAGE_KEYS.HABIT_MONTHS);
        setSettings(DEFAULT_SETTINGS);
        setMonths([createDefaultMonth()]);
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

    const addMonth = (year: number, month: number): AddMonthResult => {
        const id = `${year}-${String(month).padStart(2, '0')}`;
        const existing = months.find((m) => m.id === id);
        if (existing) {
            return { month: existing, isNew: false };
        }

        const newMonth: HabitMonthData = {
            id,
            year,
            month,
            days: {},
            createdAt: Date.now()
        };

        const updated = [...months, newMonth].sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            return b.month - a.month;
        });

        setMonths(updated);
        return { month: newMonth, isNew: true };
    };

    const deleteMonth = (monthId: string) => {
        setMonths((prev) => {
            const remaining = prev.filter((m) => m.id !== monthId);
            if (remaining.length === 0) {
                return [createDefaultMonth()];
            }
            return remaining;
        });
    };

    const updateDayNote = (monthId: string, day: number, note: string) => {
        setMonths((prev) =>
            prev.map((m) => {
                if (m.id !== monthId) return m;
                const currentEntry = m.days[day] || { values: {} };
                return {
                    ...m,
                    days: {
                        ...m.days,
                        [day]: {
                            ...currentEntry,
                            note
                        }
                    }
                };
            })
        );
    };

    const updateDayValue = (monthId: string, day: number, fieldId: string, value: boolean | number | undefined) => {
        setMonths((prev) =>
            prev.map((m) => {
                if (m.id !== monthId) return m;
                const currentEntry = m.days[day] || { values: {} };
                const currentValues = { ...(currentEntry.values || {}) };

                if (value === undefined || value === null) {
                    delete currentValues[fieldId];
                } else {
                    currentValues[fieldId] = value;
                }

                return {
                    ...m,
                    days: {
                        ...m.days,
                        [day]: {
                            ...currentEntry,
                            values: currentValues
                        }
                    }
                };
            })
        );
    };

    const addChecklistItem = (monthId: string, text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setMonths((prev) =>
            prev.map((m) => {
                if (m.id !== monthId) return m;
                const item: HabitChecklistItem = {
                    id: crypto.randomUUID(),
                    text: trimmed,
                    completed: false
                };
                return {
                    ...m,
                    checklist: [...(m.checklist || []), item]
                };
            })
        );
    };

    const toggleChecklistItem = (monthId: string, itemId: string) => {
        setMonths((prev) =>
            prev.map((m) => {
                if (m.id !== monthId) return m;
                return {
                    ...m,
                    checklist: (m.checklist || []).map((item) =>
                        item.id === itemId ? { ...item, completed: !item.completed } : item
                    )
                };
            })
        );
    };

    const removeChecklistItem = (monthId: string, itemId: string) => {
        setMonths((prev) =>
            prev.map((m) => {
                if (m.id !== monthId) return m;
                return {
                    ...m,
                    checklist: (m.checklist || []).filter((item) => item.id !== itemId)
                };
            })
        );
    };

    const reorderChecklist = (monthId: string, fromIndex: number, toIndex: number) => {
        setMonths((prev) =>
            prev.map((m) => {
                if (m.id !== monthId) return m;
                const list = [...(m.checklist || [])];
                if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) {
                    return m;
                }
                const [moved] = list.splice(fromIndex, 1);
                list.splice(toIndex, 0, moved);
                return { ...m, checklist: list };
            })
        );
    };

    return (
        <HabitsContext.Provider
            value={{
                settings,
                months,
                addField,
                updateField,
                removeField,
                updateSettings,
                addMonth,
                deleteMonth,
                updateDayNote,
                updateDayValue,
                addChecklistItem,
                toggleChecklistItem,
                removeChecklistItem,
                reorderChecklist,
                isLoaded,
                loadHabits,
                unloadHabits
            }}
        >
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

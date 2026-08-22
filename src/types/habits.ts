export type HabitFieldType = 'range' | 'boolean';

export interface HabitChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface HabitField {
    id: string;
    name: string;
    type: HabitFieldType;
    min?: number;
    max?: number;
}

export interface HabitSettings {
    fields: HabitField[];
}

export interface HabitDayEntry {
    note?: string;
    values?: Record<string, boolean | number>;
}

export interface HabitMonthData {
    id: string; // "YYYY-MM" e.g. "2026-07"
    year: number;
    month: number; // 1 to 12
    days: Record<number, HabitDayEntry>; // 1..31 -> { note, values }
    checklist?: HabitChecklistItem[];
    createdAt?: number;
}

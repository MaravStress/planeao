export type HabitFieldType = 'boolean' | 'range';

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
export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Assignment {
    id: string;
    subjectId: string;
    title: string;
    checklist: ChecklistItem[];
    endDate: string; // ISO date string
}

export interface Subject {
    id: string;
    name: string;
    template: string[]; // List of task names for new assignments
    defaultAssignmentDuration?: number; // Duration in days for new assignments
    assignments: Assignment[];
}

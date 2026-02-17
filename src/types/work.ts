export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Order {
    id: string;
    projectId: string;
    title: string;
    checklist: ChecklistItem[];
    startDate: string; // ISO date string
    endDate: string; // ISO date string
}

export interface Project {
    id: string;
    name: string;
    template: string[]; // List of task names for new orders
    defaultOrderDuration?: number; // Duration in days for new orders
    orders: Order[];
}

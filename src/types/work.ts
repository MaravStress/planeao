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
    status?: 'todo' | 'in_progress' | 'done'; // Kanban status
}

export interface Project {
    id: string;
    name: string;
    template: string[]; // List of task names for new orders
    defaultOrderDuration?: number; // Duration in days for new orders
    isPaused?: boolean;
    orders: Order[];
    description?: string; // Project information in Markdown format
}

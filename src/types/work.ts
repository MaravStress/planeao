export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface KanbanColumnData {
    id: string;
    title: string;
    color?: string;
}

export const DEFAULT_KANBAN_COLUMNS: KanbanColumnData[] = [
    { id: 'todo', title: 'Pendientes', color: '#3b82f6' },
    { id: 'in_progress', title: 'En Proceso', color: '#f97316' },
    { id: 'done', title: 'Completado', color: '#10b981' }
];

export interface Order {
    id: string;
    projectId: string;
    title: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    status?: string; // Column ID
    description?: string; // Markdown content for the card details
}

export interface Project {
    id: string;
    name: string;
    template: string[]; // List of task names for new orders
    defaultOrderDuration?: number; // Duration in days for new orders
    isPaused?: boolean;
    columns?: KanbanColumnData[];
    orders: Order[];
    description?: string; // Project information in Markdown format
    updatedAt?: number;
    whiteboardData?: {
        elements?: readonly any[];
        appState?: Record<string, any>;
        files?: Record<string, any>;
        updatedAt?: number;
    };
}


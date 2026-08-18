/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, Order, KanbanColumnData } from '../types/work';
import { DEFAULT_KANBAN_COLUMNS } from '../types/work';
import { saveToLocal, loadFromLocal, STORAGE_KEYS } from './LocalSave';

interface WorkContextType {
    projects: Project[];
    addProject: () => Project;
    updateProject: (projectId: string, name: string, template: string[], defaultOrderDuration: number, description?: string) => void;
    deleteProject: (projectId: string) => void;
    addOrder: (projectId: string, status?: string) => Order | undefined;
    updateOrder: (projectId: string, updatedOrder: Order) => void;
    deleteOrder: (projectId: string, orderId: string) => void;
    toggleProjectPause: (projectId: string) => void;
    updateProjectWhiteboard: (projectId: string, whiteboardData: any) => void;
    reloadProjectsFromLocal: () => void;
    addProjectColumn: (projectId: string, title: string, color?: string) => void;
    deleteProjectColumn: (projectId: string, columnId: string) => void;
    updateProjectColumn: (projectId: string, columnId: string, title: string, color?: string) => void;
    moveProjectColumn: (projectId: string, columnId: string, direction: 'left' | 'right') => void;
}

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export const WorkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>(() => {
        return loadFromLocal<Project[]>(STORAGE_KEYS.WORK_PROJECTS, []);
    });

    const reloadProjectsFromLocal = () => {
        const freshProjects = loadFromLocal<Project[]>(STORAGE_KEYS.WORK_PROJECTS, []);
        setProjects(freshProjects);
    };

    // Save to LocalStorage whenever projects change
    useEffect(() => {
        saveToLocal(STORAGE_KEYS.WORK_PROJECTS, projects);
    }, [projects]);

    const addProject = (): Project => {
        const name = "Nuevo Proyecto";
        const newProject: Project = {
            id: crypto.randomUUID(),
            name,
            template: ['Tarea 1', 'Tarea 2'],
            defaultOrderDuration: 3,
            columns: DEFAULT_KANBAN_COLUMNS,
            orders: []
        };

        setProjects([...projects, newProject]);
        return newProject;
    };

    const updateProject = (projectId: string, name: string, template: string[], defaultOrderDuration: number, description?: string) => {
        setProjects(projects.map(p =>
            p.id === projectId ? { ...p, name, template, defaultOrderDuration, description, updatedAt: Date.now() } : p
        ));
    };

    const deleteProject = (projectId: string) => {
        setProjects(projects.filter(p => p.id !== projectId));
    };

    const toggleProjectPause = (projectId: string) => {
        setProjects(projects.map(p => 
            p.id === projectId ? { ...p, isPaused: !p.isPaused, updatedAt: Date.now() } : p
        ));
    };

    const addOrder = (projectId: string, initialStatus?: string): Order | undefined => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return undefined;

        const currentColumns = project.columns || DEFAULT_KANBAN_COLUMNS;
        const targetStatus = initialStatus || (currentColumns[0] ? currentColumns[0].id : 'todo');

        const title = "Nuevo Pedido";
        const duration = project.defaultOrderDuration || 7;
        const newOrder: Order = {
            id: crypto.randomUUID(),
            projectId,
            title,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
            status: targetStatus
        };

        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === projectId) {
                return { ...p, orders: [...(p.orders || []), newOrder], updatedAt: Date.now() };
            }
            return p;
        }));

        return newOrder;
    };

    const updateOrder = (projectId: string, updatedOrder: Order) => {
        setProjects(projects.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    orders: (p.orders || []).map(o => o.id === updatedOrder.id ? updatedOrder : o),
                    updatedAt: Date.now()
                };
            }
            return p;
        }));
    };

    const deleteOrder = (projectId: string, orderId: string) => {
        setProjects(projects.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    orders: (p.orders || []).filter(o => o.id !== orderId),
                    updatedAt: Date.now()
                };
            }
            return p;
        }));
    };

    const updateProjectWhiteboard = (projectId: string, whiteboardData: any) => {
        const now = Date.now();
        const dataWithTimestamp = {
            ...whiteboardData,
            updatedAt: whiteboardData?.updatedAt || now
        };
        setProjects(prevProjects => prevProjects.map(p =>
            p.id === projectId ? { ...p, whiteboardData: dataWithTimestamp, updatedAt: now } : p
        ));
    };

    const addProjectColumn = (projectId: string, title: string, color?: string) => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === projectId) {
                const currentCols = p.columns && p.columns.length > 0 ? p.columns : DEFAULT_KANBAN_COLUMNS;
                const newCol: KanbanColumnData = {
                    id: `col-${Date.now()}`,
                    title,
                    color: color || '#8b5cf6'
                };
                return {
                    ...p,
                    columns: [...currentCols, newCol],
                    updatedAt: Date.now()
                };
            }
            return p;
        }));
    };

    const deleteProjectColumn = (projectId: string, columnId: string) => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === projectId) {
                const currentCols = p.columns && p.columns.length > 0 ? p.columns : DEFAULT_KANBAN_COLUMNS;
                const updatedCols = currentCols.filter(c => c.id !== columnId);
                const fallbackStatus = updatedCols[0] ? updatedCols[0].id : 'todo';

                // Reassign orders in deleted column to fallback column
                const updatedOrders = (p.orders || []).map(o => {
                    if (o.status === columnId) {
                        return { ...o, status: fallbackStatus };
                    }
                    return o;
                });

                return {
                    ...p,
                    columns: updatedCols,
                    orders: updatedOrders,
                    updatedAt: Date.now()
                };
            }
            return p;
        }));
    };

    const updateProjectColumn = (projectId: string, columnId: string, title: string, color?: string) => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === projectId) {
                const currentCols = p.columns && p.columns.length > 0 ? p.columns : DEFAULT_KANBAN_COLUMNS;
                const updatedCols = currentCols.map(c => {
                    if (c.id === columnId) {
                        return { ...c, title, color: color || c.color };
                    }
                    return c;
                });
                return {
                    ...p,
                    columns: updatedCols,
                    updatedAt: Date.now()
                };
            }
            return p;
        }));
    };

    const moveProjectColumn = (projectId: string, columnId: string, direction: 'left' | 'right') => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === projectId) {
                const currentCols = [...(p.columns && p.columns.length > 0 ? p.columns : DEFAULT_KANBAN_COLUMNS)];
                const index = currentCols.findIndex(c => c.id === columnId);
                if (index === -1) return p;

                const targetIndex = direction === 'left' ? index - 1 : index + 1;
                if (targetIndex < 0 || targetIndex >= currentCols.length) return p;

                const temp = currentCols[index];
                currentCols[index] = currentCols[targetIndex];
                currentCols[targetIndex] = temp;

                return { ...p, columns: currentCols, updatedAt: Date.now() };
            }
            return p;
        }));
    };

    return (
        <WorkContext.Provider value={{
            projects,
            addProject,
            updateProject,
            deleteProject,
            addOrder,
            updateOrder,
            deleteOrder,
            toggleProjectPause,
            updateProjectWhiteboard,
            reloadProjectsFromLocal,
            addProjectColumn,
            deleteProjectColumn,
            updateProjectColumn,
            moveProjectColumn
        }}>
            {children}
        </WorkContext.Provider>
    );

};

export const useWork = () => {
    const context = useContext(WorkContext);
    if (!context) {
        throw new Error('useWork must be used within a WorkProvider');
    }
    return context;
};

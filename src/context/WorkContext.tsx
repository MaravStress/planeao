import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, Order, ChecklistItem } from '../types/work';
import { saveToLocal, loadFromLocal, STORAGE_KEYS } from './LocalSave';

interface WorkContextType {
    projects: Project[];
    addProject: () => Project;
    updateProject: (projectId: string, name: string, template: string[], defaultOrderDuration: number) => void;
    deleteProject: (projectId: string) => void;
    addOrder: (projectId: string) => Order | undefined;
    updateOrder: (projectId: string, updatedOrder: Order) => void;
    deleteOrder: (projectId: string, orderId: string) => void;
    toggleOrderCheck: (projectId: string, orderId: string, itemId: string) => void;
}

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export const WorkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>(() => {
        return loadFromLocal<Project[]>(STORAGE_KEYS.WORK_PROJECTS, []);
    });

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
            defaultOrderDuration: 3, // Default duration for new projects
            orders: []
        };

        setProjects([...projects, newProject]);
        return newProject;
    };

    const updateProject = (projectId: string, name: string, template: string[], defaultOrderDuration: number) => {
        setProjects(projects.map(p =>
            p.id === projectId ? { ...p, name, template, defaultOrderDuration } : p
        ));
    };

    const deleteProject = (projectId: string) => {
        setProjects(projects.filter(p => p.id !== projectId));
    };

    const addOrder = (projectId: string): Order | undefined => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return undefined;

        const title = "Nuevo Pedido";

        // Create checklist from template
        const checklist: ChecklistItem[] = project.template.map((text, index) => ({
            id: `${crypto.randomUUID()}-${index}`,
            text,
            completed: false
        }));

        const duration = project.defaultOrderDuration || 7;
        const newOrder: Order = {
            id: crypto.randomUUID(),
            projectId,
            title,
            checklist,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
        };

        setProjects(projects.map(p => {
            if (p.id === projectId) {
                return { ...p, orders: [...p.orders, newOrder] };
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
                    orders: p.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
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
                    orders: p.orders.filter(o => o.id !== orderId)
                };
            }
            return p;
        }));
    };

    const toggleOrderCheck = (projectId: string, orderId: string, itemId: string) => {
        setProjects(projects.map(p => {
            if (p.id === projectId) {
                const updatedOrders = p.orders.map(order => {
                    if (order.id === orderId) {
                        const updatedChecklist = order.checklist.map(item => {
                            if (item.id === itemId) {
                                return { ...item, completed: !item.completed };
                            }
                            return item;
                        });
                        return { ...order, checklist: updatedChecklist };
                    }
                    return order;
                });
                return { ...p, orders: updatedOrders };
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
            toggleOrderCheck
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

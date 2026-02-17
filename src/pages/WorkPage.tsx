import React, { useState } from 'react';
import Timeline from '../components/Work/Timeline';
import ProjectColumn from '../components/Work/ProjectColumn';
import EditProjectModal from '../components/Work/EditProjectModal';
import EditOrderModal from '../components/Work/EditOrderModal';
import type { Project, Order, ChecklistItem } from '../types/work';
import { Plus } from 'lucide-react';

const WorkPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([
        {
            id: '1',
            name: 'Proyecto Ejemplo',
            template: ['Diseño', 'Desarrollo', 'Pruebas'],
            defaultOrderDuration: 7,
            orders: []
        }
    ]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    const addProject = () => {
        const name = "Nuevo Proyecto";
        const newProject: Project = {
            id: crypto.randomUUID(),
            name,
            template: ['Tarea 1', 'Tarea 2'],
            defaultOrderDuration: 3, // Default duration for new projects
            orders: []
        };

        setProjects([...projects, newProject]);
        setEditingProject(newProject);
    };

    const updateProject = (projectId: string, name: string, template: string[], defaultOrderDuration: number) => {
        setProjects(projects.map(p =>
            p.id === projectId ? { ...p, name, template, defaultOrderDuration } : p
        ));
    };

    const addOrder = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

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

        // Open edit modal for the new order
        setEditingOrder(newOrder);
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

    const archiveOrder = (projectId: string, orderId: string) => {
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

    return (
        <div className="page-container" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <header className="page-header">
                <h1>Work</h1>
                <p>Gestiona tus proyectos y pedidos.</p>
            </header>

            <Timeline />

            <div style={{
                flex: 1,
                overflowX: 'auto',
                overflowY: 'hidden',
                display: 'flex',
                gap: '1rem',
                paddingBottom: '1rem',
                transform: 'rotateX(180deg)',
                alignItems: 'flex-end'
            }}>
                {projects.map(project => (
                    <div key={project.id} style={{ transform: 'rotateX(180deg)', height: '100%' }}>
                        <ProjectColumn
                            project={project}
                            onAddOrder={addOrder}
                            onEditProject={setEditingProject}
                            onEditOrder={setEditingOrder}
                            onArchiveOrder={archiveOrder}
                            onToggleOrderCheck={toggleOrderCheck}
                        />
                    </div>
                ))}

                {/* Add Project Button Column */}
                <div style={{
                    minWidth: '300px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    transform: 'rotateX(180deg)'
                }}>
                    <button
                        onClick={addProject}
                        className="glass-panel"
                        style={{
                            width: '100%',
                            height: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '2px dashed rgba(255,255,255,0.2)',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '1.2rem',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.color = 'var(--color-primary)';
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                    >
                        <Plus size={32} />
                        <span>Nuevo Proyecto</span>
                    </button>
                </div>
            </div>

            {editingProject && (
                <EditProjectModal
                    project={editingProject}
                    isOpen={!!editingProject}
                    onClose={() => setEditingProject(null)}
                    onSave={updateProject}
                    onDelete={(projectId) => {
                        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este proyecto y todos sus pedidos?");
                        if (confirmDelete) {
                            setProjects(projects.filter(p => p.id !== projectId));
                            setEditingProject(null);
                        }
                    }}
                />
            )}

            {editingOrder && (
                <EditOrderModal
                    order={editingOrder}
                    isOpen={!!editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onSave={updateOrder}
                    onDelete={(projectId, orderId) => {
                        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este pedido?");
                        if (confirmDelete) {
                            archiveOrder(projectId, orderId);
                            setEditingOrder(null);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default WorkPage;

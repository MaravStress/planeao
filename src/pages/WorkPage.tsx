import React, { useState } from 'react';
import Timeline from '../components/Work/Timeline';
import ProjectColumn from '../components/Work/ProjectColumn';
import EditProjectModal from '../components/Work/EditProjectModal';
import EditOrderModal from '../components/Work/EditOrderModal';
import type { Project, Order } from '../types/work';
import { Plus } from 'lucide-react';
import { useWork } from '../context/WorkContext';

const WorkPage: React.FC = () => {
    const {
        projects,
        addProject: addProjectContext,
        updateProject,
        deleteProject,
        addOrder: addOrderContext,
        updateOrder,
        deleteOrder, // This was archiveOrder in WorkPage logic
        toggleOrderCheck
    } = useWork();

    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    const handleAddProject = () => {
        const newProject = addProjectContext();
        setEditingProject(newProject);
    };

    const handleAddOrder = (projectId: string) => {
        const newOrder = addOrderContext(projectId);
        if (newOrder) {
            setEditingOrder(newOrder);
        }
    };

    const handleDeleteProject = (projectId: string) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este proyecto y todos sus pedidos?");
        if (confirmDelete) {
            deleteProject(projectId);
            setEditingProject(null);
        }
    };

    const handleDeleteOrder = (projectId: string, orderId: string) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este pedido?");
        if (confirmDelete) {
            deleteOrder(projectId, orderId);
            setEditingOrder(null);
        }
    };

    return (
        <div className="page-container" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <header className="page-header">
                <h1>Work</h1>
                <p>Gestiona tus proyectos y pedidos.</p>
            </header>

            <Timeline onEditOrder={setEditingOrder} />

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
                            onAddOrder={handleAddOrder}
                            onEditProject={setEditingProject}
                            onEditOrder={setEditingOrder}
                            onArchiveOrder={deleteOrder}
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
                        onClick={handleAddProject}
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
                    onDelete={handleDeleteProject}
                />
            )}

            {editingOrder && (
                <EditOrderModal
                    order={editingOrder}
                    isOpen={!!editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onSave={updateOrder}
                    onDelete={handleDeleteOrder}
                />
            )}
        </div>
    );
};

export default WorkPage;

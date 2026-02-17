import React from 'react';
import type { Project, Order } from '../../types/work';
import OrderCard from './OrderCard';
import { Plus, Settings } from 'lucide-react';

interface ProjectColumnProps {
    project: Project;
    onAddOrder: (projectId: string) => void;
    onEditProject: (project: Project) => void;
    onEditOrder: (order: Order) => void;
    onArchiveOrder: (projectId: string, orderId: string) => void;
    onToggleOrderCheck: (projectId: string, orderId: string, itemId: string) => void;
}

const ProjectColumn: React.FC<ProjectColumnProps> = ({
    project,
    onAddOrder,
    onEditProject,
    onEditOrder,
    onArchiveOrder,
    onToggleOrderCheck
}) => {
    return (
        <div className="glass-panel" style={{
            minWidth: '300px',
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            marginRight: '1rem'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0 }}>{project.name}</h3>
                <button
                    onClick={() => onEditProject(project)}
                    className="icon-button"
                    title="Editar Proyecto"
                    style={{ color: 'white' }}
                >
                    <Settings size={18} />
                </button>
            </div>

            {/* Stats */}
            <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(0,0,0,0.1)'
            }}>
                <div>
                    Target: {(() => {
                        const completed = project.orders.reduce((acc, o) => acc + o.checklist.filter(i => i.completed).length, 0);
                        const total = project.orders.reduce((acc, o) => acc + o.checklist.length, 0);
                        return `${completed}/${total}`;
                    })()}
                </div>
                <div>
                    Estimado: {(() => {
                        const now = new Date();
                        const activeOrders = project.orders.filter(o => new Date(o.endDate) > now);
                        const days = activeOrders.reduce((acc, o) => {
                            const end = new Date(o.endDate);
                            const start = new Date(o.startDate) > now ? new Date(o.startDate) : now;
                            const diffTime = Math.max(0, end.getTime() - start.getTime());
                            return acc + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        }, 0);
                        return `${days}d`;
                    })()}
                </div>
            </div>

            {/* Orders List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

                <button
                    onClick={() => onAddOrder(project.id)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px dashed rgba(255,255,255,0.2)',
                        backgroundColor: 'transparent',
                        color: 'rgba(255,255,255,0.6)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    }}
                >
                    <Plus size={20} />
                    <span>Añadir Pedido</span>
                </button>

                {[...project.orders]
                    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                    .map((order: Order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onEdit={onEditOrder}
                            onArchive={(orderId) => onArchiveOrder(project.id, orderId)}
                            onToggleCheck={(orderId, itemId) => onToggleOrderCheck(project.id, orderId, itemId)}
                        />
                    ))}

            </div>
        </div>
    );
};

export default ProjectColumn;

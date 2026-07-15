import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Order } from '../../types/work';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
    id: 'todo' | 'in_progress' | 'done';
    title: string;
    orders: Order[];
    onEditOrder: (order: Order) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, orders, onEditOrder }) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: {
            type: 'Column',
            id
        }
    });

    return (
        <div 
            ref={setNodeRef} 
            className={`kanban-column ${isOver ? 'is-over' : ''}`}
        >
            <div className="kanban-column-header">
                <div className="kanban-column-title-container">
                    <div className={`kanban-column-dot ${id}`} />
                    <span className="kanban-column-title">{title}</span>
                </div>
                <span className="kanban-column-badge">{orders.length}</span>
            </div>

            <div className="kanban-column-cards">
                <SortableContext 
                    items={orders.map(o => o.id)} 
                    strategy={verticalListSortingStrategy}
                >
                    {orders.map(order => (
                        <KanbanCard 
                            key={order.id} 
                            order={order} 
                            onEdit={onEditOrder} 
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

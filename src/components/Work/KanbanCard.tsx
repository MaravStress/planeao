import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Order } from '../../types/work';
import GoogleIcon from '../GoogleIcon';

interface KanbanCardProps {
    order: Order;
    onEdit: (order: Order) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ order, onEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: order.id,
        data: {
            type: 'Order',
            order
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Calculate checklist progress
    const totalItems = order.checklist?.length || 0;
    const completedItems = order.checklist?.filter(item => item.completed).length || 0;
    const progressText = `${completedItems}/${totalItems}`;
    const isCompleted = totalItems > 0 && completedItems === totalItems;

    // Formatting dates
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        } catch (e) {
            return '';
        }
    };

    const status = order.status || 'todo';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`kanban-card ${isDragging ? 'is-dragging' : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className={`kanban-card-accent ${status}`} />
            <div className="kanban-card-header">
                <span className="kanban-card-title">{order.title}</span>
                <button
                    className="kanban-card-edit-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onEdit(order);
                    }}
                    title="Editar pedido"
                >
                    <GoogleIcon name="edit" size={14} />
                </button>
            </div>
            <div className="kanban-card-footer">
                <div className="kanban-card-date">
                    <GoogleIcon name="calendar_today" size={12} />
                    <span>{formatDate(order.endDate)}</span>
                </div>
                {totalItems > 0 && (
                    <div className={`kanban-card-progress ${isCompleted ? 'completed' : ''}`}>
                        <GoogleIcon name="check_circle" size={12} />
                        <span>{progressText}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

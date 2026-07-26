import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Order } from '../../types/work';
import GoogleIcon from '../GoogleIcon';

interface KanbanCardProps {
    order: Order;
    columnColor?: string;
    onUpdateOrder?: (updatedOrder: Order) => void;
    onDeleteOrder?: (orderId: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ order, columnColor, onUpdateOrder, onDeleteOrder }) => {
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

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(order.title);

    useEffect(() => {
        setTitle(order.title);
    }, [order.title]);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleSaveTitle = () => {
        setIsEditingTitle(false);
        const trimmed = title.trim();
        if (trimmed && trimmed !== order.title && onUpdateOrder) {
            onUpdateOrder({
                ...order,
                title: trimmed
            });
        } else if (!trimmed) {
            setTitle(order.title);
        }
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDateStr = e.target.value;
        if (newDateStr && onUpdateOrder) {
            const newStartDate = new Date(`${newDateStr}T00:00:00`).toISOString();
            onUpdateOrder({
                ...order,
                startDate: newStartDate
            });
        }
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDateStr = e.target.value;
        if (newDateStr && onUpdateOrder) {
            const newEndDate = new Date(`${newDateStr}T00:00:00`).toISOString();
            onUpdateOrder({
                ...order,
                endDate: newEndDate
            });
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onDeleteOrder) {
            onDeleteOrder(order.id);
        }
    };

    const formatDateForInput = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
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
            <div className={`kanban-card-accent ${status}`} style={columnColor ? { backgroundColor: columnColor } : undefined} />

            <div className="kanban-card-header">
                {isEditingTitle ? (
                    <textarea
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveTitle();
                            }
                            if (e.key === 'Escape') {
                                setTitle(order.title);
                                setIsEditingTitle(false);
                            }
                        }}
                        onKeyUp={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        rows={2}
                        className="kanban-card-title-input"
                    />
                ) : (
                    <span
                        className="kanban-card-title"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingTitle(true);
                        }}
                        title="Clic para editar título"
                    >
                        {order.title}
                    </span>
                )}

                <div className="kanban-card-actions" onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        className="kanban-card-action-btn edit-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingTitle(!isEditingTitle);
                        }}
                        title="Editar título"
                    >
                        <GoogleIcon name="edit" size={13} />
                    </button>
                    <button
                        className="kanban-card-action-btn delete-btn"
                        onClick={handleDelete}
                        title="Eliminar tarjeta"
                    >
                        <GoogleIcon name="delete" size={13} />
                    </button>
                </div>
            </div>

            <div className="kanban-card-footer" onPointerDown={(e) => e.stopPropagation()}>
                <div className="kanban-card-dates">
                    <div className="kanban-card-date-picker" title="Fecha de Inicio">
                        <span className="kanban-card-date-label">Inicio:</span>
                        <input
                            type="date"
                            value={formatDateForInput(order.startDate)}
                            onChange={handleStartDateChange}
                            onClick={(e) => e.stopPropagation()}
                            className="kanban-card-date-input"
                        />
                    </div>
                    <div className="kanban-card-date-picker" title="Fecha Final">
                        <span className="kanban-card-date-label">Fin:</span>
                        <input
                            type="date"
                            value={formatDateForInput(order.endDate)}
                            onChange={handleEndDateChange}
                            onClick={(e) => e.stopPropagation()}
                            className="kanban-card-date-input"
                        />
                    </div>
                </div>

                <div className={`kanban-card-status-badge ${status}`}>
                    {status === 'todo' && 'Pendiente'}
                    {status === 'in_progress' && 'En Proceso'}
                    {status === 'done' && 'Completado'}
                </div>
            </div>
        </div>
    );
};

export default KanbanCard;

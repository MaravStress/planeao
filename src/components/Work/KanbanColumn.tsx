import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Order } from '../../types/work';
import { KanbanCard } from './KanbanCard';
import GoogleIcon from '../GoogleIcon';

interface KanbanColumnProps {
    id: string;
    title: string;
    color?: string;
    orders: Order[];
    canDelete?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    onUpdateOrder?: (order: Order) => void;
    onDeleteOrder?: (orderId: string) => void;
    onAddOrder?: (status: string) => void;
    onUpdateColumnTitle?: (columnId: string, newTitle: string) => void;
    onDeleteColumn?: (columnId: string) => void;
    onMoveColumn?: (columnId: string, direction: 'left' | 'right') => void;
    onOpenOrderModal?: (order: Order) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    id,
    title,
    color,
    orders,
    canDelete = true,
    isFirst = false,
    isLast = false,
    onUpdateOrder,
    onDeleteOrder,
    onAddOrder,
    onUpdateColumnTitle,
    onDeleteColumn,
    onMoveColumn,
    onOpenOrderModal
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: {
            type: 'Column',
            id
        }
    });

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [columnTitle, setColumnTitle] = useState(title);

    useEffect(() => {
        setColumnTitle(title);
    }, [title]);

    const handleSaveTitle = () => {
        setIsEditingTitle(false);
        const trimmed = columnTitle.trim();
        if (trimmed && trimmed !== title && onUpdateColumnTitle) {
            onUpdateColumnTitle(id, trimmed);
        } else if (!trimmed) {
            setColumnTitle(title);
        }
    };

    const handleDeleteColumnClick = () => {
        if (!onDeleteColumn) return;
        const confirmDelete = window.confirm(
            `¿Estás seguro de que deseas eliminar la columna "${title}"?\nLas tareas contenidas se moverán automáticamente a la primera columna.`
        );
        if (confirmDelete) {
            onDeleteColumn(id);
        }
    };

    return (
        <div
            ref={setNodeRef}
            className={`kanban-column ${isOver ? 'is-over' : ''}`}
        >
            <div className="kanban-column-header">
                <div className="kanban-column-title-container">
                    <div
                        className={`kanban-column-dot ${id}`}
                        style={color ? { backgroundColor: color } : undefined}
                    />
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={columnTitle}
                            onChange={(e) => setColumnTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') handleSaveTitle();
                                if (e.key === 'Escape') {
                                    setColumnTitle(title);
                                    setIsEditingTitle(false);
                                }
                            }}
                            onKeyUp={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="kanban-column-title-input"
                        />
                    ) : (
                        <span
                            className="kanban-column-title"
                            onClick={() => setIsEditingTitle(true)}
                            title="Clic para renombrar columna"
                        >
                            {title}
                        </span>
                    )}
                </div>

                <div className="kanban-column-header-actions">
                    <span className="kanban-column-badge">{orders.length}</span>

                    {!isFirst && onMoveColumn && (
                        <button
                            onClick={() => onMoveColumn(id, 'left')}
                            className="kanban-column-add-btn"
                            title="Mover columna a la izquierda"
                        >
                            <GoogleIcon name="chevron_left" size={16} />
                        </button>
                    )}

                    {!isLast && onMoveColumn && (
                        <button
                            onClick={() => onMoveColumn(id, 'right')}
                            className="kanban-column-add-btn"
                            title="Mover columna a la derecha"
                        >
                            <GoogleIcon name="chevron_right" size={16} />
                        </button>
                    )}

                    {onAddOrder && (
                        <button
                            onClick={() => onAddOrder(id)}
                            className="kanban-column-add-btn"
                            title={`Agregar tarjeta en ${title}`}
                        >
                            <GoogleIcon name="add" size={16} />
                        </button>
                    )}

                    {canDelete && onDeleteColumn && (
                        <button
                            onClick={handleDeleteColumnClick}
                            className="kanban-column-add-btn delete-col-btn"
                            title="Eliminar columna"
                        >
                            <GoogleIcon name="delete" size={14} />
                        </button>
                    )}
                </div>
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
                            columnColor={color}
                            onUpdateOrder={onUpdateOrder}
                            onDeleteOrder={onDeleteOrder}
                            onClickCard={onOpenOrderModal}
                        />
                    ))}
                </SortableContext>

                {orders.length === 0 && (
                    <div className="kanban-column-empty">
                        <span>Sin tareas</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;

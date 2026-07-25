import React, { useState, useCallback } from 'react';
import {
    DndContext,
    pointerWithin,
    rectIntersection,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    type CollisionDetection,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Order, KanbanColumnData } from '../../types/work';
import { DEFAULT_KANBAN_COLUMNS } from '../../types/work';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import Timeline from './Timeline';
import { useWork } from '../../context/WorkContext';
import GoogleIcon from '../GoogleIcon';

interface ProjectPanelTabKanbanProps {
    projectId?: string;
    orders: Order[];
    onMoveOrder?: (order: Order, newStatus: string) => void;
}

// Color palette options for new columns
const COLUMN_COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'];

const customCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
        return pointerCollisions;
    }
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
        return rectCollisions;
    }
    return closestCorners(args);
};

export const ProjectPanelTabKanban: React.FC<ProjectPanelTabKanbanProps> = ({
    projectId,
    orders,
    onMoveOrder
}) => {
    const {
        projects,
        addOrder,
        updateOrder,
        deleteOrder,
        addProjectColumn,
        deleteProjectColumn,
        updateProjectColumn,
        moveProjectColumn
    } = useWork();

    const [activeId, setActiveId] = useState<string | null>(null);
    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');

    const currentProject = projects.find(p => p.id === projectId);
    const columns: KanbanColumnData[] = (currentProject?.columns && currentProject.columns.length > 0)
        ? currentProject.columns
        : DEFAULT_KANBAN_COLUMNS;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const activeOrder = activeId ? orders.find(o => o.id === activeId) : null;

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        let newStatus: string | null = null;

        // Check if dropped directly on a column
        const matchedCol = columns.find(c => c.id === overIdStr);
        if (matchedCol) {
            newStatus = matchedCol.id;
        } else {
            // Check if dropped over a card in a column
            const targetOrder = orders.find(o => o.id === overIdStr);
            if (targetOrder) {
                newStatus = targetOrder.status || columns[0].id;
            }
        }

        if (newStatus) {
            const draggedOrder = orders.find(o => o.id === activeIdStr);
            if (draggedOrder && draggedOrder.status !== newStatus) {
                if (onMoveOrder) {
                    onMoveOrder(draggedOrder, newStatus);
                } else if (projectId) {
                    updateOrder(projectId, {
                        ...draggedOrder,
                        status: newStatus
                    });
                }
            }
        }
    };

    const handleAddOrder = useCallback((status?: string) => {
        if (!projectId) return;
        const initialStatus = status || columns[0]?.id || 'todo';
        addOrder(projectId, initialStatus);
    }, [projectId, addOrder, columns]);

    const handleUpdateOrder = useCallback((updatedOrder: Order) => {
        if (!projectId) return;
        updateOrder(projectId, updatedOrder);
    }, [projectId, updateOrder]);

    const handleDeleteOrder = useCallback((orderId: string) => {
        if (!projectId) return;
        deleteOrder(projectId, orderId);
    }, [projectId, deleteOrder]);

    const handleAddColumnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newColumnTitle.trim();
        if (trimmed && projectId) {
            const randomColor = COLUMN_COLORS[columns.length % COLUMN_COLORS.length];
            addProjectColumn(projectId, trimmed, randomColor);
            setNewColumnTitle('');
            setIsCreatingColumn(false);
        }
    };

    const handleUpdateColumnTitle = useCallback((columnId: string, newTitle: string) => {
        if (!projectId) return;
        updateProjectColumn(projectId, columnId, newTitle);
    }, [projectId, updateProjectColumn]);

    const handleDeleteColumn = useCallback((columnId: string) => {
        if (!projectId) return;
        deleteProjectColumn(projectId, columnId);
    }, [projectId, deleteProjectColumn]);

    const handleMoveColumn = useCallback((columnId: string, direction: 'left' | 'right') => {
        if (!projectId) return;
        moveProjectColumn(projectId, columnId, direction);
    }, [projectId, moveProjectColumn]);

    return (
        <div className="kanban-wrapper">
            <Timeline projectId={projectId} />

            <div className="kanban-action-bar">
                <div className="kanban-action-hint">
                    Arrastra y suelta tarjetas entre columnas. Usa las flechas para reordenar las columnas.
                </div>
                {projectId && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {isCreatingColumn ? (
                            <form onSubmit={handleAddColumnSubmit} style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Nombre columna..."
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    autoFocus
                                    className="new-column-input"
                                />
                                <button type="submit" className="btn-new-project" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingColumn(false)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Cancelar
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsCreatingColumn(true)}
                                className="glass-button"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'white' }}
                                title="Crear nueva columna para este proyecto"
                            >
                                <GoogleIcon name="view_column" size={16} /> + Nueva Columna
                            </button>
                        )}

                        <button
                            onClick={() => handleAddOrder(columns[0]?.id)}
                            className="btn-new-project"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                            <GoogleIcon name="add" size={18} /> Nueva Tarea
                        </button>
                    </div>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={customCollisionDetection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-board-container">
                    {columns.map((col, index) => {
                        const colOrders = orders.filter(o => (o.status || columns[0].id) === col.id);
                        return (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                color={col.color}
                                orders={colOrders}
                                canDelete={columns.length > 1}
                                isFirst={index === 0}
                                isLast={index === columns.length - 1}
                                onUpdateOrder={handleUpdateOrder}
                                onDeleteOrder={handleDeleteOrder}
                                onAddOrder={projectId ? handleAddOrder : undefined}
                                onUpdateColumnTitle={handleUpdateColumnTitle}
                                onDeleteColumn={handleDeleteColumn}
                                onMoveColumn={handleMoveColumn}
                            />
                        );
                    })}
                </div>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: '0.5',
                            },
                        },
                    }),
                }}>
                    {activeOrder ? (
                        <div style={{ transform: 'rotate(2deg)', cursor: 'grabbing' }}>
                            <KanbanCard
                                order={activeOrder}
                                columnColor={columns.find(c => c.id === activeOrder.status)?.color}
                                onUpdateOrder={handleUpdateOrder}
                                onDeleteOrder={handleDeleteOrder}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default ProjectPanelTabKanban;

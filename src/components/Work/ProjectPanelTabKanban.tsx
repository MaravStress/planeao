import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Order } from '../../types/work';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

interface ProjectPanelTabKanbanProps {
    orders: Order[];
    onMoveOrder: (order: Order, newStatus: 'todo' | 'in_progress' | 'done') => void;
    onEditOrder: (order: Order) => void;
}

export const ProjectPanelTabKanban: React.FC<ProjectPanelTabKanbanProps> = ({ orders, onMoveOrder, onEditOrder }) => {
    const [activeId, setActiveId] = useState<string | null>(null);

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

        let newStatus: 'todo' | 'in_progress' | 'done' | null = null;

        // If dropped directly on a column
        if (overIdStr === 'todo' || overIdStr === 'in_progress' || overIdStr === 'done') {
            newStatus = overIdStr;
        } else {
            // If dropped over a card in a column, inherit that card's status
            const targetOrder = orders.find(o => o.id === overIdStr);
            if (targetOrder) {
                newStatus = targetOrder.status || 'todo';
            }
        }

        if (newStatus) {
            const draggedOrder = orders.find(o => o.id === activeIdStr);
            if (draggedOrder && draggedOrder.status !== newStatus) {
                onMoveOrder(draggedOrder, newStatus);
            }
        }
    };

    // Filter orders by status
    const todoOrders = orders.filter(o => (o.status || 'todo') === 'todo');
    const inProgressOrders = orders.filter(o => o.status === 'in_progress');
    const doneOrders = orders.filter(o => o.status === 'done');

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board-container">
                <KanbanColumn
                    id="todo"
                    title="Pendientes"
                    orders={todoOrders}
                    onEditOrder={onEditOrder}
                />
                <KanbanColumn
                    id="in_progress"
                    title="En Proceso"
                    orders={inProgressOrders}
                    onEditOrder={onEditOrder}
                />
                <KanbanColumn
                    id="done"
                    title="Completado"
                    orders={doneOrders}
                    onEditOrder={onEditOrder}
                />
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
                        <KanbanCard order={activeOrder} onEdit={() => { }} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default ProjectPanelTabKanban;

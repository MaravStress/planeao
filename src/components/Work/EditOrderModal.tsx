import React, { useState, useEffect } from 'react';
import type { Order, ChecklistItem } from '../../types/work';
import { X, Save, Plus } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface EditOrderModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectId: string, updatedOrder: Order) => void;
    onDelete: (projectId: string, orderId: string) => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, isOpen, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState(order.title);
    const [startDate, setStartDate] = useState(order.startDate.split('T')[0]);
    const [endDate, setEndDate] = useState(order.endDate.split('T')[0]);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [newItemText, setNewItemText] = useState('');

    const titleInputRef = React.useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (isOpen) {
            setTitle(order.title);
            // Convert to local YYYY-MM-DD for input
            const start = new Date(order.startDate);
            const end = new Date(order.endDate);

            const formatDate = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            setStartDate(formatDate(start));
            setEndDate(formatDate(end));
            setChecklist(order.checklist);

            // Focus and select the title input
            setTimeout(() => {
                if (titleInputRef.current) {
                    titleInputRef.current.focus();
                    titleInputRef.current.select();
                }
            }, 100);
        }
    }, [order, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        // Create dates at local midnight to ensure consistency
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T00:00:00`);

        const updatedOrder: Order = {
            ...order,
            title,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            checklist
        };
        onSave(order.projectId, updatedOrder);
        onClose();
    };

    const handleAddItem = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newItemText.trim()) return;

        const newItem: ChecklistItem = {
            id: crypto.randomUUID(),
            text: newItemText.trim(),
            completed: false
        };

        setChecklist([...checklist, newItem]);
        setNewItemText('');
    };

    const handleDeleteItem = (id: string) => {
        setChecklist(checklist.filter(item => item.id !== id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setChecklist((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{
                width: '600px',
                maxWidth: '90%',
                padding: '2rem',
                position: 'relative',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Editar Pedido</h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título</label>
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Fecha Inicio</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Fecha Final</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Checklist
                        <span style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: 'normal',
                            marginTop: '0.25rem'
                        }}>
                            Personaliza las tareas de este pedido.
                        </span>
                    </label>

                    {/* Add Item Form */}
                    <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="Nueva tarea..."
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '4px',
                                color: 'white'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-primary)',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Plus size={20} />
                        </button>
                    </form>

                    {/* Sortable List */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        paddingRight: '0.5rem',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: '0.5rem',
                        borderRadius: '4px'
                    }}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={checklist.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {checklist.map((item) => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <SortableItem
                                                id={item.id}
                                                text={item.text}
                                                onDelete={handleDeleteItem}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </SortableContext>
                        </DndContext>
                        {checklist.length === 0 && (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                No hay tareas.
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <button
                        onClick={() => onDelete(order.projectId, order.id)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            borderRadius: '4px',
                            color: '#fca5a5',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Eliminar Pedido
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'var(--color-primary)',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <Save size={18} />
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditOrderModal;

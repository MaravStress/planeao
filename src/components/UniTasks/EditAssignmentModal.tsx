import React, { useState, useEffect } from 'react';
import type { Assignment, ChecklistItem } from '../../types/uniTasks';
import GoogleIcon from '../GoogleIcon';
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

interface EditAssignmentModalProps {
    assignment: Assignment;
    isOpen: boolean;
    onClose: () => void;
    onSave: (subjectId: string, updatedAssignment: Assignment) => void;
    onDelete: (subjectId: string, assignmentId: string) => void;
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({ assignment, isOpen, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState(assignment.title);
    const [endDate, setEndDate] = useState(assignment.endDate.split('T')[0]);
    const [link, setLink] = useState(assignment.link || '');
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
            setTitle(assignment.title);
            setLink(assignment.link || '');
            // Convert to local YYYY-MM-DD for input
            const end = new Date(assignment.endDate);

            const formatDate = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            setEndDate(formatDate(end));
            setChecklist(assignment.checklist);

            // Focus and select the title input
            setTimeout(() => {
                if (titleInputRef.current) {
                    titleInputRef.current.focus();
                    titleInputRef.current.select();
                }
            }, 100);
        }
    }, [assignment, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        // Create dates at local midnight to ensure consistency
        const end = new Date(`${endDate}T00:00:00`);

        const updatedAssignment: Assignment = {
            ...assignment,
            title,
            endDate: end.toISOString(),
            link: link.trim() || undefined,
            checklist
        };
        onSave(assignment.subjectId, updatedAssignment);
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
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <GoogleIcon name="close" size={24} />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Editar Tarea</h2>

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título</label>
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="glass-input"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Fecha de Entrega</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="glass-input"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Enlace de la Tarea (Opcional)</label>
                    <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://..."
                        className="glass-input"
                        style={{ width: '100%' }}
                    />
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
                            Personaliza las subtareas de esta tarea.
                        </span>
                    </label>

                    {/* Add Item Form */}
                    <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="Nueva subtarea..."
                            className="glass-input"
                            style={{ flex: 1 }}
                        />
                        <button
                            type="submit"
                            className="glass-button"
                            style={{
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <GoogleIcon name="add" size={20} />
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
                                No hay subtareas.
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <button
                        onClick={() => onDelete(assignment.subjectId, assignment.id)}
                        className="glass-button"
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            color: '#fca5a5',
                            fontWeight: 'bold'
                        }}
                    >
                        Eliminar Tarea
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onClose}
                            className="glass-button"
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="glass-button"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'var(--color-primary)',
                                border: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            <GoogleIcon name="save" size={18} />
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAssignmentModal;

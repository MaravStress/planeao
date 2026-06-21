import React, { useState, useEffect } from 'react';
import type { Subject } from '../../types/uniTasks';
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

interface EditSubjectModalProps {
    subject: Subject;
    isOpen: boolean;
    onClose: () => void;
    onSave: (subjectId: string, template: string[], defaultAssignmentDuration: number) => void;
}

interface TemplateItem {
    id: string;
    text: string;
}

const EditSubjectModal: React.FC<EditSubjectModalProps> = ({ subject, isOpen, onClose, onSave }) => {
    const [duration, setDuration] = useState(subject.defaultAssignmentDuration || 7);
    const [items, setItems] = useState<TemplateItem[]>([]);
    const [newItemText, setNewItemText] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (isOpen) {
            setDuration(subject.defaultAssignmentDuration || 7);
            setItems(subject.template.map(t => ({ id: crypto.randomUUID(), text: t })));
        }
    }, [subject, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        const newTemplate = items.map(i => i.text);
        onSave(subject.id, newTemplate, duration);
        onClose();
    };

    const handleAddItem = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newItemText.trim()) return;

        const newItem: TemplateItem = {
            id: crypto.randomUUID(),
            text: newItemText.trim()
        };

        setItems([...items, newItem]);
        setNewItemText('');
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
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
                width: '800px',
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

                <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Configurar Materia</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{subject.name}</p>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Duración por Tarea (días)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min="1"
                            className="glass-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Plantilla de Tareas
                        <span style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: 'normal',
                            marginTop: '0.25rem'
                        }}>
                            Arrastra para reordenar.
                        </span>
                    </label>

                    <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="Nueva subtarea por defecto..."
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
                                items={items.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.map((item) => (
                                    <SortableItem
                                        key={item.id}
                                        id={item.id}
                                        text={item.text}
                                        onDelete={handleDeleteItem}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        {items.length === 0 && (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                No hay tareas en la plantilla por defecto.
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
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

export default EditSubjectModal;

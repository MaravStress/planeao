import React, { useState, useEffect } from 'react';
import type { Project } from '../../types/work';
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

interface EditProjectModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectId: string, name: string, template: string[], defaultOrderDuration: number) => void;
    onDelete: (projectId: string) => void;
}

interface TemplateItem {
    id: string;
    text: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, isOpen, onClose, onSave, onDelete }) => {
    const [name, setName] = useState(project.name);
    const [duration, setDuration] = useState(project.defaultOrderDuration || 7);
    // map string[] to object with IDs for Dnd
    const [items, setItems] = useState<TemplateItem[]>([]);
    const [newItemText, setNewItemText] = useState('');

    const nameInputRef = React.useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (isOpen) {
            setName(project.name);
            setDuration(project.defaultOrderDuration || 7);
            setItems(project.template.map(t => ({ id: crypto.randomUUID(), text: t })));

            // Focus and select the name input
            setTimeout(() => {
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                    nameInputRef.current.select();
                }
            }, 100);
        }
    }, [project, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        // map objects back to string[]
        const newTemplate = items.map(i => i.text);
        onSave(project.id, name, newTemplate, duration);
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
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Editar Proyecto</h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre del Proyecto</label>
                        <input
                            ref={nameInputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                    <div style={{ width: '120px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Duración (días)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min="1"
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
                        Plantilla de Pedidos
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
                                No hay tareas en la plantilla.
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <button
                        onClick={() => onDelete(project.id)}
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
                        Eliminar Proyecto
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

export default EditProjectModal;

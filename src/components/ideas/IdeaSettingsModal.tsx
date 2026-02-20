import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { IdeaSettings, IdeaSettingsItem } from '../../types/ideas';

interface IdeaSettingsModalProps {
    settings: IdeaSettings;
    onSave: (settings: IdeaSettings) => void;
}

const SortableItem = ({ item, onRemove, onColorChange, isStatus }: { item: IdeaSettingsItem, onRemove: (id: string) => void, onColorChange: (id: string, color: string) => void, isStatus?: boolean }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="settings-item">
            <button className="btn-icon" style={{ cursor: 'grab' }} {...attributes} {...listeners}>
                <GripVertical size={16} color="var(--color-text-muted)" />
            </button>
            <input
                type="color"
                value={item.color}
                onChange={(e) => onColorChange(item.id, e.target.value)}
                style={{ width: '24px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' }}
                title="Cambiar color"
            />
            <span className="settings-item-text">{item.name}</span>
            {(!isStatus || item.id.toLowerCase() !== 'idea') && (
                <button
                    className="btn-icon text-danger"
                    onClick={() => onRemove(item.id)}
                    title="Eliminar"
                    style={{ marginLeft: 'auto' }}
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    );
};

const IdeaSettingsModal: React.FC<IdeaSettingsModalProps> = ({ settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState<IdeaSettings>(settings);
    const [newCategory, setNewCategory] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEndStatus = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setLocalSettings((prev) => {
                const oldIndex = prev.statuses.findIndex(s => s.id === active.id);
                const newIndex = prev.statuses.findIndex(s => s.id === over?.id);
                return { ...prev, statuses: arrayMove(prev.statuses, oldIndex, newIndex) };
            });
        }
    };

    const handleDragEndCategory = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setLocalSettings((prev) => {
                const oldIndex = prev.categories.findIndex(c => c.id === active.id);
                const newIndex = prev.categories.findIndex(c => c.id === over?.id);
                return { ...prev, categories: arrayMove(prev.categories, oldIndex, newIndex) };
            });
        }
    };

    const handleAddCategory = () => {
        const name = newCategory.trim();
        if (name && !localSettings.categories.find(c => c.name === name)) {
            setLocalSettings(prev => ({
                ...prev,
                categories: [...prev.categories, { id: name, name, color: '#888888' }]
            }));
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (catToRemoveId: string) => {
        setLocalSettings(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c.id !== catToRemoveId)
        }));
    };

    const handleColorChangeCategory = (id: string, color: string) => {
        setLocalSettings(prev => ({
            ...prev,
            categories: prev.categories.map(c => c.id === id ? { ...c, color } : c)
        }));
    };

    const handleAddStatus = () => {
        const name = newStatus.trim();
        if (name && !localSettings.statuses.find(s => s.name === name)) {
            setLocalSettings(prev => ({
                ...prev,
                statuses: [...prev.statuses, { id: name, name, color: '#888888' }]
            }));
            setNewStatus('');
        }
    };

    const handleRemoveStatus = (statusToRemoveId: string) => {
        if (statusToRemoveId.toLowerCase() === 'idea') return; // Cannot delete default status

        setLocalSettings(prev => ({
            ...prev,
            statuses: prev.statuses.filter(s => s.id !== statusToRemoveId)
        }));
    };

    const handleColorChangeStatus = (id: string, color: string) => {
        setLocalSettings(prev => ({
            ...prev,
            statuses: prev.statuses.map(s => s.id === id ? { ...s, color } : s)
        }));
    };

    const handleSave = () => {
        onSave(localSettings);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleSave()}>
            <div className="idea-modal" style={{ maxWidth: '900px', width: '90%' }}>
                <div className="modal-header">
                    <h2>Configuración de Ideas</h2>
                    <button className="btn-close" onClick={handleSave}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="form-section">
                        <h3>Estados</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem', marginTop: '-1rem' }}>
                            Gestiona los diferentes estados por los que puede pasar una idea.
                        </p>


                        <div className="settings-add-form">
                            <input
                                className="settings-add-input"
                                placeholder="Nuevo estado..."
                                value={newStatus}
                                onChange={e => setNewStatus(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddStatus() }}
                            />
                            <button className="settings-add-btn" onClick={handleAddStatus}>
                                <Plus size={20} />
                            </button>
                        </div>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndStatus}>
                            <SortableContext items={localSettings.statuses.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                <div className="settings-list">
                                    {localSettings.statuses.map((status) => (
                                        <SortableItem key={status.id} item={status} onRemove={handleRemoveStatus} onColorChange={handleColorChangeStatus} isStatus={true} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                    <div className="form-section">
                        <h3>Categorías</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem', marginTop: '-1rem' }}>
                            Define las temáticas o áreas de tus ideas.
                        </p>



                        <div className="settings-add-form">
                            <input
                                className="settings-add-input"
                                placeholder="Nueva categoría..."
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddCategory() }}
                            />
                            <button className="settings-add-btn" onClick={handleAddCategory}>
                                <Plus size={20} />
                            </button>
                        </div>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategory}>
                            <SortableContext items={localSettings.categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                <div className="settings-list">
                                    {localSettings.categories.map((category) => (
                                        <SortableItem key={category.id} item={category} onRemove={handleRemoveCategory} onColorChange={handleColorChangeCategory} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-primary" onClick={handleSave}>Listo</button>
                </div>
            </div>
        </div>
    );
};

export default IdeaSettingsModal;

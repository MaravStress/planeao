import React, { useState } from 'react';
import type { HabitMonthData } from '../../types/habits';
import GoogleIcon from '../GoogleIcon';
import { useHabits } from '../../context/HabitsContext';

interface HabitChecklistProps {
    monthData: HabitMonthData;
}

const HabitChecklist: React.FC<HabitChecklistProps> = ({ monthData }) => {
    const { addChecklistItem, toggleChecklistItem, removeChecklistItem, reorderChecklist } = useHabits();
    const [newTask, setNewTask] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const checklist = monthData.checklist || [];
    const completedCount = checklist.filter((item) => item.completed).length;

    const monthId = monthData.id;

    const handleAdd = () => {
        addChecklistItem(monthId, newTask);
        setNewTask('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        reorderChecklist(monthId, draggedIndex, index);
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="habit-checklist">
            <div className="habit-checklist-header">
                <h4 className="habit-checklist-title">
                    <GoogleIcon name="checklist" size={18} />
                    <span>Metas del Mes</span>
                </h4>
                <span className="habit-checklist-count">
                    {completedCount}/{checklist.length}
                </span>
            </div>

            <div className="habit-checklist-input-row">
                <input
                    type="text"
                    className="habit-checklist-input"
                    placeholder="Agregar una meta/acción..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="habit-checklist-add-btn"
                    onClick={handleAdd}
                    title="Agregar"
                >
                    <GoogleIcon name="add" size={20} />
                </button>
            </div>

            {checklist.length === 0 && (
                <p className="habit-checklist-empty">Sin metas añadidas. Agrega una tarea arriba.</p>
            )}

            {checklist.length > 0 && (
                <div className="habit-checklist-list">
                    {checklist.map((item, index) => (
                        <div
                            key={item.id}
                            className={`habit-checklist-item ${item.completed ? 'completed' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            style={{ cursor: 'grab' }}
                        >
                            <div
                                className="habit-checklist-drag"
                                style={{ cursor: 'grab', display: 'flex', alignItems: 'center', opacity: 0.5 }}
                                title="Arrastrar para reordenar"
                            >
                                <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                                    <circle cx="4" cy="4" r="1.5" />
                                    <circle cx="4" cy="10" r="1.5" />
                                    <circle cx="4" cy="16" r="1.5" />
                                    <circle cx="8" cy="4" r="1.5" />
                                    <circle cx="8" cy="10" r="1.5" />
                                    <circle cx="8" cy="16" r="1.5" />
                                </svg>
                            </div>
                            <button
                                className="habit-checklist-toggle"
                                onClick={() => toggleChecklistItem(monthId, item.id)}
                                title="Marcar / desmarcar"
                            >
                                {item.completed
                                    ? <GoogleIcon name="check_box" size={20} />
                                    : <GoogleIcon name="check_box_outline_blank" size={20} />}
                            </button>
                            <span className="habit-checklist-text">{item.text}</span>
                            <button
                                className="habit-checklist-delete"
                                onClick={() => removeChecklistItem(monthId, item.id)}
                                title="Eliminar"
                            >
                                <GoogleIcon name="delete" size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HabitChecklist;
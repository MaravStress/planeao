import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export interface Habit {
    id: string;
    name: string;
    active: boolean;
}

interface HabitListProps {
    habits: Habit[];
    completedHabitIds: string[];
    onToggleHabit: (id: string) => void;
    onAddHabit: (name: string) => void;
    onRemoveHabit: (id: string) => void;
}

const HabitList: React.FC<HabitListProps> = ({
    habits,
    completedHabitIds,
    onToggleHabit,
    onAddHabit,
    onRemoveHabit
}) => {
    const [newHabitName, setNewHabitName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitName.trim()) {
            onAddHabit(newHabitName.trim());
            setNewHabitName('');
            setIsAdding(false);
        }
    };

    return (
        <div className="habit-list-container glass-panel">
            <div className="section-header">
                <h3>Hábitos</h3>
                <button
                    className="btn-icon-small"
                    onClick={() => setIsAdding(!isAdding)}
                    aria-label="Agregar hábito"
                >
                    <Plus size={20} />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="add-habit-form">
                    <input
                        type="text"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="Nuevo hábito..."
                        autoFocus
                    />
                    <button type="submit" className="btn-primary-small">Agregar</button>
                </form>
            )}

            <div className="habits-grid">
                {habits.length === 0 ? (
                    <p className="empty-state">No tienes hábitos configurados.</p>
                ) : (
                    habits.map(habit => {
                        const isCompleted = completedHabitIds.includes(habit.id);
                        return (
                            <div key={habit.id} className={`habit-item ${isCompleted ? 'completed' : ''}`}>
                                <div
                                    className="habit-check-area"
                                    onClick={() => onToggleHabit(habit.id)}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="check-icon completed" size={24} />
                                    ) : (
                                        <Circle className="check-icon" size={24} />
                                    )}
                                    <span className="habit-name">{habit.name}</span>
                                </div>
                                <button
                                    className="btn-delete-habit"
                                    onClick={() => onRemoveHabit(habit.id)}
                                    aria-label="Eliminar hábito"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default HabitList;

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import '../../styles/PomodoroDnD.css';

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

const PomodoroTasks: React.FC = () => {
    // Load tasks from localStorage
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('pomodoro-tasks');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse tasks", e);
                return [];
            }
        }
        return [];
    });

    const [newTask, setNewTask] = useState('');

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: uuidv4(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const playCheckSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => {
            if (t.id === id) {
                const newCompleted = !t.completed;
                if (newCompleted) playCheckSound();
                return { ...t, completed: newCompleted };
            }
            return t;
        }));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addTask();
        }
    };

    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedItemIndex(index);
        // Required for Firefox
        e.dataTransfer.effectAllowed = 'move';
        // Set a transparent drag image or similar if needed, but default is usually fine
        // Adding a class to style the drag source if desired
        // setTimeout(() => e.target.classList.add('dragging'), 0);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        // Prevent default to allow drop
        e.preventDefault();

        if (draggedItemIndex === null || draggedItemIndex === index) return;

        // Reorder list while dragging
        const newTasks = [...tasks];
        const draggedTask = newTasks[draggedItemIndex];

        // Remove from old index
        newTasks.splice(draggedItemIndex, 1);
        // Add to new index
        newTasks.splice(index, 0, draggedTask);

        setTasks(newTasks);
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    return (
        <div className="pomodoro-tasks glass-panel">
            <h3>
                <span>Tareas de la Sesión</span>
                <span className="task-count" style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                    {tasks.filter(t => t.completed).length}/{tasks.length}
                </span>
            </h3>

            <div className="task-input-container">
                <input
                    type="text"
                    placeholder="Agregar una tarea..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="task-input"
                />
                <button onClick={addTask} className="btn-add-task">
                    <Plus size={20} />
                </button>
            </div>

            <div className="task-list">
                {tasks.length === 0 && <p className="no-tasks">No hay tareas pendientes</p>}
                {tasks.map((task, index) => (
                    <div
                        key={task.id}
                        className={`task-item ${task.completed ? 'completed' : ''} ${draggedItemIndex === index ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        style={{ cursor: 'grab' }}
                    >
                        <div className="drag-handle" style={{ marginRight: '8px', cursor: 'grab', display: 'flex', alignItems: 'center', opacity: 0.5 }}>
                            <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                                <circle cx="4" cy="4" r="1.5" />
                                <circle cx="4" cy="10" r="1.5" />
                                <circle cx="4" cy="16" r="1.5" />
                                <circle cx="8" cy="4" r="1.5" />
                                <circle cx="8" cy="10" r="1.5" />
                                <circle cx="8" cy="16" r="1.5" />
                            </svg>
                        </div>
                        <button onClick={() => toggleTask(task.id)} className="btn-toggle-task">
                            {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <span className="task-text">{task.text}</span>
                        <button onClick={() => deleteTask(task.id)} className="btn-delete-task">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PomodoroTasks;

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
                {tasks.map(task => (
                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
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

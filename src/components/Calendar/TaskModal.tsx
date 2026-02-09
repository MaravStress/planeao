import React, { useState, useEffect } from 'react';
import { X, Clock, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: { title: string; description: string; duration: number }) => void;
    initialDate: Date | null;
    initialHour: number | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialDate, initialHour }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(60); // Default 1 hour

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setDuration(60);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, description, duration });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h3>Nueva Tarea</h3>
                    <button onClick={onClose} className="btn-close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="¿Qué vas a hacer?"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-info">
                        <div className="info-item">
                            <Clock size={16} />
                            <span>
                                {initialDate && format(initialDate, 'd MMM')} - {initialHour}:00
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Duración (minutos)</label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                        >
                            <option value={15}>15 min</option>
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>1 hora</option>
                            <option value={90}>1.5 horas</option>
                            <option value={120}>2 horas</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <div className="input-wrapper">
                            <AlignLeft size={16} className="input-icon" />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detalles adicionales..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Guardar Tarea
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;

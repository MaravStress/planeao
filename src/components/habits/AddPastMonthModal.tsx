import React, { useState } from 'react';
import GoogleIcon from '../GoogleIcon';
import { useHabits } from '../../context/HabitsContext';

interface AddPastMonthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMonthAdded?: (monthId: string) => void;
}

const MONTH_NAMES = [
    'Enero (1)',
    'Febrero (2)',
    'Marzo (3)',
    'Abril (4)',
    'Mayo (5)',
    'Junio (6)',
    'Julio (7)',
    'Agosto (8)',
    'Septiembre (9)',
    'Octubre (10)',
    'Noviembre (11)',
    'Diciembre (12)'
];

const AddPastMonthModal: React.FC<AddPastMonthModalProps> = ({ isOpen, onClose, onMonthAdded }) => {
    const { addMonth } = useHabits();

    const now = new Date();
    // Default to previous month if possible
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [selectedMonth, setSelectedMonth] = useState<number>(prevMonthDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(prevMonthDate.getFullYear());
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const year = Number(selectedYear);
        const month = Number(selectedMonth);

        if (isNaN(year) || year < 1970 || year > 2100) {
            setInfoMessage('Por favor ingresa un año válido (ej. 2026).');
            return;
        }

        const result = addMonth(year, month);
        if (!result.isNew) {
            setInfoMessage(`El mes ${month} - ${year} ya existe en tu registro.`);
            setTimeout(() => {
                onMonthAdded?.(result.month.id);
                onClose();
            }, 900);
            return;
        }

        onMonthAdded?.(result.month.id);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="habit-settings-modal add-month-modal">
                <div className="modal-header">
                    <h2>Añadir Mes Pasado</h2>
                    <button className="btn-close" onClick={onClose} type="button">
                        <GoogleIcon name="close" size={24} />
                    </button>
                </div>

                <form onSubmit={handleAdd}>
                    <div className="modal-body" style={{ gap: '1.25rem' }}>
                        <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                            Selecciona el mes y año que deseas añadir a tu historial de hábitos.
                        </p>

                        <div className="add-month-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Mes</label>
                                <select
                                    className="glass-input"
                                    value={selectedMonth}
                                    onChange={(e) => {
                                        setSelectedMonth(Number(e.target.value));
                                        setInfoMessage(null);
                                    }}
                                    style={{ width: '100%', cursor: 'pointer', padding: '0.65rem' }}
                                >
                                    {MONTH_NAMES.map((name, idx) => (
                                        <option key={idx + 1} value={idx + 1}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Año</label>
                                <input
                                    type="number"
                                    className="glass-input"
                                    min="1970"
                                    max="2100"
                                    value={selectedYear}
                                    onChange={(e) => {
                                        setSelectedYear(Number(e.target.value));
                                        setInfoMessage(null);
                                    }}
                                    style={{ width: '100%', padding: '0.65rem' }}
                                />
                            </div>
                        </div>

                        {infoMessage && (
                            <div style={{ color: 'var(--color-warning)', fontSize: '0.85rem' }}>
                                {infoMessage}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-sm)' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.4rem' }}>
                            Añadir Mes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPastMonthModal;

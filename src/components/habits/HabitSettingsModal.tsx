import React, { useState } from 'react';
import GoogleIcon from '../GoogleIcon';
import { useHabits } from '../../context/HabitsContext';
import type { HabitField, HabitSettings } from '../../types/habits';

interface HabitSettingsModalProps {
    onSave: () => void;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 10;

const HabitsSettingsModal: React.FC<HabitSettingsModalProps> = ({ onSave }) => {
    const { settings, updateSettings } = useHabits();
    const [localSettings, setLocalSettings] = useState<HabitSettings>(settings);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<HabitField['type']>('boolean');
    const [newMin, setNewMin] = useState<number>(DEFAULT_MIN);
    const [newMax, setNewMax] = useState<number>(DEFAULT_MAX);

    const updateField = (id: string, patch: Partial<HabitField>) => {
        setLocalSettings(prev => ({
            ...prev,
            fields: prev.fields.map(f => (f.id === id ? { ...f, ...patch } : f))
        }));
    };

    const removeField = (id: string) => {
        setLocalSettings(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
    };

    const handleAdd = () => {
        const name = newName.trim();
        if (!name) return;
        const field: HabitField = {
            id: crypto.randomUUID(),
            name,
            type: newType,
            min: newType === 'range' ? newMin : undefined,
            max: newType === 'range' ? newMax : undefined
        };
        setLocalSettings(prev => ({ ...prev, fields: [...prev.fields, field] }));
        setNewName('');
    };

    const handleSave = () => {
        const cleaned: HabitSettings = {
            fields: localSettings.fields.map(f => (f.type === 'boolean'
                ? { id: f.id, name: f.name, type: 'boolean' }
                : { id: f.id, name: f.name, type: 'range', min: f.min ?? DEFAULT_MIN, max: f.max ?? DEFAULT_MAX }))
        };
        updateSettings(cleaned);
        onSave();
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleSave()}>
            <div className="habit-settings-modal">
                <div className="modal-header">
                    <h2>Configurar Hábitos</h2>
                    <button className="btn-close" onClick={handleSave}><GoogleIcon name="close" size={24} /></button>
                </div>

                <div className="modal-body">
                    <p className="text-muted" style={{ fontSize: '0.88rem', margin: 0 }}>
                        Cada campo es un hábito a registrar. Puede tener un valor <strong>booleano</strong>
                        (hecho / no hecho) o un valor <strong>numérico</strong> dentro de un rango (min – max).
                    </p>

                    <div className="habit-add-form">
                        <input
                            className="glass-input"
                            placeholder="Nombre del hábito..."
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                            style={{ flex: 1 }}
                        />
                        <select
                            className="glass-input"
                            value={newType}
                            onChange={e => setNewType(e.target.value as HabitField['type'])}
                            style={{ width: '110px', cursor: 'pointer' }}
                        >
                            <option value="boolean">Booleano</option>
                            <option value="range">Rango</option>
                        </select>
                        {newType === 'range' && (
                            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    className="glass-input"
                                    style={{ width: '70px' }}
                                    value={newMin}
                                    onChange={e => setNewMin(Number(e.target.value))}
                                />
                                <span style={{ color: 'var(--color-text-muted)' }}>–</span>
                                <input
                                    type="number"
                                    className="glass-input"
                                    style={{ width: '70px' }}
                                    value={newMax}
                                    onChange={e => setNewMax(Number(e.target.value))}
                                />
                            </div>
                        )}
                        <button className="settings-add-btn" onClick={handleAdd}>
                            <GoogleIcon name="add" size={20} />
                        </button>
                    </div>

                    <div className="settings-list habit-settings-list">
                        {localSettings.fields.length === 0 ? (
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', padding: '1rem', textAlign: 'center' }}>
                                No hay hábitos configurados. Añade el primero arriba.
                            </div>
                        ) : localSettings.fields.map(field => (
                            <div key={field.id} className="habit-config-item">
                                <input
                                    className="settings-item-text-input"
                                    value={field.name}
                                    onChange={e => updateField(field.id, { name: e.target.value })}
                                />
                                <select
                                    className="glass-input"
                                    value={field.type}
                                    onChange={e => {
                                        const type = e.target.value as HabitField['type'];
                                        updateField(field.id, {
                                            type,
                                            min: type === 'range' ? (field.min ?? DEFAULT_MIN) : undefined,
                                            max: type === 'range' ? (field.max ?? DEFAULT_MAX) : undefined
                                        });
                                    }}
                                    style={{ width: '110px', cursor: 'pointer' }}
                                >
                                    <option value="boolean">Booleano</option>
                                    <option value="range">Rango</option>
                                </select>
                                {field.type === 'range' && (
                                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            className="glass-input"
                                            style={{ width: '70px' }}
                                            value={field.min ?? DEFAULT_MIN}
                                            onChange={e => updateField(field.id, { min: Number(e.target.value) })}
                                        />
                                        <span style={{ color: 'var(--color-text-muted)' }}>–</span>
                                        <input
                                            type="number"
                                            className="glass-input"
                                            style={{ width: '70px' }}
                                            value={field.max ?? DEFAULT_MAX}
                                            onChange={e => updateField(field.id, { max: Number(e.target.value) })}
                                        />
                                    </div>
                                )}
                                <button
                                    className="btn-icon text-danger"
                                    onClick={() => removeField(field.id)}
                                    title="Eliminar"
                                >
                                    <GoogleIcon name="delete" size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-primary" onClick={handleSave}>Listo</button>
                </div>
            </div>
        </div>
    );
};

export default HabitsSettingsModal;
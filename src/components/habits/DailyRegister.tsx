import React, { useState, useEffect, useRef } from 'react';
import type { HabitField, HabitMonthData } from '../../types/habits';
import GoogleIcon from '../GoogleIcon';

interface DailyRegisterProps {
    months: HabitMonthData[];
    fields: HabitField[];
    onUpdateNote: (monthId: string, day: number, note: string) => void;
    onUpdateValue: (monthId: string, day: number, fieldId: string, value: boolean | number | undefined) => void;
}

const getTodayInfo = () => {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
    };
};

const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/* ── Compact Range Slider ────────────────────────────── */
interface CompactRangeSliderProps {
    field: HabitField;
    value: number | undefined;
    onChange: (val: number) => void;
}

const CompactRangeSlider: React.FC<CompactRangeSliderProps> = ({ field, value, onChange }) => {
    const min = field.min ?? 0;
    const max = field.max ?? 10;
    const hasVal = typeof value === 'number';
    const currentVal = hasVal ? value : min;
    const safeMax = max > min ? max : min + 1;
    const percent = Math.max(0, Math.min(100, ((currentVal - min) / (safeMax - min)) * 100));

    return (
        <div className={`dr-range-field ${hasVal ? 'has-value' : ''}`}>
            <span className="dr-field-label">{field.name}</span>
            <div className="dr-range-slider-wrapper">
                <div className="dr-range-track" />
                <div className="dr-range-thumb" style={{ left: `calc(12px + (100% - 24px) * ${percent / 100})` }}>
                    <span className="dr-range-thumb-val">{currentVal}</span>
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={1}
                    value={currentVal}
                    className="dr-range-input"
                    onChange={(e) => onChange(Number(e.target.value))}
                />
            </div>
        </div>
    );
};

/* ── Compact Progress Slider ─────────────────────────── */
interface CompactProgressSliderProps {
    field: HabitField;
    value: number;
    onChange: (val: number | undefined) => void;
}

const CompactProgressSlider: React.FC<CompactProgressSliderProps> = ({ field, value, onChange }) => {
    const hasVal = value >= 0;
    const currentVal = hasVal ? value : 1;
    const labels = ['Bajo', 'Igual', 'Positivo'];
    const colors = ['#ef4444', '#f59e0b', '#22c55e'];
    const icons = ['trending_down', 'horizontal_rule', 'trending_up'];

    const handleChange = (newVal: number) => {
        if (value === newVal) {
            onChange(undefined);
        } else {
            onChange(newVal);
        }
    };

    return (
        <div className="dr-mood-field">
            <span className="dr-field-label">{field.name}</span>
            <div className="dr-mood-buttons">
                {[0, 1, 2].map((idx) => (
                    <button
                        key={idx}
                        className={`dr-mood-btn ${currentVal === idx && hasVal ? 'active' : ''}`}
                        style={{
                            borderColor: currentVal === idx && hasVal ? colors[idx] : 'rgba(255,255,255,0.15)',
                            background: currentVal === idx && hasVal ? `${colors[idx]}22` : 'transparent'
                        }}
                        onClick={() => handleChange(idx)}
                        title={labels[idx]}
                    >
                        <GoogleIcon name={icons[idx]} size={16} style={{ color: currentVal === idx && hasVal ? colors[idx] : 'rgba(255,255,255,0.4)' }} />
                    </button>
                ))}
            </div>
        </div>
    );
};

/* ── Compact Mood Slider ─────────────────────────────── */
interface CompactMoodSliderProps {
    field: HabitField;
    value: number;
    onChange: (val: number | undefined) => void;
}

const CompactMoodSlider: React.FC<CompactMoodSliderProps> = ({ field, value, onChange }) => {
    const hasVal = value >= 0;
    const currentVal = hasVal ? value : 1;
    const labels = ['Triste', 'Normal', 'Feliz'];
    const colors = ['#6366f1', '#a78bfa', '#ec4899'];
    const icons = ['sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied'];

    const handleChange = (newVal: number) => {
        if (value === newVal) {
            onChange(undefined);
        } else {
            onChange(newVal);
        }
    };

    return (
        <div className="dr-mood-field">
            <span className="dr-field-label">{field.name}</span>
            <div className="dr-mood-buttons">
                {[0, 1, 2].map((idx) => (
                    <button
                        key={idx}
                        className={`dr-mood-btn ${currentVal === idx && hasVal ? 'active' : ''}`}
                        style={{
                            borderColor: currentVal === idx && hasVal ? colors[idx] : 'rgba(255,255,255,0.15)',
                            background: currentVal === idx && hasVal ? `${colors[idx]}22` : 'transparent'
                        }}
                        onClick={() => handleChange(idx)}
                        title={labels[idx]}
                    >
                        <GoogleIcon name={icons[idx]} size={16} style={{ color: currentVal === idx && hasVal ? colors[idx] : 'rgba(255,255,255,0.4)' }} />
                    </button>
                ))}
            </div>
        </div>
    );
};

/* ── Main Component ──────────────────────────────────── */
const DailyRegister: React.FC<DailyRegisterProps> = ({ months, fields, onUpdateNote, onUpdateValue }) => {
    const { year, month, day } = getTodayInfo();
    const todayMonthId = `${year}-${String(month).padStart(2, '0')}`;
    const todayMonth = months.find((m) => m.id === todayMonthId);
    const todayEntry = todayMonth?.days?.[day];
    const [note, setNote] = useState(todayEntry?.note || '');
    const inputRef = useRef<HTMLInputElement>(null);

    const rangeFields = fields.filter((f) => f.type === 'range');
    const progressFields = fields.filter((f) => f.type === 'progress');
    const moodFields = fields.filter((f) => f.type === 'mood');
    const booleanFields = fields.filter((f) => f.type === 'boolean');

    // Sync note if data changes externally
    useEffect(() => {
        setNote(todayEntry?.note || '');
    }, [todayEntry?.note]);

    const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNote(val);
        if (todayMonth) {
            onUpdateNote(todayMonthId, day, val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const todayRow = document.querySelector('.is-today-row');
            if (todayRow) {
                todayRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                todayRow.classList.add('highlight-flash');
                setTimeout(() => todayRow.classList.remove('highlight-flash'), 1500);
            }
        }
    };

    if (!todayMonth) return null;

    const todayValues = todayEntry?.values || {};
    const hasFields = fields.length > 0;

    return (
        <div className="daily-register-card">
            <div className="daily-register-header">
                <div className="daily-register-title-row">
                    <GoogleIcon name="edit_note" size={22} />
                    <span className="daily-register-title">Registro del Día</span>
                    <span className="daily-register-date">
                        {day} de {MONTH_NAMES_ES[month - 1]} {year}
                    </span>
                </div>
                <span className="daily-register-hint">
                    {hasFields ? 'Registra tu nota y todos tus hábitos del día aquí' : 'Escribe y presiona Enter para ir a la tabla'}
                </span>
            </div>

            {/* Note input */}
            <div className="daily-register-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    className="daily-register-input"
                    placeholder="¿Qué hiciste hoy? Escribe aquí tu registro diario..."
                    value={note}
                    onChange={handleNoteChange}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                {note && (
                    <button
                        className="daily-register-clear"
                        onClick={() => {
                            setNote('');
                            if (todayMonth) {
                                onUpdateNote(todayMonthId, day, '');
                            }
                            inputRef.current?.focus();
                        }}
                        title="Limpiar registro"
                    >
                        <GoogleIcon name="close" size={16} />
                    </button>
                )}
            </div>

            {/* Habit fields */}
            {hasFields && (
                <div className="dr-fields-grid">
                    {/* Boolean fields */}
                    {booleanFields.map((field) => {
                        const isChecked = todayValues[field.id] === true;
                        return (
                            <button
                                key={field.id}
                                className={`dr-boolean-field ${isChecked ? 'is-checked' : ''}`}
                                onClick={() => onUpdateValue(todayMonthId, day, field.id, !isChecked)}
                                title={`${field.name}: ${isChecked ? 'Completado' : 'No completado'}`}
                            >
                                <span className="dr-field-label">{field.name}</span>
                                <div className="dr-boolean-indicator">
                                    {isChecked ? (
                                        <GoogleIcon name="check_circle" size={20} style={{ color: '#22c55e' }} />
                                    ) : (
                                        <div className="dr-boolean-empty" />
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {/* Range fields */}
                    {rangeFields.map((field) => (
                        <CompactRangeSlider
                            key={field.id}
                            field={field}
                            value={typeof todayValues[field.id] === 'number' ? todayValues[field.id] as number : undefined}
                            onChange={(val) => onUpdateValue(todayMonthId, day, field.id, val)}
                        />
                    ))}

                    {/* Progress fields */}
                    {progressFields.map((field) => (
                        <CompactProgressSlider
                            key={field.id}
                            field={field}
                            value={typeof todayValues[field.id] === 'number' ? todayValues[field.id] as number : -1}
                            onChange={(v) => onUpdateValue(todayMonthId, day, field.id, v)}
                        />
                    ))}

                    {/* Mood fields */}
                    {moodFields.map((field) => (
                        <CompactMoodSlider
                            key={field.id}
                            field={field}
                            value={typeof todayValues[field.id] === 'number' ? todayValues[field.id] as number : -1}
                            onChange={(v) => onUpdateValue(todayMonthId, day, field.id, v)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DailyRegister;
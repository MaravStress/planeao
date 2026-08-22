import React, { useState } from 'react';
import type { HabitField, HabitMonthData } from '../../types/habits';
import { useHabits } from '../../context/HabitsContext';
import GoogleIcon from '../GoogleIcon';
import HabitChecklist from './HabitChecklist';

interface HabitMonthTableProps {
    monthData: HabitMonthData;
    fields: HabitField[];
    onOpenSettings?: () => void;
}

const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getDaysInMonth = (year: number, month: number): number => {
    const y = Number.isFinite(year) ? Math.floor(year) : 2000;
    const m = Number.isFinite(month) ? Math.floor(month) : 1;
    // JS Date is 1-indexed for months, so day 0 = last day of the previous month.
    return new Date(y, m, 0).getDate();
};

interface HabitRangeSliderProps {
    min: number;
    max: number;
    value: number | undefined;
    onChange: (val: number) => void;
}

const HabitRangeSlider: React.FC<HabitRangeSliderProps> = ({ min, max, value, onChange }) => {
    const hasVal = typeof value === 'number';
    const currentVal = hasVal ? value : min;
    const safeMax = max > min ? max : min + 1;
    const percent = Math.max(0, Math.min(100, ((currentVal - min) / (safeMax - min)) * 100));

    return (
        <div
            className={`habit-slider-container ${hasVal ? 'has-value' : 'is-empty'}`}
            title={`Valor: ${currentVal} (Rango: ${min} – ${max})`}
        >
            <div className="habit-slider-track" />
            <div
                className="habit-slider-thumb"
                style={{ left: `calc(12px + (100% - 24px) * ${percent / 100})` }}
            >
                <span className="habit-slider-thumb-text">{currentVal}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={1}
                value={currentVal}
                className="habit-slider-native-input"
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
};

const HabitMonthTable: React.FC<HabitMonthTableProps> = ({ monthData, fields, onOpenSettings }) => {
    const { updateDayNote, updateDayValue, deleteMonth, months } = useHabits();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Filter fields: first ranges, then booleans
    const rangeFields = fields.filter((f) => f.type === 'range');
    const booleanFields = fields.filter((f) => f.type === 'boolean');

    const daysInMonth = getDaysInMonth(monthData.year, monthData.month);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const now = new Date();
    const isCurrentMonth = now.getFullYear() === monthData.year && now.getMonth() + 1 === monthData.month;
    const currentDay = now.getDate();

    const monthName = MONTH_NAMES_ES[monthData.month - 1] || `Mes ${monthData.month}`;

    const handleDelete = () => {
        if (window.confirm(`¿Seguro que deseas eliminar el registro de ${monthName} ${monthData.year}?`)) {
            deleteMonth(monthData.id);
        }
    };

    // Calculate completion stats
    const totalPossibleChecks = daysInMonth * (booleanFields.length + rangeFields.length);
    let totalCompletedChecks = 0;
    daysArray.forEach((d) => {
        const entry = monthData.days[d];
        if (entry?.values) {
            booleanFields.forEach((bf) => {
                if (entry.values?.[bf.id] === true) totalCompletedChecks++;
            });
            rangeFields.forEach((rf) => {
                if (typeof entry.values?.[rf.id] === 'number') totalCompletedChecks++;
            });
        }
    });

    const completionRate = totalPossibleChecks > 0 ? Math.round((totalCompletedChecks / totalPossibleChecks) * 100) : 0;

    return (
        <div className="habit-month-card" id={`month-${monthData.id}`}>
            {/* Header of the Month Container */}
            <div className="habit-month-header">
                <div className="habit-month-title-wrapper">
                    <span className="habit-month-badge-number">
                        {monthData.month} - {monthData.year}
                    </span>
                    <span className="habit-month-name-sub">
                        {monthName} {monthData.year}
                    </span>
                    {isCurrentMonth && (
                        <span className="habit-current-tag">Mes Actual</span>
                    )}
                </div>

                <div className="habit-month-actions">
                    {fields.length > 0 && (
                        <span className="habit-stats-chip" title="Progreso global del mes">
                            <GoogleIcon name="monitoring" size={16} />
                            {completionRate}% completado
                        </span>
                    )}

                    <button
                        className="btn-icon habit-action-btn"
                        onClick={() => setIsCollapsed((prev) => !prev)}
                        title={isCollapsed ? 'Expandir tabla' : 'Colapsar tabla'}
                    >
                        <GoogleIcon name={isCollapsed ? 'expand_more' : 'expand_less'} size={20} />
                    </button>

                    {months.length > 1 && (
                        <button
                            className="btn-icon habit-action-btn delete-btn"
                            onClick={handleDelete}
                            title="Eliminar este mes"
                        >
                            <GoogleIcon name="delete" size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Body of the Month Container */}
            {!isCollapsed && (
                <>
                    <div className="habit-checklist-wrapper">
                        <HabitChecklist monthData={monthData} />
                    </div>

                    <div className="habit-table-responsive-container">
                        {fields.length === 0 ? (
                            <div className="habit-empty-fields-notice">
                                <GoogleIcon name="tune" size={32} style={{ color: 'var(--color-primary)' }} />
                                <p>No tienes hábitos configurados para este mes.</p>
                                <button className="btn-primary" onClick={onOpenSettings} style={{ marginTop: '0.5rem' }}>
                                    Configurar Hábitos
                                </button>
                            </div>
                        ) : (
                        <table className="habit-wireframe-table">
                            <thead>
                                <tr className="habit-header-row">
                                    {/* Column 1: Day numbers */}
                                    <th className="habit-col-day-head">#</th>

                                    {/* Column 2: Note / What I did today */}
                                    <th className="habit-col-notes-head">
                                        <div className="notes-header-content">
                                            <span>¿Qué hice hoy?</span>
                                        </div>
                                    </th>

                                    {/* Range field headers (First) */}
                                    {rangeFields.map((field) => (
                                        <th
                                            key={field.id}
                                            className="habit-col-field-head habit-range-col-head"
                                            title={`${field.name} (${field.min ?? 0} – ${field.max ?? 10})`}
                                        >
                                            <div className="vertical-header-text">
                                                <span>{field.name}</span>
                                            </div>
                                        </th>
                                    ))}

                                    {/* Boolean field headers (Second) */}
                                    {booleanFields.map((field) => (
                                        <th
                                            key={field.id}
                                            className="habit-col-field-head habit-boolean-col-head"
                                            title={field.name}
                                        >
                                            <div className="vertical-header-text">
                                                <span>{field.name}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {daysArray.map((day) => {
                                    const entry = monthData.days[day] || { values: {} };
                                    const isToday = isCurrentMonth && day === currentDay;

                                    return (
                                        <tr key={day} className={`habit-day-row ${isToday ? 'is-today-row' : ''}`}>
                                            {/* Column 1: Day Number */}
                                            <td className="habit-cell-day">
                                                <span className={`day-number-label ${isToday ? 'today-badge' : ''}`}>
                                                    {day}
                                                </span>
                                            </td>

                                            {/* Column 2: What I did today (Note) */}
                                            <td className="habit-cell-note">
                                                <input
                                                    type="text"
                                                    className="habit-note-input"
                                                    placeholder="Anotar lo que hice hoy..."
                                                    value={entry.note || ''}
                                                    onChange={(e) => updateDayNote(monthData.id, day, e.target.value)}
                                                />
                                            </td>

                                            {/* Range field cells with slider */}
                                            {rangeFields.map((field) => {
                                                const rawVal = entry.values?.[field.id];
                                                const min = field.min ?? 0;
                                                const max = field.max ?? 10;

                                                return (
                                                    <td key={field.id} className="habit-cell-range">
                                                        <HabitRangeSlider
                                                            min={min}
                                                            max={max}
                                                            value={typeof rawVal === 'number' ? rawVal : undefined}
                                                            onChange={(val) => {
                                                                updateDayValue(monthData.id, day, field.id, val);
                                                            }}
                                                        />
                                                    </td>
                                                );
                                            })}

                                            {/* Boolean field cells */}
                                            {booleanFields.map((field) => {
                                                const isChecked = entry.values?.[field.id] === true;

                                                return (
                                                    <td
                                                        key={field.id}
                                                        className={`habit-cell-boolean ${isChecked ? 'is-checked' : ''}`}
                                                        onClick={() => {
                                                            updateDayValue(monthData.id, day, field.id, !isChecked);
                                                        }}
                                                        title={`${field.name}: ${isChecked ? 'Completado' : 'No completado'}`}
                                                    >
                                                        <div className="boolean-fill-indicator" />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    </div>
                </>
            )}
        </div>
    );
};

export default HabitMonthTable;

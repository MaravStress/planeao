import React from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoryEntry {
    date: string; // ISO date string YYYY-MM-DD
    completedCount: number;
    totalHabits: number;
    description: string;
}

interface HistoryViewProps {
    currentDate: Date;
    history: HistoryEntry[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ currentDate, history }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getEntryForDay = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return history.find(entry => entry.date === dateStr);
    };

    return (
        <div className="history-view-container glass-panel">
            <div className="history-header">
                <h3>Historial - {format(currentDate, 'MMMM yyyy', { locale: es })}</h3>
            </div>

            <div className="history-grid">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <div key={i} className="history-day-header">{d}</div>
                ))}

                {/* Placeholder for empty days at start of month could be added here if needed for exact alignment */}

                {days.map(day => {
                    const entry = getEntryForDay(day);
                    // Calculate intensity based on completion percentage
                    const percentage = entry && entry.totalHabits > 0
                        ? (entry.completedCount / entry.totalHabits) * 100
                        : 0;

                    let intensityClass = 'intensity-0';
                    if (percentage > 0) intensityClass = 'intensity-1';
                    if (percentage > 40) intensityClass = 'intensity-2';
                    if (percentage > 75) intensityClass = 'intensity-3';
                    if (percentage === 100) intensityClass = 'intensity-4';

                    return (
                        <div
                            key={day.toISOString()}
                            className={`history-day ${intensityClass} ${isToday(day) ? 'is-today' : ''}`}
                            title={entry ? `${entry.completedCount}/${entry.totalHabits} hábitos\n${entry.description}` : 'Sin datos'}
                        >
                            <span className="day-number">{format(day, 'd')}</span>
                        </div>
                    );
                })}
            </div>

            <div className="history-legend">
                <div className="legend-item"><span className="dot intensity-0"></span> 0%</div>
                <div className="legend-item"><span className="dot intensity-2"></span> 50%</div>
                <div className="legend-item"><span className="dot intensity-4"></span> 100%</div>
            </div>
        </div>
    );
};

export default HistoryView;

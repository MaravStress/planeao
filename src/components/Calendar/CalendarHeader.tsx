import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
    wakeHour: number;
    sleepHour: number;
    onWakeHourChange: (hour: number) => void;
    onSleepHourChange: (hour: number) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    onPrevWeek,
    onNextWeek,
    onToday,
    wakeHour,
    sleepHour,
    onWakeHourChange,
    onSleepHourChange
}) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="calendar-header glass-panel">
            <div className="header-left">
                <div className="icon-wrapper">
                    <CalendarIcon size={24} className="text-primary" />
                </div>
                <h2 className="month-title">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h2>
            </div>

            <div className="header-center-controls">
                <div className="time-control">
                    <Sun size={16} className="text-warning" />
                    <select
                        value={wakeHour}
                        onChange={(e) => onWakeHourChange(Number(e.target.value))}
                        className="glass-select"
                        title="Hora de despertar"
                    >
                        {hours.map(h => (
                            <option key={`wake-${h}`} value={h}>{h.toString().padStart(2, '0')}:00</option>
                        ))}
                    </select>
                </div>
                <span className="separator">-</span>
                <div className="time-control">
                    <Moon size={16} className="text-indigo" />
                    <select
                        value={sleepHour}
                        onChange={(e) => onSleepHourChange(Number(e.target.value))}
                        className="glass-select"
                        title="Hora de dormir"
                    >
                        {hours.map(h => (
                            <option key={`sleep-${h}`} value={h}>{h.toString().padStart(2, '0')}:00</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="header-controls">
                <button onClick={onToday} className="btn-today">
                    Hoy
                </button>
                <div className="nav-buttons">
                    <button onClick={onPrevWeek} className="btn-icon" aria-label="Semana anterior">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={onNextWeek} className="btn-icon" aria-label="Siguiente semana">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarHeader;

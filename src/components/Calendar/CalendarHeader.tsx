import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, onPrevWeek, onNextWeek, onToday }) => {
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

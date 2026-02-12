import React from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface Task {
    id: string;
    title: string;
    description: string;
    date: Date;
    duration: number; // in minutes
}

interface CalendarGridProps {
    currentDate: Date;
    onTimeSlotClick: (date: Date, hour: number) => void;
    tasks: Task[];
    wakeHour: number;
    sleepHour: number;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, onTimeSlotClick, tasks, wakeHour, sleepHour }) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Filter hours based on wake and sleep settings
    const hours = Array.from({ length: 24 }, (_, i) => i).filter(h => {
        if (wakeHour < sleepHour) {
            return h >= wakeHour && h < sleepHour;
        } else if (wakeHour > sleepHour) {
            return h >= wakeHour || h < sleepHour;
        }
        return true; // If equal, show all? Or maybe one hour? Let's show all for safety.
    });

    const getTasksForDayAndHour = (day: Date, hour: number) => {
        return tasks.filter(task => {
            const taskDate = new Date(task.date);
            return isSameDay(taskDate, day) && taskDate.getHours() === hour;
        });
    };

    return (
        <div className="calendar-grid-container glass-panel">
            <div className="calendar-grid-header">
                <div className="time-column-header"></div>
                {days.map((day) => (
                    <div
                        key={day.toISOString()}
                        className={`day-column-header ${isToday(day) ? 'is-today' : ''}`}
                    >
                        <span className="day-name">{format(day, 'EEE', { locale: es })}</span>
                        <span className="day-number">{format(day, 'd')}</span>
                    </div>
                ))}
            </div>

            <div className="calendar-grid-body">
                <div className="time-labels-column">
                    {hours.map((hour) => (
                        <div key={hour} className="time-label">
                            {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                        </div>
                    ))}
                </div>

                <div className="days-grid">
                    {days.map((day) => (
                        <div key={day.toISOString()} className="day-column">
                            {hours.map((hour) => {
                                const tasksInSlot = getTasksForDayAndHour(day, hour);

                                return (
                                    <div
                                        key={`${day.toISOString()}-${hour}`}
                                        className="time-slot"
                                        onClick={() => onTimeSlotClick(day, hour)}
                                    >
                                        {tasksInSlot.map(task => (
                                            <div
                                                key={task.id}
                                                className="task-item"
                                                style={{ height: `${task.duration}px` }} // Assumes 1 min = 1px or similar ratio. 60min slot = 60px height.
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle edit click
                                                }}
                                            >
                                                <div className="task-title">{task.title}</div>
                                                <div className="task-time">
                                                    {format(task.date, 'HH:mm')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}

                            {/* Current time indicator line if today */}
                            {isToday(day) && (
                                <div
                                    className="current-time-indicator"
                                    style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%` }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarGrid;

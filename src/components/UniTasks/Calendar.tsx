import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useUniTasks } from '../../context/UniTasksContext';
import type { Assignment } from '../../types/uniTasks';

interface CalendarProps {
    onEditAssignment?: (assignment: Assignment) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onEditAssignment }) => {
    const { subjects, updateAssignment } = useUniTasks();
    const [currentDate, setCurrentDate] = useState(new Date());

    const allAssignments = useMemo(() => {
        return subjects.flatMap(s => s.assignments || []);
    }, [subjects]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adaptar para que Lunes sea 0 y Domingo 6
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const resetToToday = () => {
        setCurrentDate(new Date());
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    // Construir los días del mes actual más los espacios en blanco iniciales
    const daysList = useMemo(() => {
        const list = [];
        for (let i = 0; i < firstDay; i++) {
            list.push(null); // padding start
        }
        for (let i = 1; i <= daysInMonth; i++) {
            list.push(new Date(year, month, i));
        }
        return list;
    }, [year, month, daysInMonth, firstDay]);

    const handleDragStart = (e: React.DragEvent, assignmentId: string) => {
        e.dataTransfer.setData('text/plain', assignmentId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetDate: Date) => {
        e.preventDefault();
        const assignmentId = e.dataTransfer.getData('text/plain');
        if (!assignmentId) return;

        const assignmentToUpdate = allAssignments.find(a => a.id === assignmentId);
        if (assignmentToUpdate) {
            const originalEndDate = new Date(assignmentToUpdate.endDate);
            const newEndDate = new Date(targetDate);
            newEndDate.setHours(originalEndDate.getHours(), originalEndDate.getMinutes(), originalEndDate.getSeconds());

            updateAssignment(assignmentToUpdate.subjectId, {
                ...assignmentToUpdate,
                endDate: newEndDate.toISOString()
            });
        }
    };

    const getStatusColor = (assignment: Assignment) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const end = new Date(assignment.endDate);
        end.setHours(0, 0, 0, 0);

        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = (end.getTime() - now.getTime()) / oneDay;

        if (now > end) return 'rgba(239, 68, 68, 0.4)'; // Red
        if (diffDays <= 1 && diffDays >= 0) return 'rgba(234, 179, 8, 0.4)'; // Yellow

        return 'rgba(59, 130, 246, 0.4)'; // Blue
    };

    return (
        <div className="glass-panel" style={{
            width: '100%',
            marginBottom: '1.5rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {/* Cabecera del Calendario */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={24} color="var(--color-secondary)" />
                    <h2 style={{ margin: 0 }}>{monthNames[month]} {year}</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={prevMonth}
                        className="glass-button"
                        style={{ display: 'flex', alignItems: 'center', color: 'white', padding: '0.5rem' }}
                        title="Mes Anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={resetToToday}
                        className="glass-button"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'white', margin: '0 0.5rem' }}
                    >
                        Hoy
                    </button>
                    <button
                        onClick={nextMonth}
                        className="glass-button"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', color: 'white' }}
                        title="Mes Siguiente"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden'
            }}>
                {/* Cabecera de Días */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.02)'
                }}>
                    {dayNames.map(day => (
                        <div key={day} style={{
                            padding: '0.75rem',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            color: 'var(--color-text-muted)',
                            borderRight: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Cuadrícula de Días */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridAutoRows: 'minmax(100px, auto)'
                }}>
                    {daysList.map((date, index) => {
                        if (!date) {
                            return (
                                <div key={`empty-${index}`} style={{
                                    borderRight: '1px solid rgba(255,255,255,0.05)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    backgroundColor: 'rgba(0,0,0,0.1)'
                                }} />
                            );
                        }

                        const isToday = date.toDateString() === new Date().toDateString();

                        // Tareas para este día (mostrar si el día es igual a endDate)
                        const dayAssignments = allAssignments.filter(a => {
                            const end = new Date(a.endDate);
                            end.setHours(0, 0, 0, 0);
                            return date.getTime() === end.getTime();
                        });

                        return (
                            <div 
                                key={date.toISOString()} 
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, date)}
                                style={{
                                    borderRight: '1px solid rgba(255,255,255,0.05)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div style={{
                                    alignSelf: 'flex-end',
                                    fontSize: '0.8rem',
                                    fontWeight: isToday ? 'bold' : 'normal',
                                    color: isToday ? 'white' : 'var(--color-text-muted)',
                                    backgroundColor: isToday ? 'var(--color-primary)' : 'transparent',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%'
                                }}>
                                    {date.getDate()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', maxHeight: '100px' }}>
                                    {dayAssignments.map(assignment => {
                                        return (
                                            <div
                                                key={assignment.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, assignment.id)}
                                                onClick={() => onEditAssignment && onEditAssignment(assignment)}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.2rem 0.4rem',
                                                    backgroundColor: getStatusColor(assignment),
                                                    color: 'white',
                                                    borderRadius: '4px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    cursor: 'pointer',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderLeft: '2px solid rgba(255,255,255,0.3)',
                                                    borderRight: '2px solid rgba(255,255,255,0.3)',
                                                    zIndex: 1
                                                }}
                                                title={`${assignment.title} (${new Date(assignment.endDate).toLocaleDateString()})`}
                                            >
                                                {assignment.title}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;

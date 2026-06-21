import React from 'react';
import type { Assignment, ChecklistItem } from '../../types/uniTasks';
import GoogleIcon from '../GoogleIcon';

interface AssignmentCardProps {
    assignment: Assignment;
    onToggleCheck: (assignmentId: string, itemId: string) => void;
    onEdit: (assignment: Assignment) => void;
    onArchive: (assignmentId: string) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onToggleCheck, onEdit, onArchive }) => {
    // Calculate progress
    const totalItems = assignment.checklist.length;
    const completedItems = assignment.checklist.filter(item => item.completed).length;
    const progress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

    // Calculate status color
    const getBackgroundColor = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to start of day

        const end = new Date(assignment.endDate);
        end.setHours(0, 0, 0, 0);

        // Calculate difference in days
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = (end.getTime() - now.getTime()) / oneDay;

        // Priority 1: Past deadline -> Reddish
        if (now > end) {
            return 'rgba(239, 68, 68, 0.25)'; // Red
        }

        // Priority 2: 1 day left (today or tomorrow is the deadline) -> Yellowish
        if (diffDays <= 1 && diffDays >= 0) {
            return 'rgba(234, 179, 8, 0.25)'; // Yellow
        }

        // Priority 3: Active -> Bluish
        return 'rgba(59, 130, 246, 0.25)'; // Blue
    };

    return (
        <div className="glass-panel" style={{
            padding: '1rem',
            marginTop: '1rem',
            backgroundColor: getBackgroundColor(),
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            transition: 'background-color 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingRight: '1.5rem' }}>
                <h4 style={{ margin: 0 }}>{assignment.title}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {completedItems}/{totalItems}
                </div>
                <button
                    onClick={() => onEdit(assignment)}
                    className="icon-button"
                    style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        opacity: 0.5,
                        cursor: 'pointer',
                        background: 'transparent',
                        border: 'none',
                        color: 'white'
                    }}
                    title="Editar Tarea"
                >
                    <GoogleIcon name="edit" size={14} />
                </button>
            </div>

            {/* Progress Bar */}
            <div style={{
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                marginBottom: '1rem',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: 'var(--color-secondary)',
                    transition: 'width 0.3s ease'
                }} />
            </div>

            {/* Dates */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                marginBottom: '1rem'
            }}>
                <GoogleIcon name="calendar_today" size={14} />
                <span>{new Date(assignment.endDate).toLocaleDateString()}</span>
            </div>

            {/* Link Button */}
            {assignment.link && (
                <a
                    href={assignment.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        color: 'white',
                        textDecoration: 'none',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                >
                    <GoogleIcon name="open_in_new" size={16} />
                    Abrir Tarea
                </a>
            )}

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {assignment.checklist.map((item: ChecklistItem) => (
                    <div
                        key={item.id}
                        onClick={() => onToggleCheck(assignment.id, item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            opacity: item.completed ? 0.6 : 1
                        }}
                    >
                        <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `2px solid ${item.completed ? 'var(--color-secondary)' : 'rgba(255,255,255,0.3)'}`,
                            backgroundColor: item.completed ? 'var(--color-secondary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}>
                            {item.completed && <GoogleIcon name="check" size={12} style={{ color: 'white' }} />}
                        </div>
                        <span style={{
                            fontSize: '0.9rem',
                            textDecoration: item.completed ? 'line-through' : 'none'
                        }}>
                            {item.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* Archive Button */}
            {progress === 100 && (
                <button
                    onClick={() => onArchive(assignment.id)}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-primary)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <GoogleIcon name="check" size={16} />
                    Completar y Archivar
                </button>
            )}
        </div>
    );
};

export default AssignmentCard;

import React from 'react';
import type { Subject, Assignment } from '../../types/uniTasks';
import AssignmentCard from './AssignmentCard';
import { Plus, Settings } from 'lucide-react';

interface SubjectColumnProps {
    subject: Subject;
    onAddAssignment: (subjectId: string) => void;
    onEditSubject: (subject: Subject) => void;
    onEditAssignment: (assignment: Assignment) => void;
    onArchiveAssignment: (subjectId: string, assignmentId: string) => void;
    onToggleAssignmentCheck: (subjectId: string, assignmentId: string, itemId: string) => void;
}

const SubjectColumn: React.FC<SubjectColumnProps> = ({
    subject,
    onAddAssignment,
    onEditSubject,
    onEditAssignment,
    onArchiveAssignment,
    onToggleAssignmentCheck
}) => {
    return (
        <div className="glass-panel" style={{
            minWidth: '300px',
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            marginRight: '1rem'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0 }}>{subject.name}</h3>
                <button
                    onClick={() => onEditSubject(subject)}
                    className="icon-button"
                    title="Editar Materia"
                    style={{ color: 'white' }}
                >
                    <Settings size={18} />
                </button>
            </div>

            {/* Stats */}
            <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(0,0,0,0.1)'
            }}>
                <div>
                    Completadas: {(() => {
                        const assignments = subject.assignments || [];
                        const completed = assignments.reduce((acc, a) => acc + (a.checklist || []).filter(i => i.completed).length, 0);
                        const total = assignments.reduce((acc, a) => acc + (a.checklist || []).length, 0);
                        return `${completed}/${total}`;
                    })()}
                </div>
                <div>
                    Estimado: {(() => {
                        const now = new Date();
                        const assignments = subject.assignments || [];
                        const activeAssignments = assignments.filter(a => new Date(a.endDate) > now);
                        const days = activeAssignments.reduce((acc, a) => {
                            const end = new Date(a.endDate);
                            const diffTime = Math.max(0, end.getTime() - now.getTime());
                            return acc + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        }, 0);
                        return `${days}d`;
                    })()}
                </div>
            </div>

            {/* Assignments List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

                <button
                    onClick={() => onAddAssignment(subject.id)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px dashed rgba(255,255,255,0.2)',
                        backgroundColor: 'transparent',
                        color: 'rgba(255,255,255,0.6)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    }}
                >
                    <Plus size={20} />
                    <span>Añadir Tarea</span>
                </button>

                {[...(subject.assignments || [])]
                    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                    .map((assignment: Assignment) => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            onEdit={onEditAssignment}
                            onArchive={(assignmentId) => onArchiveAssignment(subject.id, assignmentId)}
                            onToggleCheck={(assignmentId, itemId) => onToggleAssignmentCheck(subject.id, assignmentId, itemId)}
                        />
                    ))}

            </div>
        </div>
    );
};

export default SubjectColumn;

import React, { useState, useEffect } from 'react';
import { useUniTasks } from '../../context/UniTasksContext';
import AssignmentCard from '../UniTasks/AssignmentCard';
import EditAssignmentModal from '../UniTasks/EditAssignmentModal';
import type { Assignment } from '../../types/uniTasks';
import '../../styles/PomodoroDnD.css';

const PomodoroUniTasks: React.FC = () => {
    const { subjects, updateAssignment, deleteAssignment, toggleAssignmentCheck } = useUniTasks();
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

    // Initialize with first subject if available
    useEffect(() => {
        if (subjects.length > 0 && !selectedSubjectId) {
            setSelectedSubjectId(subjects[0].id);
        } else if (subjects.length === 0) {
            setSelectedSubjectId('');
        } else if (selectedSubjectId && !subjects.find(s => s.id === selectedSubjectId)) {
            setSelectedSubjectId(subjects[0].id);
        }
    }, [subjects, selectedSubjectId]);

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSubjectId(e.target.value);
    };

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    return (
        <div className="pomodoro-tasks glass-panel" style={{ marginTop: '1rem' }}>
            <h3>
                <span>Tareas de la Clase</span>
            </h3>

            <div className="task-input-container" style={{ marginBottom: '1rem' }}>
                <select
                    value={selectedSubjectId}
                    onChange={handleSubjectChange}
                    className="task-input"
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <option value="" disabled style={{ color: 'black' }}>Selecciona una clase...</option>
                    {subjects.map(subject => (
                        <option key={subject.id} value={subject.id} style={{ color: 'black' }}>
                            {subject.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="task-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {!selectedSubject && <p className="no-tasks">Selecciona una clase para ver sus tareas</p>}
                {selectedSubject && (!selectedSubject.assignments || selectedSubject.assignments.length === 0) && (
                    <p className="no-tasks">Esta clase no tiene tareas</p>
                )}
                {selectedSubject && selectedSubject.assignments && [...selectedSubject.assignments]
                    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                    .map(assignment => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            onEdit={setEditingAssignment}
                            onArchive={(assignmentId) => deleteAssignment(selectedSubject.id, assignmentId)}
                            onToggleCheck={(assignmentId, itemId) => toggleAssignmentCheck(selectedSubject.id, assignmentId, itemId)}
                        />
                    ))
                }
            </div>

            {editingAssignment && selectedSubject && (
                <EditAssignmentModal
                    assignment={editingAssignment}
                    isOpen={!!editingAssignment}
                    onClose={() => setEditingAssignment(null)}
                    onSave={(subjectId, updatedAssignment) => updateAssignment(subjectId, updatedAssignment)}
                    onDelete={(subjectId, assignmentId) => {
                        deleteAssignment(subjectId, assignmentId);
                        setEditingAssignment(null);
                    }}
                />
            )}
        </div>
    );
};

export default PomodoroUniTasks;

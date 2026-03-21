import React, { useState } from 'react';
import Calendar from '../components/UniTasks/Calendar';
import SubjectColumn from '../components/UniTasks/SubjectColumn';
import EditSubjectModal from '../components/UniTasks/EditSubjectModal';
import EditAssignmentModal from '../components/UniTasks/EditAssignmentModal';
import type { Subject, Assignment } from '../types/uniTasks';
import { useUniTasks } from '../context/UniTasksContext';

const UniTasksPage: React.FC = () => {
    const {
        subjects,
        updateSubject,
        addAssignment: addAssignmentContext,
        updateAssignment,
        deleteAssignment,
        toggleAssignmentCheck
    } = useUniTasks();

    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

    const handleAddAssignment = (subjectId: string) => {
        const newAssignment = addAssignmentContext(subjectId);
        if (newAssignment) {
            setEditingAssignment(newAssignment);
        }
    };

    const handleDeleteAssignment = (subjectId: string, assignmentId: string) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta tarea?");
        if (confirmDelete) {
            deleteAssignment(subjectId, assignmentId);
            setEditingAssignment(null);
        }
    };

    return (
        <div className="page-container" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <header className="page-header">
                <h1>Tareas de la Universidad</h1>
                <p>Gestiona y visualiza tus asignaciones académicas.</p>
            </header>

            <Calendar onEditAssignment={setEditingAssignment} />

            <div style={{
                flex: 1,
                overflowX: 'auto',
                overflowY: 'hidden',
                display: 'flex',
                gap: '1rem',
                paddingBottom: '1rem',
                transform: 'rotateX(180deg)',
                alignItems: 'flex-end'
            }}>
                {subjects.map(subject => (
                    <div key={subject.id} style={{ transform: 'rotateX(180deg)', height: '100%' }}>
                        <SubjectColumn
                            subject={subject}
                            onAddAssignment={handleAddAssignment}
                            onEditSubject={setEditingSubject}
                            onEditAssignment={setEditingAssignment}
                            onArchiveAssignment={deleteAssignment}
                            onToggleAssignmentCheck={toggleAssignmentCheck}
                        />
                    </div>
                ))}

            </div>

            {editingSubject && (
                <EditSubjectModal
                    subject={editingSubject}
                    isOpen={!!editingSubject}
                    onClose={() => setEditingSubject(null)}
                    onSave={updateSubject}
                />
            )}

            {editingAssignment && (
                <EditAssignmentModal
                    assignment={editingAssignment}
                    isOpen={!!editingAssignment}
                    onClose={() => setEditingAssignment(null)}
                    onSave={updateAssignment}
                    onDelete={handleDeleteAssignment}
                />
            )}
        </div>
    );
};

export default UniTasksPage;

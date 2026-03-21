import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Subject, Assignment, ChecklistItem } from '../types/uniTasks';
import { saveToLocal, loadFromLocal, STORAGE_KEYS } from './LocalSave';
import { useUniProgress } from './UniProgressContext';

interface UniTasksContextType {
    subjects: Subject[];
    updateSubject: (subjectId: string, template: string[], defaultAssignmentDuration: number) => void;
    addAssignment: (subjectId: string) => Assignment | undefined;
    updateAssignment: (subjectId: string, updatedAssignment: Assignment) => void;
    deleteAssignment: (subjectId: string, assignmentId: string) => void;
    toggleAssignmentCheck: (subjectId: string, assignmentId: string, itemId: string) => void;
}

const UniTasksContext = createContext<UniTasksContextType | undefined>(undefined);

export const UniTasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { terms } = useUniProgress();

    const [storedSubjects, setStoredSubjects] = useState<Subject[]>(() => {
        return loadFromLocal<Subject[]>(STORAGE_KEYS.UNI_TASKS_SUBJECTS, []);
    });

    useEffect(() => {
        saveToLocal(STORAGE_KEYS.UNI_TASKS_SUBJECTS, storedSubjects);
    }, [storedSubjects]);

    // Active subjects from UniProgress
    const activeProgressSubjects = terms.flatMap(t => t.subjects).filter(s => s.status === 'Cursando');

    const subjects: Subject[] = activeProgressSubjects.map(ps => {
        const stored = storedSubjects.find(s => s.id === ps.id);
        if (stored) {
            return { ...stored, name: ps.name };
        } else {
            return {
                id: ps.id,
                name: ps.name,
                template: ['Leer material', 'Redactar borrador'],
                defaultAssignmentDuration: 3,
                assignments: []
            };
        }
    });

    const updateSubject = (subjectId: string, template: string[], defaultAssignmentDuration: number) => {
        setStoredSubjects(prev => {
            const existing = prev.find(s => s.id === subjectId);
            if (existing) {
                return prev.map(s => s.id === subjectId ? { ...s, template, defaultAssignmentDuration } : s);
            } else {
                const ps = activeProgressSubjects.find(p => p.id === subjectId);
                return [...prev, { id: subjectId, name: ps?.name || '', template, defaultAssignmentDuration, assignments: [] }];
            }
        });
    };

    const addAssignment = (subjectId: string): Assignment | undefined => {
        const activeSub = subjects.find(s => s.id === subjectId);
        if (!activeSub) return undefined;

        const checklist: ChecklistItem[] = (activeSub.template || []).map((text, index) => ({
            id: `${crypto.randomUUID()}-${index}`,
            text,
            completed: false
        }));

        const newAssignment: Assignment = {
            id: crypto.randomUUID(),
            subjectId,
            title: "Nueva Tarea",
            checklist,
            endDate: new Date(Date.now() + (activeSub.defaultAssignmentDuration || 7) * 24 * 60 * 60 * 1000).toISOString()
        };

        setStoredSubjects(prev => {
            const existing = prev.find(s => s.id === subjectId);
            if (existing) {
                return prev.map(s => s.id === subjectId ? { ...s, assignments: [...(s.assignments || []), newAssignment] } : s);
            } else {
                return [...prev, { ...activeSub, assignments: [newAssignment] }];
            }
        });

        return newAssignment;
    };

    const updateAssignment = (subjectId: string, updatedAssignment: Assignment) => {
        setStoredSubjects(prev => prev.map(s => {
            if (s.id === subjectId) {
                return { ...s, assignments: (s.assignments || []).map(a => a.id === updatedAssignment.id ? updatedAssignment : a) };
            }
            return s;
        }));
    };

    const deleteAssignment = (subjectId: string, assignmentId: string) => {
        setStoredSubjects(prev => prev.map(s => {
            if (s.id === subjectId) {
                return { ...s, assignments: (s.assignments || []).filter(a => a.id !== assignmentId) };
            }
            return s;
        }));
    };

    const toggleAssignmentCheck = (subjectId: string, assignmentId: string, itemId: string) => {
        setStoredSubjects(prev => prev.map(s => {
            if (s.id === subjectId) {
                const updatedAssignments = (s.assignments || []).map(assignment => {
                    if (assignment.id === assignmentId) {
                        const updatedChecklist = (assignment.checklist || []).map(item => {
                            if (item.id === itemId) return { ...item, completed: !item.completed };
                            return item;
                        });
                        return { ...assignment, checklist: updatedChecklist };
                    }
                    return assignment;
                });
                return { ...s, assignments: updatedAssignments };
            }
            return s;
        }));
    };

    return (
        <UniTasksContext.Provider value={{
            subjects,
            updateSubject,
            addAssignment,
            updateAssignment,
            deleteAssignment,
            toggleAssignmentCheck
        }}>
            {children}
        </UniTasksContext.Provider>
    );
};

export const useUniTasks = () => {
    const context = useContext(UniTasksContext);
    if (!context) {
        throw new Error('useUniTasks must be used within a UniTasksProvider');
    }
    return context;
};

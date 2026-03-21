import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Term, ProgressSubject, SubjectStatus } from '../types/uniProgress';
import { saveToLocal, loadFromLocal, STORAGE_KEYS } from './LocalSave';

interface UniProgressContextType {
    terms: Term[];
    addTerm: (name: string, subjectNames: string[]) => void;
    deleteTerm: (termId: string) => void;
    updateSubjectStatus: (termId: string, subjectId: string, status: SubjectStatus) => void;
}

const UniProgressContext = createContext<UniProgressContextType | undefined>(undefined);

export const UniProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [terms, setTerms] = useState<Term[]>(() => {
        return loadFromLocal<Term[]>(STORAGE_KEYS.UNI_PROGRESS_TERMS, []);
    });

    // Save to LocalStorage whenever terms change
    useEffect(() => {
        saveToLocal(STORAGE_KEYS.UNI_PROGRESS_TERMS, terms);
    }, [terms]);

    const addTerm = (name: string, subjectNames: string[]) => {
        const newSubjects: ProgressSubject[] = subjectNames.map(subName => ({
            id: crypto.randomUUID(),
            name: subName,
            status: 'No cursada'
        }));

        const newTerm: Term = {
            id: crypto.randomUUID(),
            name,
            subjects: newSubjects
        };

        setTerms([...terms, newTerm]);
    };

    const deleteTerm = (termId: string) => {
        setTerms(terms.filter(t => t.id !== termId));
    };

    const updateSubjectStatus = (termId: string, subjectId: string, status: SubjectStatus) => {
        setTerms(terms.map(t => {
            if (t.id === termId) {
                return {
                    ...t,
                    subjects: t.subjects.map(s => s.id === subjectId ? { ...s, status } : s)
                };
            }
            return t;
        }));
    };

    return (
        <UniProgressContext.Provider value={{
            terms,
            addTerm,
            deleteTerm,
            updateSubjectStatus
        }}>
            {children}
        </UniProgressContext.Provider>
    );
};

export const useUniProgress = () => {
    const context = useContext(UniProgressContext);
    if (!context) {
        throw new Error('useUniProgress must be used within a UniProgressProvider');
    }
    return context;
};

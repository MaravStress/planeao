/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { StandaloneWhiteboard, WhiteboardData } from '../types/work';
import { saveToLocal, loadFromLocal, STORAGE_KEYS } from './LocalSave';

interface WhiteboardsContextType {
    whiteboards: StandaloneWhiteboard[];
    addWhiteboard: () => StandaloneWhiteboard;
    renameWhiteboard: (id: string, name: string) => void;
    deleteWhiteboard: (id: string) => void;
    updateWhiteboard: (id: string, whiteboardData: WhiteboardData) => void;
    reloadWhiteboardsFromLocal: () => void;
}

const WhiteboardsContext = createContext<WhiteboardsContextType | undefined>(undefined);

export const WhiteboardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [whiteboards, setWhiteboards] = useState<StandaloneWhiteboard[]>(() => {
        return loadFromLocal<StandaloneWhiteboard[]>(STORAGE_KEYS.STANDALONE_WHITEBOARDS, []);
    });

    const reloadWhiteboardsFromLocal = () => {
        setWhiteboards(loadFromLocal<StandaloneWhiteboard[]>(STORAGE_KEYS.STANDALONE_WHITEBOARDS, []));
    };

    // Save to LocalStorage (and online) whenever whiteboards change
    useEffect(() => {
        saveToLocal(STORAGE_KEYS.STANDALONE_WHITEBOARDS, whiteboards);
    }, [whiteboards]);

    const addWhiteboard = (): StandaloneWhiteboard => {
        const now = Date.now();
        const newWhiteboard: StandaloneWhiteboard = {
            id: crypto.randomUUID(),
            name: 'Nuevo Whiteboard',
            createdAt: now,
            updatedAt: now
        };

        setWhiteboards(prev => [...prev, newWhiteboard]);
        return newWhiteboard;
    };

    const renameWhiteboard = (id: string, name: string) => {
        setWhiteboards(prev => prev.map(wb =>
            wb.id === id ? { ...wb, name, updatedAt: Date.now() } : wb
        ));
    };

    const deleteWhiteboard = (id: string) => {
        setWhiteboards(prev => prev.filter(wb => wb.id !== id));
    };

    const updateWhiteboard = (id: string, whiteboardData: WhiteboardData) => {
        const now = Date.now();
        const dataWithTimestamp = {
            ...whiteboardData,
            updatedAt: whiteboardData?.updatedAt || now
        };
        setWhiteboards(prev => prev.map(wb =>
            wb.id === id ? { ...wb, whiteboardData: dataWithTimestamp, updatedAt: now } : wb
        ));
    };

    return (
        <WhiteboardsContext.Provider value={{
            whiteboards,
            addWhiteboard,
            renameWhiteboard,
            deleteWhiteboard,
            updateWhiteboard,
            reloadWhiteboardsFromLocal
        }}>
            {children}
        </WhiteboardsContext.Provider>
    );
};

export const useWhiteboards = () => {
    const context = useContext(WhiteboardsContext);
    if (!context) {
        throw new Error('useWhiteboards must be used within a WhiteboardsProvider');
    }
    return context;
};

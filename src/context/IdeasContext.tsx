import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Idea, IdeaSettings } from '../types/ideas';
import { loadFromLocal, saveToLocal, STORAGE_KEYS } from './LocalSave';

interface IdeasContextType {
    ideas: Idea[];
    settings: IdeaSettings;
    addIdea: (idea: Idea) => void;
    updateIdea: (idea: Idea) => void;
    deleteIdea: (ideaId: string) => void;
    updateSettings: (newSettings: IdeaSettings) => void;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export const IdeasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ideas, setIdeas] = useState<Idea[]>(() => {
        const loaded = loadFromLocal<Idea[]>(STORAGE_KEYS.IDEAS, []);
        return Array.isArray(loaded) ? loaded : [];
    });

    const [settings, setSettings] = useState<IdeaSettings>(() => {
        let storedSettings = loadFromLocal<any>(STORAGE_KEYS.IDEA_SETTINGS, {
            categories: [
                { id: 'General', name: 'General', color: '#888888' },
                { id: 'Tecnología', name: 'Tecnología', color: '#0dcaf0' },
                { id: 'Servicios', name: 'Servicios', color: '#ffc107' },
                { id: 'Producto', name: 'Producto', color: '#198754' }
            ],
            statuses: [
                { id: 'Idea', name: 'Idea', color: '#6c757d' },
                { id: 'Validando', name: 'Validando', color: '#0dcaf0' },
                { id: 'Desarrollo', name: 'Desarrollo', color: '#198754' },
                { id: 'Descartada', name: 'Descartada', color: '#dc3545' }
            ]
        });

        // Migrate older simple array of strings to objects
        if (storedSettings?.categories?.length > 0 && typeof storedSettings.categories[0] === 'string') {
            storedSettings.categories = storedSettings.categories.map((c: string) => ({ id: c, name: c, color: '#888888' }));
        }
        if (storedSettings?.statuses?.length > 0 && typeof storedSettings.statuses[0] === 'string') {
            storedSettings.statuses = storedSettings.statuses.map((s: string) => ({ id: s, name: s, color: '#888888' }));
        }

        return storedSettings;
    });

    // Save when changed
    useEffect(() => {
        saveToLocal(STORAGE_KEYS.IDEAS, ideas);
    }, [ideas]);

    useEffect(() => {
        saveToLocal(STORAGE_KEYS.IDEA_SETTINGS, settings);
    }, [settings]);

    const addIdea = (idea: Idea) => {
        setIdeas((prev) => [...prev, idea]);
    };

    const updateIdea = (idea: Idea) => {
        setIdeas((prev) => prev.map((i) => (i.id === idea.id ? idea : i)));
    };

    const deleteIdea = (ideaId: string) => {
        setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    };

    const updateSettings = (newSettings: IdeaSettings) => {
        setSettings(newSettings);
    };

    return (
        <IdeasContext.Provider value={{ ideas, settings, addIdea, updateIdea, deleteIdea, updateSettings }}>
            {children}
        </IdeasContext.Provider>
    );
};

export const useIdeas = () => {
    const context = useContext(IdeasContext);
    if (context === undefined) {
        throw new Error('useIdeas must be used within an IdeasProvider');
    }
    return context;
};

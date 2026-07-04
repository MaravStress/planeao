import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Idea, IdeaSettings } from '../types/ideas';
import { loadFromLocal, saveToLocal, getLocalPayload, setLocalPayload, removeFromLocal, STORAGE_KEYS } from './LocalSave';
import { getOnlinePayload, saveToOnline } from './OnlineSave';
import { auth } from '../firebase';

interface IdeasContextType {
    ideas: Idea[];
    settings: IdeaSettings;
    addIdea: (idea: Idea) => void;
    updateIdea: (idea: Idea) => void;
    deleteIdea: (ideaId: string) => void;
    updateSettings: (newSettings: IdeaSettings) => void;
    isLoaded: boolean;
    loadIdeas: () => Promise<void>;
    unloadIdeas: () => void;
}

const DEFAULT_SETTINGS: IdeaSettings = {
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
};

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export const IdeasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [settings, setSettings] = useState<IdeaSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Save when changed (only if isLoaded is true to avoid overwriting backups with initial state)
    useEffect(() => {
        if (isLoaded) {
            // Strip base64 image data URLs from imageUrl for local storage
            const strippedIdeas = ideas.map(idea => {
                if (idea.imageUrl && idea.imageUrl.startsWith('data:image/')) {
                    return { ...idea, imageUrl: '' };
                }
                return idea;
            });

            // Write stripped data to active and backup local storage keys
            const localPayload = {
                _data: strippedIdeas,
                _lastModified: Date.now()
            };
            setLocalPayload(STORAGE_KEYS.IDEAS, localPayload);
            setLocalPayload(STORAGE_KEYS.IDEAS_BACKUP, localPayload);

            // Save full data (including base64 images) to online Firebase Realtime Database
            const onlinePayload = {
                _data: ideas,
                _lastModified: Date.now()
            };
            saveToOnline(STORAGE_KEYS.IDEAS_BACKUP, onlinePayload).catch(err =>
                console.error("Error saving ideas online:", err)
            );
        }
    }, [ideas, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            saveToLocal(STORAGE_KEYS.IDEA_SETTINGS, settings);
            saveToLocal(STORAGE_KEYS.IDEA_SETTINGS_BACKUP, settings);
        }
    }, [settings, isLoaded]);

    const loadIdeas = async () => {
        // 1. Read from backup keys in localStorage
        const rawLoadedIdeas = loadFromLocal<any>(STORAGE_KEYS.IDEAS_BACKUP, []);
        const loadedIdeas = Array.isArray(rawLoadedIdeas) ? rawLoadedIdeas : [];
        let loadedSettings = loadFromLocal<any>(STORAGE_KEYS.IDEA_SETTINGS_BACKUP, DEFAULT_SETTINGS);

        // Migrate older simple array of strings to objects
        if (loadedSettings?.categories?.length > 0 && typeof loadedSettings.categories[0] === 'string') {
            loadedSettings.categories = loadedSettings.categories.map((c: string) => ({ id: c, name: c, color: '#888888' }));
        }
        if (loadedSettings?.statuses?.length > 0 && typeof loadedSettings.statuses[0] === 'string') {
            loadedSettings.statuses = loadedSettings.statuses.map((s: string) => ({ id: s, name: s, color: '#888888' }));
        }

        // Initialize active local storage keys immediately (stripped)
        const strippedLoadedIdeas = loadedIdeas.map(idea => {
            if (idea.imageUrl && idea.imageUrl.startsWith('data:image/')) {
                return { ...idea, imageUrl: '' };
            }
            return idea;
        });
        saveToLocal(STORAGE_KEYS.IDEAS, strippedLoadedIdeas);
        saveToLocal(STORAGE_KEYS.IDEA_SETTINGS, loadedSettings);

        // Set React state (RAM) to full loaded ideas
        setIdeas(loadedIdeas);
        setSettings(loadedSettings);

        // 2. Resolve conflict with online payload if logged in
        const user = auth.currentUser;
        if (user) {
            try {
                const onlineIdeasPayload = await getOnlinePayload(STORAGE_KEYS.IDEAS_BACKUP);
                const onlineSettingsPayload = await getOnlinePayload(STORAGE_KEYS.IDEA_SETTINGS_BACKUP);

                const localIdeasPayload = getLocalPayload(STORAGE_KEYS.IDEAS_BACKUP);
                const localSettingsPayload = getLocalPayload(STORAGE_KEYS.IDEA_SETTINGS_BACKUP);

                const localIdeasTime = localIdeasPayload?._lastModified || 0;
                const localSettingsTime = localSettingsPayload?._lastModified || 0;

                let finalIdeas = loadedIdeas;
                let finalSettings = loadedSettings;
                let updated = false;

                if (onlineIdeasPayload && onlineIdeasPayload._lastModified > localIdeasTime) {
                    finalIdeas = Array.isArray(onlineIdeasPayload._data) ? onlineIdeasPayload._data : [];
                    updated = true;
                }

                if (onlineSettingsPayload && onlineSettingsPayload._lastModified > localSettingsTime) {
                    finalSettings = onlineSettingsPayload._data;
                    updated = true;
                }

                if (updated) {
                    const strippedFinalIdeas = finalIdeas.map(idea => {
                        if (idea.imageUrl && idea.imageUrl.startsWith('data:image/')) {
                            return { ...idea, imageUrl: '' };
                        }
                        return idea;
                    });
                    
                    const localPayload = {
                        _data: strippedFinalIdeas,
                        _lastModified: Date.now()
                    };
                    setLocalPayload(STORAGE_KEYS.IDEAS, localPayload);
                    setLocalPayload(STORAGE_KEYS.IDEAS_BACKUP, localPayload);

                    saveToLocal(STORAGE_KEYS.IDEA_SETTINGS, finalSettings);
                    saveToLocal(STORAGE_KEYS.IDEA_SETTINGS_BACKUP, finalSettings);

                    setIdeas(finalIdeas);
                    setSettings(finalSettings);
                }
            } catch (error) {
                console.error("Error loading online ideas data:", error);
            }
        }

        setIsLoaded(true);
    };

    const unloadIdeas = () => {
        setIsLoaded(false);
        removeFromLocal(STORAGE_KEYS.IDEAS);
        removeFromLocal(STORAGE_KEYS.IDEA_SETTINGS);
        setIdeas([]);
        setSettings(DEFAULT_SETTINGS);
    };

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
        <IdeasContext.Provider value={{ ideas, settings, addIdea, updateIdea, deleteIdea, updateSettings, isLoaded, loadIdeas, unloadIdeas }}>
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

import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import IdeaCard from '../components/ideas/IdeaCard';
import IdeaModal from '../components/ideas/IdeaModal';
import IdeaSettingsModal from '../components/ideas/IdeaSettingsModal';
import type { Idea, IdeaSettings } from '../types/ideas';
import { useIdeas } from '../context/IdeasContext';
import '../styles/Ideas.css';

const IdeasPage: React.FC = () => {
    const { ideas, settings, addIdea, updateIdea, deleteIdea, updateSettings } = useIdeas();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

    const handleNewIdea = () => {
        setEditingIdea(null);
        setIsModalOpen(true);
    };

    const handleEditIdea = (idea: Idea) => {
        setEditingIdea(idea);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingIdea(null);
    };

    const handleSaveIdea = (savedIdea: Idea) => {
        const exists = ideas.find(i => i.id === savedIdea.id);
        if (exists) {
            updateIdea(savedIdea);
        } else {
            addIdea(savedIdea);
        }
        handleCloseModal();
    };

    const handleDeleteIdea = (ideaId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta idea?')) {
            deleteIdea(ideaId);
            handleCloseModal();
        }
    };

    const handleSaveSettings = (newSettings: IdeaSettings) => {
        updateSettings(newSettings);
        setIsSettingsOpen(false);
    };

    const activeIdeasCount = ideas.filter(i => i.status !== 'Descartada').length;

    const sortedIdeas = [...ideas].sort((a, b) => {
        const isADescartada = a.status.toLowerCase() === 'descartada';
        const isBDescartada = b.status.toLowerCase() === 'descartada';

        if (isADescartada && !isBDescartada) return 1;
        if (!isADescartada && isBDescartada) return -1;

        const indexA = settings.statuses.findIndex(s => s.name === a.status);
        const indexB = settings.statuses.findIndex(s => s.name === b.status);

        if (indexA !== indexB) {
            // if missing (-1), push to the end (but before Descartada)
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        }

        // Within the same status, sort by newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Ideas Emprendedoras</h1>
                <br />
            </header>

            <div className="ideas-header-container">
                <div className="ideas-metrics">
                    <div className="metric-item">
                        <span className="metric-label">Total Ideas</span>
                        <span className="metric-value">{ideas.length}</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Activas</span>
                        <span className="metric-value">{activeIdeasCount}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn-icon" onClick={() => setIsSettingsOpen(true)} title="Configurar Ideación" style={{ background: 'var(--color-bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                        <Settings size={20} color="var(--color-text-muted)" />
                    </button>
                    <button className="btn-new-idea" onClick={handleNewIdea}>
                        <Plus size={20} /> Nueva idea
                    </button>
                </div>
            </div>

            {ideas.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
                        No tienes ideas registradas. ¡Haz clic en "Nueva idea" para empezar!
                    </p>
                </div>
            ) : (
                <div className="ideas-grid">
                    {sortedIdeas.map(idea => (
                        <IdeaCard
                            key={idea.id}
                            idea={idea}
                            settings={settings}
                            onClick={handleEditIdea}
                        />
                    ))}
                </div>
            )}

            {isModalOpen && (
                <IdeaModal
                    idea={editingIdea}
                    settings={settings}
                    onSave={handleSaveIdea}
                    onDelete={handleDeleteIdea}
                />
            )}

            {isSettingsOpen && (
                <IdeaSettingsModal
                    settings={settings}
                    onSave={handleSaveSettings}
                />
            )}
        </div>
    );
};

export default IdeasPage;

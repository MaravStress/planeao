import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '../components/GoogleIcon';
import ImportExportButtons from '../components/ImportExportButtons';
import { useWork } from '../context/WorkContext';
import { useWhiteboards } from '../context/WhiteboardsContext';
import type { StandaloneWhiteboard } from '../types/work';
import '../styles/Layout.css';
import '../styles/Whiteboards.css';

/** Generates a stable gradient for a card based on a name hash. */
const getCardGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 45%), hsl(${h2}, 80%, 25%))`;
};

const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Sin actividad';
    return new Date(timestamp).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const WhiteboardsPage: React.FC = () => {
    const navigate = useNavigate();
    const { projects } = useWork();
    const {
        whiteboards,
        addWhiteboard,
        renameWhiteboard,
        deleteWhiteboard
    } = useWhiteboards();

    const [activeWhiteboardId, setActiveWhiteboardId] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');

    const activeWhiteboard = whiteboards.find(wb => wb.id === activeWhiteboardId);

    const openProjectWhiteboard = useCallback((projectId: string) => {
        navigate(`/?project=${projectId}&tab=whiteboard`);
    }, [navigate]);

    const handleCreateWhiteboard = () => {
        const created = addWhiteboard();
        setActiveWhiteboardId(created.id);
    };

    const handleSaveName = () => {
        const trimmed = nameInput.trim();
        if (trimmed && activeWhiteboard && trimmed !== activeWhiteboard.name) {
            renameWhiteboard(activeWhiteboard.id, trimmed);
        }
        setIsEditingName(false);
    };

    const handleDelete = (wb: StandaloneWhiteboard) => {
        const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar permanentemente el whiteboard "${wb.name}"? Esta acción no se puede deshacer.`
        );
        if (confirmed) {
            deleteWhiteboard(wb.id);
            if (activeWhiteboardId === wb.id) {
                setActiveWhiteboardId(null);
            }
        }
    };

    // ---- Detail view for a standalone whiteboard ----
    if (activeWhiteboard) {
        return (
            <div className="page-container" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="whiteboard-detail-header">
                    <button
                        className="back-button"
                        onClick={() => {
                            setActiveWhiteboardId(null);
                            setIsEditingName(false);
                        }}
                        title="Volver a Whiteboards"
                    >
                        <GoogleIcon name="arrow_back" size={24} />
                    </button>

                    {isEditingName ? (
                        <input
                            type="text"
                            className="whiteboard-detail-title-input"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveName();
                                if (e.key === 'Escape') setIsEditingName(false);
                            }}
                            autoFocus
                        />
                    ) : (
                        <h2
                            className="whiteboard-detail-title"
                            title="Doble clic para renombrar"
                            onDoubleClick={() => {
                                setNameInput(activeWhiteboard.name);
                                setIsEditingName(true);
                            }}
                        >
                            {activeWhiteboard.name}
                        </h2>
                    )}

                    <div className="whiteboard-detail-actions">
                        <ImportExportButtons page="whiteboards" />
                        <button
                            className="btn-icon-danger"
                            onClick={() => handleDelete(activeWhiteboard)}
                            title="Eliminar whiteboard"
                        >
                            <GoogleIcon name="delete" size={20} />
                        </button>
                    </div>
                </div>

                <div className="whiteboard-editor-placeholder">
                    <GoogleIcon name="draw" size={56} style={{ color: 'var(--color-primary)' }} />
                    <h3>Editor en camino</h3>
                    <p>
                        El lienzo de Excalidraw para este whiteboard se integrará en la próxima
                        iteración. Por ahora, el whiteboard <strong>{activeWhiteboard.name}</strong>{' '}
                        existe y se guarda, pero todavía no puedes dibujar en él.
                    </p>
                    <span style={{ fontSize: '0.8rem' }}>Creado el {formatDate(activeWhiteboard.createdAt)}</span>
                </div>
            </div>
        );
    }

    // ---- Listing view with the two sections ----
    return (
        <div className="page-container" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="whiteboards-page-title">Whiteboards</h1>
                    <p>Tus pizarrones de proyectos y los que creas sueltos.</p>
                </div>
                <ImportExportButtons page="whiteboards" />
            </header>

            {/* Section 1: Project whiteboards */}
            <section className="whiteboards-section">
                <div className="whiteboards-section-header">
                    <h2 className="whiteboards-section-title">
                        <GoogleIcon name="folder" size={22} style={{ color: 'var(--color-primary)' }} />
                        Whiteboards de Proyectos
                        <span className="count-badge">{projects.length}</span>
                    </h2>
                </div>

                {projects.length === 0 ? (
                    <div className="whiteboards-empty-state">
                        <GoogleIcon name="folder_open" size={40} />
                        <p>Aún no tienes proyectos. Crea uno en la sección de Work para tener su whiteboard.</p>
                        <button className="btn-new-project" onClick={() => navigate('/')} style={{ marginTop: '0.5rem' }}>
                            <GoogleIcon name="work" size={18} /> Ir a Work
                        </button>
                    </div>
                ) : (
                    <div className="whiteboards-grid">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                className="whiteboard-card"
                                onClick={() => openProjectWhiteboard(project.id)}
                                title={`Abrir whiteboard de ${project.name}`}
                            >
                                <div className="whiteboard-card-image" style={{ background: getCardGradient(project.name) }}>
                                    <GoogleIcon name="draw" size={44} style={{ opacity: 0.85 }} />
                                    <GoogleIcon name="open_in_new" size={18} className="card-corner-icon" />
                                </div>
                                <div className="whiteboard-card-content">
                                    <h3 className="whiteboard-card-title">{project.name}</h3>
                                    <div className="whiteboard-card-meta">
                                        <span className={`project-status ${project.isPaused ? 'status-paused' : 'status-active'}`}>
                                            {project.isPaused ? 'Pausado' : 'Activo'}
                                        </span>
                                        <span>{formatDate(project.whiteboardData?.updatedAt || project.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Section 2: Standalone whiteboards */}
            <section className="whiteboards-section">
                <div className="whiteboards-section-header">
                    <h2 className="whiteboards-section-title">
                        <GoogleIcon name="gesture" size={22} style={{ color: 'var(--color-secondary)' }} />
                        Mis Whiteboards
                        <span className="count-badge">{whiteboards.length}</span>
                    </h2>
                    <button className="btn-new-project" onClick={handleCreateWhiteboard}>
                        <GoogleIcon name="add" size={20} /> Nuevo Whiteboard
                    </button>
                </div>

                <div className="whiteboards-grid">
                    {whiteboards.map(wb => (
                        <div
                            key={wb.id}
                            className="whiteboard-card"
                            onClick={() => setActiveWhiteboardId(wb.id)}
                            title={`Abrir ${wb.name}`}
                        >
                            <div className="whiteboard-card-image" style={{ background: getCardGradient(wb.name) }}>
                                <GoogleIcon name="draw" size={44} style={{ opacity: 0.85 }} />
                            </div>
                            <div className="whiteboard-card-content">
                                <h3 className="whiteboard-card-title">{wb.name}</h3>
                                <div className="whiteboard-card-meta">
                                    <span>{wb.whiteboardData?.elements?.length ? `${wb.whiteboardData.elements.length} elementos` : 'Vacío'}</span>
                                    <span>{formatDate(wb.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Creator card */}
                    <div className="whiteboard-card-new" onClick={handleCreateWhiteboard}>
                        <GoogleIcon name="add" size={32} />
                        <span style={{ fontWeight: 600 }}>Nuevo Whiteboard</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WhiteboardsPage;

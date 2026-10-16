import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '../components/GoogleIcon';
import ExcalidrawCanvas, { ExcalidrawErrorBoundary } from '../components/ExcalidrawCanvas';
import ImportExportButtons from '../components/ImportExportButtons';
import { useWork } from '../context/WorkContext';
import { useWhiteboards } from '../context/WhiteboardsContext';
import { getLocalPayload, setLocalPayload, STORAGE_KEYS } from '../context/LocalSave';
import { getOnlinePayload, saveToOnline } from '../context/OnlineSave';
import { auth } from '../firebase';
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
        deleteWhiteboard,
        updateWhiteboard,
        reloadWhiteboardsFromLocal
    } = useWhiteboards();

    const [activeWhiteboardId, setActiveWhiteboardId] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'checking' | 'cloud_updated'>('saved');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [whiteboardVersion, setWhiteboardVersion] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeWhiteboard = whiteboards.find(wb => wb.id === activeWhiteboardId);

    // Sync fullscreen state with document fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement &&
                containerRef.current &&
                (document.fullscreenElement === containerRef.current || containerRef.current.contains(document.fullscreenElement))
            );
            setIsFullscreen(isCurrentlyFullscreen);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if ((containerRef.current as any).webkitRequestFullscreen) {
                    await (containerRef.current as any).webkitRequestFullscreen();
                } else {
                    setIsFullscreen(prev => !prev);
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                } else {
                    setIsFullscreen(false);
                }
            }
        } catch (err) {
            console.error("Fullscreen toggle error:", err);
            setIsFullscreen(prev => !prev);
        }
    }, []);

    // Check cloud version when a whiteboard is opened to ensure the newest version is loaded
    useEffect(() => {
        if (!activeWhiteboardId) return;

        let isMounted = true;

        const checkCloudVersion = async () => {
            const user = auth.currentUser;
            if (!user) return;

            setSaveStatus('checking');

            try {
                const onlinePayload = await getOnlinePayload<StandaloneWhiteboard[]>(STORAGE_KEYS.STANDALONE_WHITEBOARDS);
                const localPayload = getLocalPayload<StandaloneWhiteboard[]>(STORAGE_KEYS.STANDALONE_WHITEBOARDS);

                if (!isMounted) return;

                const onlineTime = onlinePayload?._lastModified || 0;
                const localTime = localPayload?._lastModified || 0;

                const onlineWhiteboards = Array.isArray(onlinePayload?._data) ? onlinePayload._data : [];
                const onlineWhiteboard = onlineWhiteboards.find(w => w.id === activeWhiteboardId);
                const onlineWhiteboardTime = onlineWhiteboard?.whiteboardData?.updatedAt || 0;

                const localWhiteboards = Array.isArray(localPayload?._data) ? localPayload._data : [];
                const localWhiteboard = localWhiteboards.find(w => w.id === activeWhiteboardId);
                const localWhiteboardTime = localWhiteboard?.whiteboardData?.updatedAt || 0;

                // Priority: cloud is newer if onlineTime > localTime OR onlineWhiteboardTime > localWhiteboardTime
                const isCloudNewer = Boolean(
                    onlinePayload && (
                        !localPayload ||
                        onlineTime > localTime ||
                        onlineWhiteboardTime > localWhiteboardTime
                    )
                );

                if (isCloudNewer && onlinePayload) {
                    // Download cloud version and update local storage + context state
                    setLocalPayload(STORAGE_KEYS.STANDALONE_WHITEBOARDS, onlinePayload);
                    reloadWhiteboardsFromLocal();
                    setWhiteboardVersion(onlineWhiteboardTime || onlineTime || Date.now());
                    setSaveStatus('cloud_updated');
                    setTimeout(() => {
                        if (isMounted) setSaveStatus('saved');
                    }, 3000);
                } else if (localPayload && (!onlinePayload || localTime > onlineTime)) {
                    // Local is newer: push local to online
                    await saveToOnline(STORAGE_KEYS.STANDALONE_WHITEBOARDS, localPayload);
                    setSaveStatus('saved');
                } else {
                    setSaveStatus('saved');
                }
            } catch (err) {
                console.error("Error checking whiteboard cloud version:", err);
                if (isMounted) setSaveStatus('saved');
            }
        };

        checkCloudVersion();

        return () => {
            isMounted = false;
        };
    }, [activeWhiteboardId, reloadWhiteboardsFromLocal]);

    // Memoize initialData per id & whiteboardVersion so it never changes reference during active drawing
    const initialData = useMemo(() => {
        return {
            elements: (activeWhiteboard?.whiteboardData?.elements as any) || [],
            appState: {
                theme: 'dark' as const,
                ...(activeWhiteboard?.whiteboardData?.appState || {})
            },
            files: activeWhiteboard?.whiteboardData?.files || {}
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWhiteboardId, whiteboardVersion]);

    const handleSave = useCallback((data: any) => {
        if (activeWhiteboardId) {
            updateWhiteboard(activeWhiteboardId, data);
        }
    }, [activeWhiteboardId, updateWhiteboard]);

    const handleSavingStatusChange = useCallback((isSaving: boolean) => {
        setSaveStatus(isSaving ? 'saving' : 'saved');
    }, []);

    const openWhiteboard = useCallback((whiteboard: StandaloneWhiteboard) => {
        setWhiteboardVersion(whiteboard.whiteboardData?.updatedAt || 0);
        setActiveWhiteboardId(whiteboard.id);
    }, []);

    const openProjectWhiteboard = useCallback((projectId: string) => {
        navigate(`/?project=${projectId}&tab=whiteboard`);
    }, [navigate]);

    const handleCreateWhiteboard = () => {
        const created = addWhiteboard();
        setWhiteboardVersion(created.whiteboardData?.updatedAt || 0);
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
            <div className="page-container whiteboard-detail-page">
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

                <div
                    ref={containerRef}
                    className={`whiteboard-tab-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`}
                >
                    <div className="whiteboard-header-bar">
                        <div className="whiteboard-title-info">
                            <GoogleIcon name="draw" size={20} />
                            <span>Pizarrón de <strong>{activeWhiteboard.name}</strong></span>
                        </div>
                        <div className="whiteboard-header-actions">
                            <div className="whiteboard-save-indicator">
                                {saveStatus === 'checking' ? (
                                    <span className="save-status saving" style={{ color: 'var(--color-primary-light, #60a5fa)' }}>
                                        <GoogleIcon name="cloud_sync" size={14} className="spin-icon" /> Verificando nube...
                                    </span>
                                ) : saveStatus === 'cloud_updated' ? (
                                    <span className="save-status saved" style={{ color: '#10b981' }}>
                                        <GoogleIcon name="cloud_download" size={14} /> Versión de la nube cargada
                                    </span>
                                ) : saveStatus === 'saving' ? (
                                    <span className="save-status saving">
                                        <GoogleIcon name="sync" size={14} className="spin-icon" /> Guardando...
                                    </span>
                                ) : (
                                    <span className="save-status saved">
                                        <GoogleIcon name="check_circle" size={14} /> Guardado
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                className="whiteboard-fullscreen-btn"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                            >
                                <GoogleIcon name={isFullscreen ? "fullscreen_exit" : "fullscreen"} size={18} />
                                <span>{isFullscreen ? "Salir" : "Pantalla completa"}</span>
                            </button>
                        </div>
                    </div>

                    <div className="whiteboard-canvas-container">
                        <ExcalidrawErrorBoundary>
                            <ExcalidrawCanvas
                                key={`${activeWhiteboard.id}-${whiteboardVersion}`}
                                projectId={activeWhiteboard.id}
                                initialData={initialData}
                                onSave={handleSave}
                                onSavingStatusChange={handleSavingStatusChange}
                            />
                        </ExcalidrawErrorBoundary>
                    </div>
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
                            onClick={() => openWhiteboard(wb)}
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
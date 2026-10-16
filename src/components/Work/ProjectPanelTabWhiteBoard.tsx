import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import type { Project } from "../../types/work";
import { useWork } from "../../context/WorkContext";
import ExcalidrawCanvas, { ExcalidrawErrorBoundary } from "../ExcalidrawCanvas";
import GoogleIcon from "../GoogleIcon";
import { getOnlinePayload, saveToOnline } from "../../context/OnlineSave";
import { getLocalPayload, setLocalPayload, STORAGE_KEYS } from "../../context/LocalSave";
import { auth } from "../../firebase";

interface ProjectPanelTabWhiteboardProps {
    project?: Project;
    name?: string;
}

const ProjectPanelTabWhiteboard: React.FC<ProjectPanelTabWhiteboardProps> = ({ project }) => {
    const { updateProjectWhiteboard, reloadProjectsFromLocal } = useWork();
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'checking' | 'cloud_updated'>('saved');
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [whiteboardVersion, setWhiteboardVersion] = useState<number>(() => project?.whiteboardData?.updatedAt || 0);

    const projectId = project?.id;

    // Sync fullscreen state with document fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!((
                document.fullscreenElement &&
                containerRef.current &&
                (document.fullscreenElement === containerRef.current || containerRef.current.contains(document.fullscreenElement))
            ));
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

    // Check cloud version on mount or project change to ensure the newest version is loaded
    useEffect(() => {
        if (!projectId) return;

        let isMounted = true;

        const checkCloudVersion = async () => {
            const user = auth.currentUser;
            if (!user) return;

            setSaveStatus('checking');

            try {
                const onlinePayload = await getOnlinePayload<Project[]>(STORAGE_KEYS.WORK_PROJECTS);
                const localPayload = getLocalPayload<Project[]>(STORAGE_KEYS.WORK_PROJECTS);

                if (!isMounted) return;

                const onlineTime = onlinePayload?._lastModified || 0;
                const localTime = localPayload?._lastModified || 0;

                const onlineProjects = Array.isArray(onlinePayload?._data) ? onlinePayload._data : [];
                const onlineProject = onlineProjects.find((p: Project) => p.id === projectId);
                const onlineWhiteboardTime = onlineProject?.whiteboardData?.updatedAt || 0;

                const localProjects = Array.isArray(localPayload?._data) ? localPayload._data : [];
                const localProject = localProjects.find((p: Project) => p.id === projectId);
                const localWhiteboardTime = localProject?.whiteboardData?.updatedAt || 0;

                // Priority: Cloud is newer if onlineTime > localTime OR onlineWhiteboardTime > localWhiteboardTime
                const isCloudNewer = Boolean(
                    onlinePayload && (
                        !localPayload ||
                        onlineTime > localTime ||
                        onlineWhiteboardTime > localWhiteboardTime
                    )
                );

                if (isCloudNewer && onlinePayload) {
                    // Download cloud version and update local storage + context state
                    setLocalPayload(STORAGE_KEYS.WORK_PROJECTS, onlinePayload);
                    reloadProjectsFromLocal();
                    const newVersion = onlineWhiteboardTime || onlineTime || Date.now();
                    setWhiteboardVersion(newVersion);
                    setSaveStatus('cloud_updated');
                    setTimeout(() => {
                        if (isMounted) setSaveStatus('saved');
                    }, 3000);
                } else if (localPayload && (!onlinePayload || localTime > onlineTime)) {
                    // Local is newer: push local to online
                    await saveToOnline(STORAGE_KEYS.WORK_PROJECTS, localPayload);
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
    }, [projectId, reloadProjectsFromLocal]);

    // Memoize initialData per project.id & whiteboardVersion so it never changes reference during active drawing
    const initialData = useMemo(() => {
        return {
            elements: (project?.whiteboardData?.elements as any) || [],
            appState: {
                theme: 'dark' as const,
                ...(project?.whiteboardData?.appState || {})
            },
            files: project?.whiteboardData?.files || {}
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project?.id, whiteboardVersion]);

    const handleSave = useCallback((data: any) => {
        if (projectId) {
            updateProjectWhiteboard(projectId, data);
        }
    }, [projectId, updateProjectWhiteboard]);

    const handleSavingStatusChange = useCallback((isSaving: boolean) => {
        setSaveStatus(isSaving ? 'saving' : 'saved');
    }, []);

    if (!project || !projectId) {
        return (
            <div className="empty-tab-state">
                <GoogleIcon name="gesture" size={48} style={{ color: 'var(--color-primary-light)' }} />
                <h3>Whiteboard</h3>
                <p>No hay un proyecto seleccionado para mostrar el pizarrón.</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`whiteboard-tab-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`}
        >
            <div className="whiteboard-header-bar">
                <div className="whiteboard-title-info">
                    <GoogleIcon name="draw" size={20} />
                    <span>Whiteboard de <strong>{project.name}</strong></span>
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
                        key={`${projectId}-${whiteboardVersion}`}
                        projectId={projectId}
                        initialData={initialData}
                        onSave={handleSave}
                        onSavingStatusChange={handleSavingStatusChange}
                    />
                </ExcalidrawErrorBoundary>
            </div>
        </div>
    );
};

export default ProjectPanelTabWhiteboard;

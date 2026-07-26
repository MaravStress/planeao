import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { Project } from "../../types/work";
import { useWork } from "../../context/WorkContext";
import GoogleIcon from "../GoogleIcon";
import "@excalidraw/excalidraw/index.css";

interface ProjectPanelTabWhiteboardProps {
    project?: Project;
    name?: string;
}

// Error Boundary to prevent black screen if module loading fails
class ExcalidrawErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("Excalidraw load error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="empty-tab-state" style={{ padding: '3rem 1.5rem' }}>
                    <GoogleIcon name="error_outline" size={48} style={{ color: 'var(--color-warning)' }} />
                    <h3>Error al cargar el pizarrón</h3>
                    <p style={{ marginBottom: '1rem' }}>
                        Hubo un problema al cargar los componentes de Excalidraw. Esto suele ocurrir cuando el caché de desarrollo necesita refrescarse.
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="btn-new-project"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        <GoogleIcon name="refresh" size={18} /> Recargar Aplicación
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Lazy-load Excalidraw component so it only loads when the tab is active.
// When the tab unmounts or project changes, resources are released from memory.
const ExcalidrawComponent = React.lazy(async () => {
    try {
        const mod = await import("@excalidraw/excalidraw");
        return { default: mod.Excalidraw };
    } catch (err) {
        console.error("Failed to load Excalidraw module", err);
        throw err;
    }
});

interface ExcalidrawCanvasProps {
    projectId: string;
    initialData: any;
    onSave: (data: any) => void;
    onSavingStatusChange: (isSaving: boolean) => void;
}

// Memoized Canvas wrapper to isolate Excalidraw from re-renders caused by WorkContext updates while drawing
const ExcalidrawCanvas = React.memo<ExcalidrawCanvasProps>(({ projectId, initialData, onSave, onSavingStatusChange }) => {
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastDataRef = useRef<any>(null);

    const handleChange = useCallback((elements: readonly any[], appState: any, files: any) => {
        onSavingStatusChange(true);

        const cleanAppState = {
            viewBackgroundColor: appState.viewBackgroundColor,
            gridSize: appState.gridSize,
            theme: appState.theme,
            currentItemFontFamily: appState.currentItemFontFamily,
            currentItemFontSize: appState.currentItemFontSize,
            currentItemStrokeColor: appState.currentItemStrokeColor,
            currentItemBackgroundColor: appState.currentItemBackgroundColor,
            currentItemFillStyle: appState.currentItemFillStyle,
            currentItemStrokeWidth: appState.currentItemStrokeWidth,
            currentItemStrokeStyle: appState.currentItemStrokeStyle,
            currentItemRoughness: appState.currentItemRoughness,
            currentItemOpacity: appState.currentItemOpacity,
            zoom: appState.zoom,
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
        };

        const dataToSave = {
            elements,
            appState: cleanAppState,
            files
        };

        lastDataRef.current = dataToSave;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            onSave(dataToSave);
            onSavingStatusChange(false);
        }, 500);
    }, [onSave, onSavingStatusChange]);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (lastDataRef.current) {
                onSave(lastDataRef.current);
            }
        };
    }, [onSave]);

    return (
        <Suspense fallback={
            <div className="whiteboard-loading-state">
                <GoogleIcon name="hourglass_top" size={40} className="spin-icon" />
                <p>Cargando Excalidraw...</p>
            </div>
        }>
            <ExcalidrawComponent
                key={projectId}
                initialData={initialData}
                onChange={handleChange}
                theme="dark"
                UIOptions={{
                    canvasActions: {
                        changeViewBackgroundColor: true,
                        clearCanvas: true,
                        loadScene: true,
                        saveToActiveFile: false,
                        export: { saveFileToDisk: true },
                        toggleTheme: true,
                    }
                }}
            />
        </Suspense>
    );
}, (prevProps, nextProps) => prevProps.projectId === nextProps.projectId);

const ProjectPanelTabWhiteboard: React.FC<ProjectPanelTabWhiteboardProps> = ({ project }) => {
    const { updateProjectWhiteboard } = useWork();
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

    const projectId = project?.id;

    // Memoize initialData per project.id so it never changes reference during active drawing
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
    }, [project?.id]);

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
        <div className="whiteboard-tab-wrapper">
            <div className="whiteboard-header-bar">
                <div className="whiteboard-title-info">
                    <GoogleIcon name="draw" size={20} />
                    <span>Whiteboard de <strong>{project.name}</strong></span>
                </div>
                <div className="whiteboard-save-indicator">
                    {saveStatus === 'saving' ? (
                        <span className="save-status saving">
                            <GoogleIcon name="sync" size={14} className="spin-icon" /> Guardando...
                        </span>
                    ) : (
                        <span className="save-status saved">
                            <GoogleIcon name="check_circle" size={14} /> Guardado
                        </span>
                    )}
                </div>
            </div>

            <div className="whiteboard-canvas-container">
                <ExcalidrawErrorBoundary>
                    <ExcalidrawCanvas
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
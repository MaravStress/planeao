import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { Project } from "../../types/work";
import { useWork } from "../../context/WorkContext";
import GoogleIcon from "../GoogleIcon";
import "@excalidraw/excalidraw/index.css";

interface ProjectPanelTabWhiteboardProps {
    project?: Project;
    name?: string;
}

// Lazy-load Excalidraw component so it only loads when the tab is active.
// When the tab unmounts or project changes, resources are released from memory.
const ExcalidrawComponent = React.lazy(async () => {
    const mod = await import("@excalidraw/excalidraw");
    return { default: mod.Excalidraw };
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
                <ExcalidrawCanvas
                    projectId={projectId}
                    initialData={initialData}
                    onSave={handleSave}
                    onSavingStatusChange={handleSavingStatusChange}
                />
            </div>
        </div>
    );
};

export default ProjectPanelTabWhiteboard;
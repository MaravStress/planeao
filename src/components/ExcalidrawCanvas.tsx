import React, { Suspense, useEffect, useRef, useCallback } from "react";
import GoogleIcon from "./GoogleIcon";

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
        sessionStorage.removeItem("excalidraw_chunk_retry");
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
const ExcalidrawComponent = React.lazy(async () => {
    try {
        const mod = await import("@excalidraw/excalidraw");
        sessionStorage.removeItem("excalidraw_chunk_retry");
        return { default: mod.Excalidraw };
    } catch (err) {
        console.error("Failed to load Excalidraw module", err);
        const hasRetried = sessionStorage.getItem("excalidraw_chunk_retry");
        if (!hasRetried) {
            sessionStorage.setItem("excalidraw_chunk_retry", "true");
            window.location.reload();
        }
        throw err;
    }
});

interface ExcalidrawCanvasProps {
    projectId: string;
    initialData: any;
    onSave: (data: any) => void;
    onSavingStatusChange: (isSaving: boolean) => void;
}

// Memoized Canvas wrapper to isolate Excalidraw from re-renders caused by context updates while drawing
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
}, (prevProps, nextProps) => prevProps.projectId === nextProps.projectId && prevProps.initialData === nextProps.initialData);

export { ExcalidrawErrorBoundary };
export default ExcalidrawCanvas;

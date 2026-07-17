import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GoogleIcon from "../GoogleIcon";
import type { Project } from "../../types/work";

interface ProjectPanelTabInfoProps {
    activeProject: Project;
    updateProject: (projectId: string, name: string, template: string[], defaultOrderDuration: number, description?: string) => void;
}

const ProjectPanelTabInfo: React.FC<ProjectPanelTabInfoProps> = ({ activeProject, updateProject }) => {

    const [infoInput, setInfoInput] = useState('');
    const [obsidianMode, setObsidianMode] = useState<'edit' | 'preview' | 'split'>('split');
    useEffect(() => {
        if (activeProject) {
            setInfoInput(activeProject.description || '');
        } else {
            setInfoInput('');
        }
    }, [activeProject.id]);

    const handleSaveDescription = (value: string) => {
        if (activeProject) {
            updateProject(
                activeProject.id,
                activeProject.name,
                activeProject.template,
                activeProject.defaultOrderDuration || 7,
                value
            );
        }
    };
    return (
        <>
            <div className="project-info-pane">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsla(0, 0%, 100%, 0.05)', paddingBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Información del Proyecto
                    </h3>
                    <div className="obsidian-mode-toggle">
                        <button
                            className={`obsidian-toggle-btn ${obsidianMode === 'edit' ? 'active' : ''}`}
                            onClick={() => setObsidianMode('edit')}
                            title="Modo Edición"
                        >
                            <GoogleIcon name="edit" size={16} />
                            <span>Editar</span>
                        </button>
                        <button
                            className={`obsidian-toggle-btn ${obsidianMode === 'split' ? 'active' : ''}`}
                            onClick={() => setObsidianMode('split')}
                            title="Modo Dividido"
                        >
                            <GoogleIcon name="vertical_split" size={16} />
                            <span>Dividido</span>
                        </button>
                        <button
                            className={`obsidian-toggle-btn ${obsidianMode === 'preview' ? 'active' : ''}`}
                            onClick={() => setObsidianMode('preview')}
                            title="Modo Lectura"
                        >
                            <GoogleIcon name="visibility" size={16} />
                            <span>Lectura</span>
                        </button>
                    </div>
                </div>

                <div className="project-info-content-area">
                    {obsidianMode === 'edit' && (
                        <textarea
                            className="project-info-textarea-split"
                            value={infoInput}
                            onChange={(e) => {
                                setInfoInput(e.target.value);
                                handleSaveDescription(e.target.value);
                            }}
                            placeholder="Escribe la información del proyecto aquí usando Markdown (títulos, listas, imágenes, enlaces...)"
                        />
                    )}
                    {obsidianMode === 'preview' && (
                        <div className="project-info-preview-split" style={{ height: '100%', overflowY: 'auto' }}>
                            {infoInput ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{infoInput}</ReactMarkdown>
                            ) : (
                                <span className="markdown-preview-hint">No hay información registrada. Haz clic en "Editar" o "Dividido" para comenzar.</span>
                            )}
                        </div>
                    )}
                    {obsidianMode === 'split' && (
                        <div className="project-info-split-container">
                            <div className="project-info-editor-column">
                                <textarea
                                    className="project-info-textarea-split"
                                    value={infoInput}
                                    onChange={(e) => {
                                        setInfoInput(e.target.value);
                                        handleSaveDescription(e.target.value);
                                    }}
                                    placeholder="Escribe la información del proyecto aquí usando Markdown (títulos, listas, imágenes, enlaces...)"
                                />
                            </div>
                            <div className="project-info-preview-column">
                                <div className="project-info-preview-split">
                                    {infoInput ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{infoInput}</ReactMarkdown>
                                    ) : (
                                        <span className="markdown-preview-hint">La vista previa formateada aparecerá aquí a medida que escribes...</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ProjectPanelTabInfo;
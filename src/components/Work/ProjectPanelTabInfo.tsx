import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GoogleIcon from "../GoogleIcon";
import type { Project } from "../../types/work";

interface ProjectPanelTabInfoProps {
    activeProject: Project;
    updateProject: (projectId: string, name: string, template: string[], defaultOrderDuration: number, description?: string) => void;
    onDeleteProject?: () => void;
}

interface Block {
    id: string;
    text: string;
    isEditing: boolean;
}

// Sub-component for each block to avoid cursor loss on parent re-render
const BlockEditor: React.FC<{
    block: Block;
    index: number;
    totalBlocks: number;
    onTextChange: (id: string, text: string) => void;
    onEnter: (index: number) => void;
    onArrowUp: (index: number) => void;
    onArrowDown: (index: number) => void;
    onBackspace: (index: number) => void;
    onBlur: (id: string) => void;
    onClick: (id: string) => void;
}> = ({ block, index, totalBlocks, onTextChange, onEnter, onArrowUp, onArrowDown, onBackspace, onBlur, onClick }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback((el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, []);

    useEffect(() => {
        if (block.isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = textareaRef.current.value.length;
            textareaRef.current.selectionEnd = textareaRef.current.value.length;
            adjustHeight(textareaRef.current);
        }
    }, [block.isEditing]);

    useEffect(() => {
        if (block.isEditing && textareaRef.current) {
            adjustHeight(textareaRef.current);
        }
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const currentText = block.text;

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onEnter(index);
        } else if (e.key === 'ArrowUp') {
            const { selectionStart } = e.currentTarget;
            const isFirstLine = !currentText.slice(0, selectionStart).includes('\n');
            if (isFirstLine && index > 0) {
                e.preventDefault();
                onArrowUp(index);
            }
        } else if (e.key === 'ArrowDown') {
            const { selectionEnd } = e.currentTarget;
            const isLastLine = !currentText.slice(selectionEnd).includes('\n');
            if (isLastLine && index < totalBlocks - 1) {
                e.preventDefault();
                onArrowDown(index);
            }
        } else if (e.key === 'Backspace' && currentText === '' && totalBlocks > 1) {
            e.preventDefault();
            onBackspace(index);
        }
    };

    if (block.isEditing) {
        return (
            <div className="project-info-block-wrapper">
                <textarea
                    ref={textareaRef}
                    className="project-info-textarea-block"
                    defaultValue={block.text}
                    onChange={(e) => {
                        onTextChange(block.id, e.target.value);
                        adjustHeight(e.target);
                    }}
                    onInput={(e) => adjustHeight(e.currentTarget)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => onBlur(block.id)}
                    placeholder="Escribe información aquí en Markdown... (Enter para nuevo bloque, Shift+Enter para salto de línea)"
                />
            </div>
        );
    }

    return (
        <div className="project-info-block-wrapper">
            <div
                className="project-info-block-preview"
                onClick={() => onClick(block.id)}
            >
                {block.text.trim() ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
                ) : null}
            </div>
        </div>
    );
};

const ProjectPanelTabInfo: React.FC<ProjectPanelTabInfoProps> = ({ activeProject, updateProject, onDeleteProject }) => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const initializedRef = useRef(false);

    // Stable refs to avoid stale closures
    const projectStaticRef = useRef({ id: '', name: '', template: [] as string[], defaultOrderDuration: 7 });
    projectStaticRef.current = {
        id: activeProject?.id || '',
        name: activeProject?.name || '',
        template: activeProject?.template || [],
        defaultOrderDuration: activeProject?.defaultOrderDuration || 7
    };

    const blocksRef = useRef(blocks);
    blocksRef.current = blocks;
    const updateProjectRef = useRef(updateProject);
    updateProjectRef.current = updateProject;

    // Single persist — always reads from refs
    const persist = useCallback(() => {
        const p = projectStaticRef.current;
        updateProjectRef.current(
            p.id,
            p.name,
            p.template,
            p.defaultOrderDuration,
            blocksRef.current.map(b => b.text).join('\n\n')
        );
    }, []);

    // Sync state when active project changes or initial load
    useEffect(() => {
        if (initializedRef.current && activeProject) return;
        if (!activeProject) return;
        initializedRef.current = true;

        const rawDescription = activeProject.description || '';
        if (rawDescription.trim()) {
            const initialParagraphs = rawDescription.split(/\n\n+/);
            setBlocks(
                initialParagraphs.map((para, index) => ({
                    id: `block-${Date.now()}-${index}`,
                    text: para,
                    isEditing: false
                }))
            );
        } else {
            const initialId = `block-${Date.now()}-0`;
            setBlocks([
                {
                    id: initialId,
                    text: '',
                    isEditing: true
                }
            ]);
        }
    }, [activeProject?.id]);

    // === Block callbacks — only update local state, persist on blur ===

    const handleTextChange = useCallback((id: string, newText: string) => {
        setBlocks(prev => prev.map(b => (b.id === id ? { ...b, text: newText } : b)));
    }, []);

    const handleEnter = useCallback((index: number) => {
        setBlocks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], isEditing: false };
            const newBlockId = `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            updated.splice(index + 1, 0, { id: newBlockId, text: '', isEditing: true });
            setTimeout(persist, 0);
            return updated;
        });
    }, [persist]);

    const handleArrowUp = useCallback((index: number) => {
        setBlocks(prev => {
            const updated = prev.map((b, i) => i === index - 1 ? { ...b, isEditing: true } : b);
            return updated;
        });
    }, []);

    const handleArrowDown = useCallback((index: number) => {
        setBlocks(prev => {
            const updated = prev.map((b, i) => i === index + 1 ? { ...b, isEditing: true } : b);
            return updated;
        });
    }, []);

    const handleBackspace = useCallback((index: number) => {
        setBlocks(prev => {
            if (prev.length <= 1) return prev;
            const prevIndex = Math.max(0, index - 1);
            const updated = prev.filter((_, i) => i !== index);
            updated[prevIndex] = { ...updated[prevIndex], isEditing: true };
            setTimeout(persist, 0);
            return updated;
        });
    }, [persist]);

    const handleBlockClick = useCallback((id: string) => {
        setBlocks(prev => prev.map(b => (b.id === id ? { ...b, isEditing: true } : b)));
    }, []);

    const handleBlur = useCallback((id: string) => {
        setBlocks(prev =>
            prev.map(b => {
                if (b.id === id) {
                    if (!b.text.trim() && prev.length === 1) return b;
                    return { ...b, isEditing: false };
                }
                return b;
            })
        );
        setTimeout(persist, 0);
    }, [persist]);

    const handleAddBlockBottom = useCallback(() => {
        const newBlockId = `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        setBlocks(prev => {
            const updated = [...prev, { id: newBlockId, text: '', isEditing: true }];
            return updated;
        });
        setTimeout(persist, 0);
    }, [persist]);

    return (
        <div className="project-info-pane">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsla(0, 0%, 100%, 0.05)', paddingBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Información del Proyecto
                </h3>
            </div>

            <div className="project-info-blocks-container" style={{ marginTop: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {blocks.map((block, index) => (
                    <BlockEditor
                        key={block.id}
                        block={block}
                        index={index}
                        totalBlocks={blocks.length}
                        onTextChange={handleTextChange}
                        onEnter={handleEnter}
                        onArrowUp={handleArrowUp}
                        onArrowDown={handleArrowDown}
                        onBackspace={handleBackspace}
                        onBlur={handleBlur}
                        onClick={handleBlockClick}
                    />
                ))}

                <button
                    className="add-block-btn"
                    onClick={handleAddBlockBottom}
                    style={{
                        alignSelf: 'flex-start',
                        background: 'transparent',
                        border: '1px dashed hsla(0, 0%, 100%, 0.15)',
                        color: 'var(--color-text-muted)',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        fontSize: '0.85rem'
                    }}
                >
                    <GoogleIcon name="add" size={16} />
                    <span>Añadir bloque</span>
                </button>
            </div>

            {onDeleteProject && (
                <div style={{
                    marginTop: '3rem',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    //border: '1px solid hsla(0, 0%, 100%, 0.08)',
                    // background: 'hsla(0, 0%, 100%, 0.03)',
                    //backdropFilter: 'blur(10px)',
                    //WebkitBackdropFilter: 'blur(10px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>

                    </div>
                    <button
                        onClick={onDeleteProject}
                        title="Eliminar Proyecto"
                        style={{
                            background: 'hsla(0, 0%, 100%, 0.06)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid hsla(0, 0%, 100%, 0.12)',
                            color: 'var(--color-text-muted)',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.15)';
                            e.currentTarget.style.borderColor = 'hsla(0, 0%, 100%, 0.25)';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.06)';
                            e.currentTarget.style.borderColor = 'hsla(0, 0%, 100%, 0.12)';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <GoogleIcon name="delete" size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectPanelTabInfo;
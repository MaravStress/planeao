import React, { useState, useEffect, useRef } from "react";
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

const ProjectPanelTabInfo: React.FC<ProjectPanelTabInfoProps> = ({ activeProject, updateProject, onDeleteProject }) => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

    // Sync state when active project changes or initial load
    useEffect(() => {
        if (activeProject) {
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
                setFocusedBlockId(initialId);
            }
        }
    }, [activeProject.id]);

    const adjustHeight = (el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    // Focus active block textarea automatically and adjust height for editing blocks
    useEffect(() => {
        blocks.forEach(b => {
            if (b.isEditing) {
                adjustHeight(textareaRefs.current[b.id]);
            }
        });

        if (focusedBlockId && textareaRefs.current[focusedBlockId]) {
            const el = textareaRefs.current[focusedBlockId];
            if (el) {
                el.focus();
                el.selectionStart = el.value.length;
                el.selectionEnd = el.value.length;
                adjustHeight(el);
            }
        }
    }, [focusedBlockId, blocks]);

    const saveBlocksToProject = (updatedBlocks: Block[]) => {
        const fullText = updatedBlocks.map(b => b.text).join('\n\n');
        if (activeProject) {
            updateProject(
                activeProject.id,
                activeProject.name,
                activeProject.template,
                activeProject.defaultOrderDuration || 7,
                fullText
            );
        }
    };

    const handleTextChange = (id: string, newText: string) => {
        const updated = blocks.map(b => (b.id === id ? { ...b, text: newText } : b));
        setBlocks(updated);
        saveBlocksToProject(updated);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
        const currentBlock = blocks[index];

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline in current block

            // Switch current block to preview mode
            const updated = [...blocks];
            updated[index] = { ...currentBlock, isEditing: false };

            // Insert new block directly underneath
            const newBlockId = `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const newBlock: Block = {
                id: newBlockId,
                text: '',
                isEditing: true
            };

            updated.splice(index + 1, 0, newBlock);
            setBlocks(updated);
            setFocusedBlockId(newBlockId);
            saveBlocksToProject(updated);
        } else if (e.key === 'ArrowUp') {
            const { selectionStart } = e.currentTarget;
            const isFirstLine = !currentBlock.text.slice(0, selectionStart).includes('\n');
            if (isFirstLine && index > 0) {
                e.preventDefault();
                const prevBlock = blocks[index - 1];
                const updated = blocks.map((b, i) => i === index - 1 ? { ...b, isEditing: true } : b);
                setBlocks(updated);
                setFocusedBlockId(prevBlock.id);
            }
        } else if (e.key === 'ArrowDown') {
            const { selectionEnd } = e.currentTarget;
            const isLastLine = !currentBlock.text.slice(selectionEnd).includes('\n');
            if (isLastLine && index < blocks.length - 1) {
                e.preventDefault();
                const nextBlock = blocks[index + 1];
                const updated = blocks.map((b, i) => i === index + 1 ? { ...b, isEditing: true } : b);
                setBlocks(updated);
                setFocusedBlockId(nextBlock.id);
            }
        } else if (e.key === 'Backspace' && currentBlock.text === '' && blocks.length > 1) {
            e.preventDefault();
            const prevIndex = Math.max(0, index - 1);
            const prevBlockId = blocks[prevIndex].id;

            const updated = blocks.filter((_, i) => i !== index);
            updated[prevIndex] = { ...updated[prevIndex], isEditing: true };

            setBlocks(updated);
            setFocusedBlockId(prevBlockId);
            saveBlocksToProject(updated);
        }
    };

    const handleBlockClick = (id: string) => {
        const updated = blocks.map(b => (b.id === id ? { ...b, isEditing: true } : b));
        setBlocks(updated);
        setFocusedBlockId(id);
    };

    const handleBlur = (id: string) => {
        setBlocks(prev =>
            prev.map(b => {
                if (b.id === id) {
                    // Keep empty block editable if it's the only block
                    if (!b.text.trim() && prev.length === 1) {
                        return b;
                    }
                    return { ...b, isEditing: false };
                }
                return b;
            })
        );
    };

    const handleAddBlockBottom = () => {
        const newBlockId = `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newBlock: Block = {
            id: newBlockId,
            text: '',
            isEditing: true
        };
        const updated = [...blocks, newBlock];
        setBlocks(updated);
        setFocusedBlockId(newBlockId);
    };

    return (
        <div className="project-info-pane">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsla(0, 0%, 100%, 0.05)', paddingBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Información del Proyecto
                </h3>
            </div>

            <div className="project-info-blocks-container" style={{ marginTop: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {blocks.map((block, index) => (
                    <div key={block.id} className="project-info-block-wrapper">
                        {block.isEditing ? (
                            <textarea
                                ref={el => {
                                    textareaRefs.current[block.id] = el;
                                    adjustHeight(el);
                                }}
                                className="project-info-textarea-block"
                                value={block.text}
                                onChange={(e) => {
                                    handleTextChange(block.id, e.target.value);
                                    adjustHeight(e.target);
                                }}
                                onInput={(e) => adjustHeight(e.currentTarget)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onBlur={() => handleBlur(block.id)}
                                placeholder="Escribe información aquí en Markdown... (Enter para nuevo bloque, Shift+Enter para salto de línea)"
                            />
                        ) : (
                            <div
                                className="project-info-block-preview"
                                onClick={() => handleBlockClick(block.id)}
                            >
                                {block.text.trim() ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
                                ) : (
                                    <span className="markdown-preview-hint">Bloque vacío. Haz clic para editar...</span>
                                )}
                            </div>
                        )}
                    </div>
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
                    border: '1px solid hsla(0, 0%, 100%, 0.08)',
                    background: 'hsla(0, 0%, 100%, 0.03)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>Eliminar Proyecto</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                            Eliminar este proyecto y borrar permanentemente sus listas y configuraciones.
                        </div>
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
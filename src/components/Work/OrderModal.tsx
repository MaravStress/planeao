import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GoogleIcon from "../GoogleIcon";
import type { Order } from "../../types/work";

interface OrderModalProps {
    order: Order;
    columnTitle?: string;
    columnColor?: string;
    onUpdateOrder: (updatedOrder: Order) => void;
    onDeleteOrder: (orderId: string) => void;
    onClose: () => void;
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

const OrderModal: React.FC<OrderModalProps> = ({
    order,
    columnTitle,
    columnColor,
    onUpdateOrder,
    onDeleteOrder,
    onClose
}) => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [title, setTitle] = useState(order.title);
    const [startDate, setStartDate] = useState(formatDateForInput(order.startDate));
    const [endDate, setEndDate] = useState(formatDateForInput(order.endDate));
    const modalRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    // === Stable refs to avoid stale closures in callbacks ===
    const orderStaticRef = useRef({ id: order.id, status: order.status, projectId: order.projectId });
    useEffect(() => {
        orderStaticRef.current = { id: order.id, status: order.status, projectId: order.projectId };
    }, [order.id, order.status, order.projectId]);

    const blocksRef = useRef(blocks);
    blocksRef.current = blocks;
    const titleRef = useRef(title);
    titleRef.current = title;
    const startDateRef = useRef(startDate);
    startDateRef.current = startDate;
    const endDateRef = useRef(endDate);
    endDateRef.current = endDate;

    // Single persist function — always reads latest from refs, never stale
    const persist = useCallback(() => {
        const o = orderStaticRef.current;
        onUpdateOrder({
            id: o.id,
            projectId: o.projectId,
            title: titleRef.current,
            startDate: new Date(`${startDateRef.current}T00:00:00`).toISOString(),
            endDate: new Date(`${endDateRef.current}T00:00:00`).toISOString(),
            status: o.status,
            description: blocksRef.current.map(b => b.text).join('\n\n')
        });
    }, [onUpdateOrder]);

    // Initialize blocks only once when modal opens
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        setTitle(order.title);
        setStartDate(formatDateForInput(order.startDate));
        setEndDate(formatDateForInput(order.endDate));

        const rawDescription = order.description || '';
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
    }, [order.id]);

    // === Block editors callbacks — only update local state, no stale closures ===

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
        // Persist on blur to capture latest text
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

    // === Simple state changes for title/dates — persist only on blur ===

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
    };

    const handleTitleBlur = () => {
        setTimeout(persist, 0);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };

    const handleStartDateBlur = () => {
        setTimeout(persist, 0);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const handleEndDateBlur = () => {
        setTimeout(persist, 0);
    };

    const handleDelete = () => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la tarea "${title}"?`)) {
            onDeleteOrder(order.id);
            onClose();
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const statusLabel = order.status === 'todo' ? 'Pendiente'
        : order.status === 'in_progress' ? 'En Proceso'
        : order.status === 'done' ? 'Completado'
        : order.status || 'Pendiente';

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="order-modal" ref={modalRef}>
                {/* Header */}
                <div className="order-modal-header">
                    <div className="order-modal-title-section">
                        <input
                            className="order-modal-title-input"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            onBlur={handleTitleBlur}
                            placeholder="Título de la tarea"
                        />
                        <div className="order-modal-badges">
                            <span
                                className="order-modal-status-badge"
                                style={columnColor ? { backgroundColor: columnColor, color: '#fff' } : undefined}
                            >
                                {columnTitle || statusLabel}
                            </span>
                        </div>
                    </div>
                    <button className="order-modal-close-btn" onClick={onClose} title="Cerrar (Escape)">
                        <GoogleIcon name="close" size={20} />
                    </button>
                </div>

                {/* Dates */}
                <div className="order-modal-dates">
                    <div className="order-modal-date-group">
                        <label>Fecha de Inicio</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            onBlur={handleStartDateBlur}
                            className="order-modal-date-input"
                        />
                    </div>
                    <div className="order-modal-date-group">
                        <label>Fecha Final</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            onBlur={handleEndDateBlur}
                            className="order-modal-date-input"
                        />
                    </div>
                </div>

                {/* Block Editor */}
                <div className="order-modal-body">
                    <div className="order-modal-blocks-container">
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
                        >
                            <GoogleIcon name="add" size={16} />
                            <span>Añadir bloque</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="order-modal-footer">
                    <button
                        className="order-modal-delete-btn"
                        onClick={handleDelete}
                        title="Eliminar tarea"
                    >
                        <GoogleIcon name="delete" size={16} />
                        <span>Eliminar tarea</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

function formatDateForInput(dateStr: string) {
    try {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return '';
    }
}

export default OrderModal;
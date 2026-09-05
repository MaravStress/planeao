import React, { useState, useEffect, useRef } from "react";
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
    const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Sync state when order changes
    useEffect(() => {
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
            setFocusedBlockId(initialId);
        }
    }, [order.id]);

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

    const saveBlocksToOrder = (updatedBlocks: Block[]) => {
        const fullText = updatedBlocks.map(b => b.text).join('\n\n');
        onUpdateOrder({
            ...order,
            title,
            startDate: new Date(`${startDate}T00:00:00`).toISOString(),
            endDate: new Date(`${endDate}T00:00:00`).toISOString(),
            description: fullText
        });
    };

    const handleTextChange = (id: string, newText: string) => {
        const updated = blocks.map(b => (b.id === id ? { ...b, text: newText } : b));
        setBlocks(updated);
        saveBlocksToOrder(updated);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
        const currentBlock = blocks[index];

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            const updated = [...blocks];
            updated[index] = { ...currentBlock, isEditing: false };

            const newBlockId = `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const newBlock: Block = {
                id: newBlockId,
                text: '',
                isEditing: true
            };

            updated.splice(index + 1, 0, newBlock);
            setBlocks(updated);
            setFocusedBlockId(newBlockId);
            saveBlocksToOrder(updated);
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
            saveBlocksToOrder(updated);
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

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        onUpdateOrder({
            ...order,
            title: newTitle,
            startDate: new Date(`${startDate}T00:00:00`).toISOString(),
            endDate: new Date(`${endDate}T00:00:00`).toISOString(),
            description: blocks.map(b => b.text).join('\n\n')
        });
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStartDate(val);
        onUpdateOrder({
            ...order,
            title,
            startDate: new Date(`${val}T00:00:00`).toISOString(),
            endDate: new Date(`${endDate}T00:00:00`).toISOString(),
            description: blocks.map(b => b.text).join('\n\n')
        });
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEndDate(val);
        onUpdateOrder({
            ...order,
            title,
            startDate: new Date(`${startDate}T00:00:00`).toISOString(),
            endDate: new Date(`${val}T00:00:00`).toISOString(),
            description: blocks.map(b => b.text).join('\n\n')
        });
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
                            className="order-modal-date-input"
                        />
                    </div>
                    <div className="order-modal-date-group">
                        <label>Fecha Final</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            className="order-modal-date-input"
                        />
                    </div>
                </div>

                {/* Block Editor */}
                <div className="order-modal-body">
                    <div className="order-modal-blocks-container">
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
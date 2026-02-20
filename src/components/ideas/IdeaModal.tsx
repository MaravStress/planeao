import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Idea, BusinessModelCanvas, IdeaSettings } from '../../types/ideas';
import { X, Trash2, Image as ImageIcon } from 'lucide-react';

interface IdeaModalProps {
    idea: Idea | null;
    settings: IdeaSettings;
    onSave: (idea: Idea) => void;
    onDelete?: (ideaId: string) => void;
}

const MarkdownField = ({
    value,
    onChange,
    id,
    label,
    nextId,
    placeholder,
    className = "canvas-box",
    customClass = ""
}: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && ref.current) {
            ref.current.focus();
        }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setIsEditing(false);
            if (nextId) {
                // Find next markdown preview wrapper and click it to switch to edit mode
                const nextEl = document.getElementById(`md-field-${nextId}`);
                if (nextEl) {
                    nextEl.click();
                } else {
                    // Fallback focus to normal input if exists
                    document.getElementById(nextId)?.focus();
                }
            }
        }
    };

    return (
        <div className={`${className} ${customClass}`}>
            {label && <h4>{label}</h4>}
            <div className="markdown-wrapper" id={`md-field-${id}`} onClick={() => setIsEditing(true)}>
                {isEditing ? (
                    <textarea
                        ref={ref}
                        className="form-control"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => setIsEditing(false)}
                        placeholder={placeholder}
                    />
                ) : (
                    <div className="markdown-preview" tabIndex={0} onFocus={() => setIsEditing(true)}>
                        {value ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown> : <span className="markdown-preview-hint">Clic para editar...</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

const IdeaModal: React.FC<IdeaModalProps> = ({ idea, settings, onSave, onDelete }) => {
    const [formData, setFormData] = useState<Idea>(
        idea || {
            id: crypto.randomUUID(),
            title: 'Nueva Idea',
            category: 'General',
            status: 'Idea',
            imageUrl: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            description: '',
            canvas: {
                keyPartners: '', keyActivities: '', keyResources: '',
                valuePropositions: '', customerRelationships: '', channels: '',
                customerSegments: '', costStructure: '', revenueStreams: ''
            }
        }
    );

    // Backward compatibility for old ideas that had description as object
    useEffect(() => {
        if (idea) {
            let processedIdea = { ...idea };
            if (typeof idea.description === 'object' && idea.description !== null) {
                const descMap: any = idea.description;
                processedIdea.description = `**¿Qué hacer?**\n${descMap.what || ''}\n\n**¿A quién hacerlo?**\n${descMap.toWhom || ''}\n\n**¿Por qué lo necesitan?**\n${descMap.why || ''}`;
            }
            setFormData(processedIdea);
        }
    }, [idea]);

    const handleChange = (field: keyof Idea, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCanvasChange = (field: keyof BusinessModelCanvas, value: string) => {
        setFormData(prev => ({ ...prev, canvas: { ...prev.canvas, [field]: value } }));
    };

    const handleSaveClick = () => {
        onSave({
            ...formData,
            updatedAt: new Date().toISOString()
        });
    };

    const handlePasteImage = (e: React.ClipboardEvent<HTMLElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            handleChange('imageUrl', event.target.result as string);
                        }
                    };
                    reader.readAsDataURL(blob);
                    e.preventDefault();
                }
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleSaveClick()}>
            <div className="idea-modal">
                <div
                    className={`modal-banner ${!formData.imageUrl ? 'empty-banner' : ''}`}
                    style={{ backgroundImage: formData.imageUrl ? `url(${formData.imageUrl})` : 'none' }}
                    onPaste={handlePasteImage}
                >
                    {!formData.imageUrl && (
                        <div className="banner-input-container">
                            <ImageIcon size={32} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
                            <input
                                id="field-image"
                                className="form-control banner-input"
                                value={formData.imageUrl}
                                onChange={e => handleChange('imageUrl', e.target.value)}
                                onPaste={handlePasteImage}
                                placeholder="Pega una URL o copia/pega una imagen (Ctrl+V) directamente aquí..."
                                onKeyDown={e => { if (e.key === 'Enter') document.getElementById('field-title')?.focus() }}
                            />
                        </div>
                    )}

                    <div className="floating-actions">
                        {formData.imageUrl && (
                            <button
                                className="floating-btn btn-danger-float"
                                onClick={() => handleChange('imageUrl', '')}
                                title="Eliminar Imagen"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button className="floating-btn btn-close-float" onClick={handleSaveClick}>
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group" style={{ flex: 2 }}>
                                <label>Título de la idea</label>
                                <input
                                    id="field-title"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') document.getElementById('field-category')?.focus() }}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Categoría</label>
                                <select
                                    id="field-category"
                                    className="form-control"
                                    value={formData.category}
                                    onChange={e => handleChange('category', e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') document.getElementById('field-status')?.focus() }}
                                >
                                    {/* Ensure the current category is always an option even if deleted from settings */}
                                    {!settings.categories.find(c => c.name === formData.category) && formData.category && (
                                        <option value={formData.category}>{formData.category}</option>
                                    )}
                                    {settings.categories.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Estado</label>
                                <select
                                    id="field-status"
                                    className="form-control"
                                    value={formData.status}
                                    onChange={e => handleChange('status', e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') document.getElementById('field-image')?.focus() }}
                                >
                                    {/* Ensure the current status is always an option even if deleted from settings */}
                                    {!settings.statuses.find(s => s.name === formData.status) && formData.status && (
                                        <option value={formData.status}>{formData.status}</option>
                                    )}
                                    {settings.statuses.map(s => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>¿De qué trata tu idea, para quién y por qué?</label>
                            <MarkdownField
                                id="desc-main"
                                value={formData.description}
                                onChange={(v: string) => handleChange('description', v)}
                                nextId="canvas-kp"
                                className="form-group"
                            />
                        </div>
                    </div>
                    <div className="form-section canvas-container">
                        <h3>Business Model Canvas</h3>
                        <div className="canvas-grid">
                            <MarkdownField
                                id="canvas-kp" label="Asociaciones Clave" customClass="box-kp"
                                value={formData.canvas.keyPartners} onChange={(v: string) => handleCanvasChange('keyPartners', v)}
                                nextId="canvas-ka"
                            />
                            <MarkdownField
                                id="canvas-ka" label="Actividades Clave" customClass="box-ka"
                                value={formData.canvas.keyActivities} onChange={(v: string) => handleCanvasChange('keyActivities', v)}
                                nextId="canvas-kr"
                            />
                            <MarkdownField
                                id="canvas-kr" label="Recursos Clave" customClass="box-kr"
                                value={formData.canvas.keyResources} onChange={(v: string) => handleCanvasChange('keyResources', v)}
                                nextId="canvas-vp"
                            />
                            <MarkdownField
                                id="canvas-vp" label="Propuesta de Valor" customClass="box-vp"
                                value={formData.canvas.valuePropositions} onChange={(v: string) => handleCanvasChange('valuePropositions', v)}
                                nextId="canvas-cr"
                            />
                            <MarkdownField
                                id="canvas-cr" label="Relaciones con Clientes" customClass="box-cr"
                                value={formData.canvas.customerRelationships} onChange={(v: string) => handleCanvasChange('customerRelationships', v)}
                                nextId="canvas-ch"
                            />
                            <MarkdownField
                                id="canvas-ch" label="Canales" customClass="box-ch"
                                value={formData.canvas.channels} onChange={(v: string) => handleCanvasChange('channels', v)}
                                nextId="canvas-cs"
                            />
                            <MarkdownField
                                id="canvas-cs" label="Segmentos de Mercado" customClass="box-cs"
                                value={formData.canvas.customerSegments} onChange={(v: string) => handleCanvasChange('customerSegments', v)}
                                nextId="canvas-cs-bottom"
                            />
                            <MarkdownField
                                id="canvas-cs-bottom" label="Estructura de Costes" customClass="box-cs-bottom"
                                value={formData.canvas.costStructure} onChange={(v: string) => handleCanvasChange('costStructure', v)}
                                nextId="canvas-rs-bottom"
                            />
                            <MarkdownField
                                id="canvas-rs-bottom" label="Fuentes de Ingresos" customClass="box-rs-bottom"
                                value={formData.canvas.revenueStreams} onChange={(v: string) => handleCanvasChange('revenueStreams', v)}
                                nextId="btn-save"
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    {idea && onDelete && (
                        <button
                            className="btn-danger"
                            style={{ marginRight: 'auto' }}
                            onClick={() => {
                                if (window.confirm('¿Estás seguro de que quieres eliminar esta idea?')) {
                                    onDelete(idea.id);
                                }
                            }}
                        >
                            Eliminar Idea
                        </button>
                    )}
                    <button id="btn-save" className="btn-primary" onClick={handleSaveClick}>Listo</button>
                </div>
            </div>
        </div>
    );
};

export default IdeaModal;

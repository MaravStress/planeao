import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Timeline from '../components/Work/Timeline';
import ProjectCard from '../components/Work/ProjectCard';
import EditOrderModal from '../components/Work/EditOrderModal';
import type { Project, Order } from '../types/work';
import GoogleIcon from '../components/GoogleIcon';
import { useWork } from '../context/WorkContext';
import ImportExportButtons from '../components/ImportExportButtons';
import KanbanBoard from '../components/Work/KanbanBoard';
import '../styles/Work.css';
import ProjectPanel from '../components/Work/ProjectPanel';

const WorkPage: React.FC = () => {
    const {
        projects,
        addProject: addProjectContext,
        updateProject,
        updateOrder,
        deleteOrder
    } = useWork();

    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'whiteboard' | 'kanban'>('info');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [infoInput, setInfoInput] = useState('');
    const [obsidianMode, setObsidianMode] = useState<'edit' | 'preview' | 'split'>('split');

    const handleAddProject = () => {
        addProjectContext();
    };

    const handleDeleteOrder = (projectId: string, orderId: string) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este pedido?");
        if (confirmDelete) {
            deleteOrder(projectId, orderId);
            setEditingOrder(null);
        }
    };

    const activeProject = projects.find(p => p.id === activeProjectId);

    // Load project description into editor state when active project changes
    useEffect(() => {
        if (activeProject) {
            setInfoInput(activeProject.description || '');
        } else {
            setInfoInput('');
        }
    }, [activeProjectId]);

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

    const handleMoveOrderStatus = (order: Order, newStatus: 'todo' | 'in_progress' | 'done') => {
        if (activeProject) {
            updateOrder(activeProject.id, {
                ...order,
                status: newStatus
            });
        }
    };

    const handleTitleDoubleClick = () => {
        if (activeProject) {
            setTitleInput(activeProject.name);
            setIsEditingTitle(true);
        }
    };

    const handleSaveTitle = () => {
        const trimmed = titleInput.trim();
        if (trimmed && activeProject && trimmed !== activeProject.name) {
            updateProject(
                activeProject.id,
                trimmed,
                activeProject.template,
                activeProject.defaultOrderDuration || 7,
                activeProject.description || ''
            );
        }
        setIsEditingTitle(false);
    };

    // Detail View when a project is selected
    if (activeProjectId && activeProject) {
        return (

            <div className="page-container" style={{ display: 'flex', flexDirection: 'column' }}>
                <ProjectPanel name={"como?"} />
                <div className="project-detail-container">
                    <div className="project-detail-header">
                        <button
                            className="back-button"
                            onClick={() => {
                                setActiveProjectId(null);
                                setIsEditingTitle(false);
                            }}
                            title="Volver a Proyectos"
                        >
                            <GoogleIcon name="arrow_back" size={24} />
                        </button>
                        {isEditingTitle ? (
                            <input
                                type="text"
                                className="project-detail-title-input"
                                value={titleInput}
                                onChange={(e) => setTitleInput(e.target.value)}
                                onBlur={handleSaveTitle}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSaveTitle();
                                    } else if (e.key === 'Escape') {
                                        setIsEditingTitle(false);
                                    }
                                }}
                                autoFocus
                                style={{
                                    background: 'var(--color-bg-input)',
                                    border: '1px solid var(--color-primary)',
                                    color: 'var(--color-text-main)',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    outline: 'none',
                                    width: '300px'
                                }}
                            />
                        ) : (
                            <h2
                                className="project-detail-title"
                                onDoubleClick={handleTitleDoubleClick}
                                title="Doble clic para editar"
                                style={{ cursor: 'pointer' }}
                            >
                                {activeProject.name}
                            </h2>
                        )}
                        <div className="project-tabs" style={{ marginLeft: 'auto' }}>
                            <button
                                className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                                onClick={() => setActiveTab('info')}
                            >
                                Información
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'whiteboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('whiteboard')}
                            >
                                Whiteboard
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'kanban' ? 'active' : ''}`}
                                onClick={() => setActiveTab('kanban')}
                            >
                                Kanban
                            </button>
                        </div>
                    </div>

                    <div className="tab-content-container">
                        {activeTab === 'info' && (
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
                        )}
                        {activeTab === 'whiteboard' && (
                            <div className="empty-tab-state">
                                <GoogleIcon name="gesture" size={48} style={{ color: 'var(--color-primary-light)' }} />
                                <h3>Whiteboard</h3>
                                <p>Esta pestaña se encuentra vacía por el momento. Aquí tendrás un espacio de dibujo y notas libres para <strong>{activeProject.name}</strong>.</p>
                            </div>
                        )}
                        {activeTab === 'kanban' && (
                            <KanbanBoard
                                orders={activeProject.orders || []}
                                onMoveOrder={handleMoveOrderStatus}
                                onEditOrder={setEditingOrder}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Grid View showing all projects and the timeline
    return (
        <div className="page-container" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="work-page-title">Work</h1>
                    <p>Gestiona tus proyectos y pedidos.</p>
                </div>
                <ImportExportButtons page="work" />
            </header>

            <div className="projects-header-container">
                <div className="projects-metrics">
                    <div className="metric-item">
                        <span className="metric-label">Total Proyectos</span>
                        <span className="metric-value">{projects.length}</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Activos</span>
                        <span className="metric-value">{projects.filter(p => !p.isPaused).length}</span>
                    </div>
                </div>
                <button className="btn-new-project" onClick={handleAddProject}>
                    <GoogleIcon name="add" size={20} /> Nuevo Proyecto
                </button>
            </div>

            <Timeline onEditOrder={setEditingOrder} />

            <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.4rem' }}>Proyectos</h2>

            <div className="projects-grid">
                {projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={setActiveProjectId}
                    />
                ))}

                {/* Add Project Card */}
                <div
                    onClick={handleAddProject}
                    className="project-card"
                    style={{
                        border: '2px dashed rgba(255,255,255,0.15)',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        minHeight: '220px',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-lg)',
                        transition: 'all 0.2s ease',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-primary-light)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <GoogleIcon name="add" size={32} />
                    <span style={{ fontWeight: 600 }}>Nuevo Proyecto</span>
                </div>
            </div>

            {editingOrder && (
                <EditOrderModal
                    order={editingOrder}
                    isOpen={!!editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onSave={updateOrder}
                    onDelete={handleDeleteOrder}
                />
            )}
        </div>
    );
};

export default WorkPage;


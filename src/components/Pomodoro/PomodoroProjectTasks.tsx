import React, { useState, useEffect } from 'react';
import { useWork } from '../../context/WorkContext';
import ProjectPanelTabKanban from '../Work/ProjectPanelTabKanban';
import type { Order } from '../../types/work';
import GoogleIcon from '../GoogleIcon';

const PomodoroProjectTasks: React.FC = () => {
    const { projects, updateOrder } = useWork();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        } else if (projects.length === 0) {
            setSelectedProjectId('');
        } else if (selectedProjectId && !projects.find(p => p.id === selectedProjectId)) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProjectId(e.target.value);
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const handleMoveOrderStatus = (order: Order, newStatus: string) => {
        if (selectedProject) {
            updateOrder(selectedProject.id, {
                ...order,
                status: newStatus
            });
        }
    };

    return (
        <div className="pomodoro-project-tasks-container glass-panel" style={{ marginTop: '1rem', width: '100%' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <GoogleIcon name="view_kanban" size={20} />
                <span>Kanban del Proyecto</span>
            </h3>

            <div className="task-input-container" style={{ marginBottom: '1rem' }}>
                <select
                    value={selectedProjectId}
                    onChange={handleProjectChange}
                    className="task-input"
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <option value="" disabled style={{ color: 'black' }}>Selecciona un proyecto...</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id} style={{ color: 'black' }}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="pomodoro-kanban-wrapper" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {!selectedProject && <p className="no-tasks">Selecciona un proyecto para ver su tablero Kanban</p>}
                {selectedProject && (
                    <ProjectPanelTabKanban
                        projectId={selectedProject.id}
                        orders={selectedProject.orders || []}
                        onMoveOrder={handleMoveOrderStatus}
                    />
                )}
            </div>
        </div>
    );
};

export default PomodoroProjectTasks;

import React, { useState, useEffect } from 'react';
import { useWork } from '../../context/WorkContext';
import OrderCard from '../Work/OrderCard';
import EditOrderModal from '../Work/EditOrderModal';
import type { Order } from '../../types/work';
import '../../styles/PomodoroDnD.css';

const PomodoroProjectTasks: React.FC = () => {
    const { projects, updateOrder, deleteOrder, toggleOrderCheck } = useWork();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

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

    return (
        <div className="pomodoro-tasks glass-panel" style={{ marginTop: '1rem' }}>
            <h3>
                <span>Pedidos del Proyecto</span>
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

            <div className="task-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {!selectedProject && <p className="no-tasks">Selecciona un proyecto para ver sus pedidos</p>}
                {selectedProject && (!selectedProject.orders || selectedProject.orders.length === 0) && (
                    <p className="no-tasks">Este proyecto no tiene pedidos</p>
                )}
                {selectedProject && selectedProject.orders && [...selectedProject.orders]
                    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                    .map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onEdit={setEditingOrder}
                            onArchive={(orderId) => deleteOrder(selectedProject.id, orderId)}
                            onToggleCheck={(orderId, itemId) => toggleOrderCheck(selectedProject.id, orderId, itemId)}
                        />
                    ))
                }
            </div>

            {editingOrder && selectedProject && (
                <EditOrderModal
                    order={editingOrder}
                    isOpen={!!editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onSave={(projectId, updatedOrder) => updateOrder(projectId, updatedOrder)}
                    onDelete={(projectId, orderId) => {
                        deleteOrder(projectId, orderId);
                        setEditingOrder(null);
                    }}
                />
            )}
        </div>
    );
};

export default PomodoroProjectTasks;

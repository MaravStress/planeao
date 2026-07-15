import React from 'react';
import type { Project } from '../../types/work';
import GoogleIcon from '../GoogleIcon';

interface ProjectCardProps {
    project: Project;
    onClick: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
    // Generate a unique, vibrant gradient for each project based on its name hash
    const getProjectGradient = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Use HSL colors to ensure nice saturation and lightness
        const h1 = Math.abs(hash) % 360;
        const h2 = (h1 + 40) % 360;
        return `linear-gradient(135deg, hsl(${h1}, 70%, 45%), hsl(${h2}, 80%, 25%))`;
    };

    const ordersCount = project.orders?.length || 0;

    return (
        <div className="project-card" onClick={() => onClick(project.id)}>
            <div className="project-card-image" style={{ background: getProjectGradient(project.name) }}>
                <GoogleIcon name="folder" size={44} style={{ opacity: 0.8 }} />
            </div>
            <div className="project-card-content">
                <h3 className="project-card-title">{project.name}</h3>
                <div className="project-card-meta">
                    <span className={`project-status ${project.isPaused ? 'status-paused' : 'status-active'}`}>
                        {project.isPaused ? 'Pausado' : 'Activo'}
                    </span>
                    <span className="project-orders-count">
                        {ordersCount} {ordersCount === 1 ? 'Pedido' : 'Pedidos'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;

import React from 'react';

const WorkPage: React.FC = () => {
    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Work</h1>
                <p>Gestiona tus tareas y proyectos laborales.</p>
            </header>

            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Esta página está en construcción.</p>
            </div>
        </div>
    );
};

export default WorkPage;

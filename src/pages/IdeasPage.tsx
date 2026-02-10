import React from 'react';

const IdeasPage: React.FC = () => {
    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Ideas Emprendedoras</h1>
                <p>Espacio para desarrollar tus nuevas ideas de negocio.</p>
            </header>

            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Esta página está en construcción.</p>
            </div>
        </div>
    );
};

export default IdeasPage;

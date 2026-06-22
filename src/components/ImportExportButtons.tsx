import React from 'react';
import GoogleIcon from './GoogleIcon';
import { exportPageData, importPageData, triggerImportFile } from '../utils/importExport';

interface ImportExportButtonsProps {
    page: 'work' | 'pomodoro' | 'finances' | 'ideas' | 'uni-progress';
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({ page }) => {
    const handleExport = (e: React.MouseEvent) => {
        e.stopPropagation();
        exportPageData(page);
    };

    const handleImport = (e: React.MouseEvent) => {
        e.stopPropagation();
        triggerImportFile((jsonText) => {
            const success = importPageData(page, jsonText);
            if (success) {
                // Hard reload to refresh context state and re-render everything
                window.location.reload();
            }
        });
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
                onClick={handleImport}
                className="glass-button"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                title="Importar datos desde JSON"
            >
                <GoogleIcon name="upload" size={16} />
                <span>Importar</span>
            </button>
            <button
                onClick={handleExport}
                className="glass-button"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                title="Exportar datos a JSON"
            >
                <GoogleIcon name="download" size={16} />
                <span>Exportar</span>
            </button>
        </div>
    );
};

export default ImportExportButtons;

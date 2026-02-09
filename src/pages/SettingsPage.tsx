import React, { useState, useEffect } from 'react';
import { Save, Database, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/Settings.css';

const SettingsPage: React.FC = () => {
    const [sheetId, setSheetId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Load saved settings
        const savedSheetId = localStorage.getItem('planeao_sheet_id');
        const savedApiKey = localStorage.getItem('planeao_api_key');
        if (savedSheetId) setSheetId(savedSheetId);
        if (savedApiKey) setApiKey(savedApiKey);
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            localStorage.setItem('planeao_sheet_id', sheetId);
            localStorage.setItem('planeao_api_key', apiKey);
            setStatus('success');
            setMessage('Configuración guardada correctamente.');

            // Reset status after a few seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setMessage('Error al guardar la configuración.');
        }
    };

    return (
        <div className="page-container settings-page">
            <header className="page-header">
                <h1>Configuraciones</h1>
                <p>Conecta tu aplicación con Google Sheets.</p>
            </header>

            <div className="settings-content">
                <div className="glass-panel settings-form-container">
                    <div className="card-header">
                        <Database size={24} className="text-primary" />
                        <h3>Base de Datos Google Sheets</h3>
                    </div>

                    <p className="settings-description">
                        Planeao utiliza Google Sheets para guardar tus tareas, hábitos y tiempos de pomodoro.
                        Asegúrate de configurar los permisos correctos en tu hoja de cálculo.
                    </p>

                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label htmlFor="sheetId">ID de la Hoja de Cálculo</label>
                            <input
                                id="sheetId"
                                type="text"
                                value={sheetId}
                                onChange={(e) => setSheetId(e.target.value)}
                                placeholder="Ej: 1BxiMVs0XRA5nFMdKbBdB_..."
                                className="input-code"
                            />
                            <small className="form-hint">
                                Lo encuentras en la URL de tu hoja de Google: /d/<strong>ID_DE_LA_HOJA</strong>/edit
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="apiKey">API Key / Token de Acceso</label>
                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Tu clave de API de Google Cloud Platform"
                                className="input-code"
                            />
                        </div>

                        {status !== 'idle' && (
                            <div className={`status-message ${status}`}>
                                {status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span>{message}</span>
                            </div>
                        )}

                        <button type="submit" className="btn-save">
                            <Save size={18} />
                            Guardar Configuración
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

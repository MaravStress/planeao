import React, { useState, useEffect } from 'react';
import GoogleIcon from '../components/GoogleIcon';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../firebase';
import { syncData, forcePullFromOnline, forcePushToOnline } from '../context/OnlineSave';
import '../styles/Settings.css';

const SettingsPage: React.FC = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // User just logged in or is already logged in
                setStatus('loading');
                setMessage('Sincronizando datos con la nube...');
                try {
                    await syncData();
                    setStatus('success');
                    setMessage('Conectado y guardando en línea.');
                } catch {
                    setStatus('error');
                    setMessage('Error al sincronizar datos.');
                }
            } else {
                setStatus('idle');
                setMessage('');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            setStatus('loading');
            setMessage('Iniciando sesión...');
            await logInWithGoogle();
        } catch (error) {
            console.error("Login failed:", error);
            setStatus('error');
            setMessage('Error al iniciar sesión con Google.');
        }
    };

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleForcePull = async () => {
        if (!window.confirm("¿Estás seguro de que deseas sobreescribir tus datos locales con los de la nube? Esta acción perderá los cambios locales que no se hayan sincronizado.")) {
            return;
        }

        try {
            setStatus('loading');
            setMessage('Descargando datos de la nube...');
            await forcePullFromOnline();
            
            // Re-sync basic after pull done
            // To ensure local timestamp matches the online ones visually or refresh views.
            // A simple page reload is best here since contexts often cache data.
            window.location.reload();
            
        } catch (error) {
            console.error("Force pull failed:", error);
            setStatus('error');
            setMessage('Error al descargar los datos.');
        }
    };

    const handleForcePush = async () => {
        if (!window.confirm("¿Estás seguro de que deseas sobreescribir los datos de la nube con tus datos locales? Esta acción reemplazará cualquier información remota que difiera.")) {
            return;
        }

        try {
            setStatus('loading');
            setMessage('Subiendo datos locales a la nube...');
            await forcePushToOnline();
            
            setStatus('success');
            setMessage('Datos locales subidos exitosamente.');
        } catch (error) {
            console.error("Force push failed:", error);
            setStatus('error');
            setMessage('Error al subir los datos.');
        }
    };

    return (
        <div className="page-container settings-page">
            <header className="page-header">
                <h1>Configuraciones</h1>
                <p>Gestiona tu cuenta y el respaldo de datos.</p>
            </header>

            <div className="settings-content">
                <div className="glass-panel settings-form-container">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <GoogleIcon name="storage" size={24} style={{ color: 'var(--color-primary)' }} />
                        <h3 style={{ margin: 0 }}>Autenticación y Respaldo</h3>
                    </div>

                    <p className="settings-description">
                        Inicia sesión con Google para respaldar automáticamente tus tareas,
                        proyectos, finanzas e ideas en la nube de forma segura. Si no tienes conexión,
                        los datos se guardarán localmente.
                    </p>

                    <div className="auth-section">
                        {user ? (
                            <div className="user-profile">
                                <div className="user-info">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" className="profile-pic" />
                                    ) : (
                                        <div className="profile-placeholder">
                                            <GoogleIcon name="person" size={24} />
                                        </div>
                                    )}
                                    <div className="user-details">
                                        <h4>{user.displayName || 'Usuario'}</h4>
                                        <p>{user.email}</p>
                                    </div>
                                </div>

                                <div className={`status-indicator ${status}`}>
                                    {status === 'loading' && <GoogleIcon name="error" size={18} className="pulse" />}
                                    {status === 'success' && <GoogleIcon name="cloud" size={18} />}
                                    {status === 'error' && <GoogleIcon name="error" size={18} />}
                                    <span>{message || 'En línea'}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', width: '100%', flexDirection: 'column' }}>
                                    <button onClick={handleForcePull} className="glass-button" disabled={status === 'loading'} style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', width: '100%' }}>
                                        <GoogleIcon name="cloud_download" size={18} />
                                        Forzar descarga desde la Nube
                                    </button>
                                    <button onClick={handleForcePush} className="glass-button" disabled={status === 'loading'} style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)', width: '100%' }}>
                                        <GoogleIcon name="cloud_upload" size={18} />
                                        Forzar subida y re-escribir Nube
                                    </button>
                                    <button onClick={handleLogout} className="glass-button" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)', width: '100%' }}>
                                        <GoogleIcon name="logout" size={18} />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="login-prompt">
                                {status === 'error' && (
                                    <div className="status-message error">
                                        <GoogleIcon name="error" size={18} />
                                        <span>{message}</span>
                                    </div>
                                )}
                                <button onClick={handleLogin} className="glass-button" disabled={status === 'loading'} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.08)', padding: '1rem' }}>
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="google-icon" style={{ marginRight: '0.5rem' }} />
                                    <span>{status === 'loading' ? 'Cargando...' : 'Iniciar Sesión con Google'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, LogOut, Cloud, User } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logInWithGoogle, logOut } from '../firebase';
import { syncData } from '../context/OnlineSave';
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
                } catch (error) {
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

    return (
        <div className="page-container settings-page">
            <header className="page-header">
                <h1>Configuraciones</h1>
                <p>Gestiona tu cuenta y el respaldo de datos.</p>
            </header>

            <div className="settings-content">
                <div className="glass-panel settings-form-container">
                    <div className="card-header">
                        <Database size={24} className="text-primary" />
                        <h3>Autenticación y Respaldo</h3>
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
                                        <div className="profile-placeholder"><User size={24} /></div>
                                    )}
                                    <div className="user-details">
                                        <h4>{user.displayName || 'Usuario'}</h4>
                                        <p>{user.email}</p>
                                    </div>
                                </div>

                                <div className={`status-indicator ${status}`}>
                                    {status === 'loading' && <AlertCircle size={18} className="pulse" />}
                                    {status === 'success' && <Cloud size={18} />}
                                    {status === 'error' && <AlertCircle size={18} />}
                                    <span>{message || 'En línea'}</span>
                                </div>

                                <button onClick={handleLogout} className="btn-logout">
                                    <LogOut size={18} />
                                    Cerrar Sesión
                                </button>
                            </div>
                        ) : (
                            <div className="login-prompt">
                                {status === 'error' && (
                                    <div className="status-message error">
                                        <AlertCircle size={18} />
                                        <span>{message}</span>
                                    </div>
                                )}
                                <button onClick={handleLogin} className="btn-login" disabled={status === 'loading'}>
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="google-icon" />
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

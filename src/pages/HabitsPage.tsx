import React, { useEffect, useState } from 'react';
import GoogleIcon from '../components/GoogleIcon';
import HabitSettingsModal from '../components/habits/HabitSettingsModal';
import type { HabitField } from '../types/habits';
import { useHabits } from '../context/HabitsContext';
import '../styles/Habits.css';
import '../styles/Ideas.css';

const HabitsPage: React.FC = () => {
    const { settings, isLoaded, loadHabits, unloadHabits } = useHabits();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        loadHabits();
        return () => {
            unloadHabits();
        };
    }, []);

    const fields = settings?.fields ?? [];

    return (
        <div className="page-container habits-page">
            <header className="page-header">
                <div>
                    <h1 className="habits-page-title">Hábitos</h1>
                    <p>Construye rutinas y haz seguimiento de tus hábitos.</p>
                </div>
                <button
                    className="btn-icon"
                    onClick={() => setIsSettingsOpen(true)}
                    title="Configurar Hábitos"
                    style={{
                        background: 'var(--color-bg-card)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        opacity: !isLoaded ? 0.5 : 1,
                        cursor: !isLoaded ? 'not-allowed' : 'pointer',
                        pointerEvents: !isLoaded ? 'none' : 'auto'
                    }}
                    disabled={!isLoaded}
                >
                    <GoogleIcon name="settings" size={20} style={{ color: 'var(--color-text-muted)' }} />
                </button>
            </header>


            {isSettingsOpen && (
                <HabitSettingsModal
                    onSave={() => setIsSettingsOpen(false)}
                />
            )}
        </div>
    );
};


export default HabitsPage;
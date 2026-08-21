import React, { useEffect, useState } from 'react';
import GoogleIcon from '../components/GoogleIcon';
import HabitSettingsModal from '../components/habits/HabitSettingsModal';
import AddPastMonthModal from '../components/habits/AddPastMonthModal';
import HabitMonthTable from '../components/habits/HabitMonthTable';
import ImportExportButtons from '../components/ImportExportButtons';
import { useHabits } from '../context/HabitsContext';
import '../styles/Habits.css';
import '../styles/Ideas.css';

const HabitsPage: React.FC = () => {
    const { settings, months, isLoaded, loadHabits, unloadHabits } = useHabits();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddMonthOpen, setIsAddMonthOpen] = useState(false);

    useEffect(() => {
        loadHabits();
        return () => {
            unloadHabits();
        };
    }, []);

    const fields = settings?.fields ?? [];

    const handleMonthAdded = (monthId: string) => {
        setTimeout(() => {
            const el = document.getElementById(`month-${monthId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <div className="page-container habits-page">
            <header className="page-header habits-topbar">
                <div>
                    <h1 className="habits-page-title">Hábitos</h1>
                    <p>Construye rutinas y haz seguimiento de tus hábitos diarios.</p>
                </div>

                <div className="habits-top-actions">
                    <ImportExportButtons page="habits" disabled={!isLoaded} />

                    <button
                        className="btn-secondary habit-top-btn"
                        onClick={() => setIsAddMonthOpen(true)}
                        title="Añadir mes pasado"
                        disabled={!isLoaded}
                    >
                        <GoogleIcon name="calendar_month" size={18} />
                        <span>Añadir mes pasado</span>
                    </button>

                    <button
                        className="btn-icon habit-top-btn habit-settings-btn"
                        onClick={() => setIsSettingsOpen(true)}
                        title="Configurar Hábitos"
                        disabled={!isLoaded}
                    >
                        <GoogleIcon name="settings" size={20} />
                    </button>
                </div>
            </header>

            {/* Quick Month Jumper (if more than 1 month exists) */}
            {months.length > 1 && (
                <div className="habits-month-nav">
                    <span className="month-nav-label">Meses registrados:</span>
                    <div className="month-nav-pills">
                        {months.map((m) => (
                            <button
                                key={m.id}
                                className="month-nav-pill-btn"
                                onClick={() => {
                                    const el = document.getElementById(`month-${m.id}`);
                                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                            >
                                {m.month} - {m.year}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* List of Month Cards */}
            <div className="habits-months-list">
                {months.map((monthData) => (
                    <HabitMonthTable
                        key={monthData.id}
                        monthData={monthData}
                        fields={fields}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                ))}
            </div>

            {/* Modals */}
            {isSettingsOpen && (
                <HabitSettingsModal
                    onSave={() => setIsSettingsOpen(false)}
                />
            )}

            {isAddMonthOpen && (
                <AddPastMonthModal
                    isOpen={isAddMonthOpen}
                    onClose={() => setIsAddMonthOpen(false)}
                    onMonthAdded={handleMonthAdded}
                />
            )}
        </div>
    );
};

export default HabitsPage;

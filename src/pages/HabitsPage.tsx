import React, { useEffect, useState, useCallback } from 'react';
import GoogleIcon from '../components/GoogleIcon';
import HabitSettingsModal from '../components/habits/HabitSettingsModal';
import AddPastMonthModal from '../components/habits/AddPastMonthModal';
import HabitMonthTable from '../components/habits/HabitMonthTable';
import DailyRegister from '../components/habits/DailyRegister';
import ImportExportButtons from '../components/ImportExportButtons';
import { useHabits } from '../context/HabitsContext';
import '../styles/Habits.css';
import '../styles/Ideas.css';

const HabitsPage: React.FC = () => {
    const { settings, months, isLoaded, loadHabits, unloadHabits, updateDayNote, updateDayValue } = useHabits();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddMonthOpen, setIsAddMonthOpen] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);

    useEffect(() => {
        loadHabits();
        return () => {
            unloadHabits();
        };
    }, []);

    // Reset slide index when months change
    useEffect(() => {
        setSlideIndex(0);
    }, [months.length]);

    const fields = settings?.fields ?? [];

    const handleMonthAdded = (monthId: string) => {
        setTimeout(() => {
            const el = document.getElementById(`month-${monthId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const goToPrevSlide = useCallback(() => {
        setSlideIndex((prev) => Math.max(0, prev - 1));
    }, []);

    const goToNextSlide = useCallback(() => {
        setSlideIndex((prev) => Math.min(months.length - 1, prev + 1));
    }, [months.length]);

    const currentMonth = months[slideIndex];

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

            {/* Daily Register — Centered in the middle of the screen */}
            <div className="habits-center-section">
                <DailyRegister
                    months={months}
                    fields={fields}
                    onUpdateNote={updateDayNote}
                    onUpdateValue={updateDayValue}
                />
            </div>

            {/* Months Slide — At the bottom */}
            <div className="habits-slide-section">
                {months.length > 0 && (
                    <>
                        {/* Slide navigation */}
                        <div className="habits-slide-top">
                            <span className="habits-slide-label">
                                <GoogleIcon name="calendar_view_month" size={16} />
                                Historial de meses
                            </span>
                            <div className="habits-slide-dots">
                                {months.map((m, idx) => (
                                    <button
                                        key={m.id}
                                        className={`habits-slide-dot ${idx === slideIndex ? 'active' : ''}`}
                                        onClick={() => setSlideIndex(idx)}
                                        title={`${m.month} - ${m.year}`}
                                    />
                                ))}
                            </div>
                            <div className="habits-slide-arrows">
                                <button
                                    className="habits-slide-arrow"
                                    onClick={goToPrevSlide}
                                    disabled={slideIndex === 0}
                                >
                                    <GoogleIcon name="chevron_left" size={20} />
                                </button>
                                <span className="habits-slide-counter">
                                    {slideIndex + 1} / {months.length}
                                </span>
                                <button
                                    className="habits-slide-arrow"
                                    onClick={goToNextSlide}
                                    disabled={slideIndex === months.length - 1}
                                >
                                    <GoogleIcon name="chevron_right" size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Slide viewport with the current month */}
                        <div className="habits-slide-viewport">
                            <HabitMonthTable
                                key={currentMonth.id}
                                monthData={currentMonth}
                                fields={fields}
                                onOpenSettings={() => setIsSettingsOpen(true)}
                            />
                        </div>
                    </>
                )}

                {months.length === 0 && (
                    <div className="habits-slide-empty">
                        <p>Aún no hay meses registrados. Agrega uno para empezar.</p>
                    </div>
                )}
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

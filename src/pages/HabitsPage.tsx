import React, { useState } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import HabitList from '../components/Habits/HabitList';
import type { Habit } from '../components/Habits/HabitList';
import DailyLog from '../components/Habits/DailyLog';
import HistoryView from '../components/Habits/HistoryView';
import '../styles/Habits.css';

const HabitsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

    // Mock Data / State
    const [habits, setHabits] = useState<Habit[]>([
        { id: '1', name: 'Beber 2L de agua', active: true },
        { id: '2', name: 'Leer 30 min', active: true },
        { id: '3', name: 'Ejercicios', active: true },
    ]);

    const [todayDescription, setTodayDescription] = useState('');
    const [completedHabitsToday, setCompletedHabitsToday] = useState<string[]>([]);

    // Mock History Data
    const historyData = [
        { date: '2026-02-01', completedCount: 3, totalHabits: 3, description: 'Buen día' },
        { date: '2026-02-02', completedCount: 1, totalHabits: 3, description: 'Cansado' },
        { date: '2026-02-03', completedCount: 2, totalHabits: 3, description: 'Normal' },
    ];

    const handleToggleHabit = (id: string) => {
        setCompletedHabitsToday(prev =>
            prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
        );
    };

    const handleAddHabit = (name: string) => {
        setHabits([...habits, { id: uuidv4(), name, active: true }]);
    };

    const handleRemoveHabit = (id: string) => {
        setHabits(habits.filter(h => h.id !== id));
    };

    return (
        <div className="page-container habits-page">
            <header className="page-header tabs-header">
                <div className="header-info">
                    <h1>Rastreador de Hábitos</h1>
                    <p>{format(new Date(), 'EEEE d, MMMM yyyy')}</p>
                </div>

                <div className="tabs-controls">
                    <button
                        className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
                        onClick={() => setActiveTab('today')}
                    >
                        Registrar Día
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Histórico
                    </button>
                </div>
            </header>

            <div className="habits-content">
                {activeTab === 'today' ? (
                    <div className="daily-view">
                        <DailyLog
                            description={todayDescription}
                            onChange={setTodayDescription}
                        />
                        <HabitList
                            habits={habits}
                            completedHabitIds={completedHabitsToday}
                            onToggleHabit={handleToggleHabit}
                            onAddHabit={handleAddHabit}
                            onRemoveHabit={handleRemoveHabit}
                        />
                    </div>
                ) : (
                    <HistoryView
                        currentDate={new Date()}
                        history={historyData}
                    />
                )}
            </div>
        </div>
    );
};

export default HabitsPage;

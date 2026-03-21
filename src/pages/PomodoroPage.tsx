import React, { useState } from 'react';
import TimerDisplay from '../components/Pomodoro/TimerDisplay';
import TimerSettings from '../components/Pomodoro/TimerSettings';
import PomodoroTasks from '../components/Pomodoro/PomodoroTasks';
import PomodoroProjectTasks from '../components/Pomodoro/PomodoroProjectTasks';
import PomodoroUniTasks from '../components/Pomodoro/PomodoroUniTasks';
import '../styles/Pomodoro.css';
import { usePomodoro } from '../context/PomodoroContext';

const PomodoroPage: React.FC = () => {
    const {
        timeLeft,
        isActive,
        mode,
        focusDuration,
        restDuration,
        progress,
        toggleTimer,
        resetTimer,
        handleModeSwitch,
        handleUpdateSettings
    } = usePomodoro();

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'projects' | 'uni'>('projects');

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`page-container pomodoro-page mode-${mode}`}>
            <header className="page-header">
                <h1>Pomodoro</h1>
                <p>Mantén el enfoque y toma descansos cronometrados.</p>
            </header>

            <div className="pomodoro-content">
                <div className="pomodoro-column">
                    <div style={{
                        display: 'flex',
                        background: 'rgba(0, 0, 0, 0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        padding: '4px',
                        marginBottom: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        position: 'relative',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <button
                            onClick={() => setActiveTab('projects')}
                            style={{
                                flex: 1,
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'projects' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: activeTab === 'projects' ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontWeight: activeTab === 'projects' ? '600' : '500',
                                fontSize: '0.95rem',
                                zIndex: 1,
                                position: 'relative',
                                boxShadow: activeTab === 'projects' ? '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)' : 'none',
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 2 }}>Proyectos</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('uni')}
                            style={{
                                flex: 1,
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'uni' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: activeTab === 'uni' ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontWeight: activeTab === 'uni' ? '600' : '500',
                                fontSize: '0.95rem',
                                zIndex: 1,
                                position: 'relative',
                                boxShadow: activeTab === 'uni' ? '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)' : 'none',
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 2 }}>Universidad</span>
                        </button>
                    </div>
                    {activeTab === 'projects' ? <PomodoroProjectTasks /> : <PomodoroUniTasks />}
                </div>

                <div className="pomodoro-column">
                    <TimerDisplay
                        minutes={minutes}
                        seconds={seconds}
                        isActive={isActive}
                        mode={mode}
                        progress={progress}
                        onToggle={toggleTimer}
                        onReset={resetTimer}
                        onModeSwitch={handleModeSwitch}
                    />

                    <div className="pomodoro-controls-area" style={{ marginTop: '1.5rem' }}>
                        <TimerSettings
                            focusDuration={focusDuration}
                            restDuration={restDuration}
                            onUpdateSettings={handleUpdateSettings}
                            isOpen={isSettingsOpen}
                            setIsOpen={setIsSettingsOpen}
                        />
                    </div>
                </div>

                <div className="pomodoro-column">
                    <PomodoroTasks />
                </div>
            </div>
        </div>
    );
};

export default PomodoroPage;

import React, { useState } from 'react';
import TimerDisplay from '../components/Pomodoro/TimerDisplay';
import TimerSettings from '../components/Pomodoro/TimerSettings';
import PomodoroTasks from '../components/Pomodoro/PomodoroTasks';
import PomodoroProjectTasks from '../components/Pomodoro/PomodoroProjectTasks';
import '../styles/Pomodoro.css';
import { usePomodoro } from '../context/PomodoroContext';
import ImportExportButtons from '../components/ImportExportButtons';

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

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`page-container pomodoro-page mode-${mode}`}>
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="pomodoro-page-title">Pomodoro</h1>
                    <p>Mantén el enfoque y toma descansos cronometrados.</p>
                </div>
                <ImportExportButtons page="pomodoro" />
            </header>

            <div className="pomodoro-top-section">
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

                    <div className="pomodoro-controls-area" style={{ marginTop: '1.5rem', width: '100%' }}>
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

            <div className="pomodoro-bottom-section">
                <PomodoroProjectTasks />
            </div>
        </div>
    );
};

export default PomodoroPage;

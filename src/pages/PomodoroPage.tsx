import React, { useState } from 'react';
import TimerDisplay from '../components/Pomodoro/TimerDisplay';
import TimerSettings from '../components/Pomodoro/TimerSettings';
import PomodoroTasks from '../components/Pomodoro/PomodoroTasks';
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

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`page-container pomodoro-page mode-${mode}`}>
            <header className="page-header">
                <h1>Pomodoro</h1>
                <p>Mantén el enfoque y toma descansos cronometrados.</p>
            </header>

            <div className="pomodoro-content">
                <div className="pomodoro-left-column">
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

                    <div className="pomodoro-controls-area">
                        <TimerSettings
                            focusDuration={focusDuration}
                            restDuration={restDuration}
                            onUpdateSettings={handleUpdateSettings}
                            isOpen={isSettingsOpen}
                            setIsOpen={setIsSettingsOpen}
                        />
                    </div>
                </div>

                <div className="pomodoro-right-column">
                    <PomodoroTasks />
                </div>
            </div>
        </div>
    );
};

export default PomodoroPage;

import React, { useState, useEffect, useRef } from 'react';
import TimerDisplay from '../components/Pomodoro/TimerDisplay';
import TimerSettings from '../components/Pomodoro/TimerSettings';
import PomodoroTasks from '../components/Pomodoro/PomodoroTasks';
import '../styles/Pomodoro.css';

const PomodoroPage: React.FC = () => {
    // Settings (in minutes)
    const [focusDuration, setFocusDuration] = useState(50);
    const [restDuration, setRestDuration] = useState(10);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'rest'>('focus');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const timerRef = useRef<number | null>(null);
    const endTimeRef = useRef<number | null>(null);

    useEffect(() => {
        // Reset timer when durations change if not active
        if (!isActive) {
            setTimeLeft(mode === 'focus' ? focusDuration * 60 : restDuration * 60);
        }
    }, [focusDuration, restDuration, mode]);

    // Sound helper using Web Audio API for a pleasant chime
    const playAlarmSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();

            const playTone = (freq: number, startTime: number, duration: number, type: 'sine' | 'triangle' = 'sine') => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = type;
                osc.frequency.setValueAtTime(freq, startTime);

                // Smooth envelope
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = ctx.currentTime;
            // Play a gentle major triad (C5, E5, G5)
            playTone(523.25, now, 0.6);       // C5
            playTone(659.25, now + 0.15, 0.6); // E5
            playTone(783.99, now + 0.3, 0.8); // G5

        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            // If endTime is not set (should be set by toggle, but for safety in dev/HMR)
            if (!endTimeRef.current) {
                endTimeRef.current = Date.now() + timeLeft * 1000;
            }

            timerRef.current = window.setInterval(() => {
                if (endTimeRef.current) {
                    // Paso 1: hora actual
                    const now = Date.now();
                    // Paso 3: diferencia entre hora actual y endTime
                    const diff = Math.ceil((endTimeRef.current - now) / 1000);

                    if (diff <= 0) {
                        setTimeLeft(0);
                    } else {
                        setTimeLeft(diff);
                    }
                }
            }, 100);
        } else if (timeLeft === 0) {
            // Only trigger finish logic if we were active
            if (isActive) {
                // Timer finished
                if (timerRef.current) clearInterval(timerRef.current);
                setIsActive(false);
                endTimeRef.current = null;

                // Play alarm sound
                playAlarmSound();

                // Auto-switch mode or notify user
                const nextMode = mode === 'focus' ? 'rest' : 'focus';
                setMode(nextMode);
                setTimeLeft(nextMode === 'focus' ? focusDuration * 60 : restDuration * 60);
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft, mode, focusDuration, restDuration]);

    const toggleTimer = () => {
        if (!isActive) {
            // Paso 2: sumale el tiempo que estara el pomodoro ensendido, ese es el endTime
            endTimeRef.current = Date.now() + timeLeft * 1000;
            setIsActive(true);
        } else {
            setIsActive(false);
            endTimeRef.current = null;
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        endTimeRef.current = null;
        setTimeLeft(mode === 'focus' ? focusDuration * 60 : restDuration * 60);
    };

    const handleUpdateSettings = (newFocus: number, newRest: number) => {
        setFocusDuration(newFocus);
        setRestDuration(newRest);
        // If we update settings, better reset the current timer to reflect changes if it was the affected mode
        if (!isActive) {
            // Logic handled by first useEffect, but we force mode check just in case
            if (mode === 'focus') setTimeLeft(newFocus * 60);
            else setTimeLeft(newRest * 60);
        }
    };

    const handleModeSwitch = () => {
        setIsActive(false);
        endTimeRef.current = null;
        const nextMode = mode === 'focus' ? 'rest' : 'focus';
        setMode(nextMode);
        setTimeLeft(nextMode === 'focus' ? focusDuration * 60 : restDuration * 60);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Calculate progress for circle
    const totalTime = mode === 'focus' ? focusDuration * 60 : restDuration * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    // Update document title with timer
    useEffect(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        const formattedTime = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
        document.title = `${formattedTime} - ${mode === 'focus' ? 'Focus' : 'Rest'} | Planeao`;

        return () => {
            document.title = 'Planeao';
        };
    }, [timeLeft, mode]);

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

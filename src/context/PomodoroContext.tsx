import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';

interface PomodoroContextType {
    timeLeft: number;
    isActive: boolean;
    mode: 'focus' | 'rest';
    focusDuration: number;
    restDuration: number;
    progress: number;
    toggleTimer: () => void;
    resetTimer: () => void;
    handleModeSwitch: () => void;
    setFocusDuration: (duration: number) => void;
    setRestDuration: (duration: number) => void;
    handleUpdateSettings: (newFocus: number, newRest: number) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Settings (in minutes)
    const [focusDuration, setFocusDuration] = useState(50);
    const [restDuration, setRestDuration] = useState(10);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'rest'>('focus');

    const timerRef = useRef<number | null>(null);
    const endTimeRef = useRef<number | null>(null);

    // Initial load/reset logic
    useEffect(() => {
        if (!isActive && !endTimeRef.current) {
            // Only reset if not active and no running timer
            setTimeLeft(mode === 'focus' ? focusDuration * 60 : restDuration * 60);
        }
    }, [focusDuration, restDuration, mode]);


    // Sound helper
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
            playTone(523.25, now, 0.6);       // C5
            playTone(659.25, now + 0.15, 0.6); // E5
            playTone(783.99, now + 0.3, 0.8); // G5

        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            if (!endTimeRef.current) {
                endTimeRef.current = Date.now() + timeLeft * 1000;
            }

            timerRef.current = window.setInterval(() => {
                if (endTimeRef.current) {
                    const now = Date.now();
                    const diff = Math.ceil((endTimeRef.current - now) / 1000);

                    if (diff <= 0) {
                        setTimeLeft(0);
                    } else {
                        setTimeLeft(diff);
                    }
                }
            }, 100);
        } else if (timeLeft === 0) {
            if (isActive) {
                if (timerRef.current) clearInterval(timerRef.current);
                setIsActive(false);
                endTimeRef.current = null;
                playAlarmSound();

                const nextMode = mode === 'focus' ? 'rest' : 'focus';
                setMode(nextMode);
                setTimeLeft(nextMode === 'focus' ? focusDuration * 60 : restDuration * 60);
            }
        }

        return () => {
            // Don't clear interval here on unmount of the Provider (which is rare), 
            // but if we were unmounting the page component it would be an issue. 
            // Since this is the Provider, it stays mounted.
            // Actually, we should clear it if the dependency changes to avoid duplicates?
            // No, useEffect cleans up previous effect before running new one.
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft, mode, focusDuration, restDuration]);

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

    const toggleTimer = () => {
        if (!isActive) {
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

    const handleModeSwitch = () => {
        setIsActive(false);
        endTimeRef.current = null;
        const nextMode = mode === 'focus' ? 'rest' : 'focus';
        setMode(nextMode);
        setTimeLeft(nextMode === 'focus' ? focusDuration * 60 : restDuration * 60);
    };

    const handleUpdateSettings = (newFocus: number, newRest: number) => {
        setFocusDuration(newFocus);
        setRestDuration(newRest);
        if (!isActive) {
            if (mode === 'focus') setTimeLeft(newFocus * 60);
            else setTimeLeft(newRest * 60);
        }
    };

    // Derived state for progress
    const totalTime = mode === 'focus' ? focusDuration * 60 : restDuration * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <PomodoroContext.Provider value={{
            timeLeft,
            isActive,
            mode,
            focusDuration,
            restDuration,
            progress,
            toggleTimer,
            resetTimer,
            handleModeSwitch,
            setFocusDuration,
            setRestDuration,
            handleUpdateSettings
        }}>
            {children}
        </PomodoroContext.Provider>
    );
};

export const usePomodoro = () => {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
};

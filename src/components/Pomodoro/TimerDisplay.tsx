import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Briefcase } from 'lucide-react';

interface TimerDisplayProps {
    minutes: number;
    seconds: number;
    isActive: boolean;
    mode: 'focus' | 'rest';
    progress: number; // 0 to 100
    onToggle: () => void;
    onReset: () => void;
    onModeSwitch: () => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
    minutes,
    seconds,
    isActive,
    mode,
    progress,
    onToggle,
    onReset,
    onModeSwitch
}) => {
    const radius = 120;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="timer-container glass-panel">
            <div className="timer-circle-wrapper">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="timer-svg"
                >
                    <circle
                        stroke="hsla(0,0%,100%,0.1)"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="var(--pomodoro-color)"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="timer-progress"
                    />
                </svg>
                <div className="timer-text">
                    <div className="timer-mode">{mode === 'focus' ? 'Enfoque' : 'Descanso'}</div>
                    <div className="timer-time">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                </div>
            </div>

            <div className="timer-controls">
                <button
                    onClick={onToggle}
                    className={`btn-control ${isActive ? 'active' : ''}`}
                    aria-label={isActive ? 'Pausar' : 'Iniciar'}
                >
                    {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>
                <button
                    onClick={onReset}
                    className="btn-control secondary"
                    aria-label="Reiniciar"
                >
                    <RotateCcw size={24} />
                </button>
                <button
                    onClick={onModeSwitch}
                    className="btn-control secondary"
                    aria-label={mode === 'focus' ? 'Cambiar a Descanso' : 'Cambiar a Enfoque'}
                    title={mode === 'focus' ? 'Ir a Descanso' : 'Ir a Enfoque'}
                >
                    {mode === 'focus' ? <Coffee size={24} /> : <Briefcase size={24} />}
                </button>
            </div>
        </div>
    );
};

export default TimerDisplay;

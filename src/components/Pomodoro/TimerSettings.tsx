import React from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';

interface TimerSettingsProps {
    focusDuration: number;
    restDuration: number;
    onUpdateSettings: (focus: number, rest: number) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({
    focusDuration,
    restDuration,
    onUpdateSettings,
    isOpen,
    setIsOpen
}) => {
    const [focus, setFocus] = React.useState(focusDuration);
    const [rest, setRest] = React.useState(restDuration);

    const handleSave = () => {
        onUpdateSettings(focus, rest);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                className="btn-settings-toggle"
                onClick={() => setIsOpen(true)}
            >
                <SettingsIcon size={20} />
                Configurar Tiempos
            </button>
        );
    }

    return (
        <div className="settings-panel glass-panel">
            <div className="settings-header">
                <h3>Configuración</h3>
                <button onClick={() => setIsOpen(false)} className="btn-close-settings">
                    <X size={20} />
                </button>
            </div>

            <div className="settings-body">
                <div className="setting-group">
                    <label>Tiempo de Enfoque (min)</label>
                    <input
                        type="number"
                        value={focus}
                        onChange={(e) => setFocus(Math.max(1, Number(e.target.value)))}
                        min="1"
                        max="120"
                    />
                </div>

                <div className="setting-group">
                    <label>Tiempo de Descanso (min)</label>
                    <input
                        type="number"
                        value={rest}
                        onChange={(e) => setRest(Math.max(1, Number(e.target.value)))}
                        min="1"
                        max="60"
                    />
                </div>

                <button onClick={handleSave} className="btn-primary full-width">
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};

export default TimerSettings;

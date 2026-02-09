import React from 'react';

interface DailyLogProps {
    description: string;
    onChange: (text: string) => void;
}

const DailyLog: React.FC<DailyLogProps> = ({ description, onChange }) => {
    return (
        <div className="daily-log-container glass-panel">
            <div className="section-header">
                <h3>Resumen del Día</h3>
                <span className="char-count">{description.length}/256</span>
            </div>

            <textarea
                className="daily-log-textarea"
                value={description}
                onChange={(e) => {
                    if (e.target.value.length <= 256) {
                        onChange(e.target.value);
                    }
                }}
                placeholder="¿Qué lograste hoy? ¿Cómo te sentiste?"
                rows={8}
            />
        </div>
    );
};

export default DailyLog;

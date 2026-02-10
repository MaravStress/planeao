import React from 'react';
import { RefreshCw } from 'lucide-react';
import '../../styles/Finances.css';

interface FinanceHeaderProps {
    exchangeRate: number;
    setExchangeRate: (rate: number) => void;
}

const FinanceHeader: React.FC<FinanceHeaderProps> = ({ exchangeRate, setExchangeRate }) => {
    return (
        <header className="finances-header">
            <div>
                <h2>Finanzas</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Control de gastos e ingresos (Base: USD)</p>
            </div>
            <div className="exchange-rate-control">
                <RefreshCw size={16} />
                <span>1 USD = </span>
                <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 58.5)}
                    className="rate-input"
                />
                <span>DOP</span>
            </div>
        </header>
    );
};

export default FinanceHeader;

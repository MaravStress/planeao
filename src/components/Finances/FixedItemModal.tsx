import React, { useState } from 'react';
import GoogleIcon from '../GoogleIcon';
import type { Currency } from '../../types/finances';

interface FixedItemModalProps {
    type: 'income' | 'expense';
    onSave: (title: string, amount: number, currency: Currency) => void;
    onClose: () => void;
}

const FixedItemModal: React.FC<FixedItemModalProps> = ({ type, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<Currency>('USD');

    const isIncome = type === 'income';
    const label = isIncome ? 'Ingreso Fijo' : 'Gasto Fijo';
    const headerClass = isIncome ? 'fixed-income-header' : 'fixed-header';
    const submitClass = isIncome ? 'fixed-income-submit' : 'fixed-submit';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
        onSave(title.trim(), parsedAmount, currency);
        onClose();
    };

    return (
        <div className="fin-modal-overlay" onClick={onClose}>
            <div className="fin-modal glass-panel" onClick={e => e.stopPropagation()}>
                <div className={`fin-modal-header ${headerClass}`}>
                    <h3>Registrar {label}</h3>
                    <button className="fin-modal-close" onClick={onClose}>
                        <GoogleIcon name="close" size={18} />
                    </button>
                </div>

                <form className="fin-modal-form" onSubmit={handleSubmit}>
                    <div className="fin-field">
                        <label htmlFor="fixed-title">Título</label>
                        <input
                            id="fixed-title"
                            type="text"
                            placeholder={isIncome ? 'Ej: Sueldo mensual, Renta de local…' : 'Ej: Alquiler, Internet, Gimnasio…'}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="fin-field-row">
                        <div className="fin-field fin-field-grow">
                            <label htmlFor="fixed-amount">Monto</label>
                            <input
                                id="fixed-amount"
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="fin-field fin-field-currency">
                            <label htmlFor="fixed-currency">Divisa</label>
                            <select
                                id="fixed-currency"
                                value={currency}
                                onChange={e => setCurrency(e.target.value as Currency)}
                            >
                                <option value="USD">USD $</option>
                                <option value="DOP">DOP RD$</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`fin-submit-btn ${submitClass}`}
                        disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
                    >
                        <GoogleIcon name="add" size={15} style={{ display: 'inline', marginRight: '0.4rem' }} />
                        Guardar {label}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FixedItemModal;

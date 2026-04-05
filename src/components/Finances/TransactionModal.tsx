import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Currency } from '../../types/finances';

interface TransactionModalProps {
    type: 'income' | 'expense';
    onSave: (title: string, amount: number, currency: Currency, date: string) => void;
    onClose: () => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

const TransactionModal: React.FC<TransactionModalProps> = ({ type, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [date, setDate] = useState(todayISO());

    const isIncome = type === 'income';
    const label = isIncome ? 'Ingreso' : 'Gasto Variable';
    const accentClass = isIncome ? 'income' : 'expense';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
        // Convert local date string to ISO (preserve chosen date, noon UTC to avoid timezone shifts)
        const isoDate = new Date(`${date}T12:00:00`).toISOString();
        onSave(title.trim(), parsedAmount, currency, isoDate);
        onClose();
    };

    return (
        <div className="fin-modal-overlay" onClick={onClose}>
            <div className="fin-modal glass-panel" onClick={e => e.stopPropagation()}>
                <div className={`fin-modal-header ${accentClass}-header`}>
                    <h3>Registrar {label}</h3>
                    <button className="fin-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form className="fin-modal-form" onSubmit={handleSubmit}>
                    <div className="fin-field">
                        <label htmlFor="txn-title">Título</label>
                        <input
                            id="txn-title"
                            type="text"
                            placeholder={isIncome ? 'Ej: Salario mensual' : 'Ej: Comida'}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="fin-field-row">
                        <div className="fin-field fin-field-grow">
                            <label htmlFor="txn-amount">Monto</label>
                            <input
                                id="txn-amount"
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="fin-field fin-field-currency">
                            <label htmlFor="txn-currency">Divisa</label>
                            <select
                                id="txn-currency"
                                value={currency}
                                onChange={e => setCurrency(e.target.value as Currency)}
                            >
                                <option value="USD">USD $</option>
                                <option value="DOP">DOP RD$</option>
                            </select>
                        </div>
                    </div>

                    <div className="fin-field">
                        <label htmlFor="txn-date">Fecha</label>
                        <input
                            id="txn-date"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`fin-submit-btn ${accentClass}-submit`}
                        disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
                    >
                        Guardar {label}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;

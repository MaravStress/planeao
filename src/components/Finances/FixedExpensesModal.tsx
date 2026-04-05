import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useFinances } from '../../context/FinancesContext';
import type { Currency } from '../../types/finances';

interface FixedExpensesModalProps {
    onClose: () => void;
}

const FixedExpensesModal: React.FC<FixedExpensesModalProps> = ({ onClose }) => {
    const { fixedExpenses, addFixedExpense, deleteFixedExpense, toUSD } = useFinances();
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<Currency>('USD');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
        addFixedExpense(title.trim(), parsedAmount, currency);
        setTitle('');
        setAmount('');
        setCurrency('USD');
    };

    const totalUSD = fixedExpenses.reduce((s, e) => s + toUSD(e.amount, e.currency as Currency), 0);

    const formatAmount = (amount: number, currency: Currency) => {
        if (currency === 'USD') return `$${amount.toFixed(2)} USD`;
        return `RD$${amount.toFixed(0)} DOP`;
    };

    return (
        <div className="fin-modal-overlay" onClick={onClose}>
            <div className="fin-modal glass-panel" onClick={e => e.stopPropagation()}>
                <div className="fin-modal-header fixed-header">
                    <h3>Gastos Fijos</h3>
                    <button className="fin-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Existing fixed expenses list */}
                {fixedExpenses.length > 0 && (
                    <div className="fin-fixed-scroll-list">
                        {fixedExpenses.map(item => (
                            <div key={item.id} className="fin-item expense-item">
                                <div className="fin-item-info">
                                    <span className="fin-item-title">{item.title}</span>
                                    <span className="fin-item-date fin-item-tag">Gasto fijo</span>
                                </div>
                                <div className="fin-item-right">
                                    <span className="fin-item-amount expense-amount">
                                        {formatAmount(item.amount, item.currency as Currency)}
                                    </span>
                                    <button
                                        className="fin-delete-btn"
                                        style={{ opacity: 1 }}
                                        onClick={() => deleteFixedExpense(item.id)}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="fin-fixed-total-row">
                            <span>Total mensual</span>
                            <span className="expense-amount">${totalUSD.toFixed(2)} USD</span>
                        </div>
                    </div>
                )}

                {fixedExpenses.length === 0 && (
                    <p className="fin-empty" style={{ padding: '1.25rem 1.5rem 0' }}>
                        No hay gastos fijos registrados aún
                    </p>
                )}

                {/* Add form — same structure as TransactionModal */}
                <form className="fin-modal-form" onSubmit={handleAdd}>
                    <div className="fin-field">
                        <label htmlFor="fixed-title">Título</label>
                        <input
                            id="fixed-title"
                            type="text"
                            placeholder="Ej: Internet, Netflix, Gym…"
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
                        className="fin-submit-btn fixed-submit"
                        disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
                    >
                        <Plus size={15} style={{ display: 'inline', marginRight: '0.4rem' }} />
                        Agregar Gasto Fijo
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FixedExpensesModal;

import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Transaction, Currency } from './types';
import '../../styles/Finances.css';

interface FinanceSectionProps {
    title: React.ReactNode; // Can include the icon
    transactions: Transaction[];
    type: 'income' | 'variable' | 'fixed';
    onAdd: (data: { title: string, amount: number, currency: Currency, date?: string }) => void;
    onDelete: (id: string) => void;
}

const FinanceSection: React.FC<FinanceSectionProps> = ({ title, transactions, type, onAdd, onDelete }) => {
    const [newItem, setNewItem] = useState<{
        title: string;
        amount: string;
        currency: Currency;
        date?: string;
    }>({
        title: '',
        amount: '',
        currency: 'USD',
        date: type !== 'fixed' ? new Date().toISOString().split('T')[0] : undefined
    });

    const handleAdd = () => {
        if (!newItem.title || !newItem.amount) return;

        onAdd({
            title: newItem.title,
            amount: parseFloat(newItem.amount),
            currency: newItem.currency,
            date: newItem.date
        });

        // Reset form
        setNewItem({
            title: '',
            amount: '',
            currency: 'USD',
            date: type !== 'fixed' ? new Date().toISOString().split('T')[0] : undefined
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    // Determine classes
    const btnClass = type === 'income' ? 'btn-income' : type === 'variable' ? 'btn-variable' : 'btn-fixed';
    const amountClass = type === 'income' ? 'amount-positive' : 'amount-negative';
    const sign = type === 'income' ? '+' : '-';

    return (
        <div className="glass-panel finance-card" style={{ borderRadius: 'var(--radius-md)' }}>
            <h3>{title}</h3>
            <div className="finance-form" onKeyDown={handleKeyDown}>
                <input
                    type="text"
                    placeholder="Título"
                    className="form-input"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
                <div className="input-group">
                    <input
                        type="number"
                        placeholder="Monto"
                        className="form-input"
                        style={{ flex: 1 }}
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                    />
                    <select
                        className="form-select"
                        value={newItem.currency}
                        onChange={(e) => setNewItem({ ...newItem, currency: e.target.value as Currency })}
                    >
                        <option value="USD">USD</option>
                        <option value="DOP">DOP</option>
                    </select>
                </div>
                {type !== 'fixed' && (
                    <input
                        type="date"
                        className="form-input"
                        value={newItem.date || ''}
                        onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                    />
                )}
                <button className={`btn-add ${btnClass}`} onClick={handleAdd}>
                    <PlusCircle size={16} /> Agregar
                </button>
            </div>
            <div className="transaction-list">
                {transactions.map(t => (
                    <div key={t.id} className="transaction-item">
                        <div>
                            <div className="item-title">{t.title}</div>
                            {t.date && <div className="item-date">{t.date}</div>}
                        </div>
                        <div className={`transaction-amount ${amountClass}`}>
                            {sign} {t.currency} {t.amount}
                        </div>
                        <button className="btn-delete" onClick={() => onDelete(t.id)}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FinanceSection;

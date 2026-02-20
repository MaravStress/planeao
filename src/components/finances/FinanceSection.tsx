import React, { useMemo } from 'react';
import { PlusCircle, Trash2, Settings } from 'lucide-react';
import type { Transaction, RecurringExpense } from '../../types/finances';
import { convertToUSD, formatCurrency } from './utils';

interface FinanceSectionProps {
    title: React.ReactNode; // Can include the icon
    transactions: Transaction[];
    type: 'income' | 'variable' | 'fixed' | 'recurring-income';
    exchangeRate: number;
    recurringExpenses?: RecurringExpense[];
    onOpenAddModal: () => void;
    onAddRecurring?: (expense: RecurringExpense) => void;
    onDelete: (id: string) => void;
    onConfigure?: () => void;
}

const FinanceSection: React.FC<FinanceSectionProps> = ({
    title,
    transactions,
    type,
    exchangeRate,
    recurringExpenses,
    onOpenAddModal,
    onAddRecurring,
    onDelete,
    onConfigure
}) => {
    // Determine classes
    const btnClass = type === 'income' || type === 'recurring-income' ? 'btn-income' : type === 'variable' ? 'btn-variable' : 'btn-fixed';
    const amountClass = type === 'income' || type === 'recurring-income' ? 'amount-positive' : 'amount-negative';
    const sign = type === 'income' || type === 'recurring-income' ? '+' : '-';

    const total = useMemo(() => {
        return transactions.reduce((sum, t) => sum + convertToUSD(t.amount, t.currency, exchangeRate), 0);
    }, [transactions, exchangeRate]);

    return (
        <div className="glass-panel finance-card" style={{ borderRadius: 'var(--radius-md)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3>{title}</h3>
                    <span className={`transaction-amount ${amountClass}`} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {formatCurrency(total)}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {onConfigure && (
                        <button
                            className="btn-configure"
                            onClick={onConfigure}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Configurar recurrentes"
                        >
                            <Settings size={18} />
                        </button>
                    )}
                    <button
                        className={`btn-add ${btnClass}`}
                        onClick={onOpenAddModal}
                        style={{ padding: '0.5rem', borderRadius: '50%' }}
                    >
                        <PlusCircle size={20} />
                    </button>
                </div>
            </div>

            {/* Quick Add Buttons for Recurring Expenses */}
            {recurringExpenses && recurringExpenses.length > 0 && onAddRecurring && (
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    padding: '0.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px'
                }}>
                    {recurringExpenses.map(expense => (
                        <button
                            key={expense.id}
                            onClick={() => onAddRecurring(expense)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '20px',
                                color: 'var(--color-text)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.2s'
                            }}
                            className="recurring-btn"
                        >
                            <span>{expense.title}</span>
                            <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>${expense.amount}</span>
                        </button>
                    ))}
                </div>
            )}

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

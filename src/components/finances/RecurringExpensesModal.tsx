import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { RecurringExpense, Currency } from '../../types/finances';

interface RecurringExpensesModalProps {
    isOpen: boolean;
    onClose: () => void;
    recurringExpenses: RecurringExpense[];
    onUpdateRecurring: (expenses: RecurringExpense[]) => void;
}

const RecurringExpensesModal: React.FC<RecurringExpensesModalProps> = ({
    isOpen,
    onClose,
    recurringExpenses,
    onUpdateRecurring
}) => {
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCurrency, setNewCurrency] = useState<Currency>('USD');

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newTitle || !newAmount) return;

        const newExpense: RecurringExpense = {
            id: uuidv4(),
            title: newTitle,
            amount: parseFloat(newAmount),
            currency: newCurrency
        };

        onUpdateRecurring([...recurringExpenses, newExpense]);
        setNewTitle('');
        setNewAmount('');
        setNewCurrency('USD');
    };

    const handleDelete = (id: string) => {
        onUpdateRecurring(recurringExpenses.filter(e => e.id !== id));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{
                width: '500px',
                maxWidth: '90%',
                padding: '2rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                maxHeight: '80vh',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-text)' }}>
                    Configurar Gastos Recurrentes
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Título</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Ej: Netflix"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ flex: 1.5 }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Monto</label>
                            <input
                                type="number"
                                className="form-input"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                placeholder="0.00"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ width: '80px' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Moneda</label>
                            <select
                                className="form-select"
                                value={newCurrency}
                                onChange={(e) => setNewCurrency(e.target.value as Currency)}
                                style={{ width: '100%' }}
                            >
                                <option value="USD">USD</option>
                                <option value="DOP">DOP</option>
                            </select>
                        </div>
                        <button
                            onClick={handleAdd}
                            style={{
                                padding: '0.75rem',
                                backgroundColor: 'var(--color-primary)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    overflowY: 'auto',
                    maxHeight: '300px',
                    paddingRight: '0.5rem'
                }}>
                    {recurringExpenses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            No hay gastos recurrentes configurados.
                        </div>
                    ) : (
                        recurringExpenses.map(expense => (
                            <div key={expense.id} className="transaction-item" style={{ marginBottom: 0 }}>
                                <div className="item-title">{expense.title}</div>
                                <div className="transaction-amount amount-negative">
                                    - {expense.currency} {expense.amount}
                                </div>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(expense.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecurringExpensesModal;

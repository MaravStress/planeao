import React, { useState } from 'react';
import GoogleIcon from '../GoogleIcon';
import { useFinances } from '../../context/FinancesContext';
import type { Currency } from '../../types/finances';

interface TransactionColumnsProps {
    onAddIncome: () => void;
    onAddExpense: () => void;
}

const TransactionColumns: React.FC<TransactionColumnsProps> = ({ onAddIncome, onAddExpense }) => {
    const {
        variableExpenses, incomes,
        deleteIncome, deleteVariableExpense,
        addVariableExpense, updateVariableExpenseDate,
        quickExpenses, addQuickExpense, deleteQuickExpense,
        updateIncomeDate,
        currentYearMonth
    } = useFinances();

    const [managingQuick, setManagingQuick] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCurrency, setNewCurrency] = useState<Currency>('USD');

    const currentVarExpenses = variableExpenses.filter(e => (e.createdAt || '').slice(0, 7) === currentYearMonth);
    const currentIncomes = incomes.filter(i => (i.createdAt || '').slice(0, 7) === currentYearMonth);

    const formatAmount = (amount: number, currency: Currency) => {
        if (currency === 'USD') return `$${amount.toFixed(2)}`;
        return `RD$${amount.toFixed(0)}`;
    };

    const formatDate = (iso: string) => {
        if (!iso) return 'S/fecha';
        return new Date(iso).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
    };

    const getIsoDateOnly = (iso: string) => (iso || new Date().toISOString()).slice(0, 10);

    const handleQuickAdd = (id: string) => {
        const item = quickExpenses.find(q => q.id === id);
        if (item) addVariableExpense(item.title, item.amount, item.currency);
    };

    const handleSaveTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(newAmount);
        if (!newTitle.trim() || isNaN(parsed) || parsed <= 0) return;
        addQuickExpense(newTitle.trim(), parsed, newCurrency);
        setNewTitle('');
        setNewAmount('');
        setNewCurrency('USD');
    };

    return (
        <div className="fin-transaction-columns">
            {/* Incomes Column */}
            <div className="fin-column glass-panel">
                <div className="fin-column-header">
                    <span className="fin-column-title income-title">Ingresos</span>
                    <button className="fin-add-btn income-btn" onClick={onAddIncome} title="Registrar ingreso">
                        <GoogleIcon name="add" size={16} />
                    </button>
                </div>
                <div className="fin-column-list">
                    {currentIncomes.length === 0 ? (
                        <p className="fin-empty">Sin ingresos este mes</p>
                    ) : (
                        currentIncomes.map(item => (
                            <div key={item.id} className="fin-item income-item">
                                <div className="fin-item-info">
                                    <span className="fin-item-title">{item.title}</span>
                                    <div className="fin-date-edit">
                                        <input
                                            type="date"
                                            className="fin-in-item-date-input"
                                            value={getIsoDateOnly(item.createdAt)}
                                            onChange={e => {
                                                const newIso = new Date(`${e.target.value}T12:00:00`).toISOString();
                                                updateIncomeDate(item.id, newIso);
                                            }}
                                        />
                                        <span className="fin-item-date">{formatDate(item.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="fin-item-right">
                                    <span className="fin-item-amount income-amount">
                                        {formatAmount(item.amount, item.currency as Currency)} {item.currency}
                                    </span>
                                    <button className="fin-delete-btn" onClick={() => deleteIncome(item.id)} title="Eliminar">
                                        <GoogleIcon name="delete" size={13} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Variable Expenses Column */}
            <div className="fin-column glass-panel">
                {/* Header: title | chips (inline) | ⚡ manage | + add */}
                <div className="fin-column-header fin-var-header">
                    <span className="fin-column-title expense-title" style={{ flexShrink: 0 }}>Gastos Variables</span>

                    {/* Quick chips — inline in header row */}
                    <div className="fin-header-chips">
                        {quickExpenses.map(q => (
                            <button
                                key={q.id}
                                className="fin-quick-chip"
                                onClick={() => handleQuickAdd(q.id)}
                                title={`Añadir: ${q.title} — ${formatAmount(q.amount, q.currency as Currency)} ${q.currency}`}
                            >
                                <span className="fin-quick-chip-name">{q.title}</span>
                                <span className="fin-quick-chip-amount">
                                    {formatAmount(q.amount, q.currency as Currency)}
                                    <span className="fin-quick-chip-cur">{q.currency}</span>
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                        <button
                            className={`fin-add-btn ${managingQuick ? 'quick-btn-active' : 'quick-btn'}`}
                            onClick={() => setManagingQuick(p => !p)}
                            title="Gestionar gastos rápidos"
                        >
                            <GoogleIcon name="bolt" size={14} />
                        </button>
                        <button className="fin-add-btn expense-btn" onClick={onAddExpense} title="Registrar gasto">
                            <GoogleIcon name="add" size={16} />
                        </button>
                    </div>
                </div>

                {/* Manage panel — slides in below header when ⚡ is active */}
                {managingQuick && (
                    <div className="fin-quick-panel">
                        <div className="fin-quick-manage">
                            {quickExpenses.length === 0 && (
                                <p className="fin-quick-empty">Aún no hay gastos rápidos. Añade uno abajo.</p>
                            )}
                            {quickExpenses.map(q => (
                                <div key={q.id} className="fin-quick-manage-item">
                                    <span className="fin-quick-manage-name">{q.title}</span>
                                    <span className="fin-quick-manage-amt">
                                        {formatAmount(q.amount, q.currency as Currency)} {q.currency}
                                    </span>
                                    <button
                                        className="fin-delete-btn"
                                        style={{ opacity: 1 }}
                                        onClick={() => deleteQuickExpense(q.id)}
                                        title="Eliminar"
                                    >
                                        <GoogleIcon name="delete" size={12} />
                                    </button>
                                </div>
                            ))}

                            <form className="fin-quick-form" onSubmit={handleSaveTemplate}>
                                <input
                                    type="text"
                                    placeholder="Nombre del gasto"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    autoFocus
                                />
                                <div className="fin-quick-form-row">
                                    <input
                                        type="number"
                                        placeholder="Monto"
                                        min="0"
                                        step="0.01"
                                        value={newAmount}
                                        onChange={e => setNewAmount(e.target.value)}
                                    />
                                    <select value={newCurrency} onChange={e => setNewCurrency(e.target.value as Currency)}>
                                        <option value="USD">USD</option>
                                        <option value="DOP">DOP</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="fin-quick-add-btn"
                                        disabled={!newTitle.trim() || !newAmount || parseFloat(newAmount) <= 0}
                                        title="Guardar plantilla"
                                    >
                                        <GoogleIcon name="add" size={14} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="fin-column-list">
                    {currentVarExpenses.length === 0 ? (
                        <p className="fin-empty">Sin gastos variables este mes</p>
                    ) : (
                        currentVarExpenses.map(item => (
                            <div key={item.id} className="fin-item expense-item">
                                <div className="fin-item-info">
                                    <span className="fin-item-title">{item.title}</span>
                                    <div className="fin-date-edit">
                                        <input
                                            type="date"
                                            className="fin-in-item-date-input"
                                            value={getIsoDateOnly(item.createdAt)}
                                            onChange={e => {
                                                const newIso = new Date(`${e.target.value}T12:00:00`).toISOString();
                                                updateVariableExpenseDate(item.id, newIso);
                                            }}
                                        />
                                        <span className="fin-item-date">{formatDate(item.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="fin-item-right">
                                    <span className="fin-item-amount expense-amount">
                                        {formatAmount(item.amount, item.currency as Currency)} {item.currency}
                                    </span>
                                    <button className="fin-delete-btn" onClick={() => deleteVariableExpense(item.id)} title="Eliminar">
                                        <GoogleIcon name="delete" size={13} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionColumns;

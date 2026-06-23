import React from 'react';
import GoogleIcon from '../GoogleIcon';
import { useFinances } from '../../context/FinancesContext';
import type { Currency } from '../../types/finances';

interface MonthEditModalProps {
    yearMonth: string; // "YYYY-MM"
    onClose: () => void;
}

const MonthEditModal: React.FC<MonthEditModalProps> = ({ yearMonth, onClose }) => {
    const {
        variableExpenses, incomes,
        fixedExpenses, fixedIncomes,
        deleteIncome, deleteVariableExpense,
        updateIncomeDate, updateVariableExpenseDate,
        toUSD
    } = useFinances();

    const [year, month] = yearMonth.split('-');
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });

    const monthIncomes = incomes.filter(i => (i.createdAt || '').slice(0, 7) === yearMonth);
    const monthExpenses = variableExpenses.filter(e => (e.createdAt || '').slice(0, 7) === yearMonth);

    const formatAmount = (amount: number, currency: Currency) => {
        if (currency === 'USD') return `$${amount.toFixed(2)}`;
        return `RD$${amount.toFixed(0)}`;
    };

    const formatDate = (iso: string) => {
        if (!iso) return 'S/fecha';
        return new Date(iso).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
    };

    const getIsoDateOnly = (iso: string) => (iso || new Date().toISOString()).slice(0, 10);

    const totalFixed = fixedExpenses.reduce((s, e) => s + toUSD(e.amount, e.currency as Currency), 0);
    const totalFixedIn = fixedIncomes.reduce((s, i) => s + toUSD(i.amount, i.currency as Currency), 0);
    const totalIn = totalFixedIn + monthIncomes.reduce((s, i) => s + toUSD(i.amount, i.currency as Currency), 0);
    const totalOut = totalFixed + monthExpenses.reduce((s, e) => s + toUSD(e.amount, e.currency as Currency), 0);

    return (
        <div className="fin-modal-overlay" onClick={onClose}>
            <div className="fin-modal glass-panel fin-month-edit-modal" onClick={e => e.stopPropagation()}>
                <div className="fin-modal-header">
                    <div>
                        <h3>Detalle Mensual</h3>
                        <span className="fin-modal-subtitle">{monthName}</span>
                    </div>
                    <button className="fin-modal-close" onClick={onClose}>
                        <GoogleIcon name="close" size={18} />
                    </button>
                </div>

                <div className="fin-month-edit-body">
                    {/* Columns inside modal */}
                    <div className="fin-month-edit-cols">
                        {/* Incomes */}
                        <div className="fin-month-edit-col">
                            <h4 className="income-title">Ingresos</h4>
                            <div className="fin-month-edit-list">
                                {monthIncomes.length === 0 ? <p className="fin-empty-small">Sin ingresos</p> : 
                                    monthIncomes.map(item => (
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
                                                <span className="fin-item-amount income-amount">{formatAmount(item.amount, item.currency as Currency)}</span>
                                                <button className="fin-delete-btn" style={{ opacity: 1 }} onClick={() => deleteIncome(item.id)}><GoogleIcon name="delete" size={13} /></button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Expenses */}
                        <div className="fin-month-edit-col">
                            <h4 className="expense-title">Gastos</h4>
                            <div className="fin-month-edit-list">
                                {monthExpenses.length === 0 ? <p className="fin-empty-small">Sin gastos</p> : 
                                    monthExpenses.map(item => (
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
                                                <span className="fin-item-amount expense-amount">{formatAmount(item.amount, item.currency as Currency)}</span>
                                                <button className="fin-delete-btn" style={{ opacity: 1 }} onClick={() => deleteVariableExpense(item.id)}><GoogleIcon name="delete" size={13} /></button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="fin-month-edit-footer">
                        <div className="fin-footer-stat">
                            <span>Ingresos:</span>
                            <span className="income-text">${totalIn.toFixed(2)} USD</span>
                        </div>
                        <div className="fin-footer-stat">
                            <span>Gastos:</span>
                            <span className="expense-amount">${totalOut.toFixed(2)} USD</span>
                        </div>
                        <div className="fin-footer-stat fin-footer-total">
                            <span>Balance:</span>
                            <span className={totalIn - totalOut >= 0 ? 'positive' : 'negative'}>
                                ${(totalIn - totalOut).toFixed(2)} USD
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthEditModal;

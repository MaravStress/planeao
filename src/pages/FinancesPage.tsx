import React, { useState, useMemo } from 'react';
import '../styles/Finances.css';
import { PlusCircle, ArrowUpRight, ArrowDownRight, ArrowRight, RefreshCw, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Types
type Currency = 'USD' | 'DOP';

interface Transaction {
    id: string;
    title: string;
    amount: number;
    currency: Currency;
    date?: string; // Optional for Fixed Expenses
    type: 'income' | 'variable' | 'fixed';
}

const FinancesPage: React.FC = () => {
    // State
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: '1', title: 'Salary', amount: 2000, currency: 'USD', date: '2023-10-05', type: 'income' },
        { id: '2', title: 'Rent', amount: 800, currency: 'USD', type: 'fixed' },
        { id: '3', title: 'Groceries', amount: 3000, currency: 'DOP', date: '2023-10-10', type: 'variable' },
    ]);

    // Default 58.5, editable in header
    const [exchangeRate, setExchangeRate] = useState<number>(58.5);

    // New Transaction Form State
    const [newIncome, setNewIncome] = useState({ title: '', amount: '', currency: 'USD' as Currency, date: new Date().toISOString().split('T')[0] });
    const [newVariable, setNewVariable] = useState({ title: '', amount: '', currency: 'USD' as Currency, date: new Date().toISOString().split('T')[0] });
    const [newFixed, setNewFixed] = useState({ title: '', amount: '', currency: 'USD' as Currency });

    // Helpers
    const convertToUSD = (amount: number, currency: Currency) => {
        return currency === 'USD' ? amount : amount / exchangeRate;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const addTransaction = (type: 'income' | 'variable' | 'fixed') => {
        let newTx: Transaction;
        if (type === 'income') {
            if (!newIncome.title || !newIncome.amount) return;
            newTx = { id: uuidv4(), ...newIncome, amount: parseFloat(newIncome.amount), type };
            setNewIncome({ title: '', amount: '', currency: 'USD', date: new Date().toISOString().split('T')[0] });
        } else if (type === 'variable') {
            if (!newVariable.title || !newVariable.amount) return;
            newTx = { id: uuidv4(), ...newVariable, amount: parseFloat(newVariable.amount), type };
            setNewVariable({ title: '', amount: '', currency: 'USD', date: new Date().toISOString().split('T')[0] });
        } else {
            if (!newFixed.title || !newFixed.amount) return;
            newTx = { id: uuidv4(), ...newFixed, amount: parseFloat(newFixed.amount), type };
            setNewFixed({ title: '', amount: '', currency: 'USD' });
        }
        setTransactions([...transactions, newTx]);
    };

    const deleteTransaction = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    // Calculations for Chart
    const totalFixed = transactions.filter(t => t.type === 'fixed').reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    const totalVariable = transactions.filter(t => t.type === 'variable').reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    const totalExpenses = totalFixed + totalVariable;

    // Calculate Total Income & Balance
    const incomes = useMemo(() => transactions.filter(t => t.type === 'income'), [transactions]);
    const totalIncome = incomes.reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    const balance = totalIncome - totalExpenses;

    // Chart Logic
    const daysInMonth = 30;

    const maxVal = Math.max(
        ...incomes.map(i => convertToUSD(i.amount, i.currency)),
        totalExpenses * 1.2,
        Math.abs(balance) * 1.2,
        100
    );

    // Chart Dimensions & Margins
    const width = 1000;
    const height = 280;
    const padding = { top: 20, bottom: 30, left: 60, right: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const getY = (val: number) => {
        return height - padding.bottom - (val / maxVal * chartHeight);
    };

    const getX = (day: number) => {
        return padding.left + ((day - 1) / (daysInMonth - 1)) * chartWidth;
    };

    const incomePoints = incomes.map(inc => {
        const day = inc.date ? parseInt(inc.date.split('-')[2]) : 15;
        const val = convertToUSD(inc.amount, inc.currency);
        return { x: getX(day), y: getY(val), val, title: inc.title };
    });

    // Generate Axis Ticks
    const xTicks = [1, 5, 10, 15, 20, 25, 30];
    const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

    return (
        <div className="finances-container">
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

            <div className="finances-grid">
                {/* Block 1: Banner Chart */}
                <div className="chart-section glass-panel" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div className="chart-header">
                        <h3>Balance Mensual</h3>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <span className="dot fixed-dot"></span>
                                <span>Fixed: {formatCurrency(totalFixed)}</span>
                            </div>
                            <div className="legend-item">
                                <span className="dot total-dot"></span>
                                <span>Total Exp: {formatCurrency(totalExpenses)}</span>
                            </div>
                            <div className="legend-item">
                                <span className="dot balance-dot"></span>
                                <span style={{ color: balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                    Balance: {formatCurrency(balance)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="chart-container">
                        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="none">
                            {/* Grid Lines/Background */}
                            {yTicks.map(tick => (
                                <line
                                    key={tick}
                                    x1={padding.left}
                                    y1={getY(tick)}
                                    x2={width - padding.right}
                                    y2={getY(tick)}
                                    stroke="var(--color-text-muted)"
                                    strokeOpacity="0.1"
                                />
                            ))}

                            {/* X-Axis Labels */}
                            {xTicks.map(day => (
                                <text
                                    key={day}
                                    x={getX(day)}
                                    y={height - 5}
                                    textAnchor="middle"
                                    className="chart-axis-text"
                                >
                                    {day}
                                </text>
                            ))}

                            {/* Y-Axis Labels */}
                            {yTicks.map(val => (
                                <text
                                    key={val}
                                    x={padding.left - 10}
                                    y={getY(val) + 4}
                                    textAnchor="end"
                                    className="chart-axis-text"
                                >
                                    {Math.round(val)}
                                </text>
                            ))}

                            {/* Balance Line (Green) */}
                            <line
                                x1={padding.left} y1={getY(balance)}
                                x2={width - padding.right} y2={getY(balance)}
                                className="chart-line-balance"
                            />

                            {/* Fixed Expenses Line (Orange) */}
                            <line
                                x1={padding.left} y1={getY(totalFixed)}
                                x2={width - padding.right} y2={getY(totalFixed)}
                                className="chart-line-fixed"
                            />

                            {/* Total Expenses Line (Red) */}
                            <line
                                x1={padding.left} y1={getY(totalExpenses)}
                                x2={width - padding.right} y2={getY(totalExpenses)}
                                className="chart-line-total"
                            />

                            {/* Income Points (Green) */}
                            {incomePoints.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="6" className="chart-point-income">
                                        <title>{p.title}: {formatCurrency(p.val)}</title>
                                    </circle>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Block 2: Income */}
                <div className="glass-panel finance-card" style={{ borderRadius: 'var(--radius-md)' }}>
                    <h3><ArrowUpRight size={18} color="var(--color-success)" style={{ display: 'inline', marginRight: '5px' }} /> Ingresos</h3>
                    <div className="finance-form">
                        <input
                            type="text"
                            placeholder="Título"
                            className="form-input"
                            value={newIncome.title}
                            onChange={(e) => setNewIncome({ ...newIncome, title: e.target.value })}
                        />
                        <div className="input-group">
                            <input
                                type="number"
                                placeholder="Monto"
                                className="form-input"
                                style={{ flex: 1 }}
                                value={newIncome.amount}
                                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                            />
                            <select
                                className="form-select"
                                value={newIncome.currency}
                                onChange={(e) => setNewIncome({ ...newIncome, currency: e.target.value as Currency })}
                            >
                                <option value="USD">USD</option>
                                <option value="DOP">DOP</option>
                            </select>
                        </div>
                        <input
                            type="date"
                            className="form-input"
                            value={newIncome.date}
                            onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                        />
                        <button className="btn-add btn-income" onClick={() => addTransaction('income')}>
                            <PlusCircle size={16} /> Agregar
                        </button>
                    </div>
                    <div className="transaction-list">
                        {transactions.filter(t => t.type === 'income').map(t => (
                            <div key={t.id} className="transaction-item">
                                <div>
                                    <div className="item-title">{t.title}</div>
                                    <div className="item-date">{t.date}</div>
                                </div>
                                <div className="transaction-amount amount-positive">
                                    + {t.currency} {t.amount}
                                </div>
                                <button className="btn-delete" onClick={() => deleteTransaction(t.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Block 3: Variable Expenses */}
                <div className="glass-panel finance-card" style={{ borderRadius: 'var(--radius-md)' }}>
                    <h3><ArrowDownRight size={18} color="var(--color-warning)" style={{ display: 'inline', marginRight: '5px' }} /> Gastos Variables</h3>
                    <div className="finance-form">
                        <input
                            type="text"
                            placeholder="Título"
                            className="form-input"
                            value={newVariable.title}
                            onChange={(e) => setNewVariable({ ...newVariable, title: e.target.value })}
                        />
                        <div className="input-group">
                            <input
                                type="number"
                                placeholder="Monto"
                                className="form-input"
                                style={{ flex: 1 }}
                                value={newVariable.amount}
                                onChange={(e) => setNewVariable({ ...newVariable, amount: e.target.value })}
                            />
                            <select
                                className="form-select"
                                value={newVariable.currency}
                                onChange={(e) => setNewVariable({ ...newVariable, currency: e.target.value as Currency })}
                            >
                                <option value="USD">USD</option>
                                <option value="DOP">DOP</option>
                            </select>
                        </div>
                        <input
                            type="date"
                            className="form-input"
                            value={newVariable.date}
                            onChange={(e) => setNewVariable({ ...newVariable, date: e.target.value })}
                        />
                        <button className="btn-add btn-variable" onClick={() => addTransaction('variable')}>
                            <PlusCircle size={16} /> Agregar
                        </button>
                    </div>
                    <div className="transaction-list">
                        {transactions.filter(t => t.type === 'variable').map(t => (
                            <div key={t.id} className="transaction-item">
                                <div>
                                    <div className="item-title">{t.title}</div>
                                    <div className="item-date">{t.date}</div>
                                </div>
                                <div className="transaction-amount amount-negative">
                                    - {t.currency} {t.amount}
                                </div>
                                <button className="btn-delete" onClick={() => deleteTransaction(t.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Block 4: Fixed Expenses */}
                <div className="glass-panel finance-card" style={{ borderRadius: 'var(--radius-md)' }}>
                    <h3><ArrowRight size={18} color="var(--color-danger)" style={{ display: 'inline', marginRight: '5px' }} /> Gastos Fijos</h3>
                    <div className="finance-form">
                        <input
                            type="text"
                            placeholder="Título"
                            className="form-input"
                            value={newFixed.title}
                            onChange={(e) => setNewFixed({ ...newFixed, title: e.target.value })}
                        />
                        <div className="input-group">
                            <input
                                type="number"
                                placeholder="Monto"
                                className="form-input"
                                style={{ flex: 1 }}
                                value={newFixed.amount}
                                onChange={(e) => setNewFixed({ ...newFixed, amount: e.target.value })}
                            />
                            <select
                                className="form-select"
                                value={newFixed.currency}
                                onChange={(e) => setNewFixed({ ...newFixed, currency: e.target.value as Currency })}
                            >
                                <option value="USD">USD</option>
                                <option value="DOP">DOP</option>
                            </select>
                        </div>
                        {/* No Date for Fixed Expenses */}
                        <button className="btn-add btn-fixed" onClick={() => addTransaction('fixed')}>
                            <PlusCircle size={16} /> Agregar
                        </button>
                    </div>
                    <div className="transaction-list">
                        {transactions.filter(t => t.type === 'fixed').map(t => (
                            <div key={t.id} className="transaction-item">
                                <div className="item-title">{t.title}</div>
                                <div className="transaction-amount amount-negative">
                                    - {t.currency} {t.amount}
                                </div>
                                <button className="btn-delete" onClick={() => deleteTransaction(t.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FinancesPage;

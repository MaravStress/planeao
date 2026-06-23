import React, { useMemo } from 'react';
import { useFinances } from '../../context/FinancesContext';
import type { Currency } from '../../types/finances';

const MonthSummaryPanel: React.FC = () => {
    const { fixedExpenses, fixedIncomes, variableExpenses, incomes, toUSD, currentYearMonth } = useFinances();

    // Current month items
    const currentVarExpenses = variableExpenses.filter(e => (e.createdAt || '').slice(0, 7) === currentYearMonth);
    const currentIncomes = incomes.filter(i => (i.createdAt || '').slice(0, 7) === currentYearMonth);

    // Compute totals in USD
    const totalFixed = useMemo(() =>
        fixedExpenses.reduce((sum, e) => sum + toUSD(e.amount, e.currency as Currency), 0),
        [fixedExpenses, toUSD]
    );
    const totalVariable = useMemo(() =>
        currentVarExpenses.reduce((sum, e) => sum + toUSD(e.amount, e.currency as Currency), 0),
        [currentVarExpenses, toUSD]
    );
    const totalFixedIncomes = useMemo(() =>
        fixedIncomes.reduce((sum, i) => sum + toUSD(i.amount, i.currency as Currency), 0),
        [fixedIncomes, toUSD]
    );
    const totalVariableIncomes = useMemo(() =>
        currentIncomes.reduce((sum, i) => sum + toUSD(i.amount, i.currency as Currency), 0),
        [currentIncomes, toUSD]
    );

    const totalIncome = totalFixedIncomes + totalVariableIncomes;
    const budget = totalFixed * 2;
    const totalExpenses = totalFixed + totalVariable;
    const balance = totalIncome - totalExpenses;

    // Budget bar percents (max = budget)
    const budgetMax = Math.max(budget, totalExpenses, 1);
    const fixedPct = Math.min((totalFixed / budgetMax) * 100, 100);
    const variablePct = Math.min((totalVariable / budgetMax) * 100, 100 - fixedPct);

    // Income bar percents (max = 2 × budget)
    const incomeMax = Math.max(budget * 2, totalIncome, 1);
    const fixedIncomePct = Math.min((totalFixedIncomes / incomeMax) * 100, 100);
    const variableIncomePct = Math.min((totalVariableIncomes / incomeMax) * 100, 100 - fixedIncomePct);
    // Budget midpoint marker position (budget / incomeMax * 100)
    const budgetMarkerPct = budget > 0 ? Math.min((budget / incomeMax) * 100, 100) : 50;

    const fmt = (n: number) => `$${n.toFixed(2)}`;

    const monthLabel = (() => {
        const [y, m] = currentYearMonth.split('-');
        const date = new Date(Number(y), Number(m) - 1, 1);
        return date.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
    })();

    const budgetPct = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;
    const incomePctOfBudget = budget > 0 ? Math.min((totalIncome / budget) * 100, 100) : 0;

    return (
        <div className="fin-month-summary glass-panel">
            {/* Header row */}
            <div className="fin-summary-header">
                <div className="fin-balance">
                    <span className="fin-label">Balance</span>
                    <span className={`fin-balance-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                        {fmt(balance)} USD
                    </span>
                </div>
                <div className="fin-month-label">{monthLabel}</div>
            </div>

            {/* Budget bar */}
            <div className="fin-bar-section">
                <div className="fin-bar-label">
                    <span>Presupuesto: {fmt(budget)}</span>
                    <span className="fin-bar-sublabel">has gastado un {budgetPct.toFixed(0)}%</span>
                </div>
                <div className="fin-bar-track">
                    <div
                        className="fin-bar-fill fin-bar-fixed"
                        style={{ width: `${fixedPct}%` }}
                        title={`Gastos fijos: ${fmt(totalFixed)}`}
                    >
                        {fixedPct > 8 && (
                            <span className="fin-bar-text">Fijos {fmt(totalFixed)} {fixedPct.toFixed(0)}%</span>
                        )}
                    </div>
                    <div
                        className="fin-bar-fill fin-bar-variable"
                        style={{ width: `${variablePct}%` }}
                        title={`Gastos variables: ${fmt(totalVariable)}`}
                    >
                        {variablePct > 8 && (
                            <span className="fin-bar-text">Variables {fmt(totalVariable)} {variablePct.toFixed(0)}%</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Income bar */}
            <div className="fin-bar-section">
                <div className="fin-bar-label">
                    <span>Ingresos: {fmt(totalIncome)}</span>
                    <span className="fin-bar-sublabel">has conseguido un {incomePctOfBudget.toFixed(0)}% de lo requerido</span>
                </div>
                <div className="fin-bar-track fin-income-track" style={{ position: 'relative' }}>
                    <div
                        className="fin-bar-fill fin-bar-fixed-income"
                        style={{ width: `${fixedIncomePct}%` }}
                        title={`Ingresos fijos: ${fmt(totalFixedIncomes)}`}
                    >
                        {fixedIncomePct > 8 && (
                            <span className="fin-bar-text">Fijos {fmt(totalFixedIncomes)} {fixedIncomePct.toFixed(0)}%</span>
                        )}
                    </div>
                    <div
                        className="fin-bar-fill fin-bar-income"
                        style={{ width: `${variableIncomePct}%` }}
                        title={`Ingresos variables: ${fmt(totalVariableIncomes)}`}
                    >
                        {variableIncomePct > 8 && (
                            <span className="fin-bar-text">Variables {fmt(totalVariableIncomes)} {variableIncomePct.toFixed(0)}%</span>
                        )}
                    </div>
                    {/* Budget midpoint marker */}
                    <div
                        className="fin-bar-marker"
                        style={{ left: `${budgetMarkerPct}%` }}
                        title={`Presupuesto: ${fmt(budget)}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default MonthSummaryPanel;

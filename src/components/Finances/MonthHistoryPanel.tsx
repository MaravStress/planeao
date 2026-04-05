import React, { useMemo } from 'react';
import { useFinances } from '../../context/FinancesContext';
import type { Currency } from '../../types/finances';

const MONTH_NAMES: Record<string, string> = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
};

interface MonthHistoryPanelProps {
    onMonthClick: (ym: string) => void;
}

const MonthHistoryPanel: React.FC<MonthHistoryPanelProps> = ({ onMonthClick }) => {
    const { allMonths, fixedExpenses, variableExpenses, incomes, toUSD } = useFinances();

    const monthCards = useMemo(() => {
        return allMonths.map(ym => {
            const [year, month] = ym.split('-');

            const monthIncomes = incomes.filter(i => (i.createdAt || '').slice(0, 7) === ym);
            const monthVarExpenses = variableExpenses.filter(e => (e.createdAt || '').slice(0, 7) === ym);

            const totalFixed = fixedExpenses.reduce((s, e) => s + toUSD(e.amount, e.currency as Currency), 0);
            const totalVariable = monthVarExpenses.reduce((s, e) => s + toUSD(e.amount, e.currency as Currency), 0);
            const totalIncome = monthIncomes.reduce((s, i) => s + toUSD(i.amount, i.currency as Currency), 0);
            const budget = totalFixed * 2;
            const totalExpenses = totalFixed + totalVariable;
            const balance = totalIncome - totalExpenses;

            return { ym, year, month, budget, totalIncome, totalExpenses, totalFixed, totalVariable, balance };
        });
    }, [allMonths, fixedExpenses, variableExpenses, incomes, toUSD]);

    const fmt = (n: number) => `$${n.toFixed(2)}`;

    if (monthCards.length === 0) {
        return (
            <div className="fin-history-panel">
                <p className="fin-empty" style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem' }}>
                    El historial aparecerá aquí una vez que pase el mes
                </p>
            </div>
        );
    }

    return (
        <div className="fin-history-panel">
            {monthCards.map(card => (
                <div 
                    key={card.ym} 
                    className="fin-history-card glass-panel selectable-card"
                    onClick={() => onMonthClick(card.ym)}
                    title={`Ver detalle de ${MONTH_NAMES[card.month]} ${card.year}`}
                >
                    <div className="fin-hist-balance">
                        <span className="fin-hist-label">Balance</span>
                        <span className={`fin-hist-balance-val ${card.balance >= 0 ? 'positive' : 'negative'}`}>
                            {fmt(card.balance)}
                        </span>
                    </div>

                    <div className="fin-hist-row">
                        <div className="fin-hist-stat">
                            <span className="fin-hist-stat-label">Presupuesto</span>
                            <span className="fin-hist-stat-val">{fmt(card.budget)}</span>
                        </div>
                        <div className="fin-hist-stat">
                            <span className="fin-hist-stat-label">Ingresos</span>
                            <span className="fin-hist-stat-val income-text">{fmt(card.totalIncome)}</span>
                        </div>
                    </div>

                    {/* Mini bars */}
                    <div className="fin-hist-bars">
                        <div className="fin-hist-bar-track">
                            <div
                                className="fin-hist-bar-fill expense-bar"
                                style={{ width: `${card.budget > 0 ? Math.min((card.totalExpenses / card.budget) * 100, 100) : 0}%` }}
                            />
                        </div>
                        <div className="fin-hist-bar-track income-track">
                            <div
                                className="fin-hist-bar-fill income-bar"
                                style={{ width: `${card.budget > 0 ? Math.min((card.totalIncome / (card.budget * 2)) * 100, 100) : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="fin-hist-footer">
                        {MONTH_NAMES[card.month]} {card.year}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MonthHistoryPanel;

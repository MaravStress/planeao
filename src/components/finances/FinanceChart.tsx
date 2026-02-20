import React from 'react';
import { Construction } from 'lucide-react';
import '../../styles/Finances.css';
import type { Transaction } from '../../types/finances';
import { convertToUSD, formatCurrency } from './utils';

interface FinanceChartProps {
    transactions: Transaction[];
    exchangeRate: number;
}

const FinanceChart: React.FC<FinanceChartProps> = ({ transactions, exchangeRate }) => {
    // Current Month Check (UTC to match storage)
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    const isCurrentMonth = (date?: string) => date?.startsWith(currentMonthPrefix) ?? false;

    // Calculations
    const totalFixed = transactions
        .filter(t => t.type === 'fixed')
        .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency, exchangeRate), 0);

    const totalVariable = transactions
        .filter(t => t.type === 'variable' && isCurrentMonth(t.date))
        .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency, exchangeRate), 0);

    const totalExpenses = totalFixed + totalVariable;

    // Calculate Total Income & Balance
    const totalRecurringIncome = transactions
        .filter(t => t.type === 'recurring-income')
        .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency, exchangeRate), 0);

    const totalOneOffIncome = transactions
        .filter(t => t.type === 'income' && isCurrentMonth(t.date))
        .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency, exchangeRate), 0);

    const totalIncome = totalRecurringIncome + totalOneOffIncome;
    const balance = totalIncome - totalExpenses;

    const balanceUSD = balance;
    const balanceDOP = balanceUSD * exchangeRate;

    return (
        <div className="chart-section glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            gap: '1rem',
            padding: '2rem'
        }}>
            <Construction size={48} className="text-warning" style={{ marginBottom: '1rem', color: 'var(--color-warning)' }} />
            <h3 style={{ margin: 0 }}>En Construcción</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Balance (USD): <span style={{ color: balanceUSD >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {formatCurrency(balanceUSD)}
                    </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', opacity: 0.8 }}>
                    Balance (DOP): <span style={{ color: balanceDOP >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(balanceDOP)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FinanceChart;

import React, { useMemo } from 'react';
import '../../styles/Finances.css';
import type { Transaction } from './types';
import { convertToUSD, formatCurrency } from './utils';

interface FinanceChartProps {
    transactions: Transaction[];
    exchangeRate: number;
}

const FinanceChart: React.FC<FinanceChartProps> = ({ transactions, exchangeRate }) => {
    // Helpers
    // (using imported convertToUSD which requires exchangeRate)

    // Calculations for Chart
    const totalFixed = transactions.filter(t => t.type === 'fixed').reduce((sum, t) => sum + convertToUSD(t.amount, t.currency, exchangeRate), 0);
    const totalVariable = transactions.filter(t => t.type === 'variable').reduce((sum, t) => sum + convertToUSD(t.amount, t.currency, exchangeRate), 0);
    const totalExpenses = totalFixed + totalVariable;

    // Calculate Total Income & Balance
    const incomes = useMemo(() => transactions.filter(t => t.type === 'income'), [transactions]);
    const totalIncome = incomes.reduce((sum, t) => sum + convertToUSD(t.amount, t.currency, exchangeRate), 0);
    const balance = totalIncome - totalExpenses;

    // Chart Logic
    const daysInMonth = 30;

    const maxVal = Math.max(
        ...incomes.map(i => convertToUSD(i.amount, i.currency, exchangeRate)),
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
        const val = convertToUSD(inc.amount, inc.currency, exchangeRate);
        return { x: getX(day), y: getY(val), val, title: inc.title };
    });

    // Generate Axis Ticks
    const xTicks = [1, 5, 10, 15, 20, 25, 30];
    const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

    return (
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
    );
};

export default FinanceChart;

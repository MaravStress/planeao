import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useFinances } from '../context/FinancesContext';
import MonthSummaryPanel from '../components/Finances/MonthSummaryPanel';
import TransactionColumns from '../components/Finances/TransactionColumns';
import MonthHistoryPanel from '../components/Finances/MonthHistoryPanel';
import TransactionModal from '../components/Finances/TransactionModal';
import FixedExpensesModal from '../components/Finances/FixedExpensesModal';
import MonthEditModal from '../components/Finances/MonthEditModal';
import type { Currency } from '../types/finances';
import '../styles/Finances.css';

const FinancesPage: React.FC = () => {
    const { exchangeRate, setExchangeRate, addIncome, addVariableExpense } = useFinances();

    const [modal, setModal] = useState<'income' | 'expense' | 'fixed' | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [rateInput, setRateInput] = useState(String(exchangeRate));

    const handleRateBlur = () => {
        const parsed = parseFloat(rateInput);
        if (!isNaN(parsed) && parsed > 0) {
            setExchangeRate(parsed);
        } else {
            setRateInput(String(exchangeRate));
        }
    };

    const handleSaveTransaction = (title: string, amount: number, currency: Currency, date: string) => {
        if (modal === 'income') addIncome(title, amount, currency, date);
        if (modal === 'expense') addVariableExpense(title, amount, currency, date);
        setModal(null);
    };

    return (
        <div className="fin-page">
            {/* Top Bar */}
            <div className="fin-topbar">
                <div className="fin-topbar-left">
                    <h1 className="fin-page-title">Finanzas</h1>

                    {/* Exchange Rate Widget */}
                    <div className="fin-exchange-widget">
                        <span className="fin-exchange-label">1 USD =</span>
                        <input
                            id="fin-exchange-rate"
                            className="fin-exchange-input"
                            type="number"
                            min="1"
                            step="0.5"
                            value={rateInput}
                            onChange={e => setRateInput(e.target.value)}
                            onBlur={handleRateBlur}
                            onKeyDown={e => e.key === 'Enter' && handleRateBlur()}
                            title="Cotización: pesos dominicanos por dólar"
                        />
                        <span className="fin-exchange-unit">DOP</span>
                    </div>
                </div>

                {/* Fixed Expenses Button */}
                <button
                    id="fin-fixed-expenses-btn"
                    className="fin-fixed-btn"
                    onClick={() => setModal('fixed')}
                >
                    <Settings2 size={15} />
                    Gastos Fijos
                </button>
            </div>

            {/* Month Summary Panel */}
            <MonthSummaryPanel />

            {/* Body: Transactions + History */}
            <div className="fin-body">
                <TransactionColumns
                    onAddIncome={() => setModal('income')}
                    onAddExpense={() => setModal('expense')}
                />
                <MonthHistoryPanel onMonthClick={setSelectedMonth} />
            </div>

            {/* Modals */}
            {(modal === 'income' || modal === 'expense') && (
                <TransactionModal
                    type={modal}
                    onSave={handleSaveTransaction}
                    onClose={() => setModal(null)}
                />
            )}

            {modal === 'fixed' && (
                <FixedExpensesModal onClose={() => setModal(null)} />
            )}

            {selectedMonth && (
                <MonthEditModal
                    yearMonth={selectedMonth}
                    onClose={() => setSelectedMonth(null)}
                />
            )}
        </div>
    );
};

export default FinancesPage;

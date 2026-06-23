import React, { useState } from 'react';
import { useFinances } from '../context/FinancesContext';
import MonthSummaryPanel from '../components/Finances/MonthSummaryPanel';
import TransactionColumns from '../components/Finances/TransactionColumns';
import MonthHistoryPanel from '../components/Finances/MonthHistoryPanel';
import TransactionModal from '../components/Finances/TransactionModal';
import FixedItemModal from '../components/Finances/FixedItemModal';
import MonthEditModal from '../components/Finances/MonthEditModal';
import type { Currency } from '../types/finances';
import '../styles/Finances.css';
import ImportExportButtons from '../components/ImportExportButtons';

const FinancesPage: React.FC = () => {
    const { exchangeRate, setExchangeRate, addIncome, addVariableExpense, addFixedIncome, addFixedExpense } = useFinances();

    const [modal, setModal] = useState<'income' | 'expense' | 'fixed-income' | 'fixed-expense' | null>(null);
    const [showFixed, setShowFixed] = useState(false);
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

    const handleSaveFixed = (title: string, amount: number, currency: Currency) => {
        if (modal === 'fixed-income') addFixedIncome(title, amount, currency);
        if (modal === 'fixed-expense') addFixedExpense(title, amount, currency);
        setModal(null);
    };

    return (
        <div className="page-container fin-page">
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

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <ImportExportButtons page="finances" />
                    {/* Toggle Selector Segmentado */}
                    <div className="fin-mode-toggle">
                        <button
                            className={`fin-toggle-btn ${!showFixed ? 'active' : ''}`}
                            onClick={() => setShowFixed(false)}
                            title="Ver ingresos y gastos variables"
                        >
                            Variables
                        </button>
                        <button
                            id="fin-fixed-expenses-btn"
                            className={`fin-toggle-btn ${showFixed ? 'active' : ''}`}
                            onClick={() => setShowFixed(true)}
                            title="Ver ingresos y gastos fijos"
                        >
                            Gastos Fijos
                        </button>
                    </div>
                </div>
            </div>

            {/* Month Summary Panel */}
            <MonthSummaryPanel />

            {/* Body: Transactions + History */}
            <div className="fin-body">
                <TransactionColumns
                    showFixed={showFixed}
                    onAddIncome={() => setModal(showFixed ? 'fixed-income' : 'income')}
                    onAddExpense={() => setModal(showFixed ? 'fixed-expense' : 'expense')}
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

            {(modal === 'fixed-income' || modal === 'fixed-expense') && (
                <FixedItemModal
                    type={modal === 'fixed-income' ? 'income' : 'expense'}
                    onSave={handleSaveFixed}
                    onClose={() => setModal(null)}
                />
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

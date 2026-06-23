import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { FixedExpense, FixedIncome, VariableExpense, Income, Currency, QuickExpense } from '../types/finances';
import { saveToLocal, loadFromLocal, STORAGE_KEYS } from './LocalSave';

interface FinancesContextType {
    // Data
    fixedExpenses: FixedExpense[];
    fixedIncomes: FixedIncome[];
    variableExpenses: VariableExpense[];
    incomes: Income[];
    exchangeRate: number;

    // Exchange rate
    setExchangeRate: (rate: number) => void;

    // Fixed Expenses CRUD
    addFixedExpense: (title: string, amount: number, currency: Currency) => void;
    deleteFixedExpense: (id: string) => void;

    // Fixed Incomes CRUD
    addFixedIncome: (title: string, amount: number, currency: Currency) => void;
    deleteFixedIncome: (id: string) => void;

    // Variable Expenses CRUD
    addVariableExpense: (title: string, amount: number, currency: Currency, date?: string) => void;
    deleteVariableExpense: (id: string) => void;
    updateVariableExpenseDate: (id: string, date: string) => void;

    // Quick Expenses (templates)
    quickExpenses: QuickExpense[];
    addQuickExpense: (title: string, amount: number, currency: Currency) => void;
    deleteQuickExpense: (id: string) => void;

    // Incomes CRUD
    addIncome: (title: string, amount: number, currency: Currency, date?: string) => void;
    deleteIncome: (id: string) => void;
    updateIncomeDate: (id: string, date: string) => void;

    // Computed helpers
    toUSD: (amount: number, currency: Currency) => number;
    currentYearMonth: string;
    allMonths: string[]; // sorted desc list of YYYY-MM strings with data (excluding current)
}

const FinancesContext = createContext<FinancesContextType | undefined>(undefined);

const getCurrentYearMonth = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
};

export const FinancesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() =>
        loadFromLocal<FixedExpense[]>(STORAGE_KEYS.FINANCE_RECURRING, [])
    );
    const [fixedIncomes, setFixedIncomes] = useState<FixedIncome[]>(() =>
        loadFromLocal<FixedIncome[]>(STORAGE_KEYS.FINANCE_RECURRING_INCOMES, [])
    );
    const [variableExpenses, setVariableExpenses] = useState<VariableExpense[]>(() =>
        loadFromLocal<VariableExpense[]>(STORAGE_KEYS.FINANCE_TRANSACTIONS, [])
    );
    const [incomes, setIncomes] = useState<Income[]>(() =>
        loadFromLocal<Income[]>(STORAGE_KEYS.FINANCE_INCOMES, [])
    );
    const [exchangeRate, setExchangeRateState] = useState<number>(() =>
        loadFromLocal<number>(STORAGE_KEYS.FINANCE_EXCHANGE_RATE, 60)
    );
    const [quickExpenses, setQuickExpenses] = useState<QuickExpense[]>(() =>
        loadFromLocal<QuickExpense[]>(STORAGE_KEYS.FINANCE_QUICK_EXPENSES, [])
    );

    const currentYearMonth = getCurrentYearMonth();

    // Persist on change
    useEffect(() => { saveToLocal(STORAGE_KEYS.FINANCE_RECURRING, fixedExpenses); }, [fixedExpenses]);
    useEffect(() => { saveToLocal(STORAGE_KEYS.FINANCE_RECURRING_INCOMES, fixedIncomes); }, [fixedIncomes]);
    useEffect(() => { saveToLocal(STORAGE_KEYS.FINANCE_TRANSACTIONS, variableExpenses); }, [variableExpenses]);
    useEffect(() => { saveToLocal(STORAGE_KEYS.FINANCE_INCOMES, incomes); }, [incomes]);
    useEffect(() => { saveToLocal(STORAGE_KEYS.FINANCE_EXCHANGE_RATE, exchangeRate); }, [exchangeRate]);
    useEffect(() => { saveToLocal(STORAGE_KEYS.FINANCE_QUICK_EXPENSES, quickExpenses); }, [quickExpenses]);

    const setExchangeRate = (rate: number) => setExchangeRateState(rate);

    const toUSD = (amount: number, currency: Currency): number => {
        if (currency === 'USD') return amount;
        return exchangeRate > 0 ? amount / exchangeRate : 0;
    };

    // Fixed Expenses
    const addFixedExpense = (title: string, amount: number, currency: Currency) => {
        const newItem: FixedExpense = { id: crypto.randomUUID(), title, amount, currency };
        setFixedExpenses(prev => [...prev, newItem]);
    };
    const deleteFixedExpense = (id: string) => {
        setFixedExpenses(prev => prev.filter(e => e.id !== id));
    };

    // Fixed Incomes
    const addFixedIncome = (title: string, amount: number, currency: Currency) => {
        const newItem: FixedIncome = { id: crypto.randomUUID(), title, amount, currency };
        setFixedIncomes(prev => [...prev, newItem]);
    };
    const deleteFixedIncome = (id: string) => {
        setFixedIncomes(prev => prev.filter(e => e.id !== id));
    };

    // Variable Expenses
    const addVariableExpense = (title: string, amount: number, currency: Currency, date?: string) => {
        const newItem: VariableExpense = {
            id: crypto.randomUUID(), title, amount, currency,
            createdAt: date ?? new Date().toISOString()
        };
        setVariableExpenses(prev => [...prev, newItem]);
    };
    const deleteVariableExpense = (id: string) => {
        setVariableExpenses(prev => prev.filter(e => e.id !== id));
    };
    const updateVariableExpenseDate = (id: string, date: string) => {
        setVariableExpenses(prev => prev.map(e => e.id === id ? { ...e, createdAt: date } : e));
    };

    // Quick Expenses
    const addQuickExpense = (title: string, amount: number, currency: Currency) => {
        const newItem: QuickExpense = { id: crypto.randomUUID(), title, amount, currency };
        setQuickExpenses(prev => [...prev, newItem]);
    };
    const deleteQuickExpense = (id: string) => {
        setQuickExpenses(prev => prev.filter(e => e.id !== id));
    };

    // Incomes
    const addIncome = (title: string, amount: number, currency: Currency, date?: string) => {
        const newItem: Income = {
            id: crypto.randomUUID(), title, amount, currency,
            createdAt: date ?? new Date().toISOString()
        };
        setIncomes(prev => [...prev, newItem]);
    };
    const deleteIncome = (id: string) => {
        setIncomes(prev => prev.filter(e => e.id !== id));
    };
    const updateIncomeDate = (id: string, date: string) => {
        setIncomes(prev => prev.map(i => i.id === id ? { ...i, createdAt: date } : i));
    };

    // Derive all months with data (excluding current month)
    const allMonths = useMemo(() => {
        const months = new Set<string>();
        [...variableExpenses, ...incomes].forEach(item => {
            if (item.createdAt) {
                const ym = item.createdAt.slice(0, 7);
                if (ym !== currentYearMonth) months.add(ym);
            }
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    }, [variableExpenses, incomes, currentYearMonth]);

    return (
        <FinancesContext.Provider value={{
            fixedExpenses,
            fixedIncomes,
            variableExpenses,
            incomes,
            exchangeRate,
            setExchangeRate,
            addFixedExpense,
            deleteFixedExpense,
            addFixedIncome,
            deleteFixedIncome,
            addVariableExpense,
            deleteVariableExpense,
            updateVariableExpenseDate,
            quickExpenses,
            addQuickExpense,
            deleteQuickExpense,
            addIncome,
            deleteIncome,
            updateIncomeDate,
            toUSD,
            currentYearMonth,
            allMonths,
        }}>
            {children}
        </FinancesContext.Provider>
    );
};

export const useFinances = () => {
    const context = useContext(FinancesContext);
    if (!context) throw new Error('useFinances must be used within a FinancesProvider');
    return context;
};

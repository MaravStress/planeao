export type Currency = 'USD' | 'DOP';

export interface FixedExpense {
    id: string;
    title: string;
    amount: number;
    currency: Currency;
}

export interface VariableExpense {
    id: string;
    title: string;
    amount: number;
    currency: Currency;
    createdAt: string; // ISO date string
}

export interface Income {
    id: string;
    title: string;
    amount: number;
    currency: Currency;
    createdAt: string; // ISO date string
}

export interface QuickExpense {
    id: string;
    title: string;
    amount: number;
    currency: Currency;
}

export interface MonthData {
    yearMonth: string; // 'YYYY-MM'
    incomes: Income[];
    variableExpenses: VariableExpense[];
    fixedExpenses: FixedExpense[];
    exchangeRate: number;
}

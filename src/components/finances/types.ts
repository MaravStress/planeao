export type Currency = 'USD' | 'DOP';

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    currency: Currency;
    date?: string; // Optional for Fixed Expenses
    type: 'income' | 'variable' | 'fixed';
}

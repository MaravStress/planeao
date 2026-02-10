import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import '../styles/Finances.css';
import type { Transaction, Currency } from '../components/finances/types';
import FinanceHeader from '../components/finances/FinanceHeader';
import FinanceChart from '../components/finances/FinanceChart';
import FinanceSection from '../components/finances/FinanceSection';

const FinancesPage: React.FC = () => {
    // State
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: '1', title: 'Salary', amount: 2000, currency: 'USD', date: '2023-10-05', type: 'income' },
        { id: '2', title: 'Rent', amount: 800, currency: 'USD', type: 'fixed' },
        { id: '3', title: 'Groceries', amount: 3000, currency: 'DOP', date: '2023-10-10', type: 'variable' },
    ]);

    // Default 58.5, editable in header
    const [exchangeRate, setExchangeRate] = useState<number>(58.5);

    const handleAdd = (type: 'income' | 'variable' | 'fixed', data: { title: string, amount: number, currency: Currency, date?: string }) => {
        const newTx: Transaction = {
            id: uuidv4(),
            ...data,
            type
        };
        setTransactions([...transactions, newTx]);
    };

    const handleDelete = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    return (
        <div className="finances-container">
            <FinanceHeader exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} />

            <div className="finances-grid">
                <FinanceChart transactions={transactions} exchangeRate={exchangeRate} />

                {/* Block 2: Income */}
                <FinanceSection
                    title={<><ArrowUpRight size={18} color="var(--color-success)" style={{ display: 'inline', marginRight: '5px' }} /> Ingresos</>}
                    transactions={transactions.filter(t => t.type === 'income')}
                    type="income"
                    onAdd={(data) => handleAdd('income', data)}
                    onDelete={handleDelete}
                />

                {/* Block 3: Variable Expenses */}
                <FinanceSection
                    title={<><ArrowDownRight size={18} color="var(--color-warning)" style={{ display: 'inline', marginRight: '5px' }} /> Gastos Variables</>}
                    transactions={transactions.filter(t => t.type === 'variable')}
                    type="variable"
                    onAdd={(data) => handleAdd('variable', data)}
                    onDelete={handleDelete}
                />

                {/* Block 4: Fixed Expenses */}
                <FinanceSection
                    title={<><ArrowRight size={18} color="var(--color-danger)" style={{ display: 'inline', marginRight: '5px' }} /> Gastos Fijos</>}
                    transactions={transactions.filter(t => t.type === 'fixed')}
                    type="fixed"
                    onAdd={(data) => handleAdd('fixed', data)}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default FinancesPage;

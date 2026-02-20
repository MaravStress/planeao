import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import '../styles/Finances.css';
import type { Transaction, Currency, RecurringExpense } from '../types/finances';
import FinanceHeader from '../components/finances/FinanceHeader';
import FinanceChart from '../components/finances/FinanceChart';
import FinanceSection from '../components/finances/FinanceSection';
import AddTransactionModal from '../components/finances/AddTransactionModal';
import RecurringExpensesModal from '../components/finances/RecurringExpensesModal';
import { STORAGE_KEYS, loadFromLocal, saveToLocal } from '../context/LocalSave';

const FinancesPage: React.FC = () => {
    // State
    const [transactions, setTransactions] = useState<Transaction[]>(() =>
        loadFromLocal(STORAGE_KEYS.FINANCE_TRANSACTIONS, [
            { id: '1', title: 'Salary', amount: 2000, currency: 'USD', date: '2023-10-05', type: 'income' },
            { id: '2', title: 'Rent', amount: 800, currency: 'USD', type: 'fixed' },
            { id: '3', title: 'Groceries', amount: 3000, currency: 'DOP', date: '2023-10-10', type: 'variable' },
        ])
    );

    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() =>
        loadFromLocal(STORAGE_KEYS.FINANCE_RECURRING, [])
    );

    // Default 58.5, editable in header
    const [exchangeRate, setExchangeRate] = useState<number>(() =>
        loadFromLocal(STORAGE_KEYS.FINANCE_EXCHANGE_RATE, 58.5)
    );

    // Persistence Effects
    useEffect(() => {
        saveToLocal(STORAGE_KEYS.FINANCE_TRANSACTIONS, transactions);
    }, [transactions]);

    useEffect(() => {
        saveToLocal(STORAGE_KEYS.FINANCE_RECURRING, recurringExpenses);
    }, [recurringExpenses]);

    useEffect(() => {
        saveToLocal(STORAGE_KEYS.FINANCE_EXCHANGE_RATE, exchangeRate);
    }, [exchangeRate]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'variable' | 'fixed' | 'recurring-income'>('income');

    const handleOpenModal = (type: 'income' | 'variable' | 'fixed' | 'recurring-income') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleAdd = (data: { title: string, amount: number, currency: Currency, date?: string }) => {
        const newTx: Transaction = {
            id: uuidv4(),
            ...data,
            type: modalType
        };
        setTransactions([...transactions, newTx]);
    };

    const handleDelete = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const handleAddRecurring = (expense: RecurringExpense) => {
        const newTx: Transaction = {
            id: uuidv4(),
            title: expense.title,
            amount: expense.amount,
            currency: expense.currency,
            date: new Date().toISOString().split('T')[0],
            type: 'variable' // Recurring expenses are typically variable in this context
        };
        setTransactions([...transactions, newTx]);
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
                    exchangeRate={exchangeRate}
                    onOpenAddModal={() => handleOpenModal('income')}
                    onDelete={handleDelete}
                />

                {/* Block 3: Variable Expenses */}
                <FinanceSection
                    title={<><ArrowDownRight size={18} color="var(--color-warning)" style={{ display: 'inline', marginRight: '5px' }} /> Gastos Variables</>}
                    transactions={transactions.filter(t => t.type === 'variable')}
                    type="variable"
                    exchangeRate={exchangeRate}
                    recurringExpenses={recurringExpenses}
                    onOpenAddModal={() => handleOpenModal('variable')}
                    onAddRecurring={handleAddRecurring}
                    onDelete={handleDelete}
                    onConfigure={() => setIsRecurringModalOpen(true)}
                />

                {/* Block 4: Recurring Income */}
                <FinanceSection
                    title={<><ArrowUpRight size={18} color="#4ade80" style={{ display: 'inline', marginRight: '5px' }} /> Ingresos Recurrentes</>}
                    transactions={transactions.filter(t => t.type === 'recurring-income')}
                    type="recurring-income"
                    exchangeRate={exchangeRate}
                    onOpenAddModal={() => handleOpenModal('recurring-income')}
                    onDelete={handleDelete}
                />

                {/* Block 5: Fixed Expenses */}
                <FinanceSection
                    title={<><ArrowRight size={18} color="var(--color-danger)" style={{ display: 'inline', marginRight: '5px' }} /> Gastos Fijos</>}
                    transactions={transactions.filter(t => t.type === 'fixed')}
                    type="fixed"
                    exchangeRate={exchangeRate}
                    onOpenAddModal={() => handleOpenModal('fixed')}
                    onDelete={handleDelete}
                />
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAdd}
                type={modalType}
            />

            <RecurringExpensesModal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                recurringExpenses={recurringExpenses}
                onUpdateRecurring={setRecurringExpenses}
            />
        </div>
    );
};

export default FinancesPage;

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Currency } from '../../types/finances';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { title: string, amount: number, currency: Currency, date?: string }) => void;
    type: 'income' | 'variable' | 'fixed' | 'recurring-income';
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd, type }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [date, setDate] = useState(type !== 'fixed' && type !== 'recurring-income' ? new Date().toISOString().split('T')[0] : undefined);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title || !amount) return;

        onAdd({
            title,
            amount: parseFloat(amount),
            currency,
            date
        });

        // Reset and close
        setTitle('');
        setAmount('');
        setCurrency('USD');
        setDate(type !== 'fixed' && type !== 'recurring-income' ? new Date().toISOString().split('T')[0] : undefined);
        onClose();
    };

    // ... (rest of the component)

    const getTitle = () => {
        switch (type) {
            case 'income': return 'Ingreso';
            case 'variable': return 'Gasto Variable';
            case 'fixed': return 'Gasto Fijo';
            case 'recurring-income': return 'Ingreso Recurrente';
            default: return 'Transacción';
        }
    };

    const getBtnClass = () => {
        switch (type) {
            case 'income':
            case 'recurring-income':
                return 'btn-income';
            case 'variable': return 'btn-variable';
            case 'fixed': return 'btn-fixed';
            default: return '';
        }
    };

    // In Render:
    // <h2 ...>Agregar {getTitle()}</h2>
    // ...
    // {type !== 'fixed' && type !== 'recurring-income' && (... date input ...)}
    // ...
    // className={getBtnClass()}

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{
                width: '400px',
                maxWidth: '90%',
                padding: '2rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-text)' }}>
                    Agregar {getTitle()}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Título</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Sueldo, Supermercado..."
                            autoFocus
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Monto</label>
                            <input
                                type="number"
                                className="form-input"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ width: '100px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Moneda</label>
                            <select
                                className="form-select"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as Currency)}
                                style={{ width: '100%' }}
                            >
                                <option value="USD">USD</option>
                                <option value="DOP">DOP</option>
                            </select>
                        </div>
                    </div>

                    {type !== 'fixed' && type !== 'recurring-income' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Fecha</label>
                            <input
                                type="date"
                                className="form-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            color: 'var(--color-text)',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className={getBtnClass()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 'bold'
                        }}
                    >
                        <Save size={18} />
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTransactionModal;

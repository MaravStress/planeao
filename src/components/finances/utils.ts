import type { Currency } from '../../types/finances';

export const convertToUSD = (amount: number, currency: Currency, exchangeRate: number) => {
    return currency === 'USD' ? amount : amount / exchangeRate;
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

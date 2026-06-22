import type { Order } from '../types/work';

export type OrderStatus = 'overdue' | 'due-soon' | 'active' | 'future';

/**
 * Determines the status of an order based on the current date, start date, and end date.
 */
export const getOrderStatus = (order: Order, isPaused?: boolean): OrderStatus => {
    if (isPaused) {
        return 'future';
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const start = new Date(order.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(order.endDate);
    end.setHours(0, 0, 0, 0);

    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = (end.getTime() - now.getTime()) / oneDay;

    if (now > end) {
        return 'overdue';
    }
    if (diffDays <= 1 && diffDays >= 0) {
        return 'due-soon';
    }
    if (now >= start) {
        return 'active';
    }
    return 'future';
};

/**
 * Returns the RGBA color string associated with an OrderStatus.
 */
export const getOrderStatusColor = (status: OrderStatus, isTimeline = false): string => {
    const opacity = isTimeline ? '0.4' : '0.25';

    switch (status) {
        case 'overdue':
            return `rgba(239, 68, 68, ${opacity})`; // Red
        case 'due-soon':
            return `rgba(234, 179, 8, ${opacity})`; // Yellow
        case 'active':
            return `rgba(59, 130, 246, ${opacity})`; // Blue
        case 'future':
        default:
            return isTimeline ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)';
    }
};

import React from 'react';
import type { Order } from '../../types/work';
import GoogleIcon from '../GoogleIcon';
import { getOrderStatus, getOrderStatusColor } from '../../utils/workColors';

interface OrderCardProps {
    order: Order;
    isPaused?: boolean;
    onToggleCheck?: (orderId: string, itemId: string) => void;
    onEdit: (order: Order) => void;
    onArchive: (orderId: string) => void;
    onStatusChange?: (order: Order, status: 'todo' | 'in_progress' | 'done') => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isPaused, onEdit, onArchive, onStatusChange }) => {
    const getBackgroundColor = () => {
        const status = getOrderStatus(order, isPaused);
        return getOrderStatusColor(status, false);
    };

    const currentStatus = order.status || 'todo';

    return (
        <div className="order-card" style={{
            padding: '1rem',
            marginTop: '1rem',
            backgroundColor: getBackgroundColor(),
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-md)',
            position: 'relative',
            transition: 'background-color 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingRight: '1.5rem' }}>
                <h4 style={{ margin: 0 }}>{order.title}</h4>
                <button
                    onClick={() => onEdit(order)}
                    className="icon-button"
                    style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        opacity: 0.7,
                        cursor: 'pointer',
                        background: 'transparent',
                        border: 'none',
                        color: 'white'
                    }}
                    title="Editar Pedido"
                >
                    <GoogleIcon name="edit" size={14} />
                </button>
            </div>

            {/* Status and Dates */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                {!isPaused && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        <GoogleIcon name="calendar_today" size={14} />
                        <span>{new Date(order.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                    </div>
                )}

                {onStatusChange && (
                    <select
                        value={currentStatus}
                        onChange={(e) => onStatusChange(order, e.target.value as 'todo' | 'in_progress' | 'done')}
                        style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <option value="todo" style={{ color: 'black' }}>Pendiente</option>
                        <option value="in_progress" style={{ color: 'black' }}>En Proceso</option>
                        <option value="done" style={{ color: 'black' }}>Completado</option>
                    </select>
                )}
            </div>

            {/* Archive / Delete Button if completed */}
            {currentStatus === 'done' && (
                <button
                    onClick={() => onArchive(order.id)}
                    style={{
                        width: '100%',
                        marginTop: '0.75rem',
                        padding: '0.4rem',
                        backgroundColor: 'var(--color-primary)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                    }}
                >
                    <GoogleIcon name="check" size={16} />
                    Completar y Archivar
                </button>
            )}
        </div>
    );
};

export default OrderCard;

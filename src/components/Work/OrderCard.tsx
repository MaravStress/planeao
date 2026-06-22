import React from 'react';
import type { Order, ChecklistItem } from '../../types/work';
import GoogleIcon from '../GoogleIcon';
import { getOrderStatus, getOrderStatusColor } from '../../utils/workColors';

interface OrderCardProps {
    order: Order;
    isPaused?: boolean;
    onToggleCheck: (orderId: string, itemId: string) => void;
    onEdit: (order: Order) => void;
    onArchive: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isPaused, onToggleCheck, onEdit, onArchive }) => {
    // Calculate progress
    const totalItems = order.checklist.length;
    const completedItems = order.checklist.filter(item => item.completed).length;
    const progress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

    // Calculate status color
    const getBackgroundColor = () => {
        const status = getOrderStatus(order, isPaused);
        return getOrderStatusColor(status, false);
    };

    return (
        <div className="order-card" style={{
            padding: '1rem',
            marginTop: '1rem',
            backgroundColor: getBackgroundColor(),
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            transition: 'background-color 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingRight: '1.5rem' }}>
                <h4 style={{ margin: 0 }}>{order.title}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {completedItems}/{totalItems}
                </div>
                <button
                    onClick={() => onEdit(order)}
                    className="icon-button"
                    style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        opacity: 0.5,
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

            {/* Progress Bar */}
            <div style={{
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                marginBottom: '1rem',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: 'var(--color-secondary)',
                    transition: 'width 0.3s ease'
                }} />
            </div>

            {/* Dates */}
            {!isPaused && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '1rem'
                }}>
                    <GoogleIcon name="calendar_today" size={14} />
                    <span>{new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}</span>
                </div>
            )}

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {order.checklist.map((item: ChecklistItem) => (
                    <div
                        key={item.id}
                        onClick={() => onToggleCheck(order.id, item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            opacity: item.completed ? 0.6 : 1
                        }}
                    >
                        <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `2px solid ${item.completed ? 'var(--color-secondary)' : 'rgba(255,255,255,0.3)'}`,
                            backgroundColor: item.completed ? 'var(--color-secondary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}>
                            {item.completed && <GoogleIcon name="check" size={12} style={{ color: 'white' }} />}
                        </div>
                        <span style={{
                            fontSize: '0.9rem',
                            textDecoration: item.completed ? 'line-through' : 'none'
                        }}>
                            {item.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* Archive Button */}
            {progress === 100 && (
                <button
                    onClick={() => onArchive(order.id)}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-primary)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
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

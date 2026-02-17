import React from 'react';
import type { Order, ChecklistItem } from '../../types/work';
import { Check, Calendar as CalendarIcon, Pencil } from 'lucide-react';

interface OrderCardProps {
    order: Order;
    onToggleCheck: (orderId: string, itemId: string) => void;
    onEdit: (order: Order) => void;
    onArchive: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onToggleCheck, onEdit, onArchive }) => {
    // Calculate progress
    const totalItems = order.checklist.length;
    const completedItems = order.checklist.filter(item => item.completed).length;
    const progress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

    // Calculate status color
    const getBackgroundColor = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to start of day

        const start = new Date(order.startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(order.endDate);
        end.setHours(0, 0, 0, 0);

        // Calculate difference in days
        // If end is today, diff is 0. If end is tomorrow, diff is 1.
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = (end.getTime() - now.getTime()) / oneDay;

        // Priority 1: Past deadline -> Reddish
        if (now > end) {
            return 'rgba(239, 68, 68, 0.25)'; // Red
        }

        // Priority 2: 1 day left (today or tomorrow is the deadline) -> Yellowish
        if (diffDays <= 1 && diffDays >= 0) {
            return 'rgba(234, 179, 8, 0.25)'; // Yellow
        }

        // Priority 3: Active (Start date passed or is today) -> Bluish
        if (now >= start) {
            return 'rgba(59, 130, 246, 0.25)'; // Blue
        }

        // Priority 4: Default (Future start date)
        return 'rgba(255, 255, 255, 0.05)';
    };

    return (
        <div className="glass-panel" style={{
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
                    <Pencil size={14} />
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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                marginBottom: '1rem'
            }}>
                <CalendarIcon size={14} />
                <span>{new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}</span>
            </div>

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
                            {item.completed && <Check size={12} color="white" />}
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
                    <Check size={16} />
                    Completar y Archivar
                </button>
            )}
        </div>
    );
};

export default OrderCard;

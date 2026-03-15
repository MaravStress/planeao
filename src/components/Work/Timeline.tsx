import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useWork } from '../../context/WorkContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Order } from '../../types/work';

// Timeline width in days
const DAYS_IN_VIEW = 14;

interface DragState {
    order: Order;
    type: 'left' | 'right' | 'center';
    initialX: number;
    initialStartDate: Date;
    initialEndDate: Date;
}

interface TimelineProps {
    onEditOrder?: (order: Order) => void;
}

const Timeline: React.FC<TimelineProps> = ({ onEditOrder }) => {
    const { projects, updateOrder } = useWork();

    const [viewStartDate, setViewStartDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setDate(today.getDate() - 2);
        return today;
    });

    // Drag and drop state
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
    const previewOrderRef = useRef<Order | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const updatePreview = (order: Order | null) => {
        setPreviewOrder(order);
        previewOrderRef.current = order;
    };

    const shiftDates = (days: number) => {
        setViewStartDate(prev => {
            const next = new Date(prev);
            next.setDate(next.getDate() + days);
            return next;
        });
    };

    const resetToToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setDate(today.getDate() - 2);
        setViewStartDate(today);
    };

    useEffect(() => {
        if (!dragState) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!gridRef.current) return;
            const gridRect = gridRef.current.getBoundingClientRect();
            const pixelsPerDay = gridRect.width / DAYS_IN_VIEW;

            const deltaX = e.clientX - dragState.initialX;
            const deltaDays = Math.round(deltaX / pixelsPerDay);

            const newOrder = { ...dragState.order };
            const msPerDay = 24 * 60 * 60 * 1000;

            if (dragState.type === 'left') {
                const newStart = new Date(dragState.initialStartDate);
                newStart.setDate(newStart.getDate() + deltaDays);

                // Cap at endDate - 1 day so it doesn't invert
                if (newStart >= dragState.initialEndDate) {
                    newStart.setTime(dragState.initialEndDate.getTime() - msPerDay);
                }
                newOrder.startDate = newStart.toISOString();

            } else if (dragState.type === 'right') {
                const newEnd = new Date(dragState.initialEndDate);
                newEnd.setDate(newEnd.getDate() + deltaDays);

                // Cap at startDate + 1 day
                if (newEnd <= dragState.initialStartDate) {
                    newEnd.setTime(dragState.initialStartDate.getTime() + msPerDay);
                }
                newOrder.endDate = newEnd.toISOString();

            } else if (dragState.type === 'center') {
                const newStart = new Date(dragState.initialStartDate);
                newStart.setDate(newStart.getDate() + deltaDays);

                const newEnd = new Date(dragState.initialEndDate);
                newEnd.setDate(newEnd.getDate() + deltaDays);

                newOrder.startDate = newStart.toISOString();
                newOrder.endDate = newEnd.toISOString();
            }

            updatePreview(newOrder);
        };

        const handleMouseUp = () => {
            if (previewOrderRef.current) {
                updateOrder(previewOrderRef.current.projectId, previewOrderRef.current);
            }
            setDragState(null);
            updatePreview(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, updateOrder]);

    const allOrders = useMemo(() => {
        return projects.flatMap(p => p.orders || []);
    }, [projects]);

    const daysArray = useMemo(() => {
        return Array.from({ length: DAYS_IN_VIEW }).map((_, i) => {
            const d = new Date(viewStartDate);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [viewStartDate]);

    const getStatusColor = (order: Order) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const start = new Date(order.startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(order.endDate);
        end.setHours(0, 0, 0, 0);

        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = (end.getTime() - now.getTime()) / oneDay;

        if (now > end) return 'rgba(239, 68, 68, 0.4)'; // Red
        if (diffDays <= 1 && diffDays >= 0) return 'rgba(234, 179, 8, 0.4)'; // Yellow
        if (now >= start) return 'rgba(59, 130, 246, 0.4)'; // Blue

        return 'rgba(255, 255, 255, 0.1)'; // Default
    };

    return (
        <div className="glass-panel" style={{
            width: '100%',
            marginBottom: '1.5rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowX: 'auto',
            // Prevent text selection while dragging
            userSelect: dragState ? 'none' : 'auto'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={20} color="var(--color-secondary)" />
                    <h3 style={{ margin: 0 }}>Timeline ({DAYS_IN_VIEW} días)</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => shiftDates(-7)}
                        className="glass-button"
                        style={{ display: 'flex', alignItems: 'center', color: 'white', padding: '0.5rem' }}
                        title="Retroceder 1 semana"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={resetToToday}
                        className="glass-button"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'white', margin: '0 0.5rem' }}
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => shiftDates(7)}
                        className="glass-button"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', color: 'white' }}
                        title="Avanzar 1 semana"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div style={{
                minWidth: '800px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '1rem'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${DAYS_IN_VIEW}, 1fr)`,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '0.5rem',
                    marginBottom: '1rem'
                }}>
                    {daysArray.map((day, i) => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        return (
                            <div key={i} style={{
                                textAlign: 'center',
                                fontSize: '0.8rem',
                                color: isToday ? 'red' : (isWeekend ? 'var(--color-text-muted)' : 'white'),
                                fontWeight: isToday ? 'bold' : 'normal',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.2rem'
                            }}>
                                <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>
                                    {day.toLocaleDateString('es', { weekday: 'short' })}
                                </span>
                                <span>{day.getDate()}</span>
                            </div>
                        );
                    })}
                </div>

                <div
                    ref={gridRef}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        position: 'relative',
                        // Minimum height so empty Timeline still displays grid
                        minHeight: '100px'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${DAYS_IN_VIEW}, 1fr)`,
                        pointerEvents: 'none',
                        zIndex: 0
                    }}>
                        {Array.from({ length: DAYS_IN_VIEW }).map((_, i) => (
                            <div key={i} style={{ borderRight: '1px dashed rgba(255,255,255,0.05)' }} />
                        ))}
                    </div>

                    {allOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', zIndex: 1 }}>
                            No hay trabajos registrados.
                        </div>
                    ) : (
                        allOrders.map(baseOrder => {
                            const isDraggingThis = dragState?.order.id === baseOrder.id;
                            const displayOrder = (isDraggingThis && previewOrder) ? previewOrder : baseOrder;

                            const orderStart = new Date(displayOrder.startDate);
                            orderStart.setHours(0, 0, 0, 0);
                            const orderEnd = new Date(displayOrder.endDate);
                            orderEnd.setHours(0, 0, 0, 0);

                            const msPerDay = 24 * 60 * 60 * 1000;
                            const startDiff = Math.round((orderStart.getTime() - viewStartDate.getTime()) / msPerDay);
                            const endDiff = Math.round((orderEnd.getTime() - viewStartDate.getTime()) / msPerDay);

                            const colStart = startDiff + 1;
                            const colEnd = endDiff + 2;

                            if (colEnd <= 1 || colStart >= DAYS_IN_VIEW + 2) {
                                return null;
                            }

                            const clampedColStart = Math.max(1, colStart);
                            const clampedColEnd = Math.min(DAYS_IN_VIEW + 1, colEnd);

                            const isCutLeft = colStart < 1;
                            const isCutRight = colEnd > DAYS_IN_VIEW + 1;

                            return (
                                <div key={baseOrder.id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${DAYS_IN_VIEW}, 1fr)`,
                                    position: 'relative',
                                    zIndex: isDraggingThis ? 10 : 1
                                }}>
                                    <div
                                        onMouseDown={(e) => {
                                            if (e.button !== 0) return;
                                            e.stopPropagation();
                                            setDragState({
                                                order: displayOrder,
                                                type: 'center',
                                                initialX: e.clientX,
                                                initialStartDate: new Date(displayOrder.startDate),
                                                initialEndDate: new Date(displayOrder.endDate)
                                            });
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            if (onEditOrder) {
                                                onEditOrder(displayOrder);
                                            }
                                        }}
                                        style={{
                                            gridColumnStart: clampedColStart,
                                            gridColumnEnd: clampedColEnd,
                                            backgroundColor: getStatusColor(displayOrder),
                                            padding: '0.3rem 0.5rem',
                                            borderRadius: `${isCutLeft ? '0' : '4px'} ${isCutRight ? '0' : '4px'} ${isCutRight ? '0' : '4px'} ${isCutLeft ? '0' : '4px'}`,
                                            fontSize: '0.8rem',
                                            color: 'white',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderLeft: isCutLeft ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                            borderRight: isCutRight ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                            boxShadow: isDraggingThis ? '0 8px 16px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: dragState ? (isDraggingThis ? 'grabbing' : 'default') : 'grab',
                                            position: 'relative',
                                            transform: isDraggingThis ? 'scale(1.02)' : 'scale(1)',
                                            transition: dragState ? 'none' : 'transform 0.2s',
                                        }} title={`${displayOrder.title} (${orderStart.toLocaleDateString()} - ${orderEnd.toLocaleDateString()})`}>

                                        {/* Left Drag Handle */}
                                        {!isCutLeft && (
                                            <div
                                                onMouseDown={(e) => {
                                                    if (e.button !== 0) return;
                                                    e.stopPropagation();
                                                    setDragState({
                                                        order: displayOrder,
                                                        type: 'left',
                                                        initialX: e.clientX,
                                                        initialStartDate: new Date(displayOrder.startDate),
                                                        initialEndDate: new Date(displayOrder.endDate)
                                                    });
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '6px',
                                                    cursor: 'ew-resize',
                                                    zIndex: 2,
                                                    backgroundColor: 'rgba(255,255,255,0.1)' // subtle hover hint could be added here
                                                }}
                                                title="Ajustar fecha de inicio"
                                            />
                                        )}

                                        <div style={{ opacity: 0.9, textOverflow: 'ellipsis', overflow: 'hidden', pointerEvents: 'none', marginLeft: '6px', marginRight: '6px' }}>
                                            {isCutLeft && <ChevronLeft size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} />}
                                            {displayOrder.title}
                                            {isCutRight && <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '2px' }} />}
                                        </div>

                                        {/* Right Drag Handle */}
                                        {!isCutRight && (
                                            <div
                                                onMouseDown={(e) => {
                                                    if (e.button !== 0) return;
                                                    e.stopPropagation();
                                                    setDragState({
                                                        order: displayOrder,
                                                        type: 'right',
                                                        initialX: e.clientX,
                                                        initialStartDate: new Date(displayOrder.startDate),
                                                        initialEndDate: new Date(displayOrder.endDate)
                                                    });
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '6px',
                                                    cursor: 'ew-resize',
                                                    zIndex: 2,
                                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                                }}
                                                title="Ajustar fecha final"
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timeline;

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

interface SortableItemProps {
    id: string;
    text: string;
    onDelete: (id: string) => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, text, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: '0.5rem',
        padding: '0.5rem',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        touchAction: 'none' // Important for dnd-kit on mobile/touch
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div
                {...attributes}
                {...listeners}
                style={{ cursor: 'grab', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
            >
                <GripVertical size={16} color="rgba(255,255,255,0.5)" />
            </div>

            <div style={{ flex: 1 }}>{text}</div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                }}
                className="icon-button"
                style={{
                    color: '#ff6b6b',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem'
                }}
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
};

import type { Exposure } from '../../db';
import { GripVertical, CheckCircle, Circle } from 'lucide-react';
import { Card } from '../ui/Card';

interface LadderItemProps {
    exposure: Exposure;
    onSelect: (exposure: Exposure) => void;
    isDragging?: boolean;
}

export const LadderItem = ({ exposure, onSelect, isDragging = false }: LadderItemProps) => {
    // Elegant SUDS coloring using OKLCH logic
    const getSUDSStyles = (suds: number) => {
        if (suds <= 3) return 'bg-(--anchor-secondary)/10 text-(--anchor-secondary) border-(--anchor-secondary)/20';
        if (suds <= 6) return 'bg-(--anchor-accent)/10 text-(--anchor-accent) border-(--anchor-accent)/20';
        return 'bg-(--anchor-danger)/10 text-(--anchor-danger) border-(--anchor-danger)/20';
    };

    const isCompleted = exposure.completedCount > 0;

    return (
        <Card
            hoverable
            onClick={() => onSelect(exposure)}
            className={`
                flex items-center gap-5 cursor-pointer border border-transparent
                ${isDragging ? 'opacity-40 scale-95 shadow-lg' : ''}
                ${isCompleted ? 'border-l-4 border-(--anchor-secondary)' : ''}
                hover:border-(--anchor-primary-muted)/20 group transition-all duration-300
            `}
        >
            {/* Drag Handle - More organic feel */}
            <div className="cursor-grab active:cursor-grabbing text-(--anchor-text-muted) opacity-40 group-hover:opacity-100 transition-opacity">
                <GripVertical size={20} />
            </div>

            {/* Completion Status - Intentional iconography */}
            <div className="flex-shrink-0">
                {isCompleted ? (
                    <div className="p-1 bg-(--anchor-secondary)/20 rounded-full animate-in zoom-in-50 duration-500">
                        <CheckCircle size={24} className="text-(--anchor-secondary)" />
                    </div>
                ) : (
                    <div className="p-1 bg-(--anchor-bg) rounded-full">
                        <Circle size={24} className="text-(--anchor-text-muted) opacity-30" />
                    </div>
                )}
            </div>

            {/* Content - Visual Storytelling */}
            <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-xl text-(--anchor-text) truncate group-hover:text-(--anchor-primary) transition-colors">
                    {exposure.triggerDescription}
                </h3>
                {exposure.completedCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-(--anchor-secondary)" />
                        <p className="text-sm font-medium text-(--anchor-text-muted)">
                            {exposure.completedCount} {exposure.completedCount === 1 ? 'conquest' : 'conquests'}
                        </p>
                    </div>
                )}
            </div>

            {/* SUDS Badge - Refined tactile element */}
            <div className={`px-4 py-2 rounded-(--radius-md) border font-mono font-bold text-sm shadow-sm ${getSUDSStyles(exposure.sudsCurrent)}`}>
                {exposure.sudsCurrent.toFixed(1)}
            </div>
        </Card>
    );
};

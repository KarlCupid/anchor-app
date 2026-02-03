import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl'
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--anchor-text)]/40 backdrop-blur-[4px] animate-in fade-in duration-500"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className={`
                    relative
                    bg-[var(--anchor-surface)] rounded-[var(--radius-lg)]
                    shadow-2xl border border-[var(--anchor-border)]
                    ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto
                    animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-[var(--ease-squish)]
                `.trim()}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                <div className="sticky top-0 z-10 bg-[var(--anchor-surface)]/80 backdrop-blur-md px-8 py-6 flex items-center justify-between border-b border-[var(--anchor-border)]">
                    {title ? (
                        <h2 id="modal-title" className="text-2xl font-display font-semibold tracking-tight text-[var(--anchor-text)]">{title}</h2>
                    ) : <div />}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full hover:bg-[var(--anchor-danger)] hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </Button>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
            // Prevent scrolling on body when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            // restore scrolling
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl'
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[var(--anchor-text)]/20 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className={`
                    bg-[var(--anchor-surface)]/80 backdrop-blur-xl
                    rounded-[var(--radius-lg)]
                    shadow-[var(--shadow-lg)]
                    border border-[var(--anchor-border)]/50
                    ${sizeClasses[size]} w-full max-h-[85dvh] flex flex-col
                    animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-[var(--ease-out-expo)]
                `.trim()}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                <div className="flex-shrink-0 sticky top-0 z-10 px-6 py-4 md:px-8 md:py-6 flex items-center justify-between">
                    {title ? (
                        <h2 id="modal-title" className="text-2xl md:text-3xl font-display font-bold tracking-tight text-[var(--anchor-text)] line-clamp-1">
                            {title}
                        </h2>
                    ) : <div />}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="flex-shrink-0 rounded-full bg-[var(--anchor-surface)]/50 hover:bg-[var(--anchor-danger)]/10 hover:text-[var(--anchor-danger)] transition-all ml-4"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </Button>
                </div>
                <div className="px-6 pb-6 md:px-8 md:pb-8 overflow-y-auto overscroll-contain">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

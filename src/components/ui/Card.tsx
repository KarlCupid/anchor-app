import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outline' | 'flat';
    hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ children, className = '', variant = 'default', hoverable = false, ...props }, ref) => {
        const variants = {
            default: `
                bg-[var(--anchor-surface)] 
                shadow-[var(--shadow-sm)] border border-[var(--anchor-border)]
            `,
            glass: `
                glass-panel border-white/50
            `,
            outline: `
                bg-transparent border border-[var(--anchor-border)]
            `,
            flat: `
                bg-[var(--anchor-surface-secondary)] border-none
            `
        };

        return (
            <div
                ref={ref}
                className={`
                    rounded-[var(--radius-md)]
                    ${variants[variant].replace(/\s+/g, ' ')}
                    ${hoverable ? 'transition-all duration-300 ease-[var(--ease-out-expo)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1' : ''}
                    ${className}
                `.trim()}
                {...props}
            >
                <div className="p-6 md:p-8">
                    {children}
                </div>
            </div>
        );
    }
);

Card.displayName = 'Card';

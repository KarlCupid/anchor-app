import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    rounded?: 'full' | 'default';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', isLoading = false, rounded = 'default', className = '', children, disabled, ...props }, ref) => {

        // Base physics and layout
        const baseClasses = `
            relative inline-flex items-center justify-center 
            font-medium tracking-wide transition-all duration-300 ease-[var(--ease-squish)]
            border border-transparent select-none overflow-hidden
            disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
            active:scale-[0.96] hover:-translate-y-[2px]
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--anchor-primary)]
        `;

        const variantClasses = {
            primary: `
                bg-[var(--anchor-primary)] text-[var(--anchor-primary-foreground)]
                shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
                hover:brightness-110
                after:absolute after:inset-0 after:bg-white/10 after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100
            `,
            secondary: `
                bg-[var(--anchor-secondary)] text-[var(--anchor-secondary-foreground)]
                shadow-sm hover:shadow-md hover:bg-[oklch(from_var(--anchor-secondary)_l_c_h_/_0.9)]
            `,
            danger: `
                bg-[var(--anchor-danger)] text-white
                shadow-sm hover:shadow-md hover:brightness-110
            `,
            ghost: `
                bg-transparent text-[var(--anchor-text)]
                hover:bg-[var(--anchor-surface-secondary)]
                hover:translate-y-0
            `,
            outline: `
                bg-transparent border-[var(--anchor-border)] text-[var(--anchor-text)]
                hover:bg-[var(--anchor-surface)] hover:border-[var(--anchor-primary-muted)]
                hover:shadow-sm
            `
        };

        const sizeClasses = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-11 px-6 text-sm',
            lg: 'h-14 px-8 text-base',
            icon: 'h-11 w-11 p-2'
        };

        const radiusClasses = {
            default: 'rounded-[var(--radius-md)]',
            full: 'rounded-full'
        };

        return (
            <button
                ref={ref}
                className={`
                    ${baseClasses.replace(/\s+/g, ' ')} 
                    ${variantClasses[variant].replace(/\s+/g, ' ')} 
                    ${sizeClasses[size]} 
                    ${radiusClasses[rounded]}
                    ${className}
                `.trim()}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </span>
                )}

                <span className={`flex items-center gap-2 ${isLoading ? 'invisible' : ''} z-10`}>
                    {children}
                </span>

                {/* Subtle highlight for gloss effect on primary/secondary */}
                {(variant === 'primary' || variant === 'secondary') && (
                    <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    showValue?: boolean;
    unit?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
    ({ label, showValue = true, unit = '', className = '', value, min = 1, max = 10, disabled, onChange, ...props }, ref) => {
        const numValue = Number(value) || 0;
        const percentage = ((numValue - Number(min)) / (Number(max) - Number(min))) * 100;

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <div className="flex justify-between items-baseline mb-3">
                        <label className="text-sm font-medium text-[var(--anchor-text)] font-display tracking-tight">
                            {label}
                        </label>
                        {showValue && (
                            <span className="text-xs font-semibold text-[var(--anchor-primary)] font-mono bg-[var(--anchor-primary-muted)]/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                {value}{unit}
                            </span>
                        )}
                    </div>
                )}
                <div className="relative flex items-center group py-2">
                    <input
                        ref={ref}
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        disabled={disabled}
                        onChange={onChange}
                        className="
              w-full h-3 rounded-full appearance-none cursor-pointer
              bg-[var(--anchor-surface-secondary)] shadow-inner
              transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-[var(--anchor-primary-muted)]/20
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                        style={{
                            background: `linear-gradient(to right, var(--anchor-primary) ${percentage}%, var(--anchor-surface-secondary) ${percentage}%)`,
                        }}
                        {...props}
                    />

                    <style dangerouslySetInnerHTML={{
                        __html: `
            input[type='range']::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 24px;
              height: 24px;
              background: white;
              border: 4px solid var(--anchor-primary);
              border-radius: 50%;
              cursor: grab;
              box-shadow: var(--shadow-md);
              transition: all 0.3s cubic-bezier(0.5, 1.5, 0.5, 1); /* Squish ease */
              margin-top: -2px; /* Center thumb usually */
            }
            input[type='range']::-webkit-slider-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 0 0 8px var(--anchor-primary-muted);
            }
            input[type='range']::-webkit-slider-thumb:active {
              transform: scale(0.95);
              cursor: grabbing;
              box-shadow: 0 0 0 12px var(--anchor-primary-muted);
            }
          `}} />
                </div>
                <div className="flex justify-between mt-2 px-1 text-[var(--anchor-text-muted)] text-[10px] uppercase tracking-widest font-bold">
                    <span>{min}</span>
                    <span>{max}</span>
                </div>
            </div>
        );
    }
);

Slider.displayName = 'Slider';

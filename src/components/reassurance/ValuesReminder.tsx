import { Heart } from 'lucide-react';

interface ValuesReminderProps {
    customValue?: string;
}

export const ValuesReminder = ({ customValue }: ValuesReminderProps) => {
    const defaultValue = "Resisting this urge means I'm choosing freedom over fear. I'm building the life I want, not the life OCD demands.";

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--anchor-secondary)]/10 rounded-full mb-4">
                    <Heart size={20} className="text-[var(--anchor-secondary)]" />
                    <span className="text-sm font-semibold text-[var(--anchor-secondary)]">Your Why</span>
                </div>
            </div>

            {/* Main value statement */}
            <div className="bg-gradient-to-br from-[var(--anchor-secondary)]/10 to-[var(--anchor-primary-muted)]/5 border-2 border-[var(--anchor-secondary)]/20 rounded-lg p-8">
                <blockquote className="text-xl text-[var(--anchor-text)] text-center font-medium leading-relaxed italic">
                    "{customValue || defaultValue}"
                </blockquote>
            </div>

            {/* Reflection prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--anchor-surface)] border border-[var(--anchor-border)] rounded-lg p-4">
                    <h4 className="font-semibold text-[var(--anchor-text)] mb-2">What I'm moving toward:</h4>
                    <p className="text-sm text-[var(--anchor-text-muted)]">
                        A life where I trust myself, make my own choices, and don't need constant reassurance.
                    </p>
                </div>
                <div className="bg-[var(--anchor-surface)] border border-[var(--anchor-border)] rounded-lg p-4">
                    <h4 className="font-semibold text-[var(--anchor-text)] mb-2">What I'm moving away from:</h4>
                    <p className="text-sm text-[var(--anchor-text-muted)]">
                        Being controlled by doubt, spending hours seeking reassurance, missing out on life.
                    </p>
                </div>
            </div>

            {/* Affirmation */}
            <div className="text-center">
                <p className="text-lg text-[var(--anchor-primary)] font-semibold">
                    This moment of discomfort is building my future freedom.
                </p>
            </div>
        </div>
    );
};

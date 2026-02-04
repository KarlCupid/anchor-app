import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import type { OutcomeCheckIn } from '../../db';
import { completeCheckIn } from '../../db';

interface OutcomeCheckInModalProps {
    checkIn: OutcomeCheckIn;
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const OutcomeCheckInModal = ({ checkIn, isOpen, onClose, onComplete }: OutcomeCheckInModalProps) => {
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleResponse = async (outcome: 'yes' | 'no' | 'partially' | 'unsure') => {
        setSubmitting(true);
        try {
            await completeCheckIn(checkIn.id!, outcome, notes.trim() || undefined);
            onComplete();
        } catch (error) {
            console.error('Failed to complete check-in:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="48-Hour Check-In" size="md">
            <div className="space-y-6">
                {/* Reminder of the fear */}
                <div className="bg-(--anchor-surface) p-4 rounded-lg border border-(--anchor-border)">
                    <h3 className="text-sm font-semibold text-(--anchor-text) mb-2">
                        You predicted:
                    </h3>
                    <p className="text-(--anchor-text) mb-3">
                        "{checkIn.fearedOutcome}"
                    </p>
                    <p className="text-sm text-(--anchor-text-muted)">
                        Probability: <span className="font-semibold">{checkIn.predictedProbability}%</span>
                    </p>
                </div>

                {/* The question */}
                <div>
                    <h3 className="text-lg font-semibold text-(--anchor-text) mb-4">
                        Did this actually happen?
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => handleResponse('no')}
                            disabled={submitting}
                            className="flex flex-col items-center gap-2 py-6 border-2 border-(--anchor-border) hover:border-green-500 hover:bg-green-50"
                        >
                            <CheckCircle size={32} className="text-green-600" />
                            <span className="font-semibold">No</span>
                            <span className="text-xs text-(--anchor-text-muted)">It didn't happen</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => handleResponse('yes')}
                            disabled={submitting}
                            className="flex flex-col items-center gap-2 py-6 border-2 border-(--anchor-border) hover:border-red-500 hover:bg-red-50"
                        >
                            <XCircle size={32} className="text-red-600" />
                            <span className="font-semibold">Yes</span>
                            <span className="text-xs text-(--anchor-text-muted)">It happened</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => handleResponse('partially')}
                            disabled={submitting}
                            className="flex flex-col items-center gap-2 py-6 border-2 border-(--anchor-border) hover:border-yellow-500 hover:bg-yellow-50"
                        >
                            <AlertCircle size={32} className="text-yellow-600" />
                            <span className="font-semibold">Partially</span>
                            <span className="text-xs text-(--anchor-text-muted)">Sort of</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => handleResponse('unsure')}
                            disabled={submitting}
                            className="flex flex-col items-center gap-2 py-6 border-2 border-(--anchor-border) hover:border-gray-500 hover:bg-gray-50"
                        >
                            <HelpCircle size={32} className="text-gray-600" />
                            <span className="font-semibold">Not Sure</span>
                            <span className="text-xs text-(--anchor-text-muted)">Can't tell</span>
                        </Button>
                    </div>
                </div>

                {/* Optional notes */}
                <div>
                    <label htmlFor="check-in-notes" className="block text-sm font-medium mb-2">
                        Additional notes (optional)
                    </label>
                    <textarea
                        id="check-in-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="What actually happened? Any insights?"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                        rows={3}
                    />
                </div>

                {/* Insight */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                        💡 <strong>Building evidence:</strong> Each check-in helps your brain learn that your fears are often overestimated. This is how we break the cycle of catastrophic thinking.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

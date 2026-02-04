import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';

interface AddTriggerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (trigger: {
        description: string;
        suds: number;
        fearedOutcome?: string;
        fearedProbability?: number;
    }) => void;
}

export const AddTriggerModal = ({ isOpen, onClose, onAdd }: AddTriggerModalProps) => {
    const [description, setDescription] = useState('');
    const [suds, setSuds] = useState(5);
    const [fearedOutcome, setFearedOutcome] = useState('');
    const [fearedProbability, setFearedProbability] = useState(50);

    const handleSubmit = () => {
        if (description.trim()) {
            onAdd({
                description: description.trim(),
                suds,
                fearedOutcome: fearedOutcome.trim() || undefined,
                fearedProbability: fearedOutcome.trim() ? fearedProbability : undefined
            });
            setDescription('');
            setSuds(5);
            setFearedOutcome('');
            setFearedProbability(50);
            onClose();
        }
    };

    const handleClose = () => {
        setDescription('');
        setSuds(5);
        setFearedOutcome('');
        setFearedProbability(50);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Trigger" size="md">
            <div className="space-y-6">
                {/* Description Input */}
                <div>
                    <label htmlFor="trigger-description" className="block text-sm font-medium mb-2">
                        Describe the contamination trigger
                    </label>
                    <textarea
                        id="trigger-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Touching a doorknob in a public place"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                        rows={3}
                        autoFocus
                    />
                </div>

                {/* SUDS Slider */}
                <div>
                    <Slider
                        label="Current Distress Level (SUDS)"
                        value={suds}
                        onChange={(e) => setSuds(Number(e.target.value))}
                        min={1}
                        max={10}
                    />
                    <p className="text-sm text-muted mt-2">
                        Rate how anxious this trigger makes you feel right now (1 = minimal, 10 = extreme)
                    </p>
                </div>

                {/* Feared Outcome - Expectancy Violation */}
                <div className="border-t pt-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-(--anchor-text) mb-1">
                            Expectancy Violation Tracker
                        </h3>
                        <p className="text-xs text-(--anchor-text-muted)">
                            Optional: Track what you fear will happen to build evidence against catastrophic thinking
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="feared-outcome" className="block text-sm font-medium mb-2">
                                What do you fear will happen?
                            </label>
                            <textarea
                                id="feared-outcome"
                                value={fearedOutcome}
                                onChange={(e) => setFearedOutcome(e.target.value)}
                                placeholder="e.g., I will get a staph infection and end up in the hospital"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                                rows={2}
                            />
                        </div>

                        {fearedOutcome.trim() && (
                            <div>
                                <Slider
                                    label="How likely is this to happen?"
                                    value={fearedProbability}
                                    onChange={(e) => setFearedProbability(Number(e.target.value))}
                                    min={0}
                                    max={100}
                                />
                                <p className="text-sm text-muted mt-2">
                                    {fearedProbability}% - We'll check in 48 hours after your exposure to see what actually happened
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={handleClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!description.trim()}
                        className="flex-1"
                    >
                        Add Trigger
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';

interface AddTriggerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (trigger: { description: string; suds: number }) => void;
}

export const AddTriggerModal = ({ isOpen, onClose, onAdd }: AddTriggerModalProps) => {
    const [description, setDescription] = useState('');
    const [suds, setSuds] = useState(5);

    const handleSubmit = () => {
        if (description.trim()) {
            onAdd({ description: description.trim(), suds });
            setDescription('');
            setSuds(5);
            onClose();
        }
    };

    const handleClose = () => {
        setDescription('');
        setSuds(5);
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

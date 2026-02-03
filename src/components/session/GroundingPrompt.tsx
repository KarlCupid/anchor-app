import { Heart } from 'lucide-react';

interface GroundingPromptProps {
    message: string;
}

export const GroundingPrompt = ({ message }: GroundingPromptProps) => {
    return (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500 rounded-full flex-shrink-0">
                    <Heart size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">The Sentinel</h3>
                    <p className="text-lg text-blue-800 leading-relaxed">{message}</p>
                </div>
            </div>
        </div>
    );
};

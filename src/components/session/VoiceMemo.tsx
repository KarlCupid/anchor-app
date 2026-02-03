import { useState, useRef } from 'react';
import { Mic, Square, Trash2, Check } from 'lucide-react';

interface VoiceMemoProps {
    onSave: (audioBlob: string) => void;
}

export const VoiceMemo = ({ onSave }: VoiceMemoProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                setAudioBlob(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const deleteRecording = () => {
        if (audioURL) {
            URL.revokeObjectURL(audioURL);
        }
        setAudioURL(null);
        setAudioBlob(null);
    };

    const saveRecording = async () => {
        if (!audioBlob) return;

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            onSave(base64);
            deleteRecording();
        };
        reader.readAsDataURL(audioBlob);
    };

    return (
        <div className="card bg-gradient-to-br from-amber-50 to-orange-50">
            <h3 className="heading text-lg mb-4">Voice Memo (Optional)</h3>

            {!audioURL ? (
                <div className="text-center py-6">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="btn btn-primary px-8 py-4 flex items-center gap-3 mx-auto"
                        >
                            <Mic size={24} />
                            Start Recording
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-lg font-medium">Recording...</span>
                            </div>
                            <button
                                onClick={stopRecording}
                                className="btn btn-secondary px-8 py-4 flex items-center gap-3 mx-auto"
                            >
                                <Square size={24} />
                                Stop Recording
                            </button>
                        </div>
                    )}
                    <p className="text-sm text-muted mt-4">
                        Record your thoughts about this session
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
                        <audio src={audioURL} controls className="w-full" />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={deleteRecording}
                            className="btn btn-ghost flex-1 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={20} />
                            Delete
                        </button>
                        <button
                            onClick={saveRecording}
                            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            Save Memo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

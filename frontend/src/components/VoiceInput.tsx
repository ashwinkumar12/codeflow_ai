'use client';

import React, { useState } from 'react';

interface VoiceInputProps {
    onQuery: (query: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onQuery }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string>('');

    const startRecording = async () => {
        try {
            setError('');
            
            // Check if browser supports speech recognition
            if (!('webkitSpeechRecognition' in window)) {
                throw new Error('Speech recognition is not supported in this browser');
            }

            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsRecording(true);
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update the query with both final and interim results
                onQuery(finalTranscript + interimTranscript);
            };

            recognition.onerror = (event: any) => {
                setError('Failed to recognize speech');
                console.error('Speech recognition error:', event.error);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognition.start();

            // Stop recording after 5 seconds
            setTimeout(() => {
                recognition.stop();
            }, 5000);
        } catch (err) {
            setError('Failed to access microphone');
            console.error('Recording error:', err);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <button
                onClick={startRecording}
                disabled={isRecording}
                className={`p-3 rounded-full transition-colors ${
                    isRecording
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                } text-white disabled:opacity-50`}
                title={isRecording ? "Recording..." : "Start recording"}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                </svg>
            </button>
            {error && (
                <div className="ml-4 text-red-500 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default VoiceInput;

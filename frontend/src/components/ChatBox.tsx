'use client';

import React, { useState } from 'react';

interface ChatBoxProps {
    onQuery: (query: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onQuery }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onQuery(query.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your code snippet..."
                rows={6}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 self-end"
            >
                Generate Flow
            </button>
        </form>
    );
};

export default ChatBox;

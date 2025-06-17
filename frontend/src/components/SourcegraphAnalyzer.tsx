'use client';

import React, { useState } from 'react';
import MermaidRenderer from './MermaidRenderer';
import VoiceInput from './VoiceInput';

interface SourcegraphAnalyzerProps {
    sourcegraphToken: string;
    repository: string;
}

const SourcegraphAnalyzer: React.FC<SourcegraphAnalyzerProps> = ({ sourcegraphToken, repository }) => {
    const [query, setQuery] = useState('');
    const [mermaidDiagram, setMermaidDiagram] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleVoiceInput = (text: string) => {
        setQuery(text);
    };

    const analyzeCode = async () => {
        if (!sourcegraphToken) {
            setError('Sourcegraph token is not configured');
            return;
        }

        if (!query) {
            setError('Please provide a query');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            // Use our API route to fetch from Sourcegraph
            const codyResponse = await fetch('/api/sourcegraph', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    repository
                })
            });

            if (!codyResponse.ok) {
                throw new Error('Failed to fetch code context from Cody API');
            }

            const codyData = await codyResponse.json();
            console.log({codyData});
            // Format the code context from Sourcegraph results
            const codeContext = codyData.results.map((result: any) => {
                const blob = result.blob;
                return `File: ${blob.path}\nRepository: ${blob.repository.name}\nLines ${result.startLine}-${result.endLine}:\n${result.chunkContent}`;
            }).join('\n\n');

            console.log({codeContext});
            // Send the code context to Cody AI for analysis
            const codyAnalysisResponse = await fetch('/api/cody', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'anthropic::2024-10-22::claude-3-7-sonnet-latest',
                    max_tokens: 4000,
                    messages: [
                        {
                            role: 'user',
                            content: `Analyze this code and generate a Mermaid flowchart showing the relationships and flow. Follow these rules:
1. Focus on function calls, class relationships, and data flow
2. Use proper Mermaid syntax
3. Include clear node labels and relationships
4. Use appropriate Mermaid diagram types (flowchart, classDiagram, etc.)
5. Add comments to explain complex relationships
6. Format the response with \`\`\`mermaid\`\`\` code blocks
7. Only include the Mermaid diagram in your response, no additional text

Here is the code to analyze:

${codeContext}`
                        }
                    ],
                    temperature: 0.5
                })
            });

            if (!codyAnalysisResponse.ok) {
                throw new Error('Failed to generate diagram');
            }

            const codyAnalysisData = await codyAnalysisResponse.json();
            const content = codyAnalysisData.choices[0].message.content;

            // Extract the Mermaid diagram
            const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)\n```/);
            if (mermaidMatch) {
                setMermaidDiagram(mermaidMatch[1]);
            } else {
                throw new Error('No Mermaid diagram found in response');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="relative">
                    <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                        Query
                    </label>
                    <div className="flex gap-2">
                        <textarea
                            id="query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., Show me the call graph for the main function"
                            rows={3}
                            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex items-end">
                            <VoiceInput onQuery={handleVoiceInput} />
                        </div>
                    </div>
                </div>

                <button
                    onClick={analyzeCode}
                    disabled={isLoading || !query}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? 'Analyzing...' : 'Generate Diagram'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {mermaidDiagram && (
                <div className="border rounded p-4 bg-white shadow-sm">
                    <MermaidRenderer diagram={mermaidDiagram} />
                </div>
            )}
        </div>
    );
};

export default SourcegraphAnalyzer;

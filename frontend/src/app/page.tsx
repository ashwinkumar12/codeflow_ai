'use client';

import React, { useState } from 'react';
import ChatBox from '../components/ChatBox';
import MermaidRenderer from '../components/MermaidRenderer';
import SourcegraphAnalyzer from '../components/SourcegraphAnalyzer';
import GitLabRepoSelector from '../components/GitLabRepoSelector';

export default function Home() {
    const [mermaidDiagram, setMermaidDiagram] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'snippet' | 'sourcegraph'>('sourcegraph');
    const [selectedRepo, setSelectedRepo] = useState<any>(null);

    // Get the tokens from environment variables
    const sourcegraphToken = process.env.NEXT_PUBLIC_SOURCEGRAPH_TOKEN;
    const gitlabToken = process.env.NEXT_PUBLIC_GITLAB_TOKEN;

    const handleQuery = async (query: string) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/cody', {
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
                            content: `You are an AI assistant that generates Mermaid flowcharts. Given a code snippet, create a flowchart showing the relationships and flow. Follow these rules:
1. Focus on function calls, class relationships, and data flow
2. Use proper Mermaid syntax
3. Include clear node labels and relationships
4. Use appropriate Mermaid diagram types (flowchart, classDiagram, etc.)
5. Add comments to explain complex relationships
6. Format the response with \`\`\`mermaid\`\`\` code blocks
7. Only include the Mermaid diagram in your response, no additional text

Here is the code snippet to analyze and generate a Mermaid flowchart for:\n\n${query}`
                        }
                    ],
                    temperature: 0.5
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate diagram');
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

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

    const handleRepoSelect = (repo: any) => {
        setSelectedRepo(repo);
    };

    return (
        <main className="min-h-screen">
            <div className="bg-[#2557A7] text-white py-4 mb-8">
                <div className="max-w-4xl mx-auto px-8">
                    <h1 className="text-3xl font-bold">
                        CodeFlow AI
                    </h1>
                </div>
            </div>
            <div className="max-w-4xl mx-auto px-8 space-y-8">
                <div className="flex border-b">
                    <button
                        onClick={() => {
                            setActiveTab('sourcegraph');
                            setMermaidDiagram('');
                            setError('');
                        }}
                        className={`px-4 py-2 ${
                            activeTab === 'sourcegraph'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Repository Flow
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('snippet');
                            setMermaidDiagram('');
                            setError('');
                        }}
                        className={`px-4 py-2 ${
                            activeTab === 'snippet'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Code Snippet Flow
                    </button>
                </div>

                {activeTab === 'sourcegraph' ? (
                    <div className="space-y-4">
                        {!gitlabToken ? (
                            <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
                                Please set your GitLab token in the .env.local file:
                                <pre className="mt-2 p-2 bg-white rounded">
                                    NEXT_PUBLIC_GITLAB_TOKEN=your_token_here
                                </pre>
                            </div>
                        ) : (
                            <GitLabRepoSelector
                                gitlabToken={gitlabToken}
                                onSelect={handleRepoSelect}
                            />
                        )}
                        {selectedRepo && !sourcegraphToken ? (
                            <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
                                Please set your Sourcegraph token in the .env.local file:
                                <pre className="mt-2 p-2 bg-white rounded">
                                    NEXT_PUBLIC_SOURCEGRAPH_TOKEN=your_token_here
                                </pre>
                            </div>
                        ) : selectedRepo && (
                            <SourcegraphAnalyzer
                                sourcegraphToken={sourcegraphToken}
                                repository={selectedRepo.path_with_namespace}
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <ChatBox onQuery={handleQuery} />
                    </div>
                )}

                {isLoading && (
                    <div className="text-center text-gray-600">
                        Generating diagram...
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {mermaidDiagram && (
                    <div className="border rounded p-4">
                        <MermaidRenderer diagram={mermaidDiagram} />
                    </div>
                )}
            </div>
        </main>
    );
}

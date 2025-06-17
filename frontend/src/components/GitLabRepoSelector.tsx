'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';

interface Repository {
    id: number;
    name: string;
    path_with_namespace: string;
    web_url: string;
}

interface GitLabRepoSelectorProps {
    onSelect: (repo: Repository) => void;
    gitlabToken: string;
}

const GitLabRepoSelector: React.FC<GitLabRepoSelectorProps> = ({ onSelect, gitlabToken }) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadOptions = useCallback(async (inputValue: string) => {
        if (!gitlabToken) {
            setError('GitLab token is not configured');
            return [];
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/gitlab/repositories?search=${encodeURIComponent(inputValue)}`, {
                headers: {
                    'Authorization': `Bearer ${gitlabToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch repositories: ${response.status}`);
            }

            const data = await response.json();
            return data.map((repo: Repository) => ({
                value: repo,
                label: repo.path_with_namespace
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repositories';
            setError(errorMessage);
            console.error('Error fetching repositories:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [gitlabToken]);

    const handleChange = (selectedOption: any) => {
        if (selectedOption) {
            onSelect(selectedOption.value);
            setError(null); // Clear error when a repository is selected
        }
    };

    if (!gitlabToken) {
        return (
            <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
                Please set your GitLab token in the .env.local file:
                <pre className="mt-2 p-2 bg-white rounded">
                    NEXT_PUBLIC_GITLAB_TOKEN=your_token_here
                </pre>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label htmlFor="repository" className="block text-sm font-medium text-gray-700">
                Search Repository
            </label>
            <AsyncSelect
                id="repository"
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                onChange={handleChange}
                placeholder="Type to search repositories..."
                noOptionsMessage={() => "No repositories found"}
                loadingMessage={() => "Loading repositories..."}
                isClearable
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                    control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: error ? '#EF4444' : base.borderColor,
                    }),
                    menu: (base) => ({
                        ...base,
                        zIndex: 9999
                    })
                }}
            />
            {error && (
                <div className="text-sm text-red-500">
                    {error}
                    {error.includes('401') && (
                        <div className="mt-1">
                            Please make sure you have the correct GitLab token with appropriate permissions.
                        </div>
                    )}
                    {error.includes('403') && (
                        <div className="mt-1">
                            Your token does not have sufficient permissions to access repositories.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GitLabRepoSelector; 
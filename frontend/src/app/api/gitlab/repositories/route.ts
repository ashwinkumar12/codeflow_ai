import { NextRequest, NextResponse } from 'next/server';

const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('search') || '';
    
    if (!authHeader) {
        return NextResponse.json(
            { error: 'Authorization header is required' },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // Build the search query
        const searchParams = new URLSearchParams({
            membership: 'true',
            per_page: '20', // Reduced from 100 to improve performance
            search: searchQuery,
            order_by: 'name',
            sort: 'asc'
        });

        const response = await fetch(
            `${GITLAB_BASE_URL}/api/v4/projects?${searchParams.toString()}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'PRIVATE-TOKEN': token,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GitLab API error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`GitLab API responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching GitLab repositories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repositories' },
            { status: 500 }
        );
    }
} 
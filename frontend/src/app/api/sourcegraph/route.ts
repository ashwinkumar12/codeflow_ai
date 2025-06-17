import { NextResponse } from 'next/server';

const CODY_CONTEXT_URL = process.env.CODY_CONTEXT_URL
const SOURCEGRAPH_TOKEN = process.env.SOURCEGRAPH_TOKEN
const REPO_URL = process.env.REPO_URL

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, repository } = body;

        console.log({query, repository});
        console.log(JSON.stringify({
            codeResultsCount: 10,
            query: query,
            repos: [{ name: repository }],
            textResultsCount: 5
        }));

        const response = await fetch(CODY_CONTEXT_URL, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Authorization": SOURCEGRAPH_TOKEN,
                "Content-Type": "application/json",
                "X-Requested-With": "ai_automation 1.0"
            },
            body: JSON.stringify({
                codeResultsCount: 10,
                query: query,
                repos: [{ name: REPO_URL + repository }],
                textResultsCount: 5
            })
        });

        const data = await response.json();
        console.log({data});
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in sourcegraph API route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch from Sourcegraph' },
            { status: 500 }
        );
    }
}

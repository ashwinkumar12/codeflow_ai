import { NextResponse } from 'next/server';

const CODY_AI_BASE_URL = process.env.CODY_AI_URL
const SOURCEGRAPH_TOKEN = process.env.SOURCEGRAPH_TOKEN

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log('Making request to Cody AI with body:', JSON.stringify(body, null, 2));

        const response = await fetch(CODY_AI_BASE_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `token ${SOURCEGRAPH_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'ai_automation 1.0'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cody AI API error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            return NextResponse.json(
                { error: `Cody AI API error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in Cody AI proxy:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
        return NextResponse.json(
            { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

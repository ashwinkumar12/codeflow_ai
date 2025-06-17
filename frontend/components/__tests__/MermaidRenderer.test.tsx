import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MermaidRenderer from '../MermaidRenderer';
import mermaid from 'mermaid';

// Mock mermaid
jest.mock('mermaid', () => ({
    initialize: jest.fn(),
    render: jest.fn()
}));

describe('MermaidRenderer', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock successful render
        (mermaid.render as jest.Mock).mockResolvedValue({
            svg: '<svg>Test Diagram</svg>'
        });
    });

    it('initializes mermaid with correct config', () => {
        render(<MermaidRenderer diagram="graph TD\nA-->B" />);

        expect(mermaid.initialize).toHaveBeenCalledWith({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });
    });

    it('renders diagram when provided', async () => {
        const diagram = 'graph TD\nA-->B';
        render(<MermaidRenderer diagram={diagram} />);

        await waitFor(() => {
            expect(mermaid.render).toHaveBeenCalledWith('mermaid-diagram', diagram);
        });

        expect(screen.getByText('Test Diagram')).toBeInTheDocument();
    });

    it('handles render errors gracefully', async () => {
        // Mock render error
        (mermaid.render as jest.Mock).mockRejectedValue(new Error('Render failed'));

        render(<MermaidRenderer diagram="invalid diagram" />);

        await waitFor(() => {
            expect(screen.getByText('Failed to render diagram')).toBeInTheDocument();
        });
    });

    it('applies custom className', () => {
        const { container } = render(
            <MermaidRenderer diagram="graph TD\nA-->B" className="custom-class" />
        );

        expect(container.firstChild).toHaveClass('mermaid-renderer', 'custom-class');
    });

    it('does not render when diagram is empty', () => {
        render(<MermaidRenderer diagram="" />);

        expect(mermaid.render).not.toHaveBeenCalled();
    });
});

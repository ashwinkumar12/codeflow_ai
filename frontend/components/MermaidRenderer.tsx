import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
    diagram: string;
    className?: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ diagram, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize mermaid with default config
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });
    }, []);

    useEffect(() => {
        const renderDiagram = async () => {
            if (!containerRef.current || !diagram) return;

            try {
                // Clear previous content
                containerRef.current.innerHTML = '';

                // Render the new diagram
                const { svg } = await mermaid.render('mermaid-diagram', diagram);
                containerRef.current.innerHTML = svg;
            } catch (error) {
                console.error('Failed to render Mermaid diagram:', error);
                containerRef.current.innerHTML = '<div class="error">Failed to render diagram</div>';
            }
        };

        renderDiagram();
    }, [diagram]);

    return (
        <div
            ref={containerRef}
            className={`mermaid-renderer ${className}`}
            style={{
                width: '100%',
                minHeight: '200px',
                padding: '1rem',
                backgroundColor: '#fff',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
        />
    );
};

export default MermaidRenderer;

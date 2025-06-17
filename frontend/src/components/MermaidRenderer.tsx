'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
    diagram: string;
    onError?: (error: Error) => void;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ diagram, onError }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize mermaid
    useEffect(() => {
        const initializeMermaid = async () => {
            try {
                await mermaid.initialize({
                    startOnLoad: true,
                    theme: 'default',
                    securityLevel: 'loose',
                    flowchart: {
                        useMaxWidth: true,
                        htmlLabels: true,
                        curve: 'basis'
                    }
                });
                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing Mermaid:', error);
                if (onError) {
                    onError(error instanceof Error ? error : new Error('Failed to initialize Mermaid'));
                }
            }
        };

        initializeMermaid();
    }, [onError]);

    const fitToWindow = () => {
        if (!containerRef.current) return;

        const svg = containerRef.current.querySelector('svg');
        if (!svg) return;

        // Get the actual SVG dimensions from the viewBox
        const viewBox = svg.viewBox.baseVal;
        const svgWidth = viewBox.width;
        const svgHeight = viewBox.height;

        // Get the container dimensions
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Calculate the scale to fit the diagram
        const scaleX = (containerWidth * 0.95) / svgWidth;  // 95% of container width
        const scaleY = (containerHeight * 0.95) / svgHeight; // 95% of container height
        const newScale = Math.min(scaleX, scaleY);

        // Calculate center position
        const scaledWidth = svgWidth * newScale;
        const scaledHeight = svgHeight * newScale;
        const centerX = (containerWidth - scaledWidth) / 2;
        const centerY = (containerHeight - scaledHeight) / 2;

        setScale(newScale);
        setPosition({ x: centerX, y: centerY });
    };

    useEffect(() => {
        if (!diagram || !isInitialized) return;

        const renderDiagram = async () => {
            try {
                if (containerRef.current) {
                    // Clear previous content and reset scale/position
                    containerRef.current.innerHTML = '';
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                    
                    const { svg } = await mermaid.render('mermaid-diagram', diagram);
                    containerRef.current.innerHTML = svg;

                    // Wait for the SVG to be rendered and then fit
                    requestAnimationFrame(() => {
                        fitToWindow();
                    });
                }
            } catch (error) {
                console.error('Error rendering Mermaid diagram:', error);
                if (onError) {
                    onError(error instanceof Error ? error : new Error('Failed to render diagram'));
                }
            }
        };

        renderDiagram();

        // Cleanup function
        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [diagram, isInitialized, onError]);

    // Add window resize handler
    useEffect(() => {
        const handleResize = () => {
            fitToWindow();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY;
        const zoomFactor = delta > 0 ? 0.9 : 1.1;
        setScale(prev => prev * zoomFactor);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center w-full h-[600px]">
                <div className="text-gray-500">Initializing diagram renderer...</div>
            </div>
        );
    }

    return (
        <div
            className="mermaid-container overflow-hidden relative flex items-center justify-center"
            style={{
                width: '100%',
                minHeight: '600px',
                height: '600px',
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                ref={containerRef}
                className="absolute"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    minWidth: '800px',
                    minHeight: '600px'
                }}
            />
            <div className="absolute bottom-4 right-4 flex gap-2 bg-white/80 p-2 rounded-lg shadow-lg">
                <button
                    onClick={() => setScale(prev => prev * 1.2)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    +
                </button>
                <button
                    onClick={() => setScale(prev => prev * 0.8)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    -
                </button>
                <button
                    onClick={() => {
                        setScale(1);
                        setPosition({ x: 0, y: 0 });
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default MermaidRenderer;

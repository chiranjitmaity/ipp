'use client';

import { useParams } from 'next/navigation';
import { TOOLS, Tool, TOOL_CATEGORIES } from '@/data/tools';
import { ToolInterface } from '@/components/tools/ToolInterface';
import { TextToolInterface } from '@/components/tools/TextToolInterface';
import { CalculatorInterface } from '@/components/tools/CalculatorInterface';
import { SecurityToolInterface } from '@/components/tools/SecurityToolInterface';
import { DeveloperToolInterface } from '@/components/tools/DeveloperToolInterface';
import { AIToolInterface } from '@/components/tools/AIToolInterface';
import { StudentToolInterface } from '@/components/tools/StudentToolInterface';
import { useState, useEffect } from 'react';

const RESIZE_PRESETS = [
    { label: 'Custom', width: '', height: '' },
    { label: 'Passport Size (3.5x4.5cm)', width: '413', height: '531' },
    { label: 'A4 Size (Print)', width: '2480', height: '3508' },
    { label: 'Instagram Square', width: '1080', height: '1080' },
    { label: 'Facebook Cover', width: '851', height: '315' },
    { label: 'HD (720p)', width: '1280', height: '720' },
    { label: 'Full HD (1080p)', width: '1920', height: '1080' },
];

const CROP_PRESETS = [
    { label: 'Custom', width: '500', height: '500' },
    { label: 'Square (1:1)', width: '1000', height: '1000' },
    { label: 'Standard (4:3)', width: '1024', height: '768' },
    { label: 'Widescreen (16:9)', width: '1920', height: '1080' },
    { label: 'Portrait (2:3)', width: '800', height: '1200' },
];

export default function ToolPage() {
    const { id } = useParams();
    const tool = TOOLS.find(t => t.id === id);

    // Global options
    const [targetSize, setTargetSize] = useState('1.0');

    // Resize/Crop shared state
    const [width, setWidth] = useState('800');
    const [height, setHeight] = useState('');
    const [left, setLeft] = useState('0');
    const [top, setTop] = useState('0');
    const [selectedPreset, setSelectedPreset] = useState('Custom');

    const [toolData, setToolData] = useState<Tool | null>(tool || null);
    const [loading, setLoading] = useState(!tool);

    useEffect(() => {
        if (!tool && id) {
            // Fetch dynamic tools if not found in static list
            fetch('/api/admin/tools')
                .then(res => res.json())
                .then(data => {
                    const found = Array.isArray(data) ? data.find((t: Tool) => t.id === id) : null;
                    if (found) {
                        setToolData(found);
                    } else {
                        // Keep loading false to show 404
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch tools", err);
                    setLoading(false);
                });
        }
    }, [id, tool]);

    if (loading) {
        return <div className="container p-8 text-center">Loading tool...</div>;
    }

    if (!toolData) {
        return (
            <div className="container p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Tool Not Found</h1>
                <p>The tool you are looking for does not exist.</p>
            </div>
        );
    }

    // Use toolData instead of tool derived variable
    const currentTool = toolData;

    // --- Conditional Rendering based on Category ---

    if (currentTool.category === TOOL_CATEGORIES.TEXT) {
        return <TextToolInterface toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    if (currentTool.category === TOOL_CATEGORIES.FINANCE) {
        return <CalculatorInterface toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    if (currentTool.category === TOOL_CATEGORIES.SECURITY && currentTool.id === 'password-generator') {
        return <SecurityToolInterface toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    if (currentTool.category === TOOL_CATEGORIES.DEVELOPER) {
        return <DeveloperToolInterface toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    if (currentTool.category === TOOL_CATEGORIES.AI) {
        return <AIToolInterface toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    if (currentTool.category === TOOL_CATEGORIES.STUDENT) {
        return <StudentToolInterface toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    // --- Standard File Conversion Tool Logic ---

    const handleConvert = async (files: File[]) => {
        // Intercept Client-Side conversions
        if (currentTool.id === 'image-to-excel') {
            try {
                // Dynamic import to avoid SSR issues with heavy libs
                const { convertImageToExcelClient } = await import('@/lib/client-converters');
                const url = await convertImageToExcelClient(files, (progress) => {
                    // Start progress bar visual (optional enhancement later)
                    console.log(`OCR Progress: ${Math.round(progress)}%`);
                });
                return { success: true, downloadUrl: url };
            } catch (error) {
                console.error("Client conversion failed:", error);
                return { success: false, error: error instanceof Error ? error.message : "Client-side conversion failed" };
            }
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('toolId', currentTool.id);

        if (currentTool.id === 'compress-pdf') {
            formData.append('targetSize', targetSize);
        }

        if (currentTool.id === 'resize-image' || currentTool.id === 'crop-image') {
            formData.append('width', width);
            formData.append('height', height);
            if (currentTool.id === 'crop-image') {
                formData.append('left', left);
                formData.append('top', top);
            }
        }

        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.error || 'Conversion failed' };
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            return { success: true, downloadUrl: url };
        } catch (error) {
            console.error('Conversion error:', error);
            return { success: false, error: 'Connection to server failed' };
        }
    };

    const handlePresetChange = (presetLabel: string, type: 'resize' | 'crop') => {
        const presets = type === 'resize' ? RESIZE_PRESETS : CROP_PRESETS;
        const preset = presets.find(p => p.label === presetLabel);
        if (preset) {
            setSelectedPreset(presetLabel);
            if (preset.label !== 'Custom') {
                setWidth(preset.width);
                setHeight(preset.height);
            }
        }
    };

    const optionsUI = (() => {
        if (currentTool.id === 'compress-pdf') {
            return (
                <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Target File Size (MB)</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number" step="0.1" min="0.1" value={targetSize}
                            onChange={(e) => setTargetSize(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100px' }}
                        />
                        <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Example: 0.5 for 500KB</span>
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'resize-image') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Preset Size</label>
                        <select
                            value={selectedPreset} onChange={(e) => handlePresetChange(e.target.value, 'resize')}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        >
                            {RESIZE_PRESETS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Width (px)</label>
                            <input
                                type="number" value={width} onChange={(e) => { setWidth(e.target.value); setSelectedPreset('Custom'); }}
                                placeholder="Auto" style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Height (px)</label>
                            <input
                                type="number" value={height} onChange={(e) => { setHeight(e.target.value); setSelectedPreset('Custom'); }}
                                placeholder="Auto" style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'crop-image') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Crops Ratio Presets</label>
                        <select
                            value={selectedPreset} onChange={(e) => handlePresetChange(e.target.value, 'crop')}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        >
                            {CROP_PRESETS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Left Offset (px)</label>
                            <input
                                type="number" value={left} onChange={(e) => setLeft(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Top Offset (px)</label>
                            <input
                                type="number" value={top} onChange={(e) => setTop(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Crop Width (px)</label>
                            <input
                                type="number" value={width} onChange={(e) => { setWidth(e.target.value); setSelectedPreset('Custom'); }}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Crop Height (px)</label>
                            <input
                                type="number" value={height} onChange={(e) => { setHeight(e.target.value); setSelectedPreset('Custom'); }}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    })();

    if (currentTool.code) {
        return (
            <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
                <h1 style={{ marginBottom: '1rem' }}>{currentTool.title}</h1>
                <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>{currentTool.description}</p>
                <div
                    dangerouslySetInnerHTML={{ __html: currentTool.code }}
                    style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--card)' }}
                />
            </div>
        );
    }

    return (
        <ToolInterface
            title={currentTool.title}
            description={currentTool.description}
            acceptedFileTypes={currentTool.accept || '*/*'}
            allowMultiple={currentTool.id === 'merge-pdf' || currentTool.id === 'jpg-to-pdf'}
            options={optionsUI}
            onConvert={handleConvert}
        />
    );
}

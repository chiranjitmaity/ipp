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
import { SocialToolInterface } from '@/components/tools/SocialToolInterface';
import { ThumbnailMakerInterface } from '@/components/tools/ThumbnailMakerInterface';
import { YouTubeDownloaderInterface } from '@/components/tools/YouTubeDownloaderInterface';
import { AdvancedSocialDownloader } from '@/components/tools/AdvancedSocialDownloader';
import React, { useState, useEffect } from 'react';

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

    // Rotate/Flip state
    const [rotation, setRotation] = useState(0);
    const [flipHorizontal, setFlipHorizontal] = useState(false);
    const [flipVertical, setFlipVertical] = useState(false);

    // Add Page Numbers state
    const [pageNumberPosition, setPageNumberPosition] = useState('bottom-center');
    const [pageNumberStart, setPageNumberStart] = useState('1');
    const [pageNumberFormat, setPageNumberFormat] = useState('1 of n');

    const [pageNumberSize, setPageNumberSize] = useState('10');

    // Add Header & Footer state
    const [headerText, setHeaderText] = useState('');
    const [footerText, setFooterText] = useState('');
    const [headerFontSize, setHeaderFontSize] = useState('10');

    const [headerMargin, setHeaderMargin] = useState('20');

    // Remove Watermark state
    const [watermarkText, setWatermarkText] = useState('');

    // Add Signature state
    const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signatureX, setSignatureX] = useState('');
    const [signatureY, setSignatureY] = useState('');
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Background Remover State
    const [bgMode, setBgMode] = useState<'transparent' | 'color' | 'image'>('transparent');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [bgImage, setBgImage] = useState<File | null>(null);

    // DPI State
    const [dpi, setDpi] = useState('300');

    // Watermark State
    const [wmType, setWmType] = useState<'text' | 'image'>('text');
    const [wmText, setWmText] = useState('My Watermark');
    const [wmImage, setWmImage] = useState<File | null>(null);
    const [wmOpacity, setWmOpacity] = useState('50');
    const [wmPosition, setWmPosition] = useState('center');
    const [wmSize, setWmSize] = useState('40'); // Font size or scale %
    const [wmColor, setWmColor] = useState('#000000');

    // Image Converter State
    const [format, setFormat] = useState('jpg');

    // Security Tool State
    const [password, setPassword] = useState('');
    const [expiration, setExpiration] = useState('24');
    const [expectedHash, setExpectedHash] = useState('');

    // Social Tools State
    const [socialPlatform, setSocialPlatform] = useState('fb-cover');
    const [socialRatio, setSocialRatio] = useState('story');
    const [textInput, setTextInput] = useState('');
    const [urlInput, setUrlInput] = useState('');

    // Canvas drawing handlers
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsDrawing(true);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

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

    if (currentTool.id === 'youtube-thumb-download' || currentTool.id === 'url-shortener' || currentTool.id === 'qr-generator' || currentTool.id === 'url-qr' || currentTool.id === 'youtube-tag-generator' || currentTool.id === 'hashtag-generator') {
        return <SocialToolInterface toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    if (currentTool.id === 'youtube-thumb-maker') {
        return <ThumbnailMakerInterface toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    const isSocialDownloader = [
        'instagram-reels-download',
        'facebook-video-download',
        'tiktok-video-download',
        'twitter-video-download'
    ].includes(currentTool.id);

    if (isSocialDownloader) {
        return <AdvancedSocialDownloader toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    if (currentTool.id === 'youtube-video-download') {
        return <YouTubeDownloaderInterface toolId={currentTool.id} title={currentTool.title} description={currentTool.description} />;
    }

    // --- Standard File Conversion Tool Logic ---

    const handleConvert = async (files: File[]) => {
        // Intercept Client-Side conversions
        if (currentTool.id === 'image-to-excel' || currentTool.id === 'image-to-text' || currentTool.id === 'bg-remover' || currentTool.id === 'remove-bg') {
            try {
                // Dynamic import to avoid SSR issues with heavy libs
                const { convertImageToExcelClient, convertImageToTextClient, removeBackgroundClient } = await import('@/lib/client-converters');

                let url: string;
                if (currentTool.id === 'image-to-excel') {
                    url = await convertImageToExcelClient(files, (progress) => { /* progress placeholder */ });
                } else if (currentTool.id === 'image-to-text') {
                    url = await convertImageToTextClient(files, (progress) => { /* progress placeholder */ });
                } else {
                    // Background Remover
                    url = await removeBackgroundClient(files[0], {
                        color: bgMode === 'color' ? bgColor : undefined,
                        backgroundImage: bgMode === 'image' && bgImage ? bgImage : undefined
                    }, (progress) => { /* progress placeholder */ });
                }

                return { success: true, downloadUrl: url };
            } catch (error) {
                console.error("Client conversion failed:", error);
                return { success: false, error: error instanceof Error ? error.message : "Client-side conversion failed" };
            }
        }

        const formData = new FormData();

        // Handling for tools that don't REQUIRE a file (URL/Text based)
        const isFileLessTool = currentTool.id === 'youtube-thumb-download' ||
            currentTool.id === 'url-shortener' ||
            currentTool.id === 'qr-generator' ||
            currentTool.id === 'url-qr';

        if (!isFileLessTool) {
            files.forEach((file) => {
                formData.append('files', file);
            });
        }

        formData.append('toolId', currentTool.id);

        if (currentTool.id === 'compress-pdf' || currentTool.id === 'compress-image') {
            formData.append('targetSize', targetSize);
        }

        if (currentTool.id === 'resize-image' || currentTool.id === 'crop-image') {
            formData.append('width', width);
            formData.append('height', height);
            if (currentTool.id === 'crop-image') {
                formData.append('left', left);
                formData.append('top', top);
            }
            formData.append('pageNumberSize', pageNumberSize);
        }

        if (currentTool.id === 'add-header-footer') {
            formData.append('headerText', headerText);
            formData.append('footerText', footerText);
            formData.append('headerFontSize', headerFontSize);
            formData.append('headerMargin', headerMargin);
        }

        if (currentTool.id === 'add-page-numbers') {
            formData.append('pageNumberPosition', pageNumberPosition);
            formData.append('pageNumberStart', pageNumberStart);
            formData.append('pageNumberFormat', pageNumberFormat);
            formData.append('pageNumberSize', pageNumberSize);
        }

        if (currentTool.id === 'add-signature') {
            if (signatureMode === 'upload' && signatureFile) {
                formData.append('signatureFile', signatureFile);
            } else if (signatureMode === 'draw') {
                // Convert canvas to blob
                const canvas = canvasRef.current;
                if (canvas) {
                    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                    if (blob) {
                        formData.append('signatureFile', blob, 'signature.png');
                    }
                }
            }
            formData.append('signatureX', signatureX);
            formData.append('signatureY', signatureY);
        }

        if (currentTool.id === 'rotate-image') {
            formData.append('rotation', rotation.toString());
            formData.append('flipHorizontal', flipHorizontal.toString());
            formData.append('flipVertical', flipVertical.toString());
        }

        if (currentTool.id === 'convert-dpi') {
            formData.append('dpi', dpi);
        }

        if (currentTool.id === 'watermark-image') {
            formData.append('wmType', wmType);
            formData.append('wmOpacity', wmOpacity);
            formData.append('wmPosition', wmPosition);
            formData.append('wmSize', wmSize);
            if (wmType === 'text') {
                formData.append('wmText', wmText);
                formData.append('wmColor', wmColor);
            } else if (wmType === 'image' && wmImage) {
                formData.append('watermarkImage', wmImage);
            }
        }

        if (currentTool.id === 'convert-image-format') {
            formData.append('format', format);
        }

        if (currentTool.id === 'encrypt-file' || currentTool.id === 'decrypt-file' || currentTool.id === 'remove-pdf-permission') {
            formData.append('password', password);
        }

        if (currentTool.id === 'secure-share') {
            formData.append('password', password);
            formData.append('expiration', expiration);
        }

        if (currentTool.id === 'file-integrity') {
            formData.append('expectedHash', expectedHash);
        }

        if (currentTool.category === TOOL_CATEGORIES.MOBILE_SOCIAL) {
            formData.append('socialPlatform', socialPlatform);
            formData.append('socialRatio', socialRatio);
            if (textInput) formData.append('text', textInput);
            if (urlInput) formData.append('url', urlInput);
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

        if (currentTool.id === 'compress-image') {
            return (
                <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Target File Size (KB)</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number" step="1" min="1" value={targetSize}
                            onChange={(e) => setTargetSize(e.target.value)}
                            placeholder="e.g. 50"
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100px' }}
                        />
                        <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Leave empty for auto-compression</span>
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

        if (currentTool.id === 'add-page-numbers') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Position</label>
                        <select
                            value={pageNumberPosition} onChange={(e) => setPageNumberPosition(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        >
                            <option value="bottom-center">Bottom Center</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Start Number</label>
                            <input
                                type="number" value={pageNumberStart} onChange={(e) => setPageNumberStart(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Font Size</label>
                            <input
                                type="number" value={pageNumberSize} onChange={(e) => setPageNumberSize(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Format</label>
                        <select
                            value={pageNumberFormat} onChange={(e) => setPageNumberFormat(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        >
                            <option value="1 of n">1 of n</option>
                            <option value="1">1</option>
                            <option value="Page 1">Page 1</option>
                            <option value="Page 1 of n">Page 1 of n</option>
                        </select>
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'add-header-footer') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Header Text</label>
                        <input
                            type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)}
                            placeholder="Enter header text"
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Footer Text</label>
                        <input
                            type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)}
                            placeholder="Enter footer text"
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Font Size</label>
                            <input
                                type="number" value={headerFontSize} onChange={(e) => setHeaderFontSize(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Margin (px)</label>
                            <input
                                type="number" value={headerMargin} onChange={(e) => setHeaderMargin(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'remove-watermark') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Watermark Text to Remove</label>
                        <input
                            type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)}
                            placeholder="Enter text to remove (exact match)"
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            Note: This tool attempts to remove text-based watermarks. It may not work for images or complex text encodings.
                        </p>
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'add-signature') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Signature Method</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="signatureMode"
                                    value="draw"
                                    checked={signatureMode === 'draw'}
                                    onChange={() => setSignatureMode('draw')}
                                />
                                Draw
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="signatureMode"
                                    value="upload"
                                    checked={signatureMode === 'upload'}
                                    onChange={() => setSignatureMode('upload')}
                                />
                                Upload Image
                            </label>
                        </div>
                    </div>

                    {signatureMode === 'draw' ? (
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Draw Signature</label>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: '#fff', overflow: 'hidden' }}>
                                <canvas
                                    ref={canvasRef}
                                    width={400}
                                    height={200}
                                    style={{ width: '100%', height: '200px', cursor: 'crosshair', touchAction: 'none' }}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="text-sm text-red-500 hover:text-red-700 self-end"
                            >
                                Clear Signature
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Upload Signature Image</label>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setSignatureFile(e.target.files[0]);
                                    }
                                }}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>X Position (px)</label>
                            <input
                                type="number" value={signatureX} onChange={(e) => setSignatureX(e.target.value)}
                                placeholder="Auto (Right)"
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Y Position (px)</label>
                            <input
                                type="number" value={signatureY} onChange={(e) => setSignatureY(e.target.value)}
                                placeholder="Auto (Bottom)"
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'rotate-image') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Rotation</label>
                        <div className="flex gap-2">
                            <button className="btn" type="button" onClick={() => setRotation((r) => (r + 90) % 360)} style={{ flex: 1, backgroundColor: rotation === 90 ? 'var(--primary)' : 'var(--card)' }}>90° CW</button>
                            <button className="btn" type="button" onClick={() => setRotation(180)} style={{ flex: 1, backgroundColor: rotation === 180 ? 'var(--primary)' : 'var(--card)' }}>180°</button>
                            <button className="btn" type="button" onClick={() => setRotation((r) => (r + 270) % 360)} style={{ flex: 1, backgroundColor: rotation === 270 ? 'var(--primary)' : 'var(--card)' }}>90° CCW</button>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.8rem' }}>Current Rotation: {rotation}°</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Flip</label>
                        <div className="flex gap-2">
                            <button className="btn" type="button" onClick={() => setFlipHorizontal(!flipHorizontal)} style={{ flex: 1, backgroundColor: flipHorizontal ? 'var(--primary)' : 'var(--card)' }}>Horizontal</button>
                            <button className="btn" type="button" onClick={() => setFlipVertical(!flipVertical)} style={{ flex: 1, backgroundColor: flipVertical ? 'var(--primary)' : 'var(--card)' }}>Vertical</button>
                        </div>
                    </div>
                    {/* Hidden inputs to pass to form data */}
                    <input type="hidden" name="rotation" value={rotation} />
                    <input type="hidden" name="flipHorizontal" value={flipHorizontal.toString()} />
                    <input type="hidden" name="flipVertical" value={flipVertical.toString()} />
                </div>
            );
        }

        if (currentTool.id === 'convert-dpi') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select DPI</label>
                        <select
                            value={dpi} onChange={(e) => setDpi(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        >
                            <option value="72">72 DPI (Screen)</option>
                        </select>
                    </div>
                    {/* Allow custom input if user types specific value or selects custom (but here we just use the input for both if we want, or conditional) */}
                    {/* Simplification: Just show valid number input that syncs. Actually select above sets common values. */}

                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Custom DPI Value</label>
                        <input
                            type="number" value={dpi} onChange={(e) => setDpi(e.target.value)}
                            placeholder="e.g. 300"
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        />
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'watermark-image') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Watermark Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input type="radio" name="wmType" value="text" checked={wmType === 'text'} onChange={() => setWmType('text')} />
                                Text
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" name="wmType" value="image" checked={wmType === 'image'} onChange={() => setWmType('image')} />
                                Image
                            </label>
                        </div>
                    </div>

                    {wmType === 'text' ? (
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Watermark Text</label>
                            <input
                                type="text" value={wmText} onChange={(e) => setWmText(e.target.value)}
                                placeholder="Enter text"
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Text Color</label>
                            <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)} style={{ width: '100%', height: '40px' }} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Upload Watermark Image</label>
                            <input
                                type="file" accept="image/*"
                                onChange={(e) => { if (e.target.files?.[0]) setWmImage(e.target.files[0]) }}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Opacity (%)</label>
                            <input
                                type="number" min="0" max="100" value={wmOpacity} onChange={(e) => setWmOpacity(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Size {wmType === 'text' ? '(px)' : '(Scale %)'}</label>
                            <input
                                type="number" value={wmSize} onChange={(e) => setWmSize(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Position</label>
                        <select
                            value={wmPosition} onChange={(e) => setWmPosition(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        >
                            <option value="center">Center</option>
                            <option value="north">Top Center</option>
                            <option value="northeast">Top Right</option>
                            <option value="northwest">Top Left</option>
                            <option value="south">Bottom Center</option>
                            <option value="southeast">Bottom Right</option>
                            <option value="southwest">Bottom Left</option>
                            <option value="east">Right Center</option>
                            <option value="west">Left Center</option>
                        </select>
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'image-metadata') {
            return (
                <div className="alert" style={{ backgroundColor: 'var(--primary)15', color: 'var(--primary)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                    <p>This tool will extract EXIF, IPTC, and XMP metadata from your image and download it as a JSON file.</p>
                </div>
            );
        }

        if (currentTool.id === 'color-filter-image') {
            return (
                <div className="flex flex-col gap-4">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Filter</label>
                    <select style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}>
                        <option value="grayscale">Grayscale / B&W</option>
                        <option value="sepia" disabled>Sepia (Coming Soon)</option>
                        <option value="invert" disabled>Invert Colors (Coming Soon)</option>
                    </select>
                </div>
            );
        }

        if (currentTool.id === 'bg-remover' || currentTool.id === 'remove-bg') {
            // State for this tool needs to be lifted or handled here?
            // We can use local state if we don't need to persist it across re-renders of parent too strictly.
            // But optionsUI is a closure, it sees state from ToolPage. 
            // We need to add state variables for bg removal to ToolPage.

            // Using generic names or specific? Let's assume we added them to ToolPage state.
            // We'll add: [bgMode, setBgMode], [bgColor, setBgColor], [bgImage, setBgImage]

            // Since we haven't added them yet, I will add placeholders here and then update state in next step.
            // Or better, I will assume typical variable names and then go update ToolPage state immediately.

            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Background Mode</label>
                        <div className="flex gap-2">
                            <button className="btn" type="button" onClick={() => setBgMode('transparent')} style={{ flex: 1, backgroundColor: bgMode === 'transparent' ? 'var(--primary)' : 'var(--card)', color: bgMode === 'transparent' ? '#fff' : 'inherit' }}>Transparent</button>
                            <button className="btn" type="button" onClick={() => setBgMode('color')} style={{ flex: 1, backgroundColor: bgMode === 'color' ? 'var(--primary)' : 'var(--card)', color: bgMode === 'color' ? '#fff' : 'inherit' }}>Color</button>
                            <button className="btn" type="button" onClick={() => setBgMode('image')} style={{ flex: 1, backgroundColor: bgMode === 'image' ? 'var(--primary)' : 'var(--card)', color: bgMode === 'image' ? '#fff' : 'inherit' }}>Image</button>
                        </div>
                    </div>

                    {bgMode === 'color' && (
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Color</label>
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '100%', height: '40px', cursor: 'pointer' }} />
                        </div>
                    )}

                    {bgMode === 'image' && (
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Upload Background Image</label>
                            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setBgImage(e.target.files[0]) }}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                            />
                        </div>
                    )}
                </div>
            );
        }

        if (currentTool.id === 'gif-maker') {
            return (
                <div className="alert" style={{ backgroundColor: 'var(--primary)15', color: 'var(--primary)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                    <p>Upload multiple images. They will be combined into a ZIP package (Animated GIF creation coming soon).</p>
                </div>
            );
        }

        if (currentTool.id === 'convert-image-format') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Convert to</label>
                        <select
                            value={format} onChange={(e) => setFormat(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        >
                            <option value="jpg">JPG / JPEG</option>
                            <option value="png">PNG</option>
                            <option value="webp">WebP</option>
                            <option value="tiff">TIFF</option>
                            <option value="bmp">BMP (Coming Soon)</option>
                        </select>
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'encrypt-file' || currentTool.id === 'decrypt-file' || currentTool.id === 'remove-pdf-permission') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            {currentTool.id === 'encrypt-file' ? 'Set Encryption Password' :
                                currentTool.id === 'decrypt-file' ? 'Enter Decryption Password' : 'PDF Password'}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            {currentTool.id === 'encrypt-file'
                                ? 'Remember this password! It cannot be recovered if lost.'
                                : currentTool.id === 'decrypt-file'
                                    ? 'Enter the password used to encrypt this file.'
                                    : 'Enter the Owner Password to unlock permissions.'}
                        </p>
                    </div>
                </div>
            );
        }

        if (currentTool.id === 'secure-share') {
            return (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Set Access Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Link Expiration</label>
                        <select
                            value={expiration} onChange={(e) => setExpiration(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                        >
                            <option value="1">1 Hour</option>
                            <option value="24">24 Hours</option>
                            <option value="72">3 Days</option>
                            <option value="168">7 Days</option>
                            <option value="0">Never</option>
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            The generated HTML file will automatically lock itself after this time.
                        </p>
                    </div>
                </div>
            );
        }



        // --- Mobile & Social Tools UI ---

        if (currentTool.id === 'instagram-resize') {
            return (
                <div className="flex flex-col gap-4">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Format</label>
                    <select
                        value={socialRatio} onChange={(e) => setSocialRatio(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                    >
                        <option value="story">Story / Reel (9:16)</option>
                        <option value="portrait">Portrait (4:5)</option>
                        <option value="landscape">Landscape (1.91:1)</option>
                        <option value="square">Square (1:1)</option>
                    </select>
                </div>
            );
        }

        if (currentTool.id === 'social-size-converter') {
            return (
                <div className="flex flex-col gap-4">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Platform / Format</label>
                    <select
                        value={socialPlatform} onChange={(e) => setSocialPlatform(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                    >
                        <option value="fb-cover">Facebook Cover</option>
                        <option value="twitter-header">Twitter Header</option>
                        <option value="linkedin-banner">LinkedIn Banner</option>
                        <option value="yt-thumbnail">YouTube Thumbnail</option>
                    </select>
                </div>
            );
        }

        if (currentTool.id === 'qr-generator' || currentTool.id === 'url-qr') {
            return (
                <div className="flex flex-col gap-4">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {currentTool.id === 'url-qr' ? 'Enter URL' : 'Enter Text for QR Code'}
                    </label>
                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={currentTool.id === 'url-qr' ? 'https://example.com' : 'Text to encode...'}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                    />
                </div>
            );
        }

        if (currentTool.id === 'youtube-thumb-download' || currentTool.id === 'url-shortener') {
            return (
                <div className="flex flex-col gap-4">
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Enter URL</label>
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={currentTool.id === 'url-shortener' ? 'https://example.com/very/long/url' : 'https://youtube.com/watch?v=...'}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', width: '100%' }}
                    />
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
            allowMultiple={currentTool.id === 'merge-pdf' || currentTool.id === 'jpg-to-pdf' || currentTool.id === 'screenshot-to-pdf' || currentTool.id === 'gif-maker'}
            options={optionsUI}
            onConvert={handleConvert}
        />
    );
}

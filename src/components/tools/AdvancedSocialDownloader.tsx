'use client';

import { useState } from 'react';
import { Download, RefreshCw, AlertCircle, CheckCircle2, Instagram, Facebook, Twitter, PlayCircle, Link as LinkIcon, ClipboardPaste, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// TikTok doesn't have a built-in lucide icon, so we use PlayCircle as fallback/custom
const TikTokIcon = ({ size, color }: { size: number, color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

interface AdvancedSocialDownloaderProps {
    toolId: string;
    title: string;
    description: string;
}

interface VideoMetadata {
    title?: string;
    thumbnail?: string;
    downloadUrl: string;
    format?: string;
}

export const AdvancedSocialDownloader = ({ toolId, title, description }: AdvancedSocialDownloaderProps) => {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
    const [error, setError] = useState('');
    const [result, setResult] = useState<VideoMetadata | null>(null);

    // Dynamic Theming based on the tool
    const isFacebook = toolId === 'facebook-video-download';
    const isTikTok = toolId === 'tiktok-video-download';

    let PlatformIcon: any = LinkIcon;
    let themeColor = 'var(--primary)';
    let gradient = 'linear-gradient(135deg, var(--card), var(--background))';
    let platformName = 'Social Media';

    if (isFacebook) {
        PlatformIcon = Facebook;
        themeColor = '#1877F2';
        gradient = 'linear-gradient(135deg, #f0f5ff, #fff)';
        platformName = 'Facebook';
    } else if (isTikTok) {
        PlatformIcon = TikTokIcon;
        themeColor = '#00f2fe'; // TikTok uses black/cyan/red, using a bright cyan accent
        gradient = 'linear-gradient(135deg, #f5f5f5, #fff)';
        platformName = 'TikTok';
    }

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setUrl(text);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    const handleFetch = async () => {
        if (!url) return;

        setStatus('processing');
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/social-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, platform: platformName.toLowerCase() })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch video');
            }

            const data = await response.json();
            setResult(data);
            setStatus('done');

        } catch (err: any) {
            console.error('Download error:', err);
            setError(err.message || 'Failed to process url. Check if the link is public and correct.');
            setStatus('error');
        }
    };

    const reset = () => {
        setStatus('idle');
        setUrl('');
        setError('');
        setResult(null);
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: `${themeColor}15`, color: themeColor, marginBottom: '1rem' }}>
                    <PlatformIcon size={48} color={themeColor} />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{title}</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.125rem' }}>{description}</p>
            </div>

            <div className="card" style={{ padding: '3rem', border: '1px solid var(--border)', background: gradient }}>
                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">

                            <div className="flex flex-col gap-2 relative">
                                <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <LinkIcon size={18} />
                                    Paste {platformName} Link Here
                                </label>
                                <div className="flex relative">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder={`https://www.${platformName.toLowerCase().split(' ')[0]}.com/...`}
                                        style={{
                                            padding: '1.25rem',
                                            paddingRight: '4rem',
                                            borderRadius: 'var(--radius)',
                                            border: `2px solid ${url ? themeColor : 'var(--border)'}`,
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            fontSize: '1.125rem',
                                            width: '100%',
                                            transition: 'border-color 0.3s ease',
                                            outline: 'none',
                                            boxShadow: url ? `0 0 0 4px ${themeColor}20` : 'none'
                                        }}
                                    />
                                    {/* Quick Paste Button inside input */}
                                    {!url && (
                                        <button
                                            onClick={handlePaste}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'var(--card)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius)',
                                                padding: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                cursor: 'pointer',
                                                color: 'var(--muted)',
                                                fontSize: '0.8rem'
                                            }}
                                            title="Paste from clipboard"
                                        >
                                            <ClipboardPaste size={16} /> Paste
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleFetch}
                                disabled={!url}
                                style={{ padding: '1.25rem', fontSize: '1.125rem', backgroundColor: themeColor, borderColor: themeColor, boxShadow: `0 4px 14px ${themeColor}40` }}
                            >
                                Get Video
                            </button>

                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', marginTop: '1rem' }}>
                                By using this tool, you confirm that you have the right to download this content.
                            </p>
                        </motion.div>
                    )}

                    {status === 'processing' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 py-8">
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px' }}>
                                <RefreshCw size={40} className="animate-spin" color={themeColor} style={{ position: 'absolute' }} />
                                <PlatformIcon size={20} color={themeColor} style={{ position: 'absolute' }} />
                            </div>
                            <h2>Extracting High-Quality Video...</h2>
                            <p style={{ color: 'var(--muted)', textAlign: 'center' }}>
                                Interfacing with {platformName} servers. This usually takes 5-10 seconds.
                            </p>
                        </motion.div>
                    )}

                    {status === 'done' && result && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center gap-6">

                            <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.9)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <div className="flex gap-4 items-start">
                                    {result.thumbnail ? (
                                        <div style={{ width: '120px', flexShrink: 0, borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                                            <img src={result.thumbnail} alt="Thumbnail" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                        </div>
                                    ) : (
                                        <div style={{ width: '120px', height: '120px', flexShrink: 0, borderRadius: 'var(--radius)', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <Video size={32} />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)', margin: 0, lineHeight: 1.4 }}>
                                            {result.title || `${platformName} Video`}
                                        </h3>
                                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>HD MP4 Format</p>

                                        <a
                                            href={result.downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                            style={{ marginTop: 'auto', alignSelf: 'flex-start', backgroundColor: '#10b981', borderColor: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <Download size={18} /> Download Video
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <button className="btn" onClick={reset} style={{ width: '100%' }}>Download Another {platformName} Video</button>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 py-4">
                            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '50%' }}>
                                <AlertCircle size={48} color="#dc2626" />
                            </div>
                            <h2 style={{ color: '#dc2626', margin: 0 }}>Whoops!</h2>
                            <p style={{ textAlign: 'center', color: 'var(--muted)', maxWidth: '400px' }}>{error}</p>

                            <div style={{ width: '100%', marginTop: '1rem' }}>
                                <button className="btn btn-primary" onClick={() => setStatus('idle')} style={{ width: '100%', backgroundColor: themeColor, borderColor: themeColor }}>
                                    Try Another Link
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    );
};

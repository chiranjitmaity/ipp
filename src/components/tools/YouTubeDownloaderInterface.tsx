'use client';

import { useState } from 'react';
import { Download, RefreshCw, AlertCircle, CheckCircle2, Video, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface YouTubeDownloaderInterfaceProps {
    toolId: string;
    title: string;
    description: string;
}

export const YouTubeDownloaderInterface = ({ toolId, title, description }: YouTubeDownloaderInterfaceProps) => {
    const [url, setUrl] = useState('');
    const [format, setFormat] = useState<'mp4' | 'mp3'>('mp4');
    const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleDownload = async () => {
        if (!url) return;

        // Basic naive check (backend will do proper check)
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            setError('Please enter a valid YouTube URL');
            setStatus('error');
            return;
        }

        setStatus('processing');
        setError('');

        try {
            // Because this is a streaming download, we'll navigate the browser to the API which triggers the native download
            const downloadUrl = `/api/yt-download?url=${encodeURIComponent(url)}&format=${format}`;

            // Trigger download via hidden iframe or direct navigation
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Give the browser a moment to catch the stream before saying done
            setTimeout(() => {
                setStatus('done');
            }, 1000);

        } catch (err) {
            console.error('Download error:', err);
            setError('Failed to initiate download. Please check the URL and try again.');
            setStatus('error');
        }
    };

    const reset = () => {
        setStatus('idle');
        setUrl('');
        setError('');
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{title}</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.125rem' }}>{description}</p>
            </div>

            <div className="card" style={{ padding: '3rem', border: '1px solid var(--border)' }}>
                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Video size={18} />
                                    Enter YouTube URL
                                </label>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--background)',
                                        fontSize: '1rem',
                                        width: '100%'
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label style={{ fontWeight: 600 }}>Select Format</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setFormat('mp4')}
                                        style={{
                                            border: `2px solid ${format === 'mp4' ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius)',
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            backgroundColor: format === 'mp4' ? 'var(--card)' : 'transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Video size={32} color={format === 'mp4' ? 'var(--primary)' : 'var(--muted)'} />
                                        <span style={{ fontWeight: 600, color: format === 'mp4' ? 'var(--foreground)' : 'var(--muted)' }}>Video (MP4)</span>
                                    </div>
                                    <div
                                        onClick={() => setFormat('mp3')}
                                        style={{
                                            border: `2px solid ${format === 'mp3' ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius)',
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            backgroundColor: format === 'mp3' ? 'var(--card)' : 'transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Music size={32} color={format === 'mp3' ? 'var(--primary)' : 'var(--muted)'} />
                                        <span style={{ fontWeight: 600, color: format === 'mp3' ? 'var(--foreground)' : 'var(--muted)' }}>Audio (MP3)</span>
                                    </div>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', marginTop: '1rem' }}>
                                By downloading, you agree to follow YouTube's Terms of Service. Only download videos you have permission to use.
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={handleDownload}
                                disabled={!url}
                                style={{ padding: '1rem', fontSize: '1.125rem' }}
                            >
                                <Download size={20} className="mr-2" /> Start Download
                            </button>
                        </motion.div>
                    )}

                    {status === 'processing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                            <RefreshCw size={48} className="animate-spin" color="var(--primary)" />
                            <h2>Preparing your download...</h2>
                            <p style={{ color: 'var(--muted)', textAlign: 'center' }}>
                                Your browser should prompt you to save the file momentarily.<br />
                                Leaving this page during the download will cancel it.
                            </p>
                        </motion.div>
                    )}

                    {status === 'done' && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
                            <CheckCircle2 size={64} color="#10b981" />
                            <h2 style={{ color: '#10b981' }}>Download Started!</h2>
                            <p style={{ color: 'var(--muted)' }}>Check your browser's download manager.</p>
                            <button className="btn" onClick={reset}>Download Another Video</button>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                            <AlertCircle size={64} color="var(--primary)" />
                            <h2 style={{ color: 'var(--primary)' }}>Error</h2>
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={reset}>Try Again</button>
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

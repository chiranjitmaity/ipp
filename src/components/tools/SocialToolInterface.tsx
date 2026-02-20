'use client';

import { useState } from 'react';
import { Download, RefreshCw, AlertCircle, CheckCircle2, Link as LinkIcon, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialToolInterfaceProps {
    toolId: string;
    title: string;
    description: string;
}

export const SocialToolInterface = ({ toolId, title, description }: SocialToolInterfaceProps) => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
    const [result, setResult] = useState<{ url?: string; content?: string }>({});
    const [error, setError] = useState('');

    const isUrlTool = toolId === 'youtube-thumb-download' || toolId === 'url-shortener' || toolId === 'url-qr';
    const placeholder = toolId === 'youtube-thumb-download' ? 'https://youtube.com/watch?v=...'
        : toolId === 'url-shortener' ? 'https://example.com/long-url'
            : toolId === 'url-qr' ? 'https://example.com'
                : 'Enter text to generate QR code...';

    const handleProcess = async () => {
        if (!input) return;
        setStatus('processing');
        setError('');

        const formData = new FormData();
        formData.append('toolId', toolId);
        if (isUrlTool) {
            formData.append('url', input);
        } else {
            formData.append('text', input);
        }

        try {
            const res = await fetch('/api/convert', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Processing failed');
            }

            // Check content type to decide how to handle
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.downloadUrl) {
                    setResult({ url: data.downloadUrl });
                } else {
                    throw new Error('No download URL returned');
                }
            } else {
                // Blob result (image or text file)
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);

                if (contentType?.includes('text/plain')) {
                    const text = await blob.text();
                    setResult({ url, content: text });
                } else {
                    setResult({ url });
                }
            }
            setStatus('done');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setStatus('error');
        }
    };

    const reset = () => {
        setStatus('idle');
        setResult({});
        setInput('');
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
                                    {isUrlTool ? <LinkIcon size={18} /> : <Type size={18} />}
                                    {isUrlTool ? 'Enter URL' : 'Enter Text'}
                                </label>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={placeholder}
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
                            <button
                                className="btn btn-primary"
                                onClick={handleProcess}
                                disabled={!input}
                                style={{ padding: '1rem', fontSize: '1.125rem' }}
                            >
                                {toolId === 'youtube-thumb-download' ? 'Fetch Thumbnail' : 'Generate'}
                            </button>
                        </motion.div>
                    )}

                    {status === 'processing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                            <RefreshCw size={48} className="animate-spin" color="var(--primary)" />
                            <p>Processing...</p>
                        </motion.div>
                    )}

                    {status === 'done' && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
                            <CheckCircle2 size={64} color="#10b981" />
                            <h2 style={{ color: '#10b981' }}>Success!</h2>

                            {result.content && (
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: 'var(--muted)',
                                    borderRadius: 'var(--radius)',
                                    width: '100%',
                                    whiteSpace: 'pre-wrap',
                                    textAlign: 'left',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {result.content}
                                </div>
                            )}

                            {result.url && !result.content && toolId !== 'url-shortener' && (
                                <img src={result.url} alt="Result" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius)' }} />
                            )}

                            <div className="flex gap-4">
                                {result.url && (
                                    <a href={result.url} download="result" className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>
                                        <Download size={20} /> Download
                                    </a>
                                )}
                                <button className="btn" onClick={reset}>Convert Another</button>
                            </div>
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

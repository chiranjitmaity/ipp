'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RefreshCw, AlertCircle, CheckCircle2, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolInterfaceProps {
    title: string;
    description: string;
    acceptedFileTypes: string;
    allowMultiple?: boolean;
    options?: React.ReactNode;
    onConvert: (files: File[]) => Promise<{ success: boolean; downloadUrl?: string; error?: string }>;
}

export const ToolInterface = ({
    title,
    description,
    acceptedFileTypes,
    allowMultiple = false,
    options,
    onConvert
}: ToolInterfaceProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            if (allowMultiple) {
                setFiles(prev => [...prev, ...newFiles]);
            } else {
                setFiles([newFiles[0]]);
            }
            setStatus('idle');
            setErrorMessage('');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            if (allowMultiple) {
                setFiles(prev => [...prev, ...newFiles]);
            } else {
                setFiles([newFiles[0]]);
            }
            setStatus('idle');
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleConvert = async () => {
        if (files.length === 0) return;

        setStatus('processing');
        setProgress(30);

        try {
            // Simulate progress
            const interval = setInterval(() => {
                setProgress(p => (p < 90 ? p + 10 : p));
            }, 500);

            const result = await onConvert(files);

            clearInterval(interval);
            setProgress(100);

            if (result.success && result.downloadUrl) {
                setDownloadUrl(result.downloadUrl);
                setStatus('done');
            } else {
                setErrorMessage(result.error || 'Conversion failed');
                setStatus('error');
            }
        } catch {
            setErrorMessage('An unexpected error occurred');
            setStatus('error');
        }
    };

    const reset = () => {
        setFiles([]);
        setStatus('idle');
        setDownloadUrl('');
        setErrorMessage('');
        setProgress(0);
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{title}</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.125rem' }}>{description}</p>
            </div>

            <div className="card" style={{ padding: '3rem', textAlign: 'center', borderStyle: status === 'idle' ? 'dashed' : 'solid', borderWidth: '2px' }}>
                <AnimatePresence mode="wait">
                    {status === 'idle' && files.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary)15',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                <Upload size={48} />
                            </div>
                            <div>
                                <button
                                    className="btn btn-primary"
                                    style={{ marginBottom: '1rem', padding: '1rem 2rem', fontSize: '1.125rem' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Select {allowMultiple ? 'Files' : 'File'}
                                </button>
                                <p style={{ color: 'var(--muted)' }}>or drag and drop here</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept={acceptedFileTypes}
                                multiple={allowMultiple}
                                style={{ display: 'none' }}
                            />
                        </motion.div>
                    )}

                    {files.length > 0 && status === 'idle' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6" style={{ width: '100%' }}>
                            <div className="flex flex-col gap-3 w-full">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                        <div className="flex items-center gap-3">
                                            <File color="var(--primary)" size={24} />
                                            <div style={{ textAlign: 'left' }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{file.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {options && (
                                <div className="w-full mt-4 p-4 border rounded" style={{ backgroundColor: 'var(--primary)05', borderColor: 'var(--border)', textAlign: 'left' }}>
                                    {options}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button className="btn btn-primary" onClick={handleConvert}>
                                    {allowMultiple ? `Merge ${files.length} Files` : 'Convert Now'}
                                </button>
                                {allowMultiple && (
                                    <button className="btn" onClick={() => fileInputRef.current?.click()}>
                                        Add More
                                    </button>
                                )}
                                <button className="btn" onClick={reset}>Reset</button>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept={acceptedFileTypes}
                                multiple={allowMultiple}
                                style={{ display: 'none' }}
                            />
                        </motion.div>
                    )}

                    {(status === 'processing' || status === 'uploading') && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                            <RefreshCw size={48} className="animate-spin" color="var(--primary)" />
                            <div style={{ width: '100%', maxWidth: '400px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>{status === 'processing' ? 'Processing...' : 'Uploading...'}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'done' && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
                            <CheckCircle2 size={64} color="#10b981" />
                            <h2 style={{ color: '#10b981' }}>Task Completed!</h2>
                            <div className="flex gap-4">
                                <a href={downloadUrl} download className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>
                                    <Download size={20} /> Download Result
                                </a>
                                <button className="btn" onClick={reset}>Start Over</button>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                            <AlertCircle size={64} color="var(--primary)" />
                            <h2 style={{ color: 'var(--primary)' }}>Oops! Something went wrong.</h2>
                            <p>{errorMessage}</p>
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

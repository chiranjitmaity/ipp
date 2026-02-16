'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GDPRConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('gdpr-consent');
        if (!consent) {
            // eslint-disable-next-line
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('gdpr-consent', 'accepted');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'calc(100% - 3rem)',
                        maxWidth: '600px',
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={24} color="var(--primary)" />
                            <h4 style={{ fontSize: '1.125rem' }}>Cookie Consent</h4>
                        </div>
                        <button onClick={() => setIsVisible(false)} className="btn" style={{ padding: '0.25rem' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                        We use cookies to improve your experience on our site, analyze site traffic, and serve targeted advertisements. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={handleAccept} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Accept All</button>
                        <button onClick={() => setIsVisible(false)} className="btn" style={{ border: '1px solid var(--border)', padding: '0.5rem 1.5rem' }}>Settings</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

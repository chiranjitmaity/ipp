'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export function PrivacyPopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if the user has already acknowledged the privacy popup
        const hasSeenPopup = localStorage.getItem('hasSeenPrivacyPopup');
        if (!hasSeenPopup) {
            // Small delay for better UX (so it doesn't just instantly flash on load)
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenPrivacyPopup', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                        mass: 0.8
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        maxWidth: '400px',
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                        zIndex: 9999,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(229, 50, 45, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
                            padding: '0.75rem',
                            borderRadius: '50%',
                            flexShrink: 0
                        }}>
                            <motion.div
                                initial={{ rotate: -10 }}
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <ShieldCheck size={28} color="var(--primary)" />
                            </motion.div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>Your privacy is our priority</h3>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                                We delete your files automatically after <strong>1 minute</strong>. No one but you can access them.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleClose}
                                style={{
                                    background: 'linear-gradient(135deg, var(--primary) 0%, #ff8e53 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '30px',
                                    padding: '10px 24px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    width: '100%',
                                    boxShadow: '0 4px 14px 0 rgba(229, 50, 45, 0.25)',
                                    transition: 'box-shadow 0.2s ease',
                                }}
                            >
                                I Understand
                            </motion.button>
                        </div>

                        <button
                            onClick={handleClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--muted)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted-bg)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

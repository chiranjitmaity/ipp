'use client';

import Link from 'next/link';
import { FileText, Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="footer" style={{ borderTop: '1px solid var(--border)', padding: '4rem 0 2rem', backgroundColor: 'var(--card)' }}>
            <div className="container">
                <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>
                            <FileText size={24} />
                            <span style={{ color: 'var(--foreground)' }}>ilovepdftools</span>
                        </Link>
                        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                            Your every PDF and file conversion tool in one place. Fast, easy, and secure.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#"><Facebook size={18} /></Link>
                            <Link href="#"><Twitter size={18} /></Link>
                            <Link href="#"><Linkedin size={18} /></Link>
                            <Link href="#"><Github size={18} /></Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Most Popular</h4>
                        <Link href="/tools/pdf-to-word" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>PDF to Word</Link>
                        <Link href="/tools/merge-pdf" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Merge PDF</Link>
                        <Link href="/tools/compress-pdf" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Compress PDF</Link>
                        <Link href="/tools/jpg-to-pdf" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>JPG to PDF</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solutions</h4>
                        <Link href="/about" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>About Us</Link>
                        <Link href="/contact" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Contact Us</Link>
                        <Link href="/blog" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Blog</Link>
                        <Link href="/developer" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>API Tools</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal</h4>
                        <Link href="/privacy" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Privacy Policy</Link>
                        <Link href="/terms" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Terms & Conditions</Link>
                        <Link href="/disclaimer" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Disclaimer</Link>
                        <Link href="/dmca" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>DMCA Policy</Link>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                        © {new Date().getFullYear()} CMK FINANCIAL INDIAN PAYMENT PVT LTD. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

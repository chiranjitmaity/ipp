'use client';

import { Mail, MessageSquare, Globe } from 'lucide-react';

export default function Contact() {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Contact Us</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.25rem' }}>We&apos;d love to hear from you. Please get in touch with any questions or feedback.</p>
            </div>

            <div className="grid grid-2" style={{ gap: '3rem' }}>
                <div className="flex flex-col gap-8">
                    <div className="flex items-start gap-4">
                        <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--primary)15', color: 'var(--primary)' }}>
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Support</h3>
                            <p style={{ color: 'var(--muted)' }}>Our friendly team is here to help.</p>
                            <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>cmkfinancialindianpayment@gmail.com</p>
                            <p style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '0.25rem' }}>Call: +91 758699433</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--secondary)15', color: 'var(--secondary)' }}>
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Company Info</h3>
                            <p style={{ color: 'var(--muted)' }}>Operated by</p>
                            <p style={{ fontWeight: 700, marginTop: '0.5rem' }}>CMK FINANCIAL INDIAN PAYMENT PVT LTD</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#10b98115', color: '#10b981' }}>
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Headquarters</h3>
                            <p style={{ color: 'var(--muted)' }}>Badalpur, Ramnagar, Purba Medinipur</p>
                            <p style={{ fontWeight: 600, marginTop: '0.5rem' }}>West Bengal, India - 721423</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Name</label>
                            <input type="text" placeholder="Your Name" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email</label>
                            <input type="email" placeholder="you@company.com" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Message</label>
                            <textarea rows={4} placeholder="How can we help?" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', resize: 'none' }}></textarea>
                        </div>
                        <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }}>Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

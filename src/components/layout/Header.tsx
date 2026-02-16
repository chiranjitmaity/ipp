'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Search, Menu, FileText } from 'lucide-react';
import { useState } from 'react';

import { useSession, signOut } from 'next-auth/react';

import { AnalyticsService } from '@/lib/analytics-service';

export const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session } = useSession();
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;

        if (searchTimeout) clearTimeout(searchTimeout);

        setSearchTimeout(setTimeout(() => {
            AnalyticsService.trackSearch(query);
        }, 1000));
    };

    return (
        <header className="header" style={{
            height: 'var(--header-height)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--background)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center'
        }}>
            <div className="container flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2" style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>
                    <FileText size={32} />
                    <span style={{ color: 'var(--foreground)' }}>ilovepdftools</span>
                </Link>

                <nav className="desktop-nav flex items-center gap-8">
                    <Link href="/tools/pdf" style={{ fontWeight: 600 }}>PDF Tools</Link>
                    <Link href="/tools/image" style={{ fontWeight: 600 }}>Image Tools</Link>
                    <Link href="/tools/document" style={{ fontWeight: 600 }}>Document Tools</Link>
                    <Link href="/blog" style={{ fontWeight: 600 }}>Blog</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="btn" style={{ padding: '0.5rem' }}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <div className="search-container" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            onChange={handleSearch}
                            style={{
                                padding: '0.5rem 1rem 0.5rem 2.5rem',
                                borderRadius: '20px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--card)',
                                color: 'var(--foreground)',
                                width: '200px'
                            }}
                        />
                    </div>
                    {session ? (
                        <div className="flex items-center gap-3">
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Hi, {session.user?.name?.split(' ')[0]}</span>
                            <button
                                onClick={() => signOut()}
                                className="btn"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', border: '1px solid var(--border)' }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Login</Link>
                    )}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="btn md-hidden" style={{ display: 'none' }}>
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .md-hidden { display: block !important; }
        }
        @media (min-width: 769px) {
            .desktop-nav { display: flex !important; }
            .md-hidden { display: none !important; }
        }
        @media (max-width: 640px) {
            .search-container { display: none !important; }
        }
      `}</style>
        </header>
    );
};

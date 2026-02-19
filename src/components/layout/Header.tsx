'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Search, Menu, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TOOLS, Tool } from '@/data/tools';

import { useSession, signOut } from 'next-auth/react';

import { AnalyticsService } from '@/lib/analytics-service';

export const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session } = useSession();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Tool[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = TOOLS.filter(tool =>
            tool.title.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query) ||
            tool.id.toLowerCase().includes(query)
        );

        setSearchResults(results);
        setIsSearchOpen(true);
        AnalyticsService.trackSearch(query); // Track search queries
    }, [searchQuery]);

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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => { if (searchQuery) setIsSearchOpen(true); }}
                            onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)} // Delay to allow click
                            style={{
                                padding: '0.5rem 1rem 0.5rem 2.5rem',
                                borderRadius: '20px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--card)',
                                color: 'var(--foreground)',
                                width: '200px'
                            }}
                        />
                        {/* Search Results Dropdown */}
                        {isSearchOpen && searchQuery && (
                            <div
                                onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '0.5rem',
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    zIndex: 1001,
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    width: '300px'
                                }}>
                                {searchResults.length > 0 ? (
                                    <div className="flex flex-col">
                                        {searchResults.map(tool => (
                                            <Link
                                                key={tool.id}
                                                href={tool.href}
                                                onClick={() => {
                                                    setIsSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderBottom: '1px solid var(--border)',
                                                    textDecoration: 'none',
                                                    color: 'var(--foreground)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    fontSize: '0.875rem'
                                                }}
                                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <tool.icon size={16} />
                                                <span>{tool.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                        No tools found
                                    </div>
                                )}
                            </div>
                        )}
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

            {/* Mobile Menu Overlay */}
            {
                isMenuOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 'var(--header-height)',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'var(--background)',
                            zIndex: 999,
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            overflowY: 'auto'
                        }}
                    >
                        <nav className="flex flex-col gap-4">
                            <Link href="/tools/pdf" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600 }}>PDF Tools</Link>
                            <Link href="/tools/image" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600 }}>Image Tools</Link>
                            <Link href="/tools/document" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600 }}>Document Tools</Link>
                            <Link href="/blog" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600 }}>Blog</Link>
                        </nav>
                    </div>
                )
            }

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
        </header >
    );
};

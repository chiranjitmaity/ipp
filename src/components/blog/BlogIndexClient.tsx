'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogPost } from '@/data/blogs';
import { Search } from 'lucide-react';

interface Props {
    posts: BlogPost[];
}

export default function BlogIndexClient({ posts }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPosts = posts.filter(post => {
        const term = searchTerm.toLowerCase();
        return (
            post.title.toLowerCase().includes(term) ||
            (post.description && post.description.toLowerCase().includes(term)) ||
            (post.keywords && post.keywords.some(keyword => keyword.toLowerCase().includes(term)))
        );
    });

    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800 }}>iLovePDF Blog</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', marginBottom: '2rem' }}>
                    Master your files with our comprehensive guides. Learn how to merge, compress, convert, and edit like a pro.
                </p>

                <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
                        <Search size={20} />
                    </div>
                    <input
                        type="search"
                        placeholder="Search tutorials, guides, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1.25rem 1.25rem 1.25rem 3.5rem',
                            fontSize: '1.125rem',
                            borderRadius: '100px',
                            border: '2px solid var(--border)',
                            backgroundColor: 'white',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border)';
                            // Slight delay to allow clicks on dropdown items
                            setTimeout(() => setSearchTerm(''), 200);
                        }}
                    />

                    {/* Auto Dropdown Menu */}
                    <AnimatePresence>
                        {searchTerm.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '0.5rem',
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '0.5rem',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    border: '1px solid var(--border)',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    textAlign: 'left'
                                }}
                            >
                                {filteredPosts.length > 0 ? (
                                    filteredPosts.map((post) => (
                                        <Link
                                            key={post.slug}
                                            href={`/blog/${post.slug}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '0.75rem 1rem',
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                borderRadius: '8px',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            className="hover:bg-gray-50 drop-link"
                                        >
                                            <div style={{ fontSize: '1.5rem', minWidth: '30px', textAlign: 'center' }}>
                                                {post.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--foreground)' }}>{post.title}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                                                    {post.description}
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted)' }}>
                                        No articles found.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {filteredPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--muted)' }}>No articles found matching "{searchTerm}"</p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="btn btn-primary"
                        style={{ marginTop: '1rem' }}
                    >
                        Clear Search
                    </button>
                </div>
            ) : (
                <div className="grid grid-3">
                    {filteredPosts.map((post) => (
                        <motion.div
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Link href={`/blog/${post.slug}`} className="card flex flex-col gap-4 h-full" style={{ textDecoration: 'none', padding: '2rem', border: '1px solid var(--border)', transition: 'all 0.3s ease' }}>
                                <div style={{
                                    height: '240px',
                                    backgroundColor: 'var(--primary)05',
                                    borderRadius: 'var(--radius)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '5rem',
                                    border: '1px solid var(--primary)10'
                                }}>
                                    {post.icon}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>{post.date}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{post.readTime}</span>
                                    </div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>{post.title}</h2>
                                    <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6 }}>{post.description}</p>
                                </div>
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                                    Read Full Guide
                                    <span style={{ fontSize: '1.25rem' }}>→</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

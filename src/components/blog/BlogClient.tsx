'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { BlogPost } from '@/data/blogs';
import { Tool } from '@/data/tools';

interface BlogClientProps {
    post: BlogPost;
    tool?: Omit<Tool, 'icon'>;
}

export default function BlogClient({ post, tool }: BlogClientProps) {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>
                    <ArrowLeft size={20} />
                    Back to all guides
                </Link>
            </motion.div>

            <header style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary)15', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.875rem', fontWeight: 700 }}>
                        {tool?.category || 'Tutorial'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                        <Calendar size={16} />
                        {post.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                        <Clock size={16} />
                        {post.readTime}
                    </div>
                </div>

                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                    {post.title}
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                    {post.description}
                </p>
            </header>

            <div style={{ display: 'flex', gap: '4rem', flexDirection: 'column' }}>
                <div
                    className="blog-content"
                    style={{
                        fontSize: '1.125rem',
                        lineHeight: 1.8,
                        color: 'var(--foreground)'
                    }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {tool && (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        style={{
                            padding: '3rem',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            borderRadius: 'var(--radius)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1.5rem'
                        }}
                    >
                        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Ready to try this tool?</h2>
                        <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                            Use our free, professional {tool.title} tool to get your work done in seconds.
                        </p>
                        <Link href={tool.href} className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: 800, padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
                            Go to {tool.title} Tool
                        </Link>
                    </motion.div>
                )}
            </div>

            <style jsx global>{`
                .blog-content h2 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                }
                .blog-content p {
                    margin-bottom: 1.5rem;
                }
                .blog-content ol, .blog-content ul {
                    margin-bottom: 2rem;
                    padding-left: 1.5rem;
                }
                .blog-content li {
                    margin-bottom: 1rem;
                }
                .blog-content strong {
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
}

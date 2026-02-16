'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '@/data/blogs';

export default function BlogIndexClient() {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800 }}>iLovePDF Blog</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
                    Master your files with our comprehensive guides. Learn how to merge, compress, convert, and edit like a pro.
                </p>
            </div>

            <div className="grid grid-3">
                {BLOG_POSTS.map((post) => (
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
        </div>
    );
}

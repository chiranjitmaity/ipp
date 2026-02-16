import { Tool, TOOLS } from '@/data/tools';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CategoryPageProps {
    category: string;
    title: string;
    description: string;
}

export default function CategoryPage({ category, title, description }: CategoryPageProps) {
    const categoryTools = TOOLS.filter(t => t.category === category);

    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 800 }}>{title}</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
                    {description}
                </p>
            </div>

            <div className="grid grid-3">
                {categoryTools.map((tool) => (
                    <Link key={tool.id} href={tool.href} className="card hover-card" style={{ textDecoration: 'none' }}>
                        <div style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <tool.icon size={48} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>{tool.title}</h3>
                        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{tool.description}</p>
                        <div className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Use Tool <ArrowRight size={16} />
                        </div>
                    </Link>
                ))}
            </div>

            {categoryTools.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '4rem' }}>
                    <p>No tools found in this category yet.</p>
                </div>
            )}
        </div>
    );
}

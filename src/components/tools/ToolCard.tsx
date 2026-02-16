'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolCardProps {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    color?: string;
}

export const ToolCard = ({ title, description, href, icon: Icon, color = 'var(--primary)' }: ToolCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Link href={href} className="card flex flex-col gap-4 h-full" style={{ textDecoration: 'none' }}>
                <div
                    className="flex items-center justify-center"
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: `${color}15`,
                        color: color
                    }}
                >
                    <Icon size={24} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>{title}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{description}</p>
                </div>
            </Link>
        </motion.div>
    );
};

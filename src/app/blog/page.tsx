import { Metadata } from 'next';
import BlogIndexClient from '@/components/blog/BlogIndexClient';

export const metadata: Metadata = {
    title: 'Blog & Tutorials | ilovepdftools',
    description: 'Master your files with our comprehensive guides. Learn how to merge, compress, convert, and edit PDFs and images with our professional online tools.',
    keywords: 'pdf tutorials, online file converter guides, merge pdf help, compress pdf tips, excel to pdf guide, image editing tutorials',
};

export default function BlogIndexPage() {
    return <BlogIndexClient />;
}

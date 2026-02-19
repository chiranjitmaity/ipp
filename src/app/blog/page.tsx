import { Metadata } from 'next';
import BlogIndexClient from '@/components/blog/BlogIndexClient';
import { BlogService } from '@/lib/blog-service';

export const metadata: Metadata = {
    title: 'Blog & Tutorials | ilovepdftools',
    description: 'Master your files with our comprehensive guides. Learn how to merge, compress, convert, and edit PDFs and images with our professional online tools.',
    keywords: 'pdf tutorials, online file converter guides, merge pdf help, compress pdf tips, excel to pdf guide, image editing tutorials',
};

export const revalidate = 60; // Revalidate every minute for dynamic content

export default async function BlogIndexPage() {
    const posts = await BlogService.getAllBlogs();
    return <BlogIndexClient posts={posts} />;
}

import { Metadata } from 'next';
import { BlogService } from '@/lib/blog-service';
import { TOOLS } from '@/data/tools';
import BlogClient from '@/components/blog/BlogClient';
import Link from 'next/link';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await BlogService.getBlogBySlug(slug);

    if (!post) {
        return {
            title: 'Post Not Found | ilovepdftools',
            description: 'The requested guide could not be found.'
        };
    }

    return {
        title: `${post.title} | ilovepdftools Blog`,
        description: post.description,
        keywords: post.keywords.join(', '),
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.date,
            authors: ['ilovepdftools Team'],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await BlogService.getBlogBySlug(slug);
    const tool = TOOLS.find(t => t.id === post?.toolId);

    if (!post) {
        return (
            <div className="container" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Post Not Found</h1>
                <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>The guide you are looking for does not exist.</p>
                <Link href="/blog" className="btn btn-primary">Back to Blog</Link>
            </div>
        );
    }

    // We need to ensure we're passing a plain object. 
    // Let's create a clean object without the icon property.
    const safeTool = tool ? {
        id: tool.id,
        title: tool.title,
        description: tool.description,
        category: tool.category,
        href: tool.href,
        popular: tool.popular,
        accept: tool.accept,
    } : undefined;

    return (
        <BlogClient
            post={post}
            tool={safeTool}
        />
    );
}

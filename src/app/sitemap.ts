import { MetadataRoute } from 'next';
import { TOOLS } from '@/data/tools';
import { BLOG_POSTS } from '@/data/blogs';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.pdffileconverter.online';

    // Generate URLs for all tools
    const toolUrls: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
        url: `${baseUrl}/tools/${tool.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Generate URLs for all blog posts
    const blogUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        // Try to parse the date, fallback to current date if it fails
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    // Define core static routes
    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/tools`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...toolUrls,
        ...blogUrls,
    ];
}

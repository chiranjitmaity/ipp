import { BLOG_POSTS, BlogPost } from '@/data/blogs';
import clientPromise from './mongodb';

export const BlogService = {
    getAllBlogs: async (): Promise<BlogPost[]> => {
        try {
            // 1. Get static blogs
            const staticBlogs = [...BLOG_POSTS];

            // 2. Get dynamic blogs from MongoDB
            const client = await clientPromise;
            const db = client.db('ilovepdftools');
            const dynamicBlogsRaw = await db.collection('blogs').find({}).sort({ createdAt: -1 }).toArray();

            // Transform Mongo docs to BlogPost type (handle optional fields if needed)
            const dynamicBlogs: BlogPost[] = dynamicBlogsRaw.map(doc => ({
                slug: doc.slug,
                title: doc.title,
                description: doc.description,
                content: doc.content,
                date: doc.date,
                readTime: doc.readTime || '5 min read',
                icon: doc.icon || '📝',
                toolId: doc.toolId,
                keywords: doc.keywords || []
            }));

            // 3. Merge them (Dynamic First? or Date sorted? Let's put dynamic first for now)
            return [...dynamicBlogs, ...staticBlogs];
        } catch (error) {
            console.error("Failed to fetch merged blogs:", error);
            return BLOG_POSTS; // Fallback to static content
        }
    },

    getBlogBySlug: async (slug: string): Promise<BlogPost | undefined> => {
        try {
            // 1. Try to find in DB first
            const client = await clientPromise;
            const db = client.db('ilovepdftools');
            const doc = await db.collection('blogs').findOne({ slug });

            if (doc) {
                return {
                    slug: doc.slug,
                    title: doc.title,
                    description: doc.description,
                    content: doc.content,
                    date: doc.date,
                    readTime: doc.readTime || '5 min read',
                    icon: doc.icon || '📝',
                    toolId: doc.toolId,
                    keywords: doc.keywords || []
                };
            }

            // 2. Fallback to static file
            return BLOG_POSTS.find(post => post.slug === slug);
        } catch (error) {
            console.error("Error fetching blog by slug:", error);
            // Fallback to static
            return BLOG_POSTS.find(post => post.slug === slug);
        }
    }
};

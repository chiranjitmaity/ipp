import { BLOG_POSTS, BlogPost } from '@/data/blogs';
import { TOOLS } from '@/data/tools';
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
            const staticPost = BLOG_POSTS.find(post => post.slug === slug);
            if (staticPost) return staticPost;

            // 3. Dynamic Generation for Tools
            // Check if slug matches a tool or 'how-to-use-[tool-id]'
            // Simplify: Check if any tool ID is contained in the slug
            const tool = TOOLS.find(t => slug === `how-to-use-${t.id}` || slug === t.id);

            if (tool) {
                return {
                    slug: slug,
                    toolId: tool.id,
                    title: `How to Use ${tool.title} - Free Online Tool`,
                    description: `Learn how to use our free ${tool.title} tool. ${tool.description}`,
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    readTime: '3 min read',
                    icon: '🚀',
                    keywords: [tool.title, 'online tool', 'free utility', tool.category],
                    content: `
                        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                            <div class="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h3 class="text-lg font-bold text-blue-900 m-0">Try ${tool.title} Now</h3>
                                    <p class="text-sm text-blue-700 m-0">Fast, free, and secure.</p>
                                </div>
                                <a href="${tool.href}" class="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
                                    Open Tool &rarr;
                                </a>
                            </div>
                        </div>
                        <h2>Introduction</h2>
                        <p>Welcome to our comprehensive guide on how to use the <strong>${tool.title}</strong>. In today's digital age, having the right utilities at your fingertips is essential. Our ${tool.title} is designed to simplify your workflow.</p>
                        
                        <h2>What is ${tool.title}?</h2>
                        <p>${tool.description}</p>
                        <p>Whether you are a student, professional, or just someone looking to get things done, this tool provides a quick and easy solution without the need for expensive software.</p>

                        <h2>Step-by-Step Guide</h2>
                        <ol>
                            <li><strong>Access the Tool:</strong> Navigate to the <a href="${tool.href}">${tool.title} page</a>.</li>
                            <li><strong>Upload or Input:</strong> Depending on the tool, upload your file or enter your data.</li>
                            <li><strong>Process:</strong> Click the action button to let our secure engine handle the task.</li>
                            <li><strong>Download:</strong> Get your results instantly.</li>
                        </ol>

                        <h2>Why Use Our ${tool.title}?</h2>
                        <ul>
                            <li><strong>Free:</strong> No hidden costs or subscriptions.</li>
                            <li><strong>Secure:</strong> We prioritize your privacy. Files are processed securely.</li>
                            <li><strong>Fast:</strong> Optimized for performance on any device.</li>
                        </ul>

                        <h2>Conclusion</h2>
                        <p>We hope this guide helped you understand how to use the ${tool.title}. Bookmark our site for more free and useful utilities.</p>
                    `
                };
            }

            return undefined;
        } catch (error) {
            console.error("Error fetching blog by slug:", error);
            // Fallback to static
            return BLOG_POSTS.find(post => post.slug === slug);
        }
    }
};

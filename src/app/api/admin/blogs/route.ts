import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ilovepdftools');
        const blogs = await db.collection('blogs').find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json(blogs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db('ilovepdftools');

        // Basic validation
        if (!body.title || !body.slug || !body.content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newBlog = {
            ...body,
            date: body.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('blogs').insertOne(newBlog);
        return NextResponse.json({ success: true, id: result.insertedId, blog: newBlog }, { status: 201 });
    } catch (error) {
        console.error('Create Blog Error:', error);
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}

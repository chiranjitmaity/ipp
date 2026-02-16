
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db('ilovepdftools');
        const collection = db.collection('tools');

        // Basic validation
        if (!body.title || !body.id) {
            return NextResponse.json({ error: 'Title and ID are required' }, { status: 400 });
        }

        await collection.insertOne({
            ...body,
            code: body.code || '', // Store dynamic code, default to empty
            createdAt: new Date(),
            updatedAt: new Date(),
            active: true
        });

        return NextResponse.json({ success: true, message: 'Tool added successfully' }, { status: 201 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ilovepdftools');
        const collection = db.collection('tools');

        const tools = await collection.find({ active: true }).toArray();

        return NextResponse.json(tools);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

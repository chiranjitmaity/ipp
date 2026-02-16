
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db('ilovepdftools');
        const collection = db.collection('analytics');

        const { type, data, url, timestamp } = body;
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || '0.0.0.0';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await collection.insertOne({
            type,
            data,
            url,
            timestamp: new Date(timestamp), // Ensure stored as Date type
            ip,
            userAgent,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Simple auth check or restriction could be added here
        const client = await clientPromise;
        const db = client.db('ilovepdftools');
        const collection = db.collection('analytics');

        // Fetch last 100 events
        const events = await collection.find({}).sort({ createdAt: -1 }).limit(100).toArray();

        return NextResponse.json(events);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

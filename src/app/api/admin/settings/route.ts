
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db('ilovepdftools');
        const collection = db.collection('settings');

        // Upsert settings (we only want one document for global settings)
        await collection.updateOne(
            { type: 'global_monetization' },
            {
                $set: {
                    ...body,
                    updatedAt: new Date(),
                    type: 'global_monetization'
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ilovepdftools');
        const collection = db.collection('settings');

        const settings = await collection.findOne({ type: 'global_monetization' });

        return NextResponse.json(settings || {});
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

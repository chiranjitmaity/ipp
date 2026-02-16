
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/hash';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ilovepdftools');
        const usersCollection = db.collection('users');

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Create new user
        const hashedPassword = hashPassword(password);
        const newUser = {
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date(),
        };

        await usersCollection.insertOne(newUser);

        return NextResponse.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

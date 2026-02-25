import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import BuilderContact from '@/models/BuilderContact';

export async function POST(request) {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoose.connection.readyState) {
            await mongoose.connect(mongoUri);
        }

        const body = await request.json();
        const contact = await BuilderContact.create(body);

        return NextResponse.json({ success: true, data: contact }, { status: 201 });
    } catch (error) {
        console.error('Error submitting builder contact:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

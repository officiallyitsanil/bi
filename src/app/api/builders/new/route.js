import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import NewBuilders from '@/models/NewBuilders';

export async function POST(request) {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoose.connection.readyState) {
            await mongoose.connect(mongoUri);
        }

        const body = await request.json();
        const newBuilder = await NewBuilders.create(body);

        return NextResponse.json({ success: true, data: newBuilder }, { status: 201 });
    } catch (error) {
        console.error('Error creating builder application:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

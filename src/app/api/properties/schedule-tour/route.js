import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ScheduleTour from '@/models/ScheduleTour';

export async function POST(request) {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoose.connection.readyState) {
            await mongoose.connect(mongoUri);
        }

        const body = await request.json();
        const tour = await ScheduleTour.create(body);

        return NextResponse.json({ success: true, data: tour }, { status: 201 });
    } catch (error) {
        console.error('Error scheduling tour:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

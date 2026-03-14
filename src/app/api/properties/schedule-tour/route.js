import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import ScheduleTour from '@/models/ScheduleTour';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { name, phone, email, tourDate, tourTime, tourType, message, propertyId, propertyName, propertyType } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ success: false, message: 'Name is required.' }, { status: 400 });
        }
        if (!tourTime || !tourTime.trim()) {
            return NextResponse.json({ success: false, message: 'Please select a tour time.' }, { status: 400 });
        }

        const tour = await ScheduleTour.create({
            name: name.trim(),
            phone: phone?.trim(),
            email: email?.trim(),
            tourDate: tourDate ? new Date(tourDate) : undefined,
            tourTime: tourTime.trim(),
            tourType: tourType === 'video-chat' ? 'video-chat' : 'in-person',
            message: message?.trim(),
            propertyId,
            propertyName: propertyName?.trim(),
            propertyType: propertyType || 'commercial',
        });

        return NextResponse.json({ success: true, data: tour, message: 'Tour scheduled successfully!' }, { status: 201 });
    } catch (error) {
        console.error('Error scheduling tour:', error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to schedule tour' }, { status: 500 });
    }
}

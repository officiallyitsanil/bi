import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import CommercialProperty from '@/models/CommercialProperty';
import ResidentialProperty from '@/models/ResidentialProperty';

export async function POST(request) {
    try {
        await dbConnect();
        const { id, type } = await request.json();

        if (!id || !type) {
            return NextResponse.json(
                { success: false, message: 'Property ID and type are required' },
                { status: 400 }
            );
        }

        let result;
        if (type === 'commercial') {
            result = await CommercialProperty.findByIdAndUpdate(
                id,
                { $inc: { visitorCount: 1 } },
                { new: true }
            );
        } else if (type === 'residential') {
            result = await ResidentialProperty.findByIdAndUpdate(
                id,
                { $inc: { visitorCount: 1 } },
                { new: true }
            );
        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid property type' },
                { status: 400 }
            );
        }

        if (!result) {
            return NextResponse.json(
                { success: false, message: 'Property not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Visitor count incremented',
            visitorCount: result.visitorCount
        });

    } catch (error) {
        console.error('Error incrementing visitor count:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}

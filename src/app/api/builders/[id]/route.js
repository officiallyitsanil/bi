import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Builder from '@/models/Builder';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { id } = params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid builder ID format' },
                { status: 400 }
            );
        }

        const builder = await Builder.findById(id);

        if (!builder) {
            return NextResponse.json(
                { success: false, message: 'Builder not found' },
                { status: 404 }
            );
        }

        // Convert to plain object and ensure _id is string
        const builderObj = builder.toObject();
        builderObj._id = builderObj._id.toString();

        return NextResponse.json({
            success: true,
            builder: builderObj
        });

    } catch (error) {
        console.error('Error fetching builder:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch builder',
                error: error.message
            },
            { status: 500 }
        );
    }
}

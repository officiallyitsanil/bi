import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Builder from '@/models/Builder';

export async function GET(request) {
    try {
        await dbConnect();

        // Get query parameters
        const url = new URL(request.url);
        const category = url.searchParams.get('category');
        const status = url.searchParams.get('status');

        // Build query
        let query = {};
        if (category) {
            query.builderCategory = category;
        }
        if (status) {
            query.status = status;
        }

        const builders = await Builder.find(query).select('-__v');

        // Convert _id to string for each builder
        const buildersWithStringId = builders.map(builder => {
            const obj = builder.toObject();
            obj._id = obj._id.toString();
            return obj;
        });

        return NextResponse.json({
            success: true,
            data: buildersWithStringId
        });

    } catch (error) {
        console.error('Error fetching builders:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch builders',
                error: error.message
            },
            { status: 500 }
        );
    }
}

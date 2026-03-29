import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Builder from '@/models/Builder';
import mongoose from 'mongoose';
import { USE_DUMMY_PROPERTIES } from '@/lib/dummyProperties';
import { ALL_BUILDERS } from '@/data/builders';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const url = new URL(request.url);
        const nameQuery = url.searchParams.get('name');
        
        if (USE_DUMMY_PROPERTIES) {
            const decodedId = decodeURIComponent(id).replace(/-/g, ' ').toLowerCase();
            const decodedName = nameQuery ? decodeURIComponent(nameQuery).replace(/-/g, ' ').toLowerCase() : null;
            
            const builder = ALL_BUILDERS.find(b => 
                (b.id && b.id.toLowerCase() === id.toLowerCase()) || 
                (b._id && String(b._id) === id) ||
                (b.name && b.name.toLowerCase().replace(/-/g, ' ') === decodedId) ||
                (decodedName && b.name && b.name.toLowerCase().replace(/-/g, ' ') === decodedName)
            );
            
            if (!builder) {
                return NextResponse.json({ success: false, message: 'Builder not found in dummy data' }, { status: 404 });
            }
            return NextResponse.json({ success: true, builder });
        }
        
        await dbConnect();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid builder ID format' }, { status: 400 });
        }
        
        const builder = await Builder.findById(id).lean();

        if (!builder) {
            return NextResponse.json(
                { success: false, message: 'Builder not found' },
                { status: 404 }
            );
        }

        const builderObj = { ...builder, _id: builder._id.toString(), id: builder._id.toString() };

        return NextResponse.json({
            success: true,
            builder: builderObj,
        });
    } catch (error) {
        console.error('Error fetching builder:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch builder',
                error: error.message,
            },
            { status: 500 }
        );
    }
}

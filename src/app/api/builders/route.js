import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Builder from '@/models/Builder';
import { USE_DUMMY_PROPERTIES } from '@/lib/dummyProperties';
import { ALL_BUILDERS } from '@/data/builders';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const category = url.searchParams.get('category');
        const status = url.searchParams.get('status');
        const name = url.searchParams.get('name');

        if (USE_DUMMY_PROPERTIES) {
            let data = ALL_BUILDERS;
            if (name) {
                const decodedName = decodeURIComponent(name).replace(/-/g, ' ');
                data = data.filter(b => b.name.toLowerCase() === decodedName.toLowerCase());
            }
            if (category) data = data.filter(b => b.category === category);
            if (status) data = data.filter(b => b.status === status);
            return NextResponse.json({ success: true, data });
        }

        await dbConnect();

        let query = {};
        if (category) query.category = category;
        if (status) query.status = status;

        const builders = await Builder.find(query).sort({ createdAt: -1 }).lean();
        const data = builders.map(b => ({ ...b, _id: b._id.toString(), id: b._id.toString() }));

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching builders:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch builders',
                error: error.message,
            },
            { status: 500 }
        );
    }
}

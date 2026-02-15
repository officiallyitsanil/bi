import { NextResponse } from 'next/server';
import { BUILDERS_BY_ID } from '@/data/builders';

// For now: return dummy data. When switching to DB, remove dummy and use:
//   await dbConnect();
//   const builders = await Builder.find(query).select('-__v');
//   return NextResponse.json({ success: true, data: builders.map(b => ({ ...b.toObject(), _id: b._id.toString() }) });

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const category = url.searchParams.get('category');
        const status = url.searchParams.get('status');

        let list = Object.values(BUILDERS_BY_ID);

        if (category) {
            list = list.filter(b => (b.category || '') === category);
        }
        if (status) {
            list = list.filter(b => (b.status || '') === status);
        }

        const data = list.map(b => ({ ...b, _id: b.id }));

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

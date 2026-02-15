import { NextResponse } from 'next/server';
import { getBuilderById } from '@/data/builders';

// For now: return dummy data by id. When switching to DB, remove dummy and use:
//   await dbConnect();
//   if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid builder ID format' }, { status: 400 });
//   const builder = await Builder.findById(id);
//   if (!builder) return NextResponse.json({ success: false, message: 'Builder not found' }, { status: 404 });
//   const obj = builder.toObject(); obj._id = obj._id.toString();
//   return NextResponse.json({ success: true, builder: obj });

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const builder = getBuilderById(id);

        if (!builder) {
            return NextResponse.json(
                { success: false, message: 'Builder not found' },
                { status: 404 }
            );
        }

        const builderObj = { ...builder, _id: builder.id };

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

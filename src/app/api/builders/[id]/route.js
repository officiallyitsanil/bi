import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Builder from '@/models/Builder';
import mongoose from 'mongoose';
import { USE_DUMMY_PROPERTIES } from '@/lib/dummyProperties';
import { ALL_BUILDERS } from '@/data/builders';

/**
 * Recursively converts all BSON ObjectId and Date values to plain strings/ISO strings.
 * Works with Mongoose 7/8+ and BSON v4/v5/v6.
 */
function serializeBSON(obj) {
    if (obj === null || obj === undefined) return obj;

    // ObjectId — check all known BSON representations
    if (
        obj instanceof mongoose.Types.ObjectId ||
        (obj && typeof obj === 'object' && typeof obj.toHexString === 'function')
    ) {
        return obj.toHexString ? obj.toHexString() : obj.toString();
    }

    // Date
    if (obj instanceof Date) return obj.toISOString();

    // Buffer (binary)
    if (Buffer.isBuffer(obj)) return obj.toString('hex');

    // Array
    if (Array.isArray(obj)) return obj.map(serializeBSON);

    // Plain object
    if (typeof obj === 'object') {
        const out = {};
        for (const key of Object.keys(obj)) {
            out[key] = serializeBSON(obj[key]);
        }
        return out;
    }

    return obj;
}

export async function GET(request, { params }) {
    let id;
    try {
        const resolvedParams = await params;
        id = resolvedParams?.id;

        if (!id) {
            return NextResponse.json({ success: false, message: 'No builder id provided' }, { status: 400 });
        }

        if (USE_DUMMY_PROPERTIES) {
            const decodedId = decodeURIComponent(id).replace(/-/g, ' ').toLowerCase();
            const url = new URL(request.url);
            const nameQuery = url.searchParams.get('name');
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

        let rawBuilder = null;

        // Try by ObjectId first
        if (mongoose.Types.ObjectId.isValid(id)) {
            try {
                rawBuilder = await Builder.findById(id).lean();
            } catch (e) {
                console.error('[builders/[id]] findById error:', e.message);
            }
        }

        // Fallback: search by slug / name / builderName
        if (!rawBuilder) {
            const decodedId = decodeURIComponent(id);
            try {
                rawBuilder = await Builder.findOne({
                    $or: [
                        { 'seo.urlSlug': decodedId },
                        { 'seo.urlSlug': decodedId.toLowerCase() },
                        { name: { $regex: new RegExp(`^${decodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
                        { builderName: { $regex: new RegExp(`^${decodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
                    ]
                }).lean();
            } catch (e) {
                console.error('[builders/[id]] findOne by slug/name error:', e.message);
                throw e;
            }
        }

        if (!rawBuilder) {
            return NextResponse.json({ success: false, message: 'Builder not found' }, { status: 404 });
        }

        // Safe deep serialization — no BSON objects reach JSON.stringify
        let builderObj;
        try {
            builderObj = serializeBSON(rawBuilder);
        } catch (e) {
            console.error('[builders/[id]] serializeBSON error:', e.message);
            throw e;
        }

        return NextResponse.json({ success: true, builder: builderObj });

    } catch (error) {
        console.error(`[builders/[id]] GET error for id="${id}":`, error);
        return NextResponse.json(
            { success: false, message: 'Server error while fetching builder', error: error.message },
            { status: 500 }
        );
    }
}

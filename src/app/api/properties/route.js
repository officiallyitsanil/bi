import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';

function normalizeProperty(prop) {
    const id = (prop._id && typeof prop._id.toString === 'function') ? prop._id.toString() : String(prop._id || prop.id || '');
    const out = { ...prop, _id: id, id };
    if (out.createdAt && typeof out.createdAt === 'object' && out.createdAt.$date) out.createdAt = out.createdAt.$date;
    if (out.updatedAt && typeof out.updatedAt === 'object' && out.updatedAt.$date) out.updatedAt = out.updatedAt.$date;
    if (out.publishedAt && typeof out.publishedAt === 'object' && out.publishedAt.$date) out.publishedAt = out.publishedAt.$date;
    if (out.createdBy && out.createdBy?.$oid) out.createdBy = out.createdBy.$oid;
    if (out.updatedBy && out.updatedBy?.$oid) out.updatedBy = out.updatedBy.$oid;
    return out;
}

export async function GET(request) {
    try {
        await dbConnect();
        const db = mongoose.connection.db;
        const ObjectId = mongoose.Types.ObjectId;

        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const type = url.searchParams.get('type');

        if (id) {
            const isValidId = /^[a-fA-F0-9]{24}$/.test(id);
            if (!isValidId) {
                return NextResponse.json(
                    { success: false, message: 'Invalid property ID format' },
                    { status: 400 }
                );
            }
            let property = null;
            if (type === 'commercial') {
                property = await db.collection('commercialProperties').findOne({ _id: new ObjectId(id) });
            } else if (type === 'residential') {
                property = await db.collection('residentialproperties').findOne({ _id: new ObjectId(id) });
            } else {
                property = await db.collection('residentialproperties').findOne({ _id: new ObjectId(id) });
                if (!property) property = await db.collection('commercialProperties').findOne({ _id: new ObjectId(id) });
            }
            if (!property) {
                return NextResponse.json(
                    { success: false, message: `Property not found in ${type || 'any'} collection` },
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, property: normalizeProperty(property) });
        }

        let allProperties = [];
        if (type === 'commercial') {
            allProperties = await db.collection('commercialProperties').find({}).toArray();
        } else if (type === 'residential') {
            allProperties = await db.collection('residentialproperties').find({}).toArray();
        } else {
            const c = await db.collection('commercialProperties').find({}).toArray();
            const r = await db.collection('residentialproperties').find({}).toArray();
            allProperties = [...c, ...r];
        }

        const data = allProperties.map(normalizeProperty);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch properties', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    return NextResponse.json(
        { success: false, message: 'POST disabled. Use admin to create properties.' },
        { status: 503 }
    );
}

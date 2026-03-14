import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import dbConnect from '@/utils/dbConnect';
// import CommercialProperty from '@/models/CommercialProperty';
// import ResidentialProperty from '@/models/ResidentialProperty';

// For now: serve from dummy JSON files (DB logic commented out)
import commercialProperties from '@/dummy/commercial-properties.json';
import residentialProperties from '@/dummy/residential-properties.json';

// No normalization - schemas and dummy data are matched exactly

export async function GET(request) {
    try {
        // DB logic commented out - using dummy JSON files
        // await dbConnect();

        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const type = url.searchParams.get('type');

        // If ID is provided, fetch single property from dummy data
        if (id) {
            let property = null;
            if (type === 'commercial') {
                property = commercialProperties.find(p => (p._id || p.id) === id);
            } else if (type === 'residential') {
                property = residentialProperties.find(p => (p._id || p.id) === id);
            } else {
                property = residentialProperties.find(p => (p._id || p.id) === id)
                    || commercialProperties.find(p => (p._id || p.id) === id);
            }

            if (!property) {
                return NextResponse.json(
                    { success: false, message: `Property not found in ${type || 'any'} collection` },
                    { status: 404 }
                );
            }

            const prop = { ...property, _id: String(property._id || property.id), id: String(property._id || property.id) };

            return NextResponse.json({
                success: true,
                property: prop
            });
        }

        // No ID: return all properties from dummy files (so filters/sort work)
        let allProperties = [];
        if (type === 'commercial') {
            allProperties = [...commercialProperties];
        } else if (type === 'residential') {
            allProperties = [...residentialProperties];
        } else {
            allProperties = [
                ...commercialProperties,
                ...residentialProperties
            ];
        }

        const data = allProperties.map(prop => ({
            ...prop,
            _id: String(prop._id || prop.id),
            id: String(prop._id || prop.id)
        }));

        return NextResponse.json({
            success: true,
            data
        });

        /* ========== DB logic (commented out) ==========
        await dbConnect();
        if (id) {
            const db = mongoose.connection.db;
            const ObjectId = mongoose.Types.ObjectId;
            let property = null;
            if (type === 'commercial') {
                property = await db.collection('commercialProperties').findOne({ _id: new ObjectId(id) });
            } else if (type === 'residential') {
                property = await db.collection('residentialproperties').findOne({ _id: new ObjectId(id) });
            } else {
                property = await db.collection('residentialproperties').findOne({ _id: new ObjectId(id) });
                if (!property) {
                    property = await db.collection('commercialProperties').findOne({ _id: new ObjectId(id) });
                }
            }
            if (!property) {
                return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
            }
            property._id = property._id.toString();
            return NextResponse.json({ success: true, property });
        }
        let allProperties = [];
        const db = mongoose.connection.db;
        if (type === 'commercial') {
            allProperties = await db.collection('commercialProperties').find({}).toArray();
        } else if (type === 'residential') {
            allProperties = await db.collection('residentialproperties').find({}).toArray();
        } else {
            const c = await db.collection('commercialProperties').find({}).toArray();
            const r = await db.collection('residentialproperties').find({}).toArray();
            allProperties = [...c, ...r];
        }
        allProperties = allProperties.map(prop => ({ ...prop, _id: prop._id.toString() }));
        return NextResponse.json({ success: true, data: allProperties });
        ========== end DB logic ========== */

    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch properties', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    // DB logic commented out - using dummy JSON files
    return NextResponse.json(
        { success: false, message: 'POST disabled - using dummy data. DB logic commented out.' },
        { status: 503 }
    );
    /* ========== DB logic (commented out) ==========
    try {
        await dbConnect();
        const body = await request.json();
        const property = new CommercialProperty(body);
        await property.save();
        return NextResponse.json({
            success: true,
            message: 'Property created successfully',
            data: property
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create property',
            error: error.message
        }, { status: 500 });
    }
    ========== end DB logic ========== */
}

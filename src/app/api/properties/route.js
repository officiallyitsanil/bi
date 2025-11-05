import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import CommercialProperty from '@/models/CommercialProperty';
import ResidentialProperty from '@/models/ResidentialProperty';

export async function GET(request) {
    try {
        await dbConnect();

        // Get query parameters
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const type = url.searchParams.get('type');

        // If ID is provided, fetch single property
        if (id) {
            // Validate ObjectId format
            if (id.length !== 24) {
                return NextResponse.json(
                    { success: false, message: 'Invalid property ID format' },
                    { status: 400 }
                );
            }

            let property = null;

            // Search in the correct collection based on type parameter
            if (type === 'commercial') {
                property = await CommercialProperty.findById(id);
            } else if (type === 'residential') {
                property = await ResidentialProperty.findById(id);
            } else {
                // If no type specified, search both
                property = await ResidentialProperty.findById(id);

                if (!property) {
                    property = await CommercialProperty.findById(id);
                }
            }

            if (!property) {
                return NextResponse.json(
                    { success: false, message: `Property not found in ${type || 'any'} collection` },
                    { status: 404 }
                );
            }

            // Convert to plain object and ensure _id is string
            const propertyObj = property.toObject();
            propertyObj._id = propertyObj._id.toString();

            // Ensure ratings structure is properly formatted
            if (propertyObj.ratings) {
                // Convert breakdown to plain object if it exists
                if (propertyObj.ratings.breakdown) {
                    // Force convert to plain object
                    const plainBreakdown = JSON.parse(JSON.stringify(propertyObj.ratings.breakdown));
                    propertyObj.ratings.breakdown = plainBreakdown;
                }

                // Ensure arrays are properly formatted
                propertyObj.ratings.whatsGood = propertyObj.ratings.whatsGood || [];
                propertyObj.ratings.whatsBad = propertyObj.ratings.whatsBad || [];
            }

            // Ensure reviews array exists
            propertyObj.reviews = propertyObj.reviews || [];

            return NextResponse.json({
                success: true,
                property: propertyObj
            });
        }

        // If no ID, fetch all properties
        const commercialProperties = await CommercialProperty.find().select('-__v');
        const residentialProperties = await ResidentialProperty.find().select('-__v');

        const allProperties = [...commercialProperties, ...residentialProperties];

        return NextResponse.json({
            success: true,
            data: allProperties
        });

    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch properties',
                error: error.message
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
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
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create property',
                error: error.message
            },
            { status: 500 }
        );
    }
}

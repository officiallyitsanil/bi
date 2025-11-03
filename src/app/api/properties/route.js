import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import CommercialProperty from '@/models/CommercialProperty';
import ResidentialProperty from '@/models/ResidentialProperty';

export async function GET() {
    try {
        await dbConnect();

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

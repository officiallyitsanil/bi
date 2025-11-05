import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import ResidentialProperty from '@/models/ResidentialProperty';
import CommercialProperty from '@/models/CommercialProperty';

// GET - Fetch a single property by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();

    // In Next.js 15, params might be a promise
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    // Get type from URL query params
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    // Validate ObjectId format
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, message: 'Invalid property ID format' },
        { status: 400 }
      );
    }

    let property = null;
    let propertyType = type || 'unknown';

    // Search in the correct collection based on type parameter
    if (type === 'commercial') {
      property = await CommercialProperty.findById(id);
    } else if (type === 'residential') {
      property = await ResidentialProperty.findById(id);
    } else {
      // If no type specified, search both
      property = await ResidentialProperty.findById(id);
      propertyType = 'residential';

      if (!property) {
        property = await CommercialProperty.findById(id);
        propertyType = 'commercial';
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

    return NextResponse.json({
      success: true,
      property: propertyObj
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch property', error: error.message },
      { status: 500 }
    );
  }
}

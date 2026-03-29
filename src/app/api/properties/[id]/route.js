import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import ResidentialProperty from '@/models/ResidentialProperty';
import CommercialProperty from '@/models/CommercialProperty';
import { USE_DUMMY_PROPERTIES, findDummyPropertyById } from '@/lib/dummyProperties';

// GET - Fetch a single property by ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, message: 'Invalid property ID format' },
        { status: 400 }
      );
    }

    if (USE_DUMMY_PROPERTIES) {
      const property = findDummyPropertyById(id, type || '');
      if (!property) {
        return NextResponse.json(
          { success: false, message: `Property not found in ${type || 'any'} collection` },
          { status: 404 }
        );
      }
      const propertyObj = { ...property, _id: String(property._id) };
      return NextResponse.json({ success: true, property: propertyObj });
    }

    await dbConnect();

    let property = null;

    if (type === 'commercial') {
      property = await CommercialProperty.findById(id);
    } else if (type === 'residential') {
      property = await ResidentialProperty.findById(id);
    } else {
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

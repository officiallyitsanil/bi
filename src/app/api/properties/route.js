import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import CommercialProperty from '@/models/CommercialProperty';
import ResidentialProperty from '@/models/ResidentialProperty';

// Helper function to normalize property data for UI compatibility
function normalizeProperty(propertyObj) {
    // Extract images from new structure - be dynamic, don't force defaults
    const images = [];

    // Try to get images from new structure
    if (propertyObj.interiorImages && Array.isArray(propertyObj.interiorImages)) {
        propertyObj.interiorImages.forEach(img => {
            if (img?.url) images.push(img.url);
        });
    }
    if (propertyObj.seatLayoutImages && Array.isArray(propertyObj.seatLayoutImages)) {
        propertyObj.seatLayoutImages.forEach(img => {
            if (img?.url) images.push(img.url);
        });
    }

    // If no images from new structure, try legacy images array
    if (images.length === 0 && propertyObj.images && Array.isArray(propertyObj.images)) {
        propertyObj.images.forEach(img => {
            if (img && typeof img === 'string') images.push(img);
        });
    }

    // Normalize coordinates - handle multiple formats dynamically
    const coordinates = {
        lat: propertyObj.coordinates?.latitude || propertyObj.coordinates?.lat || propertyObj.position?.lat || null,
        lng: propertyObj.coordinates?.longitude || propertyObj.coordinates?.lng || propertyObj.position?.lng || null,
    };

    // Normalize address fields - be flexible with sources
    const state_name = propertyObj.address?.state || propertyObj.state_name || propertyObj.state || null;
    const city = propertyObj.address?.city || propertyObj.city || null;
    const layer_location = propertyObj.address?.locality || propertyObj.layer_location || propertyObj.location || null;
    const location_district = propertyObj.address?.district || propertyObj.address?.city || propertyObj.location_district || city;

    // Format address string dynamically from available parts (skip empty strings)
    const addressParts = [];

    // Check if address is an object with sub-fields
    if (propertyObj.address && typeof propertyObj.address === 'object') {
        if (propertyObj.address.flat && String(propertyObj.address.flat).trim()) {
            addressParts.push(String(propertyObj.address.flat).trim());
        }
        if (propertyObj.address.street && String(propertyObj.address.street).trim()) {
            addressParts.push(String(propertyObj.address.street).trim());
        }
        if (propertyObj.address.locality && String(propertyObj.address.locality).trim()) {
            addressParts.push(String(propertyObj.address.locality).trim());
        }
        if (propertyObj.address.city && String(propertyObj.address.city).trim()) {
            addressParts.push(String(propertyObj.address.city).trim());
        }
        if (propertyObj.address.district && String(propertyObj.address.district).trim()) {
            addressParts.push(String(propertyObj.address.district).trim());
        }
        if (propertyObj.address.state && String(propertyObj.address.state).trim()) {
            addressParts.push(String(propertyObj.address.state).trim());
        }
        if (propertyObj.address.pincode && String(propertyObj.address.pincode).trim()) {
            addressParts.push(String(propertyObj.address.pincode).trim());
        }
        if (propertyObj.address.country && String(propertyObj.address.country).trim()) {
            addressParts.push(String(propertyObj.address.country).trim());
        }
        if (propertyObj.address.landmark && String(propertyObj.address.landmark).trim()) {
            addressParts.push(String(propertyObj.address.landmark).trim());
        }
    }

    let address = null;
    if (addressParts.length > 0) {
        address = addressParts.join(', ');
    } else if (typeof propertyObj.address === 'string' && propertyObj.address.trim()) {
        address = propertyObj.address.trim();
    }

    // Get property name dynamically
    const name = propertyObj.propertyName || propertyObj.name || null;

    // Get featured image - only use what exists, don't force placeholder
    let featuredImageUrl = null;
    if (propertyObj.featuredImage?.url) {
        featuredImageUrl = propertyObj.featuredImage.url;
    } else if (propertyObj.featuredImageUrl) {
        featuredImageUrl = propertyObj.featuredImageUrl;
    } else if (images.length > 0) {
        featuredImageUrl = images[0];
    }

    // Normalize verification status dynamically
    const is_verified = propertyObj.verificationStatus === 'confirmed' ||
        propertyObj.verificationStatus === 'verified' ||
        propertyObj.is_verified === true ||
        false;

    // Normalize property type - use Category for logic (commercial/residential), preserve original propertyType for display
    let propertyType = null;
    // Use Category for logic checks (commercial/residential) to ensure code works correctly
    if (propertyObj.Category) {
        propertyType = propertyObj.Category.toLowerCase();
    } else if (propertyObj.propertyType) {
        // If no Category, fall back to propertyType
        propertyType = propertyObj.propertyType.toLowerCase();
    }
    
    // Preserve original propertyType value for display (e.g., "techpark", "coworking", etc.)
    // This will be used in the UI to show the specific property type
    const originalPropertyType = propertyObj.propertyType ? propertyObj.propertyType.toLowerCase() : null;

    // Build floor plans from seat layout images dynamically
    const floorPlans = {};
    if (propertyObj.seatLayoutImages && Array.isArray(propertyObj.seatLayoutImages)) {
        propertyObj.seatLayoutImages.forEach(img => {
            if (img?.tags && Array.isArray(img.tags) && img.tags.length > 0 && img.url) {
                img.tags.forEach(tag => {
                    if (!floorPlans[tag]) {
                        floorPlans[tag] = [];
                    }
                    floorPlans[tag].push(img.url);
                });
            }
        });
    }

    // If no floor plans from new structure, use legacy
    const finalFloorPlans = Object.keys(floorPlans).length > 0 ? floorPlans : propertyObj.floorPlans;

    // Extract facilities dynamically from both structures
    let facilities = [];
    if (propertyObj.facilities && Array.isArray(propertyObj.facilities)) {
        facilities = propertyObj.facilities.map(f => {
            if (typeof f === 'string') return f;
            if (f?.name) return f.name;
            return null;
        }).filter(Boolean);
    }

    // Normalize amenities - handle both old and new structures
    let amenities = [];
    if (propertyObj.amenities && Array.isArray(propertyObj.amenities)) {
        amenities = propertyObj.amenities.filter(a => a && (a.name || a.image));
    }

    // Build the normalized object - KEEP ALL ORIGINAL FIELDS
    const normalized = {
        ...propertyObj, // Keep everything from original document
        _id: propertyObj._id?.toString() || propertyObj._id,
        id: propertyObj._id?.toString() || propertyObj._id,
    };

    // Remove duplicate keys (case-insensitive duplicates)
    if (normalized.category && normalized.Category) {
        delete normalized.category; // Keep Category, remove category
    }

    // Add/override normalized fields for UI compatibility
    if (name) normalized.name = name;
    // Store original propertyType for display before overriding
    if (originalPropertyType && originalPropertyType !== propertyType) {
        normalized.displayPropertyType = originalPropertyType;
    }
    if (propertyType) normalized.propertyType = propertyType;

    // Set location fields - only if they exist
    if (state_name) normalized.state_name = state_name;
    if (city) normalized.city = city;
    if (layer_location) normalized.layer_location = layer_location;
    if (location_district) normalized.location_district = location_district;

    // FORCE address to be a string - build from sub-fields or fallback
    let finalAddress = address;
    if (!finalAddress) {
        // Build from available location fields as fallback
        const fallbackParts = [];
        if (layer_location) fallbackParts.push(layer_location);
        if (city && city !== layer_location) fallbackParts.push(city);
        if (state_name) fallbackParts.push(state_name);
        finalAddress = fallbackParts.length > 0 ? fallbackParts.join(', ') : 'Location not specified';
    }

    // OVERRIDE the address field - force it to be a string, not an object
    normalized.address = finalAddress;

    if (coordinates.lat && coordinates.lng) {
        normalized.coordinates = coordinates;
        normalized.position = coordinates;
    }
    if (images.length > 0) normalized.images = images;
    if (featuredImageUrl) normalized.featuredImageUrl = featuredImageUrl;
    if (facilities.length > 0) normalized.facilities = facilities;
    if (amenities.length > 0) normalized.amenities = amenities;
    if (finalFloorPlans) normalized.floorPlans = finalFloorPlans;

    // Always include these for UI
    normalized.is_verified = is_verified;

    // Preserve original fields if they exist, don't override with null
    if (!normalized.originalPrice) normalized.originalPrice = propertyObj.originalPrice || null;
    if (!normalized.discountedPrice) normalized.discountedPrice = propertyObj.discountedPrice || null;
    if (!normalized.additionalPrice) normalized.additionalPrice = propertyObj.additionalPrice || null;
    if (!normalized.date_added) normalized.date_added = propertyObj.date_added || null;
    if (!normalized.sellerPhoneNumber) normalized.sellerPhoneNumber = propertyObj.sellerPhoneNumber || null;
    if (!normalized.nearbyPlaces) normalized.nearbyPlaces = propertyObj.nearbyPlaces || { school: [], hospital: [], hotel: [], business: [] };
    if (!normalized.ratings) normalized.ratings = propertyObj.ratings || { overall: 0, totalRatings: 0, breakdown: {}, whatsGood: [], whatsBad: [] };
    if (!normalized.reviews) normalized.reviews = propertyObj.reviews || [];
    if (!normalized.badge && propertyObj.badge) normalized.badge = propertyObj.badge.toLowerCase();

    return normalized;
}

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

            const db = mongoose.connection.db;
            const ObjectId = mongoose.Types.ObjectId;
            let property = null;

            // Search in the correct collection based on type parameter
            if (type === 'commercial') {
                property = await db.collection('commercialProperties').findOne({ _id: new ObjectId(id) });
            } else if (type === 'residential') {
                property = await db.collection('residentialproperties').findOne({ _id: new ObjectId(id) });
            } else {
                // If no type specified, search both
                property = await db.collection('residentialproperties').findOne({ _id: new ObjectId(id) });

                if (!property) {
                    property = await db.collection('commercialProperties').findOne({ _id: new ObjectId(id) });
                }
            }

            if (!property) {
                console.error('❌ Property not found in database');
                return NextResponse.json(
                    { success: false, message: `Property not found in ${type || 'any'} collection` },
                    { status: 404 }
                );
            }

            // Convert ObjectId to string
            property._id = property._id.toString();

            // Normalize the property data
            const normalizedProperty = normalizeProperty(property);

            return NextResponse.json({
                success: true,
                property: normalizedProperty
            });
        }

        // If no ID, fetch all properties based on type filter
        let allProperties = [];

        const db = mongoose.connection.db;

        if (type === 'commercial') {
            const commercialProperties = await db.collection('commercialProperties').find({}).toArray();
            allProperties = commercialProperties;
        } else if (type === 'residential') {
            const residentialProperties = await db.collection('residentialproperties').find({}).toArray();
            allProperties = residentialProperties;
        } else {
            // If no type specified, fetch both
            const commercialProperties = await db.collection('commercialProperties').find({}).toArray();
            const residentialProperties = await db.collection('residentialproperties').find({}).toArray();

            allProperties = [...commercialProperties, ...residentialProperties];
        }

        // Convert ObjectIds to strings
        allProperties = allProperties.map(prop => ({
            ...prop,
            _id: prop._id.toString()
        }));

        // Normalize all properties
        const normalizedProperties = allProperties.map(prop => normalizeProperty(prop));

        return NextResponse.json({
            success: true,
            data: normalizedProperties
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

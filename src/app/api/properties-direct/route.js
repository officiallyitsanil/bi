import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();
        
        const db = mongoose.connection.db;
        
        // Fetch directly from collections
        const commercial = await db.collection('commercialProperties').find({}).toArray();
        const residential = await db.collection('residentialproperties').find({}).toArray();
        
        const allProperties = [...commercial, ...residential];
        
        // Add propertyType field if missing and fix image URLs
        const normalized = allProperties.map(prop => {
            // Get featured image URL
            let featuredImageUrl = null;
            if (prop.featuredImage?.url) {
                featuredImageUrl = prop.featuredImage.url;
            } else if (prop.interiorImages && prop.interiorImages.length > 0 && prop.interiorImages[0]?.url) {
                featuredImageUrl = prop.interiorImages[0].url;
            } else if (prop.seatLayoutImages && prop.seatLayoutImages.length > 0 && prop.seatLayoutImages[0]?.url) {
                featuredImageUrl = prop.seatLayoutImages[0].url;
            }
            
            return {
                ...prop,
                _id: prop._id.toString(),
                propertyType: prop.Category?.toLowerCase() || prop.propertyType || 'unknown',
                name: prop.propertyName || prop.name || 'Unnamed Property',
                badge: prop.badge || 'new',
                featuredImageUrl: featuredImageUrl,
            };
        });
        
        return NextResponse.json({
            success: true,
            count: normalized.length,
            data: normalized
        });
    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

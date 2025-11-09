import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log('📚 Available collections:', collections.map(c => c.name));
        
        const collectionNames = collections.map(c => c.name);
        const results = {};
        
        for (const collectionName of collectionNames) {
            const count = await db.collection(collectionName).countDocuments();
            results[collectionName] = count;
            console.log(`📊 ${collectionName}: ${count} documents`);
        }
        
        // Fetch actual documents from property collections
        const commercialDocs = await db.collection('commercialProperties').find({}).limit(5).toArray();
        const residentialDocs = await db.collection('residentialproperties').find({}).limit(5).toArray();
        
        console.log('🏢 Commercial docs:', commercialDocs.length);
        console.log('🏠 Residential docs:', residentialDocs.length);
        
        return NextResponse.json({
            success: true,
            database: db.databaseName,
            collections: results,
            sampleData: {
                commercial: commercialDocs,
                residential: residentialDocs
            }
        });
    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

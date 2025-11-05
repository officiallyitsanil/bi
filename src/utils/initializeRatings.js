// Utility script to initialize ratings for existing properties
// Run this once to ensure all properties have proper rating structure

import dbConnect from './dbConnect';
import ResidentialProperty from '../models/ResidentialProperty';
import CommercialProperty from '../models/CommercialProperty';

export async function initializePropertyRatings() {
  try {
    await dbConnect();

    const defaultRatings = {
      overall: 0,
      totalRatings: 0,
      breakdown: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      },
      whatsGood: [],
      whatsBad: []
    };

    // Update residential properties
    const residentialProperties = await ResidentialProperty.find({});
    for (const property of residentialProperties) {
      if (!property.ratings || !property.ratings.breakdown) {
        property.ratings = {
          ...defaultRatings,
          ...(property.ratings || {})
        };
        
        // Ensure breakdown exists
        if (!property.ratings.breakdown) {
          property.ratings.breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        }
        
        // Initialize reviews array if not exists
        if (!property.reviews) {
          property.reviews = [];
        }
        
        await property.save();
        console.log(`Updated residential property: ${property.name}`);
      }
    }

    // Update commercial properties
    const commercialProperties = await CommercialProperty.find({});
    for (const property of commercialProperties) {
      if (!property.ratings || !property.ratings.breakdown) {
        property.ratings = {
          ...defaultRatings,
          ...(property.ratings || {})
        };
        
        // Ensure breakdown exists
        if (!property.ratings.breakdown) {
          property.ratings.breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        }
        
        // Initialize reviews array if not exists
        if (!property.reviews) {
          property.reviews = [];
        }
        
        await property.save();
        console.log(`Updated commercial property: ${property.name}`);
      }
    }

    console.log('All properties initialized with proper rating structure');
    return { success: true, message: 'Ratings initialized successfully' };
  } catch (error) {
    console.error('Error initializing ratings:', error);
    return { success: false, message: error.message };
  }
}

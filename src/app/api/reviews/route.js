import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import ResidentialProperty from '@/models/ResidentialProperty';
import CommercialProperty from '@/models/CommercialProperty';

// POST - Submit a new review
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { propertyId, propertyType, user, rating, comment } = body;

    // Validation
    if (!propertyId || !user || !user.trim() || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Invalid review data. Please provide property ID, user name, and rating (1-5).' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (propertyId.length !== 24) {
      return NextResponse.json(
        { success: false, message: 'Invalid property ID format' },
        { status: 400 }
      );
    }

    let property = null;

    // Search in the correct collection based on type
    if (propertyType === 'commercial') {
      property = await CommercialProperty.findById(propertyId);
    } else if (propertyType === 'residential') {
      property = await ResidentialProperty.findById(propertyId);
    } else {
      // If no type specified, search both
      property = await ResidentialProperty.findById(propertyId);
      
      if (!property) {
        property = await CommercialProperty.findById(propertyId);
      }
    }

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Create new review
    const newReview = {
      user,
      rating,
      comment: comment || '',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    };

    // Add review to array
    if (!property.reviews) {
      property.reviews = [];
    }
    property.reviews.unshift(newReview); // Add to beginning

    // RECALCULATE RATINGS FROM ALL REVIEWS
    // Initialize fresh breakdown
    const breakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    
    // Count all reviews (including the new one we just added)
    property.reviews.forEach(review => {
      const ratingKey = String(review.rating);
      breakdown[ratingKey] = (breakdown[ratingKey] || 0) + 1;
    });
    
    // Calculate total ratings
    const totalRatings = property.reviews.length;
    
    // Calculate overall rating
    let totalScore = 0;
    for (let star = 1; star <= 5; star++) {
      totalScore += star * (breakdown[String(star)] || 0);
    }
    const overall = totalRatings > 0 ? parseFloat((totalScore / totalRatings).toFixed(1)) : 0;
    
    // Update property ratings - ONLY overall, totalRatings, and breakdown
    // Keep existing whatsGood and whatsBad unchanged
    property.ratings = {
      overall,
      totalRatings,
      breakdown: { ...breakdown },
      whatsGood: property.ratings.whatsGood || [],
      whatsBad: property.ratings.whatsBad || []
    };
    
    // Mark as modified for Mongoose
    property.markModified('ratings');
    property.markModified('reviews');

    // Save the updated property
    await property.save();

    // Return plain object for ratings to avoid serialization issues
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview,
      ratings: {
        overall: property.ratings.overall,
        totalRatings: property.ratings.totalRatings,
        breakdown: { ...property.ratings.breakdown },
        whatsGood: [...property.ratings.whatsGood],
        whatsBad: [...property.ratings.whatsBad]
      }
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit review', error: error.message },
      { status: 500 }
    );
  }
}

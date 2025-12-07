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

    // Get existing reviews (ensure it's an array)
    const existingReviews = property.reviews || [];
    
    // Add new review to beginning of array
    const updatedReviews = [newReview, ...existingReviews];

    // RECALCULATE RATINGS FROM ALL REVIEWS
    // Initialize fresh breakdown
    const breakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    
    // Count all reviews (including the new one)
    updatedReviews.forEach(review => {
      const ratingKey = String(review.rating);
      breakdown[ratingKey] = (breakdown[ratingKey] || 0) + 1;
    });
    
    // Calculate total ratings
    const totalRatings = updatedReviews.length;
    
    // Calculate overall rating
    let totalScore = 0;
    for (let star = 1; star <= 5; star++) {
      totalScore += star * (breakdown[String(star)] || 0);
    }
    const overall = totalRatings > 0 ? parseFloat((totalScore / totalRatings).toFixed(1)) : 0;
    
    // Get existing whatsGood and whatsBad
    const existingWhatsGood = property.ratings?.whatsGood || [];
    const existingWhatsBad = property.ratings?.whatsBad || [];
    
    // Prepare update object
    const updateData = {
      reviews: updatedReviews,
      ratings: {
        overall,
        totalRatings,
        breakdown,
        whatsGood: existingWhatsGood,
        whatsBad: existingWhatsBad
      }
    };

    // Use findByIdAndUpdate to avoid duplicate key errors
    let updatedProperty;
    if (propertyType === 'commercial') {
      updatedProperty = await CommercialProperty.findByIdAndUpdate(
        propertyId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } else {
      updatedProperty = await ResidentialProperty.findByIdAndUpdate(
        propertyId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    if (!updatedProperty) {
      return NextResponse.json(
        { success: false, message: 'Failed to update property with review' },
        { status: 500 }
      );
    }

    // Return plain object for ratings to avoid serialization issues
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview,
      ratings: {
        overall: updatedProperty.ratings.overall,
        totalRatings: updatedProperty.ratings.totalRatings,
        breakdown: { ...updatedProperty.ratings.breakdown },
        whatsGood: [...updatedProperty.ratings.whatsGood],
        whatsBad: [...updatedProperty.ratings.whatsBad]
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

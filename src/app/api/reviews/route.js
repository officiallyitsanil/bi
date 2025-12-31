import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import ResidentialProperty from '@/models/ResidentialProperty';
import CommercialProperty from '@/models/CommercialProperty';

// Helper function to recalculate ratings
function recalculateRatings(reviews) {
  const breakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  
  reviews.forEach(review => {
    const ratingKey = String(review.rating);
    breakdown[ratingKey] = (breakdown[ratingKey] || 0) + 1;
  });
  
  const totalRatings = reviews.length;
  
  let totalScore = 0;
  for (let star = 1; star <= 5; star++) {
    totalScore += star * (breakdown[String(star)] || 0);
  }
  const overall = totalRatings > 0 ? parseFloat((totalScore / totalRatings).toFixed(1)) : 0;
  
  return { overall, totalRatings, breakdown };
}

// POST - Submit a new review
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { propertyId, propertyType, user, rating, comment, userPhoneNumber } = body;

    // Validation
    if (!propertyId || !user || !user.trim() || !rating || rating < 1 || rating > 5 || !comment || !comment.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid review data. Please provide property ID, user name, rating (1-5), and comment.' },
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
    let PropertyModel = null;

    // Search in the correct collection based on type
    if (propertyType === 'commercial') {
      property = await CommercialProperty.findById(propertyId);
      PropertyModel = CommercialProperty;
    } else if (propertyType === 'residential') {
      property = await ResidentialProperty.findById(propertyId);
      PropertyModel = ResidentialProperty;
    } else {
      // If no type specified, search both
      property = await ResidentialProperty.findById(propertyId);
      PropertyModel = ResidentialProperty;
      
      if (!property) {
        property = await CommercialProperty.findById(propertyId);
        PropertyModel = CommercialProperty;
      }
    }

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if user already has a review for this property
    const existingReviews = property.reviews || [];
    if (userPhoneNumber) {
      const existingUserReview = existingReviews.find(r => 
        r.userPhoneNumber && r.userPhoneNumber === userPhoneNumber
      );
      
      if (existingUserReview) {
        return NextResponse.json(
          { success: false, message: 'You have already submitted a review for this property. Please edit or delete your existing review.' },
          { status: 400 }
        );
      }
    }

    // Create new review
    const newReview = {
      user,
      rating,
      comment: comment.trim(),
      userPhoneNumber: userPhoneNumber || null,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    };

    // Add new review to beginning of array
    const updatedReviews = [newReview, ...existingReviews];

    // Recalculate ratings
    const ratingsData = recalculateRatings(updatedReviews);
    
    // Get existing whatsGood and whatsBad
    const existingWhatsGood = property.ratings?.whatsGood || [];
    const existingWhatsBad = property.ratings?.whatsBad || [];
    
    // Prepare update object
    const updateData = {
      reviews: updatedReviews,
      ratings: {
        ...ratingsData,
        whatsGood: existingWhatsGood,
        whatsBad: existingWhatsBad
      }
    };

    // Use findByIdAndUpdate to avoid duplicate key errors
    const updatedProperty = await PropertyModel.findByIdAndUpdate(
      propertyId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return NextResponse.json(
        { success: false, message: 'Failed to update property with review' },
        { status: 500 }
      );
    }

    // Get the saved review with _id
    const savedReview = updatedProperty.reviews[0];
    
    // Return plain object for ratings to avoid serialization issues
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        _id: savedReview._id.toString(),
        user: savedReview.user,
        rating: savedReview.rating,
        comment: savedReview.comment,
        date: savedReview.date,
        userPhoneNumber: savedReview.userPhoneNumber || null
      },
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

// PUT - Edit an existing review
export async function PUT(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { propertyId, propertyType, reviewId, user, rating, comment, userPhoneNumber } = body;

    // Validation
    if (!propertyId || !reviewId || !user || !user.trim() || !rating || rating < 1 || rating > 5 || !comment || !comment.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid review data. Please provide property ID, review ID, user name, rating (1-5), and comment.' },
        { status: 400 }
      );
    }

    let property = null;
    let PropertyModel = null;

    if (propertyType === 'commercial') {
      property = await CommercialProperty.findById(propertyId);
      PropertyModel = CommercialProperty;
    } else if (propertyType === 'residential') {
      property = await ResidentialProperty.findById(propertyId);
      PropertyModel = ResidentialProperty;
    } else {
      property = await ResidentialProperty.findById(propertyId);
      PropertyModel = ResidentialProperty;
      
      if (!property) {
        property = await CommercialProperty.findById(propertyId);
        PropertyModel = CommercialProperty;
      }
    }

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    const existingReviews = property.reviews || [];
    const reviewIndex = existingReviews.findIndex(r => r._id.toString() === reviewId);

    if (reviewIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user owns this review
    if (userPhoneNumber && existingReviews[reviewIndex].userPhoneNumber !== userPhoneNumber) {
      return NextResponse.json(
        { success: false, message: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Update the review
    existingReviews[reviewIndex].user = user;
    existingReviews[reviewIndex].rating = rating;
    existingReviews[reviewIndex].comment = comment.trim();
    existingReviews[reviewIndex].date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    // Recalculate ratings
    const ratingsData = recalculateRatings(existingReviews);
    
    const existingWhatsGood = property.ratings?.whatsGood || [];
    const existingWhatsBad = property.ratings?.whatsBad || [];
    
    const updateData = {
      reviews: existingReviews,
      ratings: {
        ...ratingsData,
        whatsGood: existingWhatsGood,
        whatsBad: existingWhatsBad
      }
    };

    const updatedProperty = await PropertyModel.findByIdAndUpdate(
      propertyId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return NextResponse.json(
        { success: false, message: 'Failed to update review' },
        { status: 500 }
      );
    }

    const updatedReview = updatedProperty.reviews.find(r => r._id.toString() === reviewId);

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        _id: updatedReview._id.toString(),
        user: updatedReview.user,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        date: updatedReview.date,
        userPhoneNumber: updatedReview.userPhoneNumber || null
      },
      ratings: {
        overall: updatedProperty.ratings.overall,
        totalRatings: updatedProperty.ratings.totalRatings,
        breakdown: { ...updatedProperty.ratings.breakdown },
        whatsGood: [...updatedProperty.ratings.whatsGood],
        whatsBad: [...updatedProperty.ratings.whatsBad]
      }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update review', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const propertyType = searchParams.get('propertyType');
    const reviewId = searchParams.get('reviewId');
    const userPhoneNumber = searchParams.get('userPhoneNumber');

    if (!propertyId || !reviewId) {
      return NextResponse.json(
        { success: false, message: 'Property ID and Review ID are required' },
        { status: 400 }
      );
    }

    let property = null;
    let PropertyModel = null;

    if (propertyType === 'commercial') {
      property = await CommercialProperty.findById(propertyId);
      PropertyModel = CommercialProperty;
    } else if (propertyType === 'residential') {
      property = await ResidentialProperty.findById(propertyId);
      PropertyModel = ResidentialProperty;
    } else {
      property = await ResidentialProperty.findById(propertyId);
      PropertyModel = ResidentialProperty;
      
      if (!property) {
        property = await CommercialProperty.findById(propertyId);
        PropertyModel = CommercialProperty;
      }
    }

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    const existingReviews = property.reviews || [];
    const reviewIndex = existingReviews.findIndex(r => r._id.toString() === reviewId);

    if (reviewIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user owns this review
    if (userPhoneNumber && existingReviews[reviewIndex].userPhoneNumber !== userPhoneNumber) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Remove the review
    existingReviews.splice(reviewIndex, 1);

    // Recalculate ratings
    const ratingsData = recalculateRatings(existingReviews);
    
    const existingWhatsGood = property.ratings?.whatsGood || [];
    const existingWhatsBad = property.ratings?.whatsBad || [];
    
    const updateData = {
      reviews: existingReviews,
      ratings: {
        ...ratingsData,
        whatsGood: existingWhatsGood,
        whatsBad: existingWhatsBad
      }
    };

    const updatedProperty = await PropertyModel.findByIdAndUpdate(
      propertyId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
      ratings: {
        overall: updatedProperty.ratings.overall,
        totalRatings: updatedProperty.ratings.totalRatings,
        breakdown: { ...updatedProperty.ratings.breakdown },
        whatsGood: [...updatedProperty.ratings.whatsGood],
        whatsBad: [...updatedProperty.ratings.whatsBad]
      }
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete review', error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import ResidentialProperty from '@/models/ResidentialProperty';
import CommercialProperty from '@/models/CommercialProperty';

// GET - Fetch all reviews for a property
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // In Next.js 15, params might be a promise
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    // Try to find in both collections
    let property = await ResidentialProperty.findById(id);
    if (!property) {
      property = await CommercialProperty.findById(id);
    }

    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reviews: property.reviews || [],
      ratings: property.ratings || {}
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Submit a new review
export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    // In Next.js 15, params might be a promise
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json();
    const { user, rating, comment } = body;

    // Validation
    if (!user || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Invalid review data' },
        { status: 400 }
      );
    }

    // Try to find in both collections
    let property = await ResidentialProperty.findById(id);
    let PropertyModel = ResidentialProperty;
    
    if (!property) {
      property = await CommercialProperty.findById(id);
      PropertyModel = CommercialProperty;
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

    // Update ratings
    if (!property.ratings) {
      property.ratings = {
        overall: 0,
        totalRatings: 0,
        breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        whatsGood: [],
        whatsBad: []
      };
    }

    // Update breakdown
    if (!property.ratings.breakdown) {
      property.ratings.breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
    property.ratings.breakdown[rating] = (property.ratings.breakdown[rating] || 0) + 1;

    // Update total ratings
    property.ratings.totalRatings = (property.ratings.totalRatings || 0) + 1;

    // Calculate new overall rating
    let totalScore = 0;
    for (let star = 1; star <= 5; star++) {
      totalScore += star * (property.ratings.breakdown[star] || 0);
    }
    property.ratings.overall = parseFloat((totalScore / property.ratings.totalRatings).toFixed(1));

    // Update what's good/bad based on comment sentiment (simple keyword matching)
    if (comment) {
      const lowerComment = comment.toLowerCase();
      const positiveKeywords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'clean', 'spacious', 'beautiful'];
      const negativeKeywords = ['bad', 'poor', 'terrible', 'awful', 'dirty', 'small', 'noisy', 'expensive'];
      
      const hasPositive = positiveKeywords.some(keyword => lowerComment.includes(keyword));
      const hasNegative = negativeKeywords.some(keyword => lowerComment.includes(keyword));

      if (hasPositive && rating >= 4) {
        if (!property.ratings.whatsGood) property.ratings.whatsGood = [];
        const shortComment = comment.substring(0, 50);
        if (!property.ratings.whatsGood.includes(shortComment)) {
          property.ratings.whatsGood.push(shortComment);
        }
      }

      if (hasNegative && rating <= 2) {
        if (!property.ratings.whatsBad) property.ratings.whatsBad = [];
        const shortComment = comment.substring(0, 50);
        if (!property.ratings.whatsBad.includes(shortComment)) {
          property.ratings.whatsBad.push(shortComment);
        }
      }
    }

    // Save the updated property
    await property.save();

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview,
      ratings: property.ratings
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// Utility script to update old reviews without phone numbers
// Set userPhoneNumber to null/empty for reviews that don't have phone numbers
// Run this once to clean up old review data

import dbConnect from './dbConnect';
import ResidentialProperty from '../models/ResidentialProperty';
import CommercialProperty from '../models/CommercialProperty';

export async function updateReviewsPhoneNumbers() {
  try {
    await dbConnect();

    let updatedResidentialCount = 0;
    let updatedCommercialCount = 0;
    let totalReviewsUpdated = 0;

    // Update residential properties
    console.log('Processing residential properties...');
    const residentialProperties = await ResidentialProperty.find({});
    
    for (const property of residentialProperties) {
      if (!property.reviews || !Array.isArray(property.reviews) || property.reviews.length === 0) {
        continue;
      }

      let propertyReviewsUpdated = 0;
      let hasUpdates = false;
      
      // Convert to plain objects first
      const reviewsArray = property.reviews.map(r => {
        try {
          return r.toObject ? r.toObject() : (typeof r === 'object' ? r : {});
        } catch {
          return typeof r === 'object' ? r : {};
        }
      });
      
      const updatedReviews = reviewsArray.map(review => {
        // Check if review doesn't have phone number or has empty/null phone number
        const phoneNumber = review.userPhoneNumber || review.userPhone || review.phoneNumber || review.phone;
        
        if (!phoneNumber || phoneNumber === '' || phoneNumber === null || phoneNumber === undefined) {
          hasUpdates = true;
          propertyReviewsUpdated++;
          // Set userPhoneNumber to null (removes the field or sets it to null)
          const updatedReview = { ...review };
          updatedReview.userPhoneNumber = null;
          // Remove other possible phone number fields to clean up
          if (updatedReview.userPhone) delete updatedReview.userPhone;
          if (updatedReview.phoneNumber) delete updatedReview.phoneNumber;
          if (updatedReview.phone) delete updatedReview.phone;
          return updatedReview;
        }
        
        return review;
      });

      if (hasUpdates) {
        property.reviews = updatedReviews;
        await property.save();
        updatedResidentialCount++;
        totalReviewsUpdated += propertyReviewsUpdated;
      }
    }

    // Update commercial properties
    console.log('Processing commercial properties...');
    const commercialProperties = await CommercialProperty.find({});
    
    for (const property of commercialProperties) {
      if (!property.reviews || !Array.isArray(property.reviews) || property.reviews.length === 0) {
        continue;
      }

      let propertyReviewsUpdated = 0;
      let hasUpdates = false;
      
      // Convert to plain objects first
      const reviewsArray = property.reviews.map(r => {
        try {
          return r.toObject ? r.toObject() : (typeof r === 'object' ? r : {});
        } catch {
          return typeof r === 'object' ? r : {};
        }
      });
      
      const updatedReviews = reviewsArray.map(review => {
        // Check if review doesn't have phone number or has empty/null phone number
        const phoneNumber = review.userPhoneNumber || review.userPhone || review.phoneNumber || review.phone;
        
        if (!phoneNumber || phoneNumber === '' || phoneNumber === null || phoneNumber === undefined) {
          hasUpdates = true;
          propertyReviewsUpdated++;
          // Set userPhoneNumber to null (removes the field or sets it to null)
          const updatedReview = { ...review };
          updatedReview.userPhoneNumber = null;
          // Remove other possible phone number fields to clean up
          if (updatedReview.userPhone) delete updatedReview.userPhone;
          if (updatedReview.phoneNumber) delete updatedReview.phoneNumber;
          if (updatedReview.phone) delete updatedReview.phone;
          return updatedReview;
        }
        
        return review;
      });

      if (hasUpdates) {
        property.reviews = updatedReviews;
        await property.save();
        updatedCommercialCount++;
        totalReviewsUpdated += propertyReviewsUpdated;
      }
    }

    console.log('Update completed!');
    console.log(`Updated ${updatedResidentialCount} residential properties`);
    console.log(`Updated ${updatedCommercialCount} commercial properties`);
    console.log(`Total reviews updated: ${totalReviewsUpdated}`);

    return { 
      success: true, 
      message: 'Reviews updated successfully',
      residentialPropertiesUpdated: updatedResidentialCount,
      commercialPropertiesUpdated: updatedCommercialCount,
      totalReviewsUpdated: totalReviewsUpdated
    };
  } catch (error) {
    console.error('Error updating reviews:', error);
    return { success: false, message: error.message };
  }
}

// If running directly via Node.js
if (import.meta.url === `file://${process.argv[1]}`) {
  updateReviewsPhoneNumbers()
    .then(result => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}


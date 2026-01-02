import { NextResponse } from 'next/server';
import { updateReviewsPhoneNumbers } from '@/utils/updateReviewsPhoneNumbers';

// API route to update old reviews without phone numbers
// Call: POST /api/admin/update-reviews
export async function POST(request) {
  try {
    // Optional: Add authentication check here if needed
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== 'Bearer YOUR_SECRET_KEY') {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // }

    const result = await updateReviewsPhoneNumbers();
    
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    console.error('Error in update-reviews API:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { initializePropertyRatings } from '@/utils/initializeRatings';

// POST - Initialize ratings for all properties (Admin only)
export async function POST(request) {
  try {
    const result = await initializePropertyRatings();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'All properties have been initialized with proper rating structure'
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error initializing ratings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize ratings' },
      { status: 500 }
    );
  }
}

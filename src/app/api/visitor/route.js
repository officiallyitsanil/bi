import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Visitor from '@/models/Visitor';

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      latitude,
      longitude,
      accuracy,
      address,
      userAgent,
      platform,
      browser,
      deviceType,
      screenResolution,
      language,
      timezone,
      ipAddress,
      connectionType,
      sessionId,
      referrer,
      pageUrl,
      isFirstVisit,
      visitCount
    } = body;

    // Get client IP from headers if not provided
    const clientIP = ipAddress || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      request.remoteAddress || 
      'unknown';

    // Create new visitor record
    const visitor = new Visitor({
      latitude,
      longitude,
      accuracy,
      address,
      userAgent,
      platform,
      browser,
      deviceType,
      screenResolution,
      language,
      timezone,
      ipAddress: clientIP,
      connectionType,
      sessionId,
      referrer,
      pageUrl,
      isFirstVisit,
      visitCount
    });

    await visitor.save();

    return NextResponse.json({
      success: true,
      message: 'Visitor data saved successfully',
      visitorId: visitor._id
    });

  } catch (error) {
    console.error('Error saving visitor data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save visitor data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const visitors = await Visitor.find()
      .sort({ visitedAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v');

    const total = await Visitor.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        visitors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalVisitors: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching visitor data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch visitor data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

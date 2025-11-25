import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Visitor from '@/models/Visitor';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      ipLocation,
      gpsLocation,
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
      visitCount,
      locationPermission,
      isHomepageVisit
    } = body;

    // Get client IP from headers if not provided
    const clientIP = ipAddress ||
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.remoteAddress ||
      'unknown';

    // Check if visitor with this session already exists
    let visitor = null;
    if (body.visitorId) {
      // If we have a visitorId, use it directly
      visitor = await Visitor.findById(body.visitorId);
    } else if (sessionId) {
      // Fallback to sessionId lookup
      visitor = await Visitor.findOne({ sessionId, isHomepageVisit: true });
    }

    if (visitor) {
      // Update existing visitor record with new location data
      if (gpsLocation) {
        visitor.gpsLocation = gpsLocation;
      }
      if (locationPermission) {
        visitor.locationPermission = locationPermission;
      }
      visitor.visitCount = visitCount || visitor.visitCount;

      await visitor.save();

      return NextResponse.json({
        success: true,
        message: 'Visitor data updated successfully',
        visitorId: visitor._id,
        updated: true
      });
    } else {
      // Create new visitor record
      visitor = new Visitor({
        ipLocation,
        gpsLocation,
        latitude: gpsLocation?.latitude || ipLocation?.latitude || latitude,
        longitude: gpsLocation?.longitude || ipLocation?.longitude || longitude,
        accuracy: gpsLocation?.accuracy || accuracy,
        address: gpsLocation?.location || ipLocation?.location || address,
        location: gpsLocation?.location || ipLocation?.location,
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
        visitCount,
        locationPermission: locationPermission || 'not_requested',
        isHomepageVisit: isHomepageVisit || false
      });

      await visitor.save();

      return NextResponse.json({
        success: true,
        message: 'Visitor data saved successfully',
        visitorId: visitor._id,
        updated: false
      });
    }

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

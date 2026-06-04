import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Favorite from "@/models/Favorite";
import Users from "@/models/Users";
import CommercialProperty from "@/models/CommercialProperty";
import ResidentialProperty from "@/models/ResidentialProperty";
import UserActionsLogs from "@/models/UserActionsLogs";

// GET - Fetch user's favorites
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userPhoneNumber = searchParams.get("userPhoneNumber");

    if (!userPhoneNumber) {
      return NextResponse.json(
        { success: false, message: "User phone number is required" },
        { status: 400 }
      );
    }

    const favorites = await Favorite.find({ userPhoneNumber }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch favorites", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Add or remove favorite
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userPhoneNumber, propertyId, propertyType, action } = body;

    // Validation
    if (!userPhoneNumber || !propertyId || !propertyType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action === "add") {
      // Check if favorite already exists
      const existingFavorite = await Favorite.findOne({
        userPhoneNumber,
        propertyId,
      });

      if (existingFavorite) {
        return NextResponse.json({
          success: true,
          message: "Property already in favorites",
          isFavorite: true,
        });
      }

      // Create new favorite
      const favorite = await Favorite.create({
        userPhoneNumber,
        propertyId,
        propertyType,
      });

      // Log the add_favorite action
      try {
        const user = await Users.findOne({ phoneNumber: userPhoneNumber });
        let property = null;
        if (propertyType === "commercial") {
          property = await CommercialProperty.findById(propertyId);
        } else if (propertyType === "residential") {
          property = await ResidentialProperty.findById(propertyId);
        }

        const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                          request.headers.get('x-real-ip')?.trim() || 
                          '127.0.0.1';
        const device = request.headers.get('user-agent') || 'unknown';

        await UserActionsLogs.create({
          userPhoneNumber: userPhoneNumber || '',
          userName: user?.name || '',
          userEmail: user?.email || '',
          actionType: 'add_favorite',
          ipAddress,
          device,
          location: property?.address?.city || property?.city || '',
          details: {
            propertyId: propertyId || '',
            propertyName: property?.propertyName || property?.name || '',
            brandName: property?.builderDetails?.builderName || property?.brandDetails?.name || property?.builderName || property?.builder || '',
            propertyType: propertyType
          }
        });
      } catch (logErr) {
        console.error("Failed to log add_favorite action:", logErr);
      }

      return NextResponse.json({
        success: true,
        message: "Property added to favorites",
        data: favorite,
        isFavorite: true,
      });
    } else if (action === "remove") {
      // Remove favorite
      const deleted = await Favorite.findOneAndDelete({
        userPhoneNumber,
        propertyId,
      });

      if (!deleted) {
        return NextResponse.json({
          success: false,
          message: "Favorite not found",
          isFavorite: false,
        });
      }

      // Log the remove_favorite action
      try {
        const user = await Users.findOne({ phoneNumber: userPhoneNumber });
        let property = null;
        if (propertyType === "commercial") {
          property = await CommercialProperty.findById(propertyId);
        } else if (propertyType === "residential") {
          property = await ResidentialProperty.findById(propertyId);
        }

        const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                          request.headers.get('x-real-ip')?.trim() || 
                          '127.0.0.1';
        const device = request.headers.get('user-agent') || 'unknown';

        await UserActionsLogs.create({
          userPhoneNumber: userPhoneNumber || '',
          userName: user?.name || '',
          userEmail: user?.email || '',
          actionType: 'remove_favorite',
          ipAddress,
          device,
          location: property?.address?.city || property?.city || '',
          details: {
            propertyId: propertyId || '',
            propertyName: property?.propertyName || property?.name || '',
            brandName: property?.builderDetails?.builderName || property?.brandDetails?.name || property?.builderName || property?.builder || '',
            propertyType: propertyType
          }
        });
      } catch (logErr) {
        console.error("Failed to log remove_favorite action:", logErr);
      }

      return NextResponse.json({
        success: true,
        message: "Property removed from favorites",
        isFavorite: false,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'add' or 'remove'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error managing favorite:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        success: true,
        message: "Property already in favorites",
        isFavorite: true,
      });
    }

    return NextResponse.json(
      { success: false, message: "Failed to manage favorite", error: error.message },
      { status: 500 }
    );
  }
}


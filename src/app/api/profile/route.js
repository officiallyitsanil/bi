import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";

// GET - Fetch user profile
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 }
      );
    }

    const user = await Users.findOne({ phoneNumber });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user
    }, { status: 200 });

  } catch (error) {
    console.error("API Profile GET Error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { phoneNumber, name, email, address } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;

    const user = await Users.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: user
    }, { status: 200 });

  } catch (error) {
    console.error("API Profile PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}


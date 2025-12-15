import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";

// PUT - Update phone number (OTP verification should be done on frontend before calling this)
export async function PUT(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { oldPhoneNumber, newPhoneNumber } = body;

    if (!oldPhoneNumber || !newPhoneNumber) {
      return NextResponse.json(
        { success: false, message: "Both old and new phone numbers are required." },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\+[1-9]\d{1,14}$/.test(newPhoneNumber)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number format." },
        { status: 400 }
      );
    }

    // Check if new phone number already exists
    const existingUser = await Users.findOne({ phoneNumber: newPhoneNumber });
    if (existingUser && existingUser.phoneNumber !== oldPhoneNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number already in use." },
        { status: 400 }
      );
    }

    // Update phone number
    const user = await Users.findOneAndUpdate(
      { phoneNumber: oldPhoneNumber },
      { $set: { phoneNumber: newPhoneNumber } },
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
      message: "Phone number updated successfully.",
      user: user
    }, { status: 200 });

  } catch (error) {
    console.error("API Change Phone Error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}


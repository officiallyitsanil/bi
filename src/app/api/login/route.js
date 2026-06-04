import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Users from "@/models/Users";

export async function POST(req) {
  try {
    await dbConnect();

    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { message: "Phone number is required." },
        { status: 400 }
      );
    }

    const existingUser = await Users.findOne({ phoneNumber: phoneNumber });
    const isNewUser = !existingUser;

    const user = await Users.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      { $set: { phoneNumber: phoneNumber } },
      { new: true, upsert: true }
    );

    // Log the login or signup action
    try {
      const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                        req.headers.get('x-real-ip')?.trim() || 
                        '127.0.0.1';
      const device = req.headers.get('user-agent') || 'unknown';
      
      const UserActionsLogs = (await import("@/models/UserActionsLogs")).default;
      await UserActionsLogs.create({
        userPhoneNumber: user.phoneNumber || '',
        userName: user.name || '',
        userEmail: user.email || '',
        actionType: isNewUser ? 'signup' : 'login',
        ipAddress,
        device,
        location: user.address || '',
        details: {
          userId: user._id
        }
      });
    } catch (logErr) {
      console.error("Failed to log login action:", logErr);
    }

    return NextResponse.json({
        message: "User logged in successfully.",
        user: user
    }, { status: 200 });

  } catch (error) {
    console.error("API Login Error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

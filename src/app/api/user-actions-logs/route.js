import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import UserActionsLogs from "@/models/UserActionsLogs";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      userPhoneNumber,
      userName,
      userEmail,
      actionType,
      location,
      details
    } = body;

    if (!userPhoneNumber) {
      return NextResponse.json(
        { success: false, message: "userPhoneNumber is required. Guest logging is disabled." },
        { status: 400 }
      );
    }

    if (!actionType) {
      return NextResponse.json(
        { success: false, message: "actionType is required." },
        { status: 400 }
      );
    }

    // Extract headers for IP and User Agent
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      req.headers.get('x-real-ip')?.trim() || 
                      '127.0.0.1';
    const device = req.headers.get('user-agent') || 'unknown';

    const logEntry = await UserActionsLogs.create({
      userPhoneNumber: userPhoneNumber || '',
      userName: userName || '',
      userEmail: userEmail || '',
      actionType,
      ipAddress,
      device,
      location: location || '',
      details: details || {}
    });

    return NextResponse.json({
      success: true,
      message: "Action logged successfully.",
      log: logEntry
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating action log:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

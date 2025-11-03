import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import PropertyInterest from "@/models/PropertyInterest";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { propertyName, name, email, phone, message } = body;

    // Validate required fields
    if (!propertyName || !name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new interest
    const newInterest = await PropertyInterest.create({
      propertyName,
      name,
      email,
      phone,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Interest submitted successfully",
        data: newInterest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting interest:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit interest" },
      { status: 500 }
    );
  }
}

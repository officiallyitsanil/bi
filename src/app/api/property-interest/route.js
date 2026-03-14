import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import PropertyInterest from "@/models/PropertyInterest";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { propertyName, propertyId, name, email, phone, message } = body;

    if (!propertyName || !name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    const newInterest = await PropertyInterest.create({
      propertyName,
      propertyId: propertyId || undefined,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message ? message.trim() : "",
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

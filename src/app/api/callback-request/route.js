import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import CallbackRequest from "@/models/CallbackRequest";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { propertyName, propertyId, name, email, phone, preferredCallbackTime, message } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    const doc = await CallbackRequest.create({
      propertyName: propertyName?.trim(),
      propertyId: propertyId || undefined,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      preferredCallbackTime: preferredCallbackTime?.trim(),
      message: message?.trim(),
    });

    return NextResponse.json({ success: true, message: "Callback request submitted successfully", data: doc }, { status: 201 });
  } catch (error) {
    console.error("Callback request error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit request" }, { status: 500 });
  }
}

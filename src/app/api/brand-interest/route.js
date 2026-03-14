import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import BrandInterest from "@/models/BrandInterest";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { propertyName, propertyId, brandName, name, email, phone, interestType, message } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    const doc = await BrandInterest.create({
      propertyName: propertyName?.trim(),
      propertyId: propertyId || undefined,
      brandName: brandName?.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      interestType: interestType?.trim(),
      message: message?.trim(),
    });

    return NextResponse.json({ success: true, message: "Submitted successfully. We will get back to you soon.", data: doc }, { status: 201 });
  } catch (error) {
    console.error("Brand interest error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit" }, { status: 500 });
  }
}

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

    const user = await Users.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      { $set: { phoneNumber: phoneNumber } },
      { new: true, upsert: true }
    );

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

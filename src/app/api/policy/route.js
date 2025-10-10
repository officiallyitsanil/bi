import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Policy from "@/models/Policy";

export async function GET() {
  try {
    await dbConnect();

    const policies = await Policy.find({}).sort({ order: 'asc' });

    return NextResponse.json(policies);
  } catch (error) {
    console.error("Failed to fetch policy data:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching policy data." },
      { status: 500 }
    );
  }
}
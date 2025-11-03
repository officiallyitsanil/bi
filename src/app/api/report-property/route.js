import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import PropertyReport from "@/models/PropertyReport";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      propertyId,
      propertyName,
      reporterName,
      reporterEmail,
      reporterPhone,
      reason,
      details,
    } = body;

    // Validate required fields
    if (
      !propertyId ||
      !propertyName ||
      !reporterName ||
      !reporterEmail ||
      !reason ||
      !details
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new report
    const newReport = await PropertyReport.create({
      propertyId,
      propertyName,
      reporterName,
      reporterEmail,
      reporterPhone,
      reason,
      details,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully",
        data: newReport,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit report" },
      { status: 500 }
    );
  }
}

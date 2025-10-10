import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Terms from '@/models/Terms'; 

export async function GET() {
  try {
    await dbConnect();

    const termsSections = await Terms.find({}).sort({ order: 'asc' });

    return NextResponse.json(termsSections);
  } catch (error) {
    console.error("Failed to fetch terms data:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching terms data." },
      { status: 500 }
    );
  }
}
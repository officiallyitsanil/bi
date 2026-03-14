import { NextResponse } from "next/server";

/**
 * Google Distance Matrix API proxy.
 * POST body: { origin: "lat,lng" or address, destination: "lat,lng" or address, mode: "driving"|"walking" }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { origin, destination, mode = "driving" } = body;

        if (!origin || !destination) {
            return NextResponse.json(
                { success: false, error: "origin and destination are required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: "Google Maps API key not configured" },
                { status: 500 }
            );
        }

        const params = new URLSearchParams({
            origins: origin,
            destinations: destination,
            mode: mode,
            key: apiKey,
        });

        const res = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`
        );
        const data = await res.json();

        if (data.status !== "OK") {
            return NextResponse.json(
                { success: false, error: data.error_message || data.status },
                { status: 400 }
            );
        }

        const row = data.rows?.[0];
        const element = row?.elements?.[0];

        if (!element || element.status !== "OK") {
            return NextResponse.json({
                success: true,
                origin_addresses: data.origin_addresses,
                destination_addresses: data.destination_addresses,
                distance: null,
                duration: null,
                status: element?.status || "ZERO_RESULTS",
            });
        }

        return NextResponse.json({
            success: true,
            origin_addresses: data.origin_addresses,
            destination_addresses: data.destination_addresses,
            distance: element.distance,
            duration: element.duration,
            status: "OK",
        });
    } catch (err) {
        console.error("Distance matrix error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}

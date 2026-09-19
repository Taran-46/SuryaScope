import { NextResponse } from "next/server";

export interface GeocodeRequestBody {
  address?: string;
}

export interface GeocodeSuccessResponse {
  success: true;
  addressInput: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

export interface GeocodeErrorResponse {
  success: false;
  error: string;
}

export type GeocodeResponse = GeocodeSuccessResponse | GeocodeErrorResponse;

/**
 * SERVER-SIDE GEOCODING API ROUTE
 * Provider: OpenStreetMap Nominatim Geocoding API (Default Free Tier, No Key Required)
 * Optional Override: GEOCODING_API_KEY (LocationIQ / Mapbox / Positionstack compatible)
 */
export async function POST(req: Request) {
  try {
    const body: GeocodeRequestBody = await req.json().catch(() => ({}));
    const rawAddress = body.address;

    // 1. Input Validation
    if (!rawAddress || typeof rawAddress !== "string" || !rawAddress.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid property address or city name." },
        { status: 400 }
      );
    }

    const cleanAddress = rawAddress.trim();

    // 2. Optional Environment Overrides
    const apiKey = process.env.GEOCODING_API_KEY;
    const customEndpoint = process.env.GEOCODING_API_URL;

    let searchUrl: string;
    let headers: Record<string, string> = {
      "User-Agent": "Suryascope-PreFeasibility-App/1.0 (contact@suryascope.app)",
      "Accept-Language": "en-US,en;q=0.9",
    };

    if (customEndpoint && apiKey) {
      searchUrl = `${customEndpoint}?key=${apiKey}&q=${encodeURIComponent(cleanAddress)}&format=json`;
    } else {
      // Default: OpenStreetMap Nominatim Free Service
      searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        cleanAddress
      )}&format=json&limit=1&addressdetails=1`;
    }

    // 3. Timeout Controller (6 second max timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(searchUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 4. Handle HTTP Provider Errors
    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json(
          { success: false, error: "Geocoding rate limit reached. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Geocoding service returned HTTP status ${res.status}.` },
        { status: res.status }
      );
    }

    const results = await res.json();

    // 5. Handle Zero Results
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No geocoding match found for "${cleanAddress}". Try adding a city, state, or postal code.`,
        },
        { status: 404 }
      );
    }

    const firstResult = results[0];
    const latitude = parseFloat(firstResult.lat);
    const longitude = parseFloat(firstResult.lon);
    const displayName = firstResult.display_name || cleanAddress;

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: "Invalid geographic coordinates returned from service." },
        { status: 500 }
      );
    }

    // 6. Return Structured Success Response
    const successPayload: GeocodeSuccessResponse = {
      success: true,
      addressInput: cleanAddress,
      displayName,
      latitude,
      longitude,
    };

    return NextResponse.json(successPayload);
  } catch (error: any) {
    if (error?.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Geocoding lookup request timed out. Please try again." },
        { status: 504 }
      );
    }

    console.warn("Server-side geocoding handler exception:", error);
    return NextResponse.json(
      { success: false, error: "Server encountered an error while resolving location coordinates." },
      { status: 500 }
    );
  }
}

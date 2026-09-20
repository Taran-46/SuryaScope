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
  source?: string;
  isFallbackMatch?: boolean;
}

export interface GeocodeErrorResponse {
  success: false;
  error: string;
}

export type GeocodeResponse = GeocodeSuccessResponse | GeocodeErrorResponse;

// Known fallback coordinates for popular demo cities
const DEMO_CITY_FALLBACKS: Record<string, { lat: number; lon: number; name: string }> = {
  "palo alto": { lat: 37.4419, lon: -122.1430, name: "Palo Alto, California, United States" },
  "austin": { lat: 30.2711, lon: -97.7437, name: "Austin, Texas, United States" },
  "delhi": { lat: 28.6139, lon: 77.2090, name: "New Delhi, Delhi, India" },
  "new delhi": { lat: 28.6139, lon: 77.2090, name: "New Delhi, Delhi, India" },
  "mumbai": { lat: 19.0760, lon: 72.8777, name: "Mumbai, Maharashtra, India" },
  "bengaluru": { lat: 12.9716, lon: 77.5946, name: "Bengaluru, Karnataka, India" },
  "bangalore": { lat: 12.9716, lon: 77.5946, name: "Bengaluru, Karnataka, India" },
  "hyderabad": { lat: 17.3850, lon: 78.4867, name: "Hyderabad, Telangana, India" },
  "chennai": { lat: 13.0827, lon: 80.2707, name: "Chennai, Tamil Nadu, India" },
  "kolkata": { lat: 22.5726, lon: 88.3639, name: "Kolkata, West Bengal, India" },
  "pune": { lat: 18.5204, lon: 73.8567, name: "Pune, Maharashtra, India" },
  "ahmedabad": { lat: 23.0225, lon: 72.5714, name: "Ahmedabad, Gujarat, India" },
  "jaipur": { lat: 26.9124, lon: 75.7873, name: "Jaipur, Rajasthan, India" },
  "san francisco": { lat: 37.7749, lon: -122.4194, name: "San Francisco, California, United States" },
  "london": { lat: 51.5074, lon: -0.1278, name: "London, Greater London, United Kingdom" },
};

/**
 * Query OpenStreetMap Nominatim Geocoder (strictly respects geographical hierarchy)
 */
async function queryNominatim(queryStr: string): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "User-Agent": "SuryaScope-SolarApp/1.0 (contact@suryascope.org)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;
    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const first = results[0];
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);

    if (isNaN(lat) || isNaN(lon)) return null;

    return {
      latitude: lat,
      longitude: lon,
      displayName: first.display_name || queryStr,
    };
  } catch {
    return null;
  }
}

/**
 * Query Photon Komoot Geocoder (fast, typo-tolerant, street-level OSM index)
 */
async function queryPhoton(queryStr: string): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(queryStr)}&limit=1`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "SuryaScope-SolarApp/1.0",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const features = data?.features;
    if (!Array.isArray(features) || features.length === 0) return null;

    const first = features[0];
    const coords = first?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;

    const lon = parseFloat(coords[0]);
    const lat = parseFloat(coords[1]);
    if (isNaN(lat) || isNaN(lon)) return null;

    const p = first.properties || {};
    const nameParts = [p.name, p.street, p.district, p.city || p.county, p.state, p.country].filter(Boolean);
    const displayName = nameParts.length > 0 ? nameParts.join(", ") : queryStr;

    return { latitude: lat, longitude: lon, displayName };
  } catch {
    return null;
  }
}

/**
 * SERVER-SIDE GEOCODING API ROUTE WITH MULTI-TIER REAL ADDRESS RESOLUTION
 */
export async function POST(req: Request) {
  try {
    const body: GeocodeRequestBody = await req.json().catch(() => ({}));
    const rawAddress = body.address;

    if (!rawAddress || typeof rawAddress !== "string" || !rawAddress.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid property address or city name." },
        { status: 400 }
      );
    }

    const cleanAddress = rawAddress.trim();

    // 0. Direct Lat,Lon coordinate input detection (e.g. "28.6139, 77.2090")
    const coordMatch = cleanAddress.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return NextResponse.json({
          success: true,
          addressInput: cleanAddress,
          displayName: `Custom Coordinates (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
          latitude: lat,
          longitude: lon,
          source: "Direct GPS Coordinates",
        });
      }
    }

    // Build progressive relaxation query array:
    // e.g. "Flat 102, 5th Cross, Indiranagar, Bengaluru, India"
    // -> ["Flat 102, 5th Cross, Indiranagar, Bengaluru, India", "5th Cross, Indiranagar, Bengaluru, India", "Indiranagar, Bengaluru, India", "Bengaluru, India"]
    const queriesToTry: string[] = [cleanAddress];

    // Strip apartment/flat/unit prefixes like "Flat 102,", "House 45,", "Suite B,"
    const strippedPrefix = cleanAddress.replace(/^(flat|house|plot|door|no|apt|unit|suite)\s*[\w\d\-\/]+,?\s*/i, "").trim();
    if (strippedPrefix && strippedPrefix !== cleanAddress) {
      queriesToTry.push(strippedPrefix);
    }

    const parts = cleanAddress.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 2) {
      queriesToTry.push(parts.slice(1).join(", "));
      queriesToTry.push(parts.slice(parts.length - 2).join(", "));
    } else if (parts.length === 2) {
      queriesToTry.push(parts[1]);
    }

    // 1. Try Nominatim first with progressive relaxation (accurate geographic bounding)
    for (const q of queriesToTry) {
      const nominatimRes = await queryNominatim(q);
      if (nominatimRes) {
        return NextResponse.json({
          success: true,
          addressInput: cleanAddress,
          displayName: nominatimRes.displayName,
          latitude: nominatimRes.latitude,
          longitude: nominatimRes.longitude,
          source: "OpenStreetMap Nominatim",
        });
      }
    }

    // 2. Try Photon Komoot (fuzzy street index)
    for (const q of queriesToTry) {
      const photonRes = await queryPhoton(q);
      if (photonRes) {
        return NextResponse.json({
          success: true,
          addressInput: cleanAddress,
          displayName: photonRes.displayName,
          latitude: photonRes.latitude,
          longitude: photonRes.longitude,
          source: "Photon Komoot (OSM)",
        });
      }
    }

    // 3. Known City Preset Fallbacks (checks if any known city is in the query)
    const lower = cleanAddress.toLowerCase();
    for (const [key, val] of Object.entries(DEMO_CITY_FALLBACKS)) {
      if (lower.includes(key)) {
        return NextResponse.json({
          success: true,
          addressInput: cleanAddress,
          displayName: `${cleanAddress} (${val.name})`,
          latitude: val.lat,
          longitude: val.lon,
          source: "City Preset Match",
          isFallbackMatch: true,
        });
      }
    }

    // If genuinely not found, return an error with clear instructions rather than fake coordinates!
    return NextResponse.json(
      {
        success: false,
        error: `Could not locate "${cleanAddress}". Please check the spelling, add the city/country name, or enter coordinates (e.g. "28.6139, 77.2090").`,
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.warn("Server-side geocoding handler exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Geocoding service temporarily unavailable. Please try entering city or coordinates.",
      },
      { status: 500 }
    );
  }
}

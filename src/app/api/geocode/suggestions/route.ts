import { NextRequest, NextResponse } from "next/server";

export interface LocationSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const cleanQuery = query.trim();

    // 1. Try Photon Komoot (fast, fuzzy, street-level)
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=5`;
      const res = await fetch(photonUrl, {
        headers: { "User-Agent": "SuryaScope-SolarApp/1.0" },
        signal: AbortSignal.timeout(2500),
      });

      if (res.ok) {
        const data = await res.json();
        const features = data?.features;
        if (Array.isArray(features) && features.length > 0) {
          const suggestions: LocationSuggestion[] = features
            .map((f: any) => {
              const coords = f?.geometry?.coordinates;
              const p = f?.properties || {};
              const parts = [p.name, p.street, p.district, p.city || p.county, p.state, p.country].filter(Boolean);
              return {
                displayName: parts.length > 0 ? parts.join(", ") : cleanQuery,
                latitude: parseFloat(coords[1]),
                longitude: parseFloat(coords[0]),
              };
            })
            .filter((s) => !isNaN(s.latitude) && !isNaN(s.longitude));

          if (suggestions.length > 0) {
            return NextResponse.json({ success: true, suggestions });
          }
        }
      }
    } catch {
      // Fall through to Nominatim
    }

    // 2. Secondary fallback: Nominatim
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cleanQuery
    )}&format=json&limit=5&addressdetails=0`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "SuryaScope-SolarApp/1.0 (contact@suryascope.org)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const suggestions: LocationSuggestion[] = data
      .map((item: any) => ({
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }))
      .filter((item) => !isNaN(item.latitude) && !isNaN(item.longitude));

    return NextResponse.json({ success: true, suggestions });
  } catch (err) {
    return NextResponse.json({ success: true, suggestions: [] });
  }
}

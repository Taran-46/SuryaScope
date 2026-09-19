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

    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query.trim()
    )}&format=json&limit=5&addressdetails=0`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Suryascope-PreFeasibility-App/1.0 (contact@suryascope.app)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const suggestions: LocationSuggestion[] = data.map((item: any) => ({
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    })).filter((item) => !isNaN(item.latitude) && !isNaN(item.longitude));

    return NextResponse.json({ success: true, suggestions });
  } catch (err) {
    return NextResponse.json({ success: true, suggestions: [] });
  }
}

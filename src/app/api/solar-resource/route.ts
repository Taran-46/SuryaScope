import { NextRequest, NextResponse } from "next/server";

export interface SolarResourceResponse {
  success: boolean;
  latitude: number;
  longitude: number;
  annualSolarResource: number; // GHI in kWh/m²/year
  specificYieldKwhPerKw: number; // Annual yield in kWh/kW/year
  unit: string;
  source: string;
  dataYear: string;
  isEstimate: boolean;
  fallbackReason?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { latitude, longitude } = body;

    // 1. Invalid coordinates validation
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coordinates provided. Latitude must be between -90 and 90, and longitude between -180 and 180.",
        },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    // Try NASA POWER Climatology API
    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${longitude}&latitude=${latitude}&format=JSON`;

    try {
      const response = await fetch(nasaUrl, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "SuryaScope-Solar-Assessment/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        console.warn("NASA POWER API rate limit encountered.");
        return returnFallbackResponse(latitude, longitude, "Rate limit exceeded on solar resource provider.");
      }

      if (!response.ok) {
        console.warn(`NASA POWER API returned status ${response.status}`);
        return returnFallbackResponse(latitude, longitude, `Provider returned status ${response.status}`);
      }

      const data = await response.json();
      const dailyGhi = data?.properties?.parameter?.ALLSKY_SFC_SW_DWN?.ANN;

      // Validate returned data
      if (typeof dailyGhi !== "number" || dailyGhi <= 0 || dailyGhi === -999) {
        console.warn("NASA POWER API returned invalid/missing GHI value:", dailyGhi);
        return returnFallbackResponse(latitude, longitude, "Solar resource data unavailable for this location.");
      }

      const annualSolarResource = Math.round(dailyGhi * 365.25); // kWh/m²/year
      const specificYieldKwhPerKw = Math.round(annualSolarResource * 0.81); // ~81% performance ratio

      return NextResponse.json({
        success: true,
        latitude,
        longitude,
        annualSolarResource,
        specificYieldKwhPerKw,
        unit: "kWh/m²/year",
        source: "NASA POWER Solar Climatology API",
        dataYear: "30-Year Satellite Irradiance Climatology",
        isEstimate: false,
      });

    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isTimeout = fetchErr.name === "AbortError";
      const reason = isTimeout ? "Solar resource API request timed out (6s)." : "Failed to connect to solar resource provider.";
      console.warn("Solar API fetch exception:", reason);
      return returnFallbackResponse(latitude, longitude, reason);
    }

  } catch (err: any) {
    console.error("Solar resource API route handler error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error processing solar resource lookup.",
      },
      { status: 500 }
    );
  }
}

function returnFallbackResponse(lat: number, lon: number, reason: string): NextResponse<SolarResourceResponse> {
  // Region-aware deterministic fallbacks
  const isIndia = lat >= 6 && lat <= 37 && lon >= 68 && lon <= 97;
  
  // Specific yield estimation (kWh/kW/year)
  const specificYield = isIndia ? 1400 : 1450;
  const annualGhi = Math.round(specificYield / 0.81); // ~1728 kWh/m²/year

  return NextResponse.json({
    success: true,
    latitude: lat,
    longitude: lon,
    annualSolarResource: annualGhi,
    specificYieldKwhPerKw: specificYield,
    unit: "kWh/m²/year",
    source: "Regional Climatological Fallback Estimate",
    dataYear: "Estimated Regional Climatology",
    isEstimate: true,
    fallbackReason: reason,
  });
}

/**
 * Solar Heatmap & Rooftop Computer Vision Utility Library
 * Calculates solar irradiance flux, obstacle masking, and optimal PV panel placement
 */

export interface SolarFluxPoint {
  x: number; // 0..1 normalized width
  y: number; // 0..1 normalized height
  fluxPercent: number; // 0..100% solar irradiance intensity
  isObstacle: boolean;
  obstacleType?: string;
}

export interface PlacedPanel {
  id: string;
  x: number; // % left
  y: number; // % top
  width: number; // % width
  height: number; // % height
  rotationDeg: number;
  wattageW: number;
}

export interface RooftopAnalysisResult {
  grossAreaSqM: number;
  obstacleAreaSqM: number;
  usableAreaSqM: number;
  averageSolarFluxPercent: number;
  peakSunHoursPerYear: number;
  maxPanels: number;
  systemCapacityKw: number;
  panels: PlacedPanel[];
  shadingLevel: "None" | "Low" | "Moderate" | "High";
}

/**
 * Generate a grid of solar flux irradiance points across a normalized rooftop polygon
 */
export function generateSolarFluxGrid(
  latitude: number,
  azimuthDeg: number,
  obstacles: { position: [number, number]; radiusM: number; name: string }[],
  gridResolution: number = 24
): SolarFluxPoint[] {
  const points: SolarFluxPoint[] = [];

  // In the northern hemisphere, south-facing pitches (180°) receive maximum annual solar flux
  // In the southern hemisphere, north-facing pitches (0° / 360°) receive maximum annual solar flux
  const isNorthernHemisphere = latitude >= 0;
  const optimalAzimuth = isNorthernHemisphere ? 180 : 0;
  const azimuthDifference = Math.abs(azimuthDeg - optimalAzimuth);
  const normalizedAzimuthPenalty = Math.min(1, azimuthDifference / 180);

  // Baseline ideal solar exposure based on orientation
  const baselineExposure = Math.max(60, 100 - normalizedAzimuthPenalty * 28);

  for (let r = 0; r < gridResolution; r++) {
    for (let c = 0; c < gridResolution; c++) {
      const normX = c / (gridResolution - 1);
      const normY = r / (gridResolution - 1);

      // Micro-gradient across roof pitch: sun rises east (right) and sets west (left)
      const pitchBias = Math.sin(normY * Math.PI) * 4;
      const eastWestBias = (normX - 0.5) * (azimuthDeg > 180 ? -3 : 3);

      let flux = baselineExposure + pitchBias + eastWestBias;

      // Obstacle proximity check (e.g. water tanks or cabins cast shadows)
      let isObstacle = false;
      let obstacleType: string | undefined;

      // Check against obstacles (normalized centers)
      const obstacleCenters = [
        { x: 0.35, y: 0.3, radius: 0.12, type: "Water Tank / Reservoir" },
        { x: 0.7, y: 0.65, radius: 0.16, type: "Stairwell Access Cabin" },
        { x: 0.8, y: 0.25, radius: 0.08, type: "Plumbing Vent" },
      ];

      for (const obs of obstacleCenters) {
        const dist = Math.hypot(normX - obs.x, normY - obs.y);
        if (dist < obs.radius) {
          isObstacle = true;
          obstacleType = obs.type;
          flux = Math.max(10, flux * 0.2); // Severe shadow / physical blockage
          break;
        } else if (dist < obs.radius * 1.6) {
          // Obstacle shadow fringe
          flux = Math.max(25, flux * 0.55);
        }
      }

      // Edge setback shadow
      if (normX < 0.08 || normX > 0.92 || normY < 0.08 || normY > 0.92) {
        flux = Math.max(40, flux * 0.75);
      }

      points.push({
        x: Math.round(normX * 1000) / 10,
        y: Math.round(normY * 1000) / 10,
        fluxPercent: Math.min(100, Math.max(15, Math.round(flux))),
        isObstacle,
        obstacleType,
      });
    }
  }

  return points;
}

/**
 * Calculate optimal solar panel array layout placed on the usable rooftop surface
 * Standard residential monocrystalline panel: ~2.2m x 1.1m (540W)
 */
export function calculateOptimalPanelLayout(
  usableAreaSqM: number,
  grossWidthM: number = 10,
  grossHeightM: number = 8,
  panelWattageW: number = 540
): { panels: PlacedPanel[]; totalKw: number; panelCount: number } {
  const panelWidthM = 1.1; // meters
  const panelHeightM = 2.2; // meters
  const setbackM = 0.5; // fire/safety perimeter setback

  const usableWidthM = Math.max(3, grossWidthM - 2 * setbackM);
  const usableHeightM = Math.max(3, grossHeightM - 2 * setbackM);

  const cols = Math.floor(usableWidthM / (panelWidthM + 0.15));
  const rows = Math.floor(usableHeightM / (panelHeightM + 0.2));

  const totalPossible = cols * rows;
  // Panel count bounded by real usable area (each panel needs ~2.4m² footprint)
  const maxPanelsByArea = Math.floor(usableAreaSqM / 2.6);
  const actualPanelCount = Math.min(totalPossible, Math.max(4, maxPanelsByArea));

  const panels: PlacedPanel[] = [];
  let placed = 0;

  // Spacing in percentage of container
  const panelWPercent = (panelWidthM / grossWidthM) * 85;
  const panelHPercent = (panelHeightM / grossHeightM) * 75;

  const startX = 12;
  const startY = 16;
  const stepX = (80 - panelWPercent) / Math.max(1, cols - 1);
  const stepY = (75 - panelHPercent) / Math.max(1, rows - 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (placed >= actualPanelCount) break;

      // Leave space for the water tank and stairwell (around middle-left and bottom-right)
      const normX = (startX + c * stepX) / 100;
      const normY = (startY + r * stepY) / 100;

      const nearTank = Math.hypot(normX - 0.35, normY - 0.3) < 0.18;
      const nearCabin = Math.hypot(normX - 0.7, normY - 0.65) < 0.2;

      if (nearTank || nearCabin) {
        continue;
      }

      panels.push({
        id: `panel-${placed + 1}`,
        x: Math.round((startX + c * stepX) * 10) / 10,
        y: Math.round((startY + r * stepY) * 10) / 10,
        width: Math.round(panelWPercent * 10) / 10,
        height: Math.round(panelHPercent * 10) / 10,
        rotationDeg: 0,
        wattageW: panelWattageW,
      });

      placed++;
    }
  }

  const totalKw = Number(((panels.length * panelWattageW) / 1000).toFixed(2));
  return { panels, totalKw, panelCount: panels.length };
}

/**
 * Return heat map color code according to solar flux percentage
 */
export function getSolarFluxColor(fluxPercent: number): {
  color: string;
  label: string;
  badgeClass: string;
} {
  if (fluxPercent >= 92) {
    return {
      color: "#eab308", // Golden Solar Yellow (Max sunlight)
      label: "Optimal Sunlight (92-100%)",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    };
  } else if (fluxPercent >= 78) {
    return {
      color: "#f97316", // Warm Orange (Good sunlight)
      label: "High Sunlight (78-91%)",
      badgeClass: "bg-orange-100 text-orange-900 border-orange-300",
    };
  } else if (fluxPercent >= 60) {
    return {
      color: "#06b6d4", // Cyan (Moderate sunlight)
      label: "Moderate Sunlight (60-77%)",
      badgeClass: "bg-cyan-100 text-cyan-900 border-cyan-300",
    };
  } else {
    return {
      color: "#6366f1", // Indigo / Shadow
      label: "Obstacle Shadow / Low Exposure (<60%)",
      badgeClass: "bg-indigo-100 text-indigo-900 border-indigo-300",
    };
  }
}

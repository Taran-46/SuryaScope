export interface RoofSegmentData {
  id: "south-east" | "west" | "north";
  name: string;
  area: string;
  areaSqM: number;
  exposure: string;
  exposurePercent: number;
  shading: string;
  orientation: string;
  status: "Recommended" | "Optional" | "Not recommended";
  statusBadge: string;
  panelCount: number;
  notes: string;
  position3D: [number, number, number];
}

export const ROOF_SEGMENTS: RoofSegmentData[] = [
  {
    id: "south-east",
    name: "South-East",
    area: "32.4 m²",
    areaSqM: 32.4,
    exposure: "High exposure",
    exposurePercent: 95,
    shading: "Low (0% Shading)",
    orientation: "South-East 135°",
    status: "Recommended",
    statusBadge: "bg-emerald-500/10 text-emerald-900 border-emerald-300 font-bold",
    panelCount: 10,
    notes: "Primary solar surface with optimal 24° pitch and full solar window from 8:00 to 17:00.",
    position3D: [-1.2, 4.8, 1.8],
  },
  {
    id: "west",
    name: "West",
    area: "18.2 m²",
    areaSqM: 18.2,
    exposure: "Moderate exposure",
    exposurePercent: 68,
    shading: "Moderate (15% Shade)",
    orientation: "West 270°",
    status: "Optional",
    statusBadge: "bg-solar-500/10 text-solar-900 border-solar-300 font-bold",
    panelCount: 6,
    notes: "Secondary solar surface. Captures late afternoon generation peak to offset evening consumption.",
    position3D: [3.8, 4.5, -1.2],
  },
  {
    id: "north",
    name: "North",
    area: "11.1 m²",
    areaSqM: 11.1,
    exposure: "Low exposure",
    exposurePercent: 38,
    shading: "Heavy (45% Shade)",
    orientation: "North 0°",
    status: "Not recommended",
    statusBadge: "bg-graphite-100 text-graphite-600 border-graphite-300 font-medium",
    panelCount: 0,
    notes: "Opposite roof slope with reduced irradiance and tree obstruction. Excluded from array.",
    position3D: [-3.8, 4.2, -1.8],
  },
];

export type ScenarioType = "GOOD" | "MODERATE" | "POOR";

export interface AssessmentResult {
  scenario: ScenarioType;
  address: string;
  monthlyBill: number;
  suitabilityScore: number;
  suitabilityLabel: "Highly Suitable" | "Moderately Suitable" | "Sub-Optimal";
  usableAreaSqM: number;
  solarExposurePercent: number;
  systemCapacityKw: number;
  panelCount: number;
  annualGenerationKwh: number;
  annualSavingsUsd: number;
  paybackYears: number;
  co2OffsetTons: number;
  irrPercent: number;
  roofOrientation: string;
  shadingDetail: string;
}

export const DEMO_SCENARIOS: Record<ScenarioType, AssessmentResult> = {
  GOOD: {
    scenario: "GOOD",
    address: "Palo Alto, California",
    monthlyBill: 240,
    suitabilityScore: 96,
    suitabilityLabel: "Highly Suitable",
    usableAreaSqM: 68.4,
    solarExposurePercent: 95,
    systemCapacityKw: 5.4,
    panelCount: 16,
    annualGenerationKwh: 7450,
    annualSavingsUsd: 2580,
    paybackYears: 3.8,
    co2OffsetTons: 5.8,
    irrPercent: 21.4,
    roofOrientation: "South-Facing 24° Tilt",
    shadingDetail: "Clear Horizon (0% Tree Obstruction)",
  },
  MODERATE: {
    scenario: "MODERATE",
    address: "Austin, Texas",
    monthlyBill: 175,
    suitabilityScore: 74,
    suitabilityLabel: "Moderately Suitable",
    usableAreaSqM: 42.1,
    solarExposurePercent: 72,
    systemCapacityKw: 3.6,
    panelCount: 11,
    annualGenerationKwh: 4680,
    annualSavingsUsd: 1420,
    paybackYears: 5.2,
    co2OffsetTons: 3.6,
    irrPercent: 14.8,
    roofOrientation: "East-West Dual Pitch",
    shadingDetail: "Minor Afternoon Dormer Shadow",
  },
  POOR: {
    scenario: "POOR",
    address: "Portland, Oregon",
    monthlyBill: 130,
    suitabilityScore: 48,
    suitabilityLabel: "Sub-Optimal",
    usableAreaSqM: 22.0,
    solarExposurePercent: 46,
    systemCapacityKw: 2.1,
    panelCount: 6,
    annualGenerationKwh: 2250,
    annualSavingsUsd: 720,
    paybackYears: 8.4,
    co2OffsetTons: 1.8,
    irrPercent: 7.2,
    roofOrientation: "North-West Slope 32°",
    shadingDetail: "Moderate Oak Tree Canopy Shading",
  },
};

export const ANALYSIS_STEPS = [
  { id: 1, label: "Locating property", detail: "Resolving satellite geometry & spatial boundary" },
  { id: 2, label: "Analysing roof geometry", detail: "Segmenting pitches, tilt angles & structural facets" },
  { id: 3, label: "Checking solar exposure", detail: "Simulating annual sun path & shade vectors" },
  { id: 4, label: "Estimating usable area", detail: "Filtering skylights, vents & obstructed surfaces" },
  { id: 5, label: "Calculating solar potential", detail: "Mapping Photovoltaic cell yield & kWh output" },
  { id: 6, label: "Preparing assessment", detail: "Finalizing payback horizon & financial model" },
];

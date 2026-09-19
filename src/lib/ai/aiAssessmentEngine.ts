export interface AiAssessmentPayload {
  address: string;
  suitabilityScore: number;
  suitabilityLabel: string;
  roofAreaSqM: number;
  usableAreaSqM: number;
  orientation: string;
  shading: string;
  solarExposurePercent: number;
  recommendedCapacityKw: number;
  annualGenerationKwh: number;
  installationCostInr: number;
  subsidyInr: number;
  annualSavingsInr: number;
  paybackYears: number;
}

export interface AiReportSections {
  whyItScored: string;
  bestRoofSection: string;
  financialSummary: string;
  whatToDoNext: string;
  isFallback: boolean;
}

// Deterministic local explanation generator (used when API is unavailable or missing API key)
export function generateLocalAiReport(input: AiAssessmentPayload): AiReportSections {
  const {
    address,
    suitabilityScore,
    usableAreaSqM,
    orientation,
    solarExposurePercent,
    recommendedCapacityKw,
    annualGenerationKwh,
    installationCostInr,
    subsidyInr,
    annualSavingsInr,
    paybackYears,
  } = input;

  const netCost = installationCostInr - subsidyInr;

  const whyItScored =
    suitabilityScore >= 90
      ? `Property at ${address} achieved a high suitability index of ${suitabilityScore}/100. This is driven by an unobstructed ${orientation} roof slope receiving ${solarExposurePercent}% annual solar irradiance with negligible shading. The roof geometry permits an efficient ${recommendedCapacityKw} kWp solar array configuration.`
      : suitabilityScore >= 70
      ? `Property at ${address} achieved a solid suitability index of ${suitabilityScore}/100. The roof has good solar access (${solarExposurePercent}% exposure) across ${usableAreaSqM} m² usable area, with minor afternoon shading or secondary pitch orientation slightly tempering total peak yield.`
      : `Property at ${address} has a sub-optimal suitability index of ${suitabilityScore}/100. Tree canopy shading and non-south slope orientation restrict usable area to ${usableAreaSqM} m² and limit annual solar exposure to ${solarExposurePercent}%.`;

  const bestRoofSection =
    `The primary South-East roof facet (${usableAreaSqM} m² usable) is the optimal installation zone. It features a favorable 24° pitch that captures peak morning and midday irradiance with zero structural obstruction, housing ${recommendedCapacityKw} kWp of high-efficiency solar modules.`;

  const financialSummary =
    `With an estimated gross installation cost of ₹${installationCostInr.toLocaleString("en-IN")} and ₹${subsidyInr.toLocaleString("en-IN")} in government assistance (PM Surya Ghar subsidy), your net investment is ₹${netCost.toLocaleString("en-IN")}. Generating ${annualGenerationKwh.toLocaleString("en-IN")} kWh annually yields ₹${annualSavingsInr.toLocaleString("en-IN")} in bill savings, achieving full payback in ${paybackYears} years.`;

  const whatToDoNext =
    `1. Download your preliminary Suryascope pre-feasibility audit summary.\n` +
    `2. Share this satellite report with accredited solar installers to request competitive turnkey quotes.\n` +
    `3. Schedule a physical site survey to verify structural roof load capacity, wiring conduit runs, and electrical meter net-metering compatibility.`;

  return {
    whyItScored,
    bestRoofSection,
    financialSummary,
    whatToDoNext,
    isFallback: true,
  };
}

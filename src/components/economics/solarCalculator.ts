export interface MeasuredData {
  latitude?: number;
  longitude?: number;
  solarResourceGhi?: number; // kWh/m²/year
  solarSource: string;
  solarResourceIsMeasured: boolean;
  roofAreaIsMeasured: boolean;
  measuredRoofAreaSqM?: number;
}

export interface DerivedData {
  systemSizeKw: number;
  panelCount: number;
  requiredRoofAreaSqM: number;
  specificYieldKwhPerKw: number;
  annualGenerationKwh: number;
  annualSavingsInr: number;
  monthlySavingsInr: number;
  installationCost: number;
  subsidyAmount: number;
  netInvestmentCost: number;
  paybackYears: number;
  electricityOffsetPercent: number;
  cumulativeCashflow: { year: number; netCash: number; isBreakEven?: boolean }[];
}

export interface EstimateData {
  monthlyBill: number;
  monthlyConsumptionKwh: number;
  annualConsumptionKwh: number;
  preliminaryRoofAreaSqM: number;
}

export interface ExplicitAssumptions {
  panelWattageW: number;
  panelAreaSqM: number;
  performanceRatio: number;
  costPerKwInr: number;
  electricityTariffInrPerKwh: number;
  tariffInflationRate: number;
  tariffNote: string;
  subsidyRuleText: string;
}

export interface UnavailableDataInfo {
  roofGeometryNotice: string;
  solarResourceNotice?: string;
}

export interface SolarCalculationInput {
  systemSizeKw?: number;
  monthlyBill?: number;
  monthlyConsumptionKwh?: number;
  currency?: "INR" | "USD";
  latitude?: number;
  longitude?: number;
  solarResourceGhi?: number; // kWh/m²/year
  annualGenerationPerKw?: number; // legacy specific yield override
  solarSource?: string;
  isEstimate?: boolean;
  costPerKw?: number;
  costPerKwInr?: number;
  subsidyAmount?: number;
  electricityTariffPerKwh?: number;
  analysisYears?: number;
  usableRoofAreaSqM?: number;
  roofAreaIsMeasured?: boolean;
  // Optional assumption overrides
  panelWattageW?: number;
  panelAreaSqM?: number;
  performanceRatio?: number;
}

export interface SolarCalculationResult {
  // Legacy top-level fields for backwards compatibility
  systemSizeKw: number;
  installationCost: number;
  subsidyAmount: number;
  netInvestmentCost: number;
  annualGenerationKwh: number;
  annualSavingsInr: number;
  paybackYears: number;
  monthlySavingsInr: number;
  cumulativeCashflow: { year: number; netCash: number; isBreakEven?: boolean }[];
  solarResourceGhi?: number;
  isEstimate?: boolean;
  solarSource?: string;

  // New structured transparent data categories
  measured: MeasuredData;
  derived: DerivedData;
  estimates: EstimateData;
  assumptions: ExplicitAssumptions;
  unavailableData: UnavailableDataInfo;
  validationErrors: string[];
}

// Indian Rupee currency formatter (e.g. ₹2,00,000)
export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

// Format numbers in Indian numbering system without currency symbol (e.g. 2,00,000)
export function formatIndianNumber(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Calculate PM Surya Ghar Govt. Scheme Subsidy (India Central Scheme Rules)
 * - ≤ 2 kW: ₹30,000 per kW (e.g. 2 kW = ₹60,000)
 * - 2 to 3 kW: ₹18,000 per additional kW (e.g. 3 kW = ₹78,000)
 * - > 3 kW: Fixed maximum subsidy cap of ₹78,000
 */
export function calculatePmSuryaGharSubsidy(systemCapacityKw: number): number {
  if (systemCapacityKw <= 0) return 0;
  if (systemCapacityKw <= 2) {
    return Math.round(systemCapacityKw * 30000);
  } else if (systemCapacityKw <= 3) {
    return Math.round(2 * 30000 + (systemCapacityKw - 2) * 18000);
  } else {
    return 78000;
  }
}

/**
 * DETERMINISTIC & TRANSPARENT SOLAR CALCULATION ENGINE
 * Separates Measured Data, Derived Data, Estimates, Explicit Assumptions, and Unavailable Data.
 */
export function calculateSolarEconomics(
  input: SolarCalculationInput
): SolarCalculationResult {
  const validationErrors: string[] = [];

  // 1. Explicit Assumptions & Defaults
  const panelWattageW = input.panelWattageW || 540; // 540 W Monocrystalline PERC Module
  const panelAreaSqM = input.panelAreaSqM || 2.2; // 2.2 m² per 540W module
  const performanceRatio = input.performanceRatio || 0.81; // 81% system efficiency (19% losses)
  const costPerKwInr = input.costPerKw || input.costPerKwInr || 41666; // ~ ₹2,00,000 per 4.8 kW
  const electricityTariffInrPerKwh = input.electricityTariffPerKwh || 6.5; // ₹6.50/kWh average
  const tariffInflationRate = 0.03; // 3.0% annual tariff escalation
  const analysisYears = input.analysisYears || 10;

  // 2. Validate Coordinates & Inputs
  const latitude = input.latitude;
  const longitude = input.longitude;

  if (typeof latitude === "number" && (latitude < -90 || latitude > 90)) {
    validationErrors.push("Invalid latitude coordinate: must be between -90 and 90 degrees.");
  }
  if (typeof longitude === "number" && (longitude < -180 || longitude > 180)) {
    validationErrors.push("Invalid longitude coordinate: must be between -180 and 180 degrees.");
  }

  const rawMonthlyBill = input.monthlyBill ?? 240;
  if (rawMonthlyBill < 0) {
    validationErrors.push("Monthly electricity bill cannot be negative. Resetting to 0.");
  }
  const monthlyBill = Math.max(0, rawMonthlyBill);

  // 3. Estimate Monthly & Annual kWh Consumption from bill or direct input
  const tariffForConsumption = input.currency === "USD" ? 0.65 : electricityTariffInrPerKwh;
  const monthlyConsumptionKwh = input.monthlyConsumptionKwh ?? Math.round(monthlyBill / tariffForConsumption);
  const annualConsumptionKwh = monthlyConsumptionKwh * 12;

  // 4. Solar Resource & Specific Yield
  let solarGhi = input.solarResourceGhi;
  let isSolarMeasured = !input.isEstimate && typeof solarGhi === "number" && solarGhi > 0;
  let solarSource = input.solarSource || "Regional Climatological Fallback";

  if (solarGhi !== undefined && (solarGhi <= 0 || isNaN(solarGhi))) {
    validationErrors.push("Solar resource GHI is non-positive or invalid. Using regional climatological fallback.");
    solarGhi = undefined;
    isSolarMeasured = false;
  }

  // Calculate Specific Yield (kWh/kW/year)
  const specificYieldKwhPerKw = input.annualGenerationPerKw
    ? input.annualGenerationPerKw
    : solarGhi
    ? Math.round(solarGhi * performanceRatio)
    : 1400; // Regional fallback

  // 5. Derive System Size & Rooftop Geometry
  let systemSizeKw = input.systemSizeKw;
  if (!systemSizeKw || systemSizeKw <= 0) {
    // Derive from annual consumption
    const requiredCapacity = Number((annualConsumptionKwh / specificYieldKwhPerKw).toFixed(1));
    systemSizeKw = Math.max(1.0, Math.min(100.0, requiredCapacity || 4.8));
  }
  systemSizeKw = Number(systemSizeKw.toFixed(1));

  // Panel Count & Required Area
  const panelCount = Math.max(1, Math.ceil((systemSizeKw * 1000) / panelWattageW));
  const requiredRoofAreaSqM = Number((panelCount * panelAreaSqM).toFixed(1));
  const preliminaryRoofAreaSqM = Number((systemSizeKw * 10).toFixed(1));

  const roofAreaIsMeasured = Boolean(input.roofAreaIsMeasured && input.usableRoofAreaSqM);
  const measuredRoofArea = input.usableRoofAreaSqM;

  // 6. Annual Generation, Financials & Subsidy
  const annualGenerationKwh = Math.round(systemSizeKw * specificYieldKwhPerKw);
  const annualSavingsInr = Math.round(annualGenerationKwh * electricityTariffInrPerKwh);
  const monthlySavingsInr = Math.round(annualSavingsInr / 12);
  const electricityOffsetPercent = annualConsumptionKwh > 0
    ? Math.min(100, Math.round((annualGenerationKwh / annualConsumptionKwh) * 100))
    : 100;

  const installationCost = Math.round(systemSizeKw * costPerKwInr);
  const subsidyAmount = input.subsidyAmount !== undefined
    ? input.subsidyAmount
    : calculatePmSuryaGharSubsidy(systemSizeKw);

  const netInvestmentCost = Math.max(0, installationCost - subsidyAmount);
  const paybackYears = annualSavingsInr > 0
    ? Number((netInvestmentCost / annualSavingsInr).toFixed(1))
    : 0;

  // 7. Generate 10-Year Cumulative Cashflow Series
  const cumulativeCashflow: { year: number; netCash: number; isBreakEven?: boolean }[] = [];
  let currentNet = -netInvestmentCost;
  let breakEvenFound = false;

  for (let year = 0; year <= analysisYears; year++) {
    if (year === 0) {
      cumulativeCashflow.push({ year: 0, netCash: -netInvestmentCost });
    } else {
      const inflatedTariff = electricityTariffInrPerKwh * Math.pow(1 + tariffInflationRate, year - 1);
      const yearSavings = annualGenerationKwh * inflatedTariff;
      currentNet += yearSavings;

      const isBreakEven = !breakEvenFound && currentNet >= 0;
      if (isBreakEven) breakEvenFound = true;

      cumulativeCashflow.push({
        year,
        netCash: Math.round(currentNet),
        isBreakEven,
      });
    }
  }

  // 8. Construct Transparent Structured Data Model
  const measured: MeasuredData = {
    latitude,
    longitude,
    solarResourceGhi: solarGhi,
    solarSource,
    solarResourceIsMeasured: isSolarMeasured,
    roofAreaIsMeasured,
    measuredRoofAreaSqM: measuredRoofArea,
  };

  const derived: DerivedData = {
    systemSizeKw,
    panelCount,
    requiredRoofAreaSqM,
    specificYieldKwhPerKw,
    annualGenerationKwh,
    annualSavingsInr,
    monthlySavingsInr,
    installationCost,
    subsidyAmount,
    netInvestmentCost,
    paybackYears,
    electricityOffsetPercent,
    cumulativeCashflow,
  };

  const estimates: EstimateData = {
    monthlyBill,
    monthlyConsumptionKwh,
    annualConsumptionKwh,
    preliminaryRoofAreaSqM,
  };

  const assumptions: ExplicitAssumptions = {
    panelWattageW,
    panelAreaSqM,
    performanceRatio,
    costPerKwInr,
    electricityTariffInrPerKwh,
    tariffInflationRate,
    tariffNote: "Assumption — requires utility bill tariff verification.",
    subsidyRuleText: "PM Surya Ghar scheme rules: ₹30,000/kW up to 2 kW; ₹18,000 for 3rd kW; capped at ₹78,000 max.",
  };

  const unavailableData: UnavailableDataInfo = {
    roofGeometryNotice: roofAreaIsMeasured
      ? "Roof geometry measured via high-resolution cadastre mesh."
      : "Preliminary estimate — rooftop geometry not yet measured by site survey.",
    solarResourceNotice: isSolarMeasured
      ? undefined
      : "Solar irradiance value based on regional climatological fallback assumptions.",
  };

  return {
    // Backward compatible top-level fields
    systemSizeKw,
    installationCost,
    subsidyAmount,
    netInvestmentCost,
    annualGenerationKwh,
    annualSavingsInr,
    paybackYears,
    monthlySavingsInr,
    cumulativeCashflow,
    solarResourceGhi: solarGhi,
    isEstimate: !isSolarMeasured,
    solarSource,

    // Transparent structured categories
    measured,
    derived,
    estimates,
    assumptions,
    unavailableData,
    validationErrors,
  };
}

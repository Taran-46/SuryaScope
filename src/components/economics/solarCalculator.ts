export interface SolarCalculationInput {
  systemSizeKw: number;
  costPerKw: number;
  subsidyAmount: number;
  annualGenerationPerKw: number;
  electricityTariffPerKwh: number;
  analysisYears?: number;
  solarResourceGhi?: number; // kWh/m²/year
  isEstimate?: boolean;
  solarSource?: string;
}

export interface SolarCalculationResult {
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

// Dedicated calculation engine (separate from UI)
export function calculateSolarEconomics(
  input: SolarCalculationInput
): SolarCalculationResult {
  const {
    systemSizeKw = 4.8,
    costPerKw = 41666, // ~ ₹2,00,000 for 4.8 kW
    subsidyAmount = 78000, // PM Surya Ghar Govt Subsidy
    annualGenerationPerKw = 1400, // 1400 kWh/kW/year average in India
    electricityTariffPerKwh = 6.5, // ₹6.5/kWh average commercial/res tariff
    analysisYears = 10,
    solarResourceGhi,
    isEstimate = true,
    solarSource = "Regional Climatological Fallback",
  } = input;

  const installationCost = Math.round(systemSizeKw * costPerKw); // ~ ₹2,00,000
  const netInvestmentCost = Math.max(0, installationCost - subsidyAmount); // ~ ₹1,22,000
  const annualGenerationKwh = Math.round(systemSizeKw * annualGenerationPerKw); // 6,720 kWh
  const annualSavingsInr = Math.round(annualGenerationKwh * electricityTariffPerKwh); // ~ ₹43,680
  const monthlySavingsInr = Math.round(annualSavingsInr / 12);
  const paybackYears = Number((netInvestmentCost / annualSavingsInr).toFixed(1)); // ~ 2.8 - 4.2 yrs

  // Generate cumulative 10-year cashflow series
  const cumulativeCashflow = [];
  let currentNet = -netInvestmentCost;
  let breakEvenFound = false;

  for (let year = 0; year <= analysisYears; year++) {
    if (year === 0) {
      cumulativeCashflow.push({ year: 0, netCash: -netInvestmentCost });
    } else {
      // Apply 3% annual tariff inflation factor
      const inflatedTariff = electricityTariffPerKwh * Math.pow(1.03, year - 1);
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

  return {
    systemSizeKw,
    installationCost,
    subsidyAmount,
    netInvestmentCost,
    annualGenerationKwh,
    annualSavingsInr,
    paybackYears,
    monthlySavingsInr,
    cumulativeCashflow,
    solarResourceGhi,
    isEstimate,
    solarSource,
  };
}

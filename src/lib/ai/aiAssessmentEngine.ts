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

export interface SiteVisitVerdict {
  status: "DIRECT_FEASIBLE" | "VISIT_RECOMMENDED" | "VISIT_REQUIRED";
  title: string;
  badgeClass: string;
  summary: string;
  reasons: string[];
}

export interface AiReportSections {
  executiveSummary: string;
  keyFindings: {
    label: string;
    value: string;
    subtext: string;
  }[];
  siteVisitVerdict: SiteVisitVerdict;
  actionSteps: string[];
  isFallback: boolean;
}

/**
 * Determine if a physical site survey is required or if the property is directly feasible
 */
export function evaluateSiteVisitNeed(payload: AiAssessmentPayload): SiteVisitVerdict {
  const { usableAreaSqM, solarExposurePercent, shading } = payload;
  const isHeavyShade = shading.toLowerCase().includes("high") || shading.toLowerCase().includes("heavy") || solarExposurePercent < 60;
  const isSmallArea = usableAreaSqM < 18;

  if (isHeavyShade || isSmallArea) {
    return {
      status: "VISIT_REQUIRED",
      title: "Physical Site Survey Required (Constrained Feasibility)",
      badgeClass: "bg-red-100 text-red-900 border-red-300",
      summary: "Usable unshaded rooftop space is constrained. A structural solar engineer must physically inspect the roof to verify mounting feasibility or explore elevated ballast / ground alternatives.",
      reasons: [
        isSmallArea ? `Net usable rooftop area is small (${usableAreaSqM} m²)` : `Obstacle or tree shading restricts sun exposure (${solarExposurePercent}%)`,
        "Physical load-bearing verification and elevated solar structure assessment required before financial commitment",
      ],
    };
  }

  const isModerateArea = usableAreaSqM < 32;
  const isModerateExposure = solarExposurePercent < 85;

  if (isModerateArea || isModerateExposure) {
    return {
      status: "VISIT_RECOMMENDED",
      title: "Physical Site Survey Recommended (Obstacle Verification)",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      summary: "Rooftop solar is clearly viable. An on-site survey is recommended primarily to verify physical tank clearances, wiring conduit paths, and parapet wall afternoon shadows.",
      reasons: [
        `Rooftop accommodates a ${payload.recommendedCapacityKw} kW array with ${usableAreaSqM} m² usable space`,
        "Physical check advised to confirm inverter mounting location and net-meter electrical distribution board",
      ],
    };
  }

  return {
    status: "DIRECT_FEASIBLE",
    title: "Direct Installation Feasible (Low Feasibility Risk)",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    summary: "High-yield, unobstructed rooftop with prime solar orientation. You can proceed directly to installer contractor bidding; site visit is needed only for final electrical meter sign-off.",
    reasons: [
      `Generous unshaded roof surface (${usableAreaSqM} m²) with ${solarExposurePercent}% solar exposure`,
      "Zero structural obstacles impeding standard solar panel module layout",
    ],
  };
}

/**
 * Deterministic local explanation generator (ultra concise, scannable, actionable)
 */
export function generateLocalAiReport(input: AiAssessmentPayload): AiReportSections {
  const {
    address,
    suitabilityScore,
    roofAreaSqM,
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

  const siteVisitVerdict = evaluateSiteVisitNeed(input);
  const netCost = installationCostInr - subsidyInr;

  const executiveSummary =
    `Property at ${address} scored ${suitabilityScore}/100. It offers ${usableAreaSqM} m² of unshaded usable roof surface facing ${orientation}, supporting an optimal ${recommendedCapacityKw} kW solar installation.`;

  const keyFindings = [
    {
      label: "Usable Roof Area",
      value: `${usableAreaSqM} m²`,
      subtext: `From ${roofAreaSqM} m² gross (obstacles & setbacks deducted)`,
    },
    {
      label: "Solar Exposure",
      value: `${solarExposurePercent}%`,
      subtext: `Optimal orientation: ${orientation}`,
    },
    {
      label: "Recommended Array",
      value: `${recommendedCapacityKw} kW`,
      subtext: `Est. annual generation: ${annualGenerationKwh.toLocaleString("en-IN")} kWh`,
    },
    {
      label: "Financial Payoff",
      value: `₹${annualSavingsInr.toLocaleString("en-IN")}/yr`,
      subtext: `Net cost ₹${netCost.toLocaleString("en-IN")} • Payback in ${paybackYears} years`,
    },
  ];

  const actionSteps = [
    "Share this satellite pre-audit with accredited solar installers to request competitive quotes.",
    "Verify DISCOM consumer meter net-metering eligibility under the PM Surya Ghar national portal.",
    siteVisitVerdict.status === "DIRECT_FEASIBLE"
      ? "Schedule installer physical visit solely for conduit routing and meter connection."
      : "Schedule an on-site engineer visit to confirm rooftop load and obstacle setbacks.",
  ];

  return {
    executiveSummary,
    keyFindings,
    siteVisitVerdict,
    actionSteps,
    isFallback: true,
  };
}

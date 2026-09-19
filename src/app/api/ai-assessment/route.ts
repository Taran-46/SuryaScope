import { NextResponse } from "next/server";
import { AiAssessmentPayload, generateLocalAiReport, AiReportSections } from "@/lib/ai/aiAssessmentEngine";

export async function POST(req: Request) {
  try {
    const payload: AiAssessmentPayload = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.OPENAI_MODEL || "anthropic/claude-3.5-haiku";

    // Fallback if API key is not configured
    if (!apiKey) {
      const fallbackReport = generateLocalAiReport(payload);
      return NextResponse.json(fallbackReport);
    }

    // Call OpenAI / OpenRouter compatible API
    const systemPrompt = `You are Suryascope AI, an expert rooftop solar technical auditor. 
CRITICAL RULE: Do NOT calculate or alter any numbers. The provided deterministic figures are ground truth. 
Your task is to explain the solar assessment in 4 concise, professional report sections.
Respond strictly in JSON format with key names:
"whyItScored", "bestRoofSection", "financialSummary", "whatToDoNext".`;

    const userPrompt = `Solar Assessment Data for ${payload.address}:
- Suitability Score: ${payload.suitabilityScore}/100 (${payload.suitabilityLabel})
- Total Roof Area: ${payload.roofAreaSqM} m² | Usable Area: ${payload.usableAreaSqM} m²
- Primary Orientation: ${payload.orientation}
- Shading Level: ${payload.shading} (Exposure: ${payload.solarExposurePercent}%)
- Recommended System Capacity: ${payload.recommendedCapacityKw} kWp (${payload.annualGenerationKwh} kWh/yr)
- Gross Cost: ₹${payload.installationCostInr.toLocaleString("en-IN")} | Subsidy: ₹${payload.subsidyInr.toLocaleString("en-IN")} | Net Cost: ₹${(payload.installationCostInr - payload.subsidyInr).toLocaleString("en-IN")}
- Annual Savings: ₹${payload.annualSavingsInr.toLocaleString("en-IN")}/yr | Payback Period: ${payload.paybackYears} years

Write the 4 structured report sections. Keep each section concise, authoritative, and structured.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn("AI API request returned non-200, falling back to local report:", res.status);
      return NextResponse.json(generateLocalAiReport(payload));
    }

    const data = await res.json();
    const contentText = data.choices?.[0]?.message?.content;

    if (!contentText) {
      return NextResponse.json(generateLocalAiReport(payload));
    }

    const parsed = JSON.parse(contentText);

    const report: AiReportSections = {
      whyItScored: parsed.whyItScored || generateLocalAiReport(payload).whyItScored,
      bestRoofSection: parsed.bestRoofSection || generateLocalAiReport(payload).bestRoofSection,
      financialSummary: parsed.financialSummary || generateLocalAiReport(payload).financialSummary,
      whatToDoNext: parsed.whatToDoNext || generateLocalAiReport(payload).whatToDoNext,
      isFallback: false,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.warn("AI Assessment API error, using deterministic local fallback:", error);
    // Always fall back safely without breaking the user experience
    const reqBody = await req.json().catch(() => ({}));
    return NextResponse.json(generateLocalAiReport(reqBody));
  }
}

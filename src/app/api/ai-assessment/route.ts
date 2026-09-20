import { NextResponse } from "next/server";
import {
  AiAssessmentPayload,
  generateLocalAiReport,
  AiReportSections,
  evaluateSiteVisitNeed,
} from "@/lib/ai/aiAssessmentEngine";

export async function POST(req: Request) {
  try {
    const payload: AiAssessmentPayload = await req.json();
    const siteVisitVerdict = evaluateSiteVisitNeed(payload);

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Check for Gemini API Key (Free tier available from Google AI Studio)
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const prompt = `You are SuryaScope AI, a solar technical auditor.
Analyze this solar roof data:
- Address: ${payload.address}
- Usable Area: ${payload.usableAreaSqM} m² (from ${payload.roofAreaSqM} m² gross, shading: ${payload.shading})
- Solar Exposure: ${payload.solarExposurePercent}% (${payload.orientation})
- Recommended Capacity: ${payload.recommendedCapacityKw} kW (${payload.annualGenerationKwh} kWh/yr)
- Net Cost: ₹${(payload.installationCostInr - payload.subsidyInr).toLocaleString("en-IN")} (Subsidy: ₹${payload.subsidyInr.toLocaleString("en-IN")})
- Annual Savings: ₹${payload.annualSavingsInr.toLocaleString("en-IN")}/yr, Payback: ${payload.paybackYears} yrs
- Site Visit Verdict: ${siteVisitVerdict.title}

Provide a short, direct executive summary (maximum 2 sentences) and 3 clear action steps for the homeowner.
Respond strictly in JSON format:
{
  "executiveSummary": "...",
  "actionSteps": ["...", "...", "..."]
}`;

        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            const base = generateLocalAiReport(payload);
            return NextResponse.json({
              executiveSummary: parsed.executiveSummary || base.executiveSummary,
              keyFindings: base.keyFindings,
              siteVisitVerdict,
              actionSteps: Array.isArray(parsed.actionSteps) ? parsed.actionSteps : base.actionSteps,
              isFallback: false,
            });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, trying secondary or local:", geminiErr);
      }
    }

    // 2. Check for OpenAI / OpenRouter API Key
    if (openaiKey) {
      try {
        const baseURL = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
        const model = process.env.OPENAI_MODEL || "anthropic/claude-3.5-haiku";

        const res = await fetch(`${baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are SuryaScope AI. Summarize solar roof viability in 2 punchy sentences and 3 bullet action items in JSON: { executiveSummary: string, actionSteps: string[] }.",
              },
              {
                role: "user",
                content: `Address: ${payload.address}, Usable Area: ${payload.usableAreaSqM} m², Capacity: ${payload.recommendedCapacityKw} kW, Payback: ${payload.paybackYears} yrs.`,
              },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const base = generateLocalAiReport(payload);
            return NextResponse.json({
              executiveSummary: parsed.executiveSummary || base.executiveSummary,
              keyFindings: base.keyFindings,
              siteVisitVerdict,
              actionSteps: Array.isArray(parsed.actionSteps) ? parsed.actionSteps : base.actionSteps,
              isFallback: false,
            });
          }
        }
      } catch (openaiErr) {
        console.warn("OpenAI API call failed, using local generator:", openaiErr);
      }
    }

    // 3. Deterministic Local Generator
    return NextResponse.json(generateLocalAiReport(payload));
  } catch (error) {
    console.warn("AI Assessment API route error, using local fallback:", error);
    const reqBody = await req.json().catch(() => ({}));
    return NextResponse.json(generateLocalAiReport(reqBody));
  }
}

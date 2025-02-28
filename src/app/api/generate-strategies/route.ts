import { NextResponse } from "next/server";
import OpenAI from "openai";
import { rateLimit } from "@/lib/rate-limit";

// Initialize OpenAI client with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiter: 10 requests per hour per IP
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 10,
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    await limiter.check(10, "OPENAI_RATE_LIMIT");

    const { regions, affectedSuppliers, simulationConfig } = await req.json();

    // Validate input and API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!regions || !affectedSuppliers || !simulationConfig) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Format the prompt with specific details about the disruption
    const prompt = `As a supply chain risk management expert, analyze this disruption scenario and provide 3 practical mitigation strategies:

Scenario Details:
- Affected Regions: ${regions
      .map(
        (r: any) =>
          `[${r.lat.toFixed(2)}, ${r.lng.toFixed(2)}] with radius ${r.radius}km`
      )
      .join(", ")}
- Number of Affected Suppliers: ${affectedSuppliers.length}
- Disruption Duration: ${simulationConfig.duration} days
- Impact Intensity: ${simulationConfig.intensity * 100}%
- Recovery Rate: ${simulationConfig.recoveryRate * 100}%

For each strategy, provide:
1. Action: A clear, actionable step
2. Impact: Expected effectiveness (high/medium/low)
3. Difficulty: Implementation complexity (high/medium/low)
4. Timeframe: Estimated time to implement
5. Description: Brief explanation of the strategy

Focus on realistic, cost-effective solutions that:
- Can be implemented within the specified timeframe
- Consider geographical constraints
- Account for the severity of the disruption
- Prioritize critical suppliers and materials
- Balance cost against effectiveness`;

    // Call OpenAI with optimized parameters
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Using GPT-4 for better strategic analysis
      messages: [
        {
          role: "system",
          content:
            "You are a supply chain risk management expert specializing in infrastructure and transportation projects. Provide practical, actionable mitigation strategies based on real-world constraints and best practices.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9,
      frequency_penalty: 0.5,
      presence_penalty: 0.3,
    });

    // Parse the response into structured strategies
    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Process the response into structured strategies
    const strategies = response
      .split(/Strategy \d+:/g)
      .filter(Boolean)
      .map((strategy) => {
        const lines = strategy.trim().split("\n");
        const actionMatch = lines.find((l) => l.includes("Action:"));
        const impactMatch = lines.find((l) => l.includes("Impact:"));
        const difficultyMatch = lines.find((l) => l.includes("Difficulty:"));
        const timeframeMatch = lines.find((l) => l.includes("Timeframe:"));
        const descriptionMatch = lines.find((l) => l.includes("Description:"));

        return {
          action: actionMatch
            ? actionMatch.replace("Action:", "").trim()
            : "Unknown action",
          impact: impactMatch
            ? (impactMatch
                .replace("Impact:", "")
                .trim()
                .toLowerCase()
                .split(" ")[0] as "high" | "medium" | "low")
            : "medium",
          difficulty: difficultyMatch
            ? (difficultyMatch
                .replace("Difficulty:", "")
                .trim()
                .toLowerCase()
                .split(" ")[0] as "high" | "medium" | "low")
            : "medium",
          timeframe: timeframeMatch
            ? timeframeMatch.replace("Timeframe:", "").trim()
            : "1-3 months",
          description: descriptionMatch
            ? descriptionMatch.replace("Description:", "").trim()
            : "",
        };
      });

    // Log the successful API call
    console.log("Strategy generation successful:", {
      timestamp: new Date().toISOString(),
      regionCount: regions.length,
      supplierCount: affectedSuppliers.length,
      strategyCount: strategies.length,
      modelUsed: "gpt-4-turbo-preview",
    });

    return NextResponse.json({ strategies });
  } catch (error: any) {
    // Enhanced error handling
    console.error("Strategy generation error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      code: error.code,
      type: error.type,
    });

    // Handle specific error types
    if (error.code === "RATE_LIMIT_EXCEEDED") {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    if (
      error.code === "insufficient_quota" ||
      error.code === "invalid_api_key"
    ) {
      return NextResponse.json(
        { error: "OpenAI API error. Please check your API key configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate strategies",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

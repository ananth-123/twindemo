import { Supplier } from "@/types/supplier";

// CCRA3 Risk Categories based on UK's Third Climate Change Risk Assessment
export type CCRARiskCategory =
  | "extreme_weather"
  | "flooding"
  | "water_scarcity"
  | "temperature_rise"
  | "sea_level_rise"
  | "supply_chain_disruption";

export interface CCRARisk {
  category: CCRARiskCategory;
  urgency:
    | "more_action"
    | "further_investigation"
    | "sustain_current_action"
    | "watching_brief";
  magnitude: "high" | "medium" | "low";
  confidence: "high" | "medium" | "low";
  timeframe: "now" | "2050s" | "2080s";
}

export interface CCRAAssessment {
  supplier: Supplier;
  risks: CCRARisk[];
  overallScore: number;
  adaptationStatus: "high" | "medium" | "low";
  recommendations: string[];
}

// Risk weights based on CCRA3 methodology
const RISK_WEIGHTS = {
  extreme_weather: 0.25,
  flooding: 0.2,
  water_scarcity: 0.15,
  temperature_rise: 0.15,
  sea_level_rise: 0.1,
  supply_chain_disruption: 0.15,
};

const URGENCY_SCORES = {
  more_action: 1.0,
  further_investigation: 0.7,
  sustain_current_action: 0.5,
  watching_brief: 0.3,
};

const MAGNITUDE_SCORES = {
  high: 1.0,
  medium: 0.6,
  low: 0.3,
};

const CONFIDENCE_SCORES = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
};

// Geographic risk factors based on CCRA3 regional analysis
const GEOGRAPHIC_RISK_FACTORS: Record<string, number> = {
  "United Kingdom": 0.8, // Base risk for UK
  Netherlands: 0.9, // High sea level rise risk
  Germany: 0.7,
  France: 0.7,
  Spain: 0.85, // High water scarcity risk
  Italy: 0.8,
  Greece: 0.9, // High temperature rise risk
  Poland: 0.7,
  Sweden: 0.6,
  Norway: 0.6,
  Denmark: 0.7,
  Belgium: 0.8,
  Ireland: 0.75,
  Portugal: 0.85, // High water scarcity risk
  // Add more countries as needed
};

/**
 * Evaluates climate risks for a supplier based on CCRA3 methodology
 */
export function evaluateSupplierCCRA(supplier: Supplier): CCRAAssessment {
  // Initialize risks array
  const risks: CCRARisk[] = [];

  // Evaluate geographic risk
  const geoRisk = GEOGRAPHIC_RISK_FACTORS[supplier.location.country] || 0.75;

  // Evaluate extreme weather risk
  risks.push({
    category: "extreme_weather",
    urgency: evaluateUrgency(supplier.risk, geoRisk),
    magnitude: evaluateMagnitude(supplier.risk, geoRisk),
    confidence: evaluateConfidence(supplier.risk),
    timeframe: "now",
  });

  // Evaluate flooding risk based on location and historical data
  risks.push({
    category: "flooding",
    urgency: evaluateUrgency(supplier.risk * geoRisk, 0.8),
    magnitude: evaluateMagnitude(supplier.risk * geoRisk, 0.8),
    confidence: evaluateConfidence(supplier.risk),
    timeframe: "2050s",
  });

  // Evaluate water scarcity risk
  risks.push({
    category: "water_scarcity",
    urgency: evaluateUrgency(supplier.risk * geoRisk, 0.7),
    magnitude: evaluateMagnitude(supplier.risk * geoRisk, 0.7),
    confidence: evaluateConfidence(supplier.risk),
    timeframe: "2050s",
  });

  // Evaluate temperature rise risk
  risks.push({
    category: "temperature_rise",
    urgency: evaluateUrgency(supplier.risk * geoRisk, 0.9),
    magnitude: evaluateMagnitude(supplier.risk * geoRisk, 0.9),
    confidence: evaluateConfidence(supplier.risk),
    timeframe: "2080s",
  });

  // Evaluate sea level rise risk
  risks.push({
    category: "sea_level_rise",
    urgency: evaluateUrgency(supplier.risk * geoRisk, 0.6),
    magnitude: evaluateMagnitude(supplier.risk * geoRisk, 0.6),
    confidence: evaluateConfidence(supplier.risk),
    timeframe: "2080s",
  });

  // Evaluate supply chain disruption risk
  risks.push({
    category: "supply_chain_disruption",
    urgency: evaluateUrgency(supplier.risk, 0.85),
    magnitude: evaluateMagnitude(supplier.risk, 0.85),
    confidence: evaluateConfidence(supplier.risk),
    timeframe: "now",
  });

  // Calculate overall score
  const overallScore = calculateOverallScore(risks);

  // Determine adaptation status
  const adaptationStatus = evaluateAdaptationStatus(overallScore);

  // Generate recommendations
  const recommendations = generateRecommendations(risks, adaptationStatus);

  return {
    supplier,
    risks,
    overallScore,
    adaptationStatus,
    recommendations,
  };
}

function evaluateUrgency(risk: number, factor: number): CCRARisk["urgency"] {
  const score = risk * factor;
  if (score > 80) return "more_action";
  if (score > 60) return "further_investigation";
  if (score > 40) return "sustain_current_action";
  return "watching_brief";
}

function evaluateMagnitude(
  risk: number,
  factor: number
): CCRARisk["magnitude"] {
  const score = risk * factor;
  if (score > 75) return "high";
  if (score > 45) return "medium";
  return "low";
}

function evaluateConfidence(risk: number): CCRARisk["confidence"] {
  if (risk > 70) return "high";
  if (risk > 40) return "medium";
  return "low";
}

function calculateOverallScore(risks: CCRARisk[]): number {
  return risks.reduce((score, risk) => {
    const urgencyScore = URGENCY_SCORES[risk.urgency];
    const magnitudeScore = MAGNITUDE_SCORES[risk.magnitude];
    const confidenceScore = CONFIDENCE_SCORES[risk.confidence];
    const weight = RISK_WEIGHTS[risk.category];

    return (
      score + urgencyScore * magnitudeScore * confidenceScore * weight * 100
    );
  }, 0);
}

function evaluateAdaptationStatus(
  score: number
): CCRAAssessment["adaptationStatus"] {
  if (score > 75) return "high";
  if (score > 45) return "medium";
  return "low";
}

function generateRecommendations(
  risks: CCRARisk[],
  adaptationStatus: CCRAAssessment["adaptationStatus"]
): string[] {
  const recommendations: string[] = [];

  // Add general recommendations based on adaptation status
  if (adaptationStatus === "high") {
    recommendations.push(
      "Implement comprehensive climate adaptation strategies immediately",
      "Develop detailed resilience plans for critical operations",
      "Establish regular monitoring and reporting of climate risks"
    );
  } else if (adaptationStatus === "medium") {
    recommendations.push(
      "Review and enhance existing adaptation measures",
      "Identify key vulnerabilities in operations",
      "Develop medium-term adaptation strategies"
    );
  } else {
    recommendations.push(
      "Monitor climate risks regularly",
      "Begin developing basic adaptation measures",
      "Conduct detailed risk assessment"
    );
  }

  // Add specific recommendations based on risk categories
  risks.forEach((risk) => {
    if (risk.urgency === "more_action") {
      switch (risk.category) {
        case "extreme_weather":
          recommendations.push(
            "Strengthen infrastructure against extreme weather events",
            "Implement early warning systems"
          );
          break;
        case "flooding":
          recommendations.push(
            "Develop flood protection measures",
            "Review and update flood risk assessments"
          );
          break;
        case "water_scarcity":
          recommendations.push(
            "Implement water efficiency measures",
            "Develop alternative water supply options"
          );
          break;
        case "temperature_rise":
          recommendations.push(
            "Install cooling systems in critical facilities",
            "Review temperature-sensitive processes"
          );
          break;
        case "sea_level_rise":
          recommendations.push(
            "Assess coastal vulnerability",
            "Plan for potential relocation of at-risk facilities"
          );
          break;
        case "supply_chain_disruption":
          recommendations.push(
            "Diversify supplier base",
            "Develop alternative logistics routes"
          );
          break;
      }
    }
  });

  return [...new Set(recommendations)]; // Remove duplicates
}

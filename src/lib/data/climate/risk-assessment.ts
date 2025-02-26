// CCRA3 (UK's Third Climate Change Risk Assessment) methodology adapted for supply chain resilience

// Risk components
export type HazardType = "direct" | "indirect" | "systemic";
export type ExposureLevel = "low" | "medium" | "high";
export type VulnerabilityLevel = "low" | "medium" | "high";
export type AdaptationLevel = "low" | "medium" | "high";
export type UrgencyCategory =
  | "more_action_needed"
  | "research_priority"
  | "sustain_current_action"
  | "watching_brief";

// CCRA3 Risk Assessment Interface
export interface CCRA3RiskAssessment {
  id: string;
  name: string;
  description: string;
  sector: string;
  climateHazards: {
    hazardType: HazardType;
    description: string;
    likelihood: number; // 1-10
    potentialImpact: number; // 1-10
  }[];
  exposure: {
    level: ExposureLevel;
    description: string;
    score: number; // 1-10
  };
  vulnerability: {
    level: VulnerabilityLevel;
    description: string;
    score: number; // 1-10
  };
  adaptiveCapacity: {
    level: AdaptationLevel;
    description: string;
    score: number; // 1-10
  };
  riskMagnitude: number; // Calculated based on exposure, vulnerability, and hazards (1-100)
  urgency: UrgencyCategory;
  confidenceLevel: number; // 1-10, representing confidence in the assessment
  timeframe: "present" | "short_term" | "medium_term" | "long_term";
  mitigationActions: string[];
  adaptationMeasures: string[];
}

// Calculate risk magnitude based on CCRA3 methodology
export function calculateRiskMagnitude(
  hazards: { likelihood: number; potentialImpact: number }[],
  exposureScore: number,
  vulnerabilityScore: number,
  adaptiveCapacityScore: number
): number {
  // Calculate hazard score (average of likelihood * impact for all hazards)
  const hazardScore =
    hazards.reduce((total, hazard) => {
      return total + hazard.likelihood * hazard.potentialImpact;
    }, 0) / hazards.length;

  // Calculate risk magnitude using CCRA3 formula (adapted for numeric values)
  // Risk = Hazard * Exposure * Vulnerability / Adaptive Capacity
  const riskMagnitude =
    (hazardScore * exposureScore * vulnerabilityScore) /
    Math.max(1, adaptiveCapacityScore); // Avoid division by zero

  // Normalize to 0-100 scale
  return Math.min(100, Math.round((riskMagnitude * 100) / 1000));
}

// Determine urgency category based on CCRA3 methodology
export function determineUrgencyCategory(
  riskMagnitude: number,
  adaptiveCapacityScore: number,
  timeframe: "present" | "short_term" | "medium_term" | "long_term"
): UrgencyCategory {
  // High risk, low adaptive capacity = more action needed
  if (riskMagnitude > 70 && adaptiveCapacityScore < 4) {
    return "more_action_needed";
  }

  // High risk, medium adaptive capacity, or medium risk with low adaptive capacity = research priority
  if (
    (riskMagnitude > 70 && adaptiveCapacityScore >= 4) ||
    (riskMagnitude > 40 && riskMagnitude <= 70 && adaptiveCapacityScore < 4)
  ) {
    return "research_priority";
  }

  // Medium risk, medium/high adaptive capacity = sustain current action
  if (riskMagnitude > 40 && riskMagnitude <= 70 && adaptiveCapacityScore >= 4) {
    return "sustain_current_action";
  }

  // Low risk = watching brief
  return "watching_brief";
}

// Sample risk assessments for different supply chain elements
export const sampleRiskAssessments: CCRA3RiskAssessment[] = [
  {
    id: "risk-001",
    name: "Semiconductor Manufacturing Disruption",
    description:
      "Assessment of climate risks to semiconductor manufacturing in Southeast Asia",
    sector: "Electronics",
    climateHazards: [
      {
        hazardType: "direct",
        description: "Flooding of manufacturing facilities",
        likelihood: 7,
        potentialImpact: 9,
      },
      {
        hazardType: "indirect",
        description: "Power outages due to extreme weather",
        likelihood: 8,
        potentialImpact: 7,
      },
      {
        hazardType: "systemic",
        description: "Regional transportation infrastructure damage",
        likelihood: 6,
        potentialImpact: 8,
      },
    ],
    exposure: {
      level: "high",
      description:
        "Multiple tier 1 suppliers concentrated in flood-prone regions",
      score: 8,
    },
    vulnerability: {
      level: "high",
      description: "Limited alternative sources for specialized components",
      score: 9,
    },
    adaptiveCapacity: {
      level: "low",
      description:
        "Few alternative suppliers and long lead times for facility relocation",
      score: 3,
    },
    riskMagnitude: 85,
    urgency: "more_action_needed",
    confidenceLevel: 7,
    timeframe: "present",
    mitigationActions: [
      "Identify and onboard alternative suppliers in different geographic regions",
      "Increase safety stock of critical components",
      "Develop contingency shipping routes",
    ],
    adaptationMeasures: [
      "Support suppliers in facility flood protection improvements",
      "Co-invest in distributed energy systems to mitigate power outage risks",
      "Develop long-term supplier diversification strategy",
    ],
  },
  {
    id: "risk-002",
    name: "European Road Freight Disruption",
    description:
      "Assessment of risks to road transportation networks in Central Europe",
    sector: "Transportation",
    climateHazards: [
      {
        hazardType: "direct",
        description: "Road damage from increased flooding",
        likelihood: 8,
        potentialImpact: 7,
      },
      {
        hazardType: "direct",
        description: "Heat damage to road surfaces",
        likelihood: 6,
        potentialImpact: 5,
      },
      {
        hazardType: "systemic",
        description: "Multiple simultaneous route disruptions",
        likelihood: 5,
        potentialImpact: 9,
      },
    ],
    exposure: {
      level: "medium",
      description:
        "Critical routes through flood-prone areas, but some alternatives exist",
      score: 6,
    },
    vulnerability: {
      level: "medium",
      description:
        "Some modal shift options available but with capacity limitations",
      score: 5,
    },
    adaptiveCapacity: {
      level: "medium",
      description:
        "Alternative routes and transport modes available but with higher costs",
      score: 6,
    },
    riskMagnitude: 45,
    urgency: "sustain_current_action",
    confidenceLevel: 8,
    timeframe: "medium_term",
    mitigationActions: [
      "Develop multi-modal transport options for critical shipments",
      "Map alternative road routes that avoid high-risk areas",
      "Adjust delivery schedules to account for potential delays",
    ],
    adaptationMeasures: [
      "Engage with local authorities on infrastructure resilience planning",
      "Participate in industry forums for climate-resilient logistics",
      "Update risk assessment annually based on changing climate patterns",
    ],
  },
  {
    id: "risk-003",
    name: "Raw Material Extraction Vulnerability",
    description:
      "Assessment of climate risks to mining operations in water-stressed regions",
    sector: "Raw Materials",
    climateHazards: [
      {
        hazardType: "direct",
        description: "Water scarcity affecting extraction processes",
        likelihood: 9,
        potentialImpact: 8,
      },
      {
        hazardType: "direct",
        description: "Extreme heat affecting worker productivity",
        likelihood: 8,
        potentialImpact: 6,
      },
      {
        hazardType: "indirect",
        description: "Social unrest due to competition for water resources",
        likelihood: 7,
        potentialImpact: 9,
      },
    ],
    exposure: {
      level: "high",
      description:
        "Critical materials sourced from highly water-stressed regions",
      score: 9,
    },
    vulnerability: {
      level: "high",
      description: "Limited alternative sources for specific rare materials",
      score: 8,
    },
    adaptiveCapacity: {
      level: "low",
      description:
        "Few technological alternatives and long lead times for new source development",
      score: 3,
    },
    riskMagnitude: 78,
    urgency: "more_action_needed",
    confidenceLevel: 6,
    timeframe: "short_term",
    mitigationActions: [
      "Develop material substitution research program",
      "Increase inventory of critical materials",
      "Establish secondary/recycled material sourcing",
    ],
    adaptationMeasures: [
      "Support supplier water efficiency improvements",
      "Co-invest in community water management projects",
      "Research alternative extraction technologies with lower water requirements",
    ],
  },
  {
    id: "risk-004",
    name: "Port Infrastructure Vulnerability",
    description:
      "Assessment of sea level rise and storm surge risks to key ports",
    sector: "Maritime Logistics",
    climateHazards: [
      {
        hazardType: "direct",
        description: "Storm surge damage to port facilities",
        likelihood: 7,
        potentialImpact: 9,
      },
      {
        hazardType: "direct",
        description: "Sea level rise affecting port operations",
        likelihood: 9,
        potentialImpact: 7,
      },
      {
        hazardType: "systemic",
        description: "Cascading disruption to global shipping networks",
        likelihood: 6,
        potentialImpact: 10,
      },
    ],
    exposure: {
      level: "high",
      description: "Critical ports in vulnerable coastal locations",
      score: 9,
    },
    vulnerability: {
      level: "medium",
      description: "Alternative ports available but with capacity constraints",
      score: 6,
    },
    adaptiveCapacity: {
      level: "medium",
      description: "Port resilience investments underway but incomplete",
      score: 5,
    },
    riskMagnitude: 65,
    urgency: "research_priority",
    confidenceLevel: 7,
    timeframe: "medium_term",
    mitigationActions: [
      "Identify alternative ports for critical shipments",
      "Increase buffer inventory for ocean freight items",
      "Develop air freight contingency plans for critical components",
    ],
    adaptationMeasures: [
      "Engage with port authorities on resilience planning",
      "Support industry-wide port climate adaptation initiatives",
      "Monitor port infrastructure investment plans and timelines",
    ],
  },
  {
    id: "risk-005",
    name: "Agricultural Supply Vulnerability",
    description:
      "Assessment of risks to agricultural inputs from changing climate patterns",
    sector: "Agriculture",
    climateHazards: [
      {
        hazardType: "direct",
        description: "Drought affecting crop yields",
        likelihood: 9,
        potentialImpact: 8,
      },
      {
        hazardType: "indirect",
        description: "Changing pest and disease patterns",
        likelihood: 8,
        potentialImpact: 7,
      },
      {
        hazardType: "systemic",
        description: "Multiple breadbasket failures",
        likelihood: 5,
        potentialImpact: 10,
      },
    ],
    exposure: {
      level: "high",
      description:
        "Critical agricultural inputs from climate-vulnerable regions",
      score: 8,
    },
    vulnerability: {
      level: "medium",
      description:
        "Some substitute materials available but with quality variations",
      score: 6,
    },
    adaptiveCapacity: {
      level: "medium",
      description: "Ongoing crop diversification and resilience research",
      score: 5,
    },
    riskMagnitude: 68,
    urgency: "research_priority",
    confidenceLevel: 6,
    timeframe: "short_term",
    mitigationActions: [
      "Diversify sourcing regions for key agricultural inputs",
      "Develop substitute material specifications",
      "Increase safety stock for climate-vulnerable materials",
    ],
    adaptationMeasures: [
      "Support supplier climate-smart agriculture adoption",
      "Collaborate on agricultural resilience research",
      "Develop long-term alternative material strategy",
    ],
  },
];

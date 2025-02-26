export interface RiskTrendData {
  month: string;
  supplyChainHealth: number;
  materialAvailability: number;
  supplierRisk: number;
  transportDisruption: number;
}

// Generate 12 months of risk trend data
export const riskTrendData: RiskTrendData[] = [
  {
    month: "Jan",
    supplyChainHealth: 85,
    materialAvailability: 90,
    supplierRisk: 25,
    transportDisruption: 15,
  },
  {
    month: "Feb",
    supplyChainHealth: 83,
    materialAvailability: 88,
    supplierRisk: 28,
    transportDisruption: 18,
  },
  {
    month: "Mar",
    supplyChainHealth: 80,
    materialAvailability: 85,
    supplierRisk: 32,
    transportDisruption: 22,
  },
  {
    month: "Apr",
    supplyChainHealth: 78,
    materialAvailability: 83,
    supplierRisk: 35,
    transportDisruption: 25,
  },
  {
    month: "May",
    supplyChainHealth: 75,
    materialAvailability: 80,
    supplierRisk: 40,
    transportDisruption: 30,
  },
  {
    month: "Jun",
    supplyChainHealth: 73,
    materialAvailability: 78,
    supplierRisk: 45,
    transportDisruption: 35,
  },
  {
    month: "Jul",
    supplyChainHealth: 70,
    materialAvailability: 75,
    supplierRisk: 50,
    transportDisruption: 40,
  },
  {
    month: "Aug",
    supplyChainHealth: 72,
    materialAvailability: 77,
    supplierRisk: 48,
    transportDisruption: 38,
  },
  {
    month: "Sep",
    supplyChainHealth: 70,
    materialAvailability: 75,
    supplierRisk: 52,
    transportDisruption: 42,
  },
  {
    month: "Oct",
    supplyChainHealth: 68,
    materialAvailability: 73,
    supplierRisk: 55,
    transportDisruption: 45,
  },
  {
    month: "Nov",
    supplyChainHealth: 65,
    materialAvailability: 70,
    supplierRisk: 60,
    transportDisruption: 50,
  },
  {
    month: "Dec",
    supplyChainHealth: 68,
    materialAvailability: 83,
    supplierRisk: 55,
    transportDisruption: 45,
  },
];

export interface MaterialShortage {
  id: number;
  name: string;
  shortage: "Severe" | "Moderate" | "Mild";
  confidence: number;
  timeline: string;
  trend: "increasing" | "decreasing" | "stable";
  impact: "High" | "Medium" | "Low";
}

export const materialShortages: MaterialShortage[] = [
  {
    id: 1,
    name: "Steel Reinforcement",
    shortage: "Severe",
    confidence: 92,
    timeline: "1-2 months",
    trend: "increasing",
    impact: "High",
  },
  {
    id: 2,
    name: "Electrical Components",
    shortage: "Moderate",
    confidence: 78,
    timeline: "3-4 months",
    trend: "increasing",
    impact: "Medium",
  },
  {
    id: 3,
    name: "Concrete Additives",
    shortage: "Mild",
    confidence: 65,
    timeline: "5-6 months",
    trend: "stable",
    impact: "Low",
  },
  {
    id: 4,
    name: "Specialized Fasteners",
    shortage: "Severe",
    confidence: 88,
    timeline: "1-2 months",
    trend: "increasing",
    impact: "High",
  },
  {
    id: 5,
    name: "Semiconductors",
    shortage: "Severe",
    confidence: 95,
    timeline: "1-3 months",
    trend: "increasing",
    impact: "High",
  },
  {
    id: 6,
    name: "Aluminum",
    shortage: "Moderate",
    confidence: 75,
    timeline: "2-4 months",
    trend: "stable",
    impact: "Medium",
  },
  {
    id: 7,
    name: "Copper Wiring",
    shortage: "Mild",
    confidence: 60,
    timeline: "4-6 months",
    trend: "decreasing",
    impact: "Low",
  },
];

export interface ProjectImpact {
  id: number;
  name: string;
  originalDeadline: string;
  projectedDelay: number; // in days
  costIncrease: number; // percentage
  riskScore: number;
  status: "Critical" | "At Risk" | "On Track";
}

export const projectImpacts: ProjectImpact[] = [
  {
    id: 1,
    name: "Heathrow Terminal Expansion",
    originalDeadline: "2024-06-30",
    projectedDelay: 112,
    costIncrease: 18,
    riskScore: 85,
    status: "Critical",
  },
  {
    id: 2,
    name: "M25 Junction Improvement",
    originalDeadline: "2024-08-15",
    projectedDelay: 68,
    costIncrease: 12,
    riskScore: 75,
    status: "At Risk",
  },
  {
    id: 3,
    name: "East Coast Rail Upgrade",
    originalDeadline: "2024-10-01",
    projectedDelay: 42,
    costIncrease: 8,
    riskScore: 65,
    status: "At Risk",
  },
  {
    id: 4,
    name: "Birmingham Transit Hub",
    originalDeadline: "2024-12-15",
    projectedDelay: 35,
    costIncrease: 6,
    riskScore: 55,
    status: "At Risk",
  },
  {
    id: 5,
    name: "Northern Powerhouse Rail",
    originalDeadline: "2025-03-01",
    projectedDelay: 28,
    costIncrease: 5,
    riskScore: 45,
    status: "On Track",
  },
  {
    id: 6,
    name: "A14 Cambridge to Huntingdon",
    originalDeadline: "2024-09-30",
    projectedDelay: 14,
    costIncrease: 3,
    riskScore: 35,
    status: "On Track",
  },
];

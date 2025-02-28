import { SimulationResults } from "./engine";

export interface SavedScenario {
  id: string;
  name: string;
  timestamp: string;
  config: {
    duration: number;
    intensity: number;
    recoveryRate: number;
  };
  results: SimulationResults;
  regions: Array<{
    lat: number;
    lng: number;
    radius: number;
  }>;
}

const STORAGE_KEY = "saved_scenarios";

export function saveScenario(scenario: SavedScenario): void {
  const savedScenarios = getSavedScenarios();
  savedScenarios.push(scenario);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScenarios));
}

export function getSavedScenarios(): SavedScenario[] {
  const scenarios = localStorage.getItem(STORAGE_KEY);
  return scenarios ? JSON.parse(scenarios) : [];
}

export function deleteSavedScenario(id: string): void {
  const scenarios = getSavedScenarios().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

// Dummy mitigation strategies for offline use
export const getDummyMitigationStrategies = (severity: number) => [
  {
    action: "Diversify Supplier Base",
    impact: severity > 0.7 ? "high" : "medium",
    difficulty: "high",
    timeframe: "3-6 months",
    description:
      "Establish relationships with additional suppliers in different geographical regions.",
  },
  {
    action: "Increase Safety Stock",
    impact: severity > 0.5 ? "medium" : "low",
    difficulty: "low",
    timeframe: "1-2 months",
    description:
      "Increase inventory levels of critical materials to provide a buffer.",
  },
  {
    action: "Implement Alternative Transport Routes",
    impact: severity > 0.6 ? "high" : "medium",
    difficulty: "medium",
    timeframe: "2-4 months",
    description:
      "Develop contingency transport routes and logistics providers.",
  },
];

export interface SimulationScenario {
  id: number;
  name: string;
  disruptionType:
    | "weather"
    | "geopolitical"
    | "supplier"
    | "transport"
    | "labor"
    | "cyber";
  severity: number; // 0-100
  duration: number; // in days
  timeframe: number; // in days
  affectedTransportModes: {
    sea: boolean;
    air: boolean;
    rail: boolean;
    road: boolean;
  };
  affectedRegions: string[];
  results: SimulationResults;
}

export interface SimulationResults {
  supplyChainHealth: {
    baseline: number;
    simulated: number;
    change: number;
  };
  materialAvailability: {
    baseline: number;
    simulated: number;
    change: number;
  };
  projectDelays: {
    average: number; // in days
    max: number;
  };
  costImpact: {
    percentage: number;
    value: number; // in millions
  };
  affectedProjects: {
    name: string;
    delay: number;
    status: "Critical" | "At Risk" | "On Track";
  }[];
  cascadeEffects: {
    day: number;
    event: string;
    impact: "High" | "Medium" | "Low";
  }[];
  mitigationStrategies: {
    name: string;
    description: string;
    impact: "High" | "Medium" | "Low";
    difficulty: "High" | "Medium" | "Low";
    timeToImplement: string;
  }[];
}

export const simulationScenarios: SimulationScenario[] = [
  {
    id: 1,
    name: "Severe Weather Event",
    disruptionType: "weather",
    severity: 75,
    duration: 30,
    timeframe: 90,
    affectedTransportModes: {
      sea: true,
      air: true,
      rail: true,
      road: true,
    },
    affectedRegions: ["East Asia", "Southeast Asia"],
    results: {
      supplyChainHealth: {
        baseline: 68,
        simulated: 44,
        change: -24,
      },
      materialAvailability: {
        baseline: 83,
        simulated: 52,
        change: -31,
      },
      projectDelays: {
        average: 45,
        max: 112,
      },
      costImpact: {
        percentage: 18,
        value: 24.5,
      },
      affectedProjects: [
        {
          name: "Heathrow Terminal Expansion",
          delay: 112,
          status: "Critical",
        },
        {
          name: "M25 Junction Improvement",
          delay: 68,
          status: "At Risk",
        },
        {
          name: "East Coast Rail Upgrade",
          delay: 42,
          status: "At Risk",
        },
      ],
      cascadeEffects: [
        {
          day: 1,
          event: "Initial weather event disrupts sea routes",
          impact: "Medium",
        },
        {
          day: 5,
          event: "Port closures in affected regions",
          impact: "High",
        },
        {
          day: 12,
          event: "Electronics component shortages begin",
          impact: "Medium",
        },
        {
          day: 18,
          event: "Semiconductor inventory depleted",
          impact: "High",
        },
        {
          day: 25,
          event: "Project timelines affected",
          impact: "High",
        },
        {
          day: 40,
          event: "Alternative suppliers engaged",
          impact: "Medium",
        },
        {
          day: 60,
          event: "Partial recovery of supply routes",
          impact: "Medium",
        },
        {
          day: 85,
          event: "New equilibrium established",
          impact: "Low",
        },
      ],
      mitigationStrategies: [
        {
          name: "Diversify Supplier Base",
          description:
            "Establish relationships with 3 additional suppliers in different geographical regions to reduce dependency on affected suppliers.",
          impact: "High",
          difficulty: "Medium",
          timeToImplement: "3-6 months",
        },
        {
          name: "Increase Safety Stock",
          description:
            "Increase inventory levels of critical materials by 35% to provide a buffer against supply chain disruptions.",
          impact: "Medium",
          difficulty: "Low",
          timeToImplement: "1-2 months",
        },
        {
          name: "Alternative Transport Routes",
          description:
            "Develop contingency transport routes that bypass affected areas, including alternative ports and logistics providers.",
          impact: "High",
          difficulty: "High",
          timeToImplement: "2-4 months",
        },
        {
          name: "Revise Project Timelines",
          description:
            "Adjust project schedules to prioritize critical path activities and reallocate resources to minimize overall delays.",
          impact: "Medium",
          difficulty: "Medium",
          timeToImplement: "1-2 months",
        },
      ],
    },
  },
  {
    id: 2,
    name: "Geopolitical Crisis",
    disruptionType: "geopolitical",
    severity: 85,
    duration: 60,
    timeframe: 180,
    affectedTransportModes: {
      sea: true,
      air: true,
      rail: false,
      road: false,
    },
    affectedRegions: ["Eastern Europe", "Middle East"],
    results: {
      supplyChainHealth: {
        baseline: 68,
        simulated: 38,
        change: -30,
      },
      materialAvailability: {
        baseline: 83,
        simulated: 45,
        change: -38,
      },
      projectDelays: {
        average: 65,
        max: 145,
      },
      costImpact: {
        percentage: 25,
        value: 32.8,
      },
      affectedProjects: [
        {
          name: "Heathrow Terminal Expansion",
          delay: 145,
          status: "Critical",
        },
        {
          name: "M25 Junction Improvement",
          delay: 95,
          status: "Critical",
        },
        {
          name: "East Coast Rail Upgrade",
          delay: 78,
          status: "Critical",
        },
        {
          name: "Birmingham Transit Hub",
          delay: 62,
          status: "At Risk",
        },
      ],
      cascadeEffects: [
        {
          day: 1,
          event: "Initial geopolitical crisis",
          impact: "Medium",
        },
        {
          day: 7,
          event: "Trade restrictions implemented",
          impact: "High",
        },
        {
          day: 15,
          event: "Material price increases",
          impact: "High",
        },
        {
          day: 30,
          event: "Severe material shortages",
          impact: "High",
        },
        {
          day: 45,
          event: "Project delays announced",
          impact: "High",
        },
        {
          day: 90,
          event: "New suppliers onboarded",
          impact: "Medium",
        },
        {
          day: 120,
          event: "Partial stabilization",
          impact: "Medium",
        },
        {
          day: 160,
          event: "New supply chain equilibrium",
          impact: "Medium",
        },
      ],
      mitigationStrategies: [
        {
          name: "Diplomatic Engagement",
          description:
            "Work with government to establish trade corridors and exceptions for critical infrastructure materials.",
          impact: "High",
          difficulty: "High",
          timeToImplement: "6-12 months",
        },
        {
          name: "Regional Diversification",
          description:
            "Shift supplier base to politically stable regions, even at higher cost.",
          impact: "High",
          difficulty: "High",
          timeToImplement: "6-9 months",
        },
        {
          name: "Strategic Reserves",
          description:
            "Establish 6-month strategic reserves of critical materials.",
          impact: "High",
          difficulty: "Medium",
          timeToImplement: "3-6 months",
        },
        {
          name: "Project Reprioritization",
          description:
            "Temporarily halt non-critical projects to focus resources on highest priority infrastructure.",
          impact: "Medium",
          difficulty: "Medium",
          timeToImplement: "1-3 months",
        },
      ],
    },
  },
];

export const getScenarioById = (id: number): SimulationScenario | undefined => {
  return simulationScenarios.find((scenario) => scenario.id === id);
};

export const getScenariosByType = (type: string): SimulationScenario[] => {
  return simulationScenarios.filter(
    (scenario) => scenario.disruptionType === type
  );
};

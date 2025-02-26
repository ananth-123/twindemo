import { ClimateEvent } from "../data/climate/events";
import { Supplier } from "../data/suppliers/suppliers";
import { TransportRoute } from "../data/suppliers/routes";

export interface SimulationScenario {
  id: string;
  name: string;
  disruptionType:
    | "weather"
    | "geopolitical"
    | "supplier"
    | "transport"
    | "labor"
    | "cyber";
  severity: number;
  duration: number;
  timeframe: number;
  affectedTransportModes: {
    sea: boolean;
    air: boolean;
    rail: boolean;
    road: boolean;
  };
  affectedRegions: {
    lat: number;
    lng: number;
    radius: number;
  }[];
  affectedSuppliers: string[];
}

export interface SimulationResults {
  supplyChainHealth: {
    baseline: number;
    simulated: number;
  };
  materialAvailability: {
    baseline: number;
    simulated: number;
  };
  projectDelays: {
    average: number;
    affected: {
      projectId: string;
      name: string;
      delay: number;
    }[];
  };
  costImpact: {
    percentage: number;
    value: number;
  };
  cascadeEffects: {
    day: number;
    event: string;
    impact: number;
    type: "supplier" | "transport" | "project" | "cost";
  }[];
  mitigationStrategies: {
    action: string;
    impact: "high" | "medium" | "low";
    difficulty: "high" | "medium" | "low";
    timeframe: string;
    description: string;
  }[];
}

export class SimulationEngine {
  private suppliers: Supplier[];
  private routes: TransportRoute[];
  private climateEvents: ClimateEvent[];

  constructor(
    suppliers: Supplier[],
    routes: TransportRoute[],
    climateEvents: ClimateEvent[]
  ) {
    this.suppliers = suppliers;
    this.routes = routes;
    this.climateEvents = climateEvents;
  }

  public async runSimulation(
    scenario: SimulationScenario
  ): Promise<SimulationResults> {
    // Calculate baseline metrics
    const baseline = this.calculateBaselineMetrics();

    // Identify directly affected components
    const affectedComponents = this.identifyAffectedComponents(scenario);

    // Calculate cascade effects
    const cascadeEffects = this.calculateCascadeEffects(
      scenario,
      affectedComponents
    );

    // Calculate final impact
    const impact = this.calculateImpact(scenario, cascadeEffects);

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(impact);

    return {
      supplyChainHealth: {
        baseline: baseline.health,
        simulated: impact.health,
      },
      materialAvailability: {
        baseline: baseline.availability,
        simulated: impact.availability,
      },
      projectDelays: {
        average: impact.averageDelay,
        affected: impact.affectedProjects,
      },
      costImpact: {
        percentage: impact.costIncrease,
        value: impact.costValue,
      },
      cascadeEffects: cascadeEffects,
      mitigationStrategies: mitigationStrategies,
    };
  }

  private calculateBaselineMetrics() {
    // Calculate current supply chain health
    const supplierHealth =
      this.suppliers.reduce((acc, s) => acc + (100 - s.risk), 0) /
      this.suppliers.length;

    const routeHealth =
      this.routes.reduce((acc, r) => acc + (100 - r.risk), 0) /
      this.routes.length;

    return {
      health: (supplierHealth + routeHealth) / 2,
      availability: 85, // Base material availability
    };
  }

  private identifyAffectedComponents(scenario: SimulationScenario) {
    const affected = {
      suppliers: new Set<string>(),
      routes: new Set<string>(),
      regions: new Set<string>(),
    };

    // Add directly specified suppliers
    scenario.affectedSuppliers.forEach((id) => affected.suppliers.add(id));

    // Check geographical impact
    scenario.affectedRegions.forEach((region) => {
      // Check suppliers in affected radius
      this.suppliers.forEach((supplier) => {
        const [supplierLng, supplierLat] = supplier.location.coordinates;
        const distance = this.calculateDistance(
          region.lat,
          region.lng,
          supplierLat,
          supplierLng
        );
        if (distance <= region.radius) {
          affected.suppliers.add(String(supplier.id));
          affected.regions.add(supplier.location.country);
        }
      });

      // Check routes passing through affected areas
      this.routes.forEach((route) => {
        const startDistance = this.calculateDistance(
          region.lat,
          region.lng,
          route.from.coordinates.lat,
          route.from.coordinates.lng
        );
        const endDistance = this.calculateDistance(
          region.lat,
          region.lng,
          route.to.coordinates.lat,
          route.to.coordinates.lng
        );
        if (startDistance <= region.radius || endDistance <= region.radius) {
          affected.routes.add(route.id);
        }
      });
    });

    return affected;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  private calculateCascadeEffects(
    scenario: SimulationScenario,
    affected: ReturnType<typeof this.identifyAffectedComponents>
  ) {
    const cascadeEffects: SimulationResults["cascadeEffects"] = [];
    let currentDay = 0;

    // Initial disruption effects
    cascadeEffects.push({
      day: currentDay,
      event: "Initial disruption begins",
      impact: scenario.severity,
      type: "supplier",
    });

    // First-order effects (directly affected suppliers and routes)
    currentDay += Math.floor(scenario.duration * 0.2);
    affected.suppliers.forEach((supplierId) => {
      const supplier = this.suppliers.find((s) => s.id === supplierId);
      if (supplier) {
        cascadeEffects.push({
          day: currentDay,
          event: `Supplier ${supplier.name} disrupted`,
          impact: Math.min(100, supplier.risk + scenario.severity * 0.5),
          type: "supplier",
        });
      }
    });

    // Transport disruptions
    currentDay += Math.floor(scenario.duration * 0.1);
    affected.routes.forEach((routeId) => {
      const route = this.routes.find((r) => r.id === routeId);
      if (route) {
        cascadeEffects.push({
          day: currentDay,
          event: `Route ${route.from.name} to ${route.to.name} affected`,
          impact: Math.min(100, route.risk + scenario.severity * 0.3),
          type: "transport",
        });
      }
    });

    // Project impacts
    currentDay += Math.floor(scenario.duration * 0.3);
    cascadeEffects.push({
      day: currentDay,
      event: "Project delays begin to manifest",
      impact: scenario.severity * 0.7,
      type: "project",
    });

    // Cost escalation
    currentDay += Math.floor(scenario.duration * 0.2);
    cascadeEffects.push({
      day: currentDay,
      event: "Cost impact reaches peak",
      impact: scenario.severity * 0.8,
      type: "cost",
    });

    // Recovery begins
    currentDay += Math.floor(scenario.duration * 0.2);
    cascadeEffects.push({
      day: currentDay,
      event: "Recovery phase begins",
      impact: scenario.severity * 0.5,
      type: "supplier",
    });

    return cascadeEffects;
  }

  private calculateImpact(
    scenario: SimulationScenario,
    cascadeEffects: SimulationResults["cascadeEffects"]
  ) {
    const baseline = this.calculateBaselineMetrics();
    const maxImpact = Math.max(...cascadeEffects.map((e) => e.impact));

    // Calculate health reduction based on severity and duration
    const healthReduction = (maxImpact / 100) * (scenario.duration / 180);
    const availabilityReduction = (maxImpact / 100) * (scenario.duration / 90);

    // Calculate delays based on severity and affected components
    const averageDelay = Math.floor(
      (scenario.severity * scenario.duration) / (scenario.timeframe / 30)
    );

    // Sample affected projects (in a real system, this would be calculated from actual project data)
    const affectedProjects = [
      {
        projectId: "p1",
        name: "Heathrow Terminal Expansion",
        delay: Math.floor(averageDelay * 2.5),
      },
      {
        projectId: "p2",
        name: "M25 Junction Improvement",
        delay: Math.floor(averageDelay * 1.5),
      },
      {
        projectId: "p3",
        name: "East Coast Rail Upgrade",
        delay: Math.floor(averageDelay * 0.9),
      },
    ];

    // Calculate cost impact
    const costIncrease = Math.floor(
      (maxImpact / 100) * 25 + (scenario.duration / 180) * 10
    );
    const costValue = Math.floor(24500000 * (costIncrease / 100));

    return {
      health: Math.max(0, baseline.health * (1 - healthReduction)),
      availability: Math.max(
        0,
        baseline.availability * (1 - availabilityReduction)
      ),
      averageDelay,
      affectedProjects,
      costIncrease,
      costValue,
    };
  }

  private generateMitigationStrategies(
    impact: ReturnType<typeof this.calculateImpact>
  ) {
    const strategies: SimulationResults["mitigationStrategies"] = [];

    // Add strategies based on impact severity
    if (impact.health < 50) {
      strategies.push({
        action: "Diversify Supplier Base",
        impact: "high",
        difficulty: "high",
        timeframe: "3-6 months",
        description:
          "Establish relationships with additional suppliers in different geographical regions to reduce dependency on affected suppliers.",
      });
    }

    if (impact.availability < 60) {
      strategies.push({
        action: "Increase Safety Stock",
        impact: "medium",
        difficulty: "low",
        timeframe: "1-2 months",
        description:
          "Increase inventory levels of critical materials to provide a buffer against supply chain disruptions.",
      });
    }

    if (impact.averageDelay > 30) {
      strategies.push({
        action: "Alternative Transport Routes",
        impact: "high",
        difficulty: "high",
        timeframe: "2-4 months",
        description:
          "Develop contingency transport routes that bypass affected areas, including alternative ports and logistics providers.",
      });
    }

    if (impact.costIncrease > 15) {
      strategies.push({
        action: "Revise Project Timelines",
        impact: "medium",
        difficulty: "medium",
        timeframe: "1-2 months",
        description:
          "Adjust project schedules to prioritize critical path activities and reallocate resources to minimize overall delays.",
      });
    }

    return strategies;
  }
}

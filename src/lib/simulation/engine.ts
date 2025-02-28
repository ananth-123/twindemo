import { ClimateEvent } from "../data/climate/events";
import { Supplier } from "@/types/supplier";
import { TransportRoute } from "../data/suppliers/routes";

export interface SimulationScenario {
  id: string;
  name: string;
  disruptionType: "weather" | "geopolitical" | "infrastructure" | "cyber";
  severity: number;
  duration: number;
  timeframe: number;
  recoveryRate: number;
  affectedTransportModes: {
    sea: boolean;
    air: boolean;
    rail: boolean;
    road: boolean;
  };
  affectedRegions: Array<{
    lat: number;
    lng: number;
    radius: number;
    impactZone: {
      suppliers: string[];
      severity: number;
      estimatedRecovery: number;
    };
  }>;
  affectedSuppliers: string[];
}

export interface SimulationResults {
  id: string;
  timestamp: string;
  affectedSuppliers: Array<{
    supplier: Supplier;
    impact: number;
    recoveryTime: number;
  }>;
  cascadeDepth: number;
  totalImpact: number;
  mitigationStrategies: Array<{
    action: string;
    impact: "high" | "medium" | "low";
    difficulty: "high" | "medium" | "low";
    timeframe: string;
    description: string;
  }>;
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
    affected: Array<{
      projectId: string;
      name: string;
      delay: number;
    }>;
  };
  costImpact: {
    percentage: number;
    value: number;
  };
  cascadeEffects: Array<{
    day: number;
    event: string;
    impact: number;
    type: "supplier" | "transport" | "project" | "cost";
  }>;
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
    try {
      // Identify affected components
      const affected = this.identifyAffectedComponents(scenario);

      // Calculate cascade effects
      const cascadeEffects = this.calculateCascadeEffects(scenario, affected);

      // Calculate impact metrics
      const impact = this.calculateImpact(scenario, cascadeEffects);

      // Generate mitigation strategies using OpenAI API
      const mitigationStrategies = await this.generateMitigationStrategies(
        scenario,
        affected,
        impact
      );

      // Calculate final metrics
      const baseline = this.calculateBaselineMetrics();
      const maxImpact = Math.max(...cascadeEffects.map((e) => e.impact));

      // Return simulation results
      return {
        id: scenario.id,
        timestamp: new Date().toISOString(),
        affectedSuppliers: Array.from(affected.suppliers)
          .map((supplierId) => {
            const supplier = this.suppliers.find(
              (s) => s.id.toString() === supplierId
            );
            if (!supplier) return null;
            return {
              supplier,
              impact: Math.min(100, supplier.risk + scenario.severity * 0.5),
              recoveryTime: Math.floor(
                scenario.duration * (1 - scenario.recoveryRate)
              ),
            };
          })
          .filter((s): s is NonNullable<typeof s> => s !== null),
        cascadeDepth: Math.ceil(maxImpact / 20),
        totalImpact: maxImpact,
        mitigationStrategies,
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
        cascadeEffects,
      };
    } catch (error) {
      console.error("Simulation error:", error);
      throw error;
    }
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
          route.from.coordinates[1],
          route.from.coordinates[0]
        );

        const endDistance = this.calculateDistance(
          region.lat,
          region.lng,
          route.to.coordinates[1],
          route.to.coordinates[0]
        );

        if (startDistance <= region.radius || endDistance <= region.radius) {
          affected.routes.add(String(route.id));
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
      const supplier = this.suppliers.find(
        (s) => s.id.toString() === supplierId
      );
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
      const route = this.routes.find((r) => r.id.toString() === routeId);
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

  private async generateMitigationStrategies(
    scenario: SimulationScenario,
    affected: ReturnType<typeof this.identifyAffectedComponents>,
    impact: ReturnType<typeof this.calculateImpact>
  ) {
    try {
      // Call the API route for strategy generation
      const response = await fetch("/api/generate-strategies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regions: scenario.affectedRegions,
          affectedSuppliers: Array.from(affected.suppliers),
          simulationConfig: {
            duration: scenario.duration,
            intensity: scenario.severity / 100,
            recoveryRate: scenario.recoveryRate,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate strategies");
      }

      const { strategies } = await response.json();
      return strategies;
    } catch (error) {
      console.error("Strategy generation error:", error);
      // Fallback to basic strategies if API call fails
      return this.generateBasicStrategies(impact);
    }
  }

  private generateBasicStrategies(
    impact: ReturnType<typeof this.calculateImpact>
  ) {
    const strategies: SimulationResults["mitigationStrategies"] = [];

    // Add basic strategies based on impact severity
    if (impact.health < 50) {
      strategies.push({
        action: "Diversify Supplier Base",
        impact: "high",
        difficulty: "high",
        timeframe: "3-6 months",
        description:
          "Establish relationships with additional suppliers in different geographical regions.",
      });
    }

    if (impact.availability < 60) {
      strategies.push({
        action: "Increase Safety Stock",
        impact: "medium",
        difficulty: "low",
        timeframe: "1-2 months",
        description:
          "Increase inventory levels of critical materials to provide a buffer.",
      });
    }

    if (impact.averageDelay > 30) {
      strategies.push({
        action: "Alternative Transport Routes",
        impact: "high",
        difficulty: "high",
        timeframe: "2-4 months",
        description:
          "Develop contingency transport routes and logistics providers.",
      });
    }

    return strategies;
  }
}

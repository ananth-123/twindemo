"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FlaskConical,
  Play,
  Save,
  FileDown,
  FileUp,
  AlertTriangle,
  Lightbulb,
  Truck,
  Ship,
  Plane,
  Train,
  Zap,
} from "lucide-react";
import { suppliers } from "@/lib/data/suppliers/suppliers";
import { transportRoutes } from "@/lib/data/suppliers/routes";
import { climateEvents } from "@/lib/data/climate/events";
import {
  SimulationEngine,
  SimulationScenario,
  SimulationResults,
} from "@/lib/simulation/engine";
import WorldMap from "@/components/maps/WorldMap";
import { v4 as uuidv4 } from "uuid";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dynamic from "next/dynamic";
import type { Supplier } from "@/types/supplier";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  saveScenario,
  getSavedScenarios,
  getDummyMitigationStrategies,
  SavedScenario,
} from "@/lib/simulation/storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScenarioComparison } from "@/components/simulations/ScenarioComparison";

/// <reference types="@types/google.maps" />

interface SimulationMetrics {
  cascadeDepth: number;
  affectedTiers: Record<number, number>;
  recoveryTimeline: number[];
  riskPropagationPaths: Array<{
    from: string;
    to: string;
    delay: number;
    impact: number;
  }>;
  mitigationEffectiveness: Record<string, number>;
}

interface Region {
  lat: number;
  lng: number;
  radius: number;
  impactZone: {
    suppliers: string[];
    severity: number;
    estimatedRecovery: number;
  };
}

interface SimulationData {
  timestamp: string;
  config: {
    duration: number;
    intensity: number;
    recoveryRate: number;
  };
  metrics: {
    cascadeDepth: number;
    tierImpact: Record<number, number>;
    [key: string]: any;
  };
}

interface MitigationStrategy {
  action: string;
  impact: "low" | "medium" | "high";
  difficulty: "low" | "medium" | "high";
  timeframe: string;
  description: string;
}

// Add type for the base region input
interface BaseRegion {
  lat: number;
  lng: number;
  radius: number;
}

// Update the Globe3D component props type
interface Globe3DProps {
  suppliers: Supplier[];
  onSupplierSelect: (supplier: Supplier | null) => void;
  selectedSupplier: Supplier | null;
  isSimulation?: boolean;
  selectedRegions?: BaseRegion[];
  onRegionClick?: (lat: number, lng: number) => void;
}

const Globe3D = dynamic(() => import("@/components/maps/Globe3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
      <div className="text-gray-400">Loading globe visualization...</div>
    </div>
  ),
});

export default function SimulationsPage() {
  // Simulation configuration state
  const [scenarioName, setScenarioName] = useState("New Scenario");
  const [disruptionType, setDisruptionType] =
    useState<SimulationScenario["disruptionType"]>("weather");
  const [disruptionSeverity, setDisruptionSeverity] = useState([50]);
  const [disruptionDuration, setDisruptionDuration] = useState([30]);
  const [simulationTimeframe, setSimulationTimeframe] = useState([90]);
  const [selectedTransportModes, setSelectedTransportModes] = useState({
    sea: false,
    air: false,
    rail: false,
    road: false,
  });
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [simulationConfig, setSimulationConfig] = useState({
    duration: 30,
    intensity: 0.8,
    recoveryRate: 0.5,
  });
  const [mitigationStrategies, setMitigationStrategies] = useState<string[]>(
    []
  );

  // Simulation results state
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add metrics tracking
  const metricsRef = useRef<SimulationMetrics>({
    cascadeDepth: 0,
    affectedTiers: {},
    recoveryTimeline: [],
    riskPropagationPaths: [],
    mitigationEffectiveness: {},
  });

  // Enhanced logging function
  const logSimulationMetrics = (phase: string, data: Record<string, any>) => {
    console.log(`[Simulation ${phase}]:`, {
      timestamp: new Date().toISOString(),
      regions: selectedRegions.map((region) => ({
        coordinates: [region.lat, region.lng],
        radius: region.radius,
        affectedSuppliers: region.impactZone.suppliers.length,
      })),
      metrics: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  };

  // Initialize simulation engine
  const engine = new SimulationEngine(
    suppliers,
    transportRoutes,
    climateEvents
  );

  // Enhanced region selection based on supplier selection
  const handleSupplierSelect = (supplier: Supplier | null) => {
    if (!supplier) {
      setSelectedSupplier(null);
      return;
    }

    setSelectedSupplier(supplier);
    const [lng, lat] = supplier.location.coordinates;
    const radius = simulationConfig.intensity * 5;

    // Find affected suppliers in the radius
    const affectedSuppliers = suppliers.filter(
      (s) => calculateImpact(s, { lat, lng, radius }) > 0
    );

    const newRegion: Region = {
      lat,
      lng,
      radius,
      impactZone: {
        suppliers: affectedSuppliers.map((s) => s.id.toString()),
        severity: simulationConfig.intensity,
        estimatedRecovery: Math.ceil(30 * (1 / simulationConfig.recoveryRate)),
      },
    };

    setSelectedRegions([newRegion]); // Replace existing regions with new one
    logSimulationMetrics("Supplier Selection", {
      supplier: supplier.name,
      affectedSuppliers: affectedSuppliers.length,
      coordinates: [lat, lng],
    });
  };

  // Calculate impact based on distance and supplier characteristics
  const calculateImpact = (
    supplier: Supplier,
    region: { lat: number; lng: number; radius: number }
  ) => {
    const [supplierLng, supplierLat] = supplier.location.coordinates;
    const distance = Math.sqrt(
      Math.pow(region.lat - supplierLat, 2) +
        Math.pow(region.lng - supplierLng, 2)
    );

    if (distance > region.radius) return 0;

    const distanceImpact = 1 - distance / region.radius;
    const tierMultiplier = 1 + 0.2 * (4 - supplier.tier); // Higher impact on lower tiers

    return distanceImpact * tierMultiplier;
  };

  // Generate mitigation strategies using OpenAI
  const generateMitigationStrategies = async () => {
    try {
      const response = await fetch("/api/mitigation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: simulationConfig,
          results: results,
        }),
      });

      const data = await response.json();

      // Ensure the impact and difficulty values are valid
      const strategies: MitigationStrategy[] = data.strategies.map(
        (strategy: any) => ({
          ...strategy,
          impact: strategy.impact.toLowerCase() as "low" | "medium" | "high",
          difficulty: strategy.difficulty.toLowerCase() as
            | "low"
            | "medium"
            | "high",
        })
      );

      setResults((prev) =>
        prev
          ? {
              ...prev,
              mitigationStrategies: strategies,
            }
          : null
      );
    } catch (error) {
      console.error("Error generating mitigation strategies:", error);
    }
  };

  // Enhanced simulation with cascade effects
  const runSimulation = async () => {
    setIsRunning(true);
    logSimulationMetrics("Start", { selectedRegions });

    try {
      // Calculate initial impact
      const affectedSuppliers = suppliers.filter((supplier) =>
        selectedRegions.some((region) => calculateImpact(supplier, region) > 0)
      );

      // Analyze cascade effects
      let currentTier = 1;
      const cascadeEffects = new Map<string, number>();
      const dailyImpacts: Array<{
        day: number;
        event: string;
        impact: number;
        type: "supplier" | "transport" | "project" | "cost";
      }> = affectedSuppliers.map((supplier, index) => ({
        day: Math.floor(
          index * (simulationConfig.duration / affectedSuppliers.length)
        ),
        event: `${supplier.name} disrupted`,
        impact: calculateImpact(supplier, selectedRegions[0]),
        type: "supplier" as const,
      }));

      while (currentTier <= 3) {
        const tierSuppliers = affectedSuppliers.filter(
          (s) => s.tier === currentTier
        );
        metricsRef.current.affectedTiers[currentTier] = tierSuppliers.length;

        tierSuppliers.forEach((supplier) => {
          const impact = selectedRegions.reduce(
            (acc, region) => acc + calculateImpact(supplier, region),
            0
          );
          cascadeEffects.set(supplier.id.toString(), impact);

          // Record daily impact
          dailyImpacts.push({
            day: currentTier * 5, // Simplified timeline
            event: `Tier ${currentTier} supplier ${supplier.name} affected`,
            impact: impact * 100,
            type: "supplier" as const,
          });
        });

        logSimulationMetrics("Cascade", {
          tier: currentTier,
          affectedCount: tierSuppliers.length,
          averageImpact:
            Array.from(cascadeEffects.values()).reduce((a, b) => a + b, 0) /
            cascadeEffects.size,
        });

        currentTier++;
      }

      // Calculate health metrics
      const baselineHealth = 100;
      const healthImpact =
        (Array.from(cascadeEffects.values()).reduce((a, b) => a + b, 0) /
          affectedSuppliers.length) *
        100;
      const simulatedHealth = Math.max(0, baselineHealth - healthImpact);

      // Calculate material availability
      const baselineAvailability = 100;
      const availabilityImpact = healthImpact * 0.8; // Material availability is slightly less affected than overall health
      const simulatedAvailability = Math.max(
        0,
        baselineAvailability - availabilityImpact
      );

      // Calculate project delays
      const averageDelay = Math.ceil(
        simulationConfig.duration * (1 - simulationConfig.recoveryRate)
      );
      const affectedProjects = [
        {
          projectId: "P1",
          name: "Main Production Line",
          delay: averageDelay * 1.2,
        },
        {
          projectId: "P2",
          name: "Secondary Assembly",
          delay: averageDelay * 0.8,
        },
      ];

      // Calculate cost impact
      const costPercentage = healthImpact * 1.5; // Cost impact is typically higher than health impact
      const costValue = 1000000 * (costPercentage / 100); // Simplified cost calculation

      // Generate results
      const simulationResults: SimulationResults = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        affectedSuppliers: Array.from(cascadeEffects.entries()).map(
          ([id, impact]) => ({
            supplier: suppliers.find((s) => s.id.toString() === id)!,
            impact,
            recoveryTime: Math.ceil(
              simulationConfig.duration *
                (impact / simulationConfig.recoveryRate)
            ),
          })
        ),
        cascadeDepth: currentTier - 1,
        totalImpact: Array.from(cascadeEffects.values()).reduce(
          (a, b) => a + b,
          0
        ),
        mitigationStrategies: [],
        supplyChainHealth: {
          baseline: baselineHealth,
          simulated: simulatedHealth,
        },
        materialAvailability: {
          baseline: baselineAvailability,
          simulated: simulatedAvailability,
        },
        projectDelays: {
          average: averageDelay,
          affected: affectedProjects,
        },
        costImpact: {
          percentage: costPercentage,
          value: costValue,
        },
        cascadeEffects: dailyImpacts,
      };

      setResults(simulationResults);
      await generateMitigationStrategies();
    } catch (error) {
      console.error("Simulation failed:", error);
      setError(error instanceof Error ? error.message : "Simulation failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearRegions = () => {
    setSelectedRegions([]);
    logSimulationMetrics("Clear Regions", {
      clearedCount: selectedRegions.length,
    });
  };

  // Handle supplier selection
  useEffect(() => {
    console.log("[Simulation] State Update:", {
      timestamp: new Date().toISOString(),
      selectedRegions,
      selectedSupplier,
      simulationConfig: {
        duration: disruptionDuration[0],
        intensity: disruptionSeverity[0],
        recoveryRate: 0, // Assuming recoveryRate is not available in the current state
      },
    });
  }, [
    selectedRegions,
    selectedSupplier,
    disruptionDuration,
    disruptionSeverity,
  ]);

  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [comparisonScenario, setComparisonScenario] =
    useState<SavedScenario | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load saved scenarios on mount
  useEffect(() => {
    setSavedScenarios(getSavedScenarios());
  }, []);

  const handleSaveScenario = () => {
    if (!results) return;

    const scenario: SavedScenario = {
      id: uuidv4(),
      name: scenarioName || `Scenario ${savedScenarios.length + 1}`,
      timestamp: new Date().toISOString(),
      config: simulationConfig,
      results,
      regions: selectedRegions,
    };

    saveScenario(scenario);
    setSavedScenarios(getSavedScenarios());
    setShowSaveDialog(false);
    setScenarioName("");
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setSelectedRegions(scenario.regions);
    setResults(scenario.results);
    setSimulationConfig(scenario.config);
  };

  const handleExportResults = () => {
    if (!results) return;

    const exportData = {
      scenario: {
        config: simulationConfig,
        regions: selectedRegions,
        timestamp: new Date().toISOString(),
      },
      results,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `simulation-results-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update the handleRegionChange function to properly handle types
  const handleRegionChange = (baseRegions: BaseRegion[]) => {
    const updatedRegions: Region[] = baseRegions.map((baseRegion) => {
      const affectedSuppliers = getAffectedSuppliers({
        ...baseRegion,
        impactZone: {
          suppliers: [],
          severity: simulationConfig.intensity,
          estimatedRecovery: Math.ceil(
            30 * (1 / simulationConfig.recoveryRate)
          ),
        },
      });

      return {
        lat: baseRegion.lat,
        lng: baseRegion.lng,
        radius: baseRegion.radius,
        impactZone: {
          suppliers: affectedSuppliers.map((s) => s.id.toString()),
          severity: simulationConfig.intensity,
          estimatedRecovery: Math.ceil(
            30 * (1 / simulationConfig.recoveryRate)
          ),
        },
      };
    });

    setSelectedRegions(updatedRegions);
  };

  const getAffectedSuppliers = (region: Region) => {
    return suppliers.filter((supplier) => {
      const distance = calculateDistance(
        region.lat,
        region.lng,
        supplier.location.coordinates[1],
        supplier.location.coordinates[0]
      );
      return distance <= region.radius;
    });
  };

  // Helper function for distance calculation
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Update the onRegionClick handler
  const handleRegionClick = (lat: number, lng: number) => {
    const existingRegions = selectedRegions.map((r) => ({
      lat: r.lat,
      lng: r.lng,
      radius: r.radius,
    })) as BaseRegion[];

    const newRegion: BaseRegion = {
      lat,
      lng,
      radius: 500, // Default radius in km
    };

    handleRegionChange([...existingRegions, newRegion]);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Supply Chain Simulation
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSaveDialog(true)}
            disabled={!results}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Scenario
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const dialog = document.createElement("input");
              dialog.type = "file";
              dialog.accept = "application/json";
              dialog.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const content = e.target?.result as string;
                    const data = JSON.parse(content);
                    handleLoadScenario(data);
                  };
                  reader.readAsText(file);
                }
              };
              dialog.click();
            }}
          >
            <FileUp className="w-4 h-4 mr-2" />
            Load Scenario
          </Button>
          <Button
            variant="outline"
            onClick={handleExportResults}
            disabled={!results}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Simulation Scenario</DialogTitle>
              <DialogDescription>
                Enter a name for this scenario to save it for later comparison.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Scenario Name</Label>
                <Input
                  id="name"
                  placeholder="Enter scenario name..."
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveScenario}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Tabs defaultValue="configure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configure">Configure Scenario</TabsTrigger>
          <TabsTrigger value="results" disabled={!results}>
            Simulation Results
          </TabsTrigger>
          <TabsTrigger value="comparison" disabled={!results}>
            Scenario Comparison
          </TabsTrigger>
          <TabsTrigger value="mitigation" disabled={!results}>
            Mitigation Strategies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-6 lg:grid-cols-8">
            {/* Configuration Panel */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Scenario Parameters
                </CardTitle>
                <CardDescription>
                  Configure your "what-if" scenario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scenario Name</label>
                  <Input
                    placeholder="Enter scenario name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Disruption Type</label>
                  <Select
                    value={disruptionType}
                    onValueChange={(
                      value: SimulationScenario["disruptionType"]
                    ) => setDisruptionType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select disruption type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weather">Weather Event</SelectItem>
                      <SelectItem value="geopolitical">
                        Geopolitical Crisis
                      </SelectItem>
                      <SelectItem value="supplier">Supplier Failure</SelectItem>
                      <SelectItem value="transport">
                        Transport Disruption
                      </SelectItem>
                      <SelectItem value="labor">Labor Dispute</SelectItem>
                      <SelectItem value="cyber">Cyber Attack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Disruption Severity ({disruptionSeverity}%)
                  </label>
                  <Slider
                    max={100}
                    step={1}
                    value={disruptionSeverity}
                    onValueChange={setDisruptionSeverity}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Disruption Duration ({disruptionDuration} days)
                  </label>
                  <Slider
                    max={180}
                    step={1}
                    value={disruptionDuration}
                    onValueChange={setDisruptionDuration}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Short</span>
                    <span>Medium</span>
                    <span>Long</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Simulation Timeframe ({simulationTimeframe} days)
                  </label>
                  <Slider
                    max={365}
                    step={1}
                    value={simulationTimeframe}
                    onValueChange={setSimulationTimeframe}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>3 months</span>
                    <span>6 months</span>
                    <span>1 year</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Affected Transport Modes
                  </label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sea-transport"
                      checked={selectedTransportModes.sea}
                      onCheckedChange={(checked) =>
                        setSelectedTransportModes({
                          ...selectedTransportModes,
                          sea: checked === true,
                        })
                      }
                    />
                    <label
                      htmlFor="sea-transport"
                      className="text-sm flex items-center gap-1"
                    >
                      <Ship className="h-3 w-3" /> Sea
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="air-transport"
                      checked={selectedTransportModes.air}
                      onCheckedChange={(checked) =>
                        setSelectedTransportModes({
                          ...selectedTransportModes,
                          air: checked === true,
                        })
                      }
                    />
                    <label
                      htmlFor="air-transport"
                      className="text-sm flex items-center gap-1"
                    >
                      <Plane className="h-3 w-3" /> Air
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rail-transport"
                      checked={selectedTransportModes.rail}
                      onCheckedChange={(checked) =>
                        setSelectedTransportModes({
                          ...selectedTransportModes,
                          rail: checked === true,
                        })
                      }
                    />
                    <label
                      htmlFor="rail-transport"
                      className="text-sm flex items-center gap-1"
                    >
                      <Train className="h-3 w-3" /> Rail
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="road-transport"
                      checked={selectedTransportModes.road}
                      onCheckedChange={(checked) =>
                        setSelectedTransportModes({
                          ...selectedTransportModes,
                          road: checked === true,
                        })
                      }
                    />
                    <label
                      htmlFor="road-transport"
                      className="text-sm flex items-center gap-1"
                    >
                      <Truck className="h-3 w-3" /> Road
                    </label>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={runSimulation}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {isRunning ? "Running..." : "Run Simulation"}
                </Button>

                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
              </CardContent>
            </Card>

            {/* Globe Visualization */}
            <Card className="md:col-span-4 lg:col-span-6 h-[600px]">
              <CardContent className="p-0 h-full">
                <Globe3D
                  suppliers={suppliers}
                  selectedSupplier={selectedSupplier}
                  onSupplierSelect={handleSupplierSelect}
                  isSimulation={true}
                  selectedRegions={
                    selectedRegions.map((r) => ({
                      lat: r.lat,
                      lng: r.lng,
                      radius: r.radius,
                    })) as BaseRegion[]
                  }
                  onRegionClick={handleRegionClick}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Impact Summary
                    </CardTitle>
                    <CardDescription>
                      Key impacts of the simulated disruption
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Supply Chain Health</span>
                        <Badge
                          variant={
                            results.supplyChainHealth.simulated <
                            results.supplyChainHealth.baseline * 0.7
                              ? "destructive"
                              : "default"
                          }
                        >
                          {Math.round(
                            ((results.supplyChainHealth.simulated -
                              results.supplyChainHealth.baseline) /
                              results.supplyChainHealth.baseline) *
                              100
                          )}
                          %
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${results.supplyChainHealth.simulated}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Baseline:{" "}
                          {Math.round(results.supplyChainHealth.baseline)}%
                        </span>
                        <span>
                          Simulated:{" "}
                          {Math.round(results.supplyChainHealth.simulated)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Material Availability</span>
                        <Badge
                          variant={
                            results.materialAvailability.simulated <
                            results.materialAvailability.baseline * 0.7
                              ? "destructive"
                              : "default"
                          }
                        >
                          {Math.round(
                            ((results.materialAvailability.simulated -
                              results.materialAvailability.baseline) /
                              results.materialAvailability.baseline) *
                              100
                          )}
                          %
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${results.materialAvailability.simulated}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Baseline:{" "}
                          {Math.round(results.materialAvailability.baseline)}%
                        </span>
                        <span>
                          Simulated:{" "}
                          {Math.round(results.materialAvailability.simulated)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Project Delays</span>
                        <Badge variant="destructive">
                          +{results.projectDelays.average} days
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-amber-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (results.projectDelays.average / 180) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Average delay</span>
                        <span>{results.projectDelays.average} days</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cost Impact</span>
                        <Badge variant="destructive">
                          +{results.costImpact.percentage}%
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-red-600 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              results.costImpact.percentage
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Budget increase</span>
                        <span>
                          £{(results.costImpact.value / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="text-sm font-medium mb-2">
                        Most Affected Projects
                      </h3>
                      <div className="space-y-3">
                        {results.projectDelays.affected.map((project) => (
                          <div
                            key={project.projectId}
                            className="flex items-center"
                          >
                            <div
                              className={`mr-4 flex h-8 w-8 items-center justify-center rounded-full ${
                                project.delay > 90
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {project.delay > 90 ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {project.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Delay: +{project.delay} days
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Cascade Effects Timeline</CardTitle>
                    <CardDescription>
                      Day-by-day progression of disruption impacts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={results.cascadeEffects}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="day"
                            label={{
                              value: "Days from Start",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <YAxis
                            label={{
                              value: "Impact Severity",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background p-3 border rounded-lg shadow-lg">
                                    <p className="text-sm font-medium">
                                      Day {data.day}
                                    </p>
                                    <p className="text-sm">{data.event}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Impact: {data.impact}%
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="impact"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <ScenarioComparison
            scenarios={savedScenarios}
            currentScenario={
              results
                ? {
                    id: Date.now().toString(),
                    name: "Current Scenario",
                    timestamp: new Date().toISOString(),
                    config: simulationConfig,
                    results,
                    regions: selectedRegions,
                  }
                : null
            }
          />
        </TabsContent>

        <TabsContent value="mitigation" className="space-y-4">
          {results?.mitigationStrategies &&
          results.mitigationStrategies.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI-Generated Mitigation Strategies
                </CardTitle>
                <CardDescription>
                  Recommended actions to minimize disruption impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results.mitigationStrategies.map((strategy, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-base font-medium">
                            {strategy.action}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {strategy.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {strategy.impact} Impact
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {strategy.difficulty} Difficulty
                          </Badge>
                          <Badge variant="outline">{strategy.timeframe}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">
                    Export Mitigation Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="rounded-full bg-muted p-3">
                  <Lightbulb className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-medium">No Strategies Generated</h3>
                  <p className="text-sm text-muted-foreground">
                    Run the simulation to generate AI-powered mitigation
                    strategies
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

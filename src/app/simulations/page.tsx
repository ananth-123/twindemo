"use client";

import { useState, useEffect } from "react";
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
  BarChart3,
  AlertTriangle,
  Clock,
  ArrowRight,
  Lightbulb,
  Truck,
  Ship,
  Plane,
  Train,
  CloudRain,
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
  const [selectedRegions, setSelectedRegions] = useState<
    SimulationScenario["affectedRegions"]
  >([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  // Simulation results state
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize simulation engine
  const engine = new SimulationEngine(
    suppliers,
    transportRoutes,
    climateEvents
  );

  // Run simulation
  const runSimulation = async () => {
    try {
      setIsRunning(true);
      setError(null);

      const scenario: SimulationScenario = {
        id: uuidv4(),
        name: scenarioName,
        disruptionType,
        severity: disruptionSeverity[0],
        duration: disruptionDuration[0],
        timeframe: simulationTimeframe[0],
        affectedTransportModes: selectedTransportModes,
        affectedRegions: selectedRegions,
        affectedSuppliers: selectedSuppliers,
      };

      const simulationResults = await engine.runSimulation(scenario);
      setResults(simulationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run simulation");
    } finally {
      setIsRunning(false);
    }
  };

  // Handle map selection
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedRegions([
      ...selectedRegions,
      {
        lat,
        lng,
        radius: 300, // Default radius in km
      },
    ]);
  };

  // Handle supplier selection
  const handleSupplierSelect = (supplierId: string) => {
    if (selectedSuppliers.includes(supplierId)) {
      setSelectedSuppliers(selectedSuppliers.filter((id) => id !== supplierId));
    } else {
      setSelectedSuppliers([...selectedSuppliers, supplierId]);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Simulation Engine</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Scenario
          </Button>
          <Button variant="outline" size="sm">
            <FileUp className="mr-2 h-4 w-4" />
            Load Scenario
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

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
          <div className="grid gap-4 md:grid-cols-3">
            {/* Scenario Configuration */}
            <Card className="md:col-span-1">
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

            {/* Affected Areas */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Affected Areas</CardTitle>
                <CardDescription>
                  Click on the map to select affected regions and suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] rounded-lg overflow-hidden border">
                  <WorldMap
                    suppliers={suppliers}
                    routes={transportRoutes}
                    climateEvents={climateEvents}
                    selectedMaterial="all"
                    selectedTiers={{ tier1: true, tier2: true, tier3: true }}
                    selectedModes={selectedTransportModes}
                    riskThreshold={0}
                    onMapClick={handleMapClick}
                    onSupplierClick={handleSupplierSelect}
                    selectedRegions={selectedRegions}
                    selectedSuppliers={selectedSuppliers}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Simulation Summary</CardTitle>
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
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>
                Compare multiple simulation scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center space-y-4">
                  <ArrowRight className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div className="max-w-md space-y-2">
                    <h3 className="text-lg font-medium">Comparison View</h3>
                    <p className="text-sm text-muted-foreground">
                      Run multiple scenarios to enable comparison view
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mitigation" className="space-y-4">
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Mitigation Recommendations
                </CardTitle>
                <CardDescription>
                  AI-generated strategies to mitigate disruption impacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-base font-medium">
                            {strategy.action}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {strategy.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">
                              {strategy.impact.charAt(0).toUpperCase() +
                                strategy.impact.slice(1)}{" "}
                              Impact
                            </Badge>
                            <Badge variant="outline">
                              {strategy.difficulty.charAt(0).toUpperCase() +
                                strategy.difficulty.slice(1)}{" "}
                              Difficulty
                            </Badge>
                            <Badge variant="outline">
                              {strategy.timeframe}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button className="w-full">
                    Generate Detailed Mitigation Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

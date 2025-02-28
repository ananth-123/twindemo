// @ts-nocheck
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Package,
  Calendar,
  AlertCircle,
  Boxes,
  Play,
  History,
  Zap,
  LineChart,
} from "lucide-react";
import RiskTrendChart from "@/components/charts/RiskTrendChart";
import MaterialShortageTable from "@/components/tables/MaterialShortageTable";
import ProjectImpactTable from "@/components/tables/ProjectImpactTable";
import {
  riskTrendData,
  materialShortages,
  projectImpacts,
} from "@/lib/data/charts/riskTrends";
import {
  suppliers,
  getSuppliersByStatus,
} from "@/lib/data/suppliers/suppliers";
import {
  transportRoutes,
  getRoutesByStatus,
} from "@/lib/data/suppliers/routes";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedScenarios, SavedScenario } from "@/lib/simulation/storage";

// Add diagnostic logging utilities
const logDataIntegration = (source: string, data: any) => {
  console.log(`[DfT Projects] Data Integration - ${source}:`, {
    timestamp: new Date().toISOString(),
    dataPoints: Object.keys(data).length,
    hasNullValues: Object.values(data).some((v) => v === null),
    updateFrequency: "manual", // TODO: Implement auto-updates
    dataTypes: Object.keys(data).reduce((acc, key) => {
      acc[key] = typeof data[key];
      return acc;
    }, {}),
  });
};

const logMaterialUsage = (projectId: string, materials: any) => {
  console.log(`[DfT Projects] Material Usage - Project ${projectId}:`, {
    timestamp: new Date().toISOString(),
    materialCount: Object.keys(materials).length,
    hasEstimates: materials.some((m) => m.estimated),
    hasActuals: materials.some((m) => m.actual),
    dataFreshness: materials.map((m) => ({
      material: m.name,
      lastUpdated: m.lastUpdated,
    })),
  });
};

const logProjectPerformance = (action: string, duration: number) => {
  console.log(`[DfT Projects] Performance - ${action}:`, {
    timestamp: new Date().toISOString(),
    duration,
    memoryUsage: performance.memory?.usedJSHeapSize,
    renderCount: window.performance.getEntriesByType("render").length,
  });
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<"3m" | "6m" | "12m" | "all">("all");
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const [dftProjects, setDftProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMaterials, setProjectMaterials] = useState({});

  // Load saved scenarios on mount
  useEffect(() => {
    setSavedScenarios(getSavedScenarios());
  }, []);

  // Add performance monitoring
  useEffect(() => {
    const startTime = performance.now();

    // Load DfT projects data
    const loadProjects = async () => {
      try {
        // TODO: Implement actual data fetching
        const mockProjects = [
          {
            id: "HS2-P1",
            name: "HS2 Phase One",
            budget: 45000000000,
            status: "In Progress",
            location: "London to Birmingham",
            materials: {
              steel: { estimated: 250000, actual: 180000, unit: "tonnes" },
              concrete: { estimated: 20000000, actual: 15000000, unit: "m3" },
            },
            climateRisks: ["flooding", "extreme heat"],
          },
          // Add more mock projects...
        ];

        setDftProjects(mockProjects);
        logDataIntegration("Initial Load", mockProjects);

        // Log performance
        const endTime = performance.now();
        logProjectPerformance("Initial Load", endTime - startTime);
      } catch (error) {
        console.error("[DfT Projects] Load Error:", error);
      }
    };

    loadProjects();
  }, []);

  // Monitor project selection
  useEffect(() => {
    if (selectedProject) {
      const startTime = performance.now();

      // Log material usage when project is selected
      logMaterialUsage(selectedProject.id, selectedProject.materials);

      const endTime = performance.now();
      logProjectPerformance("Project Selection", endTime - startTime);
    }
  }, [selectedProject]);

  // Get counts for summary cards
  const criticalSuppliers = getSuppliersByStatus("Critical").length;
  const atRiskSuppliers = getSuppliersByStatus("At Risk").length;
  const disruptedRoutes = getRoutesByStatus("Disrupted").length;
  const delayedRoutes = getRoutesByStatus("Delayed").length;

  // Calculate average metrics from simulations
  const averageMetrics = savedScenarios.reduce(
    (acc, scenario) => {
      acc.supplyChainHealth += scenario.results.supplyChainHealth.simulated;
      acc.materialAvailability +=
        scenario.results.materialAvailability.simulated;
      acc.costImpact += scenario.results.costImpact.percentage;
      return acc;
    },
    { supplyChainHealth: 0, materialAvailability: 0, costImpact: 0 }
  );

  if (savedScenarios.length > 0) {
    averageMetrics.supplyChainHealth /= savedScenarios.length;
    averageMetrics.materialAvailability /= savedScenarios.length;
    averageMetrics.costImpact /= savedScenarios.length;
  }

  // Filter trend data based on selected period
  const filteredRiskData = () => {
    switch (period) {
      case "3m":
        return riskTrendData.slice(-3);
      case "6m":
        return riskTrendData.slice(-6);
      case "12m":
        return riskTrendData.slice(-12);
      default:
        return riskTrendData;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Supply Chain Command Center</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and simulation insights
          </p>
        </div>
        <Button
          onClick={() => router.push("/simulations")}
          className="bg-primary hover:bg-primary/90"
        >
          <Play className="w-4 h-4 mr-2" />
          New Simulation
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="simulations">Simulation History</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Supply Chain Health
                    </p>
                    <h3 className="text-2xl font-bold">
                      {savedScenarios.length > 0
                        ? Math.round(averageMetrics.supplyChainHealth)
                        : 85}
                      %
                    </h3>
                    <p className="text-xs text-destructive flex items-center mt-1">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Based on {savedScenarios.length} simulations
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <LineChart />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Critical Suppliers
                    </p>
                    <h3 className="text-2xl font-bold">{criticalSuppliers}</h3>
                    <p className="text-xs text-destructive flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Requires immediate attention
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                    <AlertTriangle />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Material Availability
                    </p>
                    <h3 className="text-2xl font-bold">
                      {savedScenarios.length > 0
                        ? Math.round(averageMetrics.materialAvailability)
                        : 92}
                      %
                    </h3>
                    <p className="text-xs text-warning flex items-center mt-1">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      {materialShortages.length} items at risk
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center text-warning">
                    <Boxes />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Transport Network
                    </p>
                    <h3 className="text-2xl font-bold">
                      {disruptedRoutes + delayedRoutes}
                    </h3>
                    <p className="text-xs text-warning flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Active disruptions
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center text-warning">
                    <Truck />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Risk Forecast</CardTitle>
                <CardDescription>
                  Predicted risk levels based on {savedScenarios.length}{" "}
                  simulation scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskTrendChart data={filteredRiskData()} title="" />
              </CardContent>
            </Card>

            <Card className="xl:col-span-1">
              <CardHeader>
                <CardTitle>Top Risk Factors</CardTitle>
                <CardDescription>Based on simulation results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedScenarios
                    .slice(-5)
                    .reverse()
                    .map((scenario) => (
                      <div
                        key={scenario.id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{scenario.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(scenario.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            scenario.results.supplyChainHealth.simulated < 70
                              ? "destructive"
                              : "default"
                          }
                        >
                          {Math.round(
                            scenario.results.supplyChainHealth.simulated
                          )}
                          % Health
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle>Material Shortages & Project Impacts</CardTitle>
                <CardDescription>
                  Current status and predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MaterialShortageTable materials={materialShortages} />
                  <ProjectImpactTable projects={projectImpacts} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="simulations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulation History</CardTitle>
              <CardDescription>
                Review and compare past scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedScenarios.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Simulations Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Run your first simulation to start building insights
                    </p>
                    <Button onClick={() => router.push("/simulations")}>
                      <Play className="w-4 h-4 mr-2" />
                      New Simulation
                    </Button>
                  </div>
                ) : (
                  savedScenarios.map((scenario) => (
                    <Card key={scenario.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium">{scenario.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(scenario.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge>
                            {Math.round(
                              scenario.results.supplyChainHealth.simulated
                            )}
                            % Health
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Material Availability
                            </p>
                            <p className="font-medium">
                              {Math.round(
                                scenario.results.materialAvailability.simulated
                              )}
                              %
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cost Impact</p>
                            <p className="font-medium">
                              +{scenario.results.costImpact.percentage}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Affected Suppliers
                            </p>
                            <p className="font-medium">
                              {scenario.results.affectedSuppliers.length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>High-Risk Suppliers</CardTitle>
                <CardDescription>
                  Suppliers requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers
                    .filter((supplier) => supplier.risk > 75)
                    .sort((a, b) => b.risk - a.risk)
                    .slice(0, 5)
                    .map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {supplier.location.country}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              supplier.risk > 80
                                ? "bg-destructive"
                                : "bg-warning"
                            } mr-2`}
                          ></span>
                          <span
                            className={`font-medium ${
                              supplier.risk > 80
                                ? "text-destructive"
                                : "text-warning"
                            }`}
                          >
                            {supplier.risk}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transport Disruptions</CardTitle>
                <CardDescription>
                  Active route issues and delays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transportRoutes
                    .filter((route) => route.status !== "Active")
                    .slice(0, 5)
                    .map((route) => (
                      <div
                        key={route.id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">
                            {route.origin} → {route.destination}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {route.mode} | {route.status}
                          </p>
                        </div>
                        <Badge
                          variant={
                            route.status === "Disrupted"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {route.delay}h delay
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DfT Infrastructure Projects</CardTitle>
              <CardDescription>
                Current major projects and material usage tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Project list will go here */}
                {/* TODO: Implement project cards with material tracking */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

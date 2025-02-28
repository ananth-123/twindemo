import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SavedScenario } from "@/lib/simulation/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

interface ScenarioComparisonProps {
  scenarios: SavedScenario[];
  currentScenario: SavedScenario | null;
}

export function ScenarioComparison({
  scenarios,
  currentScenario,
}: ScenarioComparisonProps) {
  if (!currentScenario) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No Active Scenario</p>
          <p className="text-sm text-muted-foreground">
            Run a simulation to enable comparison
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for bar chart comparison
  const barChartData = scenarios.map((scenario) => ({
    name: scenario.name,
    "Supply Chain Health": scenario.results.supplyChainHealth.simulated,
    "Material Availability": scenario.results.materialAvailability.simulated,
    "Cost Impact": scenario.results.costImpact.percentage,
  }));

  // Prepare data for radar chart comparison
  const radarData = [
    {
      metric: "Supply Chain Health",
      Current: currentScenario.results.supplyChainHealth.simulated,
      Average:
        scenarios.reduce(
          (sum, s) => sum + s.results.supplyChainHealth.simulated,
          0
        ) / scenarios.length,
    },
    {
      metric: "Material Availability",
      Current: currentScenario.results.materialAvailability.simulated,
      Average:
        scenarios.reduce(
          (sum, s) => sum + s.results.materialAvailability.simulated,
          0
        ) / scenarios.length,
    },
    {
      metric: "Cost Impact",
      Current: currentScenario.results.costImpact.percentage,
      Average:
        scenarios.reduce((sum, s) => sum + s.results.costImpact.percentage, 0) /
        scenarios.length,
    },
    {
      metric: "Recovery Time",
      Current: currentScenario.results.projectDelays.average,
      Average:
        scenarios.reduce((sum, s) => sum + s.results.projectDelays.average, 0) /
        scenarios.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Supply Chain Health
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">
                    {Math.round(
                      currentScenario.results.supplyChainHealth.simulated
                    )}
                    %
                  </h3>
                  {currentScenario.results.supplyChainHealth.simulated <
                  scenarios.reduce(
                    (sum, s) => sum + s.results.supplyChainHealth.simulated,
                    0
                  ) /
                    scenarios.length ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-success" />
                  )}
                </div>
              </div>
              <Badge variant="outline">
                vs.{" "}
                {Math.round(
                  scenarios.reduce(
                    (sum, s) => sum + s.results.supplyChainHealth.simulated,
                    0
                  ) / scenarios.length
                )}
                % avg
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Material Availability
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">
                    {Math.round(
                      currentScenario.results.materialAvailability.simulated
                    )}
                    %
                  </h3>
                  {currentScenario.results.materialAvailability.simulated <
                  scenarios.reduce(
                    (sum, s) => sum + s.results.materialAvailability.simulated,
                    0
                  ) /
                    scenarios.length ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-success" />
                  )}
                </div>
              </div>
              <Badge variant="outline">
                vs.{" "}
                {Math.round(
                  scenarios.reduce(
                    (sum, s) => sum + s.results.materialAvailability.simulated,
                    0
                  ) / scenarios.length
                )}
                % avg
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost Impact</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">
                    {Math.round(currentScenario.results.costImpact.percentage)}%
                  </h3>
                  {currentScenario.results.costImpact.percentage >
                  scenarios.reduce(
                    (sum, s) => sum + s.results.costImpact.percentage,
                    0
                  ) /
                    scenarios.length ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-success" />
                  )}
                </div>
              </div>
              <Badge variant="outline">
                vs.{" "}
                {Math.round(
                  scenarios.reduce(
                    (sum, s) => sum + s.results.costImpact.percentage,
                    0
                  ) / scenarios.length
                )}
                % avg
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Metrics Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="Supply Chain Health"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Material Availability"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Cost Impact"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Current vs Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Current"
                    dataKey="Current"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Average"
                    dataKey="Average"
                    stroke="#9ca3af"
                    fill="#9ca3af"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

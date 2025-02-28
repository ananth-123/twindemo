import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialUsage } from "@/types/project";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface MaterialUsageChartProps {
  materials: Record<string, MaterialUsage>;
}

export function MaterialUsageChart({ materials }: MaterialUsageChartProps) {
  // Transform materials data for the chart
  const chartData = Object.entries(materials).map(([name, usage]) => ({
    name: name.replace("_", " "),
    Estimated: usage.estimated,
    Actual: usage.actual,
    unit: usage.unit,
    risk: usage.risk || 0,
  }));

  // Calculate the maximum value for better chart scaling
  const maxValue = Math.max(
    ...chartData.flatMap((item) => [item.Estimated, item.Actual])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material Usage Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{
                  value: "Quantity",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toLocaleString()} ${props.payload.unit}`,
                  name,
                ]}
                labelFormatter={(label) => `Material: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="Estimated"
                fill="#93c5fd"
                radius={[4, 4, 0, 0]}
                name="Estimated Usage"
              />
              <Bar
                dataKey="Actual"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Actual Usage"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          {chartData.map((material) => (
            <div
              key={material.name}
              className="flex items-center p-2 rounded-lg border bg-muted/50"
            >
              <div className="flex-1">
                <p className="text-sm font-medium capitalize">
                  {material.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      material.risk > 70
                        ? "bg-destructive"
                        : material.risk > 40
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Risk: {material.risk}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {((material.Actual / material.Estimated) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">of target</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

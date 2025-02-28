import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClimateRisk } from "@/types/project";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { CloudRain, Thermometer, Waves, Wind } from "lucide-react";

interface ClimateRiskChartProps {
  risks: ClimateRisk[];
}

const getClimateIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "flooding":
      return <Waves className="h-4 w-4" />;
    case "extreme heat":
      return <Thermometer className="h-4 w-4" />;
    case "storms":
      return <CloudRain className="h-4 w-4" />;
    default:
      return <Wind className="h-4 w-4" />;
  }
};

export function ClimateRiskChart({ risks }: ClimateRiskChartProps) {
  // Transform risks data for the radar chart
  const chartData = risks.map((risk) => ({
    type: risk.type,
    risk: Math.round(risk.probability * risk.impact * 100),
    probability: Math.round(risk.probability * 100),
    impact: Math.round(risk.impact * 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Climate Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="type" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Risk Score"
                dataKey="risk"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Risk Score"]}
                labelFormatter={(label) => `Risk Type: ${label}`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Details */}
        <div className="grid gap-4 mt-6">
          {risks.map((risk) => (
            <div
              key={risk.type}
              className="flex items-start p-4 rounded-lg border bg-muted/50"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                {getClimateIcon(risk.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">{risk.type}</h4>
                  <Badge
                    variant={
                      risk.impact * risk.probability > 0.7
                        ? "destructive"
                        : risk.impact * risk.probability > 0.4
                        ? "warning"
                        : "outline"
                    }
                  >
                    {Math.round(risk.impact * risk.probability * 100)}% Risk
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Probability</p>
                    <p className="font-medium">
                      {Math.round(risk.probability * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Impact</p>
                    <p className="font-medium">
                      {Math.round(risk.impact * 100)}%
                    </p>
                  </div>
                </div>
                {risk.affectedMaterials.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">
                      Affected Materials
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {risk.affectedMaterials.map((material) => (
                        <Badge key={material} variant="secondary">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {risk.mitigationStrategies &&
                  risk.mitigationStrategies.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">
                        Mitigation Strategies
                      </p>
                      <ul className="text-sm space-y-1">
                        {risk.mitigationStrategies.map((strategy, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {strategy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

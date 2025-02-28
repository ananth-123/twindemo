import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Thermometer,
  Waves,
  Wind,
  Network,
} from "lucide-react";
import {
  CCRAAssessment,
  CCRARisk,
  CCRARiskCategory,
} from "@/lib/analysis/ccra";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface CCRAAssessmentProps {
  assessment: CCRAAssessment;
}

const RISK_ICONS: Record<CCRARiskCategory, React.ReactNode> = {
  extreme_weather: <Wind className="h-4 w-4" />,
  flooding: <CloudRain className="h-4 w-4" />,
  water_scarcity: <Droplets className="h-4 w-4" />,
  temperature_rise: <Thermometer className="h-4 w-4" />,
  sea_level_rise: <Waves className="h-4 w-4" />,
  supply_chain_disruption: <Network className="h-4 w-4" />,
};

const URGENCY_COLORS = {
  more_action: "text-destructive",
  further_investigation: "text-warning",
  sustain_current_action: "text-success",
  watching_brief: "text-muted-foreground",
};

const MAGNITUDE_COLORS = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-success",
};

export function CCRAAssessmentView({ assessment }: CCRAAssessmentProps) {
  // Prepare data for radar chart
  const radarData = assessment.risks.map((risk) => ({
    category: risk.category,
    score:
      (risk.urgency === "more_action"
        ? 100
        : risk.urgency === "further_investigation"
        ? 70
        : risk.urgency === "sustain_current_action"
        ? 40
        : 20) *
      (risk.magnitude === "high" ? 1 : risk.magnitude === "medium" ? 0.6 : 0.3),
  }));

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Climate Change Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Risk Score</span>
                <Badge
                  variant={
                    assessment.overallScore > 75
                      ? "destructive"
                      : assessment.overallScore > 45
                      ? "warning"
                      : "outline"
                  }
                >
                  {Math.round(assessment.overallScore)}
                </Badge>
              </div>
              <Progress value={assessment.overallScore} className="h-2" />
            </div>

            <div>
              <span className="text-sm font-medium">Adaptation Status</span>
              <Badge
                variant={
                  assessment.adaptationStatus === "high"
                    ? "destructive"
                    : assessment.adaptationStatus === "medium"
                    ? "warning"
                    : "outline"
                }
                className="ml-2"
              >
                {assessment.adaptationStatus.toUpperCase()} PRIORITY
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Risk Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessment.risks.map((risk) => (
                <div
                  key={risk.category}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-muted/50"
                >
                  <div className="mt-1">{RISK_ICONS[risk.category]}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">
                        {risk.category.replace("_", " ")}
                      </p>
                      <Badge
                        variant={
                          risk.urgency === "more_action"
                            ? "destructive"
                            : risk.urgency === "further_investigation"
                            ? "warning"
                            : "outline"
                        }
                      >
                        {risk.timeframe}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className={URGENCY_COLORS[risk.urgency]}>
                        {risk.urgency.replace("_", " ")}
                      </span>
                      <span className={MAGNITUDE_COLORS[risk.magnitude]}>
                        {risk.magnitude} magnitude
                      </span>
                      <span className="text-muted-foreground">
                        {risk.confidence} confidence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {assessment.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

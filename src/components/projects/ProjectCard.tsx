import { DftProject, MaterialUsage } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Calendar,
  CircleDollarSign,
  CloudRain,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";
import { getProjectMetrics } from "@/lib/data/projects/dft-projects";

interface ProjectCardProps {
  project: DftProject;
  onClick?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
  });
};

const getClimateIcon = (type: string) => {
  switch (type) {
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

const getMaterialStatus = (usage: MaterialUsage) => {
  const ratio = usage.actual / usage.estimated;
  if (ratio < 0.9) return "on-track";
  if (ratio < 1.1) return "warning";
  return "over";
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const metrics = getProjectMetrics(project);

  return (
    <Card
      className="hover:bg-accent/5 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {project.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {project.description}
            </p>
          </div>
          <Badge
            variant={project.status === "In Progress" ? "default" : "secondary"}
          >
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Budget and Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CircleDollarSign className="h-4 w-4" />
                Budget Utilization
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {formatCurrency(project.spent)}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {formatCurrency(project.budget)}
                </span>
              </div>
              <Progress
                value={metrics.budgetUtilization * 100}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Timeline
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{formatDate(project.startDate)}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(project.estimatedCompletion)}
                </span>
              </div>
              <Progress
                value={metrics.schedule.progress * 100}
                className="h-2"
              />
            </div>
          </div>

          {/* Materials */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Materials
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(project.materials)
                .filter(([_, usage]) => (usage.risk || 0) > 60)
                .map(([material, usage]) => (
                  <div
                    key={material}
                    className="flex items-center justify-between bg-muted/50 rounded-md p-2"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {material.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {usage.actual.toLocaleString()} /{" "}
                        {usage.estimated.toLocaleString()} {usage.unit}
                      </p>
                    </div>
                    <Badge
                      variant={
                        getMaterialStatus(usage) === "over"
                          ? "destructive"
                          : getMaterialStatus(usage) === "warning"
                          ? "warning"
                          : "outline"
                      }
                    >
                      {Math.round((usage.actual / usage.estimated) * 100)}%
                    </Badge>
                  </div>
                ))}
            </div>
          </div>

          {/* Climate Risks */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CloudRain className="h-4 w-4" />
              Climate Risks
            </div>
            <div className="flex flex-wrap gap-2">
              {project.climateRisks.map((risk) => (
                <Badge
                  key={risk.type}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {getClimateIcon(risk.type)}
                  <span className="capitalize">{risk.type}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

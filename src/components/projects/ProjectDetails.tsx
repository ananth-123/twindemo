import { DftProject } from "@/types/project";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Calendar,
  CircleDollarSign,
  Map,
  Boxes,
  Truck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { getProjectMetrics } from "@/lib/projects/metrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialUsageChart } from "@/components/charts/MaterialUsageChart";
import { ClimateRiskChart } from "@/components/charts/ClimateRiskChart";

interface ProjectDetailsProps {
  project: DftProject;
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
    month: "long",
    day: "numeric",
  });
};

const getRiskColor = (risk: number) => {
  if (risk >= 75) return "text-destructive";
  if (risk >= 50) return "text-warning";
  return "text-success";
};

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const metrics = getProjectMetrics(project);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
            <CardDescription className="mt-1.5">
              {project.description}
            </CardDescription>
          </div>
          <Badge
            variant={project.status === "In Progress" ? "default" : "secondary"}
            className="ml-4"
          >
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Budget</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {formatCurrency(project.spent)}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {formatCurrency(project.budget)}
                </p>
              </div>
              <Progress
                value={metrics.budgetUtilization * 100}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Timeline</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {Math.round(metrics.schedule.progress * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete by {formatDate(project.estimatedCompletion)}
                </p>
              </div>
              <Progress
                value={metrics.schedule.progress * 100}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Risk Score</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {Math.round(metrics.riskScore)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {project.climateRisks.length} factors
                </p>
              </div>
              <Progress value={metrics.riskScore} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Materials</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {Math.round(metrics.materialUtilization * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of estimated usage
                </p>
              </div>
              <Progress
                value={metrics.materialUtilization * 100}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Project Location */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Map className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{project.location.name}</p>
                <p className="text-sm text-muted-foreground">
                  {project.location.lat.toFixed(4)},{" "}
                  {project.location.lng.toFixed(4)}
                </p>
              </div>
              <Badge variant="outline">{project.department}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <Tabs defaultValue="materials" className="w-full">
          <TabsList>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="climate">Climate Risks</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-4">
            <MaterialUsageChart materials={project.materials} />
          </TabsContent>

          <TabsContent value="climate" className="mt-4">
            <ClimateRiskChart risks={project.climateRisks} />
          </TabsContent>

          <TabsContent value="suppliers" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {project.suppliers.map((supplierId) => (
                <Card key={supplierId}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{supplierId}</h4>
                      <Badge variant="outline">
                        Tier {Math.floor(Math.random() * 3) + 1}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4" />
                        <span>Delivery Performance: 92%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Risk Score: Medium</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Quality Score: 95%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

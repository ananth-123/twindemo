"use client";

import { ProjectImpact } from "@/lib/data/charts/riskTrends";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectImpactTableProps {
  projects: ProjectImpact[];
  title?: string;
}

export default function ProjectImpactTable({
  projects,
  title = "Project Impacts",
}: ProjectImpactTableProps) {
  // Sort projects by risk score (highest first)
  const sortedProjects = [...projects].sort(
    (a, b) => b.riskScore - a.riskScore
  );

  // Helper function to get badge color based on project status
  const getStatusColor = (status: "Critical" | "At Risk" | "On Track") => {
    switch (status) {
      case "Critical":
        return "destructive";
      case "At Risk":
        return "warning";
      case "On Track":
        return "success";
      default:
        return "secondary";
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Original Deadline</TableHead>
              <TableHead>Projected Delay</TableHead>
              <TableHead>Cost Increase</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{formatDate(project.originalDeadline)}</TableCell>
                <TableCell>
                  {project.projectedDelay > 0
                    ? `${project.projectedDelay} days`
                    : "None"}
                </TableCell>
                <TableCell>+{project.costIncrease}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={project.riskScore}
                      className="h-2 w-16"
                      indicatorClassName={
                        project.riskScore > 70
                          ? "bg-destructive"
                          : project.riskScore > 40
                          ? "bg-warning"
                          : "bg-success"
                      }
                    />
                    <span className="text-xs">{project.riskScore}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

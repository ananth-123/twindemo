"use client";

import { MaterialShortage } from "@/lib/data/charts/riskTrends";
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
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface MaterialShortageTableProps {
  materials: MaterialShortage[];
  title?: string;
}

export default function MaterialShortageTable({
  materials,
  title = "Material Shortage Forecast",
}: MaterialShortageTableProps) {
  // Sort materials by confidence (highest first)
  const sortedMaterials = [...materials].sort(
    (a, b) => b.confidence - a.confidence
  );

  // Helper function to get badge color based on shortage severity
  const getShortageColor = (shortage: "Severe" | "Moderate" | "Mild") => {
    switch (shortage) {
      case "Severe":
        return "destructive";
      case "Moderate":
        return "warning";
      case "Mild":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // Helper function to get trend icon
  const getTrendIcon = (trend: "increasing" | "decreasing" | "stable") => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-success" />;
      case "stable":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
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
              <TableHead>Material</TableHead>
              <TableHead>Shortage</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>
                  <Badge variant={getShortageColor(material.shortage)}>
                    {material.shortage}
                  </Badge>
                </TableCell>
                <TableCell>{material.confidence}%</TableCell>
                <TableCell>{material.timeline}</TableCell>
                <TableCell className="flex items-center">
                  {getTrendIcon(material.trend)}
                  <span className="ml-1 text-sm capitalize">
                    {material.trend}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      material.impact === "High"
                        ? "border-destructive text-destructive"
                        : material.impact === "Medium"
                        ? "border-warning text-warning"
                        : "border-secondary text-secondary"
                    }
                  >
                    {material.impact}
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

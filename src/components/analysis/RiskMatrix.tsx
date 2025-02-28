import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DftProject } from "@/types/project";
import { Supplier } from "@/types/supplier";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
} from "recharts";
import { AlertTriangle, Building2, Truck } from "lucide-react";

interface RiskMatrixProps {
  projects: DftProject[];
  suppliers: Supplier[];
  onSelect?: (type: "project" | "supplier", id: string) => void;
}

interface RiskPoint {
  x: number; // Impact
  y: number; // Probability
  z: number; // Size (based on budget/materials)
  name: string;
  type: "project" | "supplier";
  id: string;
  risk: number;
}

export function RiskMatrix({ projects, suppliers, onSelect }: RiskMatrixProps) {
  // Calculate risk points for projects
  const projectPoints: RiskPoint[] = projects.map((project) => {
    const maxRisk = Math.max(
      ...project.climateRisks.map((risk) => risk.impact * risk.probability)
    );
    const impact = project.climateRisks.reduce(
      (max, risk) => Math.max(max, risk.impact),
      0
    );
    const probability = project.climateRisks.reduce(
      (max, risk) => Math.max(max, risk.probability),
      0
    );

    return {
      x: impact * 100,
      y: probability * 100,
      z: Math.log10(project.budget) * 2,
      name: project.name,
      type: "project",
      id: project.id,
      risk: maxRisk * 100,
    };
  });

  // Calculate risk points for suppliers
  const supplierPoints: RiskPoint[] = suppliers.map((supplier) => {
    // Normalize supplier risk to impact/probability scale
    const impact = (supplier.risk / 100) * 0.8 + 0.2; // Ensure minimum impact of 0.2
    const probability =
      supplier.status === "Critical"
        ? 0.9
        : supplier.status === "At Risk"
        ? 0.6
        : 0.3;

    return {
      x: impact * 100,
      y: probability * 100,
      z: supplier.materials.length * 3,
      name: supplier.name,
      type: "supplier",
      id: supplier.id.toString(),
      risk: supplier.risk,
    };
  });

  const allPoints = [...projectPoints, ...supplierPoints];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Risk Assessment Matrix</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-purple-500/10">
              <Building2 className="h-3 w-3 mr-1" />
              Projects
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10">
              <Truck className="h-3 w-3 mr-1" />
              Suppliers
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis
                type="number"
                dataKey="x"
                name="Impact"
                unit="%"
                domain={[0, 100]}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Probability"
                unit="%"
                domain={[0, 100]}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Size" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as RiskPoint;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Type:{" "}
                          {data.type === "project" ? "Project" : "Supplier"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Impact: {Math.round(data.x)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Probability: {Math.round(data.y)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Risk Score: {Math.round(data.risk)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                data={allPoints}
                onClick={(data) => onSelect?.(data.type, data.id)}
              >
                {allPoints.map((point, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      point.type === "project"
                        ? point.risk > 70
                          ? "rgba(168, 85, 247, 0.8)"
                          : "rgba(168, 85, 247, 0.4)"
                        : point.risk > 70
                        ? "rgba(59, 130, 246, 0.8)"
                        : "rgba(59, 130, 246, 0.4)"
                    }
                  />
                ))}
              </Scatter>

              {/* Risk Zones */}
              <rect
                x="60%"
                y="60%"
                width="40%"
                height="40%"
                fill="rgba(239, 68, 68, 0.1)"
                stroke="rgba(239, 68, 68, 0.2)"
              />
              <rect
                x="30%"
                y="30%"
                width="30%"
                height="70%"
                fill="rgba(234, 179, 8, 0.1)"
                stroke="rgba(234, 179, 8, 0.2)"
              />
              <rect
                x="60%"
                y="0%"
                width="40%"
                height="60%"
                fill="rgba(234, 179, 8, 0.1)"
                stroke="rgba(234, 179, 8, 0.2)"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Zones Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-red-500/20 border border-red-500/40" />
            <span className="text-sm">Critical Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-yellow-500/20 border border-yellow-500/40" />
            <span className="text-sm">High Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500/20 border border-green-500/40" />
            <span className="text-sm">Moderate Risk Zone</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

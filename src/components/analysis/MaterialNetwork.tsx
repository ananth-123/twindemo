import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DftProject } from "@/types/project";
import { Supplier } from "@/types/supplier";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import {
  AlertTriangle,
  Boxes,
  Building2,
  Truck,
  ArrowRight,
} from "lucide-react";

interface MaterialNetworkProps {
  projects: DftProject[];
  suppliers: Supplier[];
  selectedMaterial?: string;
}

interface Node {
  name: string;
  type: "supplier" | "project" | "material";
  value: number;
  risk?: number;
}

interface Link {
  source: number;
  target: number;
  value: number;
  risk?: number;
}

interface NetworkData {
  nodes: Node[];
  links: Link[];
}

export function MaterialNetwork({
  projects,
  suppliers,
  selectedMaterial,
}: MaterialNetworkProps) {
  // Build network data
  const buildNetworkData = (): NetworkData => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const nodeMap = new Map<string, number>();

    // Add suppliers as nodes
    suppliers.forEach((supplier) => {
      if (selectedMaterial && !supplier.materials.includes(selectedMaterial)) {
        return;
      }
      const index = nodes.length;
      nodeMap.set(supplier.id.toString(), index);
      nodes.push({
        name: supplier.name,
        type: "supplier",
        value: supplier.materials.length,
        risk: supplier.risk,
      });
    });

    // Add materials as nodes
    const materials = new Set<string>();
    suppliers.forEach((supplier) => {
      supplier.materials.forEach((material) => {
        if (!selectedMaterial || material === selectedMaterial) {
          materials.add(material);
        }
      });
    });
    materials.forEach((material) => {
      const index = nodes.length;
      nodeMap.set(material, index);
      nodes.push({
        name: material,
        type: "material",
        value: 1,
      });
    });

    // Add projects as nodes
    projects.forEach((project) => {
      if (
        selectedMaterial &&
        !Object.keys(project.materials).includes(selectedMaterial)
      ) {
        return;
      }
      const index = nodes.length;
      nodeMap.set(project.id, index);
      nodes.push({
        name: project.name,
        type: "project",
        value: Object.keys(project.materials).length,
      });
    });

    // Create links between suppliers and materials
    suppliers.forEach((supplier) => {
      const supplierIndex = nodeMap.get(supplier.id.toString());
      if (supplierIndex === undefined) return;

      supplier.materials.forEach((material) => {
        if (selectedMaterial && material !== selectedMaterial) return;
        const materialIndex = nodeMap.get(material);
        if (materialIndex === undefined) return;

        links.push({
          source: supplierIndex,
          target: materialIndex,
          value: 1,
          risk: supplier.risk,
        });
      });
    });

    // Create links between materials and projects
    projects.forEach((project) => {
      const projectIndex = nodeMap.get(project.id);
      if (projectIndex === undefined) return;

      Object.entries(project.materials).forEach(([material, usage]) => {
        if (selectedMaterial && material !== selectedMaterial) return;
        const materialIndex = nodeMap.get(material);
        if (materialIndex === undefined) return;

        links.push({
          source: materialIndex,
          target: projectIndex,
          value: usage.estimated,
          risk: usage.risk,
        });
      });
    });

    return { nodes, links };
  };

  const networkData = buildNetworkData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Material Network Analysis</CardTitle>
          {selectedMaterial && (
            <Badge variant="outline" className="bg-primary/10">
              {selectedMaterial}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={networkData}
              node={({ x, y, width, height, name, type, risk }) => (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={
                      type === "supplier"
                        ? risk && risk > 70
                          ? "rgba(239, 68, 68, 0.2)"
                          : risk && risk > 40
                          ? "rgba(234, 179, 8, 0.2)"
                          : "rgba(59, 130, 246, 0.2)"
                        : type === "material"
                        ? "rgba(34, 197, 94, 0.2)"
                        : "rgba(168, 85, 247, 0.2)"
                    }
                    stroke={
                      type === "supplier"
                        ? risk && risk > 70
                          ? "rgb(239, 68, 68)"
                          : risk && risk > 40
                          ? "rgb(234, 179, 8)"
                          : "rgb(59, 130, 246)"
                        : type === "material"
                        ? "rgb(34, 197, 94)"
                        : "rgb(168, 85, 247)"
                    }
                  />
                  <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-foreground"
                  >
                    {name}
                  </text>
                </g>
              )}
              link={({
                sourceX,
                sourceY,
                targetX,
                targetY,
                linkWidth,
                risk,
              }) => (
                <path
                  d={`
                    M${sourceX},${sourceY}
                    C${(sourceX + targetX) / 2},${sourceY}
                     ${(sourceX + targetX) / 2},${targetY}
                     ${targetX},${targetY}
                  `}
                  fill="none"
                  stroke={
                    risk && risk > 70
                      ? "rgba(239, 68, 68, 0.2)"
                      : risk && risk > 40
                      ? "rgba(234, 179, 8, 0.2)"
                      : "rgba(148, 163, 184, 0.2)"
                  }
                  strokeWidth={linkWidth}
                />
              )}
              margin={{ top: 20, right: 160, bottom: 20, left: 160 }}
            />
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Suppliers</span>
          </div>
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-green-500" />
            <span className="text-sm">Materials</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm">High Risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

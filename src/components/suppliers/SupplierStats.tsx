"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Supplier } from "@/lib/data/suppliers/suppliers";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useRef } from "react";

interface SupplierStatsProps {
  suppliers: Supplier[];
}

export default function SupplierStats({ suppliers }: SupplierStatsProps) {
  const metricsRef = useRef({
    riskFactors: new Set<string>(),
    correlations: new Map<string, number>(),
    predictiveMetrics: {
      shortTerm: new Map<string, number>(),
      longTerm: new Map<string, number>(),
    },
  });

  // Add diagnostic logging
  useEffect(() => {
    // Log risk distribution analysis
    const riskAnalysis = {
      totalSuppliers: suppliers.length,
      riskDistribution: {
        high: suppliers.filter((s) => s.risk > 70).length,
        medium: suppliers.filter((s) => s.risk >= 40 && s.risk <= 70).length,
        low: suppliers.filter((s) => s.risk < 40).length,
      },
      tierBreakdown: {
        tier1: suppliers.filter((s) => s.tier === 1).length,
        tier2: suppliers.filter((s) => s.tier === 2).length,
        tier3: suppliers.filter((s) => s.tier === 3).length,
      },
      riskFactors: {
        criticalMaterials: new Set(suppliers.flatMap((s) => s.materials)).size,
        highRiskCountries: new Set(
          suppliers.filter((s) => s.risk > 70).map((s) => s.location.country)
        ).size,
        trendingUp: suppliers.filter((s) => s.trend === "up").length,
      },
      potentialImpact: {
        highImpact: suppliers.filter((s) => s.impact === "High").length,
        mediumImpact: suppliers.filter((s) => s.impact === "Medium").length,
        lowImpact: suppliers.filter((s) => s.impact === "Low").length,
      },
    };

    console.log("[SupplierStats] Risk Analysis:", riskAnalysis);

    // Log potential correlations
    const correlations = {
      riskVsImpact: calculateCorrelation(
        suppliers.map((s) => s.risk),
        suppliers.map((s) =>
          s.impact === "High" ? 3 : s.impact === "Medium" ? 2 : 1
        )
      ),
      tierVsRisk: calculateCorrelation(
        suppliers.map((s) => s.tier),
        suppliers.map((s) => s.risk)
      ),
    };

    console.log("[SupplierStats] Risk Correlations:", correlations);

    // Store metrics for component use
    metricsRef.current.riskFactors = new Set(
      suppliers.flatMap((s) => s.materials)
    );
    metricsRef.current.correlations = new Map(Object.entries(correlations));
  }, [suppliers]);

  // Correlation helper function
  function calculateCorrelation(array1: number[], array2: number[]): number {
    const n = array1.length;
    const sum1 = array1.reduce((a, b) => a + b, 0);
    const sum2 = array2.reduce((a, b) => a + b, 0);
    const sum1Sq = array1.reduce((a, b) => a + b * b, 0);
    const sum2Sq = array2.reduce((a, b) => a + b * b, 0);
    const pSum = array1.map((x, i) => x * array2[i]).reduce((a, b) => a + b, 0);

    const numerator = n * pSum - sum1 * sum2;
    const denominator = Math.sqrt(
      (n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // Calculate statistics
  const totalSuppliers = suppliers.length;
  const tier1Count = suppliers.filter((s) => s.tier === 1).length;
  const tier2Count = suppliers.filter((s) => s.tier === 2).length;
  const tier3Count = suppliers.filter((s) => s.tier === 3).length;

  const criticalCount = suppliers.filter((s) => s.status === "Critical").length;
  const atRiskCount = suppliers.filter((s) => s.status === "At Risk").length;
  const onTrackCount = suppliers.filter((s) => s.status === "On Track").length;

  const highImpactCount = suppliers.filter((s) => s.impact === "High").length;
  const mediumImpactCount = suppliers.filter(
    (s) => s.impact === "Medium"
  ).length;
  const lowImpactCount = suppliers.filter((s) => s.impact === "Low").length;

  // Prepare data for charts
  const tierData = [
    { name: "Tier 1", value: tier1Count, color: "#4f46e5" },
    { name: "Tier 2", value: tier2Count, color: "#6366f1" },
    { name: "Tier 3", value: tier3Count, color: "#a5b4fc" },
  ];

  const statusData = [
    { name: "Critical", value: criticalCount, color: "#ef4444" },
    { name: "At Risk", value: atRiskCount, color: "#f59e0b" },
    { name: "On Track", value: onTrackCount, color: "#22c55e" },
  ];

  const impactData = [
    { name: "High", value: highImpactCount, color: "#ef4444" },
    { name: "Medium", value: mediumImpactCount, color: "#f59e0b" },
    { name: "Low", value: lowImpactCount, color: "#22c55e" },
  ];

  // Calculate average risk score
  const averageRisk =
    suppliers.length > 0
      ? Math.round(
          suppliers.reduce((sum, supplier) => sum + supplier.risk, 0) /
            suppliers.length
        )
      : 0;

  // Get risk distribution
  const lowRiskCount = suppliers.filter((s) => s.risk < 40).length;
  const mediumRiskCount = suppliers.filter(
    (s) => s.risk >= 40 && s.risk <= 70
  ).length;
  const highRiskCount = suppliers.filter((s) => s.risk > 70).length;

  const riskDistributionData = [
    { name: "Low Risk", value: lowRiskCount, color: "#22c55e" },
    { name: "Medium Risk", value: mediumRiskCount, color: "#f59e0b" },
    { name: "High Risk", value: highRiskCount, color: "#ef4444" },
  ];

  // Get most common materials
  const materialCounts: Record<string, number> = {};
  suppliers.forEach((supplier) => {
    supplier.materials.forEach((material) => {
      materialCounts[material] = (materialCounts[material] || 0) + 1;
    });
  });

  const topMaterials = Object.entries(materialCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalSuppliers) * 100),
    }));

  // Get countries distribution
  const countryCounts: Record<string, number> = {};
  suppliers.forEach((supplier) => {
    const country = supplier.location.country;
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Supplier Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold">{totalSuppliers}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Suppliers
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold">{averageRisk}%</div>
                  <div className="text-sm text-muted-foreground">
                    Average Risk
                  </div>
                  <div className="w-full mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${
                          averageRisk > 70
                            ? "bg-red-600"
                            : averageRisk > 40
                            ? "bg-yellow-400"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${averageRisk}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Top Countries</h4>
            <Card>
              <CardContent className="pt-6 pb-2">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topCountries}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} suppliers`,
                          "Count",
                        ]}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Risk Analysis</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Critical</div>
                  <div className="text-xl font-bold text-red-500">
                    {criticalCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((criticalCount / totalSuppliers) * 100)}% of
                    suppliers
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">At Risk</div>
                  <div className="text-xl font-bold text-amber-500">
                    {atRiskCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((atRiskCount / totalSuppliers) * 100)}% of
                    suppliers
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    High Risk Score
                  </div>
                  <div className="text-xl font-bold text-red-500">
                    {highRiskCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((highRiskCount / totalSuppliers) * 100)}% of
                    suppliers
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    High Impact
                  </div>
                  <div className="text-xl font-bold text-red-500">
                    {highImpactCount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((highImpactCount / totalSuppliers) * 100)}% of
                    suppliers
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Risk Distribution</h4>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} suppliers (${Math.round(
                            (value / totalSuppliers) * 100
                          )}%)`,
                          "Count",
                        ]}
                        labelFormatter={(name) => `${name}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 text-xs mt-2">
                  {riskDistributionData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 mr-1 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span>
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Supplier Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Supplier Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tierData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {tierData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} suppliers`,
                          "Count",
                        ]}
                        labelFormatter={(name) => `${name}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center flex-wrap gap-2 text-xs">
                  {tierData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-2 h-2 mr-1 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span>
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} suppliers`,
                          "Count",
                        ]}
                        labelFormatter={(name) => `${name}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center flex-wrap gap-2 text-xs">
                  {statusData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-2 h-2 mr-1 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span>
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={impactData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {impactData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} suppliers`,
                          "Count",
                        ]}
                        labelFormatter={(name) => `${name}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center flex-wrap gap-2 text-xs">
                  {impactData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-2 h-2 mr-1 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span>
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Top Materials</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {topMaterials.map((material, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{material.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {material.count} suppliers ({material.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(material.count / totalSuppliers) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

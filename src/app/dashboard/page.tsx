"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Package,
  Calendar,
  AlertCircle,
  Boxes,
} from "lucide-react";
import RiskTrendChart from "@/components/charts/RiskTrendChart";
import MaterialShortageTable from "@/components/tables/MaterialShortageTable";
import ProjectImpactTable from "@/components/tables/ProjectImpactTable";
import {
  riskTrendData,
  materialShortages,
  projectImpacts,
} from "@/lib/data/charts/riskTrends";
import {
  suppliers,
  getSuppliersByStatus,
} from "@/lib/data/suppliers/suppliers";
import {
  transportRoutes,
  getRoutesByStatus,
} from "@/lib/data/suppliers/routes";
import { useState } from "react";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"3m" | "6m" | "12m" | "all">("all");

  // Get counts for summary cards
  const criticalSuppliers = getSuppliersByStatus("Critical").length;
  const atRiskSuppliers = getSuppliersByStatus("At Risk").length;
  const disruptedRoutes = getRoutesByStatus("Disrupted").length;
  const delayedRoutes = getRoutesByStatus("Delayed").length;

  // Filter trend data based on selected period
  const filteredRiskData = () => {
    switch (period) {
      case "3m":
        return riskTrendData.slice(-3);
      case "6m":
        return riskTrendData.slice(-6);
      case "12m":
        return riskTrendData.slice(-12);
      default:
        return riskTrendData;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Risk Dashboard</h1>
        <div className="flex space-x-2">
          <Tabs defaultValue={period}>
            <TabsList>
              <TabsTrigger
                value="3m"
                onClick={() => setPeriod("3m")}
                className={
                  period === "3m" ? "bg-primary text-primary-foreground" : ""
                }
              >
                3 Months
              </TabsTrigger>
              <TabsTrigger
                value="6m"
                onClick={() => setPeriod("6m")}
                className={
                  period === "6m" ? "bg-primary text-primary-foreground" : ""
                }
              >
                6 Months
              </TabsTrigger>
              <TabsTrigger
                value="12m"
                onClick={() => setPeriod("12m")}
                className={
                  period === "12m" ? "bg-primary text-primary-foreground" : ""
                }
              >
                12 Months
              </TabsTrigger>
              <TabsTrigger
                value="all"
                onClick={() => setPeriod("all")}
                className={
                  period === "all" ? "bg-primary text-primary-foreground" : ""
                }
              >
                All Time
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Critical Suppliers
              </p>
              <h3 className="text-2xl font-bold">{criticalSuppliers}</h3>
              <p className="text-xs text-destructive flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />+
                {Math.floor(Math.random() * 10) + 5}% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
              <AlertTriangle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">At Risk Suppliers</p>
              <h3 className="text-2xl font-bold">{atRiskSuppliers}</h3>
              <p className="text-xs text-warning flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />+
                {Math.floor(Math.random() * 10) + 2}% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center text-warning">
              <Boxes />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Disrupted Routes</p>
              <h3 className="text-2xl font-bold">{disruptedRoutes}</h3>
              <p className="text-xs text-destructive flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />+
                {Math.floor(Math.random() * 10) + 8}% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
              <Truck />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delayed Routes</p>
              <h3 className="text-2xl font-bold">{delayedRoutes}</h3>
              <p className="text-xs text-warning flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />+
                {Math.floor(Math.random() * 10) + 3}% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center text-warning">
              <Clock />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Supply Chain Risk Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskTrendChart data={filteredRiskData()} title="" />
          </CardContent>
        </Card>

        {/* Tables */}
        <div className="xl:col-span-2">
          <MaterialShortageTable materials={materialShortages} />
        </div>
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>High-Risk Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers
                  .filter((supplier) => supplier.risk > 75)
                  .sort((a, b) => b.risk - a.risk)
                  .slice(0, 5)
                  .map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {supplier.location.country}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            supplier.risk > 80 ? "bg-destructive" : "bg-warning"
                          } mr-2`}
                        ></span>
                        <span
                          className={`font-medium ${
                            supplier.risk > 80
                              ? "text-destructive"
                              : "text-warning"
                          }`}
                        >
                          {supplier.risk}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <ProjectImpactTable projects={projectImpacts} />
        </div>
      </div>
    </div>
  );
}

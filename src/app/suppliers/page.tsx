"use client";

import { useState } from "react";
import { suppliers } from "@/lib/data/suppliers/suppliers";
import { Supplier } from "@/types/supplier";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowDownUp,
  Filter,
  Search,
  X,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { CCRAAssessmentView } from "@/components/analysis/CCRAAssessment";
import { evaluateSupplierCCRA } from "@/lib/analysis/ccra";

const Globe3D = dynamic(() => import("@/components/maps/Globe3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-900 flex items-center justify-center">
      <div className="text-gray-400">Loading globe visualization...</div>
    </div>
  ),
});

export default function SuppliersPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter suppliers based on search query, status, and tier
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || supplier.status === statusFilter;
    const matchesTier =
      tierFilter === "all" || supplier.tier === parseInt(tierFilter);
    return matchesSearch && matchesStatus && matchesTier;
  });

  // Sort suppliers based on selected criteria
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "risk":
        comparison = b.risk - a.risk;
        break;
      case "tier":
        comparison = a.tier - b.tier;
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate summary metrics
  const criticalSuppliers = suppliers.filter(
    (s) => s.status === "Critical"
  ).length;
  const atRiskSuppliers = suppliers.filter(
    (s) => s.status === "At Risk"
  ).length;
  const tier1Count = suppliers.filter((s) => s.tier === 1).length;
  const highRiskCount = suppliers.filter((s) => s.risk > 70).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supplier Network
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze supplier relationships and risks
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
                <h3 className="text-2xl font-bold">{suppliers.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {tier1Count} tier 1 suppliers
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Status</p>
                <h3 className="text-2xl font-bold">{criticalSuppliers}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((criticalSuppliers / suppliers.length) * 100)}% of
                  suppliers
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <h3 className="text-2xl font-bold">{atRiskSuppliers}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((atRiskSuppliers / suppliers.length) * 100)}% of
                  suppliers
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk Score</p>
                <h3 className="text-2xl font-bold">{highRiskCount}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Risk score &gt; 70%
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Globe View */}
      <Card>
        <CardContent className="p-0 h-[500px]">
          <Globe3D
            suppliers={suppliers}
            selectedSupplier={selectedSupplier}
            onSupplierSelect={setSelectedSupplier}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="1">Tier 1</SelectItem>
                <SelectItem value="2">Tier 2</SelectItem>
                <SelectItem value="3">Tier 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="On Track">On Track</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ArrowDownUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Supplier Name</SelectItem>
                <SelectItem value="risk">Risk Score</SelectItem>
                <SelectItem value="tier">Tier Level</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <ArrowDownUp
                className={`h-4 w-4 transition-transform ${
                  sortOrder === "desc" ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || statusFilter !== "all" || tierFilter !== "all") && (
          <div className="flex gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setStatusFilter("all")}
                />
              </Badge>
            )}
            {tierFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tier: {tierFilter}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setTierFilter("all")}
                />
              </Badge>
            )}
          </div>
        )}

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSuppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedSupplier(supplier)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{supplier.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {supplier.location.country}
                      </p>
                    </div>
                    <Badge variant="outline">Tier {supplier.tier}</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Risk Score
                      </span>
                      <Badge
                        variant={
                          supplier.risk > 70
                            ? "destructive"
                            : supplier.risk > 40
                            ? "warning"
                            : "outline"
                        }
                      >
                        {supplier.risk}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant={
                          supplier.status === "Critical"
                            ? "destructive"
                            : supplier.status === "At Risk"
                            ? "warning"
                            : "outline"
                        }
                      >
                        {supplier.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Materials
                      </span>
                      <span className="text-sm">
                        {supplier.materials.length} types
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Supplier</th>
                    <th className="text-left p-4">Tier</th>
                    <th className="text-left p-4">Location</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Risk Score</th>
                    <th className="text-left p-4">Materials</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedSupplier(supplier)}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {supplier.location.country}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">Tier {supplier.tier}</Badge>
                      </td>
                      <td className="p-4">{supplier.location.country}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            supplier.status === "Critical"
                              ? "destructive"
                              : supplier.status === "At Risk"
                              ? "warning"
                              : "outline"
                          }
                        >
                          {supplier.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            supplier.risk > 70
                              ? "destructive"
                              : supplier.risk > 40
                              ? "warning"
                              : "outline"
                          }
                        >
                          {supplier.risk}%
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {supplier.materials.map((material) => (
                            <Badge
                              key={material}
                              variant="secondary"
                              className="text-xs"
                            >
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supplier Details Dialog */}
      <Dialog
        open={!!selectedSupplier}
        onOpenChange={() => setSelectedSupplier(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSupplier && (
            <div className="space-y-6">
              <DialogTitle className="text-2xl font-bold">
                {selectedSupplier.name}
              </DialogTitle>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground">
                    {selectedSupplier.location.country}
                  </p>
                </div>
                <Badge variant="outline">Tier {selectedSupplier.tier}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Risk Score
                      </p>
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            selectedSupplier.risk > 70
                              ? "text-destructive"
                              : selectedSupplier.risk > 40
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        />
                        <span className="text-2xl font-bold">
                          {selectedSupplier.risk}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            selectedSupplier.status === "Critical"
                              ? "destructive"
                              : selectedSupplier.status === "At Risk"
                              ? "warning"
                              : "outline"
                          }
                        >
                          {selectedSupplier.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Materials</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSupplier.materials.map((material) => (
                          <Badge
                            key={material}
                            variant="secondary"
                            className="text-xs"
                          >
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add CCRA Assessment */}
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="climate">
                    Climate Risk Assessment
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  {/* Existing supplier details content */}
                </TabsContent>
                <TabsContent value="climate">
                  <CCRAAssessmentView
                    assessment={evaluateSupplierCCRA(selectedSupplier)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

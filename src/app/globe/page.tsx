"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { suppliers } from "@/lib/data/suppliers/suppliers";
import Globe3D from "@/components/maps/Globe3D";
import SupplierStats from "@/components/suppliers/SupplierStats";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobePage() {
  const [selectedSupplier, setSelectedSupplier] = useState<
    (typeof suppliers)[0] | null
  >(null);
  const [activeFilterTab, setActiveFilterTab] = useState("all");
  const [activeViewTab, setActiveViewTab] = useState("globe"); // globe, stats

  useEffect(() => {
    // Logging functions moved inside useEffect
    const logRouteTransition = () => {
      console.log("[Globe] Route transition:", {
        currentPath: window.location.pathname,
        referrer: document.referrer,
        navigationTimestamp: new Date().toISOString(),
      });
    };

    const logComponentMount = (component: string) => {
      console.log(`[Globe] ${component} mounted:`, {
        timestamp: new Date().toISOString(),
        pathname: window.location.pathname,
        dependencies: {
          suppliers: suppliers.length,
          hasGlobe: typeof Globe3D !== "undefined",
          hasStats: typeof SupplierStats !== "undefined",
        },
      });
    };

    logRouteTransition();
    logComponentMount("GlobePage");
  }, []);

  // Filter suppliers by tier
  const tier1Suppliers = suppliers.filter((s) => s.tier === 1);
  const tier2Suppliers = suppliers.filter((s) => s.tier === 2);
  const tier3Suppliers = suppliers.filter((s) => s.tier === 3);

  // Summary statistics
  const highRiskSuppliers = suppliers.filter((s) => s.risk > 70).length;
  const atRiskSuppliers = suppliers.filter(
    (s) => s.status === "At Risk"
  ).length;

  // Get filtered suppliers based on active tab
  const getFilteredSuppliers = () => {
    if (activeFilterTab === "tier1") {
      return tier1Suppliers;
    } else if (activeFilterTab === "tier2") {
      return tier2Suppliers;
    } else if (activeFilterTab === "tier3") {
      return tier3Suppliers;
    } else if (activeFilterTab === "high-risk") {
      return suppliers.filter((s) => s.risk > 70);
    }
    return suppliers;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            3D Supply Chain Globe
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive visualization of global supplier network
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="py-1 px-3 text-sm">
            {suppliers.length} Suppliers
          </Badge>
          <Badge variant="destructive" className="py-1 px-3 text-sm">
            {highRiskSuppliers} High Risk
          </Badge>
          <Badge
            variant="outline"
            className="py-1 px-3 text-sm bg-amber-500 text-white border-amber-500"
          >
            {atRiskSuppliers} At Risk
          </Badge>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Visualization Area */}
        <div className="lg:col-span-4">
          <Tabs
            value={activeViewTab}
            onValueChange={setActiveViewTab}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="globe">3D Globe View</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter: </span>
                <Tabs
                  value={activeFilterTab}
                  onValueChange={(value) => {
                    setActiveFilterTab(value);
                    setSelectedSupplier(null);
                  }}
                  className="w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="all" className="text-xs px-3 py-1">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="tier1" className="text-xs px-3 py-1">
                      Tier 1
                    </TabsTrigger>
                    <TabsTrigger value="tier2" className="text-xs px-3 py-1">
                      Tier 2
                    </TabsTrigger>
                    <TabsTrigger value="tier3" className="text-xs px-3 py-1">
                      Tier 3
                    </TabsTrigger>
                    <TabsTrigger
                      value="high-risk"
                      className="text-xs px-3 py-1"
                    >
                      High Risk
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeViewTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TabsContent value="globe" className="mt-0">
                  <Card className="h-[750px] border-t-0 rounded-tl-none">
                    <CardContent className="p-0 h-full">
                      <Globe3D
                        key={activeFilterTab}
                        suppliers={getFilteredSuppliers()}
                        onSupplierSelect={setSelectedSupplier}
                        selectedSupplier={selectedSupplier}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats" className="mt-0">
                  <Card className="border-t-0 rounded-tl-none">
                    <CardContent className="p-6">
                      <SupplierStats suppliers={getFilteredSuppliers()} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

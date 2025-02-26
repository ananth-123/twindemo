// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorldMap from "@/components/maps/WorldMap";
import { suppliers } from "@/lib/data/suppliers/suppliers";
import { transportRoutes } from "@/lib/data/suppliers/routes";
import { climateEvents, ClimateEventType } from "@/lib/data/climate/events";

export default function MapPage() {
  // Filter state
  const [riskThreshold, setRiskThreshold] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTiers, setSelectedTiers] = useState({
    tier1: true,
    tier2: true,
    tier3: true,
  });
  const [selectedModes, setSelectedModes] = useState({
    sea: true,
    air: true,
    rail: true,
    road: true,
  });
  const [displayClimateEvents, setDisplayClimateEvents] = useState(true);
  const [selectedClimateTypes, setSelectedClimateTypes] = useState<{
    [key in ClimateEventType]: boolean;
  }>({
    storm: true,
    hurricane: true,
    flood: true,
    drought: true,
    wildfire: true,
    extreme_heat: true,
    extreme_cold: true,
    landslide: true,
    other: true,
  });
  const [activeMitigations, setActiveMitigations] = useState<string[]>([]);

  // Currently active tab
  const [activeTab, setActiveTab] = useState("supply-chain");

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if data is loaded
    if (suppliers && transportRoutes && climateEvents) {
      setIsLoading(false);
    }
  }, [suppliers, transportRoutes, climateEvents]);

  // Collect all unique materials from suppliers
  const allMaterials = suppliers
    ? Array.from(
        new Set(suppliers.flatMap((supplier) => supplier.materials))
      ).sort()
    : [];

  // Collect all unique mitigation actions from climate events
  const allMitigationActions = climateEvents
    ? Array.from(
        new Set(climateEvents.flatMap((event) => event.mitigationActions || []))
      ).sort()
    : [];

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers
    ? suppliers.filter((supplier) => {
        if (searchQuery) {
          return (
            supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.location.country
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
        }
        return true;
      })
    : [];

  // Filter routes based on search query
  const filteredRoutes = transportRoutes
    ? transportRoutes.filter((route) => {
        if (searchQuery) {
          return (
            route.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            route.to.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return true;
      })
    : [];

  // Filter climate events based on selected types
  const filteredClimateEvents = climateEvents
    ? climateEvents.filter((event) => {
        // Filter by event type
        if (!selectedClimateTypes[event.type]) {
          return false;
        }

        // Filter by search query if present
        if (searchQuery) {
          return (
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.countries.some((country) =>
              country.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        }

        return true;
      })
    : [];

  // Summary statistics
  const highRiskSuppliers = suppliers
    ? suppliers.filter((s) => s.risk > 70).length
    : 0;
  const activeRoutes = transportRoutes
    ? transportRoutes.filter((r) => r.status === "Active").length
    : 0;
  const disruptedRoutes = transportRoutes
    ? transportRoutes.filter((r) => r.status === "Disrupted").length
    : 0;
  const activeClimateEvents = climateEvents ? climateEvents.length : 0;
  const highImpactEvents = climateEvents
    ? climateEvents.filter((e) => e.severity >= 8).length
    : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Supply Chain Map</h1>
        </div>
        <div className="h-[600px] flex items-center justify-center bg-muted/10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Loading map data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Supply Chain Map</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="px-3 py-1">
            High Risk Suppliers: {highRiskSuppliers}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Active Routes: {activeRoutes}
          </Badge>
          <Badge variant="destructive" className="px-3 py-1">
            Disrupted Routes: {disruptedRoutes}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-blue-500/10">
            Climate Events: {activeClimateEvents}
          </Badge>
          <Badge variant="destructive" className="px-3 py-1">
            High Impact Events: {highImpactEvents}
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="supply-chain" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="supply-chain">Supply Chain Filters</TabsTrigger>
          <TabsTrigger value="climate">Climate Event Filters</TabsTrigger>
        </TabsList>

        {/* Supply Chain Filters */}
        <TabsContent value="supply-chain">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Supply Chain Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search suppliers or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Risk Threshold */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium">
                      Risk Threshold
                    </label>
                    <span className="text-sm">{riskThreshold}%</span>
                  </div>
                  <Slider
                    value={[riskThreshold]}
                    onValueChange={(value) => setRiskThreshold(value[0])}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Materials Filter */}
                <div>
                  <label className="text-sm font-medium">Material</label>
                  <Select
                    value={selectedMaterial}
                    onValueChange={setSelectedMaterial}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Materials</SelectItem>
                      {allMaterials.map((material) => (
                        <SelectItem key={material} value={material}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Supply Tiers */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Supply Tiers</label>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tier1"
                        checked={selectedTiers.tier1}
                        onCheckedChange={(checked) =>
                          setSelectedTiers({
                            ...selectedTiers,
                            tier1: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="tier1"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tier 1 (Direct)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tier2"
                        checked={selectedTiers.tier2}
                        onCheckedChange={(checked) =>
                          setSelectedTiers({
                            ...selectedTiers,
                            tier2: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="tier2"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tier 2 (Secondary)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tier3"
                        checked={selectedTiers.tier3}
                        onCheckedChange={(checked) =>
                          setSelectedTiers({
                            ...selectedTiers,
                            tier3: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="tier3"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tier 3 (Tertiary)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Transport Modes */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-sm font-medium">Transport Modes</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sea"
                        checked={selectedModes.sea}
                        onCheckedChange={(checked) =>
                          setSelectedModes({
                            ...selectedModes,
                            sea: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="sea"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sea Freight
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="air"
                        checked={selectedModes.air}
                        onCheckedChange={(checked) =>
                          setSelectedModes({
                            ...selectedModes,
                            air: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="air"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Air Freight
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rail"
                        checked={selectedModes.rail}
                        onCheckedChange={(checked) =>
                          setSelectedModes({
                            ...selectedModes,
                            rail: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="rail"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Rail Freight
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="road"
                        checked={selectedModes.road}
                        onCheckedChange={(checked) =>
                          setSelectedModes({
                            ...selectedModes,
                            road: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="road"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Road Freight
                      </label>
                    </div>
                  </div>
                </div>

                {/* Display Climate Events Toggle */}
                <div className="lg:col-span-2 flex items-start pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showClimateEvents"
                      checked={displayClimateEvents}
                      onCheckedChange={(checked) =>
                        setDisplayClimateEvents(checked === true)
                      }
                    />
                    <label
                      htmlFor="showClimateEvents"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show Climate Events on Map
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Climate Event Filters */}
        <TabsContent value="climate">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Climate Event Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Event Types */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Types</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="storm"
                        checked={selectedClimateTypes.storm}
                        onCheckedChange={(checked) =>
                          setSelectedClimateTypes({
                            ...selectedClimateTypes,
                            storm: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="storm"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Storms
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hurricane"
                        checked={selectedClimateTypes.hurricane}
                        onCheckedChange={(checked) =>
                          setSelectedClimateTypes({
                            ...selectedClimateTypes,
                            hurricane: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="hurricane"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Hurricanes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="flood"
                        checked={selectedClimateTypes.flood}
                        onCheckedChange={(checked) =>
                          setSelectedClimateTypes({
                            ...selectedClimateTypes,
                            flood: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="flood"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Floods
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="drought"
                        checked={selectedClimateTypes.drought}
                        onCheckedChange={(checked) =>
                          setSelectedClimateTypes({
                            ...selectedClimateTypes,
                            drought: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="drought"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Droughts
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wildfire"
                        checked={selectedClimateTypes.wildfire}
                        onCheckedChange={(checked) =>
                          setSelectedClimateTypes({
                            ...selectedClimateTypes,
                            wildfire: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="wildfire"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Wildfires
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="extreme_heat"
                        checked={selectedClimateTypes.extreme_heat}
                        onCheckedChange={(checked) =>
                          setSelectedClimateTypes({
                            ...selectedClimateTypes,
                            extreme_heat: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="extreme_heat"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Extreme Heat
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="extreme_cold"
                        checked={selectedClimateTypes.extreme_cold}
                        onCheckedChange={(checked) =>
                          setSelectedClimateTypes({
                            ...selectedClimateTypes,
                            extreme_cold: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="extreme_cold"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Extreme Cold
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="landslide"
                        checked={selectedClimateTypes.landslide}
                        onCheckedChange={(checked) =>
                          setSelectedClimateTypes({
                            ...selectedClimateTypes,
                            landslide: checked === true,
                          })
                        }
                      />
                      <label
                        htmlFor="landslide"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Landslides
                      </label>
                    </div>
                  </div>
                </div>

                {/* Event Severity Slider */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium">
                      Minimum Severity
                    </label>
                    <span className="text-sm">{riskThreshold / 10}/10</span>
                  </div>
                  <Slider
                    value={[riskThreshold]}
                    onValueChange={(value) => setRiskThreshold(value[0])}
                    max={100}
                    step={10}
                  />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Mitigation Actions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Active Mitigations
                  </label>
                  <div className="h-[150px] overflow-y-auto border rounded-md p-2">
                    {allMitigationActions.map((action) => (
                      <div
                        key={action}
                        className="flex items-center space-x-2 py-1"
                      >
                        <Checkbox
                          id={`action-${action}`}
                          checked={activeMitigations.includes(action)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setActiveMitigations([
                                ...activeMitigations,
                                action,
                              ]);
                            } else {
                              setActiveMitigations(
                                activeMitigations.filter((a) => a !== action)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`action-${action}`}
                          className="text-xs leading-tight"
                        >
                          {action}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Map */}
      <Card className="h-[600px] overflow-hidden">
        <CardContent className="p-0 h-full">
          <WorldMap
            suppliers={filteredSuppliers}
            routes={filteredRoutes}
            climateEvents={displayClimateEvents ? filteredClimateEvents : []}
            selectedMaterial={selectedMaterial}
            selectedTiers={selectedTiers}
            selectedModes={selectedModes}
            riskThreshold={riskThreshold}
          />
        </CardContent>
      </Card>
    </div>
  );
}

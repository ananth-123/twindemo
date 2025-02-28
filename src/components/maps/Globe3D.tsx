"use client";

import { useRef, useEffect, useState } from "react";
import Globe from "globe.gl";
import { Supplier } from "@/lib/data/suppliers/suppliers";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

interface Globe3DProps {
  suppliers: Supplier[];
  onSupplierSelect: (supplier: Supplier | null) => void;
  selectedSupplier: Supplier | null;
  isSimulation?: boolean;
  selectedRegions?: Array<{ lat: number; lng: number; radius: number }>;
  onRegionClick?: (lat: number, lng: number) => void;
}

// Add new interfaces for climate risk data
interface ClimateEvent {
  type: "fire" | "flood" | "drought" | "storm";
  severity: number;
  coordinates: [number, number];
  description: string;
  timestamp: string;
}

interface ClimateRiskLayer {
  events: ClimateEvent[];
  lastUpdated: string;
  source: string;
}

// Add new interfaces for enhanced visualization
interface ClimateVisualizationConfig {
  baseAltitude: number;
  maxAltitude: number;
  particleCount: number;
  ringCount: number;
  animationDuration: number;
}

const CLIMATE_CONFIG: ClimateVisualizationConfig = {
  baseAltitude: 0.3,
  maxAltitude: 1.0,
  particleCount: 200,
  ringCount: 3,
  animationDuration: 2000,
};

// Add diagnostic logging function
const logClimateData = (data: ClimateRiskLayer) => {
  console.log("Climate Risk Layer Update:", {
    eventCount: data.events.length,
    lastUpdated: data.lastUpdated,
    source: data.source,
    eventTypes: data.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  });
};

// Add test data for validation
const testClimateData: ClimateRiskLayer = {
  events: [
    {
      type: "fire",
      severity: 0.8,
      coordinates: [2.3522, 48.8566], // Paris
      description: "Test fire event",
      timestamp: new Date().toISOString(),
    },
  ],
  lastUpdated: new Date().toISOString(),
  source: "test",
};

// Add compatibility validation
const validateWorldMapCompatibility = (props: Globe3DProps) => {
  console.log("[Globe3D] Compatibility Check:", {
    timestamp: new Date().toISOString(),
    providedProps: Object.keys(props),
    requiredWorldMapProps: [
      "suppliers",
      "onSupplierSelect",
      "selectedSupplier",
      "routes",
      "climateEvents",
      "selectedMaterial",
      "selectedTiers",
      "selectedModes",
      "riskThreshold",
    ],
    compatibility: {
      hasAllRequiredProps: true, // Will be updated below
      missingProps: [] as string[],
      additionalProps: [] as string[],
    },
  });
};

export default function Globe3D({
  suppliers,
  onSupplierSelect,
  selectedSupplier,
  isSimulation = false,
  selectedRegions = [],
  onRegionClick,
}: Globe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const performanceRef = useRef({
    lastFrameTime: Date.now(),
    frameCount: 0,
    fps: 0,
    renderTime: 0,
  });
  const [isHoveringSupplier, setIsHoveringSupplier] = useState<Supplier | null>(
    null
  );
  const [climateData, setClimateData] = useState<ClimateRiskLayer | null>(null);
  const [showClimateEvents, setShowClimateEvents] = useState(true);

  // Optimized debug logging
  const addDebugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Globe3D] ${message}`, data);
    }
  };

  useEffect(() => {
    addDebugLog("Globe3D: Component mounted");

    if (!containerRef.current) return;

    // Initialize globe with optimized settings
    const globe = Globe()
      .globeImageUrl(
        "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      )
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .showGraticules(true)
      .showAtmosphere(true)
      .atmosphereColor("#3a228a")
      .atmosphereAltitude(0.25)
      .pointsData(suppliers)
      .pointLat((d) => d.location.coordinates[1])
      .pointLng((d) => d.location.coordinates[0])
      .pointColor((d) => {
        if (d === selectedSupplier) return "#ffffff";
        if (d.risk > 70) return "#ff3333";
        if (d.risk > 40) return "#ffaa00";
        return "#33cc33";
      })
      .pointAltitude((d) => (d === selectedSupplier ? 0.2 : 0.1))
      .pointRadius((d) => (d === selectedSupplier ? 0.35 : 0.25))
      .pointResolution(12)
      .pointsMerge(false) // Disable point merging to ensure proper selection
      .pointLabel(
        (d) => `
        <div class="bg-gray-900/90 p-2 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
          <div class="font-bold text-white">${d.name}</div>
          <div class="text-gray-300 text-sm">${d.location.country}</div>
        </div>
      `
      )
      .onPointClick((point, event) => {
        event.preventDefault();
        onSupplierSelect(point);
      })
      .onPointHover((point) => {
        setIsHoveringSupplier(point);
        if (containerRef.current) {
          containerRef.current.style.cursor = point ? "pointer" : "default";
        }
      })
      .onGlobeClick((coords: { lat: number; lng: number }) => {
        if (isSimulation && onRegionClick) {
          onRegionClick(coords.lat, coords.lng);
        }
      });

    // Add visualization for selected regions in simulation mode
    if (isSimulation && selectedRegions.length > 0) {
      const regionGeometries = selectedRegions.map((region) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [region.lng, region.lat],
        },
        properties: {
          radius: region.radius,
        },
      }));

      globe
        .ringsData(regionGeometries)
        .ringColor(() => "#ef4444")
        .ringMaxRadius("radius")
        .ringPropagationSpeed(1)
        .ringRepeatPeriod(3000);
    }

    // Set initial point of view
    globe.pointOfView({ lat: 30, lng: 10, altitude: 2.5 });

    // Performance monitoring
    let frameCount = 0;
    let lastTime = performance.now();

    const animate = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        performanceRef.current.fps = Math.round(
          (frameCount * 1000) / (currentTime - lastTime)
        );
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(animate);
    };

    animate();
    globe(containerRef.current);
    globeRef.current = globe;

    // Optimized resize handler
    const debouncedResize = debounce(() => {
      if (containerRef.current && globeRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        globeRef.current.width(width);
        globeRef.current.height(height);
      }
    }, 100);

    window.addEventListener("resize", debouncedResize);

    // Add logging for simulation mode
    if (isSimulation) {
      addDebugLog("Simulation Mode Active", {
        selectedRegions,
        supplierCount: suppliers.length,
      });
    }

    return () => {
      window.removeEventListener("resize", debouncedResize);
      if (globeRef.current) {
        globeRef.current = null;
      }
    };
  }, [
    suppliers,
    onSupplierSelect,
    selectedSupplier,
    isSimulation,
    selectedRegions,
    onRegionClick,
  ]);

  // Add effect to update points when suppliers change
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointsData(suppliers);
    }
  }, [suppliers]);

  // Add effect to update camera when supplier is selected
  useEffect(() => {
    if (globeRef.current && selectedSupplier) {
      const lat = selectedSupplier.location.coordinates[1];
      const lng = selectedSupplier.location.coordinates[0];
      globeRef.current.pointOfView({ lat, lng, altitude: 2.5 }, 1000);
    }
  }, [selectedSupplier]);

  // Debounce helper
  function debounce(fn: Function, ms: number) {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  useEffect(() => {
    validateWorldMapCompatibility({
      suppliers,
      onSupplierSelect,
      selectedSupplier,
    });
  }, [suppliers, onSupplierSelect, selectedSupplier]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full bg-gray-900 rounded-lg overflow-hidden"
        style={{ touchAction: "none" }}
      />

      {/* Climate Events Control Panel */}
      <div className="absolute top-4 left-4 bg-gray-900/90 p-4 rounded-lg backdrop-blur-sm border border-gray-800 shadow-xl">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showClimateEvents}
                onChange={(e) => setShowClimateEvents(e.target.checked)}
                className="form-checkbox h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white text-sm font-medium">
                Show Climate Events
              </span>
            </label>
          </div>

          {showClimateEvents && (
            <div className="space-y-2">
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-300">Fire Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs text-gray-300">Drought Risk</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Debug Panel */}
      <div className="absolute bottom-4 left-4 max-w-md max-h-48 overflow-auto bg-gray-900/90 text-white p-4 rounded-lg text-xs">
        <h3 className="font-bold mb-2">Visualization Debug:</h3>
        <div className="space-y-1">
          <div>FPS: {Math.round(performanceRef.current.fps)}</div>
          <div>Climate Layer: {showClimateEvents ? "Visible" : "Hidden"}</div>
          <div className="h-px bg-gray-700 my-2" />
          {/* Add any other relevant debug information here */}
        </div>
      </div>

      {/* Supplier Details Panel */}
      <AnimatePresence>
        {selectedSupplier && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 right-4 w-96 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-800 shadow-xl"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedSupplier.name}
                  </h3>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    {selectedSupplier.location.country}
                    <span>•</span>
                    Tier {selectedSupplier.tier}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                  onClick={() => onSupplierSelect(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Risk Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Risk Score</span>
                    <span
                      className={`text-sm font-bold ${
                        selectedSupplier.risk > 70
                          ? "text-red-400"
                          : selectedSupplier.risk > 40
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {selectedSupplier.risk}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedSupplier.risk > 70
                          ? "bg-red-500"
                          : selectedSupplier.risk > 40
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${selectedSupplier.risk}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      selectedSupplier.status === "Critical"
                        ? "text-red-400"
                        : selectedSupplier.status === "At Risk"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  />
                  <span className="text-sm text-gray-400">Status:</span>
                  <Badge
                    variant="outline"
                    className={`${
                      selectedSupplier.status === "Critical"
                        ? "border-red-500 text-red-400"
                        : selectedSupplier.status === "At Risk"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-green-500 text-green-400"
                    }`}
                  >
                    {selectedSupplier.status}
                  </Badge>
                </div>

                {/* Trend */}
                <div className="flex items-center gap-2">
                  {selectedSupplier.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  ) : selectedSupplier.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-green-400" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-400">Trend:</span>
                  <span
                    className={`text-sm ${
                      selectedSupplier.trend === "up"
                        ? "text-red-400"
                        : selectedSupplier.trend === "down"
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {selectedSupplier.trend === "up"
                      ? "Increasing Risk"
                      : selectedSupplier.trend === "down"
                      ? "Decreasing Risk"
                      : "Stable"}
                  </span>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Materials</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSupplier.materials.map((material, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-800 text-gray-200"
                      >
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Impact */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Impact:</span>
                  <Badge
                    variant="outline"
                    className={`${
                      selectedSupplier.impact === "High"
                        ? "border-red-500 text-red-400"
                        : selectedSupplier.impact === "Medium"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-green-500 text-green-400"
                    }`}
                  >
                    {selectedSupplier.impact} Impact
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Info Tooltip */}
      <AnimatePresence>
        {isHoveringSupplier && !selectedSupplier && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-800 shadow-xl p-3"
          >
            <div className="text-center">
              <p className="text-white font-medium">
                {isHoveringSupplier.name}
              </p>
              <p className="text-sm text-gray-400">
                {isHoveringSupplier.location.country}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

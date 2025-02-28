"use client";

import { useRef, useEffect, useState, useCallback, memo } from "react";
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
import dynamic from "next/dynamic";
import { Supplier } from "@/lib/data/suppliers/suppliers";
import type { GlobeInstance } from "globe.gl";

interface BaseRegion {
  lat: number;
  lng: number;
  radius: number;
}

interface Globe3DProps {
  suppliers: Supplier[];
  onSupplierSelect: (supplier: Supplier | null) => void;
  selectedSupplier: Supplier | null;
  isSimulation?: boolean;
  selectedRegions?: BaseRegion[];
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

const addDebugLog = (message: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message);
  }
};

// Memoized Supplier Tooltip component
const SupplierTooltip = memo(({ supplier }: { supplier: Supplier | null }) => {
  if (!supplier) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-800 shadow-xl p-3"
    >
      <div className="text-center">
        <p className="text-white font-medium">{supplier.name}</p>
        <p className="text-sm text-gray-400">{supplier.location.country}</p>
      </div>
    </motion.div>
  );
});
SupplierTooltip.displayName = "SupplierTooltip";

// Memoized Supplier Details Panel component
const SupplierDetailsPanel = memo(
  ({
    supplier,
    onClose,
  }: {
    supplier: Supplier | null;
    onClose: () => void;
  }) => {
    if (!supplier) return null;

    return (
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
              <h3 className="text-xl font-bold text-white">{supplier.name}</h3>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                {supplier.location.country}
                <span>•</span>
                Tier {supplier.tier}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={onClose}
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
                    supplier.risk > 70
                      ? "text-red-400"
                      : supplier.risk > 40
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {supplier.risk}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    supplier.risk > 70
                      ? "bg-red-500"
                      : supplier.risk > 40
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${supplier.risk}%` }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`h-4 w-4 ${
                  supplier.status === "Critical"
                    ? "text-red-400"
                    : supplier.status === "At Risk"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              />
              <span className="text-sm text-gray-400">Status:</span>
              <Badge
                variant="outline"
                className={`${
                  supplier.status === "Critical"
                    ? "border-red-500 text-red-400"
                    : supplier.status === "At Risk"
                    ? "border-yellow-500 text-yellow-400"
                    : "border-green-500 text-green-400"
                }`}
              >
                {supplier.status}
              </Badge>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-2">
              {supplier.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-red-400" />
              ) : supplier.trend === "down" ? (
                <TrendingDown className="h-4 w-4 text-green-400" />
              ) : (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-400">Trend:</span>
              <span
                className={`text-sm ${
                  supplier.trend === "up"
                    ? "text-red-400"
                    : supplier.trend === "down"
                    ? "text-green-400"
                    : "text-gray-400"
                }`}
              >
                {supplier.trend === "up"
                  ? "Increasing Risk"
                  : supplier.trend === "down"
                  ? "Decreasing Risk"
                  : "Stable"}
              </span>
            </div>

            {/* Materials */}
            <div>
              <h4 className="text-sm text-gray-400 mb-2">Materials</h4>
              <div className="flex flex-wrap gap-2">
                {supplier.materials.map((material, index) => (
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
                  supplier.impact === "High"
                    ? "border-red-500 text-red-400"
                    : supplier.impact === "Medium"
                    ? "border-yellow-500 text-yellow-400"
                    : "border-green-500 text-green-400"
                }`}
              >
                {supplier.impact} Impact
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);
SupplierDetailsPanel.displayName = "SupplierDetailsPanel";

// Create a wrapper component for Globe
const loadGlobe = async () => {
  if (typeof window === "undefined") return null;
  // Using dynamic import instead of require
  const Globe = (await import("globe.gl")).default;
  return Globe;
};

// Dynamically import the wrapper with no SSR
const GlobeLazy = dynamic(
  () => loadGlobe() as Promise<typeof import("globe.gl")["default"]>,
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading globe visualization...</div>
      </div>
    ),
  }
);

const Globe3D = memo(
  ({
    suppliers,
    onSupplierSelect,
    selectedSupplier,
    isSimulation = false,
    selectedRegions = [],
    onRegionClick,
  }: Globe3DProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const globeRef = useRef<GlobeInstance | null>(null);
    const performanceRef = useRef({
      lastFrameTime: Date.now(),
      frameCount: 0,
      fps: 0,
      renderTime: 0,
    });
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const lastRunRef = useRef<number>(0);

    const [isClient, setIsClient] = useState(false);
    const [isHoveringSupplier, setIsHoveringSupplier] =
      useState<Supplier | null>(null);
    const [showClimateEvents, setShowClimateEvents] = useState(true);

    const handleSupplierHover = useCallback(
      (supplier: Supplier | null) => {
        console.log("handleSupplierHover called with supplier:", supplier?.id);
        const now = Date.now();

        if (now - lastRunRef.current >= 50) {
          console.log("Executing immediately due to throttle condition");
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
          }
          setIsHoveringSupplier(supplier);
          lastRunRef.current = now;
        } else {
          console.log("Debouncing execution");
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
          }
          timeoutIdRef.current = setTimeout(() => {
            console.log("Executing delayed hover with supplier:", supplier?.id);
            setIsHoveringSupplier(supplier);
            lastRunRef.current = Date.now();
          }, 50);
        }
      },
      [] // Empty dependency array since we're using refs for mutable state
    );

    const getPointColor = useCallback(
      (d: Supplier) => {
        if (d === selectedSupplier) return "#ffffff";
        if (d.risk > 70) return "#ff3333";
        if (d.risk > 40) return "#ffaa00";
        return "#33cc33";
      },
      [selectedSupplier]
    );

    const getPointAltitude = useCallback(
      (d: Supplier) => {
        if (d === selectedSupplier) return 0.2;
        if (d === isHoveringSupplier) return 0.15;
        return 0.1;
      },
      [selectedSupplier, isHoveringSupplier]
    );

    const getPointRadius = useCallback(
      (d: Supplier) => {
        if (d === selectedSupplier) return 0.4;
        if (d === isHoveringSupplier) return 0.35;
        return 0.25;
      },
      [selectedSupplier, isHoveringSupplier]
    );

    // Client-side initialization
    useEffect(() => {
      setIsClient(true);
    }, []);

    // Globe initialization effect
    useEffect(() => {
      if (!isClient || !containerRef.current) return;

      const initGlobe = async () => {
        const Globe = await loadGlobe();
        if (!Globe || !containerRef.current) return;

        // Initialize the globe
        const globe = Globe()(containerRef.current);
        globeRef.current = globe;

        // Configure the globe
        globe
          .globeImageUrl(
            "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          )
          .bumpImageUrl(
            "//unpkg.com/three-globe/example/img/earth-topology.png"
          )
          .backgroundImageUrl(
            "//unpkg.com/three-globe/example/img/night-sky.png"
          )
          .showGraticules(true)
          .showAtmosphere(true)
          .atmosphereColor("#3a228a")
          .atmosphereAltitude(0.25)
          .pointsData(suppliers)
          .pointLat((d: Supplier) => d.location.coordinates[1])
          .pointLng((d: Supplier) => d.location.coordinates[0])
          .pointColor(getPointColor)
          .pointAltitude(getPointAltitude)
          .pointRadius(getPointRadius)
          .pointResolution(24)
          .pointsMerge(false)
          .onPointHover(handleSupplierHover)
          .onPointClick((obj: Supplier, event: MouseEvent) => {
            event.preventDefault();
            onSupplierSelect(obj);
          })
          .onGlobeClick((coords: { lat: number; lng: number }) => {
            if (isSimulation && onRegionClick) {
              onRegionClick(coords.lat, coords.lng);
            }
          });

        // Set initial point of view
        globe.pointOfView({ lat: 30, lng: 10, altitude: 2.5 });
      };

      initGlobe();

      return () => {
        if (globeRef.current) {
          globeRef.current = null;
        }
        // Clean up region circles
        if (containerRef.current) {
          const circles =
            containerRef.current.getElementsByClassName("rounded-full");
          while (circles.length > 0) {
            circles[0].remove();
          }
        }
      };
    }, [
      isClient,
      suppliers,
      selectedSupplier,
      isHoveringSupplier,
      handleSupplierHover,
      getPointColor,
      getPointAltitude,
      getPointRadius,
      onSupplierSelect,
      isSimulation,
      selectedRegions,
      onRegionClick,
    ]);

    // Update points when suppliers change
    useEffect(() => {
      if (globeRef.current) {
        globeRef.current.pointsData(suppliers);
      }
    }, [suppliers]);

    // Update camera when supplier is selected
    useEffect(() => {
      if (globeRef.current && selectedSupplier) {
        const lat = selectedSupplier.location.coordinates[1];
        const lng = selectedSupplier.location.coordinates[0];
        globeRef.current.pointOfView({ lat, lng, altitude: 2.5 }, 1000);
      }
    }, [selectedSupplier]);

    // Compatibility validation
    useEffect(() => {
      validateWorldMapCompatibility({
        suppliers,
        onSupplierSelect,
        selectedSupplier,
      });
    }, [suppliers, onSupplierSelect, selectedSupplier]);

    if (!isClient) {
      return (
        <div
          ref={containerRef}
          className="w-full h-full bg-gray-900 flex items-center justify-center"
        >
          <div className="text-gray-400">Loading globe visualization...</div>
        </div>
      );
    }

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

        <AnimatePresence>
          {selectedSupplier && (
            <SupplierDetailsPanel
              supplier={selectedSupplier}
              onClose={() => onSupplierSelect(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isHoveringSupplier && !selectedSupplier && (
            <SupplierTooltip supplier={isHoveringSupplier} />
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Globe3D.displayName = "Globe3D";

// Debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  }) as T;
}

// Throttle and debounce helper
function throttleAndDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastRun = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRun >= delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      fn(...args);
      lastRun = now;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        fn(...args);
        lastRun = Date.now();
      }, delay);
    }
  }) as T;
}

export default Globe3D;

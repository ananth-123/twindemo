"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Supplier } from "@/lib/data/suppliers/suppliers";
import { TransportRoute } from "@/lib/data/suppliers/routes";
import { ClimateEvent } from "@/lib/data/climate/events";

interface WorldMapProps {
  suppliers: Supplier[];
  routes: TransportRoute[];
  climateEvents?: ClimateEvent[];
  selectedMaterial?: string;
  selectedTiers: {
    tier1: boolean;
    tier2: boolean;
    tier3: boolean;
  };
  selectedModes: {
    sea: boolean;
    air: boolean;
    rail: boolean;
    road: boolean;
  };
  riskThreshold: number;
}

export default function WorldMap({
  suppliers,
  routes,
  climateEvents = [],
  selectedMaterial,
  selectedTiers,
  selectedModes,
  riskThreshold,
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const routesGroupRef = useRef<THREE.Group | null>(null);
  const climateGroupRef = useRef<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSupplier, setHoveredSupplier] = useState<Supplier | null>(null);

  // Filter suppliers based on selected criteria
  const filteredSuppliers = suppliers.filter((supplier) => {
    // Filter by tier
    if (
      (supplier.tier === 1 && !selectedTiers.tier1) ||
      (supplier.tier === 2 && !selectedTiers.tier2) ||
      (supplier.tier === 3 && !selectedTiers.tier3)
    ) {
      return false;
    }

    // Filter by risk threshold
    if (supplier.risk < riskThreshold) {
      return false;
    }

    // Filter by material
    if (
      selectedMaterial &&
      selectedMaterial !== "all" &&
      !supplier.materials.some((m) =>
        m.toLowerCase().includes(selectedMaterial.toLowerCase())
      )
    ) {
      return false;
    }

    return true;
  });

  // Filter routes based on selected criteria
  const filteredRoutes = routes.filter((route) => {
    // Filter by transport mode
    if (
      (route.mode === "sea" && !selectedModes.sea) ||
      (route.mode === "air" && !selectedModes.air) ||
      (route.mode === "rail" && !selectedModes.rail) ||
      (route.mode === "road" && !selectedModes.road)
    ) {
      return false;
    }

    // Filter by risk threshold
    if (route.risk < riskThreshold) {
      return false;
    }

    // Filter by material
    if (
      selectedMaterial &&
      selectedMaterial !== "all" &&
      !route.materials.some((m) =>
        m.toLowerCase().includes(selectedMaterial.toLowerCase())
      )
    ) {
      return false;
    }

    return true;
  });

  // Convert lat/long to 3D coordinates on a sphere
  const latLongToVector3 = (lat: number, long: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  };

  // Create a curve between two points for route visualization
  const createCurve = (
    start: THREE.Vector3,
    end: THREE.Vector3,
    height: number
  ) => {
    // Calculate middle point with an elevation for the arc
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);

    // Add height based on distance
    const adjustedHeight = height * (distance / 10) + 0.1;
    mid.normalize().multiplyScalar(1 + adjustedHeight);

    // Create a quadratic bezier curve
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color("#111827"); // Dark background

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        60,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 2.5;
      cameraRef.current = camera;

      // Create renderer with antialiasing and better shadows
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Create Earth
      const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

      // Create groups for organization
      const markersGroup = new THREE.Group();
      scene.add(markersGroup);
      markersGroupRef.current = markersGroup;

      const routesGroup = new THREE.Group();
      scene.add(routesGroup);
      routesGroupRef.current = routesGroup;

      const climateGroup = new THREE.Group();
      scene.add(climateGroup);
      climateGroupRef.current = climateGroup;

      // Load Earth textures with better error handling
      const textureLoader = new THREE.TextureLoader();
      textureLoader.crossOrigin = "anonymous";

      const loadTexture = (
        url: string,
        fallbackColor: string
      ): Promise<THREE.Texture> => {
        return new Promise((resolve) => {
          textureLoader.load(
            url,
            (texture) => {
              texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
              resolve(texture);
            },
            undefined,
            () => {
              console.warn(`Failed to load texture: ${url}, using fallback`);
              const canvas = document.createElement("canvas");
              canvas.width = 2;
              canvas.height = 2;
              const context = canvas.getContext("2d");
              if (context) {
                context.fillStyle = fallbackColor;
                context.fillRect(0, 0, 2, 2);
              }
              resolve(new THREE.CanvasTexture(canvas));
            }
          );
        });
      };

      Promise.all([
        loadTexture("/earth-blue-marble.jpg", "#1a2d50"),
        loadTexture("/earth-specular.jpg", "#111827"),
        loadTexture("/earth-normal.jpg", "#808080"),
      ])
        .then(([earthTexture, specularMap, normalMap]) => {
          const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture,
            specularMap: specularMap,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(0.5, 0.5),
            shininess: 5,
          });

          const earth = new THREE.Mesh(earthGeometry, earthMaterial);
          scene.add(earth);
          earthRef.current = earth;

          // Add ambient light
          const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
          scene.add(ambientLight);

          // Add directional light (sun-like)
          const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.set(5, 3, 5);
          scene.add(directionalLight);

          // Add controls with better touch support
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.rotateSpeed = 0.5;
          controls.minDistance = 1.5;
          controls.maxDistance = 5;
          controls.enablePan = false;
          controls.enableZoom = true;
          controls.zoomSpeed = 0.5;
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.5;
          controlsRef.current = controls;

          // Setup raycaster for interaction
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();

          containerRef.current?.addEventListener("mousemove", (event) => {
            if (!containerRef.current) return;

            // Calculate mouse position in normalized device coordinates
            const rect = containerRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Update the raycaster
            raycaster.setFromCamera(mouse, camera);

            // Find intersections with supplier markers
            const intersects = raycaster.intersectObjects(
              markersGroupRef.current?.children || []
            );

            if (intersects.length > 0) {
              // @ts-ignore - we're adding userData to the mesh
              const supplierData = intersects[0].object.userData.supplier;
              setHoveredSupplier(supplierData);
              document.body.style.cursor = "pointer";
            } else {
              setHoveredSupplier(null);
              document.body.style.cursor = "default";
            }
          });

          // Update visualization with the filtered data
          updateVisualization();

          // Animation loop
          const animate = () => {
            requestAnimationFrame(animate);
            if (controlsRef.current) {
              controlsRef.current.update();
            }

            // Slightly rotate the earth for a dynamic effect
            if (earthRef.current) {
              earthRef.current.rotation.y += 0.0005;
            }

            // Animate routes
            if (routesGroupRef.current) {
              routesGroupRef.current.children.forEach((child, index) => {
                if (child instanceof THREE.Line) {
                  const material = child.material as THREE.LineBasicMaterial;
                  const time = Date.now() * 0.001;
                  const pulseRate = 0.5 + Math.sin(time * 2 + index) * 0.2;
                  material.opacity = pulseRate;
                }
              });
            }

            renderer.render(scene, camera);
          };

          animate();
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading textures:", err);
          setError("Failed to load globe textures");
          setIsLoading(false);
        });

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current)
          return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      };

      window.addEventListener("resize", handleResize);

      // Clean up
      return () => {
        window.removeEventListener("resize", handleResize);
        if (rendererRef.current && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
          rendererRef.current.dispose();
        }
        if (controlsRef.current) {
          controlsRef.current.dispose();
        }
      };
    } catch (error) {
      console.error("Error initializing globe:", error);
      setError(
        error instanceof Error ? error.message : "Failed to initialize globe"
      );
      setIsLoading(false);
    }
  }, []);

  // Update visualization when filters change
  const updateVisualization = () => {
    if (
      !markersGroupRef.current ||
      !routesGroupRef.current ||
      !climateGroupRef.current
    )
      return;

    // Clear previous markers
    while (markersGroupRef.current.children.length > 0) {
      markersGroupRef.current.remove(markersGroupRef.current.children[0]);
    }

    // Clear previous routes
    while (routesGroupRef.current.children.length > 0) {
      routesGroupRef.current.remove(routesGroupRef.current.children[0]);
    }

    // Clear previous climate events
    while (climateGroupRef.current.children.length > 0) {
      climateGroupRef.current.remove(climateGroupRef.current.children[0]);
    }

    // Add supplier markers
    filteredSuppliers.forEach((supplier) => {
      const { lat, lng } = supplier.location.coordinates;
      const position = latLongToVector3(lat, lng, 1.02); // Slightly above Earth surface

      // Create marker based on supplier tier and risk
      const markerGeometry = new THREE.SphereGeometry(
        0.01 + supplier.tier * 0.005, // Size based on tier
        16,
        16
      );

      const markerMaterial = new THREE.MeshBasicMaterial({
        color: getSupplierColor(supplier),
        transparent: true,
        opacity: 0.8,
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);

      // Add supplier data to the marker for interaction
      marker.userData = { supplier };

      markersGroupRef.current.add(marker);

      // Add a pulsing effect with a ring around important suppliers
      if (supplier.tier === 1 || supplier.risk > 80) {
        const ringGeometry = new THREE.RingGeometry(0.02, 0.023, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: getSupplierColor(supplier),
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.lookAt(0, 0, 0); // Orient the ring to face the earth's center

        // Animation for the ring
        const pulseAnimation = () => {
          if (!ring) return;

          const time = Date.now() * 0.001;
          ringMaterial.opacity = 0.3 + Math.sin(time * 2) * 0.2;
          requestAnimationFrame(pulseAnimation);
        };

        pulseAnimation();
        markersGroupRef.current.add(ring);
      }
    });

    // Add routes
    filteredRoutes.forEach((route) => {
      const startCoords = route.from.coordinates;
      const endCoords = route.to.coordinates;

      const startPosition = latLongToVector3(
        startCoords.lat,
        startCoords.lng,
        1.02
      );
      const endPosition = latLongToVector3(endCoords.lat, endCoords.lng, 1.02);

      // Create the route curve
      const curve = createCurve(startPosition, endPosition, 0.05);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // Create material based on transport mode and risk
      const material = new THREE.LineBasicMaterial({
        color: getRouteColor(route),
        transparent: true,
        opacity: 0.7,
        linewidth: route.tier === 1 ? 3 : 1, // Thicker lines for important routes
      });

      const routeLine = new THREE.Line(geometry, material);
      routeLine.userData = { route };

      routesGroupRef.current.add(routeLine);

      // Add animated flow indicators along the route
      const flowGeometry = new THREE.SphereGeometry(0.005, 8, 8);
      const flowMaterial = new THREE.MeshBasicMaterial({
        color: getRouteColor(route),
        transparent: true,
        opacity: 0.8,
      });

      // Create multiple flow indicators with different phases
      for (let i = 0; i < 3; i++) {
        const flow = new THREE.Mesh(flowGeometry, flowMaterial.clone());

        // Animation for the flow
        const moveFlow = () => {
          const time = Date.now() * 0.0005;
          const phase = i / 3; // Distribute phases evenly
          const t = (time + phase) % 1;

          const pos = curve.getPointAt(t);
          flow.position.copy(pos);

          requestAnimationFrame(moveFlow);
        };

        moveFlow();
        routesGroupRef.current.add(flow);
      }
    });

    // Add climate events visualization
    climateEvents.forEach((event) => {
      const { lat, lng } = event.location.coordinates;
      const position = latLongToVector3(lat, lng, 1.04); // Above the Earth

      // Create different visualizations based on event type
      if (event.type === "storm" || event.type === "hurricane") {
        // Spiral for hurricanes/storms
        const curve = new THREE.CurvePath();
        const center = position.clone();

        for (let i = 0; i < 5; i++) {
          const radius = 0.02 + i * 0.01;
          const segments = 32;
          const points = [];

          for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            const x = center.x + Math.cos(angle) * radius;
            const y = center.y;
            const z = center.z + Math.sin(angle) * radius;
            points.push(new THREE.Vector3(x, y, z));
          }

          const spline = new THREE.CatmullRomCurve3(points);
          curve.add(spline);
        }

        const points = curve.getPoints(200);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material = new THREE.LineBasicMaterial({
          color: 0x00aaff,
          transparent: true,
          opacity: 0.7,
        });

        const stormLine = new THREE.Line(geometry, material);
        climateGroupRef.current.add(stormLine);
      } else if (event.type === "flood") {
        // Circle for floods
        const geometry = new THREE.CircleGeometry(event.severity * 0.03, 32);
        const material = new THREE.MeshBasicMaterial({
          color: 0x0088ff,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        });

        const circle = new THREE.Mesh(geometry, material);
        circle.position.copy(position);
        circle.lookAt(0, 0, 0); // Orient to face the earth's center

        climateGroupRef.current.add(circle);
      } else if (event.type === "drought" || event.type === "wildfire") {
        // Heatmap-like visualization for droughts/wildfires
        const size = event.severity * 0.05;
        const geometry = new THREE.PlaneGeometry(size, size);

        const material = new THREE.MeshBasicMaterial({
          color: event.type === "wildfire" ? 0xff5500 : 0xffaa00,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.position.copy(position);
        plane.lookAt(0, 0, 0); // Orient to face the earth's center

        climateGroupRef.current.add(plane);
      }
    });
  };

  // Update visualization when filtered data changes
  useEffect(() => {
    if (isLoading) return;
    updateVisualization();
  }, [filteredSuppliers, filteredRoutes, climateEvents, isLoading]);

  function getSupplierColor(supplier: Supplier) {
    if (supplier.risk >= 80) return 0xef4444; // High risk - red
    if (supplier.risk >= 50) return 0xf59e0b; // Medium risk - amber
    return 0x22c55e; // Low risk - green
  }

  function getRouteColor(route: TransportRoute) {
    // Color by transport mode
    if (route.mode === "sea") return 0x3b82f6; // Blue for sea
    if (route.mode === "air") return 0x8b5cf6; // Purple for air
    if (route.mode === "rail") return 0xef4444; // Red for rail
    if (route.mode === "road") return 0xf59e0b; // Amber for road

    // Fallback
    return 0xcccccc;
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="text-sm text-muted-foreground">
            Loading globe...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <span className="text-sm">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Tooltip for hovered supplier */}
      {hoveredSupplier && (
        <div
          className="absolute bg-black/80 text-white p-2 rounded-md shadow-lg pointer-events-none"
          style={{
            left: `${Math.min(
              window.innerWidth - 200,
              Math.max(10, window.event?.clientX || 0)
            )}px`,
            top: `${Math.min(
              window.innerHeight - 200,
              Math.max(10, window.event?.clientY || 0)
            )}px`,
          }}
        >
          <div className="font-medium">{hoveredSupplier.name}</div>
          <div className="text-xs">Tier: {hoveredSupplier.tier}</div>
          <div className="text-xs">Risk: {hoveredSupplier.risk}%</div>
          <div className="text-xs">Status: {hoveredSupplier.status}</div>
          <div className="text-xs">
            Materials: {hoveredSupplier.materials.join(", ")}
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-black/80 dark:bg-gray-800/90 p-3 rounded-md shadow-md text-xs space-y-2 max-w-[200px]">
        <div className="font-medium pb-1 border-b">Legend</div>

        {/* Supplier Risk Legend */}
        <div>
          <div className="font-medium mb-1">Supplier Risk</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
            <span>High Risk (&gt;80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <span>Medium Risk (&gt;50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
            <span>Low Risk (&lt;50%)</span>
          </div>
        </div>

        {/* Transport Mode Legend */}
        <div>
          <div className="font-medium mb-1">Transport Mode</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
            <span>Sea</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
            <span>Air</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
            <span>Rail</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <span>Road</span>
          </div>
        </div>
      </div>
    </div>
  );
}

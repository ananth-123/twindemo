// Climate event types for supply chain disruptions
export type ClimateEventType =
  | "storm"
  | "hurricane"
  | "flood"
  | "drought"
  | "wildfire"
  | "extreme_heat"
  | "extreme_cold"
  | "landslide"
  | "other";

// Severity levels (1-10)
export type SeverityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Climate event interface
export interface ClimateEvent {
  id: string;
  name: string;
  type: ClimateEventType;
  severity: SeverityLevel;
  startDate: Date;
  endDate?: Date;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    radius: number; // Affected radius in kilometers
    countries: string[]; // Affected countries
  };
  affectedSuppliers: string[]; // IDs of suppliers affected
  affectedRoutes: string[]; // IDs of routes affected
  description: string;
  source: string; // Data source (e.g., "Copernicus Emergency Mapping")
  mitigationActions?: string[]; // Suggested actions for mitigation
  riskScore: number; // 0-100 score of overall risk to supply chain
}

// Mock climate events data
export const climateEvents: ClimateEvent[] = [
  {
    id: "ce-001",
    name: "Hurricane Maria",
    type: "hurricane",
    severity: 9,
    startDate: new Date("2023-08-15"),
    endDate: new Date("2023-08-20"),
    location: {
      coordinates: {
        lat: 18.2,
        lng: -66.5,
      },
      radius: 250,
      countries: ["Puerto Rico", "Dominican Republic", "US Virgin Islands"],
    },
    affectedSuppliers: ["s-001", "s-012", "s-023"],
    affectedRoutes: ["r-005", "r-017", "r-033"],
    description:
      "Category 4 hurricane affecting Caribbean logistics and manufacturing facilities",
    source: "Copernicus Emergency Management Service",
    mitigationActions: [
      "Activate alternative transport routes",
      "Deploy emergency response teams",
      "Contact Tier 2 suppliers for temporary material sourcing",
    ],
    riskScore: 87,
  },
  {
    id: "ce-002",
    name: "Central European Floods",
    type: "flood",
    severity: 7,
    startDate: new Date("2023-07-10"),
    endDate: new Date("2023-07-25"),
    location: {
      coordinates: {
        lat: 50.1,
        lng: 14.4,
      },
      radius: 300,
      countries: ["Germany", "Czech Republic", "Austria", "Poland"],
    },
    affectedSuppliers: ["s-007", "s-028", "s-042"],
    affectedRoutes: ["r-011", "r-029", "r-038"],
    description:
      "Severe flooding affecting road and rail infrastructure across Central Europe",
    source: "Copernicus Emergency Management Service",
    mitigationActions: [
      "Shift to air freight for critical components",
      "Increase inventory of affected materials",
      "Engage with local authorities on infrastructure recovery",
    ],
    riskScore: 72,
  },
  {
    id: "ce-003",
    name: "California Wildfires",
    type: "wildfire",
    severity: 8,
    startDate: new Date("2023-09-05"),
    location: {
      coordinates: {
        lat: 34.1,
        lng: -118.3,
      },
      radius: 150,
      countries: ["United States"],
    },
    affectedSuppliers: ["s-015", "s-031"],
    affectedRoutes: ["r-022", "r-044"],
    description:
      "Extensive wildfires affecting manufacturing and distribution facilities in California",
    source: "Copernicus Emergency Management Service",
    mitigationActions: [
      "Activate disaster recovery plan",
      "Relocate inventory from at-risk warehouses",
      "Implement alternative production sites",
    ],
    riskScore: 83,
  },
  {
    id: "ce-004",
    name: "Southeast Asian Drought",
    type: "drought",
    severity: 6,
    startDate: new Date("2023-03-10"),
    location: {
      coordinates: {
        lat: 14.1,
        lng: 100.5,
      },
      radius: 400,
      countries: ["Thailand", "Vietnam", "Cambodia"],
    },
    affectedSuppliers: ["s-019", "s-027", "s-036"],
    affectedRoutes: ["r-007", "r-018"],
    description:
      "Severe drought affecting agriculture and water-dependent manufacturing",
    source: "Copernicus Climate Change Service",
    mitigationActions: [
      "Source materials from alternative regions",
      "Review water-dependent processes",
      "Implement water efficiency measures with suppliers",
    ],
    riskScore: 65,
  },
  {
    id: "ce-005",
    name: "North Sea Storm",
    type: "storm",
    severity: 7,
    startDate: new Date("2023-11-15"),
    endDate: new Date("2023-11-18"),
    location: {
      coordinates: {
        lat: 55.5,
        lng: 5.8,
      },
      radius: 300,
      countries: ["United Kingdom", "Netherlands", "Denmark", "Germany"],
    },
    affectedSuppliers: ["s-003", "s-014", "s-022"],
    affectedRoutes: ["r-001", "r-008", "r-027"],
    description:
      "Severe winter storm disrupting North Sea shipping and port operations",
    source: "UK Met Office / Copernicus Emergency Management Service",
    mitigationActions: [
      "Delay non-critical shipments",
      "Utilize southern European ports as alternatives",
      "Implement expedited customs clearance for backed-up shipments",
    ],
    riskScore: 76,
  },
];

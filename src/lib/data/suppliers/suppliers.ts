export interface Supplier {
  id: number;
  name: string;
  tier: 1 | 2 | 3;
  location: {
    country: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  materials: string[];
  risk: number;
  status: "Critical" | "At Risk" | "On Track";
  impact: "High" | "Medium" | "Low";
  trend: "up" | "down" | "stable";
}

export const suppliers: Supplier[] = [
  {
    id: 1,
    name: "Acme Electronics",
    tier: 1,
    location: {
      country: "Taiwan",
      coordinates: [121.5654, 25.033],
    },
    materials: ["Electronics", "Semiconductors"],
    risk: 87,
    status: "Critical",
    impact: "High",
    trend: "up",
  },
  {
    id: 2,
    name: "Global Materials Ltd",
    tier: 1,
    location: {
      country: "Germany",
      coordinates: [13.405, 52.52],
    },
    materials: ["Steel", "Aluminum"],
    risk: 82,
    status: "Critical",
    impact: "High",
    trend: "up",
  },
  {
    id: 3,
    name: "Pacific Logistics",
    tier: 2,
    location: {
      country: "Singapore",
      coordinates: [103.8198, 1.3521],
    },
    materials: ["Transport Services"],
    risk: 78,
    status: "At Risk",
    impact: "Medium",
    trend: "down",
  },
  {
    id: 4,
    name: "Eastern Components",
    tier: 2,
    location: {
      country: "China",
      coordinates: [116.4074, 39.9042],
    },
    materials: ["Electronics", "Plastics"],
    risk: 76,
    status: "At Risk",
    impact: "High",
    trend: "up",
  },
  {
    id: 5,
    name: "Metro Shipping",
    tier: 3,
    location: {
      country: "Netherlands",
      coordinates: [4.9041, 52.3676],
    },
    materials: ["Transport Services"],
    risk: 72,
    status: "At Risk",
    impact: "Medium",
    trend: "down",
  },
  {
    id: 6,
    name: "UK Steel Works",
    tier: 1,
    location: {
      country: "United Kingdom",
      coordinates: [-0.1278, 51.5074],
    },
    materials: ["Steel", "Metal Components"],
    risk: 45,
    status: "On Track",
    impact: "Medium",
    trend: "stable",
  },
  {
    id: 7,
    name: "Northern Aggregates",
    tier: 2,
    location: {
      country: "Sweden",
      coordinates: [18.0686, 59.3293],
    },
    materials: ["Concrete", "Aggregates"],
    risk: 38,
    status: "On Track",
    impact: "Low",
    trend: "stable",
  },
  {
    id: 8,
    name: "Timber Solutions",
    tier: 3,
    location: {
      country: "Canada",
      coordinates: [-75.6972, 45.4215],
    },
    materials: ["Timber", "Wood Products"],
    risk: 25,
    status: "On Track",
    impact: "Low",
    trend: "down",
  },
  {
    id: 9,
    name: "Chemical Industries",
    tier: 2,
    location: {
      country: "France",
      coordinates: [2.3522, 48.8566],
    },
    materials: ["Chemicals", "Adhesives"],
    risk: 52,
    status: "At Risk",
    impact: "Medium",
    trend: "up",
  },
  {
    id: 10,
    name: "Japan Tech Corp",
    tier: 1,
    location: {
      country: "Japan",
      coordinates: [139.6917, 35.6895],
    },
    materials: ["Electronics", "Robotics"],
    risk: 65,
    status: "At Risk",
    impact: "High",
    trend: "up",
  },
  {
    id: 11,
    name: "American Steel Inc",
    tier: 1,
    location: {
      country: "United States",
      coordinates: [-87.6298, 41.8781],
    },
    materials: ["Steel", "Iron"],
    risk: 48,
    status: "On Track",
    impact: "Medium",
    trend: "stable",
  },
  {
    id: 12,
    name: "South Korean Semiconductors",
    tier: 1,
    location: {
      country: "South Korea",
      coordinates: [126.978, 37.5665],
    },
    materials: ["Semiconductors", "Electronics"],
    risk: 71,
    status: "At Risk",
    impact: "High",
    trend: "up",
  },
  {
    id: 13,
    name: "Brazilian Timber Exports",
    tier: 3,
    location: {
      country: "Brazil",
      coordinates: [-47.9292, -15.7801],
    },
    materials: ["Timber", "Wood Products"],
    risk: 68,
    status: "At Risk",
    impact: "Medium",
    trend: "up",
  },
  {
    id: 14,
    name: "Australian Mining Co",
    tier: 2,
    location: {
      country: "Australia",
      coordinates: [151.2093, -33.8688],
    },
    materials: ["Raw Minerals", "Metals"],
    risk: 42,
    status: "On Track",
    impact: "Medium",
    trend: "stable",
  },
  {
    id: 15,
    name: "Indian Textiles Ltd",
    tier: 3,
    location: {
      country: "India",
      coordinates: [77.209, 28.6139],
    },
    materials: ["Textiles", "Fabrics"],
    risk: 56,
    status: "At Risk",
    impact: "Low",
    trend: "stable",
  },
];

export const getSuppliersByRisk = (minRisk: number = 0): Supplier[] => {
  return suppliers.filter((supplier) => supplier.risk >= minRisk);
};

export const getSuppliersByTier = (tier: 1 | 2 | 3): Supplier[] => {
  return suppliers.filter((supplier) => supplier.tier === tier);
};

export const getSuppliersByStatus = (
  status: "Critical" | "At Risk" | "On Track"
): Supplier[] => {
  return suppliers.filter((supplier) => supplier.status === status);
};

export const getSuppliersByMaterial = (material: string): Supplier[] => {
  return suppliers.filter((supplier) =>
    supplier.materials.some((m) =>
      m.toLowerCase().includes(material.toLowerCase())
    )
  );
};

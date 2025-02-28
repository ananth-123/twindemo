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
  // Tier 1 Suppliers - Major Electronics and Components
  {
    id: 1,
    name: "TSMC",
    tier: 1,
    location: {
      country: "Taiwan",
      coordinates: [121.5654, 25.033], // Hsinchu, Taiwan
    },
    materials: ["Semiconductors", "Microchips"],
    risk: 85,
    status: "Critical",
    impact: "High",
    trend: "up",
  },
  {
    id: 2,
    name: "Samsung Electronics",
    tier: 1,
    location: {
      country: "South Korea",
      coordinates: [127.0276, 37.5284], // Suwon, South Korea
    },
    materials: ["Semiconductors", "Display Panels"],
    risk: 75,
    status: "Critical",
    impact: "High",
    trend: "up",
  },
  {
    id: 3,
    name: "Intel Corporation",
    tier: 1,
    location: {
      country: "United States",
      coordinates: [-121.9886, 37.3382], // Santa Clara, USA
    },
    materials: ["Processors", "Semiconductors"],
    risk: 45,
    status: "On Track",
    impact: "High",
    trend: "stable",
  },

  // Tier 2 Suppliers - Component Manufacturers
  {
    id: 4,
    name: "Murata Manufacturing",
    tier: 2,
    location: {
      country: "Japan",
      coordinates: [135.7681, 35.0116], // Kyoto, Japan
    },
    materials: ["Electronic Components", "Capacitors"],
    risk: 55,
    status: "At Risk",
    impact: "Medium",
    trend: "down",
  },
  {
    id: 5,
    name: "Infineon Technologies",
    tier: 2,
    location: {
      country: "Germany",
      coordinates: [11.582, 48.1351], // Munich, Germany
    },
    materials: ["Power Semiconductors", "Sensors"],
    risk: 35,
    status: "On Track",
    impact: "Medium",
    trend: "stable",
  },
  {
    id: 6,
    name: "STMicroelectronics",
    tier: 2,
    location: {
      country: "Switzerland",
      coordinates: [6.1432, 46.2044], // Geneva, Switzerland
    },
    materials: ["Microcontrollers", "Sensors"],
    risk: 40,
    status: "On Track",
    impact: "Medium",
    trend: "stable",
  },

  // Tier 3 Suppliers - Raw Materials and Basic Components
  {
    id: 7,
    name: "Sumitomo Chemical",
    tier: 3,
    location: {
      country: "Japan",
      coordinates: [139.769, 35.6804], // Tokyo, Japan
    },
    materials: ["Chemical Components", "Raw Materials"],
    risk: 65,
    status: "At Risk",
    impact: "Medium",
    trend: "up",
  },
  {
    id: 8,
    name: "LG Chem",
    tier: 3,
    location: {
      country: "South Korea",
      coordinates: [126.978, 37.5665], // Seoul, South Korea
    },
    materials: ["Battery Components", "Chemical Materials"],
    risk: 70,
    status: "At Risk",
    impact: "High",
    trend: "up",
  },
  {
    id: 9,
    name: "BASF",
    tier: 3,
    location: {
      country: "Germany",
      coordinates: [8.4037, 49.4874], // Ludwigshafen, Germany
    },
    materials: ["Chemical Materials", "Raw Materials"],
    risk: 30,
    status: "On Track",
    impact: "Medium",
    trend: "stable",
  },
  {
    id: 10,
    name: "Foxconn",
    tier: 1,
    location: {
      country: "Taiwan",
      coordinates: [121.6739, 24.7361], // New Taipei City, Taiwan
    },
    materials: ["Assembly", "Electronics"],
    risk: 80,
    status: "Critical",
    impact: "High",
    trend: "up",
  },
  {
    id: 11,
    name: "SK Hynix",
    tier: 1,
    location: {
      country: "South Korea",
      coordinates: [127.7428, 37.2844], // Icheon, South Korea
    },
    materials: ["Memory Chips", "Semiconductors"],
    risk: 75,
    status: "Critical",
    impact: "High",
    trend: "up",
  },
  {
    id: 12,
    name: "Qualcomm",
    tier: 1,
    location: {
      country: "United States",
      coordinates: [-117.1611, 32.8328], // San Diego, USA
    },
    materials: ["Mobile Processors", "Modems"],
    risk: 50,
    status: "At Risk",
    impact: "High",
    trend: "stable",
  },
  {
    id: 13,
    name: "Texas Instruments",
    tier: 2,
    location: {
      country: "United States",
      coordinates: [-96.797, 32.9483], // Dallas, USA
    },
    materials: ["Analog Chips", "Embedded Processors"],
    risk: 45,
    status: "On Track",
    impact: "Medium",
    trend: "stable",
  },
  {
    id: 14,
    name: "MediaTek",
    tier: 2,
    location: {
      country: "Taiwan",
      coordinates: [120.9647, 24.7892], // Hsinchu, Taiwan
    },
    materials: ["Mobile Chips", "Wireless Components"],
    risk: 70,
    status: "At Risk",
    impact: "High",
    trend: "up",
  },
  {
    id: 15,
    name: "Micron Technology",
    tier: 2,
    location: {
      country: "United States",
      coordinates: [-116.2023, 43.615], // Boise, USA
    },
    materials: ["Memory Chips", "Storage Solutions"],
    risk: 60,
    status: "At Risk",
    impact: "Medium",
    trend: "up",
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

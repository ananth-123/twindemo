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

export interface AffectedSupplier {
  supplier: Supplier;
  impact: number;
  recoveryTime: number;
}

export interface TimelineEvent {
  day: number;
  event: string;
  impact: number;
  type: "supplier" | "transport" | "project" | "cost";
}

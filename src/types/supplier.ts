export interface Supplier {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  tier: number;
  riskScore: number;
  materials: string[];
  impact: "high" | "medium" | "low";
}

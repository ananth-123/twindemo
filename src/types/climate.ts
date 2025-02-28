export interface ClimateEvent {
  type: "fire" | "flood" | "drought" | "storm";
  severity: number; // 0 to 1
  coordinates: [number, number]; // [longitude, latitude]
  description: string;
  timestamp: string;
}

export interface ClimateRiskLayer {
  events: ClimateEvent[];
  lastUpdated: string;
  source: string;
}

export interface ClimateRiskVisualization {
  type: "heatmap" | "points" | "polygons";
  color: string;
  opacity: number;
  radius?: number; // for points and heatmap
  coordinates: [number, number][]; // array of [longitude, latitude]
}

export type ClimateDataSource = "copernicus" | "nasa-firms" | "gdo";

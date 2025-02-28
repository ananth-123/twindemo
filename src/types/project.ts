export type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Delayed"
  | "Completed"
  | "On Hold";

export type MaterialUnit = "tonnes" | "m3" | "km" | "units" | "m2";

export interface MaterialUsage {
  estimated: number;
  actual: number;
  unit: string;
  risk?: number;
  lastUpdated: string;
}

export interface ClimateRisk {
  type: string;
  probability: number;
  impact: number;
  affectedMaterials: string[];
  mitigationStrategies?: string[];
}

export interface ProjectLocation {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  regions: string[];
}

export interface DftProject {
  id: string;
  name: string;
  description: string;
  status: "In Progress" | "Completed" | "Delayed" | "Cancelled";
  budget: number;
  spent: number;
  startDate: string;
  estimatedCompletion: string;
  materials: {
    [key: string]: MaterialUsage;
  };
  climateRisks: ClimateRisk[];
  suppliers: string[];
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  projectManager: string;
  department: string;
  priority: "High" | "Medium" | "Low";
  tags: string[];
}

export interface ProjectMetrics {
  budgetUtilization: number;
  schedule: {
    progress: number;
    isDelayed: boolean;
    daysRemaining: number;
  };
  materialUtilization: number;
  riskScore: number;
  supplierCount: number;
  criticalMaterials: string[];
}

export interface ProjectUpdate {
  projectId: string;
  timestamp: string;
  type: "material" | "budget" | "schedule" | "risk" | "supplier";
  change: {
    field: string;
    from: any;
    to: any;
  };
  impact: number; // 0-1
}

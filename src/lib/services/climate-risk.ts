import { ClimateEvent, ClimateRiskLayer } from "@/types/climate";

const COPERNICUS_BASE_URL = "https://emergency.copernicus.eu/mapping/rest/v2";

export class ClimateRiskService {
  private static instance: ClimateRiskService;
  private lastFetchTime: number = 0;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): ClimateRiskService {
    if (!ClimateRiskService.instance) {
      ClimateRiskService.instance = new ClimateRiskService();
    }
    return ClimateRiskService.instance;
  }

  async fetchCurrentEvents(): Promise<ClimateRiskLayer> {
    console.log("ClimateRiskService: Fetching current events");

    try {
      // For now, return test data
      // TODO: Implement actual API calls
      const testData: ClimateRiskLayer = {
        events: [
          {
            type: "fire",
            severity: 0.8,
            coordinates: [2.3522, 48.8566],
            description: "Forest fire risk in Southern Europe",
            timestamp: new Date().toISOString(),
          },
          {
            type: "drought",
            severity: 0.7,
            coordinates: [35.8617, 104.1954],
            description: "Severe drought conditions",
            timestamp: new Date().toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
        source: "Copernicus EMS",
      };

      console.log("ClimateRiskService: Successfully fetched events", {
        eventCount: testData.events.length,
        timestamp: testData.lastUpdated,
      });

      return testData;
    } catch (error) {
      console.error("ClimateRiskService: Error fetching events", error);
      throw error;
    }
  }

  async fetchFireEvents(): Promise<ClimateEvent[]> {
    console.log("ClimateRiskService: Fetching fire events");

    try {
      // TODO: Implement NASA FIRMS API integration
      return [];
    } catch (error) {
      console.error("ClimateRiskService: Error fetching fire events", error);
      return [];
    }
  }

  private shouldRefreshCache(): boolean {
    const now = Date.now();
    return now - this.lastFetchTime > this.cacheTimeout;
  }
}

export const climateRiskService = ClimateRiskService.getInstance();

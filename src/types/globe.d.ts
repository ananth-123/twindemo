declare module "globe.gl" {
  export interface GlobeInstance {
    pointsData: (data: any[]) => GlobeInstance;
    pointLat: (fn: (d: any) => number) => GlobeInstance;
    pointLng: (fn: (d: any) => number) => GlobeInstance;
    pointColor: (fn: (d: any) => string) => GlobeInstance;
    pointAltitude: (fn: (d: any) => number) => GlobeInstance;
    pointRadius: (fn: (d: any) => number) => GlobeInstance;
    pointResolution: (value: number) => GlobeInstance;
    pointsMerge: (value: boolean) => GlobeInstance;
    onPointHover: (fn: (point: any | null) => void) => GlobeInstance;
    onPointClick: (
      fn: (point: any, event: MouseEvent) => void
    ) => GlobeInstance;
    onGlobeClick: (
      fn: (coords: { lat: number; lng: number }) => void
    ) => GlobeInstance;
    pointOfView: (
      coords: { lat: number; lng: number; altitude: number },
      duration?: number
    ) => GlobeInstance;
    width: (value: number) => GlobeInstance;
    height: (value: number) => GlobeInstance;
    globeImageUrl: (url: string) => GlobeInstance;
    bumpImageUrl: (url: string) => GlobeInstance;
    backgroundImageUrl: (url: string) => GlobeInstance;
    showGraticules: (value: boolean) => GlobeInstance;
    showAtmosphere: (value: boolean) => GlobeInstance;
    atmosphereColor: (color: string) => GlobeInstance;
    atmosphereAltitude: (value: number) => GlobeInstance;
    getScreenCoords: (
      lat: number,
      lng: number,
      altitude: number
    ) => { x: number; y: number } | null;
  }

  export interface ConfigOptions {
    animateIn?: boolean;
    waitForGlobeReady?: boolean;
    [key: string]: any;
  }

  export default function Globe(
    configOptions?: ConfigOptions
  ): (element: HTMLElement) => GlobeInstance;
}

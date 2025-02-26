import { suppliers } from './suppliers';

export interface TransportRoute {
  id: number;
  from: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  to: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  mode: 'sea' | 'air' | 'rail' | 'road';
  status: 'Active' | 'Delayed' | 'Disrupted';
  risk: number;
  materials: string[];
}

// UK as central hub for Department for Transport
const ukCoordinates: [number, number] = [-0.1278, 51.5074];

export const transportRoutes: TransportRoute[] = [
  // Sea routes
  {
    id: 1,
    from: {
      name: suppliers[0].location.country,
      coordinates: suppliers[0].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "sea",
    status: "Delayed",
    risk: 75,
    materials: suppliers[0].materials
  },
  {
    id: 2,
    from: {
      name: suppliers[1].location.country,
      coordinates: suppliers[1].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "sea",
    status: "Active",
    risk: 45,
    materials: suppliers[1].materials
  },
  {
    id: 3,
    from: {
      name: suppliers[2].location.country,
      coordinates: suppliers[2].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "sea",
    status: "Disrupted",
    risk: 85,
    materials: suppliers[2].materials
  },
  
  // Air routes
  {
    id: 4,
    from: {
      name: suppliers[3].location.country,
      coordinates: suppliers[3].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "air",
    status: "Active",
    risk: 35,
    materials: suppliers[3].materials
  },
  {
    id: 5,
    from: {
      name: suppliers[9].location.country,
      coordinates: suppliers[9].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "air",
    status: "Active",
    risk: 30,
    materials: suppliers[9].materials
  },
  
  // Rail routes
  {
    id: 6,
    from: {
      name: suppliers[1].location.country,
      coordinates: suppliers[1].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "rail",
    status: "Active",
    risk: 40,
    materials: suppliers[1].materials
  },
  {
    id: 7,
    from: {
      name: suppliers[8].location.country,
      coordinates: suppliers[8].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "rail",
    status: "Delayed",
    risk: 60,
    materials: suppliers[8].materials
  },
  
  // Road routes
  {
    id: 8,
    from: {
      name: suppliers[5].location.country,
      coordinates: suppliers[5].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "road",
    status: "Active",
    risk: 20,
    materials: suppliers[5].materials
  },
  {
    id: 9,
    from: {
      name: suppliers[4].location.country,
      coordinates: suppliers[4].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "road",
    status: "Active",
    risk: 25,
    materials: suppliers[4].materials
  },
  {
    id: 10,
    from: {
      name: suppliers[10].location.country,
      coordinates: suppliers[10].location.coordinates
    },
    to: {
      name: "United Kingdom",
      coordinates: ukCoordinates
    },
    mode: "sea",
    status: "Delayed",
    risk: 65,
    materials: suppliers[10].materials
  },
];

export const getRoutesByMode = (mode: 'sea' | 'air' | 'rail' | 'road'): TransportRoute[] => {
  return transportRoutes.filter(route => route.mode === mode);
};

export const getRoutesByStatus = (status: 'Active' | 'Delayed' | 'Disrupted'): TransportRoute[] => {
  return transportRoutes.filter(route => route.status === status);
};

export const getRoutesByRisk = (minRisk: number = 0): TransportRoute[] => {
  return transportRoutes.filter(route => route.risk >= minRisk);
}; 
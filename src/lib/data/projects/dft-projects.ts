import { DftProject } from "@/types/project";

export const dftProjects: DftProject[] = [
  {
    id: "HS2",
    name: "High Speed Two",
    description:
      "High-speed rail network connecting London to Birmingham and the North",
    budget: 45000000000, // £45 billion to £54 billion
    spent: 33000000000,
    status: "In Progress",
    startDate: "2009-01-01",
    estimatedCompletion: "2033-12-31",
    materials: {
      steel_rail: {
        estimated: 500000,
        actual: 150000,
        unit: "tonnes",
        risk: 75,
        lastUpdated: "2024-03-01",
      },
      concrete: {
        estimated: 20000000,
        actual: 8000000,
        unit: "m3",
        risk: 60,
        lastUpdated: "2024-03-01",
      },
      ballast: {
        estimated: 5000000,
        actual: 1500000,
        unit: "tonnes",
        risk: 40,
        lastUpdated: "2024-03-01",
      },
      signalling_equipment: {
        estimated: 10000,
        actual: 2000,
        unit: "units",
        risk: 65,
        lastUpdated: "2024-03-01",
      },
    },
    climateRisks: [
      {
        type: "flooding",
        probability: 0.7,
        impact: 0.8,
        affectedMaterials: ["concrete", "ballast", "signalling_equipment"],
        mitigationStrategies: [
          "Enhanced drainage systems",
          "Elevated track sections",
          "Flood resilient signalling equipment",
        ],
      },
      {
        type: "extreme heat",
        probability: 0.6,
        impact: 0.7,
        affectedMaterials: ["steel_rail", "signalling_equipment"],
        mitigationStrategies: [
          "Heat-resistant rail materials",
          "Track stress monitoring systems",
          "Cooling systems for signalling equipment",
        ],
      },
    ],
    suppliers: ["Network Rail", "Balfour Beatty", "Skanska", "Costain"],
    location: {
      name: "London to Birmingham",
      lat: 52.4862,
      lng: -1.8904,
    },
    projectManager: "HS2 Ltd",
    department: "DfT Rail",
    priority: "High",
    tags: ["rail", "infrastructure", "major-project"],
  },
  {
    id: "NPR",
    name: "Northern Powerhouse Rail",
    description:
      "Major rail programme to transform connectivity between northern cities",
    budget: 30600000000,
    spent: 5000000000,
    status: "In Progress",
    startDate: "2021-01-01",
    estimatedCompletion: "2045-12-31",
    materials: {
      steel_rail: {
        estimated: 300000,
        actual: 20000,
        unit: "tonnes",
        risk: 70,
        lastUpdated: "2024-03-01",
      },
      concrete: {
        estimated: 15000000,
        actual: 1000000,
        unit: "m3",
        risk: 55,
        lastUpdated: "2024-03-01",
      },
      signalling_equipment: {
        estimated: 8000,
        actual: 500,
        unit: "units",
        risk: 60,
        lastUpdated: "2024-03-01",
      },
    },
    climateRisks: [
      {
        type: "flooding",
        probability: 0.8,
        impact: 0.7,
        affectedMaterials: ["concrete", "signalling_equipment"],
        mitigationStrategies: [
          "Flood protection barriers",
          "Elevated track design",
          "Resilient signalling systems",
        ],
      },
    ],
    suppliers: ["Network Rail", "Amey", "Siemens"],
    location: {
      name: "Northern England",
      lat: 53.4808,
      lng: -2.2426,
    },
    projectManager: "Transport for the North",
    department: "DfT Rail",
    priority: "High",
    tags: ["rail", "infrastructure", "northern-powerhouse"],
  },
  {
    id: "TRU",
    name: "Transpennine Route Upgrade",
    description: "Major upgrade to the rail route between York and Manchester",
    budget: 11500000000,
    spent: 3000000000,
    status: "In Progress",
    startDate: "2019-01-01",
    estimatedCompletion: "2036-12-31",
    materials: {
      steel_rail: {
        estimated: 150000,
        actual: 30000,
        unit: "tonnes",
        risk: 65,
        lastUpdated: "2024-03-01",
      },
      signalling_equipment: {
        estimated: 5000,
        actual: 1000,
        unit: "units",
        risk: 55,
        lastUpdated: "2024-03-01",
      },
    },
    climateRisks: [
      {
        type: "storms",
        probability: 0.6,
        impact: 0.6,
        affectedMaterials: ["signalling_equipment"],
        mitigationStrategies: [
          "Weather-resilient equipment housing",
          "Backup power systems",
        ],
      },
    ],
    suppliers: ["Network Rail", "BAM Nuttall", "Siemens"],
    location: {
      name: "York to Manchester",
      lat: 53.7632,
      lng: -1.5483,
    },
    projectManager: "Network Rail",
    department: "DfT Rail",
    priority: "High",
    tags: ["rail", "infrastructure", "transpennine"],
  },
  {
    id: "EWR",
    name: "East West Rail",
    description: "New rail link between Oxford and Cambridge",
    budget: 5700000000,
    spent: 2000000000,
    status: "In Progress",
    startDate: "2020-01-01",
    estimatedCompletion: "2030-12-31",
    materials: {
      steel_rail: {
        estimated: 100000,
        actual: 25000,
        unit: "tonnes",
        risk: 60,
        lastUpdated: "2024-03-01",
      },
      concrete: {
        estimated: 5000000,
        actual: 1500000,
        unit: "m3",
        risk: 50,
        lastUpdated: "2024-03-01",
      },
    },
    climateRisks: [
      {
        type: "flooding",
        probability: 0.5,
        impact: 0.6,
        affectedMaterials: ["concrete", "steel_rail"],
        mitigationStrategies: [
          "Improved drainage systems",
          "Flood-resistant infrastructure",
        ],
      },
    ],
    suppliers: ["Network Rail", "Laing O'Rourke", "Atkins"],
    location: {
      name: "Oxford to Cambridge",
      lat: 52.2053,
      lng: -0.1218,
    },
    projectManager: "East West Railway Company",
    department: "DfT Rail",
    priority: "Medium",
    tags: ["rail", "infrastructure", "east-west"],
  },
  {
    id: "LTC",
    name: "Lower Thames Crossing",
    description: "New road tunnel under the River Thames east of London",
    budget: 8300000000,
    spent: 1000000000,
    status: "In Progress",
    startDate: "2021-01-01",
    estimatedCompletion: "2032-12-31",
    materials: {
      concrete: {
        estimated: 2000000,
        actual: 200000,
        unit: "m3",
        risk: 70,
        lastUpdated: "2024-03-01",
      },
      steel: {
        estimated: 150000,
        actual: 20000,
        unit: "tonnes",
        risk: 65,
        lastUpdated: "2024-03-01",
      },
    },
    climateRisks: [
      {
        type: "flooding",
        probability: 0.8,
        impact: 0.9,
        affectedMaterials: ["concrete", "steel"],
        mitigationStrategies: [
          "Enhanced flood barriers",
          "Water-resistant tunnel design",
          "Advanced drainage systems",
        ],
      },
    ],
    suppliers: ["Highways England", "Balfour Beatty", "Jacobs"],
    location: {
      name: "Gravesend, Kent",
      lat: 51.4433,
      lng: 0.3738,
    },
    projectManager: "National Highways",
    department: "DfT Roads",
    priority: "High",
    tags: ["road", "infrastructure", "tunnel"],
  },
];

export const getProjectById = (id: string): DftProject | undefined => {
  return dftProjects.find((project) => project.id === id);
};

export const getProjectsByStatus = (status: string): DftProject[] => {
  return dftProjects.filter((project) => project.status === status);
};

export const getProjectsByMaterial = (material: string): DftProject[] => {
  return dftProjects.filter((project) => material in project.materials);
};

export const getHighRiskProjects = (): DftProject[] => {
  return dftProjects.filter((project) => {
    const materialRisks = Object.values(project.materials).map(
      (m) => m.risk || 0
    );
    const avgRisk =
      materialRisks.reduce((a, b) => a + b, 0) / materialRisks.length;
    return avgRisk > 60;
  });
};

export const getProjectMetrics = (project: DftProject) => {
  // Calculate material utilization
  const materialUtilization =
    Object.values(project.materials).reduce(
      (acc, material) => acc + material.actual / material.estimated,
      0
    ) / Object.keys(project.materials).length;

  // Calculate budget utilization
  const budgetUtilization = project.spent / project.budget;

  // Calculate schedule progress
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.estimatedCompletion);
  const today = new Date();
  const totalDays = endDate.getTime() - startDate.getTime();
  const elapsedDays = today.getTime() - startDate.getTime();
  const progress = Math.min(1, elapsedDays / totalDays);

  // Calculate risk score
  const riskScore = Math.max(
    ...project.climateRisks.map((risk) => risk.probability * risk.impact * 100)
  );

  return {
    materialUtilization,
    budgetUtilization,
    schedule: {
      progress,
      isDelayed: today > endDate,
      daysRemaining: Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
    },
    riskScore,
    supplierCount: project.suppliers.length,
    criticalMaterials: Object.entries(project.materials)
      .filter(([_, usage]) => usage.risk && usage.risk > 70)
      .map(([material]) => material),
  };
};

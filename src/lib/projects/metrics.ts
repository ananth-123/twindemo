import { DftProject } from "@/types/project";

export function getProjectMetrics(project: DftProject) {
  // Calculate budget utilization
  const budgetUtilization = project.spent / project.budget;

  // Calculate schedule progress
  const startDate = new Date(project.startDate).getTime();
  const endDate = new Date(project.estimatedCompletion).getTime();
  const currentDate = new Date().getTime();
  const totalDuration = endDate - startDate;
  const elapsedDuration = currentDate - startDate;
  const schedule = {
    progress: Math.min(Math.max(elapsedDuration / totalDuration, 0), 1),
    isDelayed: currentDate > endDate,
    daysRemaining: Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)),
  };

  // Calculate material utilization
  let totalMaterialUtilization = 0;
  let materialCount = 0;
  Object.values(project.materials).forEach((material) => {
    totalMaterialUtilization += material.actual / material.estimated;
    materialCount++;
  });
  const materialUtilization =
    materialCount > 0 ? totalMaterialUtilization / materialCount : 0;

  // Calculate risk score based on climate risks
  const riskScore =
    project.climateRisks.reduce((score, risk) => {
      return score + risk.impact * risk.probability * 100;
    }, 0) / Math.max(project.climateRisks.length, 1);

  // Calculate supplier risk
  const supplierRisk =
    project.suppliers.length > 3
      ? project.suppliers.length * 5 // More suppliers = more risk
      : 15; // Base risk for small supplier count

  return {
    budgetUtilization,
    schedule,
    materialUtilization,
    riskScore: Math.min(riskScore + supplierRisk, 100), // Cap at 100
    supplierCount: project.suppliers.length,
    criticalMaterials: Object.entries(project.materials)
      .filter(([_, usage]) => usage.risk && usage.risk > 70)
      .map(([material]) => material),
  };
}

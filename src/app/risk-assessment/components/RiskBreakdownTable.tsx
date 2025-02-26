import { CCRA3RiskAssessment } from "@/lib/data/climate/risk-assessment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RiskBreakdownTableProps {
  risk: CCRA3RiskAssessment;
}

export default function RiskBreakdownTable({ risk }: RiskBreakdownTableProps) {
  // Format level with proper capitalization
  const formatLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="space-y-4">
      {/* Exposure */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2}>Exposure Analysis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Level</TableCell>
            <TableCell>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full ${
                  risk.exposure.level === "high"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : risk.exposure.level === "medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                }`}
              >
                {formatLevel(risk.exposure.level)}
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Score</TableCell>
            <TableCell>{risk.exposure.score}/10</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Description</TableCell>
            <TableCell>{risk.exposure.description}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Vulnerability */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2}>Vulnerability Analysis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Level</TableCell>
            <TableCell>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full ${
                  risk.vulnerability.level === "high"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : risk.vulnerability.level === "medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                }`}
              >
                {formatLevel(risk.vulnerability.level)}
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Score</TableCell>
            <TableCell>{risk.vulnerability.score}/10</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Description</TableCell>
            <TableCell>{risk.vulnerability.description}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Adaptive Capacity */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2}>Adaptive Capacity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Level</TableCell>
            <TableCell>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full ${
                  risk.adaptiveCapacity.level === "high"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : risk.adaptiveCapacity.level === "medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {formatLevel(risk.adaptiveCapacity.level)}
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Score</TableCell>
            <TableCell>{risk.adaptiveCapacity.score}/10</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Description</TableCell>
            <TableCell>{risk.adaptiveCapacity.description}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Hazards Summary */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={4}>Climate Hazards Summary</TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Likelihood</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead>Risk Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risk.climateHazards.map((hazard, index) => (
            <TableRow key={index}>
              <TableCell className="capitalize">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    hazard.hazardType === "direct"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : hazard.hazardType === "indirect"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                  }`}
                >
                  {hazard.hazardType}
                </span>
              </TableCell>
              <TableCell>{hazard.likelihood}/10</TableCell>
              <TableCell>{hazard.potentialImpact}/10</TableCell>
              <TableCell
                className={
                  hazard.likelihood * hazard.potentialImpact >= 70
                    ? "text-red-500 font-medium"
                    : hazard.likelihood * hazard.potentialImpact >= 40
                    ? "text-yellow-500 font-medium"
                    : "text-green-500 font-medium"
                }
              >
                {((hazard.likelihood * hazard.potentialImpact) / 10).toFixed(1)}
                /10
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

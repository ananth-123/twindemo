"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { sampleRiskAssessments } from "@/lib/data/climate/risk-assessment";
import RiskMatrixChart from "./components/RiskMatrixChart";
import RiskBreakdownTable from "./components/RiskBreakdownTable";
import MitigationActionsList from "./components/MitigationActionsList";

export default function RiskAssessmentPage() {
  const [selectedRiskId, setSelectedRiskId] = useState(
    sampleRiskAssessments[0].id
  );
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter risk assessments based on search query
  const filteredRiskAssessments = sampleRiskAssessments.filter((risk) => {
    if (!searchQuery) return true;

    return (
      risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get currently selected risk assessment
  const selectedRisk =
    sampleRiskAssessments.find((risk) => risk.id === selectedRiskId) ||
    sampleRiskAssessments[0];

  // Prepare data for radar chart
  const radarChartData = [
    {
      subject: "Hazard Score",
      A:
        selectedRisk.climateHazards.reduce(
          (acc, h) => acc + h.likelihood * h.potentialImpact,
          0
        ) /
        selectedRisk.climateHazards.length /
        10,
      fullMark: 10,
    },
    {
      subject: "Exposure",
      A: selectedRisk.exposure.score,
      fullMark: 10,
    },
    {
      subject: "Vulnerability",
      A: selectedRisk.vulnerability.score,
      fullMark: 10,
    },
    {
      subject: "Adaptive Capacity",
      A: selectedRisk.adaptiveCapacity.score,
      fullMark: 10,
    },
    {
      subject: "Confidence",
      A: selectedRisk.confidenceLevel,
      fullMark: 10,
    },
  ];

  // Prepare data for hazard bar chart
  const hazardChartData = selectedRisk.climateHazards.map((hazard) => ({
    name:
      hazard.description.length > 25
        ? hazard.description.substring(0, 22) + "..."
        : hazard.description,
    likelihood: hazard.likelihood,
    impact: hazard.potentialImpact,
    risk: (hazard.likelihood * hazard.potentialImpact) / 10,
    type: hazard.hazardType,
  }));

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "more_action_needed":
        return "bg-destructive text-destructive-foreground";
      case "research_priority":
        return "bg-amber-500 text-amber-950";
      case "sustain_current_action":
        return "bg-yellow-500 text-yellow-950";
      case "watching_brief":
        return "bg-green-500 text-green-950";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Format urgency label
  const formatUrgency = (urgency: string) => {
    return urgency
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Climate Risk Assessment</h1>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search risks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Risk Assessments List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Risk Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {filteredRiskAssessments.map((risk) => (
                  <Card
                    key={risk.id}
                    className={`cursor-pointer p-3 hover:bg-muted/50 transition-colors ${
                      selectedRiskId === risk.id
                        ? "border-primary bg-muted/50"
                        : ""
                    }`}
                    onClick={() => setSelectedRiskId(risk.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{risk.name}</h3>
                        <Badge
                          className={`ml-2 ${getUrgencyColor(risk.urgency)}`}
                        >
                          {formatUrgency(risk.urgency)}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{risk.sector}</span>
                        <span>Risk: {risk.riskMagnitude}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedRisk.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRisk.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    className={`${getUrgencyColor(selectedRisk.urgency)}`}
                    variant="outline"
                  >
                    {formatUrgency(selectedRisk.urgency)}
                  </Badge>
                  <Badge variant="outline">Sector: {selectedRisk.sector}</Badge>
                  <Badge variant="outline">
                    Timeframe: {formatUrgency(selectedRisk.timeframe)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Risk Magnitude</span>
                  <span
                    className={`text-3xl font-bold ${
                      selectedRisk.riskMagnitude > 70
                        ? "text-destructive"
                        : selectedRisk.riskMagnitude > 40
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {selectedRisk.riskMagnitude}%
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Adaptation Level</span>
                  <span className="text-3xl font-bold">
                    {selectedRisk.adaptiveCapacity.level
                      .charAt(0)
                      .toUpperCase() +
                      selectedRisk.adaptiveCapacity.level.slice(1)}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Confidence Level</span>
                  <span className="text-3xl font-bold">
                    {selectedRisk.confidenceLevel}/10
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Content */}
          <Tabs defaultValue="overview" onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hazards">Hazards Analysis</TabsTrigger>
              <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
              <TabsTrigger value="actions">Mitigation Actions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Risk Factor Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius="70%" data={radarChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 10]} />
                        <Radar
                          name={selectedRisk.name}
                          dataKey="A"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Risk Breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Risk Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] overflow-y-auto">
                    <RiskBreakdownTable risk={selectedRisk} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Hazards Tab */}
            <TabsContent value="hazards" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Climate Hazards Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={hazardChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 100,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name, props) => {
                          if (name === "risk")
                            return [value.toFixed(1) + "/10", "Risk Score"];
                          return [
                            value,
                            name.charAt(0).toUpperCase() + name.slice(1),
                          ];
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="likelihood"
                        fill="#8884d8"
                        name="Likelihood"
                        barSize={30}
                      />
                      <Bar
                        dataKey="impact"
                        fill="#82ca9d"
                        name="Impact"
                        barSize={30}
                      />
                      <Bar
                        dataKey="risk"
                        fill="#ff7300"
                        name="Risk Score"
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risk Matrix Tab */}
            <TabsContent value="matrix" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Risk Matrix Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[500px] flex items-center justify-center">
                  <RiskMatrixChart hazards={selectedRisk.climateHazards} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mitigation Actions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Mitigation Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MitigationActionsList
                      actions={selectedRisk.mitigationActions}
                    />
                  </CardContent>
                </Card>

                {/* Adaptation Measures */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Adaptation Measures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MitigationActionsList
                      actions={selectedRisk.adaptationMeasures}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

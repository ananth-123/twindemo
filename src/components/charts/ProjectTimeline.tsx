import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DftProject } from "@/types/project";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface ProjectTimelineProps {
  projects: DftProject[];
}

export function ProjectTimeline({ projects }: ProjectTimelineProps) {
  const today = new Date();
  const minYear = Math.min(
    ...projects.map((p) => new Date(p.startDate).getFullYear())
  );
  const maxYear = Math.max(
    ...projects.map((p) => new Date(p.estimatedCompletion).getFullYear())
  );

  // Transform projects data for the timeline
  const timelineData = projects.map((project) => {
    const startYear = new Date(project.startDate).getFullYear();
    const endYear = new Date(project.estimatedCompletion).getFullYear();
    const progress =
      ((today.getTime() - new Date(project.startDate).getTime()) /
        (new Date(project.estimatedCompletion).getTime() -
          new Date(project.startDate).getTime())) *
      100;

    return {
      name: project.name,
      start: startYear,
      duration: endYear - startYear,
      progress: Math.min(Math.max(progress, 0), 100),
      budget: project.budget,
      spent: project.spent,
      department: project.department,
    };
  });

  // Sort projects by start date
  timelineData.sort((a, b) => a.start - b.start);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Timeline (2009-2045)</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-500/10">
              Rail Projects
            </Badge>
            <Badge variant="outline" className="bg-green-500/10">
              Road Projects
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timelineData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[minYear, maxYear]}
                tickCount={maxYear - minYear + 1}
              />
              <YAxis type="category" dataKey="name" width={140} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-muted-foreground">
                          {data.start} - {data.start + data.duration}
                        </p>
                        <p className="text-muted-foreground">
                          Progress: {Math.round(data.progress)}%
                        </p>
                        <p className="text-muted-foreground">
                          Budget: £{(data.budget / 1e9).toFixed(1)}bn
                        </p>
                        <p className="text-muted-foreground">
                          Spent: £{(data.spent / 1e9).toFixed(1)}bn
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                x={today.getFullYear()}
                stroke="#888"
                strokeDasharray="3 3"
                label={{
                  value: "Today",
                  position: "top",
                  fill: "#888",
                }}
              />
              <Bar
                dataKey="duration"
                stackId="a"
                fill={(d) =>
                  d.department === "DfT Rail"
                    ? "rgba(59, 130, 246, 0.5)"
                    : "rgba(34, 197, 94, 0.5)"
                }
                background={{ fill: "#f3f4f6" }}
              >
                {timelineData.map((entry, index) => (
                  <Bar
                    key={`progress-${index}`}
                    dataKey="progress"
                    stackId="b"
                    fill={(d) =>
                      d.department === "DfT Rail"
                        ? "rgb(59, 130, 246)"
                        : "rgb(34, 197, 94)"
                    }
                    radius={[4, 4, 4, 4]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {timelineData.map((project) => (
            <div
              key={project.name}
              className="flex items-center justify-between p-2 rounded-lg border bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    project.department === "DfT Rail"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                />
                <span className="text-sm font-medium">{project.name}</span>
              </div>
              <Badge variant="outline">
                {Math.round(project.progress)}% Complete
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

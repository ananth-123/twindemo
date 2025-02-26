"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskTrendData } from "@/lib/data/charts/riskTrends";

interface RiskTrendChartProps {
  data: RiskTrendData[];
  title: string;
  subtitle?: string;
}

export default function RiskTrendChart({
  data,
  title,
  subtitle,
}: RiskTrendChartProps) {
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, ""]}
                labelStyle={{ fontWeight: "bold" }}
                contentStyle={{
                  borderRadius: "6px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="supplyChainHealth"
                name="Supply Chain Health"
                stroke="#22c55e"
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="materialAvailability"
                name="Material Availability"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="supplierRisk"
                name="Supplier Risk"
                stroke="#f59e0b"
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="transportDisruption"
                name="Transport Disruption"
                stroke="#ef4444"
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

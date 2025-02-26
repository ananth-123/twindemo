"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Hazard {
  hazardType: string;
  description: string;
  likelihood: number;
  potentialImpact: number;
}

interface RiskMatrixChartProps {
  hazards: Hazard[];
}

export default function RiskMatrixChart({ hazards }: RiskMatrixChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !hazards.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // SVG dimensions
    const width = 600;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Risk levels
    const riskLevels = [
      { name: "Low", color: "#22c55e", threshold: 25 },
      { name: "Medium", color: "#f59e0b", threshold: 50 },
      { name: "High", color: "#ef4444", threshold: 75 },
      { name: "Critical", color: "#7f1d1d", threshold: 100 },
    ];

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "width: 100%; height: auto; max-width: 600px;");

    // Create a group for the matrix content
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear().domain([0, 10]).range([0, innerWidth]);

    const yScale = d3.scaleLinear().domain([0, 10]).range([innerHeight, 0]);

    // Add risk zones (colored background)
    const riskZones = g.append("g").attr("class", "risk-zones");

    // Add low risk zone
    riskZones
      .append("rect")
      .attr("x", 0)
      .attr("y", yScale(10))
      .attr("width", xScale(5))
      .attr("height", innerHeight)
      .attr("fill", riskLevels[0].color)
      .attr("opacity", 0.2);

    // Add medium risk zones
    riskZones
      .append("rect")
      .attr("x", xScale(5))
      .attr("y", yScale(10))
      .attr("width", xScale(3))
      .attr("height", innerHeight)
      .attr("fill", riskLevels[1].color)
      .attr("opacity", 0.2);

    riskZones
      .append("rect")
      .attr("x", 0)
      .attr("y", yScale(7))
      .attr("width", xScale(5))
      .attr("height", yScale(3) - yScale(7))
      .attr("fill", riskLevels[1].color)
      .attr("opacity", 0.2);

    // Add high risk zones
    riskZones
      .append("rect")
      .attr("x", xScale(8))
      .attr("y", yScale(10))
      .attr("width", xScale(2))
      .attr("height", innerHeight)
      .attr("fill", riskLevels[2].color)
      .attr("opacity", 0.2);

    riskZones
      .append("rect")
      .attr("x", xScale(5))
      .attr("y", yScale(7))
      .attr("width", xScale(3))
      .attr("height", yScale(3) - yScale(7))
      .attr("fill", riskLevels[2].color)
      .attr("opacity", 0.2);

    riskZones
      .append("rect")
      .attr("x", 0)
      .attr("y", yScale(3))
      .attr("width", xScale(8))
      .attr("height", yScale(0) - yScale(3))
      .attr("fill", riskLevels[2].color)
      .attr("opacity", 0.2);

    // Add critical risk zone
    riskZones
      .append("rect")
      .attr("x", xScale(8))
      .attr("y", yScale(7))
      .attr("width", xScale(2))
      .attr("height", yScale(0) - yScale(7))
      .attr("fill", riskLevels[3].color)
      .attr("opacity", 0.2);

    // Add axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(10)
      .tickFormat((d) => d.toString());

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(10)
      .tickFormat((d) => d.toString());

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis);

    g.append("g").attr("class", "y-axis").call(yAxis);

    // Add axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("class", "text-xs font-medium")
      .text("Likelihood");

    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("class", "text-xs font-medium")
      .text("Impact");

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("class", "text-sm font-bold")
      .text("Climate Hazard Risk Matrix");

    // Plot hazards
    const hazardPoints = g.append("g").attr("class", "hazard-points");

    // Define hazard type symbols
    const symbolTypes = {
      direct: d3.symbolCircle,
      indirect: d3.symbolSquare,
      systemic: d3.symbolTriangle,
    };

    // Add hazard points
    hazardPoints
      .selectAll(".hazard-point")
      .data(hazards)
      .enter()
      .append("path")
      .attr("class", "hazard-point")
      .attr("transform", (d) => {
        return `translate(${xScale(d.likelihood)}, ${yScale(
          d.potentialImpact
        )})`;
      })
      .attr(
        "d",
        d3
          .symbol()
          .type((d: Hazard) => {
            return (
              symbolTypes[d.hazardType as keyof typeof symbolTypes] ||
              d3.symbolCircle
            );
          })
          .size(200)
      )
      .attr("fill", (d) => {
        const riskScore = (d.likelihood * d.potentialImpact) / 10;
        if (riskScore >= 7.5) return riskLevels[3].color;
        if (riskScore >= 5) return riskLevels[2].color;
        if (riskScore >= 2.5) return riskLevels[1].color;
        return riskLevels[0].color;
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // Add tooltips
    hazardPoints
      .selectAll(".hazard-point")
      .append("title")
      .text(function (this: HTMLTitleElement, d: unknown) {
        const hazard = d as Hazard;
        return `${
          hazard.description
        }\nLikelihood: ${hazard.likelihood}/10\nImpact: ${hazard.potentialImpact}/10\nRisk Score: ${((hazard.likelihood * hazard.potentialImpact) / 10).toFixed(1)}/10`;
      });

    // Add hazard labels
    hazardPoints
      .selectAll(".hazard-label")
      .data(hazards)
      .enter()
      .append("text")
      .attr("class", "hazard-label text-[10px]")
      .attr("x", (d) => xScale(d.likelihood))
      .attr("y", (d) => yScale(d.potentialImpact) - 10)
      .attr("text-anchor", "middle")
      .text((d, i) => `H${i + 1}`);

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${width - margin.right - 100}, ${margin.top})`
      );

    // Risk level legend
    legend
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "text-xs font-medium")
      .text("Risk Levels");

    riskLevels.forEach((level, i) => {
      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", 10 + i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", level.color)
        .attr("opacity", 0.7);

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", 22 + i * 20)
        .attr("class", "text-xs")
        .text(level.name);
    });

    // Hazard type legend
    legend
      .append("text")
      .attr("x", 0)
      .attr("y", 110)
      .attr("class", "text-xs font-medium")
      .text("Hazard Types");

    const hazardTypes = [
      { type: "direct", label: "Direct" },
      { type: "indirect", label: "Indirect" },
      { type: "systemic", label: "Systemic" },
    ];

    hazardTypes.forEach((type, i) => {
      legend
        .append("path")
        .attr("transform", `translate(${7.5}, ${130 + i * 20})`)
        .attr(
          "d",
          d3
            .symbol()
            .type(symbolTypes[type.type as keyof typeof symbolTypes])
            .size(100)
        )
        .attr("fill", "#666");

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", 134 + i * 20)
        .attr("class", "text-xs")
        .text(type.label);
    });
  }, [hazards]);

  return (
    <div className="flex items-center justify-center overflow-hidden">
      <svg ref={svgRef}></svg>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectDetails } from "@/components/projects/ProjectDetails";
import { ProjectTimeline } from "@/components/charts/ProjectTimeline";
import { dftProjects } from "@/lib/data/projects/dft-projects";
import { DftProject } from "@/types/project";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowDownUp,
  CircleDollarSign,
  Filter,
  Search,
  X,
  Train,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<DftProject | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter projects based on search query, status, and department
  const filteredProjects = dftProjects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || project.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Sort projects based on selected criteria
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "budget":
        comparison = a.budget - b.budget;
        break;
      case "risk":
        comparison =
          Math.max(
            ...a.climateRisks.map((risk) => risk.impact * risk.probability)
          ) -
          Math.max(
            ...b.climateRisks.map((risk) => risk.impact * risk.probability)
          );
        break;
      case "completion":
        comparison =
          new Date(a.estimatedCompletion).getTime() -
          new Date(b.estimatedCompletion).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate summary metrics
  const totalBudget = dftProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = dftProjects.reduce((sum, p) => sum + p.spent, 0);
  const highRiskCount = dftProjects.filter((p) =>
    p.climateRisks.some((r) => r.impact * r.probability > 0.7)
  ).length;
  const delayedCount = dftProjects.filter((p) => p.status === "Delayed").length;
  const railProjects = dftProjects.filter(
    (p) => p.department === "DfT Rail"
  ).length;
  const roadProjects = dftProjects.filter(
    (p) => p.department === "DfT Roads"
  ).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            DfT Infrastructure Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze major infrastructure projects
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <h3 className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: "GBP",
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(totalBudget)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((totalSpent / totalBudget) * 100)}% spent
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CircleDollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rail Projects</p>
                <h3 className="text-2xl font-bold">{railProjects}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((railProjects / dftProjects.length) * 100)}% of
                  portfolio
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Train className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Road Projects</p>
                <h3 className="text-2xl font-bold">{roadProjects}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((roadProjects / dftProjects.length) * 100)}% of
                  portfolio
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Car className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <h3 className="text-2xl font-bold">{highRiskCount}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {delayedCount} projects delayed
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Timeline */}
      <ProjectTimeline projects={dftProjects} />

      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="DfT Rail">Rail</SelectItem>
                <SelectItem value="DfT Roads">Roads</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Delayed">Delayed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ArrowDownUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Project Name</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="risk">Risk Level</SelectItem>
                <SelectItem value="completion">Completion Date</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <ArrowDownUp
                className={`h-4 w-4 transition-transform ${
                  sortOrder === "desc" ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery ||
          statusFilter !== "all" ||
          departmentFilter !== "all") && (
          <div className="flex gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setStatusFilter("all")}
                />
              </Badge>
            )}
            {departmentFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Department: {departmentFilter}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setDepartmentFilter("all")}
                />
              </Badge>
            )}
          </div>
        )}

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Project</th>
                    <th className="text-left p-4">Department</th>
                    <th className="text-left p-4">Budget</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Completion</th>
                    <th className="text-left p-4">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={
                            project.department === "DfT Rail"
                              ? "bg-blue-500/10"
                              : "bg-green-500/10"
                          }
                        >
                          {project.department}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {new Intl.NumberFormat("en-GB", {
                          style: "currency",
                          currency: "GBP",
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(project.budget)}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            project.status === "Delayed"
                              ? "destructive"
                              : project.status === "In Progress"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {new Date(
                          project.estimatedCompletion
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {Math.max(
                          ...project.climateRisks.map(
                            (r) => r.impact * r.probability * 100
                          )
                        ).toFixed(0)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Details Dialog */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={() => setSelectedProject(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogTitle className="text-2xl font-bold mb-4">
                {selectedProject.name}
              </DialogTitle>
              <ProjectDetails project={selectedProject} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Globe2,
  Truck,
  FlaskConical,
  Menu,
  X,
  Building2,
  Train,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const routes = [
  {
    name: "Overview",
    path: "/dashboard",
    icon: BarChart3,
    description: "Portfolio performance and key metrics",
  },
  {
    name: "Projects",
    path: "/projects",
    icon: Building2,
    description: "Major infrastructure projects and timelines",
  },
  {
    name: "Network",
    path: "/globe",
    icon: Globe2,
    description: "Supply chain network visualization",
  },
  {
    name: "Suppliers",
    path: "/suppliers",
    icon: Truck,
    description: "Supplier risk and material tracking",
  },
  {
    name: "Simulations",
    path: "/simulations",
    icon: FlaskConical,
    description: "Supply chain disruption scenarios",
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center mr-4 font-semibold">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Train className="h-5 w-5 text-primary" />
              <span className="hidden md:inline-block">NEXUS</span>
              {/* <span className="text-xs text-muted-foreground hidden md:inline-block">
                DfT Infrastructure Intelligence
              </span> */}
              <span className="md:hidden">NEXUS</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Button
                key={route.path}
                variant="ghost"
                asChild
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.path
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Link href={route.path} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {route.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex items-center gap-2 mb-8">
              <Train className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-semibold">NEXUS</span>
                {/* <span className="text-xs text-muted-foreground">
                  DfT Infrastructure Intelligence
                </span> */}
              </div>
            </div>
            <nav className="flex flex-col gap-4">
              {routes.map((route) => {
                const Icon = route.icon;
                return (
                  <Button
                    key={route.path}
                    variant="ghost"
                    asChild
                    className={cn(
                      "justify-start text-sm font-medium transition-colors hover:text-primary",
                      pathname === route.path
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <Link href={route.path} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span>{route.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {route.description}
                        </span>
                      </div>
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center space-x-4">
          {/* Add user profile or other controls here */}
        </div>
      </div>
    </div>
  );
}

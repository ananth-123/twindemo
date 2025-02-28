"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, Globe, Truck, FlaskConical, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const routes = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "3D Globe",
    path: "/globe",
    icon: Globe,
    description: "Interactive 3D visualization of global supplier network",
  },
  {
    name: "Suppliers",
    path: "/suppliers",
    icon: Truck,
  },
  {
    name: "Simulations",
    path: "/simulations",
    icon: FlaskConical,
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
            <span className="hidden md:inline-block">
              Supply Chain Resilience
            </span>
            <span className="md:hidden">SCR</span>
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
            <nav className="flex flex-col gap-4 mt-8">
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
                      {route.name}
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

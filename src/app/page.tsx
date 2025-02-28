import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Globe,
  Truck,
  FlaskConical,
  ShieldAlert,
  LineChart,
  Network,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Supply Chain Resilience Digital Twin
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Monitor, analyze, and simulate supply chain dynamics, climate
                  events, and geopolitical risks for the Department for
                  Transport.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/globe">Explore 3D Globe</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto flex justify-center">
              <div className="relative w-full h-80 md:h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg opacity-20 blur-xl"></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <Network className="w-32 h-32 md:w-48 md:h-48 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Key Features
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Comprehensive tools to monitor and enhance supply chain
                resilience
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Card>
              <CardHeader className="pb-2">
                <BarChart3 className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>Risk Dashboard</CardTitle>
                <CardDescription>
                  Monitor KPIs, risk trends, and material shortages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Executive-level dashboard with supply chain health index, risk
                  trends, and project delivery confidence indicators.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Globe className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>Interactive Map</CardTitle>
                <CardDescription>
                  Visualize global supply chain networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Geospatial visualization with risk indicators, animated
                  transportation routes, and weather event overlays.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Truck className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>Supplier Details</CardTitle>
                <CardDescription>
                  Comprehensive supplier profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Detailed supplier information, performance metrics,
                  alternative supplier suggestions, and risk factors.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <FlaskConical className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>Simulation Engine</CardTitle>
                <CardDescription>Run "what-if" scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Interactive simulation platform for testing disruption
                  scenarios, visualizing cascade effects, and generating
                  mitigation strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 bg-muted/50 mt-auto">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">
                Ready to enhance supply chain resilience?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Start exploring the digital twin to identify risks and improve
                decision-making.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

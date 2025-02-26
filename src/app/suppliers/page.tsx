import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  ArrowUpDown,
  Truck,
  MapPin,
  Package,
} from "lucide-react";

export default function SuppliersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8"
          />
        </div>
        <Button>Add Supplier</Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Suppliers</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk</TabsTrigger>
          <TabsTrigger value="tier1">Tier 1</TabsTrigger>
          <TabsTrigger value="tier2">Tier 2</TabsTrigger>
          <TabsTrigger value="tier3">Tier 3</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: 1,
                name: "Acme Electronics",
                tier: 1,
                location: "Taiwan",
                materials: ["Electronics", "Semiconductors"],
                risk: 87,
                status: "Critical",
              },
              {
                id: 2,
                name: "Global Materials Ltd",
                tier: 1,
                location: "Germany",
                materials: ["Steel", "Aluminum"],
                risk: 82,
                status: "Critical",
              },
              {
                id: 3,
                name: "Pacific Logistics",
                tier: 2,
                location: "Singapore",
                materials: ["Transport Services"],
                risk: 78,
                status: "At Risk",
              },
              {
                id: 4,
                name: "Eastern Components",
                tier: 2,
                location: "China",
                materials: ["Electronics", "Plastics"],
                risk: 76,
                status: "At Risk",
              },
              {
                id: 5,
                name: "Metro Shipping",
                tier: 3,
                location: "Netherlands",
                materials: ["Transport Services"],
                risk: 72,
                status: "At Risk",
              },
              {
                id: 6,
                name: "UK Steel Works",
                tier: 1,
                location: "United Kingdom",
                materials: ["Steel", "Metal Components"],
                risk: 45,
                status: "On Track",
              },
              {
                id: 7,
                name: "Northern Aggregates",
                tier: 2,
                location: "Sweden",
                materials: ["Concrete", "Aggregates"],
                risk: 38,
                status: "On Track",
              },
              {
                id: 8,
                name: "Timber Solutions",
                tier: 3,
                location: "Canada",
                materials: ["Timber", "Wood Products"],
                risk: 25,
                status: "On Track",
              },
              {
                id: 9,
                name: "Chemical Industries",
                tier: 2,
                location: "France",
                materials: ["Chemicals", "Adhesives"],
                risk: 52,
                status: "At Risk",
              },
            ].map((supplier) => (
              <Card key={supplier.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <Badge
                      variant={
                        supplier.status === "Critical"
                          ? "destructive"
                          : supplier.status === "At Risk"
                          ? "default"
                          : "outline"
                      }
                    >
                      {supplier.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {supplier.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Tier {supplier.tier}</span>
                      </div>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          supplier.risk > 80
                            ? "bg-red-100 text-red-800"
                            : supplier.risk > 50
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        <span className="text-xs font-medium">
                          {supplier.risk}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Materials:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.materials.map((material) => (
                          <Badge
                            key={material}
                            variant="secondary"
                            className="text-xs"
                          >
                            <Package className="mr-1 h-3 w-3" />
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High Risk Suppliers</CardTitle>
              <CardDescription>
                Suppliers with risk score above 70%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-muted-foreground">
                  High risk suppliers will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tier1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tier 1 Suppliers</CardTitle>
              <CardDescription>
                Direct suppliers to Department for Transport projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-muted-foreground">
                  Tier 1 suppliers will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tier2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tier 2 Suppliers</CardTitle>
              <CardDescription>
                Secondary suppliers to Department for Transport projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-muted-foreground">
                  Tier 2 suppliers will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tier3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tier 3 Suppliers</CardTitle>
              <CardDescription>
                Tertiary suppliers to Department for Transport projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-muted-foreground">
                  Tier 3 suppliers will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

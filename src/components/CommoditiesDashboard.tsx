import { useEffect, useState } from "react";
import { Commodity, fetchCommoditiesData, CommodityCategory } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommoditiesTable from "./CommoditiesTable";
import CommodityCard from "./CommodityCard";
import { AlertCircle, RefreshCw, Droplet, Wheat, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommoditiesDashboard() {
  // État pour stocker les commodités par catégorie
  const [metalsCommodities, setMetalsCommodities] = useState<Commodity[]>([]);
  const [agriculturalCommodities, setAgriculturalCommodities] = useState<Commodity[]>([]);
  const [energyCommodities, setEnergyCommodities] = useState<Commodity[]>([]);
  
  // État pour le chargement et les erreurs par catégorie
  const [loading, setLoading] = useState({
    metals: true,
    agricultural: true,
    energy: true
  });
  const [error, setError] = useState<{[key in CommodityCategory]?: string | null}>({});
  const [lastUpdated, setLastUpdated] = useState<{[key in CommodityCategory]?: Date | null}>({});

  // État pour la catégorie active
  const [activeCategory, setActiveCategory] = useState<CommodityCategory>('metals');

  // Charger les données pour une catégorie spécifique
  const loadCategoryData = async (category: CommodityCategory) => {
    setLoading(prev => ({ ...prev, [category]: true }));
    setError(prev => ({ ...prev, [category]: null }));
    
    try {
      const data = await fetchCommoditiesData(category);
      
      // Mettre à jour l'état approprié selon la catégorie
      if (category === 'metals') {
        setMetalsCommodities(data);
      } else if (category === 'agricultural') {
        setAgriculturalCommodities(data);
      } else if (category === 'energy') {
        setEnergyCommodities(data);
      }
      
      setLastUpdated(prev => ({ ...prev, [category]: new Date() }));
      
      if (data.length === 0) {
        setError(prev => ({ ...prev, [category]: "No data found" }));
      }
    } catch (error) {
      console.error(`Error loading ${category} data:`, error);
      setError(prev => ({ ...prev, [category]: `Error loading ${category} data. Please try again later.` }));
      
      // Réinitialiser les données en cas d'erreur
      if (category === 'metals') {
        setMetalsCommodities([]);
      } else if (category === 'agricultural') {
        setAgriculturalCommodities([]);
      } else if (category === 'energy') {
        setEnergyCommodities([]);
      }
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  // Charger toutes les données
  const loadAllData = async () => {
    await Promise.all([
      loadCategoryData('metals'),
      loadCategoryData('agricultural'),
      loadCategoryData('energy')
    ]);
  };

  // Charger les données initiales
  useEffect(() => {
    loadAllData();
    
    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(() => {
      loadAllData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Obtenir les commodités actives en fonction de la catégorie sélectionnée
  const getActiveCommodities = (): Commodity[] => {
    switch(activeCategory) {
      case 'metals':
        return metalsCommodities;
      case 'agricultural':
        return agriculturalCommodities;
      case 'energy':
        return energyCommodities;
      default:
        return metalsCommodities;
    }
  };

  // Filtrer les commodités par type
  const commodities = getActiveCommodities();
  
  // Métaux
  const goldCommodities = metalsCommodities.filter(c => c.type === 'gold');
  const silverCommodities = metalsCommodities.filter(c => c.type === 'silver');
  const copperCommodities = metalsCommodities.filter(c => c.type === 'copper');
  const aluminumCommodities = metalsCommodities.filter(c => c.type === 'aluminum');
  const cobaltCommodities = metalsCommodities.filter(c => c.type === 'cobalt');
  
  // Produits agricoles
  const cornCommodities = agriculturalCommodities.filter(c => c.type === 'corn');
  const wheatCommodities = agriculturalCommodities.filter(c => c.type === 'wheat');
  const soybeanCommodities = agriculturalCommodities.filter(c => c.type === 'soybean');
  const cottonCommodities = agriculturalCommodities.filter(c => c.type === 'cotton');
  const sugarCommodities = agriculturalCommodities.filter(c => c.type === 'sugar');
  
  // Énergie
  const crudeCommodities = energyCommodities.filter(c => c.type === 'crude');
  const gasolineCommodities = energyCommodities.filter(c => c.type === 'gasoline');
  const naturalGasCommodities = energyCommodities.filter(c => c.type === 'natural_gas');
  const heatingOilCommodities = energyCommodities.filter(c => c.type === 'heating_oil');

  // Composant de cartes de chargement
  const LoadingCards = ({ count = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden h-full border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex flex-col gap-1 w-full">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex justify-between items-end mt-3">
              <div className="flex-1">
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div>
                <Skeleton className="h-3 w-14 mb-1" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Obtenir l'état de chargement actuel
  const isLoading = loading[activeCategory];
  const currentError = error[activeCategory];
  const currentLastUpdated = lastUpdated[activeCategory];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commodities Dashboard</h1>
          <p className="text-muted-foreground">
            Track prices and trends of precious metals, agricultural products, and energy commodities
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {currentLastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {currentLastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadCategoryData(activeCategory)}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
            Refresh
          </Button>
        </div>
      </div>

      {currentError && (
        <div className="bg-destructive/15 p-4 rounded-md flex items-center gap-2 text-destructive">
          <AlertCircle size={20} />
          <p>{currentError}</p>
        </div>
      )}

      {/* Onglets principaux pour les catégories */}
      <Tabs 
        defaultValue="metals" 
        className="space-y-4"
        onValueChange={(value) => setActiveCategory(value as CommodityCategory)}
      >
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="metals" className="flex items-center gap-2">
            <Factory size={16} />
            <span>Metals</span>
          </TabsTrigger>
          <TabsTrigger value="agricultural" className="flex items-center gap-2">
            <Wheat size={16} />
            <span>Agricultural</span>
          </TabsTrigger>
          <TabsTrigger value="energy" className="flex items-center gap-2">
            <Droplet size={16} />
            <span>Energy</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Contenu des onglets principaux */}
        <TabsContent value="metals" className="space-y-4">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="precious">Precious Metals</TabsTrigger>
              <TabsTrigger value="industrial">Industrial Metals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-md" />
              ) : metalsCommodities.length > 0 ? (
                <CommoditiesTable commodities={metalsCommodities} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
              
              {isLoading ? (
                <LoadingCards count={4} />
              ) : metalsCommodities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {metalsCommodities.slice(0, 4).map(commodity => (
                    <CommodityCard key={commodity.symbol} commodity={commodity} />
                  ))}
                </div>
              ) : null}
            </TabsContent>
            
            <TabsContent value="precious" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gold</CardTitle>
                    <CardDescription>Current trend of gold futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : goldCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {goldCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Silver</CardTitle>
                    <CardDescription>Current trend of silver futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : silverCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {silverCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="industrial" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Copper</CardTitle>
                    <CardDescription>Current trend of copper futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : copperCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {copperCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Aluminum</CardTitle>
                    <CardDescription>Current trend of aluminum futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : aluminumCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {aluminumCommodities.slice(0, 3).map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Cobalt</CardTitle>
                    <CardDescription>Current trend of cobalt futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : cobaltCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {cobaltCommodities.slice(0, 3).map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Onglet Agricultural */}
        <TabsContent value="agricultural" className="space-y-4">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="grains">Grains</TabsTrigger>
              <TabsTrigger value="softs">Softs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-md" />
              ) : agriculturalCommodities.length > 0 ? (
                <CommoditiesTable commodities={agriculturalCommodities} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
              
              {isLoading ? (
                <LoadingCards count={4} />
              ) : agriculturalCommodities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {agriculturalCommodities.slice(0, 4).map(commodity => (
                    <CommodityCard key={commodity.symbol} commodity={commodity} />
                  ))}
                </div>
              ) : null}
            </TabsContent>
            
            <TabsContent value="grains" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Corn</CardTitle>
                    <CardDescription>Current trend of corn futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : cornCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {cornCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Wheat</CardTitle>
                    <CardDescription>Current trend of wheat futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : wheatCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {wheatCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Soybean</CardTitle>
                    <CardDescription>Current trend of soybean futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : soybeanCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {soybeanCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="softs" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cotton</CardTitle>
                    <CardDescription>Current trend of cotton futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : cottonCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {cottonCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Sugar</CardTitle>
                    <CardDescription>Current trend of sugar futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : sugarCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {sugarCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Onglet Energy */}
        <TabsContent value="energy" className="space-y-4">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="oil">Oil</TabsTrigger>
              <TabsTrigger value="gas">Gas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-md" />
              ) : energyCommodities.length > 0 ? (
                <CommoditiesTable commodities={energyCommodities} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
              
              {isLoading ? (
                <LoadingCards count={4} />
              ) : energyCommodities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {energyCommodities.slice(0, 4).map(commodity => (
                    <CommodityCard key={commodity.symbol} commodity={commodity} />
                  ))}
                </div>
              ) : null}
            </TabsContent>
            
            <TabsContent value="oil" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Crude Oil</CardTitle>
                    <CardDescription>Current trend of crude oil futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : crudeCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {crudeCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Gasoline</CardTitle>
                    <CardDescription>Current trend of gasoline futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : gasolineCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {gasolineCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Heating Oil</CardTitle>
                    <CardDescription>Current trend of heating oil futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : heatingOilCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {heatingOilCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="gas" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Natural Gas</CardTitle>
                    <CardDescription>Current trend of natural gas futures contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : naturalGasCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {naturalGasCommodities.map(commodity => (
                          <CommodityCard key={commodity.symbol} commodity={commodity} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import { Commodity, fetchCommoditiesData, CommodityCategory } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommoditiesTable from "./CommoditiesTable";
import CommodityCard from "./CommodityCard";
import SearchBar from "./SearchBar";
import { useFavorites } from "@/hooks/useFavorites";
import { AlertCircle, RefreshCw, Droplet, Wheat, Factory, Ship, Heart, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommoditiesDashboard() {
  // États et hooks
  const { favorites, favoritesCount, favoriteSymbols } = useFavorites();
  
  // État pour stocker les commodités par catégorie
  const [metalsCommodities, setMetalsCommodities] = useState<Commodity[]>([]);
  const [agriculturalCommodities, setAgriculturalCommodities] = useState<Commodity[]>([]);
  const [energyCommodities, setEnergyCommodities] = useState<Commodity[]>([]);
  const [freightCommodities, setFreightCommodities] = useState<Commodity[]>([]);
  const [bunkerCommodities, setBunkerCommodities] = useState<Commodity[]>([]);
  
  // État pour le chargement et les erreurs par catégorie
  const [loading, setLoading] = useState({
    metals: true,
    agricultural: true,
    energy: true,
    freight: true,
    bunker: true
  });
  const [error, setError] = useState<{[key in CommodityCategory]?: string | null}>({});
  const [lastUpdated, setLastUpdated] = useState<{[key in CommodityCategory]?: Date | null}>({});

  // État pour la catégorie active
  const [activeCategory, setActiveCategory] = useState<CommodityCategory | 'favorites'>('metals');

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
      } else if (category === 'freight') {
        setFreightCommodities(data);
      } else if (category === 'bunker') {
        setBunkerCommodities(data);
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
      } else if (category === 'freight') {
        setFreightCommodities([]);
      } else if (category === 'bunker') {
        setBunkerCommodities([]);
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
      loadCategoryData('energy'),
      loadCategoryData('freight'),
      loadCategoryData('bunker')
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
      case 'freight':
        return freightCommodities;
      case 'bunker':
        return bunkerCommodities;
      case 'favorites':
        return favoriteCommodities;
      default:
        return metalsCommodities;
    }
  };

  // Combiner toutes les commodités pour la recherche
  const allCommodities = useMemo(() => {
    return [
      ...metalsCommodities,
      ...agriculturalCommodities,
      ...energyCommodities,
      ...freightCommodities,
      ...bunkerCommodities
    ];
  }, [metalsCommodities, agriculturalCommodities, energyCommodities, freightCommodities, bunkerCommodities]);

  // Get favorite commodities from all categories - optimized for performance
  const favoriteCommodities = useMemo(() => {
    if (allCommodities.length === 0 || favoriteSymbols.length === 0) {
      return [];
    }
    
    // Create a set for O(1) lookup performance
    const favoriteSymbolsSet = new Set(favoriteSymbols);
    
    const filtered = allCommodities.filter(commodity => 
      favoriteSymbolsSet.has(commodity.symbol)
    );
    
    // Sort by the order they were added to favorites (most recent first)
    return filtered.sort((a, b) => {
      const aIndex = favorites.findIndex(f => f.symbol === a.symbol);
      const bIndex = favorites.findIndex(f => f.symbol === b.symbol);
      return bIndex - aIndex;
    });
  }, [allCommodities, favoriteSymbols, favorites]);

  // Auto-load data when switching to favorites tab if needed
  useEffect(() => {
    if (activeCategory === 'favorites' && allCommodities.length === 0) {
      loadAllData();
    }
  }, [activeCategory, allCommodities.length]);

  // Gérer la sélection d'une commodité depuis la recherche
  const handleSelectCommodity = (commodity: Commodity) => {
    // Naviguer vers la catégorie appropriée
    setActiveCategory(commodity.category as CommodityCategory);
    
    // Scroll vers le symbole ou afficher une notification
    toast.success(`Navigated to ${commodity.symbol} in ${commodity.category}`, {
      description: `Current price: ${commodity.price.toLocaleString()}`
    });
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
  
  // Freight
  const containerCommodities = freightCommodities.filter(c => c.type === 'container');
  const freightRouteCommodities = freightCommodities.filter(c => c.type === 'freight_route');
  const lngFreightCommodities = freightCommodities.filter(c => c.type === 'lng_freight');
  const dirtyFreightCommodities = freightCommodities.filter(c => c.type === 'dirty_freight');
  
  // Bunker
  const vlsfoCommodities = bunkerCommodities.filter(c => c.type === 'vlsfo');
  const mgoCommodities = bunkerCommodities.filter(c => c.type === 'mgo');
  const ifo380Commodities = bunkerCommodities.filter(c => c.type === 'ifo380');

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
  const isLoading = activeCategory === 'favorites' ? false : loading[activeCategory as CommodityCategory];
  const currentError = activeCategory === 'favorites' ? null : error[activeCategory as CommodityCategory];
  const currentLastUpdated = activeCategory === 'favorites' ? null : lastUpdated[activeCategory as CommodityCategory];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commodities Dashboard</h1>
            <p className="text-muted-foreground">
              Track prices and trends of precious metals, agricultural products, and energy commodities
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Barre de recherche */}
            <SearchBar 
              commodities={allCommodities}
              onSelectCommodity={handleSelectCommodity}
              placeholder="Search commodities..."
            />
            
            <div className="flex items-center gap-2">
              {currentLastUpdated && (
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  Last updated: {currentLastUpdated.toLocaleTimeString()}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                            onClick={() => activeCategory !== 'favorites' && loadCategoryData(activeCategory)}
            disabled={isLoading || activeCategory === 'favorites'}
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
                Refresh
              </Button>
            </div>
          </div>
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
        value={activeCategory}
        onValueChange={(value) => setActiveCategory(value as CommodityCategory | 'favorites')}
      >
        <TabsList className="grid grid-cols-6 w-full md:w-[720px]">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart size={16} />
            <span className="hidden sm:inline">Favorites</span>
            <span className="sm:hidden">❤️</span>
            {favoritesCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </TabsTrigger>
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
          <TabsTrigger value="freight" className="flex items-center gap-2">
            <Ship size={16} />
            <span>Freight</span>
          </TabsTrigger>
          <TabsTrigger value="bunker" className="flex items-center gap-2">
            <Fuel size={16} />
            <span>Bunker</span>
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
        
        {/* Onglet Freight */}
        <TabsContent value="freight" className="space-y-4">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="container">Container</TabsTrigger>
              <TabsTrigger value="routes">Freight Routes</TabsTrigger>
              <TabsTrigger value="lng">LNG Freight</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-md" />
              ) : freightCommodities.length > 0 ? (
                <CommoditiesTable commodities={freightCommodities} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
              
              {isLoading ? (
                <LoadingCards count={4} />
              ) : freightCommodities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {freightCommodities.slice(0, 4).map(commodity => (
                    <CommodityCard key={commodity.symbol} commodity={commodity} />
                  ))}
                </div>
              ) : null}
            </TabsContent>
            
            <TabsContent value="container" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Container Freight</CardTitle>
                  <CardDescription>Current trends for container shipping routes</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[100px] w-full" />
                      ))}
                    </div>
                  ) : containerCommodities.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {containerCommodities.map(commodity => (
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
            </TabsContent>
            
            <TabsContent value="routes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Freight Routes</CardTitle>
                  <CardDescription>Baltic and Platts freight route futures</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-[100px] w-full" />
                      ))}
                    </div>
                  ) : freightRouteCommodities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {freightRouteCommodities.map(commodity => (
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
            </TabsContent>
            
            <TabsContent value="lng" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>LNG Freight</CardTitle>
                    <CardDescription>Liquefied Natural Gas shipping rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : lngFreightCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {lngFreightCommodities.map(commodity => (
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
                    <CardTitle>Dirty Freight</CardTitle>
                    <CardDescription>Oil and dirty cargo shipping rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-[100px] w-full" />
                        ))}
                      </div>
                    ) : dirtyFreightCommodities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {dirtyFreightCommodities.map(commodity => (
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
        
        {/* Onglet Bunker Prices */}
        <TabsContent value="bunker" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Bunker Prices</h2>
              <p className="text-muted-foreground">
                Prix des carburants marins en temps réel depuis Ship & Bunker
              </p>
            </div>
            
            {bunkerCommodities.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCategoryData('bunker')}
                disabled={loading.bunker}
              >
                <RefreshCw size={16} className={loading.bunker ? "animate-spin mr-2" : "mr-2"} />
                Actualiser
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="vlsfo">VLSFO</TabsTrigger>
              <TabsTrigger value="mgo">MGO</TabsTrigger>
              <TabsTrigger value="ifo380">IFO380</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {loading.bunker ? (
                <Skeleton className="h-[300px] w-full rounded-md" />
              ) : bunkerCommodities.length > 0 ? (
                <CommoditiesTable commodities={bunkerCommodities} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
              
              {loading.bunker ? (
                <LoadingCards count={4} />
              ) : bunkerCommodities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {bunkerCommodities.slice(0, 4).map(commodity => (
                    <CommodityCard key={commodity.symbol} commodity={commodity} />
                  ))}
                </div>
              ) : null}
            </TabsContent>
            
            <TabsContent value="vlsfo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>VLSFO (Very Low Sulfur Fuel Oil)</CardTitle>
                  <CardDescription>Prix du carburant maritime à très faible teneur en soufre</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.bunker ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[100px] w-full" />
                      ))}
                    </div>
                  ) : vlsfoCommodities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vlsfoCommodities.map(commodity => (
                        <CommodityCard key={commodity.symbol} commodity={commodity} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune donnée disponible
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mgo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>MGO (Marine Gas Oil)</CardTitle>
                  <CardDescription>Prix du gazole marin</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.bunker ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[100px] w-full" />
                      ))}
                    </div>
                  ) : mgoCommodities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mgoCommodities.map(commodity => (
                        <CommodityCard key={commodity.symbol} commodity={commodity} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune donnée disponible
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ifo380" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>IFO380 (Intermediate Fuel Oil 380)</CardTitle>
                  <CardDescription>Prix du fuel marin intermédiaire 380</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.bunker ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[100px] w-full" />
                      ))}
                    </div>
                  ) : ifo380Commodities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ifo380Commodities.map(commodity => (
                        <CommodityCard key={commodity.symbol} commodity={commodity} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune donnée disponible
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Your Favorites</h2>
              <p className="text-muted-foreground">
                {favoritesCount > 0 
                  ? `Vous suivez ${favoritesCount} commodité${favoritesCount === 1 ? '' : 's'}`
                  : "Aucun favori ajouté pour le moment"
                }
              </p>
            </div>
            
            {favoritesCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAllData()}
              >
                <RefreshCw size={16} className="mr-2" />
                Actualiser
              </Button>
            )}
          </div>

          {favoritesCount === 0 ? (
            <Card className="p-8">
              <div className="text-center space-y-4">
                <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Créer votre liste de suivi</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ajoutez des commodités à vos favoris en cliquant sur l'étoile ⭐ dans n'importe quel tableau ou carte. 
                    Cela vous aidera à suivre rapidement les symboles qui vous intéressent le plus.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {[
                    { key: 'metals', label: 'Parcourir Métaux' },
                    { key: 'agricultural', label: 'Parcourir Agriculture' },
                    { key: 'energy', label: 'Parcourir Énergie' },
                    { key: 'freight', label: 'Parcourir Fret' }
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveCategory(key as CommodityCategory)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <>
              {/* Favorites Table */}
              <CommoditiesTable commodities={favoriteCommodities} />
              
              {/* Favorites Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favoriteCommodities.slice(0, 8).map(commodity => (
                  <CommodityCard key={commodity.symbol} commodity={commodity} />
                ))}
              </div>

              {favoriteCommodities.length > 8 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing first 8 favorites in cards view. View all {favoritesCount} in the table above.
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

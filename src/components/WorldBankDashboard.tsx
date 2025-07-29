import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Building2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { 
  WorldBankCommodity, 
  fetchWorldBankData, 
  refreshWorldBankData,
  fetchWorldBankDataByCategory,
  getWorldBankCategories,
  WORLD_BANK_CATEGORIES,
  hasWorldBankData,
  getCurrentWorldBankData
} from '@/services/worldBankApi';
import WorldBankTable from './WorldBankTable';
import WorldBankChart from './WorldBankChart';
import WorldBankFileImport from './WorldBankFileImport';
import WorldBankHistoricalData from './WorldBankHistoricalData';

export default function WorldBankDashboard() {
  const [commodities, setCommodities] = useState<WorldBankCommodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showImport, setShowImport] = useState(false);
  const [currentData, setCurrentData] = useState(getCurrentWorldBankData());

  const categories = getWorldBankCategories();

  const loadData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = forceRefresh 
        ? await refreshWorldBankData()
        : await fetchWorldBankData();
      setCommodities(data.commodities);
      setLastUpdated(data.lastUpdated);
      setCurrentData(data);
      
      if (data.commodities.length === 0) {
        setError("No data found");
      }
    } catch (error) {
      console.error('Error loading World Bank data:', error);
      setError('Failed to load World Bank commodity data. Please try again later.');
      setCommodities([]);
      setLastUpdated(null);
      setCurrentData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDataImported = () => {
    setShowImport(false);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredCommodities = () => {
    if (activeCategory === 'all') {
      return commodities;
    }
    return commodities.filter(commodity => commodity.category === activeCategory);
  };

  const filteredCommodities = getFilteredCommodities();

  // Group commodities by category for summary cards
  const categoryStats = categories.map(category => {
    const categoryCommodities = commodities.filter(c => c.category === category);
    const avgChange = categoryCommodities.length > 0 
      ? categoryCommodities.reduce((sum, c) => sum + (c.changePercent || 0), 0) / categoryCommodities.length
      : 0;
    
    return {
      category,
      count: categoryCommodities.length,
      avgChange
    };
  });

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            World Bank Commodity Data
          </h2>
          <p className="text-muted-foreground">
            Historical commodity price data from the World Bank Pink Sheet
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">
              <p className="whitespace-nowrap">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              {currentData && (
                <p className="text-xs">
                  {currentData.isDefault ? 'Default data' : `Custom: ${currentData.fileName}`}
                </p>
              )}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
          >
            <Upload size={16} className="mr-2" />
            Import New Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin mr-2" : "mr-2"} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/15 p-4 rounded-md flex items-center gap-2 text-destructive">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {showImport ? (
        <WorldBankFileImport onDataImported={handleDataImported} />
      ) : loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryStats.map((stat) => (
              <Card key={stat.category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.avgChange > 0 ? '+' : ''}{stat.avgChange.toFixed(2)}% avg change
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs 
            defaultValue="charts" 
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="charts">Interactive Chart</TabsTrigger>
              <TabsTrigger value="table">Data Table</TabsTrigger>
              <TabsTrigger value="historical">Historical Data</TabsTrigger>
            </TabsList>
            
            {/* Charts View */}
            <TabsContent value="charts" className="space-y-4">
              {filteredCommodities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No commodities found in this category.
                </div>
              ) : (
                <div className="w-full">
                  <WorldBankChart 
                    commodities={filteredCommodities}
                    loading={loading}
                  />
                </div>
              )}
            </TabsContent>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('all')}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Table View */}
            <TabsContent value="table" className="space-y-4">
              <WorldBankTable 
                commodities={filteredCommodities} 
                loading={loading}
              />
            </TabsContent>

            {/* Historical Data View */}
            <TabsContent value="historical" className="space-y-4">
              <WorldBankHistoricalData 
                commodities={filteredCommodities} 
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 
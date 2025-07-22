import { useState, useEffect, useMemo, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Minus, X, Heart } from "lucide-react";
import { Commodity } from "@/services/api";
import { useFavorites } from "@/hooks/useFavorites";
import CommodityIcon from "./CommodityIcon";
import PriceChange from "./PriceChange";

interface SearchBarProps {
  commodities: Commodity[];
  onSelectCommodity?: (commodity: Commodity) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  commodities, 
  onSelectCommodity,
  placeholder = "Search commodities..." 
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get favorites for suggestions
  const { favorites, favoriteSymbols } = useFavorites();

  // Charger les recherches récentes au montage
  useEffect(() => {
    const saved = localStorage.getItem('commodity-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Sauvegarder les recherches récentes
  const saveRecentSearch = (search: string) => {
    if (search.trim()) {
      const newRecent = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('commodity-recent-searches', JSON.stringify(newRecent));
    }
  };

  // Filtrer et trier les commodités selon la recherche
  const filteredCommodities = useMemo(() => {
    if (!searchValue.trim()) return [];

    const searchTerm = searchValue.toLowerCase().trim();
    
    return commodities
      .filter(commodity => {
        const symbolMatch = commodity.symbol.toLowerCase().includes(searchTerm);
        const nameMatch = commodity.name.toLowerCase().includes(searchTerm);
        const categoryMatch = commodity.category.toLowerCase().includes(searchTerm);
        return symbolMatch || nameMatch || categoryMatch;
      })
      .sort((a, b) => {
        // Priorité : symbole exact > début de symbole > début de nom > contenu
        const aSymbol = a.symbol.toLowerCase();
        const bSymbol = b.symbol.toLowerCase();
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match sur symbole
        if (aSymbol === searchTerm && bSymbol !== searchTerm) return -1;
        if (bSymbol === searchTerm && aSymbol !== searchTerm) return 1;
        
        // Début de symbole
        if (aSymbol.startsWith(searchTerm) && !bSymbol.startsWith(searchTerm)) return -1;
        if (bSymbol.startsWith(searchTerm) && !aSymbol.startsWith(searchTerm)) return 1;
        
        // Début de nom
        if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
        if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
        
        // Alphabétique par défaut
        return aSymbol.localeCompare(bSymbol);
      })
      .slice(0, 10); // Limiter à 10 résultats
  }, [commodities, searchValue]);

  // Fermer le popover quand on clique ailleurs
  useEffect(() => {
    if (!searchValue) {
      setOpen(false);
    } else {
      setOpen(filteredCommodities.length > 0);
    }
  }, [searchValue, filteredCommodities]);

  const handleSelectCommodity = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
    setSearchValue(commodity.symbol);
    setOpen(false);
    saveRecentSearch(commodity.symbol);
    onSelectCommodity?.(commodity);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCommodity(null);
    setSearchValue("");
    setOpen(false);
  };

  // Gérer les raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K pour ouvrir la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        // Focus sur l'input après ouverture
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
      // Escape pour fermer
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setSearchValue("");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Focus automatique quand le popover s'ouvre
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'metals': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'agricultural': return 'bg-green-100 text-green-800 border-green-200';
      case 'energy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'freight': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'metals': return 'Metals';
      case 'agricultural': return 'Agricultural';
      case 'energy': return 'Energy';
      case 'freight': return 'Freight';
      default: return category;
    }
  };

  const getTrendIcon = (percentChange: number) => {
    if (percentChange > 0) return <TrendingUp className="h-3 w-3 text-trend-up" />;
    if (percentChange < 0) return <TrendingDown className="h-3 w-3 text-trend-down" />;
    return <Minus className="h-3 w-3 text-trend-neutral" />;
  };

  return (
    <div className="relative w-full max-w-md">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-start text-left font-normal transition-all ${
              open ? 'ring-2 ring-ring ring-offset-2' : 'hover:bg-accent'
            }`}
          >
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            {selectedCommodity ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CommodityIcon type={selectedCommodity.type} className="flex-shrink-0" />
                <span className="truncate">{selectedCommodity.symbol}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs flex-shrink-0 ${getCategoryBadgeColor(selectedCommodity.category)}`}
                >
                  {getCategoryDisplayName(selectedCommodity.category)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-muted flex-shrink-0 ml-auto"
                  onClick={handleClearSelection}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-muted-foreground truncate">
                  {placeholder}
                </span>
                <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              ref={inputRef}
              placeholder="Search by symbol or name..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-0"
            />
            
            <CommandList className="max-h-[300px]">
              {filteredCommodities.length === 0 && searchValue && (
                <CommandEmpty>
                  <div className="text-center py-6">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No commodities found for "{searchValue}"
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>💡 Try searching by:</p>
                      <p>• Symbol (e.g. "GC", "CL", "CS31")</p>
                      <p>• Full name (e.g. "Gold", "Crude Oil")</p>
                      <p>• Category (e.g. "metals", "energy")</p>
                    </div>
                  </div>
                </CommandEmpty>
              )}

              {filteredCommodities.length === 0 && !searchValue && (
                <div className="p-6 text-center space-y-4">
                  <div>
                    <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Search among {commodities.length} commodities
                    </p>
                  </div>

                  {favorites.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Heart className="h-3 w-3 text-red-500" />
                        <p>Your Favorites:</p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {favorites.slice(0, 6).map(fav => (
                          <Badge 
                            key={fav.symbol}
                            variant="outline" 
                            className="cursor-pointer hover:bg-red-50 hover:border-red-200 text-xs border-red-200 text-red-700"
                            onClick={() => setSearchValue(fav.symbol)}
                          >
                            ❤️ {fav.symbol}
                          </Badge>
                        ))}
                        {favorites.length > 6 && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            +{favorites.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {recentSearches.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p>🕒 Recent searches:</p>
                      <div className="flex flex-wrap gap-1 justify-center mt-2">
                        {recentSearches.map(search => (
                          <Badge 
                            key={search}
                            variant="outline" 
                            className="cursor-pointer hover:bg-muted text-xs"
                            onClick={() => setSearchValue(search)}
                          >
                            {search}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    <p>🔥 Popular suggestions:</p>
                    <div className="flex flex-wrap gap-1 justify-center mt-2">
                      {['Gold', 'Silver', 'Crude Oil', 'Natural Gas', 'Corn'].map(suggestion => (
                        <Badge 
                          key={suggestion}
                          variant="secondary" 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                          onClick={() => setSearchValue(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {filteredCommodities.length > 0 && (
                <CommandGroup heading={
                  <div className="flex items-center justify-between px-2 py-1">
                    <span>{`${filteredCommodities.length} résultat${filteredCommodities.length > 1 ? 's' : ''}`}</span>
                    <span className="text-xs text-muted-foreground">
                      {commodities.length} commodités au total
                    </span>
                  </div>
                }>
                  {filteredCommodities.map((commodity) => (
                    <CommandItem
                      key={commodity.symbol}
                      value={commodity.symbol}
                      onSelect={() => handleSelectCommodity(commodity)}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                    >
                      <CommodityIcon type={commodity.type} className="flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{commodity.symbol}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryBadgeColor(commodity.category)}`}
                          >
                            {getCategoryDisplayName(commodity.category)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {commodity.name}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(commodity.percentChange)}
                          <span className="text-sm font-medium">
                            {commodity.category === 'freight' 
                              ? commodity.price.toLocaleString('en-US', { 
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 4 
                                })
                              : commodity.price.toLocaleString()
                            }
                          </span>
                        </div>
                        <PriceChange 
                          value={commodity.percentChange} 
                          isPercentage={true} 
                          className="text-xs"
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 
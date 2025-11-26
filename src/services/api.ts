import { parse } from 'node-html-parser';
import { toast } from 'sonner';
import { scrapeTradingViewSymbol } from './puppeteerApi';

// Types
export type CommodityCategory = 'metals' | 'agricultural' | 'energy' | 'freight' | 'bunker';

export interface Commodity {
  symbol: string;
  name: string;
  price: number;
  absoluteChange: number;
  percentChange: number;
  high: number;
  low: number;
  technicalEvaluation: 'Positive' | 'Negative' | 'Neutral';
  type: string;
  category: CommodityCategory;
}

// Liste des symboles freight à scraper
const FREIGHT_SYMBOLS = [
  // Container Freight
  { symbol: 'CS21!', name: 'Container Freight (US West Coast to China/East Asia)', type: 'container' },
  
  // Freight Routes (Baltic)
  { symbol: 'TDM1!', name: 'Freight Route Ceyhan to Lavera (TD19)', type: 'freight_route' },
  { symbol: 'TC1!', name: 'Freight Route Cape Town to Singapore (TC1)', type: 'freight_route' },
  { symbol: 'TD1!', name: 'Freight Route Singapore to Japan (TD1)', type: 'freight_route' },
  { symbol: 'TD2!', name: 'Freight Route Singapore to South Korea (TD2)', type: 'freight_route' },
  { symbol: 'TD3!', name: 'Freight Route Middle East to Japan (TD3)', type: 'freight_route' },
  { symbol: 'TD4!', name: 'Freight Route Middle East to Singapore (TD4)', type: 'freight_route' },
  { symbol: 'TD5!', name: 'Freight Route Middle East to China (TD5)', type: 'freight_route' },
  { symbol: 'TD6!', name: 'Freight Route Algeria to Rotterdam (TD6)', type: 'freight_route' },
  { symbol: 'TD7!', name: 'Freight Route Caribbean to US Gulf (TD7)', type: 'freight_route' },
  { symbol: 'TD8!', name: 'Freight Route Caribbean to Singapore (TD8)', type: 'freight_route' },
  { symbol: 'TD9!', name: 'Freight Route Caribbean to US East Coast (TD9)', type: 'freight_route' },
  { symbol: 'TD10!', name: 'Freight Route Mediterranean to Japan (TD10)', type: 'freight_route' },
  { symbol: 'TD11!', name: 'Freight Route Mediterranean to US Gulf (TD11)', type: 'freight_route' },
  { symbol: 'TD12!', name: 'Freight Route Mediterranean to US East Coast (TD12)', type: 'freight_route' },
  { symbol: 'TD14!', name: 'Freight Route US Gulf to Japan (TD14)', type: 'freight_route' },
  { symbol: 'TD15!', name: 'Freight Route US Gulf to Singapore (TD15)', type: 'freight_route' },
  { symbol: 'TD16!', name: 'Freight Route US Gulf to China (TD16)', type: 'freight_route' },
  { symbol: 'TD17!', name: 'Freight Route US Gulf to Mediterranean (TD17)', type: 'freight_route' },
  { symbol: 'TD18!', name: 'Freight Route US Gulf to UK-Continent (TD18)', type: 'freight_route' },
  { symbol: 'TD19!', name: 'Freight Route Ceyhan to Lavera (TD19)', type: 'freight_route' },
  { symbol: 'TD20!', name: 'Freight Route Skikda to Lavera (TD20)', type: 'freight_route' },
  { symbol: 'TD21!', name: 'Freight Route West Africa to US Gulf (TD21)', type: 'freight_route' },
  { symbol: 'TD22!', name: 'Freight Route West Africa to US East Coast (TD22)', type: 'freight_route' },
  { symbol: 'TD23!', name: 'Freight Route West Africa to UK-Continent (TD23)', type: 'freight_route' },
  { symbol: 'TD24!', name: 'Freight Route West Africa to Singapore (TD24)', type: 'freight_route' },
  { symbol: 'TD25!', name: 'Freight Route West Africa to China (TD25)', type: 'freight_route' },
  { symbol: 'TD26!', name: 'Freight Route US Gulf to Amsterdam-Rotterdam-Antwerp (TD26)', type: 'freight_route' },
  { symbol: 'TD27!', name: 'Freight Route US Gulf to Japan (TD27)', type: 'freight_route' },
  { symbol: 'TD28!', name: 'Freight Route US Gulf to Singapore (TD28)', type: 'freight_route' },
  { symbol: 'TD29!', name: 'Freight Route US Gulf to China (TD29)', type: 'freight_route' },
  { symbol: 'TD30!', name: 'Freight Route US Gulf to Mediterranean (TD30)', type: 'freight_route' },
  
  // LNG Freight
  { symbol: 'BLNG1!', name: 'LNG Freight Route (BLNG1)', type: 'lng_freight' },
  { symbol: 'BLNG2!', name: 'LNG Freight Route (BLNG2)', type: 'lng_freight' },
  { symbol: 'BLNG3!', name: 'LNG Freight Route (BLNG3)', type: 'lng_freight' },
  
  // Dirty Freight
  { symbol: 'USC1!', name: 'Dirty Freight Route (USC1)', type: 'dirty_freight' },
  { symbol: 'USE1!', name: 'Dirty Freight Route (USE1)', type: 'dirty_freight' },
  { symbol: 'XUK1!', name: 'Dirty Freight Route (XUK1)', type: 'dirty_freight' },
];

// Cache
const cache: { [key: string]: { data: Commodity[]; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function loadFromCache(category: CommodityCategory): Commodity[] | null {
  const cached = cache[category];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function saveToCache(category: CommodityCategory, data: Commodity[]): void {
  cache[category] = {
    data,
    timestamp: Date.now()
  };
}

/**
 * Parse le HTML d'une page de symbole TradingView pour extraire les données
 */
function parseSymbolPage(htmlContent: string, symbol: string, defaultName: string, defaultType: string): Commodity | null {
  try {
    const root = parse(htmlContent);
    
    // Extraire le prix
    let price = 0;
    const priceElement = root.querySelector('.js-symbol-last[data-qa-id="symbol-last-value"]');
    if (priceElement) {
      const priceText = priceElement.text.trim().replace(/[^\d.,-]/g, '');
      price = parseFloat(priceText.replace(',', '')) || 0;
    }
    
    // Si pas de prix trouvé, essayer d'autres sélecteurs
    if (price === 0) {
      const altPriceElements = root.querySelectorAll('[class*="last"], [data-qa-id*="last"]');
      for (const el of altPriceElements) {
        const text = el.text.trim();
        const match = text.match(/(\d+[\.,]\d+)/);
        if (match) {
          price = parseFloat(match[1].replace(',', '')) || 0;
          if (price > 0) break;
        }
      }
    }
    
    // Extraire le nom
    let name = defaultName;
    const nameElement = root.querySelector('h1');
    if (nameElement) {
      const fullName = nameElement.text.trim();
      // Nettoyer le nom (enlever "Futures" et autres suffixes)
      name = fullName.replace(/\s*\(Baltic\)\s*Futures?/i, '').trim() || defaultName;
    }
    
    // Extraire la variation en pourcentage
    let percentChange = 0;
    const changeElements = root.querySelectorAll('[class*="change"], [class*="percent"]');
    for (const el of changeElements) {
      const text = el.text.trim();
      const percentMatch = text.match(/([+-]?\d+[\.,]?\d*)\s*%/);
      if (percentMatch) {
        percentChange = parseFloat(percentMatch[1].replace(',', '.')) || 0;
        break;
      }
    }
    
    // Extraire la variation absolue
    let absoluteChange = 0;
    for (const el of changeElements) {
      const text = el.text.trim();
      // Chercher un nombre sans % qui pourrait être la variation absolue
      if (!text.includes('%')) {
        const absMatch = text.match(/([+-]?\d+[\.,]?\d+)/);
        if (absMatch) {
          absoluteChange = parseFloat(absMatch[1].replace(',', '.')) || 0;
          // Si c'est un petit nombre, c'est probablement la variation absolue
          if (Math.abs(absoluteChange) < Math.abs(price) * 0.5) {
            break;
          }
        }
      }
    }
    
    // Si pas de variation trouvée, calculer depuis le pourcentage
    if (absoluteChange === 0 && percentChange !== 0 && price > 0) {
      absoluteChange = (price * percentChange) / 100;
    }
    
    // Déterminer le type
    const type = getCommodityType(symbol, name, 'freight');
    
    // High/Low - pas disponibles sur les pages de symboles individuels
    const high = price * 1.05; // Estimation
    const low = price * 0.95;  // Estimation
    
    if (price === 0) {
      console.warn(`No price found for symbol ${symbol}`);
      return null;
    }
    
    return {
      symbol,
      name,
      price,
      absoluteChange,
      percentChange,
      high,
      low,
      technicalEvaluation: percentChange >= 0 ? 'Positive' : 'Negative',
      type,
      category: 'freight'
    };
    
  } catch (error) {
    console.error(`Error parsing symbol page for ${symbol}:`, error);
    return null;
  }
}

/**
 * Détermine le type de commodité à partir du symbole ou du nom
 */
function getCommodityType(symbol: string, name: string, category: CommodityCategory): Commodity['type'] {
  const lowerSymbol = symbol.toLowerCase();
  const lowerName = name.toLowerCase();
  
  if (category === 'freight') {
    // Container freight routes
    if (lowerSymbol.includes('cs') || lowerName.includes('container freight') || lowerName.includes('fbx')) {
      return 'container';
    }
    // LNG Freight routes
    else if (lowerSymbol.includes('blng') || lowerSymbol.includes('bl') || lowerName.includes('lng freight') || lowerName.includes('lng')) {
      return 'lng_freight';
    }
    // Dirty freight routes
    else if (lowerSymbol.includes('usc') || lowerSymbol.includes('use') || lowerSymbol.includes('xuk') || lowerName.includes('dirty freight')) {
      return 'dirty_freight';
    }
    // General freight routes (TC, TD, TM, etc.)
    else if (lowerSymbol.match(/^(tc|td|tm|th|tk|tl|aeb|t2d|t7c|tdm|frs|t5c|acb|frc|t8c|flj|flp|tf2)/)) {
      return 'freight_route';
    }
  }
  
  return 'other';
}

/**
 * Scrape les données freight depuis les pages de symboles individuels
 */
export async function fetchFreightData(): Promise<Commodity[]> {
  console.log('Fetching freight data from TradingView symbol pages...');
  
  const commodities: Commodity[] = [];
  const errors: string[] = [];
  
  // Scraper chaque symbole en parallèle (avec limite pour éviter la surcharge)
  const batchSize = 5; // Scraper 5 symboles à la fois
  for (let i = 0; i < FREIGHT_SYMBOLS.length; i += batchSize) {
    const batch = FREIGHT_SYMBOLS.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async ({ symbol, name, type }) => {
      try {
        console.log(`Scraping freight symbol: ${symbol}`);
        
        // Le symbole pour l'URL doit inclure le "!" à la fin
        // scrapeTradingViewSymbol attend le symbole complet avec "!"
        const data = await scrapeTradingViewSymbol(symbol);
        
        if (!data || !data.data) {
          throw new Error(`No data received for ${symbol}`);
        }
        
        // Parser le HTML
        const commodity = parseSymbolPage(data.data, symbol, name, type);
        
        if (commodity) {
          console.log(`Successfully scraped ${symbol}: ${commodity.price} ${commodity.percentChange}%`);
          return commodity;
        } else {
          throw new Error(`Failed to parse data for ${symbol}`);
        }
      } catch (error) {
        const errorMsg = `Error scraping ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    const validCommodities = batchResults.filter((c): c is Commodity => c !== null);
    commodities.push(...validCommodities);
    
    // Petite pause entre les batches pour éviter la surcharge
    if (i + batchSize < FREIGHT_SYMBOLS.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (commodities.length === 0) {
    console.error('No freight commodities scraped successfully');
    if (errors.length > 0) {
      console.error('Errors:', errors);
    }
    throw new Error('Failed to fetch freight data');
  }
  
  console.log(`Successfully scraped ${commodities.length}/${FREIGHT_SYMBOLS.length} freight symbols`);
  
  return commodities;
}

/**
 * Fetches commodity data from TradingView for a specific category
 * Uses cache by default, but can be forced to refresh
 */
export async function fetchCommoditiesData(category: CommodityCategory = 'metals', forceRefresh: boolean = false): Promise<Commodity[]> {
  try {
    console.log(`Fetching data for ${category} from TradingView...`);
    
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedData = loadFromCache(category);
      if (cachedData) {
        console.log(`Returning cached data for ${category}: ${cachedData.length} items`);
        return cachedData;
      }
    } else {
      console.log(`Force refresh requested for ${category}, ignoring cache`);
    }

    // Special handling for freight
    if (category === 'freight') {
      const freightData = await fetchFreightData();
      saveToCache(category, freightData);
      return freightData;
    }
    
    // Pour les autres catégories, vous devrez implémenter les fonctions correspondantes
    // Pour l'instant, retourner un tableau vide
    console.warn(`Category ${category} not yet implemented`);
    return [];
    
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
    toast.error(`Error fetching ${category} data`);
    throw error;
  }
}

/**
 * Forces a refresh of commodity data for a specific category (ignores cache)
 */
export async function refreshCommoditiesData(category: CommodityCategory = 'metals'): Promise<Commodity[]> {
  return fetchCommoditiesData(category, true);
}


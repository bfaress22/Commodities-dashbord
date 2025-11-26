interface ScrapingResult {
  data: string;
}

// Configuration pour les différents environnements
const isDev = process.env.NODE_ENV === 'development';
const SCRAPING_SERVER_URL = isDev ? 'http://localhost:3000' : ''; // En production, utilise les API routes Vercel relatives
const API_KEY = ''; // Fallback API key

/**
 * Scrape une URL via le serveur local Puppeteer avec fallback vers API Ninja
 */
export async function scrapePage(url: string): Promise<ScrapingResult> {
  try {
    console.log(`Trying to scrape via Vercel Puppeteer functions: ${url}`);
    
    const apiUrl = `${SCRAPING_SERVER_URL}/api/webscraper?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      timeout: 20000 // 20 secondes timeout optimisé 
    } as any);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`Successfully scraped via Puppeteer ${url}: ${data.data.length} characters`);
    
    return data;
    
  } catch (error) {
    console.warn(`Puppeteer scraping failed for ${url}, falling back to API Ninja:`, error);
    
    // Fallback vers API Ninja
    try {
      const apiResponse = await fetch(`https://api.api-ninjas.com/v1/webscraper?url=${encodeURIComponent(url)}`, {
        headers: {
          'X-Api-Key': API_KEY
        }
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API Ninja error: ${apiResponse.status}`);
      }
      
      const data = await apiResponse.json();
      console.log(`Successfully scraped via API Ninja ${url}: ${data.data.length} characters`);
      
      return data;
      
    } catch (fallbackError) {
      console.error(`Both Puppeteer and API Ninja failed for ${url}:`, fallbackError);
      throw new Error(`All scraping methods failed: ${error.message} | ${fallbackError.message}`);
    }
  }
}

/**
 * Scrape une page TradingView spécifique pour un symbole
 */
export async function scrapeTradingViewSymbol(symbol: string): Promise<ScrapingResult> {
  try {
    console.log(`Scraping TradingView symbol: ${symbol}`);
    
    const apiUrl = `${SCRAPING_SERVER_URL}/api/tradingview/symbol/${symbol}`;
    
    const response = await fetch(apiUrl, {
      timeout: 20000 // Timeout optimisé pour les symboles
    } as any);
    
    if (!response.ok) {
      throw new Error(`Vercel function error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully scraped via Vercel symbol ${symbol}: ${data.data.length} characters`);
    
    return data;
    
  } catch (error) {
    console.warn(`Vercel function failed for symbol ${symbol}, falling back:`, error);
    
    // Fallback vers la fonction générique ou API Ninja
    // On essaie sans préfixe NYMEX forcé, ou on laisse le symbole tel quel s'il a déjà un préfixe
    const urlSymbol = symbol.includes('-') ? symbol : `${symbol}`;
    const url = `https://www.tradingview.com/symbols/${urlSymbol}/`;
    return scrapePage(url);
  }
}

/**
 * Scrape une catégorie de commodités sur TradingView
 */
export async function scrapeTradingViewCategory(category: string): Promise<ScrapingResult> {
  try {
    console.log(`Scraping TradingView category: ${category}`);
    
    const apiUrl = `${SCRAPING_SERVER_URL}/api/tradingview/${category}`;
    
    const response = await fetch(apiUrl, {
      timeout: 20000 // Timeout optimisé pour les catégories
    } as any);
    
    if (!response.ok) {
      throw new Error(`Vercel function error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully scraped via Vercel category ${category}: ${data.data.length} characters`);
    
    return data;
    
  } catch (error) {
    console.warn(`Vercel function failed for category ${category}, falling back:`, error);
    
    // Fallback vers la fonction générique ou API Ninja
    const url = `https://www.tradingview.com/markets/futures/quotes-${category}/`;
    return scrapePage(url);
  }
}

/**
 * Scrape Ship & Bunker pour les prix des bunkers
 */
export async function scrapeShipAndBunker(bunkerType?: string): Promise<ScrapingResult> {
  try {
    console.log(`Scraping Ship & Bunker: ${bunkerType || 'all types'}`);
    
    let apiUrl = `${SCRAPING_SERVER_URL}/api/shipandbunker`;
    if (bunkerType) {
      apiUrl += `?type=${bunkerType}`;
    }
    
    const response = await fetch(apiUrl, {
      timeout: 15000 // Timeout plus court pour Ship & Bunker
    } as any);
    
    if (!response.ok) {
      throw new Error(`Vercel function error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully scraped via Vercel Ship & Bunker: ${data.data.length} characters`);
    
    return data;
    
  } catch (error) {
    console.warn(`Vercel function failed for Ship & Bunker, falling back:`, error);
    
    // Fallback vers la fonction générique ou API Ninja
    let url = 'https://shipandbunker.com/prices';
    if (bunkerType) {
      url += `#${bunkerType.toUpperCase()}`;
    }
    return scrapePage(url);
  }
}

/**
 * Scrape la page EMEA de Ship & Bunker pour Gibraltar
 */
export async function scrapeShipAndBunkerEMEA(): Promise<ScrapingResult> {
  try {
    console.log('Scraping Ship & Bunker EMEA');
    
    const apiUrl = `${SCRAPING_SERVER_URL}/api/shipandbunker/emea`;
    
    const response = await fetch(apiUrl, {
      timeout: 15000 // Timeout plus court pour Ship & Bunker EMEA  
    } as any);
    
    if (!response.ok) {
      throw new Error(`Vercel function error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully scraped via Vercel Ship & Bunker EMEA: ${data.data.length} characters`);
    
    return data;
    
  } catch (error) {
    console.warn(`Vercel function failed for Ship & Bunker EMEA, falling back:`, error);
    
    // Fallback vers la fonction générique ou API Ninja
    const url = 'https://shipandbunker.com/prices/emea';
    return scrapePage(url);
  }
} 
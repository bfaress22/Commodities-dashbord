interface ScrapingResult {
  data: string;
}

// URL du serveur local de scraping
const SCRAPING_SERVER_URL = 'http://localhost:3001';
const API_KEY = ''; // Fallback API key

/**
 * Scrape une URL via le serveur local Puppeteer avec fallback vers API Ninja
 */
export async function scrapePage(url: string): Promise<ScrapingResult> {
  try {
    console.log(`Trying to scrape via local Puppeteer server: ${url}`);
    
    const response = await fetch(`${SCRAPING_SERVER_URL}/api/webscraper?url=${encodeURIComponent(url)}`, {
      timeout: 10000 // 10 secondes timeout
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
  const url = `https://www.tradingview.com/symbols/NYMEX-${symbol}/`;
  return scrapePage(url); // Utilise la fonction avec fallback
}

/**
 * Scrape une catégorie de commodités sur TradingView
 */
export async function scrapeTradingViewCategory(category: string): Promise<ScrapingResult> {
  const url = `https://www.tradingview.com/markets/futures/quotes-${category}/`;
  return scrapePage(url); // Utilise la fonction avec fallback
}

/**
 * Scrape Ship & Bunker pour les prix des bunkers
 */
export async function scrapeShipAndBunker(bunkerType?: string): Promise<ScrapingResult> {
  let url = 'https://shipandbunker.com/prices';
  if (bunkerType) {
    url += `#${bunkerType.toUpperCase()}`;
  }
  return scrapePage(url); // Utilise la fonction avec fallback
}

/**
 * Scrape la page EMEA de Ship & Bunker pour Gibraltar
 */
export async function scrapeShipAndBunkerEMEA(): Promise<ScrapingResult> {
  const url = 'https://shipandbunker.com/prices/emea';
  return scrapePage(url); // Utilise la fonction avec fallback
} 
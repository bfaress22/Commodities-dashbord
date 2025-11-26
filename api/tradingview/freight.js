import { getBrowser, setupPage, setCorsHeaders } from '../utils/puppeteer-config.js';

// Liste des symboles freight à récupérer
const FREIGHT_SYMBOLS = [
  // Container freight
  { symbol: 'CS21!', name: 'Container Freight FBX02 (Baltic) Futures', type: 'container' },
  { symbol: 'CS11!', name: 'Container Freight FBX01 (Baltic) Futures', type: 'container' },
  { symbol: 'CS31!', name: 'Container Freight FBX03 (Baltic) Futures', type: 'container' },
  
  // Freight routes - les plus importants
  { symbol: 'TM1!', name: 'Freight Route TC2 (Baltic) Futures', type: 'freight_route' },
  { symbol: 'TD81!', name: 'Freight Route TD8 (Baltic) Futures', type: 'freight_route' },
  { symbol: 'TC71!', name: 'Freight Route TC7 (Baltic) Futures', type: 'freight_route' },
  { symbol: 'TL1!', name: 'Freight Route TD3C (Baltic) Futures', type: 'freight_route' },
  
  // LNG Freight
  { symbol: 'BG11!', name: 'LNG Freight Australia to Japan (BLNG1-174)', type: 'lng_freight' },
  { symbol: 'BG31!', name: 'LNG Freight US Gulf to Japan (BLNG3-174)', type: 'lng_freight' },
  
  // Dirty freight
  { symbol: 'USC1!', name: 'USGC to China (Platts) Dirty Freight Futures', type: 'dirty_freight' },
  { symbol: 'USE1!', name: 'USGC to UK Continent (Platts) Dirty Freight Futures', type: 'dirty_freight' }
];

// Fonction pour extraire le prix depuis le HTML
function extractPriceFromHtml(html, symbol) {
  // Nombres à exclure (IDs, timestamps, etc.)
  const excludedNumbers = [20000, 2000, 10000, 50000, 9999, 8888, 7777, 2024, 2025];
  
  // Pattern 1: Chercher "XXX USD" ou "XXX" suivi de "USD"
  const usdPatterns = [
    />(\d{1,4}(?:[.,]\d{1,4})?)\s*USD/gi,
    />(\d{1,4}(?:[.,]\d{1,4})?)<\/[^>]*>[^<]*USD/gi,
    /(\d{2,4}(?:[.,]\d{1,4})?)\s*USD/gi
  ];
  
  for (const pattern of usdPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      let priceStr = match[1];
      // Normaliser le format
      if (priceStr.includes(',') && !priceStr.includes('.')) {
        priceStr = priceStr.replace(',', '.');
      } else if (priceStr.includes(',') && priceStr.includes('.')) {
        priceStr = priceStr.replace(',', '');
      }
      const price = parseFloat(priceStr);
      if (price >= 50 && price < 10000 && !excludedNumbers.includes(price)) {
        console.log(`Found price for ${symbol}: ${price}`);
        return price;
      }
    }
  }
  
  // Pattern 2: Chercher dans le contexte de "price" ou "quote"
  const priceContextPattern = /(?:price|quote|value)[^>]*>[\s\S]*?(\d{2,4}(?:[.,]\d{1,4})?)/gi;
  const contextMatches = html.matchAll(priceContextPattern);
  for (const match of contextMatches) {
    let priceStr = match[1];
    if (priceStr.includes(',') && !priceStr.includes('.')) {
      priceStr = priceStr.replace(',', '.');
    }
    const price = parseFloat(priceStr);
    if (price >= 50 && price < 10000 && !excludedNumbers.includes(price)) {
      console.log(`Found price in context for ${symbol}: ${price}`);
      return price;
    }
  }
  
  return 0;
}

// Fonction pour extraire le changement depuis le HTML
function extractChangeFromHtml(html) {
  // Chercher les patterns de changement
  const changePatterns = [
    /([+-−]?\d{1,3}(?:[.,]\d{1,2})?)\s*%/gi,
    /change[^>]*>[\s\S]*?([+-−]?\d{1,3}(?:[.,]\d{1,2})?)/gi
  ];
  
  for (const pattern of changePatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      let changeStr = match[1].replace('−', '-').replace(',', '.');
      const change = parseFloat(changeStr);
      if (!isNaN(change) && Math.abs(change) < 100) {
        return change;
      }
    }
  }
  
  return 0;
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser = null;
  let page = null;
  const results = [];

  try {
    console.log('Starting freight data scraping...');
    const startTime = Date.now();
    
    browser = await getBrowser();
    page = await browser.newPage();
    await setupPage(page);
    
    // Traiter les symboles par batch de 3 pour éviter les timeouts
    const batchSize = 3;
    for (let i = 0; i < FREIGHT_SYMBOLS.length; i += batchSize) {
      const batch = FREIGHT_SYMBOLS.slice(i, i + batchSize);
      
      // Traiter le batch en parallèle avec Promise.allSettled
      const batchPromises = batch.map(async ({ symbol, name, type }) => {
        try {
          const url = `https://www.tradingview.com/symbols/NYMEX-${symbol}/`;
          console.log(`Fetching ${symbol}...`);
          
          await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });
          
          // Attente courte
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const html = await page.content();
          
          const price = extractPriceFromHtml(html, symbol);
          const changePercent = extractChangeFromHtml(html);
          
          if (price > 0) {
            return {
              symbol,
              name,
              price,
              change: Math.round(price * changePercent / 100 * 100) / 100,
              changePercent,
              high: 0,
              low: 0,
              type,
              category: 'freight'
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error.message);
          return null;
        }
      });
      
      // Attendre ce batch séquentiellement (car on réutilise la même page)
      for (const promise of batchPromises) {
        const result = await promise;
        if (result) {
          results.push(result);
        }
      }
      
      // Petit délai entre les batches
      if (i + batchSize < FREIGHT_SYMBOLS.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`Freight scraping completed: ${results.length}/${FREIGHT_SYMBOLS.length} symbols in ${duration}ms`);
    
    return res.status(200).json({
      success: true,
      count: results.length,
      duration,
      data: results
    });
    
  } catch (error) {
    console.error('Error in freight scraping:', error);
    return res.status(500).json({ 
      error: 'Failed to scrape freight data',
      message: error.message 
    });
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}


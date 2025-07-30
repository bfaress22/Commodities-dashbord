import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS
app.use(cors());
app.use(express.json());

// Configuration Puppeteer simplifiée pour résoudre les problèmes
const PUPPETEER_CONFIG = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ]
};

// Cache des instances de navigateur pour éviter les redémarrages
let browserInstance = null;

// Obtient ou crée une instance de navigateur
async function getBrowserInstance() {
  if (!browserInstance || !browserInstance.isConnected()) {
    console.log('Launching new browser instance...');
    browserInstance = await puppeteer.launch(PUPPETEER_CONFIG);
  }
  return browserInstance;
}

// Scrape une URL avec Puppeteer
async function scrapePage(url) {
  let page = null;
  
  try {
    console.log(`Scraping with Puppeteer: ${url}`);
    
    const browser = await getBrowserInstance();
    console.log('Browser instance obtained successfully');
    
    page = await browser.newPage();
    console.log('New page created successfully');
    
    // Configuration de la page
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Temporairement désactiver le blocage des ressources pour déboguer
    // await page.setRequestInterception(true);
    // page.on('request', (req) => {
    //   const resourceType = req.resourceType();
    //   if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
    //     req.abort();
    //   } else {
    //     req.continue();
    //   }
    // });
    
    // Naviguer vers la page avec une approche plus simple
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('Page loaded successfully');
    
    // Attendre un délai fixe plutôt que d'attendre des sélecteurs spécifiques
    console.log('Waiting for content to render...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Wait completed');
    
    // Extraire le HTML
    const html = await page.content();
    
    console.log(`Successfully scraped ${url}: ${html.length} characters`);
    
    // Vérifier si nous avons du contenu utile
    if (html.length < 1000) {
      console.warn(`Warning: Very small HTML content (${html.length} chars) for ${url}`);
    }
    
    // Log quelques info pour déboguer
    if (url.includes('tradingview.com')) {
      const title = await page.title();
      console.log(`TradingView page title: ${title}`);
    }
    
    return {
      data: html
    };
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  } finally {
    if (page) {
      await page.close();
    }
  }
}

// Routes API

// Route générique pour webscraper (compatible avec l'ancienne API Ninja)
app.get('/api/webscraper', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    const result = await scrapePage(decodeURIComponent(url));
    res.json(result);
    
  } catch (error) {
    console.error('Error in webscraper route:', error);
    res.status(500).json({ error: 'Failed to scrape the requested URL' });
  }
});

// Route spécifique pour TradingView categories
app.get('/api/tradingview/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const url = `https://www.tradingview.com/markets/futures/quotes-${category}/`;
    
    const result = await scrapePage(url);
    res.json(result);
    
  } catch (error) {
    console.error('Error in TradingView category route:', error);
    res.status(500).json({ error: 'Failed to scrape TradingView category' });
  }
});

// Route spécifique pour TradingView symbols
app.get('/api/tradingview/symbol/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const url = `https://www.tradingview.com/symbols/NYMEX-${symbol}/`;
    
    const result = await scrapePage(url);
    res.json(result);
    
  } catch (error) {
    console.error('Error in TradingView symbol route:', error);
    res.status(500).json({ error: 'Failed to scrape TradingView symbol' });
  }
});

// Route spécifique pour Ship & Bunker
app.get('/api/shipandbunker', async (req, res) => {
  try {
    const { type } = req.query;
    let url = 'https://shipandbunker.com/prices';
    
    if (type) {
      url += `#${type.toUpperCase()}`;
    }
    
    const result = await scrapePage(url);
    res.json(result);
    
  } catch (error) {
    console.error('Error in Ship & Bunker route:', error);
    res.status(500).json({ error: 'Failed to scrape Ship & Bunker' });
  }
});

// Route spécifique pour Ship & Bunker EMEA
app.get('/api/shipandbunker/emea', async (req, res) => {
  try {
    const url = 'https://shipandbunker.com/prices/emea';
    
    const result = await scrapePage(url);
    res.json(result);
    
  } catch (error) {
    console.error('Error in Ship & Bunker EMEA route:', error);
    res.status(500).json({ error: 'Failed to scrape Ship & Bunker EMEA' });
  }
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Puppeteer scraping server is running' });
});

// Ferme l'instance du navigateur lors de l'arrêt du serveur
async function closeBrowser() {
  if (browserInstance) {
    console.log('Closing browser instance...');
    await browserInstance.close();
    browserInstance = null;
  }
}

// Nettoie les ressources lors de l'arrêt
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await closeBrowser();
  process.exit(0);
});

// Démarre le serveur
app.listen(PORT, () => {
  console.log(`Puppeteer scraping server running on port ${PORT}`);
}); 
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Configuration Chromium optimisée pour serverless
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

// Configuration pour l'environnement serverless
const isDev = process.env.NODE_ENV === 'development' || !process.env.VERCEL;

async function getBrowser() {
  console.log(`Getting browser (isDev: ${isDev}, VERCEL: ${process.env.VERCEL})`);
  
  const executablePath = isDev 
    ? (process.platform === 'win32' 
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/usr/bin/google-chrome')
    : await chromium.executablePath();
  
  console.log(`Using executable path: ${executablePath}`);
  
  return puppeteer.launch({
    args: isDev ? [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ] : chromium.args,
    defaultViewport: { width: 1920, height: 1080 },
    executablePath,
    headless: 'new',
    ignoreHTTPSErrors: true,
  });
}

export default async function handler(req, res) {
  // Configurer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  const url = `https://www.tradingview.com/symbols/NYMEX-${symbol}/`;

  let browser = null;
  let page = null;

  try {
    console.log(`Scraping TradingView symbol: ${symbol}`);
    
    browser = await getBrowser();
    page = await browser.newPage();
    
    // Configuration de la page
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Bloquer les ressources inutiles pour accélérer le chargement
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    // Naviguer vers la page
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 25000 
    });
    console.log('TradingView symbol page loaded successfully');
    
    // Attendre que le prix soit visible
    console.log('Waiting for price element to render...');
    try {
      await page.waitForFunction(() => {
        // Chercher le JSON-LD ou le prix dans le DOM
        const jsonLd = document.querySelector('script[type="application/ld+json"]');
        return jsonLd && jsonLd.textContent.includes('USD');
      }, { timeout: 8000 });
      console.log('Price element found');
    } catch (e) {
      console.log('Price wait timed out, continuing anyway...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Extraire le HTML
    const html = await page.content();
    
    console.log(`Successfully scraped TradingView symbol ${symbol}: ${html.length} characters`);
    
    return res.status(200).json({
      data: html
    });
    
  } catch (error) {
    console.error(`Error scraping TradingView symbol ${symbol}:`, error);
    return res.status(500).json({ 
      error: 'Failed to scrape TradingView symbol',
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
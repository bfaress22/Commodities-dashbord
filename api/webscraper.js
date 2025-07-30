import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Configuration pour l'environnement serverless
const isDev = !process.env.AWS_REGION;

async function getBrowser() {
  return puppeteer.launch({
    args: [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // Importante pour les performances serverless
      '--disable-gpu'
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath: isDev 
      ? undefined 
      : await chromium.executablePath(),
    headless: chromium.headless,
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

  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  let browser = null;
  let page = null;

  try {
    console.log(`Scraping with Vercel Puppeteer: ${url}`);
    
    browser = await getBrowser();
    page = await browser.newPage();
    
    // Configuration de la page pour la performance
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Bloquer les ressources inutiles pour accélérer le chargement
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font' || 
          resourceType === 'other' || resourceType === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    // Naviguer vers la page avec stratégie rapide
    console.log(`Navigating to: ${decodeURIComponent(url)}`);
    await page.goto(decodeURIComponent(url), { 
      waitUntil: 'domcontentloaded', // Plus rapide que networkidle
      timeout: 20000 // Timeout réduit
    });
    console.log('Page loaded successfully');
    
    // Attendre intelligemment selon le type de site
    const targetUrl = decodeURIComponent(url);
    if (targetUrl.includes('tradingview.com')) {
      // Pour TradingView, attendre les tableaux spécifiquement
      try {
        await page.waitForSelector('table, tr, .tv-data-table, [data-rowid]', { timeout: 8000 });
        console.log('TradingView content detected, waiting 2s more...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.log('TradingView selectors timeout, proceeding with fixed wait...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } else if (targetUrl.includes('shipandbunker.com')) {
      // Pour Ship & Bunker, attendre les tables de prix
      try {
        await page.waitForSelector('table, .price-table, tr', { timeout: 6000 });
        console.log('Ship & Bunker content detected, waiting 1s more...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log('Ship & Bunker selectors timeout, proceeding with fixed wait...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      // Pour autres sites, attente minimale
      console.log('Generic site, waiting 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log('Wait completed');
    
    // Extraire le HTML
    const html = await page.content();
    
    console.log(`Successfully scraped ${decodeURIComponent(url)}: ${html.length} characters`);
    
    // Vérifier si nous avons du contenu utile
    if (html.length < 1000) {
      console.warn(`Warning: Very small HTML content (${html.length} chars)`);
    }
    
    return res.status(200).json({
      data: html
    });
    
  } catch (error) {
    console.error(`Error scraping ${decodeURIComponent(url)}:`, error);
    return res.status(500).json({ 
      error: 'Failed to scrape the requested URL',
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
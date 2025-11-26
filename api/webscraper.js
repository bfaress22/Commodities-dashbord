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
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled', // Anti-détection Cloudflare
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-infobars',
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
    
    // User-Agent moderne
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    // Masquer les signaux d'automation AVANT la navigation
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };
      
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en', 'fr'],
      });
    });
    
    // Configuration de la page avec headers réalistes
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(userAgent);
    
    // Headers supplémentaires pour simuler un vrai navigateur
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
    });
    
    // Bloquer les ressources inutiles pour accélérer le chargement (mais garder les scripts pour Cloudflare)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // Ne bloquer QUE les images et fonts, garder CSS et scripts pour Cloudflare
      if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    // Naviguer vers la page
    const targetUrl = decodeURIComponent(url);
    console.log(`Navigating to: ${targetUrl}`);
    
    await page.goto(targetUrl, { 
      waitUntil: 'networkidle2', // Meilleur pour Cloudflare
      timeout: 60000 // Timeout plus long pour Cloudflare
    });
    
    // Vérifier si on est bloqué par Cloudflare
    const initialContent = await page.content();
    if (initialContent.includes('Just one more step') || 
        initialContent.includes('Security check') ||
        initialContent.includes('Checking your browser') ||
        initialContent.includes('cf-browser-verification')) {
      console.log('Cloudflare challenge detected, waiting for validation...');
      
      // Attendre que Cloudflare valide
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Recharger la page après validation
      await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
      
      // Vérifier à nouveau
      const reloadedContent = await page.content();
      if (reloadedContent.includes('Just one more step') || 
          reloadedContent.includes('Security check')) {
        throw new Error('Still blocked by Cloudflare after wait');
      }
    }
    
    console.log('Page loaded successfully');
    
    // Attendre intelligemment selon le type de site
    if (targetUrl.includes('tradingview.com')) {
      // Pour TradingView, attendre les éléments de prix
      try {
        await page.waitForSelector('[data-test-id="quote-lp"], .tv-symbol-price-quote__value, table, tr, .tv-data-table', { timeout: 10000 });
        console.log('TradingView content detected, waiting 3s more...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.log('TradingView selectors timeout, proceeding with fixed wait...');
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    } else if (targetUrl.includes('shipandbunker.com')) {
      // Pour Ship & Bunker, attendre les tables de prix
      try {
        await page.waitForSelector('table, .price-table, tr', { timeout: 6000 });
        console.log('Ship & Bunker content detected, waiting 2s more...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.log('Ship & Bunker selectors timeout, proceeding with fixed wait...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } else {
      // Pour autres sites, attente minimale
      console.log('Generic site, waiting 3s...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    console.log('Wait completed');
    
    // Extraire le HTML
    const html = await page.content();
    
    // Vérifier à nouveau si on a été bloqué après le chargement
    if (html.includes('Just one more step') || 
        html.includes('Security check') ||
        html.includes('Checking your browser')) {
      throw new Error('Blocked by Cloudflare after content load');
    }
    
    console.log(`Successfully scraped ${targetUrl}: ${html.length} characters`);
    
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
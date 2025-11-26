import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Configuration pour l'environnement serverless
const isDev = !process.env.AWS_REGION;

async function getBrowser() {
  return puppeteer.launch({
    args: [
      ...chromium.args,
      '--disable-blink-features=AutomationControlled', // Désactive les flags d'automation
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-infobars',
      '--window-size=1920,1080',
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath: isDev 
      ? undefined // Utilise l'installation locale en développement
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

  const { symbol, exchange } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  // Construire l'URL
  // Si un échange est fourni, l'utiliser (ex: CME-CS61!)
  // Si le symbole contient déjà un tiret, supposer qu'il contient l'échange
  // Sinon, essayer sans échange (TradingView redirige souvent) ou utiliser NYMEX par défaut pour compatibilité si nécessaire
  let urlSymbol = symbol;
  if (exchange) {
    urlSymbol = `${exchange}-${symbol}`;
  } else if (!symbol.includes('-') && !symbol.includes(':')) {
    // Pour la rétrocompatibilité ou si on veut un défaut. 
    // Mais pour le fret, on veut éviter NYMEX forcé.
    // On essaie sans préfixe, ou on laisse le client gérer.
  }

  const url = `https://www.tradingview.com/symbols/${urlSymbol}/`;

  let browser = null;
  let page = null;

  try {
    console.log(`Scraping TradingView symbol: ${symbol}`);
    
    browser = await getBrowser();
    page = await browser.newPage();
    
    // User-Agent moderne et réaliste
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    // Masquer les signaux d'automation AVANT la navigation
    await page.evaluateOnNewDocument(() => {
      // Masquer webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Masquer chrome
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };
      
      // Permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
      
      // Plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en', 'fr'],
      });
      
      // Override the `plugins` property to use a custom getter.
      Object.defineProperty(navigator, 'plugins', {
        get: function() {
          return [1, 2, 3, 4, 5];
        },
      });
    });
    
    // Configuration de la page avec headers réalistes
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(userAgent);
    
    // Headers supplémentaires pour simuler un vrai navigateur
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    });
    
    // Naviguer vers la page avec stratégie d'attente améliorée
    console.log(`Navigating to: ${url}`);
    
    // Attendre que Cloudflare passe (si présent)
    await page.goto(url, { 
      waitUntil: 'networkidle2', // Attendre que le réseau soit inactif
      timeout: 60000 // Timeout plus long pour Cloudflare
    });
    
    // Vérifier si on est bloqué par Cloudflare
    const initialContent = await page.content();
    if (initialContent.includes('Just one more step') || 
        initialContent.includes('Security check') ||
        initialContent.includes('Checking your browser') ||
        initialContent.includes('cf-browser-verification')) {
      console.log('Cloudflare challenge detected, waiting for validation...');
      
      // Attendre que Cloudflare valide (peut prendre 5-15 secondes)
      await new Promise(resolve => setTimeout(resolve, 12000));
      
      // Recharger la page après validation
      await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
      
      // Vérifier à nouveau
      const reloadedContent = await page.content();
      if (reloadedContent.includes('Just one more step') || 
          reloadedContent.includes('Security check')) {
        throw new Error('Still blocked by Cloudflare after wait');
      }
    }
    
    console.log('TradingView symbol page loaded successfully');
    
    // Attendre que le contenu JavaScript se charge complètement
    console.log('Waiting for TradingView symbol content to render...');
    
    // Attendre que les éléments de prix soient présents (avec plusieurs sélecteurs)
    try {
      await page.waitForSelector('[data-test-id="quote-lp"], .tv-symbol-price-quote__value, [class*="last-"], .js-symbol-last', {
        timeout: 15000
      });
      console.log('Price element found');
    } catch (e) {
      console.warn('Price element not found immediately, continuing anyway...');
    }
    
    // Délai supplémentaire pour le rendu JavaScript et les requêtes API
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Extraire le HTML
    const html = await page.content();
    
    // Vérifier à nouveau si on a été bloqué après le chargement
    if (html.includes('Just one more step') || 
        html.includes('Security check') ||
        html.includes('Checking your browser')) {
      throw new Error('Blocked by Cloudflare after content load');
    }
    
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
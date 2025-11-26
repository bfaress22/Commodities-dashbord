import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Configuration pour l'environnement serverless
const isDev = !process.env.AWS_REGION;

export async function getBrowser() {
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

export async function setupPage(page) {
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
  
  // Bloquer les ressources inutiles (mais garder CSS et scripts pour Cloudflare)
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
}

export async function smartWait(page, url) {
  // Vérifier d'abord si on est bloqué par Cloudflare
  const content = await page.content();
  if (content.includes('Just one more step') || 
      content.includes('Security check') ||
      content.includes('Checking your browser') ||
      content.includes('cf-browser-verification')) {
    console.log('Cloudflare challenge detected, waiting for validation...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
  }
  
  if (url.includes('tradingview.com')) {
    // Pour TradingView, attendre les éléments de prix
    try {
      await page.waitForSelector('[data-test-id="quote-lp"], .tv-symbol-price-quote__value, table, tr, .tv-data-table, [data-rowid]', { timeout: 10000 });
      console.log('TradingView content detected, waiting 3s more...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log('TradingView selectors timeout, proceeding with fixed wait...');
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  } else if (url.includes('shipandbunker.com')) {
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
}

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
} 
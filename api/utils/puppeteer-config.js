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

export async function setupPage(page) {
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
}

export async function smartWait(page, url) {
  if (url.includes('tradingview.com')) {
    // Détecter si c'est une page de symbole individuel ou une page de catégorie
    const isSymbolPage = url.includes('/symbols/') && !url.includes('/markets/');
    
    if (isSymbolPage) {
      // Pour les pages de symboles individuels, attendre le contenu principal
      try {
        // Attendre que le contenu principal soit chargé (plusieurs sélecteurs possibles)
        await page.waitForSelector('h1, [class*="symbol"], [class*="price"], main', { timeout: 8000 });
        console.log('TradingView symbol page content detected, waiting 3s for price to load...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.log('TradingView symbol selectors timeout, proceeding with fixed wait...');
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    } else {
      // Pour les pages de catégories, attendre les tableaux spécifiquement
      try {
        await page.waitForSelector('table, tr, .tv-data-table, [data-rowid]', { timeout: 8000 });
        console.log('TradingView category content detected, waiting 2s more...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.log('TradingView category selectors timeout, proceeding with fixed wait...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  } else if (url.includes('shipandbunker.com')) {
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
}

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
} 
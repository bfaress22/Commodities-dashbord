import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Configuration pour l'environnement serverless
const isDev = !process.env.AWS_REGION;

async function getBrowser() {
  return puppeteer.launch({
    args: chromium.args,
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

  const url = 'https://shipandbunker.com/prices/emea';

  let browser = null;
  let page = null;

  try {
    console.log('Scraping Ship & Bunker EMEA (Gibraltar)');
    
    browser = await getBrowser();
    page = await browser.newPage();
    
    // Configuration de la page
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Naviguer vers la page
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('Ship & Bunker EMEA page loaded successfully');
    
    // Attendre que le contenu se charge
    console.log('Waiting for Ship & Bunker EMEA content to render...');
    await new Promise(resolve => setTimeout(resolve, 6000));
    console.log('Wait completed');
    
    // Extraire le HTML
    const html = await page.content();
    
    console.log(`Successfully scraped Ship & Bunker EMEA: ${html.length} characters`);
    
    return res.status(200).json({
      data: html
    });
    
  } catch (error) {
    console.error('Error scraping Ship & Bunker EMEA:', error);
    return res.status(500).json({ 
      error: 'Failed to scrape Ship & Bunker EMEA',
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
import { getBrowser, setupPage, smartWait, setCorsHeaders } from '../utils/puppeteer-config.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category } = req.query;
  
  if (!category) {
    return res.status(400).json({ error: 'Category parameter is required' });
  }

  const url = `https://www.tradingview.com/markets/futures/quotes-${category}/`;

  let browser = null;
  let page = null;

  try {
    console.log(`Fast scraping TradingView category: ${category}`);
    
    browser = await getBrowser();
    page = await browser.newPage();
    
    // Configuration optimisée de la page
    await setupPage(page);
    
    // Naviguer vers la page avec stratégie améliorée pour Cloudflare
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle2', // Meilleur pour Cloudflare
      timeout: 60000 // Timeout plus long pour Cloudflare
    });
    
    // Vérifier si on est bloqué par Cloudflare
    const initialContent = await page.content();
    if (initialContent.includes('Just one more step') || 
        initialContent.includes('Security check') ||
        initialContent.includes('Checking your browser')) {
      console.log('Cloudflare challenge detected, waiting for validation...');
      await new Promise(resolve => setTimeout(resolve, 12000));
      await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
    }
    
    console.log('TradingView page loaded successfully');
    
    // Attente intelligente optimisée
    await smartWait(page, url);
    
    // Extraire le HTML
    const html = await page.content();
    
    // Vérifier à nouveau si on a été bloqué après le chargement
    if (html.includes('Just one more step') || 
        html.includes('Security check') ||
        html.includes('Checking your browser')) {
      throw new Error('Blocked by Cloudflare after content load');
    }
    
    console.log(`Successfully scraped TradingView ${category}: ${html.length} characters`);
    
    return res.status(200).json({
      data: html
    });
    
  } catch (error) {
    console.error(`Error scraping TradingView ${category}:`, error);
    return res.status(500).json({ 
      error: 'Failed to scrape TradingView category',
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
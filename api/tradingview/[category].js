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
    
    // Naviguer vers la page avec timeout réduit
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 // Timeout réduit
    });
    console.log('TradingView page loaded successfully');
    
    // Attente intelligente optimisée
    await smartWait(page, url);
    
    // Extraire le HTML
    const html = await page.content();
    
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
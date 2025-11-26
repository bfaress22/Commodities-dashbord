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
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Naviguer vers la page et attendre le réseau idle
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    console.log('TradingView symbol page loaded successfully');
    
    // Attendre que l'élément de prix soit visible
    console.log('Waiting for price element...');
    try {
      await page.waitForSelector('.js-symbol-last', { timeout: 10000 });
      console.log('Price element found');
    } catch (e) {
      console.log('Price selector not found, waiting additional time...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Extraire les données directement dans le navigateur
    const extractedData = await page.evaluate(() => {
      // Extraire le prix principal
      const priceEl = document.querySelector('.js-symbol-last');
      const price = priceEl ? priceEl.textContent.trim() : null;
      
      // Extraire le changement
      const changeEl = document.querySelector('[class*="change"]');
      const changeText = changeEl ? changeEl.textContent.trim() : null;
      
      // Extraire le JSON-LD
      const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      let faqPrice = null;
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent);
          if (data['@type'] === 'FAQPage' && data.mainEntity) {
            const faq = data.mainEntity[0];
            if (faq?.acceptedAnswer?.text) {
              const match = faq.acceptedAnswer.text.match(/is\s+(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*USD/i);
              if (match) {
                faqPrice = match[1];
              }
            }
          }
        } catch (e) {}
      }
      
      return {
        directPrice: price,
        changeText: changeText,
        faqPrice: faqPrice,
        symbolFromPage: document.querySelector('[class*="title"]')?.textContent?.substring(0, 20)
      };
    });
    
    console.log(`Extracted data for ${symbol}:`, extractedData);
    
    // Extraire le HTML complet aussi pour le fallback
    const html = await page.content();
    
    console.log(`Successfully scraped TradingView symbol ${symbol}: ${html.length} characters`);
    
    return res.status(200).json({
      data: html,
      extracted: extractedData // Données pré-extraites pour faciliter le parsing
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

import { toast } from "sonner";
import { parse } from "node-html-parser";

// API key variable that can be updated
let API_KEY = 'V06SpYv2b/ptbqPxnvvhtg==3F5KAONfyIW0JKVl';

// Function to update the API key
export function updateApiKey(newKey: string) {
  API_KEY = newKey;
}

// Function to validate the API key
export async function validateApiKey(key: string): Promise<boolean> {
  try {
    // Test the API with the provided key
    const response = await fetch('https://api.api-ninjas.com/v1/webscraper?url=https://www.tradingview.com/markets/futures/quotes-metals/', {
      headers: {
        'X-Api-Key': key
      }
    });

    if (!response.ok) {
      return false;
    }

    // If we get a successful response, the key is valid
    const data = await response.json();
    return !!data && !!data.data;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}

// Types de matières premières disponibles
export type CommodityCategory = 'metals' | 'agricultural' | 'energy' | 'freight' | 'bunker';

// Interfaces for commodity data
export interface Commodity {
  symbol: string;
  name: string;
  price: number;
  percentChange: number;
  absoluteChange: number;
  high: number;
  low: number;
  technicalEvaluation: string;
  type: 'gold' | 'silver' | 'copper' | 'aluminum' | 'cobalt' | 'other' | 
        'corn' | 'wheat' | 'soybean' | 'cotton' | 'sugar' | 'cocoa' | 'coffee' | 'cattle' | 
        'crude' | 'gasoline' | 'heating_oil' | 'natural_gas' | 'ethanol' | 'coal' |
        'container' | 'freight_route' | 'lng_freight' | 'dirty_freight' |
        'vlsfo' | 'mgo' | 'ifo380';
  category: CommodityCategory;
}

// Liste des symboles freight avec leurs informations
const FREIGHT_SYMBOLS = [
  // Container Freight
  { symbol: 'CS61!', name: 'Container Freight (China/East Asia to Mediterranean) (FBX13) (Baltic) Futures', type: 'container' as const },
  { symbol: 'CS31!', name: 'Container Freight (China/East Asia to US East Coast) (FBX03) (Baltic) Futures', type: 'container' as const },
  { symbol: 'CS51!', name: 'Container Freight (North Europe to China/East Asia) (FBX12) (Baltic) Futures', type: 'container' as const },
  { symbol: 'CS11!', name: 'Container Freight (China/East Asia to US West Coast) (FBX01) (Baltic) Futures', type: 'container' as const },
  { symbol: 'CS21!', name: 'Container Freight (US West Coast to China/East Asia) (FBX02) (Baltic) Futures', type: 'container' as const },
  { symbol: 'CS41!', name: 'Container Freight (China/East Asia to North Europe) (FBX11) (Baltic) Futures', type: 'container' as const },
  
  // Freight Routes
  { symbol: 'TM1!', name: 'Freight Route TC2 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'TD81!', name: 'Freight Route TD8 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'TC71!', name: 'Freight Route TC7 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'TC61!', name: 'Freight Route TC6 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'TH1!', name: 'Freight Route TC5 (Platts) Futures', type: 'freight_route' as const },
  { symbol: 'TK1!', name: 'Freight Route TD7 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'TL1!', name: 'Freight Route TD3C (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'AEB1!', name: 'Freight Route TD25 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'T2D1!', name: 'Freight Route TD20 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'T7C1!', name: 'Freight Route TC17 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'TD31!', name: 'Freight Route TD3C (Platts) Futures', type: 'freight_route' as const },
  { symbol: 'TDM1!', name: 'Freight Route TD19 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'FRS1!', name: 'Freight Route TC12 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'T5C1!', name: 'Freight Route TC15 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'ACB1!', name: 'Freight Route TD22 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'FRC1!', name: 'Freight Route TC14 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'T8C1!', name: 'Freight Route TC18 (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'TC11!', name: 'Freight Route South Korea to Singapore (TC11) (Baltic) Futures', type: 'freight_route' as const },
  { symbol: 'TF21!', name: 'Freight Route Middle East to UK Continent (TC20) (Baltic) Futures', type: 'freight_route' as const },
  
  // LNG Freight
  { symbol: 'BG11!', name: 'LNG Freight Australia to Japan (BLNG1-174)', type: 'lng_freight' as const },
  { symbol: 'BG31!', name: 'LNG Freight US Gulf to Japan (BLNG3-174)', type: 'lng_freight' as const },
  { symbol: 'BG21!', name: 'LNG Freight US Gulf to Continent (BLNG2-174)', type: 'lng_freight' as const },
  { symbol: 'BL11!', name: 'LNG Freight Route BLNG1g (LNG Fuel) (Baltic) Futures', type: 'lng_freight' as const },
  { symbol: 'BL21!', name: 'LNG Freight Route BLNG2g (LNG Fuel) (Baltic) Futures', type: 'lng_freight' as const },
  { symbol: 'BL31!', name: 'LNG Freight Route BLNG3g (LNG Fuel) (Baltic) Futures', type: 'lng_freight' as const },
  
  // Dirty Freight
  { symbol: 'USC1!', name: 'USGC to China (Platts) Dirty Freight Futures', type: 'dirty_freight' as const },
  { symbol: 'USE1!', name: 'USGC to UK Continent (Platts) Dirty Freight Futures', type: 'dirty_freight' as const },
  { symbol: 'XUK1!', name: 'Cross North Sea Dirty Freight 80kt (Platts) Futures', type: 'dirty_freight' as const },
  
  // Liquid Petroleum Gas Freight
  { symbol: 'FLJ1!', name: 'Freight Route Liquid Petroleum Gas (BLPG3) (Baltic) Futures', type: 'lng_freight' as const },
  { symbol: 'FLP1!', name: 'Freight Route Liquid Petroleum Gas (BLPG1) (Baltic) Futures', type: 'lng_freight' as const }
];

/**
 * Récupère les données d'un symbole freight spécifique depuis TradingView
 */
async function fetchFreightSymbolData(symbol: string, name: string, type: Commodity['type']): Promise<Commodity | null> {
  try {
    const url = `https://api.api-ninjas.com/v1/webscraper?url=https://www.tradingview.com/symbols/NYMEX-${symbol}/`;
    
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.data) {
      console.warn(`No data received for ${symbol}`);
      return null;
    }

    // Parser le HTML pour extraire les données
    const htmlContent = data.data;
    const root = parse(htmlContent);
    
    // Extraire le prix principal
    let price = 0;
    let percentChange = 0;
    let absoluteChange = 0;
    
         // Rechercher les éléments de prix dans différents sélecteurs possibles
     const priceSelectors = [
       '.tv-symbol-price-quote__value',
       '[data-field="last_price"]',
       '.js-symbol-last',
       '.tv-symbol-header__price',
       '[class*="price"]'
     ];
     
     for (const selector of priceSelectors) {
       const priceElement = root.querySelector(selector);
       if (priceElement) {
         const rawPriceText = priceElement.text.trim();
         console.log(`Raw price text for ${symbol}: "${rawPriceText}"`);
         
         // Parser les prix avec séparateurs de milliers (ex: "9,564" ou "1,234.56")
         let priceText = rawPriceText;
         
         // Enlever les unités et espaces
         priceText = priceText.replace(/\s*(USD|usd|$|€|EUR|eur)\s*/gi, '');
         
         // Gérer les formats de nombres internationaux
         // Si on a plus d'une virgule ou point, c'est probablement des séparateurs de milliers
         const commaCount = (priceText.match(/,/g) || []).length;
         const dotCount = (priceText.match(/\./g) || []).length;
         
         if (commaCount > 1 || dotCount > 1) {
           // Multiple séparateurs = séparateurs de milliers
           // Garder seulement le dernier pour les décimales
           if (priceText.includes('.') && priceText.lastIndexOf('.') > priceText.lastIndexOf(',')) {
             // Format américain: 1,234.56
             priceText = priceText.replace(/,/g, '');
           } else {
             // Format européen: 1.234,56
             priceText = priceText.replace(/\./g, '').replace(',', '.');
           }
         } else if (commaCount === 1 && dotCount === 0) {
           // Une seule virgule - pourrait être séparateur décimal ou milliers
           const parts = priceText.split(',');
           if (parts[1] && parts[1].length <= 2) {
             // Probablement décimal (ex: "12,34")
             priceText = priceText.replace(',', '.');
           } else {
             // Probablement séparateur de milliers (ex: "9,564")
             priceText = priceText.replace(',', '');
           }
         } else if (dotCount === 1 && commaCount === 0) {
           // Un seul point - laisser tel quel
           // priceText = priceText (déjà correct)
         } else {
           // Cas complexe - enlever tout sauf dernière virgule/point
           priceText = priceText.replace(/[^\d.,]/g, '');
           if (priceText.includes('.') && priceText.includes(',')) {
             if (priceText.lastIndexOf('.') > priceText.lastIndexOf(',')) {
               priceText = priceText.replace(/,/g, '');
             } else {
               priceText = priceText.replace(/\./g, '').replace(/,([^,]*)$/, '.$1');
             }
           }
         }
         
         console.log(`Processed price text for ${symbol}: "${priceText}"`);
         price = parseFloat(priceText) || 0;
         
         if (price > 0) {
           console.log(`Successfully parsed price for ${symbol}: ${price}`);
           break;
         }
       }
     }
     
     // Si pas de prix trouvé, chercher dans le contenu général avec regex améliorée
     if (price === 0) {
       // Chercher des patterns comme "9,564 USD" ou "1,234.56 USD"
       const pricePatterns = [
         /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*USD/i,
         /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*USD/i,
         /(\d+(?:[,\.]\d+)*)\s*USD/i,
         /(\d+\.?\d*)\s*USD/i
       ];
       
       for (const pattern of pricePatterns) {
         const priceMatch = htmlContent.match(pattern);
         if (priceMatch) {
           let matchedPrice = priceMatch[1];
           
           // Traiter le prix matché de la même façon
           const commaCount = (matchedPrice.match(/,/g) || []).length;
           const dotCount = (matchedPrice.match(/\./g) || []).length;
           
           if (commaCount > 0 && dotCount === 0) {
             // Si on a "9,564" c'est probablement un séparateur de milliers
             if (matchedPrice.split(',')[1]?.length > 2) {
               matchedPrice = matchedPrice.replace(/,/g, '');
             } else {
               matchedPrice = matchedPrice.replace(',', '.');
             }
           } else if (commaCount > 0 && dotCount > 0) {
             // Format mixte - garder le dernier séparateur pour les décimales
             if (matchedPrice.lastIndexOf('.') > matchedPrice.lastIndexOf(',')) {
               matchedPrice = matchedPrice.replace(/,/g, '');
             } else {
               matchedPrice = matchedPrice.replace(/\./g, '').replace(/,([^,]*)$/, '.$1');
             }
           }
           
           price = parseFloat(matchedPrice) || 0;
           if (price > 0) {
             console.log(`Found price in content for ${symbol}: ${price}`);
             break;
           }
         }
       }
     }
    
         // Extraire les variations
     const changeSelectors = [
       '.tv-symbol-price-quote__change',
       '[data-field="change"]',
       '.js-symbol-change',
       '[class*="change"]'
     ];
     
     for (const selector of changeSelectors) {
       const changeElement = root.querySelector(selector);
       if (changeElement) {
         const rawChangeText = changeElement.text.trim();
         console.log(`Raw change text for ${symbol}: "${rawChangeText}"`);
         
         // Fonction pour parser un nombre avec séparateurs
         const parseNumber = (numStr: string): number => {
           if (!numStr) return 0;
           
           // Préserver le signe
           const isNegative = numStr.startsWith('-') || numStr.startsWith('−');
           const isPositive = numStr.startsWith('+');
           
           // Enlever les signes et espaces
           let cleanNum = numStr.replace(/^[+-−]\s*/, '');
           
           // Gérer les séparateurs de milliers
           const commaCount = (cleanNum.match(/,/g) || []).length;
           const dotCount = (cleanNum.match(/\./g) || []).length;
           
           if (commaCount === 1 && dotCount === 0) {
             const parts = cleanNum.split(',');
             if (parts[1] && parts[1].length > 2) {
               // Séparateur de milliers
               cleanNum = cleanNum.replace(',', '');
             } else {
               // Séparateur décimal
               cleanNum = cleanNum.replace(',', '.');
             }
           } else if (commaCount > 0) {
             // Multiple virgules = séparateurs de milliers
             cleanNum = cleanNum.replace(/,/g, '');
           }
           
           const result = parseFloat(cleanNum) || 0;
           return isNegative ? -result : result;
         };
         
         // Extraire la variation absolue (sans %)
         const absoluteMatch = rawChangeText.match(/([+-−]?\s*\d+(?:[,\.]\d+)*)\s*(?!\%)/);
         if (absoluteMatch) {
           absoluteChange = parseNumber(absoluteMatch[1]);
           console.log(`Parsed absolute change for ${symbol}: ${absoluteChange}`);
         }
         
         // Extraire la variation en pourcentage
         const percentMatch = rawChangeText.match(/([+-−]?\s*\d+(?:[,\.]\d+)*)\s*%/);
         if (percentMatch) {
           percentChange = parseNumber(percentMatch[1]);
           console.log(`Parsed percent change for ${symbol}: ${percentChange}`);
         }
         
         if (absoluteChange !== 0 || percentChange !== 0) break;
       }
     }
     
     // Extraire depuis le contenu HTML si pas trouvé
     if (percentChange === 0 && absoluteChange === 0) {
       // Chercher des patterns comme "+0.6966 +2.10%" ou "0 0.00%"
       const changePatterns = [
         /([+-]?\s*\d+(?:[,\.]\d+)*)\s*([+-]?\s*\d+(?:[,\.]\d+)*)%/,
         /([+-]?\s*\d+(?:[,\.]\d+)*)\s*USD.*?([+-]?\s*\d+(?:[,\.]\d+)*)%/i,
         /change.*?([+-]?\s*\d+(?:[,\.]\d+)*).*?([+-]?\s*\d+(?:[,\.]\d+)*)%/i
       ];
       
       for (const pattern of changePatterns) {
         const changeMatch = htmlContent.match(pattern);
         if (changeMatch) {
           const parseNumber = (numStr: string): number => {
             if (!numStr) return 0;
             const isNegative = numStr.includes('-') || numStr.includes('−');
             let cleanNum = numStr.replace(/[^\d.,]/g, '');
             if (cleanNum.includes(',') && cleanNum.split(',')[1]?.length > 2) {
               cleanNum = cleanNum.replace(',', '');
             } else {
               cleanNum = cleanNum.replace(',', '.');
             }
             const result = parseFloat(cleanNum) || 0;
             return isNegative ? -result : result;
           };
           
           absoluteChange = parseNumber(changeMatch[1]);
           percentChange = parseNumber(changeMatch[2]);
           
           if (absoluteChange !== 0 || percentChange !== 0) {
             console.log(`Found changes in content for ${symbol}: abs=${absoluteChange}, pct=${percentChange}`);
             break;
           }
         }
       }
     }
    
    console.log(`Parsed ${symbol}: price=${price}, change=${absoluteChange}, percent=${percentChange}`);
    
         // Retourner null si aucune données valide
     if (price === 0) {
       console.warn(`No valid price found for ${symbol}`);
       return null;
     }
     
     // Si aucune variation n'est trouvée, défaut à 0 (comme sur TradingView)
     if (isNaN(percentChange)) percentChange = 0;
     if (isNaN(absoluteChange)) absoluteChange = 0;
    
         return {
       symbol,
       name,
       price,
       percentChange,
       absoluteChange,
       high: 0, // Pour freight, pas besoin de high/low
       low: 0,
       technicalEvaluation: 'Neutral',
       type,
       category: 'freight'
     };
    
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

/**
 * Récupère toutes les données freight en parallèle
 */
async function fetchFreightData(): Promise<Commodity[]> {
  console.log('Fetching freight data from individual symbol pages...');
  
  // Limiter à 10 symboles en parallèle pour éviter la surcharge de l'API
  const batchSize = 5;
  const results: Commodity[] = [];
  
  for (let i = 0; i < FREIGHT_SYMBOLS.length; i += batchSize) {
    const batch = FREIGHT_SYMBOLS.slice(i, i + batchSize);
    
    const batchPromises = batch.map(({ symbol, name, type }) => 
      fetchFreightSymbolData(symbol, name, type)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      } else {
        console.warn(`Failed to fetch ${batch[index].symbol}:`, result.status === 'rejected' ? result.reason : 'No data');
      }
    });
    
    // Petit délai entre les batches pour respecter les limites de l'API
    if (i + batchSize < FREIGHT_SYMBOLS.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`Successfully fetched ${results.length} freight commodities`);
  return results;
}

/**
 * Scrapes bunker prices data from shipandbunker.com
 */
async function fetchBunkerData(): Promise<Commodity[]> {
  console.log('Fetching bunker data from shipandbunker.com...');
  
  const bunkerTypes = [
    { type: 'vlsfo', url: 'https://shipandbunker.com/prices#VLSFO', name: 'VLSFO' },
    { type: 'mgo', url: 'https://shipandbunker.com/prices#MGO', name: 'MGO' },
    { type: 'ifo380', url: 'https://shipandbunker.com/prices#IFO380', name: 'IFO380' }
  ];
  
  const allBunkerCommodities: Commodity[] = [];
  
  // First, try to fetch Gibraltar data specifically from EMEA page
  try {
    console.log('Fetching Gibraltar bunker data from EMEA page...');
    
    const gibraltarResponse = await fetch(`https://api.api-ninjas.com/v1/webscraper?url=${encodeURIComponent('https://shipandbunker.com/prices/emea')}`, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    if (gibraltarResponse.ok) {
      const gibraltarData = await gibraltarResponse.json();
      
      if (gibraltarData && gibraltarData.data) {
        const gibraltarCommodities = parseGibraltarData(gibraltarData.data);
        allBunkerCommodities.push(...gibraltarCommodities);
        console.log(`Found ${gibraltarCommodities.length} Gibraltar bunker commodities`);
      }
    }
    
    // Add delay before next requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error fetching Gibraltar data:', error);
  }
  
  // Continue with regular bunker types scraping
  for (const bunkerType of bunkerTypes) {
    try {
      console.log(`Fetching ${bunkerType.name} data...`);
      
      const response = await fetch(`https://api.api-ninjas.com/v1/webscraper?url=${encodeURIComponent(bunkerType.url)}`, {
        headers: {
          'X-Api-Key': API_KEY
        }
      });

      if (!response.ok) {
        console.warn(`Failed to fetch ${bunkerType.name}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (!data || !data.data) {
        console.warn(`No data received for ${bunkerType.name}`);
        continue;
      }

      const htmlContent = data.data;
      const root = parse(htmlContent);
      
      // Parse the bunker data from Ship & Bunker website
      const bunkerCommodities = parseBunkerData(htmlContent, bunkerType.type as 'vlsfo' | 'mgo' | 'ifo380', bunkerType.name);
      allBunkerCommodities.push(...bunkerCommodities);
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error fetching ${bunkerType.name}:`, error);
    }
  }
  
  console.log(`Successfully fetched ${allBunkerCommodities.length} bunker commodities`);
  return allBunkerCommodities;
}

/**
 * Parse bunker prices data from Ship & Bunker HTML
 */
function parseBunkerData(htmlContent: string, bunkerType: 'vlsfo' | 'mgo' | 'ifo380', bunkerTypeName: string): Commodity[] {
  try {
    const root = parse(htmlContent);
    const commodities: Commodity[] = [];
    
    console.log(`Parsing ${bunkerTypeName} data from HTML content (${htmlContent.length} chars)`);
    
    // Find price data in the HTML structure
    // Ship & Bunker uses various table structures - try multiple approaches
    let priceRows: any[] = [];
    
    // Try finding the main price table
    const priceTables = root.querySelectorAll('table.price-table, table[class*="price"], table[id*="price"]');
    if (priceTables.length > 0) {
      priceRows = priceTables[0].querySelectorAll('tbody tr, tr');
      console.log(`Found ${priceRows.length} rows in price table for ${bunkerTypeName}`);
    }
    
    // Fallback: look for any table with price data
    if (priceRows.length === 0) {
      const allTables = root.querySelectorAll('table');
      for (const table of allTables) {
        const tableText = table.text.toLowerCase();
        if (tableText.includes('price') || tableText.includes('$/mt') || 
            tableText.includes(bunkerTypeName.toLowerCase())) {
          priceRows = table.querySelectorAll('tbody tr, tr');
          console.log(`Found ${priceRows.length} rows in fallback table for ${bunkerTypeName}`);
          if (priceRows.length > 0) break;
        }
      }
    }
    
    // Final fallback: look for any rows with price-like data
    if (priceRows.length === 0) {
      priceRows = root.querySelectorAll('tr');
      console.log(`Using all ${priceRows.length} rows as final fallback for ${bunkerTypeName}`);
    }
    
    // Process the rows
    if (priceRows.length > 0) {
      priceRows.forEach((row, index) => {
        const commodity = extractBunkerCommodityFromRow(row, bunkerType, bunkerTypeName, index);
        if (commodity) {
          commodities.push(commodity);
        }
      });
    } else {
      console.log(`No table rows found for ${bunkerTypeName}, trying alternative extraction...`);
    }
    
    // If no data found in tables, try to extract from script tags or JSON data
    if (commodities.length === 0) {
      console.log(`No commodities found in tables, trying script extraction for ${bunkerTypeName}...`);
      
      const scriptTags = root.querySelectorAll('script');
      for (const script of scriptTags) {
        const scriptContent = script.innerHTML;
        if (scriptContent.includes('price') || scriptContent.includes(bunkerTypeName)) {
          // Try to extract JSON data from scripts
          const jsonMatch = scriptContent.match(/(\{[^}]*price[^}]*\})/g);
          if (jsonMatch) {
            jsonMatch.forEach(jsonStr => {
              try {
                const data = JSON.parse(jsonStr);
                if (data.price) {
                  const commodity = createBunkerCommodity(
                    data.port || data.location || `${bunkerTypeName}_${commodities.length + 1}`,
                    data.port || `${bunkerTypeName} Port ${commodities.length + 1}`,
                    bunkerType,
                    data.price,
                    data.change || 0,
                    data.changePercent || 0,
                    data.high || 0,
                    data.low || 0
                  );
                  commodities.push(commodity);
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            });
          }
        }
      }
      
      // Last resort: try to find price patterns in plain text
      if (commodities.length === 0) {
        console.log(`Still no data found, trying text pattern extraction for ${bunkerTypeName}...`);
        const textContent = htmlContent;
        
        // Look for patterns like "Singapore 550.00 -0.50 552.00 548.00"
        const pricePatterns = [
          /([A-Za-z\s]+)\s+(\d{3,4}\.?\d*)\s+([+-]?\d+\.?\d*)\s+(\d{3,4}\.?\d*)\s+(\d{3,4}\.?\d*)/g,
          /([A-Za-z\s]+).*?(\d{3,4}\.?\d*).*?([+-]?\d+\.?\d*)/g
        ];
        
        for (const pattern of pricePatterns) {
          let match;
          while ((match = pattern.exec(textContent)) !== null && commodities.length < 10) {
            const [, port, price, change, high, low] = match;
            
            if (port && price) {
              const commodity = createBunkerCommodity(
                `${bunkerType.toUpperCase()}_${port.trim().replace(/\s+/g, '_')}`,
                `${bunkerTypeName} - ${port.trim()}`,
                bunkerType,
                parseFloat(price) || 0,
                parseFloat(change) || 0,
                0, // percentChange
                parseFloat(high) || 0,
                parseFloat(low) || 0
              );
              
              if (commodity.price > 100) { // Sanity check for reasonable bunker prices
                commodities.push(commodity);
                console.log(`Extracted from text pattern: ${port.trim()} - ${price}`);
              }
            }
          }
          
          if (commodities.length > 0) break; // Stop if we found data with this pattern
        }
      }
    }
    

    
    console.log(`Parsed ${commodities.length} commodities for ${bunkerTypeName}`);
    return commodities;
    
  } catch (error) {
    console.error(`Error parsing bunker data for ${bunkerTypeName}:`, error);
    return [];
  }
}

/**
 * Extract commodity data from a table row
 */
function extractBunkerCommodityFromRow(row: any, bunkerType: 'vlsfo' | 'mgo' | 'ifo380', bunkerTypeName: string, index: number): Commodity | null {
  try {
    const cells = row.querySelectorAll('td, th');
    
    if (cells.length < 2) {
      return null; // Not enough data
    }
    
    let portName = '';
    let price = 0;
    let change = 0;
    let changePercent = 0;
    let high = 0;
    let low = 0;
    
    // Extract port/location name (usually first cell)
    const firstCell = cells[0];
    portName = firstCell.text.trim();
    
    if (!portName || portName.toLowerCase().includes('port') && portName.length < 3) {
      portName = `${bunkerTypeName} Port ${index + 1}`;
    }
    
    // Extract price data from cells - Ship & Bunker typical structure:
    // [Port, Price $/mt, Change, High, Low, Spread]
    for (let i = 1; i < cells.length; i++) {
      const cellText = cells[i].text.trim();
      
      // Cell 1: Price ($/mt)
      if (i === 1 && /^\d+[\d.,]*$/.test(cellText.replace(/[^\d.,]/g, ''))) {
        const priceText = cellText.replace(/[^\d.,]/g, '').replace(',', '.');
        price = parseFloat(priceText) || 0;
      }
      // Cell 2: Change (can have + or -)
      else if (i === 2 && /[+-]?\d+[\d.,]*/.test(cellText)) {
        const changeText = cellText.replace(/[^\d.,-]/g, '').replace(',', '.');
        change = parseFloat(changeText) || 0;
      }
      // Cell 3: High
      else if (i === 3 && /^\d+[\d.,]*$/.test(cellText.replace(/[^\d.,]/g, ''))) {
        const highText = cellText.replace(/[^\d.,]/g, '').replace(',', '.');
        high = parseFloat(highText) || 0;
      }
      // Cell 4: Low
      else if (i === 4 && /^\d+[\d.,]*$/.test(cellText.replace(/[^\d.,]/g, ''))) {
        const lowText = cellText.replace(/[^\d.,]/g, '').replace(',', '.');
        low = parseFloat(lowText) || 0;
      }
      // Alternative: look for patterns in any cell
      else {
        // Look for price patterns if not found yet
        if (price === 0 && /^\d{3,4}[\d.,]*$/.test(cellText.replace(/[^\d.,]/g, ''))) {
          const priceText = cellText.replace(/[^\d.,]/g, '').replace(',', '.');
          const potentialPrice = parseFloat(priceText) || 0;
                     if (potentialPrice > 100) { // Reasonable bunker price
             price = potentialPrice;
           }
        }
        // Look for high/low patterns
        else if ((high === 0 || low === 0) && /^\d{3,4}[\d.,]*$/.test(cellText.replace(/[^\d.,]/g, ''))) {
          const numText = cellText.replace(/[^\d.,]/g, '').replace(',', '.');
          const num = parseFloat(numText) || 0;
                     if (num > 100) {
             if (high === 0 && num > price) {
               high = num;
             } else if (low === 0 && num < price && num > 0) {
               low = num;
             }
           }
        }
        // Look for change patterns (with + or - signs)
        else if (/[+-]/.test(cellText) && change === 0) {
          const changeText = cellText.replace(/[^\d.,-]/g, '').replace(',', '.');
                     if (!cellText.includes('%')) {
             change = parseFloat(changeText) || 0;
           }
        }
      }
    }
    
    // Ensure high/low make sense
    if (high > 0 && low > 0 && high < low) {
      [high, low] = [low, high]; // Swap if reversed
    }
    
    // If high/low are missing, estimate them
    if (high === 0 && price > 0) {
      high = price * 1.05; // Estimate 5% above current price
    }
    if (low === 0 && price > 0) {
      low = price * 0.95; // Estimate 5% below current price
    }
    
    // Debug: only log if we have valid data
    if (price > 0) {
      console.log(`Extracted bunker data for ${portName}: price=${price}, change=${change}, high=${high}, low=${low}`);
    }
    
    // If we found valid data, create commodity
    if (price > 0 && portName) {
      return createBunkerCommodity(
        `${bunkerType.toUpperCase()}_${portName.replace(/\s+/g, '_')}`,
        `${bunkerTypeName} - ${portName}`,
        bunkerType,
        price,
        change,
        changePercent,
        high,
        low
      );
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting commodity from row:', error);
    return null;
  }
}

/**
 * Parse Gibraltar specific data from EMEA page
 */
function parseGibraltarData(htmlContent: string): Commodity[] {
  try {
    const root = parse(htmlContent);
    const commodities: Commodity[] = [];
    
    console.log('Parsing Gibraltar data from EMEA page...');
    
    // Look for Gibraltar specifically in the HTML
    const gibraltarRows = root.querySelectorAll('tr').filter(row => {
      const text = row.text.toLowerCase();
      return text.includes('gibraltar');
    });
    
    console.log(`Found ${gibraltarRows.length} Gibraltar rows`);
    
    for (const row of gibraltarRows) {
      const cells = row.querySelectorAll('td, th');
      
      if (cells.length >= 4) {
        // Expected structure: [Port Name, VLSFO, MGO, IFO380, Scrubber Spread]
        const portName = cells[0]?.text.trim() || '';
        
        if (portName.toLowerCase().includes('gibraltar')) {
          // Parse VLSFO (cell 1)
          const vlsfoText = cells[1]?.text.trim() || '';
          if (vlsfoText && vlsfoText !== '-' && !vlsfoText.includes('login')) {
            const vlsfoMatch = vlsfoText.match(/(\d+\.?\d*)/);
            if (vlsfoMatch) {
              const price = parseFloat(vlsfoMatch[1]);
              const changeMatch = vlsfoText.match(/([+-]?\d+\.?\d*)/g);
              const change = changeMatch && changeMatch.length > 1 ? parseFloat(changeMatch[1]) : 0;
              
                             commodities.push(createBunkerCommodity(
                 'VLSFO_Gibraltar',
                 'VLSFO - Gibraltar',
                 'vlsfo',
                 price,
                 0, // No change data for Gibraltar
                 0, // No percent change
                 0, // No high data for Gibraltar  
                 0  // No low data for Gibraltar
               ));
            }
          }
          
          // Parse MGO (cell 2) 
          const mgoText = cells[2]?.text.trim() || '';
          if (mgoText && mgoText !== '-' && !mgoText.includes('login')) {
            const mgoMatch = mgoText.match(/(\d+\.?\d*)/);
            if (mgoMatch) {
              const price = parseFloat(mgoMatch[1]);
              const changeMatch = mgoText.match(/([+-]?\d+\.?\d*)/g);
              const change = changeMatch && changeMatch.length > 1 ? parseFloat(changeMatch[1]) : 0;
              
                             commodities.push(createBunkerCommodity(
                 'MGO_Gibraltar',
                 'MGO - Gibraltar',
                 'mgo',
                 price,
                 0, // No change data for Gibraltar
                 0, // No percent change
                 0, // No high data for Gibraltar
                 0  // No low data for Gibraltar
               ));
            }
          }
          
          // Parse IFO380 (cell 3)
          const ifo380Text = cells[3]?.text.trim() || '';
          if (ifo380Text && ifo380Text !== '-' && !ifo380Text.includes('login')) {
            const ifo380Match = ifo380Text.match(/(\d+\.?\d*)/);
            if (ifo380Match) {
              const price = parseFloat(ifo380Match[1]);
              const changeMatch = ifo380Text.match(/([+-]?\d+\.?\d*)/g);
              const change = changeMatch && changeMatch.length > 1 ? parseFloat(changeMatch[1]) : 0;
              
                             commodities.push(createBunkerCommodity(
                 'IFO380_Gibraltar',
                 'IFO380 - Gibraltar',
                 'ifo380',
                 price,
                 0, // No change data for Gibraltar
                 0, // No percent change
                 0, // No high data for Gibraltar
                 0  // No low data for Gibraltar
               ));
            }
          }
        }
      }
    }
    
    // Alternative approach: look for Gibraltar in table data
    if (commodities.length === 0) {
      const textContent = htmlContent.toLowerCase();
      
      // Look for Gibraltar with VLSFO data: Gibraltar 541.00
      const gibraltarMatch = htmlContent.match(/gibraltar.*?(\d{3}\.\d{2})/i);
      if (gibraltarMatch) {
        const price = parseFloat(gibraltarMatch[1]);
        if (price > 0) {
                   commodities.push(createBunkerCommodity(
           'VLSFO_Gibraltar',
           'VLSFO - Gibraltar',
           'vlsfo',
           price,
           0, // No change data for Gibraltar
           0, // No percent change
           0, // No high data for Gibraltar
           0  // No low data for Gibraltar
         ));
        }
      }
      
      // Look for Gibraltar with IFO380: Gibraltar 486.50
      const ifo380Match = htmlContent.match(/gibraltar.*?(\d{3}\.\d{2}).*?(\d{3}\.\d{2})/i);
      if (ifo380Match && ifo380Match[2]) {
        const price = parseFloat(ifo380Match[2]);
        if (price > 0 && price !== parseFloat(ifo380Match[1])) {
                     commodities.push(createBunkerCommodity(
             'IFO380_Gibraltar',
             'IFO380 - Gibraltar',
             'ifo380',
             price,
             0, // No change data for Gibraltar
             0, // No percent change
             0, // No high data for Gibraltar
             0  // No low data for Gibraltar
           ));
        }
      }
    }
    
    console.log(`Extracted ${commodities.length} Gibraltar commodities`);
    return commodities;
    
  } catch (error) {
    console.error('Error parsing Gibraltar data:', error);
    return [];
  }
}

/**
 * Create a bunker commodity object
 */
function createBunkerCommodity(
  symbol: string,
  name: string,
  type: 'vlsfo' | 'mgo' | 'ifo380',
  price: number,
  absoluteChange: number = 0,
  percentChange: number = 0,
  high: number = 0,
  low: number = 0
): Commodity {
  return {
    symbol,
    name,
    price,
    percentChange,
    absoluteChange,
    high: high > 0 ? high : (symbol.includes('Gibraltar') ? 0 : price * 1.05), // No estimation for Gibraltar
    low: low > 0 ? low : (symbol.includes('Gibraltar') ? 0 : price * 0.95),     // No estimation for Gibraltar
    technicalEvaluation: absoluteChange >= 0 ? 'Positive' : 'Negative',
    type,
    category: 'bunker'
  };
}

/**
 * Fetches commodity data from TradingView via the API Ninja for a specific category
 */
export async function fetchCommoditiesData(category: CommodityCategory = 'metals'): Promise<Commodity[]> {
  try {
    // Show loading message
    console.log(`Fetching data for ${category} from TradingView...`);
    
    // Gestion spéciale pour freight
    if (category === 'freight') {
      return await fetchFreightData();
    }
    
    // Gestion spéciale pour bunker
    if (category === 'bunker') {
      return await fetchBunkerData();
    }
    
    // Pour les autres catégories, utiliser l'ancienne méthode
    const url = `https://api.api-ninjas.com/v1/webscraper?url=https://www.tradingview.com/markets/futures/quotes-${category}/`;
    
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data);
    
    // Parse the HTML retrieved to extract commodity data
    return parseCommoditiesData(data, category);
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
    toast.error(`Error fetching ${category} data`);
    throw error; // Propagate the error instead of returning empty array
  }
}

/**
 * Determines the type of commodity from symbol or name
 */
function getCommodityType(symbol: string, name: string, category: CommodityCategory): Commodity['type'] {
  const lowerSymbol = symbol.toLowerCase();
  const lowerName = name.toLowerCase();
  
  // Metals
  if (category === 'metals') {
    if (lowerSymbol.includes('au') || lowerName.includes('gold') || lowerName.includes('or')) {
      return 'gold';
    } else if (lowerSymbol.includes('ag') || lowerName.includes('silver') || lowerName.includes('argent')) {
      return 'silver';
    } else if (lowerSymbol.includes('cu') || lowerName.includes('copper') || lowerName.includes('cuivre')) {
      return 'copper';
    } else if (lowerSymbol.includes('al') || lowerName.includes('alum')) {
      return 'aluminum';
    } else if (lowerSymbol.includes('co') || lowerName.includes('cobalt')) {
      return 'cobalt';
    }
  } 
  // Agricultural
  else if (category === 'agricultural') {
    if (lowerSymbol.includes('zc') || lowerName.includes('corn') || lowerName.includes('maïs')) {
      return 'corn';
    } else if (lowerSymbol.includes('zw') || lowerName.includes('wheat') || lowerName.includes('blé')) {
      return 'wheat';
    } else if (lowerSymbol.includes('zs') || lowerName.includes('soybean') || lowerName.includes('soja')) {
      return 'soybean';
    } else if (lowerSymbol.includes('ct') || lowerName.includes('cotton') || lowerName.includes('coton')) {
      return 'cotton';
    } else if (lowerSymbol.includes('sb') || lowerName.includes('sugar') || lowerName.includes('sucre')) {
      return 'sugar';
    } else if (lowerSymbol.includes('cc') || lowerName.includes('cocoa') || lowerName.includes('cacao')) {
      return 'cocoa';
    } else if (lowerSymbol.includes('kc') || lowerName.includes('coffee') || lowerName.includes('café')) {
      return 'coffee';
    } else if (lowerSymbol.includes('le') || lowerName.includes('cattle') || lowerName.includes('bétail')) {
      return 'cattle';
    }
  } 
  // Energy
  else if (category === 'energy') {
    if (lowerSymbol.includes('cl') || lowerName.includes('crude') || lowerName.includes('oil') || lowerName.includes('pétrole')) {
      return 'crude';
    } else if (lowerSymbol.includes('rb') || lowerName.includes('gasoline') || lowerName.includes('essence')) {
      return 'gasoline';
    } else if (lowerSymbol.includes('ho') || lowerName.includes('heating oil') || lowerName.includes('fioul')) {
      return 'heating_oil';
    } else if (lowerSymbol.includes('ng') || lowerName.includes('natural gas') || lowerName.includes('gaz')) {
      return 'natural_gas';
    } else if (lowerSymbol.includes('eth') || lowerName.includes('ethanol')) {
      return 'ethanol';
    } else if (lowerSymbol.includes('mtf') || lowerName.includes('coal') || lowerName.includes('charbon')) {
      return 'coal';
    }
  }
  // Freight
  else if (category === 'freight') {
    // Container freight routes
    if (lowerSymbol.includes('cs') || lowerName.includes('container freight') || lowerName.includes('fbx')) {
      return 'container';
    }
    // LNG Freight routes
    else if (lowerSymbol.includes('bg') || lowerSymbol.includes('bl') || lowerName.includes('lng freight') || lowerName.includes('blng')) {
      return 'lng_freight';
    }
    // Dirty freight routes
    else if (lowerSymbol.includes('usc') || lowerSymbol.includes('use') || lowerSymbol.includes('xuk') || lowerName.includes('dirty freight')) {
      return 'dirty_freight';
    }
    // General freight routes (TC, TD, TM, etc.)
    else if (lowerSymbol.match(/^(tc|td|tm|th|tk|tl|aeb|t2d|t7c|tdm|frs|t5c|acb|frc|t8c|flj|flp|tf2)/)) {
      return 'freight_route';
    }
  }
  // Bunker
  else if (category === 'bunker') {
    if (lowerSymbol.includes('vlsfo') || lowerName.includes('vlsfo') || lowerName.includes('very low sulfur fuel oil')) {
      return 'vlsfo';
    } else if (lowerSymbol.includes('mgo') || lowerName.includes('mgo') || lowerName.includes('marine gas oil')) {
      return 'mgo';
    } else if (lowerSymbol.includes('ifo380') || lowerName.includes('ifo380') || lowerName.includes('intermediate fuel oil 380')) {
      return 'ifo380';
    }
  }
  
  return 'other';
}

/**
 * Parses HTML data to extract commodity information
 */
function parseCommoditiesData(data: any, category: CommodityCategory): Commodity[] {
  try {
    console.log(`Parsing data for ${category} from API response`);
    
    // Check if we have data
    if (!data || !data.data) {
      console.error("Invalid data received from API");
      throw new Error("Invalid data received from API");
    }
    
    // Parse HTML
    const htmlContent = data.data;
    console.log("HTML content length:", htmlContent.length);
    
    // Use node-html-parser to analyze HTML
    const root = parse(htmlContent);
    
    // Log the full HTML to see its structure
    console.log("HTML structure:", root.toString().substring(0, 1000));
    
    // Try different selections to find data
    // Selection 1: Data tables
    let commodityRows = root.querySelectorAll('.tv-data-table__row');
    console.log("Data table rows found:", commodityRows.length);
    
    // Selection 2: If selection 1 doesn't work, try another selection
    if (!commodityRows || commodityRows.length === 0) {
      commodityRows = root.querySelectorAll('tr[data-rowid]');
      console.log("Row data found with tr[data-rowid]:", commodityRows.length);
    }

    // Selection 3: Try a more generic selection
    if (!commodityRows || commodityRows.length === 0) {
      commodityRows = root.querySelectorAll('table tr');
      console.log("Generic table rows found:", commodityRows.length);
    }
    
    if (!commodityRows || commodityRows.length === 0) {
      console.error("No commodity rows found in HTML");
      // Log a sample of the HTML for debugging
      console.log("HTML sample:", htmlContent.substring(0, 1000));
      throw new Error("Failed to extract data");
    }
    
    const commodities: Commodity[] = [];
    
    commodityRows.forEach((row, index) => {
      try {
        console.log(`Processing row ${index}:`, row.toString().substring(0, 200));
        
        // Extract data from each cell
        const cells = row.querySelectorAll('td');
        
        if (!cells || cells.length < 6) {
          console.log(`Row ${index}: Not enough cells (${cells?.length || 0}), skipping`);
          return; // Incomplete row, skip
        }
        
        // Extract symbol and name
        const firstCell = cells[0];
        console.log(`Row ${index}, First cell:`, firstCell.toString());
        
        let symbol = '';
        let name = '';
        
        // Try to extract symbol and name with different methods
        const symbolElement = firstCell.querySelector('.symbol-name');
        if (symbolElement) {
          symbol = symbolElement.text.trim();
          name = symbolElement.getAttribute('title') || '';
        } else {
          // Another extraction method
          const allText = firstCell.text.trim();
          const parts = allText.split(/\s+/);
          symbol = parts[0] || '';
          name = parts.slice(1).join(' ');
        }
        
        if (!symbol) {
          console.log(`Row ${index}: No symbol found, skipping`);
          return;
        }
        
        // Extract other information
        console.log(`Row ${index}: Processing price from cell 1`);
        const priceText = cells[1]?.text.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        const price = parseFloat(priceText) || 0;
        
        console.log(`Row ${index}: Processing percent change from cell 2`);
        // Vérifier si la cellule contient une classe indiquant une baisse
        const percentCell = cells[2];
        const isPercentNegative = percentCell.toString().includes('negative') || 
                                 percentCell.toString().includes('down') || 
                                 percentCell.toString().includes('red');
        const percentChangeText = percentCell?.text.trim().replace(/[^-\d.,]/g, '').replace(',', '.');
        let percentChange = parseFloat(percentChangeText) || 0;
        // Afficher des informations de débogage
        console.log(`Row ${index}: Percent change raw text: "${percentChangeText}", parsed: ${percentChange}`);
        console.log(`Row ${index}: Percent cell classes: ${percentCell.toString().substring(0, 100)}`);
        console.log(`Row ${index}: Is percent negative based on class? ${isPercentNegative}`);
        
        // Si le texte n'a pas de signe négatif mais la classe indique une valeur négative
        if (isPercentNegative && percentChange > 0) {
          percentChange = -percentChange;
          console.log(`Row ${index}: Inverting percent change to ${percentChange}`);
        }
        
        console.log(`Row ${index}: Processing absolute change from cell 3`);
        // Vérifier si la cellule contient une classe indiquant une baisse
        const changeCell = cells[3];
        const isChangeNegative = changeCell.toString().includes('negative') || 
                               changeCell.toString().includes('down') || 
                               changeCell.toString().includes('red');
        const absoluteChangeText = changeCell?.text.trim().replace(/[^-\d.,]/g, '').replace(',', '.');
        let absoluteChange = parseFloat(absoluteChangeText) || 0;
        // Afficher des informations de débogage
        console.log(`Row ${index}: Absolute change raw text: "${absoluteChangeText}", parsed: ${absoluteChange}`);
        console.log(`Row ${index}: Change cell classes: ${changeCell.toString().substring(0, 100)}`);
        console.log(`Row ${index}: Is change negative based on class? ${isChangeNegative}`);
        
        // Si le texte n'a pas de signe négatif mais la classe indique une valeur négative
        if (isChangeNegative && absoluteChange > 0) {
          absoluteChange = -absoluteChange;
          console.log(`Row ${index}: Inverting absolute change to ${absoluteChange}`);
        }
        
        console.log(`Row ${index}: Processing high from cell 4`);
        const highText = cells[4]?.text.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        const high = parseFloat(highText) || 0;
        
        console.log(`Row ${index}: Processing low from cell 5`);
        const lowText = cells[5]?.text.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        const low = parseFloat(lowText) || 0;
        
        // Technical evaluation (if available)
        console.log(`Row ${index}: Processing evaluation from cell 6`);
        const technicalEvaluation = cells[6]?.text.trim() || 'Neutral';
        
        // Determine commodity type
        const type = getCommodityType(symbol, name, category);
        
        commodities.push({
          symbol,
          name,
          price,
          percentChange,
          absoluteChange,
          high,
          low,
          technicalEvaluation,
          type,
          category
        });
        
        console.log(`Successfully processed commodity: ${symbol}`);
      } catch (err) {
        console.error(`Error parsing row ${index}:`, err);
      }
    });
    
    if (commodities.length === 0) {
      console.error("No commodities could be extracted");
      throw new Error("No commodities could be extracted");
    }
    
    console.log(`Successfully extracted ${commodities.length} commodities for ${category}`);
    return commodities;
  } catch (error) {
    console.error('Error parsing data:', error);
    throw error;
  }
}

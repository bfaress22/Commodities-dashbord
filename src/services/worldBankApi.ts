import * as XLSX from 'xlsx';

export interface WorldBankCommodity {
  id: string;
  name: string;
  unit: string;
  symbol: string;
  category: string;
  data: {
    date: string;
    value: number;
  }[];
  currentValue?: number;
  change?: number;
  changePercent?: number;
}

export interface WorldBankData {
  commodities: WorldBankCommodity[];
  lastUpdated: Date;
  fileName?: string;
  isDefault?: boolean;
}

// Catégories de commodités World Bank
export const WORLD_BANK_CATEGORIES = {
  ENERGY: 'Energy',
  AGRICULTURAL: 'Agricultural',
  METALS: 'Metals',
  FERTILIZERS: 'Fertilizers',
  OTHER: 'Other'
} as const;

// Mapping des commodités vers leurs catégories
const COMMODITY_CATEGORIES: Record<string, string> = {
  // Energy
  'CRUDE_PETRO': WORLD_BANK_CATEGORIES.ENERGY,
  'CRUDE_BRENT': WORLD_BANK_CATEGORIES.ENERGY,
  'CRUDE_DUBAI': WORLD_BANK_CATEGORIES.ENERGY,
  'CRUDE_WTI': WORLD_BANK_CATEGORIES.ENERGY,
  'COAL_AUS': WORLD_BANK_CATEGORIES.ENERGY,
  'COAL_SAFRICA': WORLD_BANK_CATEGORIES.ENERGY,
  'NGAS_US': WORLD_BANK_CATEGORIES.ENERGY,
  'NGAS_EUR': WORLD_BANK_CATEGORIES.ENERGY,
  'NGAS_JP': WORLD_BANK_CATEGORIES.ENERGY,
  'iNATGAS': WORLD_BANK_CATEGORIES.ENERGY,
  
  // Agricultural
  'COCOA': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'COFFEE_ARABIC': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'COFFEE_ROBUS': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'TEA_AVG': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'TEA_COLOMBO': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'TEA_KOLKATA': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'TEA_MOMBASA': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'COCONUT_OIL': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'GRNUT': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'FISH_MEAL': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'GRNUT_OIL': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'PALM_OIL': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'PLMKRNL_OIL': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SOYBEANS': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SOYBEAN_OIL': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SOYBEAN_MEAL': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'RAPESEED_OIL': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SUNFLOWER_OIL': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'BARLEY': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'MAIZE': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SORGHUM': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'RICE_05': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'RICE_25': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'RICE_A1': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'RICE_05_VNM': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'WHEAT_US_SRW': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'WHEAT_US_HRW': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'BANANA_EU': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'BANANA_US': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'ORANGE': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'BEEF': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'CHICKEN': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'LAMB': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SHRIMP_MEX': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SUGAR_EU': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SUGAR_US': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SUGAR_WLD': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'TOBAC_US': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'LOGS_CMR': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'LOGS_MYS': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SAWNWD_CMR': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'SAWNWD_MYS': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'PLYWOOD': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'COTTON_A_INDX': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'RUBBER_TSR20': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  'RUBBER1_MYSG': WORLD_BANK_CATEGORIES.AGRICULTURAL,
  
  // Metals
  'ALUMINUM': WORLD_BANK_CATEGORIES.METALS,
  'IRON_ORE': WORLD_BANK_CATEGORIES.METALS,
  'COPPER': WORLD_BANK_CATEGORIES.METALS,
  'LEAD': WORLD_BANK_CATEGORIES.METALS,
  'Tin': WORLD_BANK_CATEGORIES.METALS,
  'NICKEL': WORLD_BANK_CATEGORIES.METALS,
  'Zinc': WORLD_BANK_CATEGORIES.METALS,
  'GOLD': WORLD_BANK_CATEGORIES.METALS,
  'PLATINUM': WORLD_BANK_CATEGORIES.METALS,
  'SILVER': WORLD_BANK_CATEGORIES.METALS,
  
  // Fertilizers
  'PHOSROCK': WORLD_BANK_CATEGORIES.FERTILIZERS,
  'DAP': WORLD_BANK_CATEGORIES.FERTILIZERS,
  'DAP_FERTILIZER': WORLD_BANK_CATEGORIES.FERTILIZERS,
  'DIAMMONIUM_PHOSPHATE': WORLD_BANK_CATEGORIES.FERTILIZERS,
  'TSP': WORLD_BANK_CATEGORIES.FERTILIZERS,
  'UREA_EE_BULK': WORLD_BANK_CATEGORIES.FERTILIZERS,
  'UREA': WORLD_BANK_CATEGORIES.FERTILIZERS,
  'POTASH': WORLD_BANK_CATEGORIES.FERTILIZERS
};

// Mapping des noms d'affichage
const COMMODITY_DISPLAY_NAMES: Record<string, string> = {
  // Energy commodities
  'CRUDE_PETRO': 'Crude oil, average',
  'CRUDE_BRENT': 'Crude oil, Brent',
  'CRUDE_DUBAI': 'Crude oil, Dubai',
  'CRUDE_WTI': 'Crude oil, WTI',
  'COAL_AUS': 'Coal, Australian',
  'COAL_SAFRICA': 'Coal, South African',
  'NGAS_US': 'Natural gas, US',
  'NGAS_EUR': 'Natural gas, Europe',
  'NGAS_JP': 'Liquefied natural gas, Japan',
  'iNATGAS': 'Natural gas index',
  
  // Agricultural - Beverages
  'COCOA': 'Cocoa',
  'COFFEE_ARABIC': 'Coffee, Arabica',
  'COFFEE_ROBUS': 'Coffee, Robusta',
  'TEA_AVG': 'Tea, avg 3 auctions',
  'TEA_COLOMBO': 'Tea, Colombo',
  'TEA_KOLKATA': 'Tea, Kolkata',
  'TEA_MOMBASA': 'Tea, Mombasa',
  
  // Agricultural - Oils
  'COCONUT_OIL': 'Coconut oil',
  'GRNUT': 'Groundnuts',
  'FISH_MEAL': 'Fish meal',
  'GRNUT_OIL': 'Groundnut oil',
  'PALM_OIL': 'Palm oil',
  'PLMKRNL_OIL': 'Palm kernel oil',
  'SOYBEANS': 'Soybeans',
  'SOYBEAN_OIL': 'Soybean oil',
  'SOYBEAN_MEAL': 'Soybean meal',
  'RAPESEED_OIL': 'Rapeseed oil',
  'SUNFLOWER_OIL': 'Sunflower oil',
  
  // Agricultural - Grains
  'BARLEY': 'Barley',
  'MAIZE': 'Maize',
  'SORGHUM': 'Sorghum',
  'RICE_05': 'Rice, Thai 5%',
  'RICE_25': 'Rice, Thai 25%',
  'RICE_A1': 'Rice, Thai A.1',
  'RICE_05_VNM': 'Rice, Viet Namese 5%',
  'WHEAT_US_SRW': 'Wheat, US SRW',
  'WHEAT_US_HRW': 'Wheat, US HRW',
  
  // Agricultural - Other foods
  'BANANA_EU': 'Banana, Europe',
  'BANANA_US': 'Banana, US',
  'ORANGE': 'Orange',
  'BEEF': 'Beef',
  'CHICKEN': 'Chicken',
  'LAMB': 'Lamb',
  'SHRIMP_MEX': 'Shrimps, Mexican',
  'SUGAR_EU': 'Sugar, EU',
  'SUGAR_US': 'Sugar, US',
  'SUGAR_WLD': 'Sugar, world',
  'TOBAC_US': 'Tobacco, US import u.v.',
  
  // Agricultural - Raw materials
  'LOGS_CMR': 'Logs, Cameroon',
  'LOGS_MYS': 'Logs, Malaysian',
  'SAWNWD_CMR': 'Sawnwood, Cameroon',
  'SAWNWD_MYS': 'Sawnwood, Malaysian',
  'PLYWOOD': 'Plywood',
  'COTTON_A_INDX': 'Cotton, A Index',
  'RUBBER_TSR20': 'Rubber, TSR20',
  'RUBBER1_MYSG': 'Rubber, RSS3',
  
  // Fertilizers
  'PHOSROCK': 'Phosphate rock',
  'DAP': 'DAP',
  'DAP_FERTILIZER': 'DAP',
  'DIAMMONIUM_PHOSPHATE': 'DAP',
  'TSP': 'TSP',
  'UREA_EE_BULK': 'Urea',
  'UREA': 'Urea',
  'POTASH': 'Potassium chloride',
  
  // Metals
  'ALUMINUM': 'Aluminum',
  'IRON_ORE': 'Iron ore, cfr spot',
  'COPPER': 'Copper',
  'LEAD': 'Lead',
  'Tin': 'Tin',
  'NICKEL': 'Nickel',
  'Zinc': 'Zinc',
  'GOLD': 'Gold',
  'PLATINUM': 'Platinum',
  'SILVER': 'Silver',
};

let cachedData: WorldBankData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction pour détecter la structure du fichier
function detectFileStructure(data: any[][]): {
  headerRows: number;
  dateColumn: number;
  dataStartRow: number;
  commodityColumns: number[];
} {
  console.log('Detecting file structure...');
  console.log('Data shape:', data.length, 'rows x', data[0]?.length || 0, 'columns');
  
  // Afficher les premières lignes pour debug
  console.log('First 15 rows:');
  data.slice(0, 15).forEach((row, index) => {
    console.log(`Row ${index}:`, row);
  });

  // Chercher la ligne qui contient les dates (format YYYYMM)
  let dateRowIndex = -1;
  let dateColumnIndex = -1;
  
  for (let row = 0; row < Math.min(20, data.length); row++) {
    const rowData = data[row] || [];
    for (let col = 0; col < rowData.length; col++) {
      const cell = rowData[col];
      if (cell && typeof cell === 'string' && /^\d{4}M\d{2}$/.test(cell)) {
        dateRowIndex = row;
        dateColumnIndex = col;
        console.log(`Found date pattern at row ${row}, column ${col}: ${cell}`);
        break;
      }
    }
    if (dateRowIndex !== -1) break;
  }
  
  if (dateRowIndex === -1) {
    // Essayer de trouver des dates dans d'autres formats
    for (let row = 0; row < Math.min(20, data.length); row++) {
      const rowData = data[row] || [];
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        if (cell && (
          (typeof cell === 'string' && /^\d{4}-\d{2}/.test(cell)) ||
          (cell instanceof Date)
        )) {
          dateRowIndex = row;
          dateColumnIndex = col;
          console.log(`Found alternative date pattern at row ${row}, column ${col}: ${cell}`);
          break;
        }
      }
      if (dateRowIndex !== -1) break;
    }
  }
  
  if (dateRowIndex === -1) {
    throw new Error('Could not find date column in the file');
  }
  
  // Identifier les colonnes de commodités - INCLURE TOUTES LES COLONNES avec un nom
  const commodityColumns: number[] = [];
  const columnDataCount: { [col: number]: number } = {};
  
  // D'abord, analyser les données numériques disponibles pour information
  const maxRowsToCheck = Math.min(50, data.length - dateRowIndex);
  for (let row = dateRowIndex; row < dateRowIndex + maxRowsToCheck; row++) {
    const rowData = data[row] || [];
    for (let col = 0; col < rowData.length; col++) {
      if (col === dateColumnIndex) continue; // Skip date column
      
      const cell = rowData[col];
      if (cell !== null && cell !== undefined && cell !== '' && 
          typeof cell === 'number' && !isNaN(cell)) {
        columnDataCount[col] = (columnDataCount[col] || 0) + 1;
      }
    }
  }
  
  // INCLURE TOUTES LES COLONNES qui ont un nom dans les en-têtes
  const maxColumns = Math.max(data[0]?.length || 0, ...data.slice(0, dateRowIndex).map(row => row?.length || 0));
  
  for (let col = 0; col < maxColumns; col++) {
    if (col === dateColumnIndex) continue; // Skip date column
    
    // Vérifier s'il y a un nom dans les lignes d'en-tête
    let hasName = false;
    for (let row = 0; row < dateRowIndex; row++) {
      const cell = data[row]?.[col];
      if (cell && typeof cell === 'string' && cell.trim().length >= 2 && 
          !cell.match(/^\d+$/) && !cell.toLowerCase().includes('unit') && 
          !cell.toLowerCase().includes('source') && !cell.includes('$') &&
          !cell.toLowerCase().includes('period')) {
        hasName = true;
        break;
      }
    }
    
    if (hasName) {
      commodityColumns.push(col);
      console.log(`Including column ${col} (has name, ${columnDataCount[col] || 0} data points)`);
    }
  }
  
  console.log(`Found ${commodityColumns.length} commodity columns:`, commodityColumns);
  console.log('Column data counts:', columnDataCount);
  
  // Déterminer le nombre de lignes d'en-tête
  const headerRows = dateRowIndex;
  const dataStartRow = dateRowIndex;
  
  return {
    headerRows,
    dateColumn: dateColumnIndex,
    dataStartRow,
    commodityColumns
  };
}

// Fonction pour extraire les informations de commodité
function extractCommodityInfo(data: any[][], structure: any): {
  names: string[];
  units: string[];
  symbols: string[];
} {
  const names: string[] = [];
  const units: string[] = [];
  const symbols: string[] = [];
  
  // Chercher les noms des commodités dans les lignes d'en-tête
  for (let colIndex of structure.commodityColumns) {
    let name = '';
    let unit = '';
    let symbol = '';
    
    // Chercher le nom dans les lignes d'en-tête (en priorité les lignes les plus proches des données)
    for (let row = Math.max(0, structure.headerRows - 3); row < structure.headerRows; row++) {
      const cell = data[row]?.[colIndex];
      if (cell && typeof cell === 'string' && cell.trim().length > 0) {
        const cellValue = cell.trim();
        
        // Identifier les unités
        if (!unit && (cellValue.includes('$') || cellValue.includes('USD') || cellValue.includes('ton') || 
                     cellValue.includes('kg') || cellValue.includes('bbl') || cellValue.includes('cents') ||
                     cellValue.includes('yen') || cellValue.includes('euro') || cellValue.includes('per'))) {
          unit = cellValue;
        }
                 // Identifier le nom principal (ligne la plus proche des données avec un nom significatif)
         // Accepter aussi les noms courts comme "DAP", "TSP" pour les fertilizers
         else if (!name && cellValue.length >= 2 && !cellValue.match(/^\d+$/) && 
                 !cellValue.toLowerCase().includes('unit') && !cellValue.toLowerCase().includes('source')) {
           name = cellValue;
         }
        // Identifier le symbole (généralement court et en majuscules)
        else if (!symbol && cellValue.length <= 15 && cellValue.match(/^[A-Z_0-9]+$/)) {
          symbol = cellValue;
        }
      }
    }
    
    // Si pas de nom trouvé, chercher dans toutes les lignes d'en-tête
    if (!name) {
      for (let row = 0; row < structure.headerRows; row++) {
        const cell = data[row]?.[colIndex];
        if (cell && typeof cell === 'string' && cell.trim().length > 2) {
          const cellValue = cell.trim();
          if (!cellValue.toLowerCase().includes('unit') && !cellValue.toLowerCase().includes('source') && 
              !cellValue.match(/^\d+$/) && !cellValue.includes('$')) {
            name = cellValue;
            break;
          }
        }
      }
    }
    
    // Si toujours pas de nom, utiliser un nom générique
    if (!name) {
      name = `Commodity_${colIndex}`;
    }
    
    // Générer un symbole basé sur le nom si pas trouvé
    if (!symbol) {
      symbol = name
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toUpperCase()
        .substring(0, 15);
    }
    
    names.push(name);
    units.push(unit);
    symbols.push(symbol);
  }
  
  console.log('Extracted commodity info:', { names, units, symbols });
  return { names, units, symbols };
}

// Fonction pour parser les données Excel
function parseExcelData(arrayBuffer: ArrayBuffer): WorldBankCommodity[] {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  // Essayer de trouver la feuille appropriée
  const sheetNames = workbook.SheetNames;
  console.log('Available sheets:', sheetNames);
  
  let targetSheet = null;
  const possibleSheetNames = [
    'Monthly Prices',
    'Monthly prices',
    'MONTHLY PRICES',
    'Prices',
    'Data',
    'Sheet1'
  ];
  
  for (const sheetName of possibleSheetNames) {
    if (sheetNames.includes(sheetName)) {
      targetSheet = workbook.Sheets[sheetName];
      console.log('Using sheet:', sheetName);
      break;
    }
  }
  
  // Si aucune feuille spécifique n'est trouvée, utiliser la première
  if (!targetSheet && sheetNames.length > 0) {
    targetSheet = workbook.Sheets[sheetNames[0]];
    console.log('Using first sheet:', sheetNames[0]);
  }
  
  if (!targetSheet) {
    throw new Error('No valid sheet found in the Excel file');
  }
  
  const data = XLSX.utils.sheet_to_json(targetSheet, { header: 1 }) as any[][];
  
  if (data.length < 2) {
    throw new Error('Invalid file format: insufficient data rows');
  }
  
  // Détecter la structure du fichier
  const structure = detectFileStructure(data);
  
  // Extraire les informations de commodité
  const { names, units, symbols } = extractCommodityInfo(data, structure);
  
  const commodities: WorldBankCommodity[] = [];
  
  // Traiter chaque colonne de commodité
  for (let i = 0; i < structure.commodityColumns.length; i++) {
    const colIndex = structure.commodityColumns[i];
    const name = names[i];
    const unit = units[i];
    const symbol = symbols[i];
    
    // Skip only if both name and symbol are empty
    if (!name && !symbol) continue;
    
    // Use name as symbol if symbol is empty, and vice versa
    const finalSymbol = symbol || name.replace(/\s+/g, '_').toUpperCase().substring(0, 20);
    const finalName = name || symbol;
    
    const category = COMMODITY_CATEGORIES[finalSymbol] || WORLD_BANK_CATEGORIES.OTHER;
    const displayName = COMMODITY_DISPLAY_NAMES[finalSymbol] || finalName;
    
    // Extraire les données de série temporelle
    const timeSeriesData: { date: string; value: number }[] = [];
    
    for (let j = structure.dataStartRow; j < data.length; j++) {
      const row = data[j];
      if (!row || row.length <= colIndex) continue;
      
      const date = row[structure.dateColumn];
      const value = row[colIndex];
      
      // Accepter les valeurs numériques valides (y compris 0) et ignorer les cellules vides/null/undefined
      if (date && value !== null && value !== undefined && value !== '' && 
          typeof value === 'number' && !isNaN(value)) {
        timeSeriesData.push({
          date: date.toString(),
          value: value
        });
      }
    }
    
    // Inclure la commodité même si elle n'a pas de données (pour afficher toutes les colonnes)
    // if (timeSeriesData.length > 0) { // Commenté pour inclure toutes les commodités
    if (true) { // Toujours inclure la commodité
      // Trouver la valeur la plus récente (non-nulle)
      const currentValue = timeSeriesData.length > 0 ? timeSeriesData[timeSeriesData.length - 1]?.value : undefined;
      
      // Trouver la valeur précédente pour calculer le changement
      let previousValue = undefined;
      if (timeSeriesData.length > 1) {
        previousValue = timeSeriesData[timeSeriesData.length - 2]?.value;
      }
      
      const change = currentValue && previousValue ? currentValue - previousValue : undefined;
      const changePercent = currentValue && previousValue ? ((change! / previousValue) * 100) : undefined;
      
      commodities.push({
        id: finalSymbol,
        name: displayName,
        unit: unit || '',
        symbol: finalSymbol,
        category,
        data: timeSeriesData,
        currentValue,
        change,
        changePercent
      });
    }
  }
  
  console.log(`Successfully parsed ${commodities.length} commodities`);
  return commodities;
}

export async function importWorldBankPinkSheet(file: File): Promise<WorldBankData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const commodities = parseExcelData(arrayBuffer);
    
    if (commodities.length === 0) {
      throw new Error('No valid commodity data found in the file. Please check if this is a valid World Bank Pink Sheet.');
    }
    
    const result: WorldBankData = {
      commodities,
      lastUpdated: new Date(),
      fileName: file.name,
      isDefault: false
    };
    
    // Cache the result
    cachedData = result;
    lastFetchTime = Date.now();
    
    return result;
    
  } catch (error) {
    console.error('Error importing World Bank Pink Sheet:', error);
    throw new Error(`Failed to import World Bank Pink Sheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchWorldBankData(): Promise<WorldBankData> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    // Load default data from public directory
    const response = await fetch('/CMO-Historical-Data-Monthly (1).xlsx');
    if (!response.ok) {
      throw new Error('Failed to fetch default World Bank data');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const commodities = parseExcelData(arrayBuffer);
    
    if (commodities.length === 0) {
      throw new Error('No valid commodity data found in default file');
    }
    
    const result: WorldBankData = {
      commodities,
      lastUpdated: new Date(),
      fileName: 'CMO-Historical-Data-Monthly (1).xlsx',
      isDefault: true
    };
    
    // Cache the result
    cachedData = result;
    lastFetchTime = now;
    
    return result;
    
  } catch (error) {
    console.error('Error fetching World Bank data:', error);
    
    // Return cached data if available, even if expired
    if (cachedData) {
      return cachedData;
    }
    
    throw new Error('Failed to fetch World Bank commodity data');
  }
}

export async function fetchWorldBankDataByCategory(category: string): Promise<WorldBankCommodity[]> {
  const data = await fetchWorldBankData();
  return data.commodities.filter(commodity => commodity.category === category);
}

export function getWorldBankCategories(): string[] {
  return Object.values(WORLD_BANK_CATEGORIES);
}

export function hasWorldBankData(): boolean {
  return cachedData !== null;
}

export function getCurrentWorldBankData(): WorldBankData | null {
  return cachedData;
}

export function clearWorldBankData(): void {
  cachedData = null;
  lastFetchTime = 0;
}

/**
 * Forces a refresh of World Bank data (ignores cache)
 */
export async function refreshWorldBankData(): Promise<WorldBankData> {
  // Clear cache and fetch fresh data
  cachedData = null;
  lastFetchTime = 0;
  return fetchWorldBankData();
} 
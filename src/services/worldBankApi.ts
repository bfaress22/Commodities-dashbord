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
  'TSP': WORLD_BANK_CATEGORIES.FERTILIZERS,
  'UREA_EE_BULK': WORLD_BANK_CATEGORIES.FERTILIZERS,
  'POTASH': WORLD_BANK_CATEGORIES.FERTILIZERS,
};

// Mapping des noms d'affichage
const COMMODITY_DISPLAY_NAMES: Record<string, string> = {
  'CRUDE_PETRO': 'Crude Oil (Average)',
  'CRUDE_BRENT': 'Crude Oil (Brent)',
  'CRUDE_DUBAI': 'Crude Oil (Dubai)',
  'CRUDE_WTI': 'Crude Oil (WTI)',
  'COAL_AUS': 'Coal (Australian)',
  'COAL_SAFRICA': 'Coal (South African)',
  'NGAS_US': 'Natural Gas (US)',
  'NGAS_EUR': 'Natural Gas (Europe)',
  'NGAS_JP': 'LNG (Japan)',
  'iNATGAS': 'Natural Gas Index',
  'COCOA': 'Cocoa',
  'COFFEE_ARABIC': 'Coffee (Arabica)',
  'COFFEE_ROBUS': 'Coffee (Robusta)',
  'TEA_AVG': 'Tea (Average)',
  'TEA_COLOMBO': 'Tea (Colombo)',
  'TEA_KOLKATA': 'Tea (Kolkata)',
  'TEA_MOMBASA': 'Tea (Mombasa)',
  'COCONUT_OIL': 'Coconut Oil',
  'GRNUT': 'Groundnuts',
  'FISH_MEAL': 'Fish Meal',
  'GRNUT_OIL': 'Groundnut Oil',
  'PALM_OIL': 'Palm Oil',
  'PLMKRNL_OIL': 'Palm Kernel Oil',
  'SOYBEANS': 'Soybeans',
  'SOYBEAN_OIL': 'Soybean Oil',
  'SOYBEAN_MEAL': 'Soybean Meal',
  'RAPESEED_OIL': 'Rapeseed Oil',
  'SUNFLOWER_OIL': 'Sunflower Oil',
  'BARLEY': 'Barley',
  'MAIZE': 'Maize',
  'SORGHUM': 'Sorghum',
  'RICE_05': 'Rice (Thai 5%)',
  'RICE_25': 'Rice (Thai 25%)',
  'RICE_A1': 'Rice (Thai A.1)',
  'RICE_05_VNM': 'Rice (Vietnamese 5%)',
  'WHEAT_US_SRW': 'Wheat (US SRW)',
  'WHEAT_US_HRW': 'Wheat (US HRW)',
  'BANANA_EU': 'Banana (Europe)',
  'BANANA_US': 'Banana (US)',
  'ORANGE': 'Orange',
  'BEEF': 'Beef',
  'CHICKEN': 'Chicken',
  'LAMB': 'Lamb',
  'SHRIMP_MEX': 'Shrimps (Mexican)',
  'SUGAR_EU': 'Sugar (EU)',
  'SUGAR_US': 'Sugar (US)',
  'SUGAR_WLD': 'Sugar (World)',
  'TOBAC_US': 'Tobacco (US)',
  'LOGS_CMR': 'Logs (Cameroon)',
  'LOGS_MYS': 'Logs (Malaysian)',
  'SAWNWD_CMR': 'Sawnwood (Cameroon)',
  'SAWNWD_MYS': 'Sawnwood (Malaysian)',
  'PLYWOOD': 'Plywood',
  'COTTON_A_INDX': 'Cotton (A Index)',
  'RUBBER_TSR20': 'Rubber (TSR20)',
  'RUBBER1_MYSG': 'Rubber (RSS3)',
  'PHOSROCK': 'Phosphate Rock',
  'DAP': 'DAP',
  'TSP': 'TSP',
  'UREA_EE_BULK': 'Urea',
  'POTASH': 'Potassium Chloride',
  'ALUMINUM': 'Aluminum',
  'IRON_ORE': 'Iron Ore',
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

// Fonction pour parser les données Excel
function parseExcelData(arrayBuffer: ArrayBuffer): WorldBankCommodity[] {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  // Look for the Monthly Prices sheet
  const sheetNames = workbook.SheetNames;
  const monthlySheetName = sheetNames.find(name => 
    name.toLowerCase().includes('monthly') && name.toLowerCase().includes('price')
  ) || 'Monthly Prices';
  
  const monthlySheet = workbook.Sheets[monthlySheetName];
  if (!monthlySheet) {
    throw new Error('Monthly Prices sheet not found in the file');
  }
  
  const data = XLSX.utils.sheet_to_json(monthlySheet, { header: 1 }) as any[][];
  
  if (data.length < 4) {
    throw new Error('Invalid file format: insufficient data rows');
  }
  
  const commodities: WorldBankCommodity[] = [];
  
  // Parse headers (row 0: names, row 1: units, row 2: symbols)
  const names = data[0] || [];
  const units = data[1] || [];
  const symbols = data[2] || [];
  
  // Process each commodity column (starting from index 1 to skip date column)
  for (let i = 1; i < names.length; i++) {
    const name = names[i];
    const unit = units[i];
    const symbol = symbols[i];
    
    if (!name || !symbol) continue;
    
    const category = COMMODITY_CATEGORIES[symbol] || WORLD_BANK_CATEGORIES.OTHER;
    const displayName = COMMODITY_DISPLAY_NAMES[symbol] || name;
    
    // Extract time series data
    const timeSeriesData: { date: string; value: number }[] = [];
    
    for (let j = 3; j < data.length; j++) {
      const row = data[j];
      if (!row || row.length <= i) continue;
      
      const date = row[0];
      const value = row[i];
      
      if (date && typeof value === 'number' && !isNaN(value)) {
        timeSeriesData.push({
          date: date.toString(),
          value: value
        });
      }
    }
    
    if (timeSeriesData.length > 0) {
      const currentValue = timeSeriesData[timeSeriesData.length - 1]?.value;
      const previousValue = timeSeriesData[timeSeriesData.length - 2]?.value;
      
      const change = currentValue && previousValue ? currentValue - previousValue : undefined;
      const changePercent = currentValue && previousValue ? ((change! / previousValue) * 100) : undefined;
      
      commodities.push({
        id: symbol,
        name: displayName,
        unit: unit || '',
        symbol: symbol,
        category,
        data: timeSeriesData,
        currentValue,
        change,
        changePercent
      });
    }
  }
  
  return commodities;
}

export async function importWorldBankPinkSheet(file: File): Promise<WorldBankData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const commodities = parseExcelData(arrayBuffer);
    
    if (commodities.length === 0) {
      throw new Error('No valid commodity data found in the file');
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
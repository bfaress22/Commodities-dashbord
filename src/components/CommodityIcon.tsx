
import { cn } from "@/lib/utils";

import { Commodity } from "@/services/api";

interface CommodityIconProps {
  type: Commodity['type'];
  className?: string;
}

export default function CommodityIcon({ type, className }: CommodityIconProps) {
  const bgColorClass = {
    // Metals - Couleurs métalliques réalistes
    'gold': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    'silver': 'bg-gradient-to-br from-gray-300 to-gray-500',
    'copper': 'bg-gradient-to-br from-orange-600 to-red-700',
    'aluminum': 'bg-gradient-to-br from-slate-400 to-slate-600',
    'cobalt': 'bg-gradient-to-br from-blue-500 to-blue-700',
    
    // Freight - Couleurs transport
    'container': 'bg-gradient-to-br from-blue-500 to-blue-700',
    'freight_route': 'bg-gradient-to-br from-emerald-500 to-emerald-700',
    'lng_freight': 'bg-gradient-to-br from-purple-500 to-purple-700',
    'dirty_freight': 'bg-gradient-to-br from-red-600 to-red-800',
    
    // Agricultural - Couleurs naturelles
    'corn': 'bg-gradient-to-br from-yellow-500 to-yellow-700',
    'wheat': 'bg-gradient-to-br from-amber-500 to-amber-700',
    'soybean': 'bg-gradient-to-br from-green-500 to-green-700',
    'cotton': 'bg-gradient-to-br from-gray-100 to-gray-300',
    'sugar': 'bg-gradient-to-br from-pink-300 to-pink-500',
    'cocoa': 'bg-gradient-to-br from-amber-700 to-amber-900',
    'coffee': 'bg-gradient-to-br from-amber-800 to-amber-950',
    'cattle': 'bg-gradient-to-br from-red-600 to-red-800',
    
    // Energy - Couleurs énergétiques
    'crude': 'bg-gradient-to-br from-gray-800 to-black',
    'gasoline': 'bg-gradient-to-br from-red-500 to-red-700',
    'heating_oil': 'bg-gradient-to-br from-orange-500 to-orange-700',
    'natural_gas': 'bg-gradient-to-br from-blue-400 to-blue-600',
    'ethanol': 'bg-gradient-to-br from-green-400 to-green-600',
    'coal': 'bg-gradient-to-br from-gray-700 to-gray-900',
    
    // Bunker - Couleurs carburants marins
    'vlsfo': 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    'mgo': 'bg-gradient-to-br from-cyan-500 to-cyan-700',
    'ifo380': 'bg-gradient-to-br from-slate-600 to-slate-800',
    
    'other': 'bg-gradient-to-br from-gray-400 to-gray-600',
  }[type] || 'bg-gradient-to-br from-gray-400 to-gray-600';

  return (
    <div className={cn(
      "w-6 h-6 rounded-full flex items-center justify-center", 
      bgColorClass,
      className
    )}>
      {/* Metals */}
      {type === 'gold' && (
        <div className="flex items-center justify-center">
          <span className="text-yellow-900 text-[10px] font-bold">Au</span>
        </div>
      )}
      {type === 'silver' && (
        <div className="flex items-center justify-center">
          <span className="text-gray-800 text-[10px] font-bold">Ag</span>
        </div>
      )}
      {type === 'copper' && (
        <div className="flex items-center justify-center">
          <span className="text-orange-900 text-[10px] font-bold">Cu</span>
        </div>
      )}
      {type === 'aluminum' && (
        <div className="flex items-center justify-center">
          <span className="text-slate-800 text-[10px] font-bold">Al</span>
        </div>
      )}
      {type === 'cobalt' && (
        <div className="flex items-center justify-center">
          <span className="text-blue-900 text-[10px] font-bold">Co</span>
        </div>
      )}
      
      {/* Freight */}
      {type === 'container' && (
        <div className="flex items-center justify-center">
          <span className="text-blue-100 text-[10px]">📦</span>
        </div>
      )}
      {type === 'freight_route' && (
        <div className="flex items-center justify-center">
          <span className="text-emerald-100 text-[10px]">🚢</span>
        </div>
      )}
      {type === 'lng_freight' && (
        <div className="flex items-center justify-center">
          <span className="text-purple-100 text-[10px]">⛽</span>
        </div>
      )}
      {type === 'dirty_freight' && (
        <div className="flex items-center justify-center">
          <span className="text-red-100 text-[10px]">🛢️</span>
        </div>
      )}
      
      {/* Agricultural */}
      {type === 'corn' && (
        <div className="flex items-center justify-center">
          <span className="text-yellow-900 text-[10px]">🌽</span>
        </div>
      )}
      {type === 'wheat' && (
        <div className="flex items-center justify-center">
          <span className="text-amber-900 text-[10px]">🌾</span>
        </div>
      )}
      {type === 'soybean' && (
        <div className="flex items-center justify-center">
          <span className="text-green-900 text-[10px]">🫘</span>
        </div>
      )}
      {type === 'cotton' && (
        <div className="flex items-center justify-center">
          <span className="text-gray-600 text-[10px]">🌸</span>
        </div>
      )}
      {type === 'sugar' && (
        <div className="flex items-center justify-center">
          <span className="text-pink-800 text-[10px]">🍯</span>
        </div>
      )}
      {type === 'cocoa' && (
        <div className="flex items-center justify-center">
          <span className="text-amber-100 text-[10px]">🍫</span>
        </div>
      )}
      {type === 'coffee' && (
        <div className="flex items-center justify-center">
          <span className="text-amber-100 text-[10px]">☕</span>
        </div>
      )}
      {type === 'cattle' && (
        <div className="flex items-center justify-center">
          <span className="text-red-100 text-[10px]">🐄</span>
        </div>
      )}
      
      {/* Energy */}
      {type === 'crude' && (
        <div className="flex items-center justify-center">
          <span className="text-gray-300 text-[10px]">🛢️</span>
        </div>
      )}
      {type === 'gasoline' && (
        <div className="flex items-center justify-center">
          <span className="text-red-100 text-[10px]">⛽</span>
        </div>
      )}
      {type === 'heating_oil' && (
        <div className="flex items-center justify-center">
          <span className="text-orange-100 text-[10px]">🔥</span>
        </div>
      )}
      {type === 'natural_gas' && (
        <div className="flex items-center justify-center">
          <span className="text-blue-100 text-[10px]">💨</span>
        </div>
      )}
      {type === 'ethanol' && (
        <div className="flex items-center justify-center">
          <span className="text-green-100 text-[10px]">🧪</span>
        </div>
      )}
      {type === 'coal' && (
        <div className="flex items-center justify-center">
          <span className="text-gray-300 text-[10px]">⚫</span>
        </div>
      )}
      
      {/* Bunker */}
      {type === 'vlsfo' && (
        <div className="flex items-center justify-center">
          <span className="text-indigo-100 text-[8px] font-bold">VLS</span>
        </div>
      )}
      {type === 'mgo' && (
        <div className="flex items-center justify-center">
          <span className="text-cyan-100 text-[9px] font-bold">MGO</span>
        </div>
      )}
      {type === 'ifo380' && (
        <div className="flex items-center justify-center">
          <span className="text-slate-100 text-[8px] font-bold">380</span>
        </div>
      )}
      
      {type === 'other' && (
        <span className="text-black text-xs font-bold">?</span>
      )}
    </div>
  );
}

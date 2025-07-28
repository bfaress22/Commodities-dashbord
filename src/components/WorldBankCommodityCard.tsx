import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorldBankCommodity } from "@/services/worldBankApi";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorldBankCommodityCardProps {
  commodity: WorldBankCommodity;
}

export default function WorldBankCommodityCard({ commodity }: WorldBankCommodityCardProps) {
  const formatValue = (value: number, unit: string) => {
    if (unit.includes('$')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    
    if (unit.includes('%')) {
      return `${value.toFixed(2)}%`;
    }
    
    return `${value.toLocaleString()} ${unit}`;
  };

  const getChangeIcon = (changePercent?: number) => {
    if (!changePercent) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (changePercent > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getChangeColor = (changePercent?: number) => {
    if (!changePercent) return "text-muted-foreground";
    if (changePercent > 0) return "text-green-600";
    return "text-red-600";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Energy':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Agricultural':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Metals':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fertilizers':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden h-full border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900">
              {commodity.name}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 mt-1">
              {commodity.symbol}
            </CardDescription>
          </div>
          <div className={cn(
            "px-2 py-1 text-xs font-medium rounded-full border",
            getCategoryColor(commodity.category)
          )}>
            {commodity.category}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Current Value */}
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <p className="text-2xl font-bold text-slate-900">
                {commodity.currentValue ? formatValue(commodity.currentValue, commodity.unit) : 'N/A'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Current Price
              </p>
            </div>
            
            {/* Change Indicator */}
            {commodity.changePercent !== undefined && (
              <div className="flex items-center gap-1">
                {getChangeIcon(commodity.changePercent)}
                <span className={cn(
                  "text-sm font-medium",
                  getChangeColor(commodity.changePercent)
                )}>
                  {commodity.changePercent > 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          
          {/* Change Value */}
          {commodity.change !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Change</span>
              <span className={cn(
                "text-sm font-medium",
                getChangeColor(commodity.changePercent)
              )}>
                {commodity.change > 0 ? '+' : ''}{formatValue(commodity.change, commodity.unit)}
              </span>
            </div>
          )}
          
          {/* Data Points */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Data Points</span>
            <span className="text-sm font-medium text-slate-900">
              {commodity.data.length.toLocaleString()}
            </span>
          </div>
          
          {/* Date Range */}
          {commodity.data.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Date Range</span>
              <span className="text-sm font-medium text-slate-900">
                {commodity.data[0]?.date} - {commodity.data[commodity.data.length - 1]?.date}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
import { cn } from "@/lib/utils";

interface PriceChangeProps {
  value: number;
  isPercentage?: boolean;
  className?: string;
}

export default function PriceChange({ value, isPercentage = false, className }: PriceChangeProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const colorClass = isPositive 
    ? 'text-trend-up' 
    : isNeutral 
      ? 'text-trend-neutral' 
      : 'text-trend-down';
      
  const formattedValue = isPercentage
    ? `${isPositive ? '+' : (value < 0 ? '-' : '')}${Math.abs(value).toFixed(2)}%`
    : `${isPositive ? '+' : (value < 0 ? '-' : '')}${Math.abs(value).toFixed(2)}`;
    
  return (
    <span className={cn(colorClass, className)}>
      {formattedValue}
    </span>
  );
}

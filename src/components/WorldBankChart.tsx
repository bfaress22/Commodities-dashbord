import { useEffect, useRef, useState } from 'react';
import { WorldBankCommodity } from '@/services/worldBankApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, BarChart3, TrendingUp, TrendingDown, Calendar, DollarSign, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorldBankChartProps {
  commodities: WorldBankCommodity[];
  loading?: boolean;
}

type ChartType = 'line' | 'area';

interface ZoomState {
  startIndex: number;
  endIndex: number;
  isZoomed: boolean;
}

export default function WorldBankChart({ commodities, loading = false }: WorldBankChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; date: string } | null>(null);
  const [zoomState, setZoomState] = useState<ZoomState>({ startIndex: 0, endIndex: 0, isZoomed: false });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const selectedCommodityData = commodities.find(c => c.id === selectedCommodity);

  useEffect(() => {
    if (commodities.length > 0 && !selectedCommodity) {
      setSelectedCommodity(commodities[0].id);
    }
  }, [commodities, selectedCommodity]);

  // Reset zoom when commodity changes
  useEffect(() => {
    setZoomState({ startIndex: 0, endIndex: 0, isZoomed: false });
  }, [selectedCommodity]);

  // Parse date string properly
  const parseDate = (dateStr: string) => {
    // Handle different date formats from World Bank data
    if (dateStr.includes('M')) {
      // Format like "1960M01" -> "1960-01-01"
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(5, 7);
      return new Date(`${year}-${month}-01`);
    }
    return new Date(dateStr);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedCommodityData || !selectedCommodityData.data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size with high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 500 * dpr;
    ctx.scale(dpr, dpr);

    // Get data points with zoom
    const data = selectedCommodityData.data;
    const startIdx = zoomState.isZoomed ? zoomState.startIndex : 0;
    const endIdx = zoomState.isZoomed ? zoomState.endIndex : data.length - 1;
    const visibleData = data.slice(startIdx, endIdx + 1);
    
    if (visibleData.length === 0) return;

    const values = visibleData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    // Calculate dimensions
    const padding = { top: 80, right: 60, bottom: 100, left: 100 };
    const chartWidth = rect.width - (padding.left + padding.right);
    const chartHeight = 500 - (padding.top + padding.bottom);

    // Create dark theme background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, rect.width, 500);

    // Create subtle grid pattern
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const gridLines = 8;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i * chartHeight / gridLines);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const verticalGridLines = 12;
    for (let i = 0; i <= verticalGridLines; i++) {
      const x = padding.left + (i * chartWidth / verticalGridLines);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Draw chart
    if (visibleData.length > 1) {
      if (chartType === 'area') {
        // Create gradient for area chart
        const areaGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        areaGradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)'); // green-500
        areaGradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
        
        ctx.fillStyle = areaGradient;
        ctx.beginPath();
        
        visibleData.forEach((point, index) => {
          const x = padding.left + (index / (visibleData.length - 1)) * chartWidth;
          const normalizedValue = valueRange === 0 ? 0.5 : (point.value - minValue) / valueRange;
          const y = padding.top + chartHeight - (normalizedValue * chartHeight);

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        // Complete the area
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.closePath();
        ctx.fill();

        // Draw line on top with glow effect
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        visibleData.forEach((point, index) => {
          const x = padding.left + (index / (visibleData.length - 1)) * chartWidth;
          const normalizedValue = valueRange === 0 ? 0.5 : (point.value - minValue) / valueRange;
          const y = padding.top + chartHeight - (normalizedValue * chartHeight);

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Line chart with gradient
        const lineGradient = ctx.createLinearGradient(0, 0, 0, 500);
        lineGradient.addColorStop(0, '#22c55e');
        lineGradient.addColorStop(1, '#3b82f6');
        
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        visibleData.forEach((point, index) => {
          const x = padding.left + (index / (visibleData.length - 1)) * chartWidth;
          const normalizedValue = valueRange === 0 ? 0.5 : (point.value - minValue) / valueRange;
          const y = padding.top + chartHeight - (normalizedValue * chartHeight);

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();
      }
    }

    // Draw labels with modern styling
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';

    // Y-axis labels
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i * chartHeight / gridLines);
      const value = maxValue - (i * valueRange / gridLines);
      const label = value.toLocaleString(undefined, { 
        maximumFractionDigits: 2,
        minimumFractionDigits: 0 
      });
      
      ctx.fillText(label, padding.left - 15, y + 4);
    }

    // X-axis labels with proper date formatting
    const labelIndices = [0, Math.floor(visibleData.length / 4), Math.floor(visibleData.length / 2), Math.floor(3 * visibleData.length / 4), visibleData.length - 1];
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    
    labelIndices.forEach(index => {
      if (visibleData[index]) {
        const x = padding.left + (index / (visibleData.length - 1)) * chartWidth;
        const date = parseDate(visibleData[index].date);
        const label = date.toLocaleDateString('en-US', { 
          year: '2-digit', 
          month: 'short' 
        });
        
        ctx.fillText(label, x, 500 - 30);
      }
    });

    // Draw title with modern styling
    ctx.fillStyle = '#f8fafc'; // slate-50
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(selectedCommodityData.name, rect.width / 2, 30);

    // Draw current value with large, prominent styling
    if (selectedCommodityData.currentValue) {
      ctx.fillStyle = '#22c55e'; // green-500
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        `${selectedCommodityData.currentValue.toLocaleString()} ${selectedCommodityData.unit}`,
        rect.width / 2,
        55
      );
    }

    // Draw price change indicator
    if (selectedCommodityData.changePercent !== undefined) {
      const changeColor = selectedCommodityData.changePercent >= 0 ? '#22c55e' : '#ef4444';
      ctx.fillStyle = changeColor;
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        `${selectedCommodityData.changePercent >= 0 ? '+' : ''}${selectedCommodityData.changePercent.toFixed(2)}%`,
        rect.width / 2,
        75
      );
    }

  }, [selectedCommodityData, chartType, zoomState]);

  // Handle mouse events for tooltip and zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedCommodityData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = { left: 100, right: 60, top: 80, bottom: 100 };
    const chartWidth = rect.width - (padding.left + padding.right);
    const chartHeight = 500 - (padding.top + padding.bottom);

    if (x >= padding.left && x <= padding.left + chartWidth && 
        y >= padding.top && y <= padding.top + chartHeight) {
      
      const data = selectedCommodityData.data;
      const startIdx = zoomState.isZoomed ? zoomState.startIndex : 0;
      const endIdx = zoomState.isZoomed ? zoomState.endIndex : data.length - 1;
      const visibleData = data.slice(startIdx, endIdx + 1);
      
      const dataIndex = Math.round(((x - padding.left) / chartWidth) * (visibleData.length - 1));
      const dataPoint = visibleData[dataIndex];
      
      if (dataPoint) {
        setHoveredPoint({
          x: e.clientX,
          y: e.clientY,
          value: dataPoint.value,
          date: dataPoint.date
        });
      }
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedCommodityData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const padding = { left: 100, right: 60 };
    const chartWidth = rect.width - (padding.left + padding.right);

    if (x >= padding.left && x <= padding.left + chartWidth) {
      setIsDragging(true);
      setDragStart(x);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Implement zoom logic here if needed
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!selectedCommodityData) return;

    e.preventDefault();
    const data = selectedCommodityData.data;
    const currentStart = zoomState.isZoomed ? zoomState.startIndex : 0;
    const currentEnd = zoomState.isZoomed ? zoomState.endIndex : data.length - 1;
    const currentRange = currentEnd - currentStart;
    
    const zoomFactor = e.deltaY > 0 ? 1.2 : 0.8;
    const newRange = Math.max(10, Math.min(currentRange * zoomFactor, data.length));
    const center = currentStart + currentRange / 2;
    const newStart = Math.max(0, Math.floor(center - newRange / 2));
    const newEnd = Math.min(data.length - 1, Math.floor(center + newRange / 2));

    setZoomState({
      startIndex: newStart,
      endIndex: newEnd,
      isZoomed: true
    });
  };

  const resetZoom = () => {
    setZoomState({ startIndex: 0, endIndex: 0, isZoomed: false });
  };

  if (loading) {
    return (
      <Card className="h-full bg-slate-900 border-slate-800">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-slate-800" />
          <Skeleton className="h-4 w-32 bg-slate-800" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full bg-slate-800" />
        </CardContent>
      </Card>
    );
  }

  if (commodities.length === 0) {
    return (
      <Card className="h-full bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">World Bank Commodity Chart</CardTitle>
          <CardDescription className="text-slate-400">No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-slate-400">
            No commodities data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-slate-900 border-slate-800 shadow-2xl">
      <CardHeader className="pb-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              World Bank Commodity Chart
            </CardTitle>
            <CardDescription className="text-sm text-slate-400">
              Professional trading-style visualization
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedCommodityData) {
                    const data = selectedCommodityData.data;
                    const currentStart = zoomState.isZoomed ? zoomState.startIndex : 0;
                    const currentEnd = zoomState.isZoomed ? zoomState.endIndex : data.length - 1;
                    const currentRange = currentEnd - currentStart;
                    const newRange = Math.max(10, currentRange * 0.8);
                    const center = currentStart + currentRange / 2;
                    const newStart = Math.max(0, Math.floor(center - newRange / 2));
                    const newEnd = Math.min(data.length - 1, Math.floor(center + newRange / 2));

                    setZoomState({
                      startIndex: newStart,
                      endIndex: newEnd,
                      isZoomed: true
                    });
                  }
                }}
                className="h-8 px-2 text-slate-300 hover:text-white hover:bg-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedCommodityData) {
                    const data = selectedCommodityData.data;
                    const currentStart = zoomState.isZoomed ? zoomState.startIndex : 0;
                    const currentEnd = zoomState.isZoomed ? zoomState.endIndex : data.length - 1;
                    const currentRange = currentEnd - currentStart;
                    const newRange = Math.min(data.length - 1, currentRange * 1.2);
                    const center = currentStart + currentRange / 2;
                    const newStart = Math.max(0, Math.floor(center - newRange / 2));
                    const newEnd = Math.min(data.length - 1, Math.floor(center + newRange / 2));

                    setZoomState({
                      startIndex: newStart,
                      endIndex: newEnd,
                      isZoomed: true
                    });
                  }
                }}
                className="h-8 px-2 text-slate-300 hover:text-white hover:bg-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetZoom}
                className="h-8 px-2 text-slate-300 hover:text-white hover:bg-slate-700"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className={cn(
                  "h-8 px-3 text-xs font-medium",
                  chartType === 'line' 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                )}
              >
                <LineChart className="h-3 w-3 mr-1" />
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className={cn(
                  "h-8 px-3 text-xs font-medium",
                  chartType === 'area' 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                )}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Area
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {/* Commodity Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Select Commodity:
          </label>
          <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
            <SelectTrigger className="w-80 bg-slate-800 border-slate-700 text-slate-100">
              <SelectValue placeholder="Choose a commodity" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {commodities.map((commodity) => (
                <SelectItem key={commodity.id} value={commodity.id} className="text-slate-100 hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <span>{commodity.name}</span>
                    <span className="text-xs text-slate-400">({commodity.symbol})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart Container */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg border border-slate-700 cursor-crosshair"
            style={{ height: '500px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
          />
          
          {/* Tooltip */}
          {hoveredPoint && (
            <div 
              className="absolute bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl pointer-events-none z-10"
              style={{
                left: hoveredPoint.x + 10,
                top: hoveredPoint.y - 60,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-200">
                  {selectedCommodityData?.name}
                </div>
                <div className="text-lg font-bold text-green-500">
                  {hoveredPoint.value.toLocaleString()} {selectedCommodityData?.unit}
                </div>
                <div className="text-xs text-slate-400">
                  {parseDate(hoveredPoint.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Chart Info Overlay */}
          {selectedCommodityData && (
            <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-600">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">Change:</span>
                  {selectedCommodityData.changePercent !== undefined ? (
                    <div className="flex items-center gap-1">
                      {selectedCommodityData.changePercent > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={cn(
                        "text-sm font-bold",
                        selectedCommodityData.changePercent > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {selectedCommodityData.changePercent > 0 ? '+' : ''}{selectedCommodityData.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">N/A</span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {selectedCommodityData.data.length.toLocaleString()} data points
                </div>
                <div className="text-xs text-slate-400">
                  {parseDate(selectedCommodityData.data[0]?.date).getFullYear()} - {parseDate(selectedCommodityData.data[selectedCommodityData.data.length - 1]?.date).getFullYear()}
                </div>
                {zoomState.isZoomed && (
                  <div className="text-xs text-slate-400">
                    Zoomed: {zoomState.startIndex + 1} - {zoomState.endIndex + 1}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
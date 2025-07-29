import { useState, useMemo } from 'react';
import { WorldBankCommodity } from '@/services/worldBankApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Download, Search, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorldBankHistoricalDataProps {
  commodities: WorldBankCommodity[];
  loading?: boolean;
}

export default function WorldBankHistoricalData({ commodities, loading = false }: WorldBankHistoricalDataProps) {
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'all' | '1year' | '5years' | '10years'>('all');

  const selectedCommodityData = commodities.find(c => c.id === selectedCommodity);

  // Parse date string properly
  const parseDate = (dateStr: string) => {
    if (dateStr.includes('M')) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(5, 7);
      return new Date(`${year}-${month}-01`);
    }
    return new Date(dateStr);
  };

  // Filter data based on date range
  const filteredHistoricalData = useMemo(() => {
    if (!selectedCommodityData) return [];

    let data = selectedCommodityData.data;
    const now = new Date();

    switch (dateRange) {
      case '1year':
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        data = data.filter(item => parseDate(item.date) >= oneYearAgo);
        break;
      case '5years':
        const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        data = data.filter(item => parseDate(item.date) >= fiveYearsAgo);
        break;
      case '10years':
        const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
        data = data.filter(item => parseDate(item.date) >= tenYearsAgo);
        break;
      default:
        break;
    }

    // Filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter(item => 
        item.date.toLowerCase().includes(searchLower) ||
        item.value.toString().includes(searchLower)
      );
    }

    // Sort by date (most recent first)
    return data.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  }, [selectedCommodityData, dateRange, searchTerm]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!filteredHistoricalData.length) return null;

    const values = filteredHistoricalData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const firstValue = filteredHistoricalData[filteredHistoricalData.length - 1]?.value;
    const lastValue = filteredHistoricalData[0]?.value;
    const totalChange = firstValue && lastValue ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    return { min, max, avg, totalChange, count: filteredHistoricalData.length };
  }, [filteredHistoricalData]);

  const exportToCSV = () => {
    if (!selectedCommodityData || !filteredHistoricalData.length) return;

    const headers = ['Date', 'Value', 'Unit'];
    const csvContent = [
      headers.join(','),
      ...filteredHistoricalData.map(row => [
        row.date,
        row.value,
        selectedCommodityData.unit
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedCommodityData.name}_historical_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (commodities.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Historical Data
          </CardTitle>
          <CardDescription>View historical price data for selected commodities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No commodities data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Historical Data
        </CardTitle>
        <CardDescription>
          View and analyze historical price data for selected commodities
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Commodity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Commodity</label>
            <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a commodity" />
              </SelectTrigger>
              <SelectContent>
                {commodities.map((commodity) => (
                  <SelectItem key={commodity.id} value={commodity.id}>
                    <div className="flex items-center gap-2">
                      <span>{commodity.name}</span>
                      <span className="text-xs text-muted-foreground">({commodity.symbol})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="5years">Last 5 Years</SelectItem>
                <SelectItem value="10years">Last 10 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by date or value..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Export Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export</label>
            <Button
              onClick={exportToCSV}
              disabled={!selectedCommodityData || !filteredHistoricalData.length}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {selectedCommodityData && statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.min.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Minimum</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {statistics.max.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Maximum</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">Average</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className={cn(
                  "text-2xl font-bold flex items-center gap-1",
                  statistics.totalChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {statistics.totalChange >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {statistics.totalChange >= 0 ? '+' : ''}{statistics.totalChange.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">Total Change</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">
                  {statistics.count.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Data Points</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Table */}
        {selectedCommodityData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedCommodityData.name} - Historical Prices
              </h3>
              <div className="text-sm text-muted-foreground">
                {filteredHistoricalData.length} records
              </div>
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      Price ({selectedCommodityData.unit})
                    </TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Change %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistoricalData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No data found for the selected filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistoricalData.map((row, index) => {
                      const prevRow = filteredHistoricalData[index + 1];
                      const change = prevRow ? row.value - prevRow.value : 0;
                      const changePercent = prevRow ? ((change / prevRow.value) * 100) : 0;
                      
                      return (
                        <TableRow key={`${row.date}-${row.value}`}>
                          <TableCell className="font-mono">
                            {parseDate(row.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {row.value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4
                            })}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-mono",
                            change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-600"
                          )}>
                            {prevRow ? (
                              <>
                                {change > 0 ? '+' : ''}{change.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 4
                                })}
                              </>
                            ) : '-'}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-mono",
                            changePercent > 0 ? "text-green-600" : changePercent < 0 ? "text-red-600" : "text-gray-600"
                          )}>
                            {prevRow ? (
                              <div className="flex items-center justify-end gap-1">
                                {changePercent > 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : changePercent < 0 ? (
                                  <TrendingDown className="h-3 w-3" />
                                ) : null}
                                {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                              </div>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a commodity to view historical data</p>
            <p className="text-sm">Choose from {commodities.length} available commodities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
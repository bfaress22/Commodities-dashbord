import { useState } from 'react';
import { WorldBankCommodity } from '@/services/worldBankApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Search, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorldBankTableProps {
  commodities: WorldBankCommodity[];
  loading?: boolean;
}

type SortField = 'name' | 'currentValue' | 'changePercent' | 'category';
type SortDirection = 'asc' | 'desc';

export default function WorldBankTable({ commodities, loading = false }: WorldBankTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedCommodities = commodities
    .filter(commodity =>
      commodity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commodity.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commodity.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle special cases for sorting
      if (sortField === 'currentValue') {
        aValue = a.currentValue || 0;
        bValue = b.currentValue || 0;
      } else if (sortField === 'changePercent') {
        aValue = a.changePercent || 0;
        bValue = b.changePercent || 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <SortAsc className="h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search commodities..."
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <div className="border rounded-lg">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading World Bank data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search commodities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchTerm('')}
          disabled={!searchTerm}
        >
          Clear
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedCommodities.length} of {commodities.length} commodities
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-semibold"
                >
                  Commodity
                  <SortIcon field="name" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('category')}
                  className="h-auto p-0 font-semibold"
                >
                  Category
                  <SortIcon field="category" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('currentValue')}
                  className="h-auto p-0 font-semibold"
                >
                  Current Price
                  <SortIcon field="currentValue" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('changePercent')}
                  className="h-auto p-0 font-semibold"
                >
                  Change
                  <SortIcon field="changePercent" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Data Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCommodities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No commodities found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCommodities.map((commodity) => (
                <TableRow key={commodity.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{commodity.name}</div>
                      <div className="text-sm text-muted-foreground">{commodity.symbol}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-medium rounded-full border",
                      getCategoryColor(commodity.category)
                    )}>
                      {commodity.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {commodity.currentValue ? formatValue(commodity.currentValue, commodity.unit) : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">{commodity.unit}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {commodity.changePercent !== undefined ? (
                      <div className="flex items-center gap-2">
                        {getChangeIcon(commodity.changePercent)}
                        <span className={cn(
                          "font-medium",
                          getChangeColor(commodity.changePercent)
                        )}>
                          {commodity.changePercent > 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                        </span>
                        {commodity.change !== undefined && (
                          <span className={cn(
                            "text-sm",
                            getChangeColor(commodity.changePercent)
                          )}>
                            ({commodity.change > 0 ? '+' : ''}{formatValue(commodity.change, commodity.unit)})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {commodity.data.length.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
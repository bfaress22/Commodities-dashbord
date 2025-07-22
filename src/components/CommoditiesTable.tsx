
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Commodity } from "@/services/api";
import CommodityIcon from "./CommodityIcon";
import PriceChange from "./PriceChange";
import TrendIndicator from "./TrendIndicator";
import FavoriteButton from "./FavoriteButton";

interface CommoditiesTableProps {
  commodities: Commodity[];
}

export default function CommoditiesTable({ commodities }: CommoditiesTableProps) {
  const isFreightCategory = commodities.length > 0 && commodities[0].category === 'freight';
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[180px]">Symbol</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
            {!isFreightCategory && <TableHead className="text-right">High</TableHead>}
            {!isFreightCategory && <TableHead className="text-right">Low</TableHead>}
            {!isFreightCategory && <TableHead className="text-right">Technical Rating</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {commodities.map((commodity) => (
            <TableRow key={commodity.symbol}>
              <TableCell className="w-[50px] text-center">
                <FavoriteButton commodity={commodity} />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <CommodityIcon type={commodity.type} />
                  <div className="flex flex-col">
                    <span className="font-medium">{commodity.symbol}</span>
                    <span className="text-xs text-muted-foreground">{commodity.name}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {commodity.category === 'freight' 
                  ? commodity.price.toLocaleString('en-US', { 
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 4 
                    })
                  : commodity.price.toLocaleString()
                }
              </TableCell>
              <TableCell className="text-right">
                <PriceChange value={commodity.absoluteChange} />
              </TableCell>
              {!isFreightCategory && (
                <TableCell className="text-right">{commodity.high.toLocaleString()}</TableCell>
              )}
              {!isFreightCategory && (
                <TableCell className="text-right">{commodity.low.toLocaleString()}</TableCell>
              )}
              {!isFreightCategory && (
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <TrendIndicator evaluation={commodity.technicalEvaluation} />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowRightIcon } from "lucide-react"
import { ITrade } from "@/lib/interfaces/ITrades"
import { INFTGONFT } from "@/lib/interfaces/NftGOv2"
import { getRarityLevel } from "@/lib/helpers"
import Avatar from "boring-avatars"


function NFTPopover({ nft }: { nft: INFTGONFT }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <img src={nft.image} alt={nft.name} className="w-8 h-8 rounded-md object-cover" onClick={(e) => e.stopPropagation()} />
      </PopoverTrigger>
      <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-bold">{nft.name}</h4>
            <img src={nft.image} alt={nft.name} className="w-full h-auto rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-semibold">Token ID:</p>
              <p>{nft.token_id}</p>
            </div>
            <div>
              <p className="font-semibold">Collection:</p>
              <p>{nft.collection?.name}</p>
            </div>
            <div>
              <p className="font-semibold">Floor Price:</p>
              <p>{nft.collection?.floor_price?.value}</p>
            </div>
            <div>
              <p className="font-semibold">Rarity:</p>
              <p>{getRarityLevel(nft.rarity?.score || 0, nft.rarity?.total || 0)}</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function UserInfo({ user, onUserClick }: { user: ITrade['tradeSenderUser'] | ITrade['tradeReciverUser'], onUserClick: (address: string) => void }) {
  return (
    <div className="flex items-center space-x-2">
      <Avatar name={user.address} variant="beam" className="h-10 w-10 cursor-pointer" onClick={(e) => {
        e.stopPropagation()
        onUserClick(user.address)
      }} />
      <div>
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.address}</p>
      </div>
    </div>
  )
}

function NFTList({ nfts }: { nfts: INFTGONFT[] }) {
  return (
    <ScrollArea className="w-full whitespace-nowrap cursor-pointer" onClick={(e) => e.stopPropagation()}>
      <div className="flex space-x-1">
        {nfts.map((nft) => (
          <NFTPopover key={nft.contract_address + nft.token_id} nft={nft} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export function NftMarketTable({ trades, onTradeClick, onUserClick }: { trades: ITrade[], onTradeClick: (trade: ITrade) => void, onUserClick: (address: string) => void }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Chain</TableHead>
          <TableHead className="w-[100px]">Status</TableHead>
          <TableHead>Sender</TableHead>
          <TableHead className="w-[30px]"></TableHead>
          <TableHead>Receiver</TableHead>
          <TableHead>Sent NFTs</TableHead>
          <TableHead>Received NFTs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((trade) => (
          <TableRow onClick={() => {
            onTradeClick(trade)
          }} key={trade.tradeId}
            className={`${trade.tradeStatus !== "open" && "bg-gray-200 dark:bg-gray-800"} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            <TableCell className="font-medium">
              ETH
            </TableCell>
            <TableCell className="font-medium">{trade.tradeStatus}</TableCell>
            <TableCell>
              <UserInfo user={trade.tradeSenderUser} onUserClick={onUserClick} />
            </TableCell>
            <TableCell>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
            </TableCell>
            <TableCell>
              <UserInfo user={trade.tradeReciverUser} onUserClick={onUserClick} />
            </TableCell>
            <TableCell>
              <NFTList nfts={trade.parsedOffer} />
            </TableCell>
            <TableCell>
              <NFTList nfts={trade.parsedConsideration} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
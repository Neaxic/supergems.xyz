import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { INFTGOCollection } from "@/lib/interfaces/NftGOv2"
import { shortenAddress } from "@/lib/helpers"
import { CopyAddress } from "./copyAddress"

interface NftCollectionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection?: INFTGOCollection
}

export function NftCollectionDrawer({ open = false, onOpenChange, collection }: NftCollectionDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[45vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <div className="flex justify-between">
              <div>

                <DrawerTitle className="text-2xl font-bold">{collection?.name}</DrawerTitle>
                <DrawerDescription>Last updated {collection?.blockchain}</DrawerDescription>

              </div>
              <div className=" text-right">
                <DrawerTitle className="text-2xl font-bold">Project Socials</DrawerTitle>
                <DrawerDescription>
                  <div className="flex gap-2">
                    {collection?.discord_url && (
                      <a href={collection?.discord_url}>Discord</a>
                    )}
                    {collection?.instagram_url && (
                      <a href={collection?.instagram_url}>Instagram</a>
                    )}
                    {collection?.official_website_url && (
                      <a href={collection?.official_website_url}>Official Website</a>
                    )}
                    {collection?.opensea_url && (
                      <a href={collection?.opensea_url}>OpenSea</a>
                    )}
                    {collection?.twitter_url && (
                      <a href={collection?.twitter_url}>Twitter</a>
                    )}
                    {collection?.telegram_url && (
                      <a href={collection?.telegram_url}>Telegram</a>
                    )}
                  </div>
                </DrawerDescription>

              </div>
            </div>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                alt="Bored Ape Yacht Club Collection"
                className="aspect-square rounded-xl object-cover"
                height="200"
                src={collection?.logo}
                width="200"
              />
              <div className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {collection?.description}
                </p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Items</p>
                    <p className="text-2xl font-bold">{collection?.total_supply || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Floor Price</p>
                    <p className="text-2xl font-bold">{collection?.floor_price?.value || 0} ETH</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Floor Price ($)</p>
                    <p className="text-2xl font-bold">{collection?.floor_price?.usd || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rarity indexed</p>
                    <p className="text-2xl font-bold">{collection?.has_rarity || "False"}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Items</p>
                    <p className="text-2xl font-bold">{collection?.contract_type || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-2xl font-bold">
                      <CopyAddress fulltext={collection?.contracts[0] || ""}>
                        {shortenAddress(collection?.contracts[0] || "") || "0x"}
                      </CopyAddress>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* <h3 className="text-lg font-semibold mt-6 mb-4">Collection Health</h3> */}
          </div>
          <DrawerFooter className="mt-8">
            <Button className="w-full" disabled>View Collections Health</Button>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer >
  )
}
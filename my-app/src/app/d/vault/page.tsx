"use client"

import { CryptoApprovalModal } from "@/components/crypto-approval-modal";
import { MissingNftSlot } from "@/components/missing-nft-slot";
import { NftGallery } from "@/components/nft-gallery";
import { NftSelectorWithPreview } from "@/components/nft-selector-with-preview";
import { NFTCard } from "@/components/NFTCard";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwitchContext } from "@/contexts/switchContext";
import { useUserContext } from "@/contexts/userContext";
import UseSwitch from "@/lib/hooks/UseSwitchHook";
import { INFTGOCollection, INFTGONFT } from "@/lib/interfaces/NftGOv2";
import { cn } from "@/lib/utils";
import { Repeat } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChainId } from "wagmi";

export default function Page() {
    const { items, itemsDonated, allowedCollections, fetchData } = useSwitchContext();
    const { userNfts, address } = useUserContext();


    const [AllowedInventory, setAllowedInventory] = useState<INFTGONFT[]>([]);
    const [selcetedItems, setSelectedItems] = useState<INFTGONFT[]>([]);

    const [shownSwappable, setShownSwappable] = useState<INFTGONFT[]>(items);
    const [swappableNfts, setSwappableNfts] = useState<INFTGONFT[]>([]);
    const [swapNfts, setSwapNfts] = useState<INFTGONFT[]>([]);

    const [tab, setTab] = useState<string>("swap");
    // const [loading, setLoading] = useState<boolean>(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const [isApprovalOpen, setIsApprovalOpen] = useState<boolean>(false);
    const [isAllApproved, setIsAllApproved] = useState<boolean>(false);
    const [depositMultiplePricing, setDepositMultiplePricing] = useState<boolean>(false);
    const [depositPricingInput, setDepositPricingInput] = useState<string>("0.0000");

    const chainId = useChainId();
    const switchHook = UseSwitch({ switchContractAddress: "0x8a901fb2dBfE727279C3738a4FF7Da61843d2853" });
    const windowRef = useRef<HTMLDivElement | null>(null);

    const handleNFTPressed = (nft: INFTGONFT) => {
        // //If chooser is true, then add to the list of selected NFTs

        //if already selected, remove it
        if (selcetedItems.find(selectedNFT => selectedNFT.name === nft.name)) {
            setSelectedItems(selcetedItems.filter(selectedNFT => selectedNFT.name !== nft.name))
        } else {
            //Sort ShownSwappable to have selected items first
            setShownSwappable([...selcetedItems, ...items])
            setSelectedItems([...selcetedItems, nft])
        }
    }

    const calculateAllowdInventory = () => {
        if (!userNfts || !allowedCollections) return [];

        setAllowedInventory(userNfts.filter((item: INFTGONFT) => allowedCollections.some((collection: INFTGOCollection) => collection.contracts[0] === item.contract_address)));
    }

    const startFetching = async () => {
        // setLoading(true);
        await fetchData();
        calculateAllowdInventory();
        // setLoading(false);
    }

    const handleTabChange = (tab: string) => {
        console.log(tab)
        setTab(tab)
        setSelectedItems([])
    }

    const handleSwapNFTSelect = (nft: INFTGONFT) => {
        //Update the swappable NFTs
        setSwappableNfts(swappableNfts.filter((item) => item.name !== nft.name))
        setSwapNfts([...swapNfts, nft])
    }


    const handleDrawerOpen = () => {
        setIsDrawerOpen(!isDrawerOpen)
        //Ensure that selectabel NFTS are only contract addresses, thats also in the selectedItems
        setSwappableNfts(userNfts ? userNfts.filter((nft: INFTGONFT) => selcetedItems.find(selectedNFT => selectedNFT.contract_address === nft.contract_address)) : [])
    }

    const handleApproveBoot = () => {
        setIsApprovalOpen(!isApprovalOpen)
    }

    const handleActionPress = async () => {
        if (selcetedItems.length < 1) return;
        if (!isAllApproved) handleApproveBoot();
        // Loading something

        switch (tab) {
            case "swap":
                if (selcetedItems.length == 1) {
                    // switchHook.submitSwitch()
                } else {
                    console.log("Swapping multiple")
                }
                console.log("Swapping")
                break;
            case "withdraw":
                if (selcetedItems.length == 1) {
                    switchHook.submitWithdrawalNFT(selcetedItems[0].contract_address, +selcetedItems[0].token_id)
                } else {
                    console.log("Swapping multiple")
                }
                console.log("Withdrawing")
                break;
            case "deposit":
                //Approve
                //await approvalHook.submitApproval("0x8a901fb2dBfE727279C3738a4FF7Da61843d2853", selcetedItems[0].contract_address, +selcetedItems[0].token_id)

                const transformedETHtoWEI = +depositPricingInput * 10 ** 18
                //Put in in a lat array, no object
                const transformedItems = selcetedItems.map((item) => ({
                    nftContract: item.contract_address as `0x${string}`,
                    tokenId: +item.token_id,
                    donorFee: transformedETHtoWEI,
                    isERC721: true
                }));

                switchHook.submitDonation(transformedItems)
                //Pop nft from userinventory
                //Pop nft from selectedItems

                break;
        }

    }

    useEffect(() => {
        if (!chainId) return;

        startFetching()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chainId]);



    return (
        <div className="relative" ref={windowRef}>
            <div className="flex sticky items-center px-4 py-2 h-full" style={{ height: "52px" }}>
                <h1 className="text-xl font-bold">Public Vault</h1>
            </div>
            <Separator />

            <div className="max-h-full mt-32 flex-col md:flex">
                <h1 className="text-8xl font-bold mb-6 text-center">VALUT</h1>
                <h1 className="text-md font-bold mb-6 text-center">NEW TYPE OF PRODUCT - ONLY TESTNET - SUPER PROTOTYPE</h1>
            </div>

            <Tabs value={tab} defaultValue="swap" className="container mx-auto px-8 mt-24" onValueChange={(e) => handleTabChange(e)} >
                <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                        <TabsList>
                            <TabsTrigger value="swap">Swap</TabsTrigger>
                            <TabsTrigger value="withdraw">Withdrawl</TabsTrigger>
                            <TabsTrigger value="deposit">Deposit</TabsTrigger>
                        </TabsList>
                        <Switch>Test</Switch>
                    </div>

                    <div>
                        <TabsList>
                            <TabsTrigger value="account">Ethereum-Sepolia</TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value="swap">
                    <NftGallery handleUpdatedSelected={selcetedItems} onPressed={(nft) => handleNFTPressed(nft as INFTGONFT)} nfts={shownSwappable || []} />
                </TabsContent>
                <TabsContent value="deposit">
                    <div className="flex-1">
                        {AllowedInventory && AllowedInventory.length > 0 && (
                            <div>
                                <p>Depositable Nfts</p>
                                <NftGallery handleUpdatedSelected={selcetedItems} onPressed={(nft) => handleNFTPressed(nft as INFTGONFT)} nfts={AllowedInventory || []} />
                            </div>
                        )}
                        {allowedCollections && allowedCollections.length > 0 && (
                            <div>
                                <p>Depositable collections</p>
                                <NftGallery nfts={allowedCollections} />
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="withdraw">
                    {itemsDonated && itemsDonated.length > 0 ? (
                        <NftGallery handleUpdatedSelected={selcetedItems} onPressed={(nft) => handleNFTPressed(nft as INFTGONFT)} nfts={itemsDonated || []} />
                    ) : (
                        <div>
                            <h1>Its pretty empty here.</h1>
                            <h1>You havent deposited anything yet</h1>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} dismissible>
                <DrawerContent className={cn("bg-muted")}>
                    <DrawerHeader>
                        <div className="flex justify-between">
                            {tab === "swap" && (
                                <div>
                                    <DrawerTitle>Preview your swap</DrawerTitle>
                                    <DrawerDescription>Swaps only allowed for same collection items - ensure all collections are there.</DrawerDescription>
                                </div>
                            )}
                            {tab === "deposit" && (
                                <div>
                                    <DrawerTitle>Preview your deposit</DrawerTitle>
                                    <DrawerDescription>Set your pricing, and confirm the items are correct.</DrawerDescription>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button className="w-28" disabled={isAllApproved} onClick={() => handleApproveBoot()}>Approve</Button>
                                <Button className="w-28" disabled={(tab === "switch" && selcetedItems.length - swapNfts.length !== 0) || (tab === "deposit" && (!isAllApproved || !depositPricingInput))} onClick={() => handleActionPress()}>Swap</Button>
                            </div>
                        </div>
                    </DrawerHeader>
                    <div className="w-full flex justify-center">
                        {tab === "swap" && (
                            <div className="flex gap-4 mt-8 justify-start items-center">
                                <div>
                                    {Array.from({ length: selcetedItems.length - swapNfts.length }).map((_, index) => (
                                        <div key={"missing-slot-" + index}>
                                            <NftSelectorWithPreview nfts={swappableNfts || []} onSelect={(item) => handleSwapNFTSelect(item)}>
                                                <MissingNftSlot />
                                            </NftSelectorWithPreview>
                                        </div>
                                    ))}
                                </div>
                                <div className={`w-64`}>
                                    {swapNfts.map((nft: INFTGONFT, index: number) => (
                                        <div key={nft.name + "i" + index}>
                                            {/* Remove nft on press */}
                                            <NFTCard nft={nft} onPress={(item) => {
                                                setSwapNfts((prev) => [...prev.filter(e => e.name !== item.name)])
                                                setSwappableNfts((prev) => [...prev, nft])
                                            }} />
                                        </div>
                                    ))}
                                </div>
                                <Repeat width={48} height={48} />
                                <div className={`w-64`}>
                                    {selcetedItems.map((nft: INFTGONFT, index: number) => (
                                        <div key={nft.name + "i" + index}>
                                            <NFTCard nft={nft} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {tab === "deposit" && (
                            <div className="w-full flex justify-between px-4">
                                <div>
                                    <DrawerTitle>Before depositing</DrawerTitle>
                                    <DrawerDescription>Please ensure that all your NFTs are correct, and you agree to deposit them.</DrawerDescription>
                                    <DrawerDescription>After deposit, you understand that somebody might swap their NFT for yours.</DrawerDescription>
                                    <DrawerDescription>Please, if you want, set a personal fee to charge on every swap - notice natually higher might get less swaps.</DrawerDescription>
                                    <DrawerDescription>We recommend setting the swap fee to 0 ETH.</DrawerDescription>
                                    <br />
                                    <Switch checked={depositMultiplePricing} onCheckedChange={(e) => setDepositMultiplePricing(e)} id="multi-mode" />
                                    <Label htmlFor="airplane-mode">Individually priced?</Label>

                                    <br />
                                    <p className="text-gray-400 text-sm">Default pricing is 0-0.001 ETH</p>
                                    <Label htmlFor="price">Price</Label>
                                    <Input disabled={depositMultiplePricing} pattern={"0[0-9.]"} value={depositPricingInput} onChange={(e) => {
                                        setDepositPricingInput(e.target.value)
                                    }} placeholder="0" className={"w-72"}></Input>
                                </div>
                                <div className="grid grid-flow-col">
                                    {selcetedItems.map((nft: INFTGONFT, index: number) => (
                                        <div key={nft.name + "i" + index} className="w-48">
                                            <NFTCard nft={nft} />
                                            {depositMultiplePricing && (
                                                <Input placeholder="Price" defaultValue={"0.0001"} type=""></Input>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DrawerFooter>
                        {/* <Button disabled>Swap</Button> */}
                        {/* <DrawerClose>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose> */}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <CryptoApprovalModal
                initialItems={selcetedItems}
                setIsOpen={() => setIsApprovalOpen(!isApprovalOpen)}
                isOpen={isApprovalOpen}
                toWhom={tab === "deposit" ? "0x8a901fb2dBfE727279C3738a4FF7Da61843d2853" : ""}
                onAllApproved={() => setIsAllApproved(true)}
            />

            {/* Bottom bar */}
            <div className={`fixed bottom-0 border-t bg-muted/40 transition-all duration-300 ease-in-out 
                    ${selcetedItems.length > 0 ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: "52px", width: windowRef?.current?.clientWidth }}>
                < div className="flex items-center justify-between px-4 py-2">
                    <h1 className="text-xl font-bold">{tab === "swap" && "Swapping" || tab === "withdraw" && "Withdrawing" || "Deposit"}</h1>
                    <div className="flex gap-4 items-center">
                        <p>{selcetedItems.length} ITEM{selcetedItems.length > 1 && "S"} SELECTED</p>
                        <Button disabled={!address} onClick={() => tab === "withdraw" && handleActionPress() || handleDrawerOpen()}>{!address ? "Login" : tab === "swap" ? "Swap" : tab === "deposit" ? "Deposit" : "Withdraw"}</Button>
                    </div>
                </div>
            </div>
        </div >
    );
}

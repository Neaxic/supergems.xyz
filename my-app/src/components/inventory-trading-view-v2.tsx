import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import TradingViewV2 from './trading-view-v2';
import { NftGallery } from './nft-gallery';
import { INFTGONFT } from '@/lib/interfaces/NftGOv2';
import Avatar from 'boring-avatars';
import { ReloadIcon } from '@radix-ui/react-icons';
import { initialSimpleUser, ISimpleUser } from '@/lib/interfaces/ITrades';


// Props interface
interface InventoryTradingViewV2Props {
    currentUser: ISimpleUser;
    youUser: ISimpleUser;
    address?: string;
    addy: string;
    userLoading: boolean;
    inventorySelected: string;
    meInventoryNft: INFTGONFT[];
    youInventoryNft: INFTGONFT[];
    meSelectedNft: INFTGONFT[];
    youSelectedNft: INFTGONFT[];
    onInventorySelect: (who: string) => void;
    onNftSelect: (nft: INFTGONFT, isMe: boolean) => void;
}

export function InventoryTradingViewV2({
    currentUser = initialSimpleUser,
    youUser = initialSimpleUser,
    address = "0x",
    addy = "0x",
    userLoading = false,
    inventorySelected = "me",
    meInventoryNft = [],
    youInventoryNft = [],
    meSelectedNft = [],
    youSelectedNft = [],
    onInventorySelect = () => { },
    onNftSelect = () => { },
}: InventoryTradingViewV2Props) {
    const parrentRef = React.useRef(null);

    return (
        <div ref={parrentRef} className="flex w-full gap-2">
            {/* Left side */}
            <div className="w-full">
                <Card className="max-h-[90vh] border-none px-0 mx-0 h-full">
                    <CardContent>
                        <Select value={inventorySelected} onValueChange={onInventorySelect}>
                            <SelectTrigger className="w-full h-full">
                                <SelectValue placeholder="Select inventory" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="me">
                                    <div className="flex items-center space-x-2">
                                        <Avatar
                                            variant="beam"
                                            name={address?.toLowerCase()}
                                            className="h-4 w-4"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-medium">
                                                {currentUser.name && "@"}
                                                {currentUser?.name || "Unregistered"}{"'s inventory"}
                                            </p>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="you" disabled={userLoading}>
                                    {userLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                            <p className="font-medium">{addy}</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Avatar
                                                variant="beam"
                                                name={youUser.address.toLowerCase()}
                                                className="h-4 w-4"
                                            />
                                            <div className="flex-grow">
                                                <p className="font-medium">
                                                    {youUser?.name && "@"}
                                                    {youUser?.name || youUser.address || addy}{"'s inventory"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <NftGallery
                            multiplyer={1}
                            fillers={16}
                            maxHeight="75vh"
                            onPressed={(nft) => onNftSelect(nft as INFTGONFT, inventorySelected === "me")}
                            nfts={inventorySelected === "me" ? meInventoryNft : youInventoryNft}
                            parrentRef={parrentRef}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Right side */}
            <div className="w-full flex flex-col gap-2">
                <TradingViewV2
                    parrentRef={parrentRef}
                    loading={false}
                    topUser={{ ...currentUser, address: address || "" }}
                    topNFTs={meSelectedNft}
                    bottomNFTs={youSelectedNft}
                    bottomUser={youUser}
                    bottomNftPressed={(nft: INFTGONFT) => onNftSelect(nft, false)}
                    topNftPressed={(nft: INFTGONFT) => onNftSelect(nft, true)}
                />
            </div>
        </div>
    );
}
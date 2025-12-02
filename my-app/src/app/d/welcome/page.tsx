"use client"
import { AnimatedFigureComponent } from "@/components/animated-figure";
import { GridBackgroundComponent } from "@/components/grid-background";
import { ScrambledTextComponent } from "@/components/scrambled-text";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Page() {
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [textIndex, setTextIndex] = useState(0);
    const texts = ["FINE ART", "PFP", "INGAME ITEMS", "COLLECTABLES"];

    useEffect(() => {
        // If it's not loading, wait for 2 seconds then set it to loading and show the next text
        const timeoutId: NodeJS.Timeout | number = setTimeout(() => {
            setIsLoading(true);
            setTextIndex((textIndex + 1) % texts.length);
        }, 3500);

        // Clean up function
        return () => {
            clearTimeout(timeoutId);
        };
    }, [isLoading, textIndex, texts.length]);

    return (
        <div className="h-full">
            <div className="relative h-2/4">
                <GridBackgroundComponent gridSize={20} gridColor={theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} backgroundColor={theme === "dark" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1"} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="mt-12">
                        <svg width="145" height="66" viewBox="0 0 145 66" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M96 1L32.3721 65H6.30233L49.6047 19.2222H1V1H96Z" fill="#3FFF8D" />
                            <path d="M49 65L112.628 1H138.698L95.3953 46.7778H144V65H49Z" fill="#3FFF8D" />
                            <path d="M96 1L32.3721 65H6.30233L49.6047 19.2222H1V1H96Z" stroke="#3FFF8D" />
                            <path d="M49 65L112.628 1H138.698L95.3953 46.7778H144V65H49Z" stroke="#3FFF8D" />
                        </svg>
                    </div>
                    {/* <span className="text-xl mt-2 text-current">EARLY ACCESS</span> */}
                    <span className="text-xl mt-2 text-current flex gap-2">TRADE <ScrambledTextComponent text={texts[textIndex]} interval={20} /></span>
                </div>
            </div>

            <div className="flex justify-center flex-col items-center px-4">
                {/* <p className="text-xl py-4 font-bold">THE FIRST TRADING ONLY COMMUNITY PLATFORM</p> */}
                <div className="w-full flex justify-center">
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="bg-card text-card-foreground rounded-lg ">
                            <AnimatedFigureComponent value={319} unit="ETH" />
                            <p className="text-center mt-2 text-muted-foreground">Accumulated portfolio wealth</p>
                        </div>
                        <div className="bg-card text-card-foreground rounded-lg ">
                            <AnimatedFigureComponent value={831} unit="Users" />
                            <p className="text-center mt-2 text-muted-foreground">Total users</p>
                        </div>

                        <div className="bg-card text-card-foreground rounded-lg ">
                            <AnimatedFigureComponent value={18} unit="Countries" />
                            <p className="text-center mt-2 text-muted-foreground">Countries</p>
                        </div>
                        <div className="bg-card text-card-foreground rounded-lg ">
                            <AnimatedFigureComponent value={1.3} decimals={1} unit="ETH" />
                            <p className="text-center mt-2 text-muted-foreground">Total Traded</p>
                        </div>
                        <div className="bg-card text-card-foreground rounded-lg">
                            <AnimatedFigureComponent value={12} unit="Trades" />
                            <p className="text-center mt-2 text-muted-foreground">Total trades</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex gap-4">
                    <div>
                        <p>In short for the new commers, while its WIP:</p>

                        <p>{"Many draw the similarities to Pokémon's when talking about NFTs, yet none of us trade like it was Pokémon cards - we aim to make trading more accessible, easier, and more interactive."}</p>
                        <p>SuperGems is a fresh way to experience trading. Available as both an app and a website, its designed to make trading more interactive and social. You can watch live trades come together, engage in collection-based trades, and never miss an opportunity thanks to a smart notification system that alerts you when a great trade is available. Plus, you can keep an eye on your wallet portfolio stats and join a lively chat forum to connect with other traders. SuperGems is where trading meets community.</p>

                        <p>{"We cater to both the gamer that has ingame items that function as NFT's, the colletabels trader, and the art trader"}</p>
                        <p>We strive to provide tools from all of the worlds into one platform</p>

                        <br />
                        <p>What is valut?</p>
                        <p>Valut allows you to deposit, and passively earn ETH on your floor NFTS - by allocating them into a pool of nfts, that are swapped freely with other users</p>
                        <p>Meaning, everytime somebody swaps your deposited NFT for theirs, you get a new NFT from the same collection + a personally set fee on top</p>

                        <br />
                        <p>Notification system</p>
                        <p>Though your settings, you can enable peoridic notifications, that can give you market / collection / wallet statistics - so you never get out of loop on your bags</p>
                        <p>Customizablity is key when it comes to notifications</p>

                        <br />
                        <p>Features</p>
                        <p>A private 1:1 trade, with either somebody you know, or found on the platform</p>
                        <p>An open-ended trade that anyone can accept, given the criteria is met.</p>
                        <p>A live private trade proposer, discuss, collaborate, and create the trade. Together.</p>
                        <p>List your items on our street, users will message or send you proposals.</p>

                        <p>Wallet evaluators</p>
                        <p>Intregrated live-chats</p>
                        <p>User driven honor system</p>
                        <p>Native currency support</p>
                        <p>Jaccard distance rarity scores</p>
                        <p>Aggregated floor prices</p>
                        <p>Device notification filters</p>
                        <p>Chat mention pings</p>
                        <p>Live trade-room chats</p>
                        <p>Trade user comments</p>
                        <p>Bookmark system</p>
                        <p>Flexible onchain proposals</p>
                    </div>

                    <div>
                        Planning board

                        <br />
                        <p>Currently in development</p>
                        <p>Brading overhaul </p>
                        <p>Moving more of closed supergems.xyz over to new overhaul, including trading mechanics, live formulator, bug fixing, portfolio token calculations, more extensive user settings</p>
                        <p>Full seaport 1.6 adaption for safer trade mechanincs + aggregator possibilities</p>
                        <p>More ENS support - interms of filters</p>
                        <p>Off-chain proposals feed implementation</p>
                        <p>Public leaderboard, with more indepth trading statistics</p>
                        <p>More extensive wallet statistics - aldready built needs overhaul (sligth premium)</p>
                        <p>A more lightweight graphing system</p>
                        <p>Discord & community building &lt;3 </p>

                        <br />
                        <p>Planned</p>
                        <p>Full mobile support</p>
                        <p>Ealy adapter loyality program </p>
                        <p>{"Algorithmically feed you intresting trades via notifications / global market 'for you'"}</p>
                        <p>Custom trading options & trading view for ENS domains</p>
                        <p>A semi-public input board, with upvote / downvote system</p>
                        <p>More chat commands</p>
                    </div>

                </div>
            </div>
        </div >
    )
}
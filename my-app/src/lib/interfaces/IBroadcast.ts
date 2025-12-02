export interface IBroadcast {
    created: Date;
    message: string;
    posterID: string; //Creator address
    posterName: string;
    experiry: Date;
    item: { name: string, address: string, tokenId: string, image: string, traits: [] };
    isBluechip: boolean;
    ENSFilters: false |
    {
        containsOnlyDigitsOrLetters: boolean,
        containsOnlyDigits: boolean,
        digitLength: number,
        length: number,
        containsEmoji: boolean,
        containsSpecialCharacters: number,
        isPalindrome: boolean,
        containsRepeatingChars: boolean,
        uniqueCharCount: number
    };
    floor: {
        floor_price_eth: number,
        floor_price_usd: number
    } | null,
    RarityFilters: false | {
        score: number,
        total: number
    };
}
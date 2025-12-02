const crypto = require('crypto');
const { tokenExsistsInDatabase } = require("./helpers");

// Helper function to remove .eth suffix if present
const removeEthSuffix = (ensName) => ensName.toLowerCase().endsWith('.eth') ? ensName.slice(0, -4) : ensName;

// Returns if the ens contains ONLY digits or letters
const checkEnsContains = (ensName) => {
    const regex = /^[0-9a-zA-Z]+$/;
    return regex.test(ensName);
}

// Returns true if ens contains only digits
const checkEnsContainsOnlyDigits = (ensName) => {
    const regex = /^[0-9]+$/;
    return regex.test(ensName);
}

// Returns digit length of the digits ens
const getEnsDigitLength = (ensName) => {
    const regex = /[0-9]/g;
    const matches = ensName.match(regex);
    return matches ? matches.length : 0;
}

// Returns length of the ens
const getEnsLength = (ensName) => {
    return ensName.length;
}

// Returns true if ens contains emojis
const checkEnsContainsEmoji = (ensName) => {
    const regex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    return regex.test(ensName);
}

// Returns true if ens contains special characters
const checkEnsContainsSpecialCharacters = (ensName) => {
    const regex = /[^a-zA-Z0-9]/;
    return regex.test(ensName);
}

// Returns true if ens is a palindrome
const checkEnsIsPalindrome = (ensName) => {
    const name = removeEthSuffix(ensName).toLowerCase();
    return name === name.split('').reverse().join('');
}

// Returns true if ens contains repeating characters
const checkEnsContainsRepeatingChars = (ensName) => {
    const regex = /(.)\1{2,}/;
    return regex.test(ensName);
}

// Returns the number of unique characters in the ens
const getEnsUniqueCharCount = (ensName) => {
    return new Set(ensName).size;
}

// Check ENS for all the conditions
const checkEns = (name) => {
    const ensName = removeEthSuffix(name);

    const filters = {
        containsOnlyDigitsOrLetters: checkEnsContains(ensName),
        containsOnlyDigits: checkEnsContainsOnlyDigits(ensName),
        digitLength: getEnsDigitLength(ensName),
        length: getEnsLength(ensName),
        containsEmoji: checkEnsContainsEmoji(ensName),
        containsSpecialCharacters: checkEnsContainsSpecialCharacters(ensName),
        isPalindrome: checkEnsIsPalindrome(ensName),
        containsRepeatingChars: checkEnsContainsRepeatingChars(ensName),
        uniqueCharCount: getEnsUniqueCharCount(ensName)
    };

    return filters;
}

const isCollectionENS = (address) => {
    //Ethereum
    const ENS = [
        "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401",
        "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
    ]

    return ENS.includes(address);
}

function shortenEnsTokenId(tokenId) {
    // Step 1: Create a SHA-256 hash of the token ID
    const hash = crypto.createHash('sha256').update(tokenId).digest('hex');

    // Step 2: Convert the hash to a BigInt
    const hashInt = BigInt(`0x${hash}`);

    // Step 3: Use a custom base conversion to create a shorter string
    const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let shortId = '';
    let remainingValue = hashInt;

    while (remainingValue > 0n) {
        const mod = Number(remainingValue % 62n);
        shortId = BASE62[mod] + shortId;
        remainingValue = remainingValue / 62n;
    }

    return shortId;
}

module.exports = {
    checkEns,
    isCollectionENS,
    shortenEnsTokenId
}
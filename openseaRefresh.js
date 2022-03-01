/**
 * This script will refresh the cache/metadata for all tokens in a collection in the specified contract in opensea.
 * 
 * Usage:
 *  - npm install node-fetch
 *  - node openseaRefresh.js > output.log
 * 
 * @param {string} contractAddress The address of the contract to refresh.
 * @param {number} maxSupply the max supply of the collection.
 * @param {number} startIndex the index to start refreshing from.
 * @param {number} threads how much processes will run in parallel.
 *
 * @author joyal-hg <https://github.com/joyal-hg>
 * @license MIT
 */
const fetch = require('node-fetch');
const contractAddress = '';
const maxSupply = 10000;
const startIndex = 1;
const threads = 4;
const chunkSize = maxSupply / threads;

const wait = (milliseconds) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), milliseconds);
    });
};

const refresh = async (start, end) => {
    for (let tokenId = start; tokenId <= end; tokenId++) {
        try {
            await fetch(`https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}/?force_update=true`);
            console.log(`refreshed ${tokenId}`);
            await wait(100); // we wait a bit to not be banned from the API
        } catch (err) {
            console.warn(`Unable to refresh cache: ${tokenId}`, err);
        }
    }
};

(async () => {
    // will create an array of promises to run in parallel of the length of the threads
    const promises = [];
    for (let i = 0; i < threads; i++) {
        const start = startIndex + i * chunkSize;
        let end = startIndex + (i + 1) * chunkSize;
        if (end > maxSupply) {
            end = maxSupply;
        }
        promises.push(Promise.resolve().then(() => refresh(start, end)));
    }
    await Promise.all(promises);
    console.log('done');
    process.exit(0);
})();
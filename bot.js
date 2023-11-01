const Web3 = require('web3');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const web3 = new Web3('YOUR_RPC_URL');

const botToken = 'TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(botToken, { polling: false });

// Your contract's ABI and address
const contractABI = require('./nft.json');
const contractAddress = 'NFT_CONTRACT_ADDRESS';

const contract = new web3.eth.Contract(contractABI, contractAddress);
const chatId = 'TG_CHAT_ID';

// Base URL for NFT collection images
const baseImageUrl = 'IPFS_IMAGES_URL_LINK';

// Function to send a message with a thumbnail
async function sendMintedNFTImage(tokenId, toAddress) {
    try {
        // Build the complete image URL
        const imageUrl = `${baseImageUrl}/${tokenId}.png`;

        // Send a thumbnail of the image and a message with a link to the full-size image
        bot.sendPhoto(chatId, imageUrl, {
            caption: `NFT Minted! Token ID: ${tokenId} of 1000\nMinter Address: ${toAddress}`,
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function checkForMintEvents() {
    try {
        const events = await contract.getPastEvents('Transfer', {
            filter: { from: '0x0000000000000000000000000000000000000000' },
            fromBlock: 'latest',
        });

        for (const event of events) {
            const tokenId = event.returnValues.tokenId;
            const toAddress = event.returnValues.to;

            // Send the minted NFT image and message
            await sendMintedNFTImage(tokenId, toAddress);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

setInterval(checkForMintEvents, 10000);
checkForMintEvents();

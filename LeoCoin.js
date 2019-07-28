"use strict";
exports.__esModule = true;
var CryptoJS = require("crypto-js");
var user2user_1 = require("./user2user");
var block = /** @class */ (function () {
    function block(index, hash, previousHash, timestamp, data) {
        this.data = data;
        this.hash = hash;
        this.previousHash = previousHash;
        this.index = index;
        this.timestamp = timestamp;
    }
    return block;
}());
exports.block = block;
var genesisBlock = new block(0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'my genesis block!!');
var blockChain = [genesisBlock];
var calculateHash = function (index, data, previousHash, timestamp) {
    return CryptoJS.SHA256(index + data + previousHash + timestamp).toString();
};
var generateNewBlock = function (blockData) {
    var previousBlock = getPreviousBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = calculateHash(nextIndex, blockData, previousBlock.hash, nextTimestamp);
    var nextPreviousHash = previousBlock.hash;
    var newBlock = new block(nextIndex, nextHash, nextPreviousHash, nextTimestamp, blockData);
    return newBlock;
};
exports.generateNewBlock = generateNewBlock;
var getPreviousBlock = function () { return blockChain[blockChain.length - 1]; };
exports.getPreviousBlock = getPreviousBlock;
var isValidNewBlock = function (previousBlock, newBlock) {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('the index is invalid');
        return false;
    }
    if (previousBlock.hash !== newBlock.previousHash) {
        console.log('the previous and new hash are invalid');
        return false;
    }
    if (calculateHashForBlock(newBlock) !== newBlock.previousHash) {
        console.log('the calculated hash: ' + calculateHashForBlock(newBlock) + ' is different from ' + newBlock.hash);
        return false;
    }
    return true;
};
var isValidBlockStructure = function (block) {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'string';
};
exports.isValidBlockStructure = isValidBlockStructure;
var isValidChain = function (blockChainToCheck) {
    var isValidGenesis = function (blockTocheck) {
        return JSON.stringify(blockTocheck) === JSON.stringify(genesisBlock);
    };
    if (!isValidGenesis(blockChainToCheck[0])) {
        return false;
    }
    for (var i = 1; i < blockChainToCheck.length; i++) {
        if (!isValidNewBlock(blockChainToCheck[i], blockChainToCheck[i - 1])) {
            return false;
        }
    }
    return true;
};
var calculateHashForBlock = function (block) {
    return calculateHash(block.index, block.data, block.previousHash, block.timestamp);
};
var replaceChain = function (newBlocks) {
    if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockChain = newBlocks;
        user2user_1.broadcastLatest();
    }
    else {
        console.log('Received blockchain invalid');
    }
};
exports.replaceChain = replaceChain;
var getBlockchain = function () { return blockChain; };
exports.getBlockchain = getBlockchain;
//
var addBlockToChain = function (block) {
    if (isValidBlockStructure(block) && isValidNewBlock(block, getPreviousBlock())) {
        blockChain.push(block);
        return true;
    }
};
exports.addBlockToChain = addBlockToChain;
